import { ABIS, ABI_HINT, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, disposer, downloadLink, formatSize, h, icon, s } from "../kit.js";

const HOST = { x: 420, y: 230, w: 160, h: 170 };
const MODULES = [
  { id: "ui", x: 420, y: 40, side: "top" },
  { id: "java", x: 790, y: 60, side: "right" },
  { id: "python", x: 790, y: 175, side: "right" },
  { id: "node", x: 790, y: 290, side: "right" },
  { id: "quickjs", x: 790, y: 405, side: "right" },
  { id: "media3", x: 50, y: 170, side: "left" },
  { id: "ijk", x: 50, y: 330, side: "left" },
];
const MW = 160;
const MH = 64;

function tracePath(m, i) {
  const r = 14;
  if (m.side === "top") {
    const x = HOST.x + HOST.w / 2;
    return `M${x} ${m.y + MH} V${HOST.y}`;
  }
  const startY = m.y + MH / 2;
  if (m.side === "right") {
    const hostX = HOST.x + HOST.w;
    const pinY = HOST.y + 30 + (i - 1) * 36;
    const midX = 690 + (i - 1) * 14;
    const dir = pinY > startY ? 1 : -1;
    if (Math.abs(pinY - startY) < r * 2) return `M${m.x} ${startY} H${hostX}`;
    return `M${m.x} ${startY} H${midX + r} Q${midX} ${startY} ${midX} ${startY + r * dir} V${pinY - r * dir} Q${midX} ${pinY} ${midX - r} ${pinY} H${hostX}`;
  }
  const hostX = HOST.x;
  const pinY = HOST.y + 55 + (i - 5) * 60;
  const midX = 300 - (i - 5) * 16;
  const sx = m.x + MW;
  const dir = pinY > startY ? 1 : -1;
  if (Math.abs(pinY - startY) < r * 2) return `M${sx} ${startY} H${hostX}`;
  return `M${sx} ${startY} H${midX - r} Q${midX} ${startY} ${midX} ${startY + r * dir} V${pinY - r * dir} Q${midX} ${pinY} ${midX + r} ${pinY} H${hostX}`;
}

