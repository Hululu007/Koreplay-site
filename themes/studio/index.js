import { ABIS, ABI_HINT, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, disposer, downloadLink, formatSize, h, icon, s } from "../kit.js";
import { gallery } from "../gallery.js";

const ORBIT = [
  { id: "ui", x: 50, y: 12, label: "必需", cls: "is-ui" },
  { id: "java", x: 83, y: 27, label: "运行时" },
  { id: "python", x: 89, y: 62, label: "运行时" },
  { id: "node", x: 68, y: 88, label: "运行时" },
  { id: "quickjs", x: 32, y: 88, label: "运行时" },
  { id: "media3", x: 11, y: 62, label: "播放器", cls: "is-player" },
  { id: "ijk", x: 17, y: 27, label: "播放器", cls: "is-player" },
];

function hashButton(ctx, pkg) {
  return h("button", {
    class: "st-hash",
    type: "button",
    title: "点击复制 SHA-256",
    "aria-label": `复制 ${pkg.file} 的 SHA-256`,
    onclick: () => ctx.copy(pkg.sha256, "已复制 SHA-256"),
  }, `SHA-256 ${pkg.sha256}`);
}

function hostCard(ctx, host) {
  return h("article", { class: "st-host" },
    h("img", { src: "./assets/koreplay-app.png", alt: "" }),
    h("div", null,
      h("h3", null, "Koreplay 本体"),
      h("p", null, `v${host.version} · ${formatSize(host.size)} · 通用 APK，ARM64 和 ARM32 都适用`)),
    downloadLink(host, { class: "st-btn st-btn-lg st-btn-primary" }, icon("download", "st-btn-icon"), h("span", null, "下载 APK")),
    hashButton(ctx, host));
}

function pluginCard(ctx, pkg) {
  const meta = PLUGINS[pkg.id] || { name: pkg.id, mark: pkg.id.slice(0, 2).toUpperCase(), kind: "runtime", desc: "独立安装的插件。" };
  return h("article", { class: "st-pkg", "data-kind": meta.kind },
    h("div", { class: "st-pkg-top" },
      h("span", { class: "st-pkg-mark" }, meta.mark),
      h("div", null,
        h("h3", null, meta.name),
        h("span", { class: "st-pkg-version" }, `v${pkg.version} · ${ABIS[pkg.abi].short}`)),
      meta.kind === "ui" && h("span", { class: "st-pkg-tag" }, "必需")),
    h("p", { class: "st-pkg-desc" }, meta.desc),
    h("div", { class: "st-pkg-foot" },
      h("span", { class: "st-pkg-size" }, formatSize(pkg.size)),
      downloadLink(pkg, { class: "st-pkg-download", "aria-label": `下载 ${meta.name}（${ABIS[pkg.abi].short}）` },
        icon("download"), h("span", null, "下载"))),
    hashButton(ctx, pkg));
}

function renderCatalog(ctx, catalog) {
  if (!ctx.manifest) {
    catalog.replaceChildren(h("div", { class: "st-state is-error" }, `${ctx.error}。请稍后刷新页面重试。`));
    return;
  }
  const plugins = ctx.plugins();
  const nodes = [hostCard(ctx, ctx.host)];
  for (const group of GROUPS) {
    const members = plugins.filter((pkg) => (PLUGINS[pkg.id]?.kind || "runtime") === group.kind);
    if (!members.length) continue;
    nodes.push(h("h3", { class: "st-group" }, group.title, h("span", null, group.note)), ...members.map((pkg) => pluginCard(ctx, pkg)));
  }
  catalog.replaceChildren(...nodes);
}

