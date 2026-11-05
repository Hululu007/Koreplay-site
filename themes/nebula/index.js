import { ABIS, ABI_HINT, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, clamp, disposer, downloadLink, formatSize, h, icon, loop, s } from "../kit.js";

const TAU = Math.PI * 2;
const ORDER = ["ui", "java", "python", "node", "quickjs", "media3", "ijk"];

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

// Domain-warped fbm nebula with a cursor lens, twinkling stars and scroll parallax.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;
uniform float t;
uniform vec2 m;
uniform float sc;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 k=mat2(.8,.6,-.6,.8);
  for(int i=0;i<6;i++){v+=a*noise(p);p=k*p*2.03;a*=.5;}return v;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
  vec2 mm=(m-.5*r)/r.y;
  float d=length(uv-mm);
  uv+=(uv-mm)*.09*exp(-d*3.2);
  vec2 p=uv*1.55+vec2(0.,sc*.00045);
  vec2 q=vec2(fbm(p+t*.035),fbm(p+vec2(5.2,1.3)-t*.028));
  vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*.045),fbm(p+3.*q+vec2(8.3,2.8)-t*.032));
  float f=fbm(p+3.2*w);
  vec3 c=mix(vec3(.025,.027,.09),vec3(.36,.25,.92),clamp(f*f*2.1,0.,1.));
  c=mix(c,vec3(1.,.6,.24),clamp(length(q)*length(w)*.95-.28,0.,1.)*.85);
  c=mix(c,vec3(.04,.02,.12),clamp(w.y*.85,0.,1.)*.55);
  c*=f*1.35+.18;
  vec2 cell=floor(gl_FragCoord.xy*.75);
  float h1=hash(cell);
  float star=step(.9978,h1)*(.55+.45*sin(t*(1.5+h1*3.)+h1*80.));
  c+=vec3(.9,.92,1.)*star;
  c+=vec3(1.,.66,.36)*.07*exp(-d*3.5);
  c*=1.-.32*dot(uv*.75,uv*.75);
  c*=1.-clamp(sc*.00035,0.,.45);
  gl_FragColor=vec4(c,1.);
}`;

function createNebula(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, powerPreference: "low-power" });
  if (!gl) return null;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "shader compile failed");
    return shader;
  };
  try {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("program link failed");
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniform = (name) => gl.getUniformLocation(program, name);
    const u = { r: uniform("r"), t: uniform("t"), m: uniform("m"), sc: uniform("sc") };

    let scale = 1;
    const pointer = { x: innerWidth * 0.7, y: innerHeight * 0.4, tx: innerWidth * 0.7, ty: innerHeight * 0.4 };
    let scroll = 0;
    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      canvas.width = Math.max(1, Math.ceil(innerWidth * scale));
      canvas.height = Math.max(1, Math.ceil(innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    return {
      pointer,
      resize,
      setScroll(value) { scroll = value; },
      draw(time) {
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        gl.uniform2f(u.r, canvas.width, canvas.height);
        gl.uniform1f(u.t, time);
        gl.uniform2f(u.m, pointer.x * scale, (innerHeight - pointer.y) * scale);
        gl.uniform1f(u.sc, scroll);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      destroy() { gl.getExtension("WEBGL_lose_context")?.loseContext(); },
    };
  } catch (error) {
    console.warn("Nebula shader unavailable:", error);
    return null;
  }
}

/* ---------- 3D orbit of plugins around the host ---------- */

function createOrbit(stage, nodes, backPath, frontPath, onPick) {
  const state = { angle: -Math.PI / 2, vel: 0.16, tilt: 0.36, drag: null, w: 0, h: 0 };
  const BASE = 0.16;

  const measure = () => {
    state.w = stage.clientWidth;
    state.h = stage.clientHeight;
    for (const svg of [backPath.ownerSVGElement, frontPath.ownerSVGElement]) {
      svg.setAttribute("viewBox", `${-state.w / 2} ${-state.h / 2} ${state.w} ${state.h}`);
    }
  };

  const project = (theta, R, f) => {
    const x = R * Math.cos(theta);
    const z = R * Math.sin(theta);
    const y = -z * Math.sin(state.tilt);
    const depth = z * Math.cos(state.tilt);
    const k = f / (f + depth);
    return { x: x * k, y: y * k, k, depth };
  };

  const layout = () => {
    const R = Math.min(state.w, state.h) * 0.4;
    const f = R * 4;
    nodes.forEach((node, i) => {
      const p = project(state.angle + (i * TAU) / nodes.length, R, f);
      const near = clamp((R - p.depth) / (2 * R), 0, 1);
      node.style.transform = `translate(-50%, -50%) translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) scale(${(p.k * (0.82 + near * 0.18)).toFixed(3)})`;
      node.style.zIndex = String(Math.round(500 - p.depth));
      node.style.opacity = (0.38 + near * 0.62).toFixed(3);
      node.style.filter = near < 0.35 ? `blur(${((0.35 - near) * 4).toFixed(2)}px)` : "";
    });
    let back = "";
    let front = "";
    let prevFront = null;
    for (let k = 0; k <= 96; k++) {
      const p = project((k / 96) * TAU, R, f);
      const isFront = p.depth < 0;
      const cmd = `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      if (isFront) front += prevFront === true ? ` L${cmd}` : ` M${cmd}`;
      else back += prevFront === false ? ` L${cmd}` : ` M${cmd}`;
      prevFront = isFront;
    }
    backPath.setAttribute("d", back.trim());
    frontPath.setAttribute("d", front.trim());
  };

  const step = (dt) => {
    if (!state.drag) {
      state.vel += (BASE - state.vel) * Math.min(1, dt * 1.2);
      state.angle += state.vel * dt;
    }
    layout();
  };

  const down = (event) => {
    if (event.button !== 0) return;
    state.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, sx: event.clientX, sy: event.clientY, t: performance.now(), moved: false };
  };
  const move = (event) => {
    const drag = state.drag;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy) > 5) {
      drag.moved = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add("is-dragging");
    }
    if (!drag.moved) return;
    const now = performance.now();
    const dt = Math.max((now - drag.t) / 1000, 1 / 240);
    const delta = -dx * 0.009;
    state.angle += delta;
    state.vel = clamp(delta / dt, -6, 6);
    state.tilt = clamp(state.tilt + dy * 0.004, 0.08, 0.95);
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.t = now;
  };
  const up = (event) => {
    const drag = state.drag;
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.moved) {
      // Swallow the click that follows a drag.
      stage.addEventListener("click", (e) => { e.stopPropagation(); e.preventDefault(); }, { capture: true, once: true });
    }
    state.drag = null;
    stage.classList.remove("is-dragging");
  };

  stage.addEventListener("pointerdown", down);
  stage.addEventListener("pointermove", move);
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);
  nodes.forEach((node) => node.addEventListener("click", () => onPick(node.dataset.id)));

  measure();
  layout();
  return {
    step,
    measure: () => { measure(); layout(); },
    destroy() {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    },
  };
}

