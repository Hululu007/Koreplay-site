import { ABIS, formatDate, h, icon } from "./themes/kit.js";

const THEMES = [
  { id: "studio", name: "工作室", desc: "明亮克制的默认风格", scheme: "light", swatch: ["#f3f4f6", "#0f1626", "#f39a1e"] },
  { id: "nebula", name: "星云", desc: "WebGL 流体星云，可拖动的 3D 星轨", scheme: "dark", swatch: ["#07081a", "#8b7dff", "#ffb347"] },
  { id: "terminal", name: "终端", desc: "真正能输入命令的终端", scheme: "dark", swatch: ["#040a06", "#39ff88", "#ffb000"] },
  { id: "cinema", name: "影院", desc: "滚动即放映，胶片、场记板与片尾字幕", scheme: "dark", swatch: ["#0d0b09", "#ece4d4", "#d4372c"] },
  { id: "blueprint", name: "蓝图", desc: "工程总装图，数据沿线路流动", scheme: "dark", swatch: ["#0c3a8a", "#e8f0ff", "#ffd166"] },
  { id: "kinetic", name: "装配台", desc: "拖动插件圆片装进手机，面积即大小", scheme: "light", swatch: ["#eeeeea", "#121212", "#ff4d00"] },
  { id: "quantum", name: "量子", desc: "九千粒子随滚动重组成四种形态", scheme: "dark", swatch: ["#02030a", "#5ce1ff", "#c86bff"] },
  { id: "holo", name: "全息", desc: "雷达扫描、解码文字与实时遥测", scheme: "dark", swatch: ["#030b10", "#00f0ff", "#ff2e63"] },
];

const THEME_KEY = "koreplay.theme";
const ABI_KEY = "koreplay.abi";
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");

const store = {
  get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* storage unavailable */ } },
};

const app = document.getElementById("app");
const savedAbi = store.get(ABI_KEY);
const state = {
  manifest: null,
  error: "",
  abi: savedAbi in ABIS ? savedAbi : "arm64-v8a",
  theme: null,
  cleanup: null,
  switching: false,
};
const abiListeners = new Set();
const themeCache = new Map();

const manifestReady = fetch("./data/latest.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error(`读取版本清单失败（HTTP ${response.status}）`);
    return response.json();
  })
  .then((data) => {
    if (!data.packages?.some((pkg) => pkg.id === "host")) throw new Error("版本清单缺少本体安装包");
    state.manifest = data;
    document.title = `Koreplay ${data.hostVersion} | Android 媒体客户端`;
  })
  .catch((error) => { state.error = error.message || "暂时无法读取版本清单"; });

/* ---------- toast ---------- */

let toastNode;
let toastTimer;
function toast(message) {
  if (!toastNode) {
    toastNode = h("div", { class: "core-toast", role: "status" });
    document.body.append(toastNode);
  }
  toastNode.textContent = message;
  toastNode.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastNode.classList.remove("is-visible"), 1800);
}

async function copy(text, message = "已复制") {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
    return true;
  } catch (_) {
    toast("无法访问剪贴板，请手动选择复制");
    return false;
  }
}

/* ---------- context handed to themes ---------- */

const ctx = {
  get manifest() { return state.manifest; },
  get error() { return state.error; },
  get host() { return state.manifest?.packages.find((pkg) => pkg.id === "host") || null; },
  plugins(abi = state.abi) {
    return state.manifest ? state.manifest.packages.filter((pkg) => pkg.id !== "host" && pkg.abi === abi) : [];
  },
  get allPackages() { return state.manifest?.packages || []; },
  get release() {
    const m = state.manifest;
    if (!m) return null;
    return { tag: m.releaseTag, name: m.releaseName, date: formatDate(m.publishedAt), publishedAt: m.publishedAt, hostVersion: m.hostVersion, hostApi: m.hostApi };
  },
  get checksums() { return state.manifest?.checksums || "./data/SHA256SUMS"; },
  get abi() { return state.abi; },
  setAbi(abi) {
    if (!(abi in ABIS) || abi === state.abi) return;
    state.abi = abi;
    store.set(ABI_KEY, abi);
    for (const listener of [...abiListeners]) listener(abi);
  },
  onAbi(listener) {
    abiListeners.add(listener);
    return () => abiListeners.delete(listener);
  },
  get reducedMotion() { return motionQuery.matches; },
  themes: THEMES,
  get theme() { return state.theme; },
  setTheme(id, origin) { return switchTheme(id, origin); },
  toast,
  copy,
};

/* ---------- theme loading ---------- */

function loadCss(href) {
  if (document.querySelector(`link[data-theme-css="${href}"]`)) return Promise.resolve();
  return new Promise((resolve) => {
    const link = h("link", { rel: "stylesheet", href, "data-theme-css": href });
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", resolve, { once: true });
    document.head.append(link);
  });
}

function loadTheme(id) {
  if (!themeCache.has(id)) {
    const base = `./themes/${id}/`;
    const pending = Promise.all([import(`${base}index.js`), loadCss(`${base}style.css`)])
      .then(([module]) => module.default)
      .catch((error) => {
        themeCache.delete(id);
        throw error;
      });
    themeCache.set(id, pending);
  }
  return themeCache.get(id);
}