export default {
  mount(root, ctx) {
    const d = disposer();
    const host = ctx.host;
    const release = ctx.release;

    const hostLinkProps = (cls) => (host ? { class: cls } : { class: `${cls} is-pending`, href: "#st-components", "aria-disabled": "true" });
    const hostAnchor = (cls, ...children) => (host ? downloadLink(host, hostLinkProps(cls), ...children) : h("a", hostLinkProps(cls), ...children));

    const nav = h("header", { class: "st-nav" },
      h("div", { class: "st-nav-inner" },
        h("a", { class: "st-brand", href: "#st-top", "aria-label": "Koreplay 首页" },
          h("img", { src: "./assets/koreplay-app.png", alt: "", width: "28", height: "28" }),
          h("span", null, "Koreplay")),
        h("nav", { class: "st-nav-links", "aria-label": "主导航" },
          h("a", { href: "#st-screens" }, "界面"),
          h("a", { href: "#st-components" }, "组件"),
          h("a", { href: "#st-install" }, "安装"),
          h("a", { href: "#st-verify" }, "校验"),
          h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "GitHub")),
        hostAnchor("st-btn st-btn-sm st-btn-primary", "下载")));

    const badgeText = release ? (release.date ? `${release.tag} · ${release.date}发布` : release.tag) : "版本清单暂不可用";

    const hero = h("section", { class: "st-hero", id: "st-top", "aria-labelledby": "st-hero-title" },
      h("div", null,
        h("p", { class: `st-badge ${release ? "is-live" : "is-error"}` },
          h("span", { class: "st-badge-dot", "aria-hidden": "true" }),
          h("span", null, badgeText)),
        h("h1", { id: "st-hero-title" }, "一个本体，", h("br"), "按需装配。"),
        h("p", { class: "st-lead" }, "Koreplay 是 Android 手机和平板上的媒体客户端。本体保持精简，界面、运行时和播放器都是独立插件，只装你需要的，各自更新。"),
        h("div", { class: "st-actions" },
          hostAnchor("st-btn st-btn-lg st-btn-primary", icon("download", "st-btn-icon"), h("span", null, "下载 Android 本体")),
          h("a", { class: "st-btn st-btn-lg st-btn-quiet", href: "#st-components" }, "选择插件")),
        h("p", { class: "st-hero-meta" }, host
          ? `v${host.version} · ${formatSize(host.size)} · 通用安装包，同时支持 ARM64 和 ARM32`
          : "暂时无法读取下载地址")),
      h("div", { class: "st-stage", "aria-hidden": "true" },
        s("svg", { class: "st-wires", viewBox: "0 0 100 100", preserveAspectRatio: "none", html: ORBIT.map((o) => `<line x1="50" y1="50" x2="${o.x}" y2="${o.y}"/>`).join("") }),
        h("div", { class: "st-core" }, h("img", { src: "./assets/koreplay-app.png", alt: "" })),
        ORBIT.map((o, i) => h("span", { class: `st-module ${o.cls || ""}`, style: { "--x": `${o.x}%`, "--y": `${o.y}%`, "--i": i } },
          h("b", null, PLUGINS[o.id].en === "Interface" ? "界面" : PLUGINS[o.id].en),
          h("small", null, o.label)))));

    const facts = h("section", { class: "st-facts", "aria-label": "产品要点" },
      [
        ["一个安装包", "本体不分架构，32 位和 64 位 ARM 设备装同一个 APK。"],
        ["插件独立更新", "每个插件有自己的版本号。升级本体通常不需要重装插件。"],
        ["签名与校验", "正式插件经过签名和完整性校验，并检查与本体接口的兼容性。"],
      ].map(([title, text]) => h("div", { class: "st-fact" }, h("h2", null, title), h("p", null, text))));

    const abiButtons = Object.entries(ABIS).map(([abi, info]) => h("button", {
      type: "button",
      role: "radio",
      "data-abi": abi,
      onclick: () => ctx.setAbi(abi),
    }, h("b", null, info.short), h("span", null, info.bits)));

    const syncAbi = () => {
      for (const button of abiButtons) {
        const active = button.dataset.abi === ctx.abi;
        button.setAttribute("aria-checked", String(active));
        button.tabIndex = active ? 0 : -1;
      }
    };

    const abiSwitch = h("div", { class: "st-abi-switch", role: "radiogroup", "aria-label": "设备架构" }, abiButtons);
    d.on(abiSwitch, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = abiButtons.find((button) => button.dataset.abi !== ctx.abi);
      ctx.setAbi(next.dataset.abi);
      next.focus();
    });

    const catalog = h("div", { class: "st-catalog", "aria-live": "polite" });

    const components = h("section", { class: "st-components", id: "st-components", "aria-labelledby": "st-components-title" },
      h("div", { class: "st-head" },
        h("div", null,
          h("h2", { id: "st-components-title" }, "选择插件"),
          h("p", null, "插件按处理器架构分包。选好架构，下面就是适合你设备的安装包。")),
        h("div", { class: "st-abi" }, abiSwitch, h("p", { class: "st-abi-hint" }, ABI_HINT))),
      catalog);

    const install = h("section", { class: "st-install", id: "st-install", "aria-labelledby": "st-install-title" },
      h("div", { class: "st-head" },
        h("div", null,
          h("h2", { id: "st-install-title" }, "四步开始使用"),
          h("p", null, "第一次安装时按顺序完成。以后本体和插件可以分别更新。"))),
      h("ol", { class: "st-steps" }, STEPS.map((step) => h("li", null, h("h3", null, step.title), h("p", null, step.text)))));

    const verify = h("section", { class: "st-verify", id: "st-verify", "aria-labelledby": "st-verify-title" },
      h("div", { class: "st-card" },
        h("h2", { id: "st-verify-title" }, "下载需要授权"),
        h("p", null, AUTH_NOTE),
        h("a", { class: "st-link", href: LINKS.login, target: "_blank", rel: "noreferrer" }, "登录 GitHub")),
      h("div", { class: "st-card" },
        h("h2", null, "核对文件完整性"),
        h("p", null, "每个安装包都列出了 SHA-256。下载后用校验工具计算哈希值，与本页或校验文件中的值一致，说明文件完整。"),
        h("a", { class: "st-link", href: ctx.checksums, download: "SHA256SUMS" }, "下载 SHA256SUMS 校验文件")));

    const footer = h("footer", { class: "st-footer" },
      h("div", { class: "st-footer-inner" },
        h("div", { class: "st-footer-brand" }, h("img", { src: "./assets/koreplay-app.png", alt: "", width: "24", height: "24" }), h("span", null, "Koreplay")),
        h("p", { class: "st-footer-note" }, DISCLAIMER),
        h("nav", { class: "st-footer-links", "aria-label": "页脚" },
          h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码"),
          h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0 许可证"),
          h("a", { href: LINKS.upstream, target: "_blank", rel: "noreferrer" }, "上游 TVBoxOS"))));

    root.append(nav, h("main", null, hero, facts, gallery({ id: "st-screens", layout: "stage", variant: "studio" }), components, install, verify), footer);

    syncAbi();
    renderCatalog(ctx, catalog);
    d.add(ctx.onAbi(() => { syncAbi(); renderCatalog(ctx, catalog); }));

    const updateNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    d.on(window, "scroll", updateNav, { passive: true });
    updateNav();

    return () => d.run();
  },
};
