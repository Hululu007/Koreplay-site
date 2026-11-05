// Shared data definitions and DOM helpers used by the core and every theme.

export const LINKS = {
  repo: "https://github.com/ingriddaleusag-dotcom/Koreplay",
  license: "https://github.com/ingriddaleusag-dotcom/Koreplay/blob/main/LICENSE",
  upstream: "https://github.com/q215613905/TVBoxOS",
  login: "https://github.com/login",
};

export const PLUGINS = {
  ui: { name: "界面", en: "Interface", mark: "UI", kind: "ui", desc: "移动端主界面。只有本体时应用以文件管理模式启动，装上它才进入常规界面。" },
  java: { name: "Java 运行时", en: "Java", mark: "Jv", kind: "runtime", desc: "运行 JAR 爬虫等依赖 Java 环境的接口扩展。" },
  python: { name: "Python 运行时", en: "Python", mark: "Py", kind: "runtime", desc: "运行 Python 编写的站源。" },
  node: { name: "Node.js 运行时", en: "Node.js", mark: "Js", kind: "runtime", desc: "提供移动端 Node.js 接口的运行服务。" },
  quickjs: { name: "QuickJS 运行时", en: "QuickJS", mark: "Qj", kind: "runtime", desc: "运行 QuickJS 脚本类接口扩展。" },
  media3: { name: "Media3 播放器", en: "Media3", mark: "M3", kind: "player", desc: "基于 Media3（ExoPlayer）的播放组件，兼容性好。" },
  ijk: { name: "IJK 播放器", en: "IJK", mark: "IJ", kind: "player", desc: "基于 IjkPlayer 的播放组件，适合部分特殊格式。" },
};

export const GROUPS = [
  { kind: "ui", title: "界面", note: "必需" },
  { kind: "runtime", title: "运行时", note: "按接口类型选择" },
  { kind: "player", title: "播放器", note: "至少安装一个" },
];

export const ABIS = {
  "arm64-v8a": { short: "ARM64", bits: "64 位" },
  "armeabi-v7a": { short: "ARM32", bits: "32 位" },
};

export const ABI_HINT = "近几年的手机和平板大多是 ARM64。不确定时，可在系统设置的“关于手机”里查看处理器信息。";

export const STEPS = [
  { title: "安装本体", text: "下载通用 APK 并安装。只有本体时，应用会以轻量的文件管理界面启动。" },
  { title: "安装界面插件", text: "在插件管理中安装界面插件，之后即可进入常规主界面。" },
  { title: "添加运行时和播放器", text: "按设备架构安装需要的插件。常见接口需要 Java 和 QuickJS，播放器至少装一个。" },
  { title: "配置你的接口", text: "在“设置 → 接口配置”添加你自己的配置地址，选择站源后开始浏览。" },
];

export const DISCLAIMER = "Koreplay 只提供客户端软件，不提供、托管或分发任何影视内容或接口。内容与接口由用户自行配置，请只接入你有权访问的服务。";

export const AUTH_NOTE = "安装包托管在私有 GitHub Release。请先用有 Koreplay 仓库访问权限的 GitHub 账号登录，再点击下载。没有权限时，GitHub 会显示 404 页面。";

export function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function applyProps(node, props) {
  if (!props) return;
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") node.setAttribute("class", value);
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value; // static markup only, never manifest data
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key === "style" && typeof value === "object") {
      for (const [name, style] of Object.entries(value)) node.style.setProperty(name.startsWith("--") ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), style);
    } else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value === true) node.setAttribute(key, "");
    else node.setAttribute(key, value);
  }
}

function appendChildren(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
}

/** Create an HTML element. Text children are always inserted as text nodes. */
export function h(tag, props, ...children) {
  const node = document.createElement(tag);
  applyProps(node, props);
  appendChildren(node, children);
  return node;
}

/** Create an SVG element. */
export function s(tag, props, ...children) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  applyProps(node, props);
  appendChildren(node, children);
  return node;
}

const ICONS = {
  download: '<path d="M10 3v10m0 0-4-4m4 4 4-4M4 16h12"/>',
  copy: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>',
  check: '<path d="m4 10.5 4 4 8-9"/>',
  arrow: '<path d="M4 10h12m-5-5 5 5-5 5"/>',
  play: '<path d="M6 4.5v11l9-5.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M6.5 4.5v11M13.5 4.5v11"/>',
  close: '<path d="m5 5 10 10M15 5 5 15"/>',
  palette: '<path d="M10 3a7 7 0 1 0 0 14c1.1 0 1.6-.8 1.3-1.7-.4-1.1.3-2.3 1.5-2.3H15a2 2 0 0 0 2-2A7 7 0 0 0 10 3Z"/><circle cx="6.5" cy="9" r=".9" fill="currentColor"/><circle cx="9" cy="6.3" r=".9" fill="currentColor"/><circle cx="12.6" cy="7" r=".9" fill="currentColor"/>',
  github: '<path d="M10 2.5a7.5 7.5 0 0 0-2.4 14.6c.4.1.5-.2.5-.4v-1.4c-2.1.5-2.5-1-2.5-1-.3-.9-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.8 2.2.6.1-.5.3-.8.5-1-1.7-.2-3.4-.8-3.4-3.7 0-.8.3-1.5.8-2-.1-.2-.3-1 .1-2 0 0 .6-.2 2.1.8a7 7 0 0 1 3.8 0c1.4-1 2.1-.8 2.1-.8.4 1 .2 1.8.1 2 .5.5.8 1.2.8 2 0 2.9-1.8 3.5-3.4 3.7.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A7.5 7.5 0 0 0 10 2.5Z" fill="currentColor" stroke="none"/>',
};

export function icon(name, className = "icon") {
  const svg = s("svg", {
    class: className,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.8",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
  });
  svg.innerHTML = ICONS[name] || "";
  return svg;
}

/** Anchor that downloads a manifest package. */
export function downloadLink(pkg, props, ...children) {
  const link = h("a", props, ...children);
  link.href = pkg.url;
  link.download = pkg.file;
  return link;
}

/** requestAnimationFrame loop; callback receives elapsed seconds and frame delta. */
export function loop(callback) {
  let frame = 0;
  let start = 0;
  let last = 0;
  const tick = (now) => {
    if (!start) start = last = now;
    callback((now - start) / 1000, Math.min((now - last) / 1000, 0.1));
    last = now;
    frame = requestAnimationFrame(tick);
  };
  return {
    start() { if (!frame) frame = requestAnimationFrame(tick); },
    stop() { cancelAnimationFrame(frame); frame = 0; start = 0; },
  };
}

/** Collect cleanup functions and run them together. */
export function disposer() {
  const tasks = [];
  return {
    add(task) { tasks.push(task); return task; },
    on(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      tasks.push(() => target.removeEventListener(type, handler, options));
    },
    run() { while (tasks.length) { try { tasks.pop()(); } catch (_) { /* keep disposing */ } } },
  };
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const lerp = (a, b, t) => a + (b - a) * t;