function mount(id, theme) {
  if (state.cleanup) {
    try { state.cleanup(); } catch (error) { console.error(error); }
  }
  state.cleanup = null;
  abiListeners.clear();

  const meta = THEMES.find((item) => item.id === id);
  const html = document.documentElement;
  html.dataset.theme = id;
  html.dataset.scheme = meta.scheme;
  html.style.background = meta.swatch[0];
  html.style.removeProperty("--dock-lift");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", meta.swatch[0]);

  app.className = `theme-root t-${id}`;
  app.removeAttribute("aria-busy");
  app.replaceChildren();
  state.theme = id;

  const cleanup = theme.mount(app, ctx);
  state.cleanup = typeof cleanup === "function" ? cleanup : null;
  syncDock();
}

async function switchTheme(id, origin) {
  if (state.switching || id === state.theme || !THEMES.some((item) => item.id === id)) return;
  state.switching = true;
  closePanel(false);
  try {
    const theme = await loadTheme(id);
    store.set(THEME_KEY, id);
    const url = new URL(location.href);
    url.searchParams.set("theme", id);
    history.replaceState(null, "", url);

    let swapped = false;
    const swap = () => {
      if (swapped) return;
      swapped = true;
      mount(id, theme);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    if (!document.startViewTransition || ctx.reducedMotion || document.hidden) {
      swap();
      return;
    }
    const x = origin?.x ?? window.innerWidth - 44;
    const y = origin?.y ?? window.innerHeight - 44;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(swap);
    // If the page stops rendering mid-transition (backgrounded window), finish the swap anyway.
    const guard = setTimeout(() => { transition.skipTransition(); swap(); }, 1500);
    try {
      await transition.updateCallbackDone;
      await transition.ready;
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 760, easing: "cubic-bezier(.76, 0, .18, 1)", pseudoElement: "::view-transition-new(root)" },
      );
      await transition.finished;
    } catch (_) {
      swap();
    } finally {
      clearTimeout(guard);
    }
  } catch (error) {
    console.error(error);
    toast("主题加载失败，请检查网络后重试");
  } finally {
    state.switching = false;
  }
}

/* ---------- theme switcher dock ---------- */

const toggle = h("button", {
  class: "core-dock-toggle",
  type: "button",
  "aria-expanded": "false",
  "aria-controls": "core-theme-panel",
  title: "切换主题",
}, icon("palette", "core-dock-icon"), h("span", { class: "core-dock-label" }, "主题"));

const options = THEMES.map((theme) => h("button", {
  class: "core-theme-option",
  type: "button",
  "data-theme-id": theme.id,
  "aria-pressed": "false",
  onclick: (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fromKeyboard = event.detail === 0;
    switchTheme(theme.id, fromKeyboard
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: event.clientX, y: event.clientY });
  },
},
h("span", { class: "core-theme-swatch", style: { "--a": theme.swatch[0], "--b": theme.swatch[1], "--c": theme.swatch[2] }, "aria-hidden": "true" }),
h("span", { class: "core-theme-text" },
  h("b", null, theme.name),
  h("small", null, theme.desc)),
icon("check", "core-theme-check")));

const panel = h("div", { class: "core-theme-panel", id: "core-theme-panel", role: "dialog", "aria-label": "选择主题", hidden: true },
  h("div", { class: "core-theme-head" },
    h("p", null, "选择主题"),
    h("span", null, `${THEMES.length} 套`)),
  h("div", { class: "core-theme-list" }, options),
  h("p", { class: "core-theme-hint" }, "主题只改变外观，下载内容完全相同。也可以在网址后加 ?theme= 直接分享某套主题。"));

const dock = h("div", { class: "core-dock" }, panel, toggle);

function syncDock() {
  for (const option of options) {
    const active = option.dataset.themeId === state.theme;
    option.setAttribute("aria-pressed", String(active));
    option.classList.toggle("is-active", active);
  }
}

function openPanel() {
  panel.hidden = false;
  toggle.setAttribute("aria-expanded", "true");
  dock.classList.add("is-open");
  dock.classList.remove("is-hinting");
  (options.find((option) => option.classList.contains("is-active")) || options[0]).focus({ preventScroll: true });
}

function closePanel(restoreFocus = true) {
  if (panel.hidden) return;
  panel.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  dock.classList.remove("is-open");
  if (restoreFocus) toggle.focus({ preventScroll: true });
}

toggle.addEventListener("click", () => (panel.hidden ? openPanel() : closePanel()));
document.addEventListener("pointerdown", (event) => {
  if (!panel.hidden && !dock.contains(event.target)) closePanel(false);
});
dock.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.stopPropagation();
    closePanel();
    return;
  }
  if (panel.hidden || !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
  const index = options.indexOf(document.activeElement);
  if (index < 0) return;
  event.preventDefault();
  const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
  options[(index + step + options.length) % options.length].focus();
});

/* ---------- boot ---------- */

function initialTheme() {
  const requested = new URLSearchParams(location.search).get("theme");
  if (THEMES.some((theme) => theme.id === requested)) return requested;
  const saved = store.get(THEME_KEY);
  return THEMES.some((theme) => theme.id === saved) ? saved : "studio";
}

async function boot() {
  const first = initialTheme();
  let theme;
  let id = first;
  try {
    [theme] = await Promise.all([loadTheme(first), manifestReady]);
  } catch (error) {
    console.error(error);
    id = "studio";
    [theme] = await Promise.all([loadTheme(id), manifestReady]);
  }
  mount(id, theme);
  document.body.append(dock);
  if (!store.get(THEME_KEY)) {
    dock.classList.add("is-hinting");
    setTimeout(() => dock.classList.remove("is-hinting"), 6000);
  }
  // Warm the cache for the other themes once the page is idle.
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
  idle(() => THEMES.forEach((item) => item.id !== id && loadTheme(item.id).catch(() => {})));
}

boot();