function schematic(ctx, reduced) {
  const pkgFor = (id) => ctx.plugins().find((pkg) => pkg.id === id);
  const svg = s("svg", { class: "bp-schematic", viewBox: "0 0 1000 520", role: "img", "aria-label": "Koreplay 总装图：本体位于中央，七个插件通过接口连接" });

  const defs = s("defs", null,
    s("marker", { id: "bp-arrow", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" },
      s("path", { d: "M0 1 L9 5 L0 9", fill: "none", stroke: "currentColor", "stroke-width": "1.4" })),
    s("pattern", { id: "bp-hatch", width: "8", height: "8", patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" },
      s("line", { x1: "0", y1: "0", x2: "0", y2: "8", stroke: "rgba(232,240,255,.22)", "stroke-width": "2" })));
  svg.append(defs);

  // Traces
  const traces = s("g", { class: "bp-traces" });
  MODULES.forEach((m, i) => {
    const d = tracePath(m, i);
    const kind = PLUGINS[m.id].kind;
    const path = s("path", { d, class: "bp-trace bp-draw", "data-id": m.id, "data-kind": kind, pathLength: "1", style: { "--d": `${0.9 + i * 0.08}s` } });
    traces.append(path);
    if (!reduced) {
      const id = `bp-tr-${m.id}`;
      path.setAttribute("id", id);
      for (let k = 0; k < 2; k++) {
        const dot = s("circle", { r: "3.2", class: "bp-packet", "data-kind": kind });
        const anim = s("animateMotion", {
          dur: `${2.4 + (i % 3) * 0.5}s`,
          repeatCount: "indefinite",
          begin: `${2 + k * 1.3 + i * 0.17}s`,
          calcMode: "linear",
        }, s("mpath", { href: `#${id}` }));
        dot.append(anim);
        traces.append(dot);
      }
    }
  });
  svg.append(traces);

  // Host block
  const host = ctx.host;
  svg.append(s("g", { class: "bp-host" },
    s("rect", { x: HOST.x, y: HOST.y, width: HOST.w, height: HOST.h, rx: "6", class: "bp-draw bp-host-rect", pathLength: "1", style: { "--d": ".2s" } }),
    s("rect", { x: HOST.x + 10, y: HOST.y + 10, width: HOST.w - 20, height: HOST.h - 20, rx: "3", fill: "url(#bp-hatch)", class: "bp-fade", style: { "--d": "1.1s" } }),
    s("text", { x: HOST.x + HOST.w / 2, y: HOST.y + 74, class: "bp-host-title bp-fade", style: { "--d": "1.2s" } }, "KOREPLAY"),
    s("text", { x: HOST.x + HOST.w / 2, y: HOST.y + 98, class: "bp-host-sub bp-fade", style: { "--d": "1.3s" } }, "本体 HOST"),
    s("text", { x: HOST.x + HOST.w / 2, y: HOST.y + 120, class: "bp-host-sub bp-fade", style: { "--d": "1.35s" } }, host ? `v${host.version} · API ${ctx.release?.hostApi ?? "?"}` : "—")));

  // Host dimension line
  svg.append(s("g", { class: "bp-dim bp-fade", style: { "--d": "1.6s" } },
    s("line", { x1: HOST.x, y1: HOST.y + HOST.h + 26, x2: HOST.x + HOST.w, y2: HOST.y + HOST.h + 26, "marker-start": "url(#bp-arrow)", "marker-end": "url(#bp-arrow)" }),
    s("line", { x1: HOST.x, y1: HOST.y + HOST.h + 6, x2: HOST.x, y2: HOST.y + HOST.h + 34, class: "bp-ext" }),
    s("line", { x1: HOST.x + HOST.w, y1: HOST.y + HOST.h + 6, x2: HOST.x + HOST.w, y2: HOST.y + HOST.h + 34, class: "bp-ext" }),
    s("text", { x: HOST.x + HOST.w / 2, y: HOST.y + HOST.h + 20 }, host ? formatSize(host.size) : "—"),
    s("text", { x: HOST.x + HOST.w / 2, y: HOST.y + HOST.h + 52, class: "bp-dim-note" }, "通用 APK · ARM64 / ARM32")));

  // Modules
  const modules = s("g", { class: "bp-modules" });
  MODULES.forEach((m, i) => {
    const meta = PLUGINS[m.id];
    const pkg = pkgFor(m.id);
    const g = s("g", { class: "bp-module", "data-id": m.id, "data-kind": meta.kind, tabindex: "0", role: "button", "aria-label": `${meta.name}，查看物料清单`, style: { "--d": `${0.5 + i * 0.08}s` } },
      s("rect", { x: m.x, y: m.y, width: MW, height: MH, rx: "4", class: "bp-draw", pathLength: "1" }),
      s("text", { x: m.x + 14, y: m.y + 27, class: "bp-mod-title" }, meta.en === "Interface" ? "界面 UI" : meta.en),
      s("text", { x: m.x + 14, y: m.y + 47, class: "bp-mod-sub" }, pkg ? `v${pkg.version} · ${formatSize(pkg.size)}` : meta.kind === "player" ? "播放器" : "运行时"),
      s("circle", { cx: m.x + MW - 16, cy: m.y + 16, r: "9", class: "bp-callout" }),
      s("text", { x: m.x + MW - 16, y: m.y + 20, class: "bp-callout-no" }, String(i + 1)));
    modules.append(g);
  });
  svg.append(modules);

  // Group labels
  svg.append(s("g", { class: "bp-labels bp-fade", style: { "--d": "1.8s" } },
    s("text", { x: "870", y: "40" }, "运行时 RUNTIME"),
    s("text", { x: "130", y: "150" }, "播放器 PLAYER"),
    s("text", { x: "500", y: "24" }, "界面 必需")));

  return svg;
}

export default {
  mount(root, ctx) {
    const d = disposer();
    const reduced = ctx.reducedMotion;
    const host = ctx.host;
    const release = ctx.release;

    const hostAnchor = (cls, ...children) => (host
      ? downloadLink(host, { class: cls }, ...children)
      : h("a", { class: `${cls} is-pending`, href: "#bp-bom", "aria-disabled": "true" }, ...children));

    const nav = h("header", { class: "bp-nav" },
      h("a", { class: "bp-brand", href: "#bp-top" }, h("img", { src: "./assets/koreplay-app.png", alt: "", width: "24", height: "24" }), "KOREPLAY", h("span", null, "/ 总装图")),
      h("nav", { "aria-label": "主导航" },
        h("a", { href: "#bp-bom" }, "物料清单"),
        h("a", { href: "#bp-assembly" }, "装配说明"),
        h("a", { href: "#bp-notes" }, "技术要求"),
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码")),
      hostAnchor("bp-btn bp-btn-sm", "下载本体"));

    const drawing = schematic(ctx, reduced);
    const hero = h("section", { class: "bp-hero", id: "bp-top", "aria-labelledby": "bp-title" },
      h("div", { class: "bp-hero-copy" },
        h("p", { class: "bp-code" }, `图号 KP-${release?.tag || "OFFLINE"}`),
        h("h1", { id: "bp-title" }, "一个本体，", h("br"), "按需装配。"),
        h("p", { class: "bp-lead" }, "Koreplay 是 Android 手机和平板上的媒体客户端。本体是唯一的主件，界面、运行时和播放器都是可拆装的独立模块，接口统一，各自更新。"),
        h("div", { class: "bp-actions" },
          hostAnchor("bp-btn", icon("download"), h("span", null, "下载本体 APK")),
          h("a", { class: "bp-btn bp-btn-ghost", href: "#bp-bom" }, "查看物料清单")),
        h("p", { class: "bp-meta" }, host ? `v${host.version} · ${formatSize(host.size)} · ${release?.date || ""}` : "版本清单暂不可用")),
      h("figure", { class: "bp-figure" },
        h("div", { class: "bp-figure-frame" }, drawing),
        h("figcaption", null, "图 1 · 模块接线示意。点击任一模块查看对应物料。")));

    /* BOM */
    const abiButtons = Object.entries(ABIS).map(([abi, info], i) => h("button", {
      type: "button", role: "radio", "data-abi": abi, onclick: () => ctx.setAbi(abi),
    }, h("b", null, `修订 ${String.fromCharCode(65 + i)}`), h("span", null, `${info.short} · ${info.bits}`)));
    const syncAbi = () => abiButtons.forEach((b) => {
      const on = b.dataset.abi === ctx.abi;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const abiGroup = h("div", { class: "bp-rev", role: "radiogroup", "aria-label": "设备架构" }, abiButtons);
    d.on(abiGroup, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = abiButtons.find((b) => b.dataset.abi !== ctx.abi);
      ctx.setAbi(next.dataset.abi);
      next.focus();
    });

    const tbody = h("tbody");
    const table = h("table", { class: "bp-table" },
      h("caption", { class: "bp-sr" }, "物料清单：本体与插件安装包"),
      h("thead", null, h("tr", null,
        ["序号", "零件", "类别", "版本", "大小", "SHA-256", ""].map((t) => h("th", { scope: "col" }, t)))),
      tbody);

    const renderBom = () => {
      syncAbi();
      if (!ctx.manifest) {
        tbody.replaceChildren(h("tr", null, h("td", { colspan: "7", class: "bp-error" }, `${ctx.error}。请稍后刷新页面。`)));
        return;
      }
      const rows = [];
      const order = [ctx.host];
      for (const group of GROUPS) order.push(...ctx.plugins().filter((pkg) => (PLUGINS[pkg.id]?.kind || "runtime") === group.kind));
      order.forEach((pkg, i) => {
        const isHost = pkg.id === "host";
        const meta = isHost ? { name: "Koreplay 本体", kind: "host" } : PLUGINS[pkg.id] || { name: pkg.id, kind: "runtime" };
        const kindLabel = isHost ? "主件" : meta.kind === "ui" ? "界面 · 必需" : meta.kind === "player" ? "播放器" : "运行时";
        const callout = isHost ? "0" : String(MODULES.findIndex((m) => m.id === pkg.id) + 1);
        rows.push(h("tr", { id: `bp-row-${pkg.id}`, "data-id": pkg.id, "data-kind": meta.kind },
          h("td", { "data-label": "序号" }, h("span", { class: "bp-callout-chip" }, callout)),
          h("th", { scope: "row", "data-label": "零件" }, meta.name, h("small", null, pkg.file)),
          h("td", { "data-label": "类别" }, kindLabel),
          h("td", { "data-label": "版本" }, `v${pkg.version}`),
          h("td", { "data-label": "大小" }, formatSize(pkg.size)),
          h("td", { "data-label": "SHA-256" }, h("button", { class: "bp-hash", type: "button", title: pkg.sha256, onclick: () => ctx.copy(pkg.sha256, "已复制 SHA-256") }, `${pkg.sha256.slice(0, 10)}…`)),
          h("td", { class: "bp-get-cell" }, downloadLink(pkg, { class: "bp-get", "aria-label": `下载 ${meta.name}` }, icon("download"), h("span", null, "下载")))));
      });
      tbody.replaceChildren(...rows);
    };

    const bom = h("section", { class: "bp-section", id: "bp-bom", "aria-labelledby": "bp-bom-title" },
      h("div", { class: "bp-head" },
        h("div", null,
          h("h2", { id: "bp-bom-title" }, "物料清单"),
          h("p", null, "本体通用。插件按处理器架构分为两个修订版，选好修订，表中就是适合你设备的安装包。")),
        h("div", { class: "bp-rev-wrap" }, abiGroup, h("p", null, ABI_HINT))),
      h("div", { class: "bp-table-wrap" }, table));

    /* assembly */
    const assembly = h("section", { class: "bp-section", id: "bp-assembly", "aria-labelledby": "bp-assembly-title" },
      h("div", { class: "bp-head" }, h("div", null,
        h("h2", { id: "bp-assembly-title" }, "装配说明"),
        h("p", null, "首次安装按以下顺序完成。以后本体和插件可以分别更新。"))),
      h("ol", { class: "bp-steps" }, STEPS.map((step, i) => h("li", null,
        h("span", { class: "bp-step-no", "aria-hidden": "true" }, String(i + 1)),
        h("div", null, h("h3", null, step.title), h("p", null, step.text)),
        s("svg", { class: "bp-step-art", viewBox: "0 0 120 80", "aria-hidden": "true", html: [
          '<rect x="40" y="18" width="40" height="44" rx="4"/><path d="M60 4v10m-5-5 5 5 5-5"/>',
          '<rect x="40" y="18" width="40" height="44" rx="4"/><rect x="46" y="24" width="28" height="14" rx="2" class="fill"/>',
          '<rect x="40" y="18" width="40" height="44" rx="4"/><rect x="6" y="30" width="22" height="20" rx="2"/><rect x="92" y="30" width="22" height="20" rx="2"/><path d="M28 40h12M80 40h12"/>',
          '<rect x="40" y="18" width="40" height="44" rx="4"/><path d="M48 32h24M48 40h18M48 48h22"/>',
        ][i] })))));

    /* notes / title block */
    const notes = h("section", { class: "bp-section bp-notes", id: "bp-notes", "aria-labelledby": "bp-notes-title" },
      h("div", { class: "bp-notes-text" },
        h("h2", { id: "bp-notes-title" }, "技术要求"),
        h("ol", null,
          h("li", null, AUTH_NOTE, " ", h("a", { href: LINKS.login, target: "_blank", rel: "noreferrer" }, "登录 GitHub")),
          h("li", null, "每个零件都附带 SHA-256。下载后计算哈希值，与物料清单或 ", h("a", { href: ctx.checksums, download: "SHA256SUMS" }, "SHA256SUMS"), " 一致即说明文件完整。"),
          h("li", null, "正式插件经过签名和完整性校验，并检查与本体接口版本的兼容性。"),
          h("li", null, DISCLAIMER))),
      h("table", { class: "bp-titleblock" },
        h("caption", { class: "bp-sr" }, "图纸标题栏"),
        h("tbody", null,
          h("tr", null, h("th", { scope: "row" }, "图名"), h("td", { colspan: "3", class: "bp-tb-name" }, "Koreplay 移动端总装图")),
          h("tr", null, h("th", { scope: "row" }, "图号"), h("td", null, release?.tag || "—"), h("th", { scope: "row" }, "比例"), h("td", null, "1 : 1")),
          h("tr", null, h("th", { scope: "row" }, "版本"), h("td", null, host ? `v${host.version}` : "—"), h("th", { scope: "row" }, "接口"), h("td", null, release ? `API ${release.hostApi}` : "—")),
          h("tr", null, h("th", { scope: "row" }, "日期"), h("td", null, release?.date || "—"), h("th", { scope: "row" }, "页"), h("td", null, "1 / 1")),
          h("tr", null, h("th", { scope: "row" }, "许可"), h("td", null, h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0")), h("th", { scope: "row" }, "上游"), h("td", null, h("a", { href: LINKS.upstream, target: "_blank", rel: "noreferrer" }, "TVBoxOS"))))));

    const cross = h("div", { class: "bp-cross", "aria-hidden": "true" }, h("i", { class: "bp-cross-x" }), h("i", { class: "bp-cross-y" }), h("span", { class: "bp-cross-label" }));
    root.append(nav, h("main", null, hero, bom, assembly, notes), cross);

    renderBom();
    d.add(ctx.onAbi(() => {
      renderBom();
      // Refresh module version labels in the drawing for the selected ABI.
      drawing.querySelectorAll(".bp-module").forEach((g) => {
        const pkg = ctx.plugins().find((p) => p.id === g.dataset.id);
        const sub = g.querySelector(".bp-mod-sub");
        if (pkg && sub) sub.textContent = `v${pkg.version} · ${formatSize(pkg.size)}`;
      });
    }));

    /* drawing interactions */
    const highlight = (id, on) => {
      drawing.querySelectorAll(`[data-id="${id}"]`).forEach((el) => el.classList.toggle("is-hot", on));
      document.getElementById(`bp-row-${id}`)?.classList.toggle("is-hot", on);
      drawing.classList.toggle("has-hot", on);
    };
    const jump = (id) => {
      const row = document.getElementById(`bp-row-${id}`);
      if (!row) return;
      row.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      row.classList.remove("is-flash");
      void row.offsetWidth;
      row.classList.add("is-flash");
    };
    drawing.querySelectorAll(".bp-module").forEach((g) => {
      const id = g.dataset.id;
      g.addEventListener("pointerenter", () => highlight(id, true));
      g.addEventListener("pointerleave", () => highlight(id, false));
      g.addEventListener("focus", () => highlight(id, true));
      g.addEventListener("blur", () => highlight(id, false));
      g.addEventListener("click", () => jump(id));
      g.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); jump(id); }
      });
    });
    d.on(tbody, "pointerover", (event) => {
      const row = event.target.closest("tr[data-id]");
      if (!row || row.dataset.id === "host") return;
      drawing.querySelectorAll(".is-hot").forEach((el) => el.classList.remove("is-hot"));
      drawing.querySelectorAll(`[data-id="${row.dataset.id}"]`).forEach((el) => el.classList.add("is-hot"));
      drawing.classList.add("has-hot");
    });
    d.on(tbody, "pointerleave", () => {
      drawing.querySelectorAll(".is-hot").forEach((el) => el.classList.remove("is-hot"));
      drawing.classList.remove("has-hot");
    });

    /* draw-on when visible */
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { drawing.classList.add("is-drawn"); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(drawing);
    d.add(() => io.disconnect());
    // Fallback in case the observer never reports (e.g. background tab at load).
    const drawFallback = setTimeout(() => {
      const rect = drawing.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) drawing.classList.add("is-drawn");
    }, 1500);
    d.add(() => clearTimeout(drawFallback));
    if (reduced) drawing.classList.add("is-drawn", "is-static");

    /* crosshair */
    if (matchMedia("(pointer: fine)").matches && !reduced) {
      const label = cross.querySelector(".bp-cross-label");
      let raf = 0;
      let px = 0;
      let py = 0;
      const paint = () => {
        raf = 0;
        cross.style.setProperty("--cx", `${px}px`);
        cross.style.setProperty("--cy", `${py}px`);
        label.textContent = `X ${String(Math.round(px)).padStart(4, "0")}  Y ${String(Math.round(py + window.scrollY)).padStart(5, "0")}`;
      };
      d.on(window, "pointermove", (event) => {
        px = event.clientX;
        py = event.clientY;
        cross.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(paint);
      }, { passive: true });
      d.on(document, "pointerleave", () => cross.classList.remove("is-on"));
      root.classList.add("bp-has-cross");
    }

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
    d.on(window, "scroll", onScroll, { passive: true });
    onScroll();

    return () => d.run();
  },
};