/* ---------- building blocks ---------- */

function hashButton(ctx, pkg) {
  return h("button", {
    class: "nb-hash",
    type: "button",
    title: `SHA-256 ${pkg.sha256}（点击复制）`,
    "aria-label": `复制 ${pkg.file} 的 SHA-256`,
    onclick: () => ctx.copy(pkg.sha256, "已复制 SHA-256"),
  }, icon("copy"), h("span", null, `${pkg.sha256.slice(0, 12)}…${pkg.sha256.slice(-6)}`));
}

function pluginCard(ctx, pkg) {
  const meta = PLUGINS[pkg.id] || { name: pkg.id, mark: pkg.id.slice(0, 2).toUpperCase(), kind: "runtime", desc: "独立安装的插件。" };
  return h("article", { class: "nb-card", id: `nb-card-${pkg.id}`, "data-kind": meta.kind },
    h("div", { class: "nb-card-top" },
      h("span", { class: "nb-mark" }, meta.mark),
      h("div", null, h("h3", null, meta.name), h("span", { class: "nb-sub" }, `v${pkg.version} · ${ABIS[pkg.abi].short} · ${formatSize(pkg.size)}`))),
    h("p", { class: "nb-desc" }, meta.desc),
    h("div", { class: "nb-card-foot" },
      hashButton(ctx, pkg),
      downloadLink(pkg, { class: "nb-get", "aria-label": `下载 ${meta.name}（${ABIS[pkg.abi].short}）` }, icon("download"), h("span", null, "下载"))));
}

