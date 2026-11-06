import { ABIS, ABI_HINT, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, clamp, disposer, downloadLink, formatSize, h, icon, loop } from "../kit.js";
import { gallery } from "../gallery.js";

const TAU = Math.PI * 2;
const ORDER = ["ui", "java", "python", "node", "quickjs", "media3", "ijk"];
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/\\|";
const COLOR = { ui: "#ffb547", runtime: "#00f0ff", player: "#ff2e63", host: "#ffffff" };

/** Scramble text into place. Returns a cancel function. */
function decode(el, text, { duration = 900, reduced = false } = {}) {
  if (reduced) { el.textContent = text; return () => {}; }
  const start = performance.now();
  let frame = 0;
  const chars = [...text];
  const tick = (now) => {
    const t = clamp((now - start) / duration, 0, 1);
    const settled = Math.floor(t * chars.length);
    el.textContent = chars.map((ch, i) => {
      if (i < settled || ch === " " || /[，。、：；]/.test(ch)) return ch;
      return GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }).join("");
    if (t < 1) frame = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

function since(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const hours = ms / 3600000;
  if (hours < 1) return `${Math.max(1, Math.round(ms / 60000))} 分钟前`;
  if (hours < 48) return `${Math.round(hours)} 小时前`;
  return `${Math.round(hours / 24)} 天前`;
}

export default {
  mount(root, ctx) {
    const d = disposer();
    const reduced = ctx.reducedMotion;
    const host = ctx.host;
    const release = ctx.release;
    const fine = matchMedia("(pointer: fine)").matches;

    /* ---------------- markup ---------------- */
    const hex = h("canvas", { class: "ho-hex", "aria-hidden": "true" });
    const hostAnchor = (cls, ...children) => (host
      ? downloadLink(host, { class: cls }, ...children)
      : h("a", { class: `${cls} is-pending`, href: "#ho-modules", "aria-disabled": "true" }, ...children));

    const clock = h("span", { class: "ho-clock" });
    const nav = h("header", { class: "ho-nav" },
      h("a", { class: "ho-brand", href: "#ho-top" },
        h("img", { src: "./assets/koreplay-app.png", alt: "", width: "22", height: "22" }),
        h("span", null, "KOREPLAY"),
        h("i", { "aria-hidden": "true" }, "//"),
        h("small", null, "移动端控制台")),
      h("nav", { "aria-label": "主导航" },
        h("a", { href: "#ho-modules" }, "模块"),
        h("a", { href: "#ho-sequence" }, "部署"),
        h("a", { href: "#ho-security" }, "安全"),
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码")),
      clock);

    const title = h("h1", { class: "ho-title" }, "");
    const radarCanvas = h("canvas", { class: "ho-radar-canvas", role: "img", "aria-label": "插件雷达：本体位于中心，七个插件按类别分布，离中心越远安装包越大" });
    const radarTip = h("div", { class: "ho-tip", "aria-hidden": "true" });
    const radar = h("div", { class: "ho-radar" },
      h("span", { class: "ho-corner is-tl", "aria-hidden": "true" }), h("span", { class: "ho-corner is-tr", "aria-hidden": "true" }),
      h("span", { class: "ho-corner is-bl", "aria-hidden": "true" }), h("span", { class: "ho-corner is-br", "aria-hidden": "true" }),
      radarCanvas, radarTip,
      h("p", { class: "ho-radar-label" }, "扫描范围：当前架构的全部插件"),
      h("ul", { class: "ho-legend" },
        h("li", { style: { "--c": COLOR.ui } }, "界面"),
        h("li", { style: { "--c": COLOR.runtime } }, "运行时"),
        h("li", { style: { "--c": COLOR.player } }, "播放器")));

    const tele = {};
    const teleRow = (key, label) => {
      tele[key] = h("dd", null, "—");
      return h("div", null, h("dt", null, label), tele[key]);
    };
    const telemetry = h("dl", { class: "ho-tele", "aria-label": "实时数据" },
      teleRow("release", "版本"),
      teleRow("age", "发布"),
      teleRow("abi", "架构"),
      teleRow("payload", "插件总量"),
      teleRow("fps", "渲染"),
      teleRow("scroll", "进度"));

    const hero = h("section", { class: "ho-hero", id: "ho-top", "aria-labelledby": "ho-title-id" },
      h("div", { class: "ho-hero-copy" },
        h("p", { class: "ho-tag" }, h("span", { class: "ho-blink", "aria-hidden": "true" }), "系统在线 · ", release ? release.tag : "离线"),
        Object.assign(title, { id: "ho-title-id" }),
        h("p", { class: "ho-lead" }, "Koreplay 是 Android 手机和平板上的媒体客户端。本体精简，界面、运行时和播放器都是独立模块，按需加载，各自升级。"),
        h("div", { class: "ho-actions" },
          hostAnchor("ho-btn", h("span", { class: "ho-btn-fill", "aria-hidden": "true" }), icon("download"), h("span", null, "下载本体")),
          h("a", { class: "ho-btn is-ghost", href: "#ho-modules" }, h("span", { class: "ho-btn-fill", "aria-hidden": "true" }), h("span", null, "检视模块"))),
        h("p", { class: "ho-meta" }, host ? `APK ${formatSize(host.size)} · v${host.version} · ARM64 / ARM32 通用` : "版本清单暂不可用"),
        telemetry),
      radar);

    /* modules */
    const abiButtons = Object.entries(ABIS).map(([abi, info]) => h("button", {
      type: "button", role: "radio", "data-abi": abi, onclick: () => ctx.setAbi(abi),
    }, h("b", null, info.short), h("span", null, info.bits)));
    const syncAbi = () => abiButtons.forEach((b) => {
      const on = b.dataset.abi === ctx.abi;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const abiGroup = h("div", { class: "ho-abi", role: "radiogroup", "aria-label": "设备架构" }, abiButtons);
    d.on(abiGroup, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = abiButtons.find((b) => b.dataset.abi !== ctx.abi);
      ctx.setAbi(next.dataset.abi);
      next.focus();
    });

    const deck = h("div", { class: "ho-deck" });
    const sectionHead = (id, code, text, sub) => {
      const heading = h("h2", { id, "data-decode": text }, text);
      return h("header", { class: "ho-head" },
        h("p", { class: "ho-code" }, code),
        heading,
        sub && h("p", { class: "ho-sub" }, sub));
    };

    const modules = h("section", { class: "ho-section", id: "ho-modules", "aria-labelledby": "ho-modules-title" },
      h("div", { class: "ho-head-row" },
        sectionHead("ho-modules-title", "01 / 模块", "模块清单", "插件按处理器架构分包。选好架构，下面就是适合你设备的安装包。"),
        h("div", { class: "ho-abi-wrap" }, abiGroup, h("p", null, ABI_HINT))),
      deck);

    const sequence = h("section", { class: "ho-section", id: "ho-sequence", "aria-labelledby": "ho-seq-title" },
      sectionHead("ho-seq-title", "02 / 部署", "部署序列", "第一次安装时按顺序执行。以后本体和插件可以分别更新。"),
      h("ol", { class: "ho-seq" }, STEPS.map((step, i) => h("li", { style: { "--i": i } },
        h("span", { class: "ho-seq-no" }, `0${i + 1}`),
        h("span", { class: "ho-seq-bar", "aria-hidden": "true" }, h("i")),
        h("h3", null, step.title),
        h("p", null, step.text)))));

    const security = h("section", { class: "ho-section", id: "ho-security", "aria-labelledby": "ho-sec-title" },
      sectionHead("ho-sec-title", "03 / 安全", "访问与校验"),
      h("div", { class: "ho-sec-grid" },
        h("article", { class: "ho-panel" },
          h("h3", null, "下载需要授权"),
          h("p", null, AUTH_NOTE),
          h("a", { class: "ho-link", href: LINKS.login, target: "_blank", rel: "noreferrer" }, "登录 GitHub", icon("arrow"))),
        h("article", { class: "ho-panel" },
          h("h3", null, "核对文件完整性"),
          h("p", null, "每个模块都附带 SHA-256，点击即可复制。下载后计算哈希值，与本页或校验文件一致即说明文件完整。正式插件还会在安装时校验签名与接口兼容性。"),
          h("a", { class: "ho-link", href: ctx.checksums, download: "SHA256SUMS" }, "下载 SHA256SUMS", icon("download")))));

    const footer = h("footer", { class: "ho-footer" },
      h("p", null, DISCLAIMER),
      h("nav", { "aria-label": "页脚" },
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码"),
        h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0"),
        h("a", { href: LINKS.upstream, target: "_blank", rel: "noreferrer" }, "上游 TVBoxOS")));

    const scan = h("div", { class: "ho-scanline", "aria-hidden": "true" });
    root.append(hex, scan, nav, h("main", null, hero, gallery({ id: "ho-screens", layout: "stage", variant: "holo", title: "界面采样", itemLabel: (s, i) => `S-${String(i + 1).padStart(2, "0")}  ${s.label}` }), modules, sequence, security), footer);

    /* ---------------- module deck ---------------- */
    const card = (pkg, meta, kind, index) => {
      const isHost = kind === "host";
      const label = isHost ? "本体" : kind === "ui" ? "界面 · 必需" : kind === "player" ? "播放器" : "运行时";
      return h("article", { class: `ho-card${isHost ? " is-host" : ""}`, "data-kind": kind, id: `ho-card-${pkg.id}`, style: { "--c": COLOR[kind] || COLOR.runtime } },
        h("div", { class: "ho-card-inner" },
          h("span", { class: "ho-corner is-tl", "aria-hidden": "true" }), h("span", { class: "ho-corner is-br", "aria-hidden": "true" }),
          h("div", { class: "ho-card-head" },
            h("span", { class: "ho-card-id" }, `M-${String(index).padStart(2, "0")}`),
            h("span", { class: "ho-card-kind" }, label)),
          h("h3", null, meta.name),
          h("p", { class: "ho-card-desc" }, meta.desc),
          h("div", { class: "ho-card-bar", "aria-hidden": "true" }, h("i", { style: { "--w": `${Math.max(4, (pkg.size / Math.max(...ctx.allPackages.map((p) => p.size))) * 100).toFixed(1)}%` } })),
          h("dl", { class: "ho-card-meta" },
            h("div", null, h("dt", null, "版本"), h("dd", null, `v${pkg.version}`)),
            h("div", null, h("dt", null, "大小"), h("dd", null, formatSize(pkg.size))),
            h("div", null, h("dt", null, "架构"), h("dd", null, isHost ? "通用" : ABIS[pkg.abi].short))),
          h("div", { class: "ho-card-foot" },
            h("button", { class: "ho-hash", type: "button", title: pkg.sha256, onclick: () => ctx.copy(pkg.sha256, "已复制 SHA-256") }, icon("copy"), h("span", null, `${pkg.sha256.slice(0, 6)}…${pkg.sha256.slice(-4)}`)),
            downloadLink(pkg, { class: "ho-get", "aria-label": `下载 ${meta.name}` }, icon("download"), h("span", null, "下载")))));
    };

    const renderDeck = () => {
      syncAbi();
      if (!ctx.manifest) {
        deck.replaceChildren(h("p", { class: "ho-error" }, `${ctx.error}。请稍后刷新页面。`));
        return;
      }
      const nodes = [card(ctx.host, { name: "Koreplay 本体", desc: "通用 APK，ARM64 和 ARM32 都适用。只有本体时以文件管理模式启动。" }, "host", 0)];
      let i = 1;
      for (const group of GROUPS) {
        for (const pkg of ctx.plugins().filter((p) => (PLUGINS[p.id]?.kind || "runtime") === group.kind)) {
          nodes.push(card(pkg, PLUGINS[pkg.id], PLUGINS[pkg.id].kind, i++));
        }
      }
      deck.replaceChildren(...nodes);
    };

    /* 3D tilt on cards */
    if (fine && !reduced) {
      d.on(deck, "pointermove", (event) => {
        const el = event.target.closest(".ho-card");
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (event.clientX - r.left) / r.width;
        const py = (event.clientY - r.top) / r.height;
        el.style.setProperty("--rx", `${((0.5 - py) * 10).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${((px - 0.5) * 12).toFixed(2)}deg`);
        el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
      });
      d.on(deck, "pointerout", (event) => {
        const el = event.target.closest(".ho-card");
        if (el && !el.contains(event.relatedTarget)) {
          el.style.setProperty("--rx", "0deg");
          el.style.setProperty("--ry", "0deg");
        }
      });
    }

    /* ---------------- radar ---------------- */
    const rc = radarCanvas.getContext("2d");
    let RW = 0;
    let RH = 0;
    let rdpr = 1;
    const blips = [];
    const buildBlips = () => {
      blips.length = 0;
      const plugins = ctx.plugins();
      if (!plugins.length) return;
      const sizes = plugins.map((p) => p.size);
      const lo = Math.log(Math.min(...sizes));
      const hi = Math.log(Math.max(...sizes));
      const sectors = { ui: [-0.5, 0.5], runtime: [0.9, 3.3], player: [3.8, 5.3] };
      const byKind = { ui: [], runtime: [], player: [] };
      for (const id of ORDER) {
        const pkg = plugins.find((p) => p.id === id);
        if (pkg) byKind[PLUGINS[id].kind].push(pkg);
      }
      for (const [kind, list] of Object.entries(byKind)) {
        const [a0, a1] = sectors[kind];
        list.forEach((pkg, i) => {
          const a = list.length === 1 ? (a0 + a1) / 2 : a0 + ((a1 - a0) * i) / (list.length - 1);
          const r = 0.3 + 0.62 * ((Math.log(pkg.size) - lo) / Math.max(0.001, hi - lo));
          blips.push({ id: pkg.id, a: ((a % TAU) + TAU) % TAU, r, kind, pkg, glow: 0, x: 0, y: 0 });
        });
      }
    };
    const sizeRadar = () => {
      const rect = radarCanvas.getBoundingClientRect();
      RW = rect.width;
      RH = rect.height;
      rdpr = Math.min(window.devicePixelRatio || 1, 2);
      radarCanvas.width = Math.round(RW * rdpr);
      radarCanvas.height = Math.round(RH * rdpr);
    };
    let sweep = -Math.PI / 2;
    let hoverBlip = null;
    const drawRadar = (dt) => {
      if (!RW) return;
      const cx = RW / 2;
      const cy = RH / 2;
      const R = Math.min(RW, RH) / 2 - 10;
      rc.setTransform(rdpr, 0, 0, rdpr, 0, 0);
      rc.clearRect(0, 0, RW, RH);

      // Rings and spokes.
      rc.strokeStyle = "rgba(0, 240, 255, .16)";
      rc.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        rc.beginPath();
        rc.arc(cx, cy, (R * k) / 4, 0, TAU);
        rc.stroke();
      }
      rc.setLineDash([2, 6]);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * TAU;
        rc.beginPath();
        rc.moveTo(cx + Math.cos(a) * R * 0.12, cy + Math.sin(a) * R * 0.12);
        rc.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        rc.stroke();
      }
      rc.setLineDash([]);
      // Ticks on the outer ring.
      for (let k = 0; k < 72; k++) {
        const a = (k / 72) * TAU;
        const len = k % 6 === 0 ? 8 : 3;
        rc.beginPath();
        rc.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        rc.lineTo(cx + Math.cos(a) * (R - len), cy + Math.sin(a) * (R - len));
        rc.stroke();
      }

      // Sweep wedge.
      if (!reduced) sweep = (sweep + dt * 1.15) % TAU;
      const grad = rc.createConicGradient ? rc.createConicGradient(sweep - 1.1, cx, cy) : null;
      if (grad) {
        grad.addColorStop(0, "rgba(0, 240, 255, 0)");
        grad.addColorStop(0.175, "rgba(0, 240, 255, .22)");
        grad.addColorStop(0.176, "rgba(0, 240, 255, 0)");
        rc.fillStyle = grad;
        rc.beginPath();
        rc.moveTo(cx, cy);
        rc.arc(cx, cy, R, 0, TAU);
        rc.fill();
      }
      rc.strokeStyle = "rgba(0, 240, 255, .9)";
      rc.lineWidth = 1.5;
      rc.beginPath();
      rc.moveTo(cx, cy);
      rc.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      rc.stroke();

      // Blips.
      for (const b of blips) {
        const delta = ((sweep - b.a) % TAU + TAU) % TAU;
        if (delta < 0.08) b.glow = 1;
        b.glow = Math.max(reduced ? 0.8 : 0.18, b.glow - dt * 0.45);
        if (b === hoverBlip) b.glow = 1;
        b.x = cx + Math.cos(b.a) * b.r * R;
        b.y = cy + Math.sin(b.a) * b.r * R;
        const color = COLOR[b.kind];
        rc.save();
        rc.globalAlpha = b.glow;
        rc.shadowColor = color;
        rc.shadowBlur = 16 * b.glow;
        rc.fillStyle = color;
        rc.beginPath();
        rc.arc(b.x, b.y, 4 + b.glow * 2, 0, TAU);
        rc.fill();
        rc.restore();
        if (b.glow > 0.5) {
          rc.save();
          rc.globalAlpha = (b.glow - 0.5) * 1.6;
          rc.strokeStyle = color;
          rc.lineWidth = 1;
          rc.beginPath();
          rc.arc(b.x, b.y, 10 + (1 - b.glow) * 26, 0, TAU);
          rc.stroke();
          rc.restore();
        }
        rc.save();
        rc.globalAlpha = 0.35 + b.glow * 0.65;
        rc.fillStyle = "#cfefff";
        rc.font = `600 12px ${getComputedStyle(root).getPropertyValue("--mono") || "monospace"}`;
        rc.textAlign = b.x < cx ? "right" : "left";
        rc.textBaseline = "middle";
        const label = PLUGINS[b.id].en === "Interface" ? "UI" : PLUGINS[b.id].en;
        rc.fillText(label, b.x + (b.x < cx ? -12 : 12), b.y);
        rc.restore();
      }

      // Core.
      rc.save();
      rc.shadowColor = "#00f0ff";
      rc.shadowBlur = 24;
      rc.fillStyle = "#e9fdff";
      rc.beginPath();
      rc.arc(cx, cy, 6, 0, TAU);
      rc.fill();
      rc.restore();
      rc.strokeStyle = "rgba(233, 253, 255, .5)";
      rc.beginPath();
      rc.arc(cx, cy, R * 0.12, 0, TAU);
      rc.stroke();
    };

    const radarPoint = (event) => {
      const rect = radarCanvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const blipAt = (p) => blips.find((b) => Math.hypot(b.x - p.x, b.y - p.y) < 18) || null;
    d.on(radarCanvas, "pointermove", (event) => {
      const p = radarPoint(event);
      const b = blipAt(p);
      hoverBlip = b;
      radarCanvas.style.cursor = b ? "pointer" : "";
      if (!b) { radarTip.classList.remove("is-on"); return; }
      const meta = PLUGINS[b.id];
      radarTip.replaceChildren(h("b", null, meta.name), h("span", null, `v${b.pkg.version} · ${formatSize(b.pkg.size)}`), h("small", null, "点击定位到模块"));
      radarTip.style.setProperty("--tx", `${b.x}px`);
      radarTip.style.setProperty("--ty", `${b.y}px`);
      radarTip.classList.add("is-on");
    });
    d.on(radarCanvas, "pointerleave", () => { hoverBlip = null; radarTip.classList.remove("is-on"); });
    d.on(radarCanvas, "click", (event) => {
      const b = blipAt(radarPoint(event));
      if (!b) return;
      const target = document.getElementById(`ho-card-${b.id}`);
      if (!target) return;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      target.classList.remove("is-ping");
      void target.offsetWidth;
      target.classList.add("is-ping");
    });

    /* ---------------- hex field ---------------- */
    const hc = hex.getContext("2d");
    let HW = 0;
    let HH = 0;
    let hdpr = 1;
    const cursor = { x: -999, y: -999, tx: -999, ty: -999 };
    const pulses = [];
    const sizeHex = () => {
      hdpr = Math.min(window.devicePixelRatio || 1, 2);
      HW = innerWidth;
      HH = innerHeight;
      hex.width = Math.round(HW * hdpr);
      hex.height = Math.round(HH * hdpr);
    };
    const HEX = 26;
    const drawHex = (time) => {
      hc.setTransform(hdpr, 0, 0, hdpr, 0, 0);
      hc.clearRect(0, 0, HW, HH);
      cursor.x += (cursor.tx - cursor.x) * 0.15;
      cursor.y += (cursor.ty - cursor.y) * 0.15;
      const w = HEX * Math.sqrt(3);
      const vh = HEX * 1.5;
      const offset = (window.scrollY * 0.3) % (vh * 2);
      for (let row = -1; row * vh < HH + vh; row++) {
        const y = row * vh - offset;
        for (let col = -1; col * w < HW + w; col++) {
          const x = col * w + (row % 2 ? w / 2 : 0);
          const dist = Math.hypot(x - cursor.x, y - cursor.y);
          let a = 0.05 + Math.max(0, 1 - dist / 220) * 0.55;
          for (const p of pulses) {
            const pd = Math.abs(Math.hypot(x - p.x, y - p.y) - p.r);
            if (pd < 30) a += (1 - pd / 30) * p.life * 0.7;
          }
          if (a < 0.06) {
            hc.globalAlpha = a;
          } else {
            hc.globalAlpha = Math.min(1, a);
          }
          hc.strokeStyle = "#00f0ff";
          hc.lineWidth = 1;
          hc.beginPath();
          for (let k = 0; k < 6; k++) {
            const ang = (Math.PI / 3) * k + Math.PI / 6;
            const px = x + Math.cos(ang) * (HEX - 2);
            const py = y + Math.sin(ang) * (HEX - 2);
            if (k) hc.lineTo(px, py);
            else hc.moveTo(px, py);
          }
          hc.closePath();
          hc.stroke();
        }
      }
      hc.globalAlpha = 1;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 9;
        p.life -= 0.016;
        if (p.life <= 0) pulses.splice(i, 1);
      }
    };
    if (fine) {
      d.on(window, "pointermove", (event) => { cursor.tx = event.clientX; cursor.ty = event.clientY; }, { passive: true });
      d.on(document, "pointerleave", () => { cursor.tx = -999; cursor.ty = -999; });
    }
    d.on(window, "pointerdown", (event) => {
      if (!reduced) pulses.push({ x: event.clientX, y: event.clientY, r: 0, life: 1 });
    });

    /* ---------------- telemetry ---------------- */
    let fps = 60;
    const updateTele = () => {
      tele.release.textContent = release ? release.tag : "离线";
      tele.age.textContent = release ? since(release.publishedAt) : "—";
      tele.abi.textContent = ABIS[ctx.abi].short;
      const total = ctx.plugins().reduce((sum, p) => sum + p.size, 0);
      tele.payload.textContent = ctx.manifest ? `${formatSize(total)} / ${ctx.plugins().length} 个` : "—";
      const max = document.documentElement.scrollHeight - innerHeight;
      tele.scroll.textContent = `${Math.round(clamp(window.scrollY / Math.max(1, max), 0, 1) * 100)}%`;
    };

    /* ---------------- decode-on-view ---------------- */
    const cancels = [];
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        io.unobserve(el);
        el.classList.add("is-in");
        if (el.dataset.decode) cancels.push(decode(el, el.dataset.decode, { reduced }));
      }
    }, { threshold: 0.3 });
    root.querySelectorAll("[data-decode], .ho-seq li, .ho-panel").forEach((el) => io.observe(el));
    d.add(() => { io.disconnect(); cancels.forEach((c) => c()); });

    /* ---------------- boot ---------------- */
    renderDeck();
    buildBlips();
    updateTele();
    d.add(ctx.onAbi(() => { renderDeck(); buildBlips(); updateTele(); }));

    requestAnimationFrame(() => { sizeRadar(); sizeHex(); drawRadar(0); drawHex(0); });
    const ro = new ResizeObserver(() => { sizeRadar(); drawRadar(0); });
    ro.observe(radarCanvas);
    d.add(() => ro.disconnect());
    d.on(window, "resize", () => { sizeHex(); drawHex(0); });

    cancels.push(decode(title, "模块化的媒体客户端", { duration: 1200, reduced }));

    const tickClock = () => { clock.textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false }); };
    tickClock();
    const clockTimer = setInterval(() => { tickClock(); updateTele(); tele.fps.textContent = `${Math.round(fps)} FPS`; }, 500);
    d.add(() => clearInterval(clockTimer));

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
    d.on(window, "scroll", onScroll, { passive: true });
    onScroll();

    if (reduced) {
      root.classList.add("ho-reduced");
      tele.fps.textContent = "静态";
    } else {
      const frames = loop((time, dt) => {
        if (dt > 0) fps += (1 / dt - fps) * 0.05;
        drawRadar(dt);
        drawHex(time);
      });
      frames.start();
      d.on(document, "visibilitychange", () => (document.hidden ? frames.stop() : frames.start()));
      d.add(() => frames.stop());
    }

    return () => d.run();
  },
};