function renderCatalog(ctx, el) {
  if (!ctx.manifest) {
    el.replaceChildren(h("p", { class: "nb-error" }, `${ctx.error}。请稍后刷新页面重试。`));
    return;
  }
  const host = ctx.host;
  const plugins = ctx.plugins();
  const nodes = [
    h("article", { class: "nb-host", id: "nb-card-host" },
      h("div", { class: "nb-host-ring", "aria-hidden": "true" }),
      h("img", { src: "./assets/koreplay-app.png", alt: "" }),
      h("div", { class: "nb-host-text" },
        h("h3", null, "Koreplay 本体"),
        h("p", null, `v${host.version} · ${formatSize(host.size)} · 通用 APK，ARM64 和 ARM32 都适用`),
        hashButton(ctx, host)),
      downloadLink(host, { class: "nb-btn nb-btn-solid" }, icon("download"), h("span", null, "下载 APK"))),
  ];
  for (const group of GROUPS) {
    const members = plugins.filter((pkg) => (PLUGINS[pkg.id]?.kind || "runtime") === group.kind);
    if (!members.length) continue;
    nodes.push(h("div", { class: "nb-group", "data-kind": group.kind },
      h("h3", { class: "nb-group-title" }, group.title, h("span", null, group.note)),
      h("div", { class: "nb-grid" }, members.map((pkg) => pluginCard(ctx, pkg)))));
  }
  el.replaceChildren(...nodes);
}

function splitLines(lines) {
  let index = 0;
  return lines.map((line) => h("span", { class: "nb-line" },
    [...line].map((ch) => h("span", { class: "nb-char", style: { "--i": index++ } }, ch))));
}

/* ---------- theme ---------- */

export default {
  mount(root, ctx) {
    const d = disposer();
    const reduced = ctx.reducedMotion;
    const host = ctx.host;
    const release = ctx.release;

    const canvas = h("canvas", { class: "nb-sky", "aria-hidden": "true" });
    const fallback = h("div", { class: "nb-sky-fallback", "aria-hidden": "true" });

    const hostAnchor = (cls, ...children) => (host
      ? downloadLink(host, { class: cls }, ...children)
      : h("a", { class: `${cls} is-pending`, href: "#nb-catalog", "aria-disabled": "true" }, ...children));

    const nav = h("header", { class: "nb-nav" },
      h("a", { class: "nb-brand", href: "#nb-top", "aria-label": "Koreplay 首页" },
        h("img", { src: "./assets/koreplay-app.png", alt: "", width: "26", height: "26" }), h("span", null, "Koreplay")),
      h("nav", { class: "nb-nav-links", "aria-label": "主导航" },
        h("a", { href: "#nb-catalog" }, "组件"),
        h("a", { href: "#nb-install" }, "安装"),
        h("a", { href: "#nb-verify" }, "校验"),
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, icon("github"), h("span", null, "GitHub"))),
      hostAnchor("nb-btn nb-btn-solid nb-btn-sm", "下载"));

    const nodes = ORDER.map((id) => {
      const meta = PLUGINS[id];
      const pkg = ctx.plugins().find((item) => item.id === id);
      return h("button", { class: "nb-node", type: "button", "data-id": id, "data-kind": meta.kind, "aria-label": `查看 ${meta.name}` },
        h("span", { class: "nb-node-mark" }, meta.mark),
        h("span", { class: "nb-node-text" }, h("b", null, meta.en === "Interface" ? "界面" : meta.en), h("small", null, pkg ? `v${pkg.version}` : meta.kind === "player" ? "播放器" : "运行时")));
    });
    const backPath = s("path", { class: "nb-ring" });
    const frontPath = s("path", { class: "nb-ring is-front" });
    const stage = h("div", { class: "nb-stage", "aria-label": "插件星轨，可拖动旋转" },
      s("svg", { class: "nb-ring-svg is-back", "aria-hidden": "true" }, backPath),
      h("div", { class: "nb-core", "aria-hidden": "true" },
        h("span", { class: "nb-core-pulse" }), h("span", { class: "nb-core-pulse is-late" }),
        h("img", { src: "./assets/koreplay-app.png", alt: "" })),
      s("svg", { class: "nb-ring-svg is-front", "aria-hidden": "true" }, frontPath),
      nodes,
      h("p", { class: "nb-stage-hint" }, "拖动旋转 · 点击查看"));

    const hero = h("section", { class: "nb-hero", id: "nb-top", "aria-labelledby": "nb-title" },
      h("div", { class: "nb-hero-copy" },
        h("p", { class: `nb-chip ${release ? "is-live" : "is-error"}` },
          h("span", { class: "nb-chip-dot", "aria-hidden": "true" }),
          release ? `${release.tag}${release.date ? ` · ${release.date}` : ""}` : "版本清单暂不可用"),
        h("h1", { id: "nb-title", "aria-label": "一个本体，按需装配。" }, splitLines(["一个本体，", "按需装配。"])),
        h("p", { class: "nb-lead" }, "Koreplay 是 Android 手机和平板上的媒体客户端。界面、运行时和播放器都是绕着本体运转的独立插件，只装你需要的，各自更新。"),
        h("div", { class: "nb-actions" },
          hostAnchor("nb-btn nb-btn-solid nb-btn-lg", icon("download"), h("span", null, "下载 Android 本体")),
          h("a", { class: "nb-btn nb-btn-glass nb-btn-lg", href: "#nb-catalog" }, "选择插件")),
        h("p", { class: "nb-meta" }, host ? `v${host.version} · ${formatSize(host.size)} · 通用安装包，ARM64 和 ARM32 都能装` : "暂时无法读取下载地址")),
      stage);

    const abiButtons = Object.entries(ABIS).map(([abi, info]) => h("button", {
      type: "button", role: "radio", "data-abi": abi, onclick: () => ctx.setAbi(abi),
    }, h("b", null, info.short), h("span", null, info.bits)));
    const abiThumb = h("span", { class: "nb-abi-thumb", "aria-hidden": "true" });
    const abiSwitch = h("div", { class: "nb-abi", role: "radiogroup", "aria-label": "设备架构" }, abiThumb, abiButtons);
    const syncAbi = () => {
      abiButtons.forEach((button, i) => {
        const active = button.dataset.abi === ctx.abi;
        button.setAttribute("aria-checked", String(active));
        button.tabIndex = active ? 0 : -1;
        if (active) abiSwitch.style.setProperty("--slot", i);
      });
    };
    d.on(abiSwitch, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = abiButtons.find((button) => button.dataset.abi !== ctx.abi);
      ctx.setAbi(next.dataset.abi);
      next.focus();
    });

    const catalog = h("div", { class: "nb-catalog-body", "aria-live": "polite" });
    const catalogSection = h("section", { class: "nb-section", id: "nb-catalog", "aria-labelledby": "nb-catalog-title" },
      h("div", { class: "nb-head nb-reveal" },
        h("div", null,
          h("h2", { id: "nb-catalog-title" }, "选择插件"),
          h("p", null, "插件按处理器架构分包。选好架构，下面就是适合你设备的安装包。")),
        h("div", { class: "nb-abi-wrap" }, abiSwitch, h("p", { class: "nb-hint" }, ABI_HINT))),
      catalog);

    const progress = h("span", { class: "nb-timeline-fill", "aria-hidden": "true" });
    const steps = STEPS.map((step, i) => h("li", { class: "nb-step nb-reveal", style: { "--d": `${i * 80}ms` } },
      h("span", { class: "nb-step-dot", "aria-hidden": "true" }, String(i + 1)),
      h("div", null, h("h3", null, step.title), h("p", null, step.text))));
    const install = h("section", { class: "nb-section nb-install", id: "nb-install", "aria-labelledby": "nb-install-title" },
      h("div", { class: "nb-head nb-reveal" },
        h("div", null,
          h("h2", { id: "nb-install-title" }, "四步开始使用"),
          h("p", null, "第一次安装时按顺序完成。以后本体和插件可以分别更新。"))),
      h("ol", { class: "nb-timeline" }, h("span", { class: "nb-timeline-track", "aria-hidden": "true" }, progress), steps));

    const verify = h("section", { class: "nb-section nb-verify", id: "nb-verify", "aria-labelledby": "nb-verify-title" },
      h("div", { class: "nb-panel nb-reveal" },
        h("h2", { id: "nb-verify-title" }, "下载需要授权"),
        h("p", null, AUTH_NOTE),
        h("a", { class: "nb-link", href: LINKS.login, target: "_blank", rel: "noreferrer" }, "登录 GitHub", icon("arrow"))),
      h("div", { class: "nb-panel nb-reveal", style: { "--d": "100ms" } },
        h("h2", null, "核对文件完整性"),
        h("p", null, "每个安装包都附带 SHA-256，点击即可复制。下载后计算哈希值，与本页或校验文件一致即说明文件完整。"),
        h("a", { class: "nb-link", href: ctx.checksums, download: "SHA256SUMS" }, "下载 SHA256SUMS", icon("download"))));

    const footer = h("footer", { class: "nb-footer" },
      h("div", { class: "nb-footer-inner" },
        h("div", { class: "nb-brand" }, h("img", { src: "./assets/koreplay-app.png", alt: "", width: "22", height: "22" }), h("span", null, "Koreplay")),
        h("p", null, DISCLAIMER),
        h("nav", { "aria-label": "页脚" },
          h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码"),
          h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0"),
          h("a", { href: LINKS.upstream, target: "_blank", rel: "noreferrer" }, "上游 TVBoxOS"))));

    root.append(canvas, fallback, nav, h("main", null, hero, catalogSection, install, verify), footer);

    /* catalog + abi */
    syncAbi();
    renderCatalog(ctx, catalog);
    d.add(ctx.onAbi(() => { syncAbi(); renderCatalog(ctx, catalog); }));

    /* card spotlight */
    d.on(catalog, "pointermove", (event) => {
      for (const card of catalog.querySelectorAll(".nb-card, .nb-host")) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }
    });

    /* orbit */
    const pick = (id) => {
      const card = document.getElementById(`nb-card-${id}`);
      if (!card) return;
      card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      card.classList.remove("is-flash");
      void card.offsetWidth;
      card.classList.add("is-flash");
    };
    const orbit = createOrbit(stage, nodes, backPath, frontPath, pick);
    d.add(() => orbit.destroy());

    /* sky */
    const sky = createNebula(canvas);
    if (!sky) root.classList.add("nb-no-gl");
    else d.add(() => sky.destroy());

    d.on(window, "pointermove", (event) => {
      if (!sky) return;
      sky.pointer.tx = event.clientX;
      sky.pointer.ty = event.clientY;
    }, { passive: true });

    const onScroll = () => {
      const y = window.scrollY;
      sky?.setScroll(y);
      nav.classList.toggle("is-scrolled", y > 12);
      const list = install.querySelector(".nb-timeline");
      const rect = list.getBoundingClientRect();
      const p = clamp((innerHeight * 0.65 - rect.top) / rect.height, 0, 1);
      progress.style.transform = `scaleY(${p.toFixed(3)})`;
      steps.forEach((step) => {
        const dot = step.querySelector(".nb-step-dot").getBoundingClientRect();
        step.classList.toggle("is-lit", dot.top < innerHeight * 0.65);
      });
    };
    d.on(window, "scroll", onScroll, { passive: true });
    onScroll();

    d.on(window, "resize", () => { sky?.resize(); orbit.measure(); onScroll(); });

    /* reveal */
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
    }, { rootMargin: "0px 0px -10% 0px" });
    root.querySelectorAll(".nb-reveal").forEach((node) => io.observe(node));
    d.add(() => io.disconnect());

    /* frame loop */
    if (reduced) {
      root.classList.add("nb-reduced");
      sky?.draw(12);
    } else {
      const frames = loop((time, dt) => {
        sky?.draw(time);
        orbit.step(dt);
      });
      const visibility = () => (document.hidden ? frames.stop() : frames.start());
      d.on(document, "visibilitychange", visibility);
      frames.start();
      d.add(() => frames.stop());
    }

    return () => d.run();
  },
};
