import { ABIS, ABI_HINT, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, clamp, disposer, downloadLink, formatSize, h, icon, loop } from "../kit.js";
import { gallery } from "../gallery.js";

const TAU = Math.PI * 2;
const ORDER = ["ui", "java", "python", "node", "quickjs", "media3", "ijk"];
// Group palette: UI warm, runtimes cyan, players violet.
const HUE = { host: [1, 0.66, 0.32], ui: [1, 0.55, 0.3], runtime: [0.36, 0.88, 1], player: [0.78, 0.45, 1] };

/* ---------------- shape generators (positions in world units, ~[-1.6, 1.6]) ---------------- */

function sampleText(text, count) {
  const w = 1200;
  const hgt = 300;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = hgt;
  const c = cv.getContext("2d");
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `800 220px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  c.fillText(text, w / 2, hgt / 2 + 6);
  const data = c.getImageData(0, 0, w, hgt).data;
  const pts = [];
  for (let y = 0; y < hgt; y += 3) {
    for (let x = 0; x < w; x += 3) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push([(x - w / 2) / 380, -(y - hgt / 2) / 380]);
    }
  }
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = pts[(Math.random() * pts.length) | 0] || [0, 0];
    out[i * 3] = p[0] + (Math.random() - 0.5) * 0.008;
    out[i * 3 + 1] = p[1] + (Math.random() - 0.5) * 0.008;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
  }
  return out;
}

function assemblyShape(count, owner) {
  // Host sphere in the centre, seven plugin clusters on a tilted ring.
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const o = owner[i];
    let cx = 0;
    let cy = 0;
    let cz = 0;
    let r = 0.46;
    if (o >= 0) {
      const a = (o / ORDER.length) * TAU - Math.PI / 2;
      cx = Math.cos(a) * 1.18;
      cy = Math.sin(a) * 0.72;
      cz = Math.sin(a) * 0.5;
      r = 0.16;
    }
    const u = Math.random() * 2 - 1;
    const t = Math.random() * TAU;
    const s = Math.sqrt(1 - u * u);
    const rr = r * Math.cbrt(Math.random() * 0.25 + 0.75);
    out[i * 3] = cx + s * Math.cos(t) * rr;
    out[i * 3 + 1] = cy + u * rr;
    out[i * 3 + 2] = cz + s * Math.sin(t) * rr;
  }
  return out;
}

function helixShape(count) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const k = Math.random();
    const strand = i % 3;
    const y = (k - 0.5) * 3.0;
    const a = k * TAU * 2.6;
    if (strand < 2) {
      const ph = a + strand * Math.PI;
      out[i * 3] = Math.cos(ph) * 0.5 + (Math.random() - 0.5) * 0.04;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = Math.sin(ph) * 0.5 + (Math.random() - 0.5) * 0.04;
    } else {
      // Rungs between the strands.
      const rung = Math.round(k * 44) / 44;
      const ra = rung * TAU * 2.6;
      const m = Math.random() * 2 - 1;
      out[i * 3] = Math.cos(ra) * 0.5 * m;
      out[i * 3 + 1] = (rung - 0.5) * 3.0;
      out[i * 3 + 2] = Math.sin(ra) * 0.5 * m;
    }
  }
  return out;
}

function galaxyShape(count) {
  const out = new Float32Array(count * 3);
  const arms = 4;
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 0.7) * 1.7;
    const arm = i % arms;
    const a = (arm / arms) * TAU + r * 2.4 + (Math.random() - 0.5) * (0.5 / (r + 0.2));
    const spread = 0.08 + r * 0.06;
    out[i * 3] = Math.cos(a) * r + (Math.random() - 0.5) * spread;
    out[i * 3 + 1] = (Math.random() - 0.5) * 0.08 * (1.7 - r);
    out[i * 3 + 2] = Math.sin(a) * r + (Math.random() - 0.5) * spread;
  }
  return out;
}

/* ---------------- WebGL ---------------- */

const VERT = `
attribute vec3 aA;
attribute vec3 aB;
attribute vec4 aSeed;
attribute vec3 aCol;
uniform float uMix;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uRot;
uniform vec2 uMouse;
uniform float uScale;
uniform vec3 uShock;
uniform float uExplode;
uniform vec2 uOffset;
varying vec3 vCol;
varying float vAlpha;

mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}

void main(){
  float m = smoothstep(0., 1., clamp((uMix - aSeed.x * .35) / .65, 0., 1.));
  vec3 p = mix(aA, aB, m);
  // Swirl while in transit.
  float transit = sin(m * 3.14159);
  p += transit * vec3(sin(aSeed.y * 40. + uTime), cos(aSeed.z * 40. + uTime * 1.3), sin(aSeed.w * 40.)) * .22;
  // Idle shimmer.
  p += vec3(sin(uTime * .9 + aSeed.y * 30.), cos(uTime * .8 + aSeed.z * 30.), sin(uTime * .7 + aSeed.w * 30.)) * .006;
  p *= 1. + uExplode * (aSeed.y * 1.4 + .2);
  p = rotY(uRot.x) * rotX(uRot.y) * p;

  float depth = p.z + 3.4;
  vec2 proj = p.xy / depth * 3.4;
  float aspect = uRes.x / uRes.y;
  proj *= uScale;
  proj += uOffset;
  // Cursor repulsion in screen space.
  vec2 toM = proj - uMouse * vec2(aspect, 1.);
  float dm = length(toM);
  proj += normalize(toM + 1e-5) * .12 * exp(-dm * dm * 18.);
  // Shockwave ring.
  vec2 toS = proj - uShock.xy * vec2(aspect, 1.);
  float ds = length(toS);
  float ring = exp(-pow((ds - uShock.z * 2.2) * 9., 2.)) * (1. - uShock.z);
  proj += normalize(toS + 1e-5) * ring * .09;

  gl_Position = vec4(proj.x / aspect, proj.y, 0., 1.);
  float size = (3.2 + aSeed.w * 3.4) * (3.4 / depth);
  gl_PointSize = size * uRes.y / 900. * (1. + ring * 2.);
  vCol = aCol * (.7 + .3 * (1. - transit)) + ring * .6;
  vAlpha = (.55 + .45 * aSeed.w) * clamp(1.6 - depth * .25, .25, 1.) * (1. - uExplode * .6);
}`;

const FRAG = `
precision mediump float;
varying vec3 vCol;
varying float vAlpha;
void main(){
  vec2 d = gl_PointCoord - .5;
  float r = dot(d, d);
  if (r > .25) discard;
  float core = exp(-r * 18.);
  gl_FragColor = vec4(vCol * (core * 2.2 + .35), (core * 1.3 + .2) * vAlpha);
}`;

function createField(canvas, count) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false, depth: false, powerPreference: "high-performance" });
  if (!gl) return null;
  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  try {
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const buffer = (name, size, data, usage = gl.STATIC_DRAW) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buf;
    };
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    const bufA = buffer("aA", 3, new Float32Array(count * 3), gl.DYNAMIC_DRAW);
    const bufB = buffer("aB", 3, new Float32Array(count * 3), gl.DYNAMIC_DRAW);
    buffer("aSeed", 4, seeds);
    const bufCol = buffer("aCol", 3, new Float32Array(count * 3), gl.DYNAMIC_DRAW);

    const U = {};
    for (const name of ["uMix", "uTime", "uRes", "uRot", "uMouse", "uScale", "uShock", "uExplode", "uOffset"]) U[name] = gl.getUniformLocation(prog, name);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const upload = (buf, data) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    };

    return {
      resize,
      setShapes(a, b) { upload(bufA, a); upload(bufB, b); },
      setColors(col) { upload(bufCol, col); },
      draw(u) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(U.uMix, u.mix);
        gl.uniform1f(U.uTime, u.time);
        gl.uniform2f(U.uRes, canvas.width, canvas.height);
        gl.uniform2f(U.uRot, u.rotX, u.rotY);
        gl.uniform2f(U.uMouse, u.mx, u.my);
        gl.uniform1f(U.uScale, u.scale);
        gl.uniform3f(U.uShock, u.sx, u.sy, u.st);
        gl.uniform2f(U.uOffset, u.ox, u.oy);
        gl.uniform1f(U.uExplode, u.explode);
        gl.drawArrays(gl.POINTS, 0, count);
      },
      destroy() { gl.getExtension("WEBGL_lose_context")?.loseContext(); },
    };
  } catch (error) {
    console.warn("Quantum field unavailable:", error);
    return null;
  }
}

/* ---------------- theme ---------------- */

export default {
  mount(root, ctx) {
    const d = disposer();
    const reduced = ctx.reducedMotion;
    const host = ctx.host;
    const release = ctx.release;
    const mobile = matchMedia("(max-width: 760px)").matches;
    const COUNT = mobile ? 4200 : 9000;

    // Particle ownership: ~35% host, the rest split across plugins weighted by package size.
    const owner = new Int16Array(COUNT);
    const plugins = ctx.plugins();
    const weights = ORDER.map((id) => Math.sqrt(plugins.find((p) => p.id === id)?.size || 400000));
    const totalW = weights.reduce((a, b) => a + b, 0);
    let cursor = 0;
    const hostShare = Math.round(COUNT * 0.35);
    for (let i = 0; i < hostShare; i++) owner[cursor++] = -1;
    ORDER.forEach((_, k) => {
      const n = k === ORDER.length - 1 ? COUNT - cursor : Math.round(((COUNT - hostShare) * weights[k]) / totalW);
      for (let i = 0; i < n && cursor < COUNT; i++) owner[cursor++] = k;
    });
    while (cursor < COUNT) owner[cursor++] = -1;

    const shapes = [
      sampleText("KOREPLAY", COUNT),
      assemblyShape(COUNT, owner),
      helixShape(COUNT),
      galaxyShape(COUNT),
    ];

    const baseColors = new Float32Array(COUNT * 3);
    const colorFor = (o, hot) => {
      const kind = o < 0 ? "host" : PLUGINS[ORDER[o]].kind;
      const c = HUE[kind];
      if (hot === null) return c;
      if (o === hot) return [1, 0.95, 0.8];
      return [c[0] * 0.22, c[1] * 0.22, c[2] * 0.22];
    };
    const paint = (hot = null) => {
      for (let i = 0; i < COUNT; i++) {
        const c = colorFor(owner[i], hot);
        baseColors[i * 3] = c[0];
        baseColors[i * 3 + 1] = c[1];
        baseColors[i * 3 + 2] = c[2];
      }
      field?.setColors(baseColors);
    };

    /* ---------- DOM ---------- */
    const canvas = h("canvas", { class: "qt-field", "aria-hidden": "true" });
    const veil = h("div", { class: "qt-veil", "aria-hidden": "true" });

    const hostAnchor = (cls, ...children) => (host
      ? downloadLink(host, { class: cls }, ...children)
      : h("a", { class: `${cls} is-pending`, href: "#qt-matrix", "aria-disabled": "true" }, ...children));

    const progressDots = ["形", "构", "变", "域"].map((label, i) => h("button", { class: "qt-rail-dot", type: "button", "data-i": i, "aria-label": `跳到第 ${i + 1} 幕` }, h("span", null, label)));
    const rail = h("nav", { class: "qt-rail", "aria-label": "章节" }, h("span", { class: "qt-rail-line", "aria-hidden": "true" }, h("i")), progressDots);

    const nav = h("header", { class: "qt-nav" },
      h("a", { class: "qt-brand", href: "#qt-s0" }, h("img", { src: "./assets/koreplay-app.png", alt: "", width: "24", height: "24" }), h("span", null, "Koreplay")),
      h("p", { class: "qt-nav-ver" }, release ? `${release.tag}` : "offline"),
      hostAnchor("qt-btn qt-btn-sm", "下载本体"));

    const pluginKeys = ORDER.map((id, k) => {
      const meta = PLUGINS[id];
      const pkg = plugins.find((p) => p.id === id);
      return h("button", { class: "qt-key", type: "button", "data-k": k, "data-kind": meta.kind },
        h("i", { "aria-hidden": "true" }),
        h("b", null, meta.en === "Interface" ? "界面" : meta.en),
        h("small", null, pkg ? formatSize(pkg.size) : "—"));
    });

    const scene = (i, ...children) => h("section", { class: `qt-scene qt-s${i}`, id: `qt-s${i}`, "data-scene": i }, h("div", { class: "qt-scene-inner" }, ...children));

    const scenes = [
      scene(0,
        h("p", { class: "qt-kicker" }, h("span", { class: "qt-pulse", "aria-hidden": "true" }), release ? `${release.tag} · ${release.date || ""}` : "版本清单暂不可用"),
        h("h1", { class: "qt-h1" }, "由插件组成的", h("br"), "媒体客户端"),
        h("p", { class: "qt-lead" }, "Koreplay 运行在 Android 手机和平板上。本体精简，界面、运行时和播放器都是独立插件，按需安装、各自更新。"),
        h("div", { class: "qt-actions" },
          hostAnchor("qt-btn", icon("download"), h("span", null, "下载 Android 本体")),
          h("a", { class: "qt-btn qt-btn-ghost", href: "#qt-matrix" }, "查看全部组件")),
        h("p", { class: "qt-scroll-hint", "aria-hidden": "true" }, "向下滚动，粒子会重组")),
      scene(1,
        h("p", { class: "qt-kicker" }, "第二幕 · 结构"),
        h("h2", { class: "qt-h2" }, "一个核心，七个插件"),
        h("p", { class: "qt-body" }, "中心是本体。外圈七团粒子就是七个插件，每团的粒子数量和安装包大小成正比。把鼠标移到下方名称上，对应的那一团会亮起来。"),
        h("div", { class: "qt-keys" }, pluginKeys)),
      scene(2,
        h("p", { class: "qt-kicker" }, "第三幕 · 演进"),
        h("h2", { class: "qt-h2" }, "各自演进，互不牵连"),
        h("p", { class: "qt-body" }, "每个插件有自己的版本号。升级本体通常不需要重装插件，只有真正变化的组件才会出现在增量更新里。正式插件经过签名与完整性校验，并检查和本体接口的兼容性。"),
        h("dl", { class: "qt-stats" },
          h("div", null, h("dt", null, "本体接口"), h("dd", null, release ? `API ${release.hostApi}` : "—")),
          h("div", null, h("dt", null, "可选插件"), h("dd", null, String(plugins.length))),
          h("div", null, h("dt", null, "支持架构"), h("dd", null, "ARM64 / ARM32")))),
      scene(3,
        h("p", { class: "qt-kicker" }, "第四幕 · 部署"),
        h("h2", { class: "qt-h2" }, "四步，装进你的设备"),
        h("ol", { class: "qt-steps" }, STEPS.map((step, i) => h("li", null, h("span", null, String(i + 1).padStart(2, "0")), h("div", null, h("h3", null, step.title), h("p", null, step.text)))))),
    ];

    /* matrix */
    const abiButtons = Object.entries(ABIS).map(([abi, info]) => h("button", {
      type: "button", role: "radio", "data-abi": abi, onclick: () => ctx.setAbi(abi),
    }, h("b", null, info.short), h("span", null, info.bits)));
    const syncAbi = () => abiButtons.forEach((b) => {
      const on = b.dataset.abi === ctx.abi;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const abiGroup = h("div", { class: "qt-abi", role: "radiogroup", "aria-label": "设备架构" }, abiButtons);
    d.on(abiGroup, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = abiButtons.find((b) => b.dataset.abi !== ctx.abi);
      ctx.setAbi(next.dataset.abi);
      next.focus();
    });
    const grid = h("div", { class: "qt-grid" });
    const renderGrid = () => {
      syncAbi();
      if (!ctx.manifest) {
        grid.replaceChildren(h("p", { class: "qt-error" }, `${ctx.error}。请稍后刷新页面。`));
        return;
      }
      const cards = [];
      const cell = (pkg, name, desc, kind, wide) => h("article", { class: `qt-cell${wide ? " is-wide" : ""}`, "data-kind": kind },
        h("div", { class: "qt-cell-head" },
          h("span", { class: "qt-cell-kind" }, kind === "host" ? "本体" : kind === "ui" ? "界面 · 必需" : kind === "player" ? "播放器" : "运行时"),
          h("span", { class: "qt-cell-ver" }, `v${pkg.version}`)),
        h("h3", null, name),
        h("p", null, desc),
        h("div", { class: "qt-cell-foot" },
          h("button", { class: "qt-hash", type: "button", title: pkg.sha256, onclick: () => ctx.copy(pkg.sha256, "已复制 SHA-256") }, icon("copy"), `${pkg.sha256.slice(0, 8)}`),
          h("span", { class: "qt-cell-size" }, formatSize(pkg.size)),
          downloadLink(pkg, { class: "qt-get", "aria-label": `下载 ${name}` }, icon("download"))));
      cards.push(cell(ctx.host, "Koreplay 本体", "通用 APK，ARM64 和 ARM32 都适用。只有本体时以文件管理模式启动。", "host", true));
      for (const group of GROUPS) {
        for (const pkg of ctx.plugins().filter((p) => (PLUGINS[p.id]?.kind || "runtime") === group.kind)) {
          const meta = PLUGINS[pkg.id];
          cards.push(cell(pkg, meta.name, meta.desc, meta.kind, false));
        }
      }
      grid.replaceChildren(...cards);
    };

    const matrix = h("section", { class: "qt-matrix", id: "qt-matrix", "aria-labelledby": "qt-matrix-title" },
      h("div", { class: "qt-matrix-head" },
        h("div", null,
          h("h2", { id: "qt-matrix-title", class: "qt-h2" }, "组件矩阵"),
          h("p", { class: "qt-body" }, "插件按处理器架构分包。选好架构，下面就是适合你设备的安装包。")),
        h("div", { class: "qt-abi-wrap" }, abiGroup, h("p", null, ABI_HINT))),
      grid,
      h("div", { class: "qt-notes" },
        h("div", null, h("h3", null, "下载需要授权"), h("p", null, AUTH_NOTE), h("a", { href: LINKS.login, target: "_blank", rel: "noreferrer" }, "登录 GitHub")),
        h("div", null, h("h3", null, "核对文件完整性"), h("p", null, "点击卡片上的哈希可复制完整 SHA-256。下载后计算哈希值，与本页或校验文件一致即说明文件完整。"), h("a", { href: ctx.checksums, download: "SHA256SUMS" }, "下载 SHA256SUMS"))));

    const footer = h("footer", { class: "qt-footer" },
      h("p", null, DISCLAIMER),
      h("nav", { "aria-label": "页脚" },
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码"),
        h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0"),
        h("a", { href: LINKS.upstream, target: "_blank", rel: "noreferrer" }, "上游 TVBoxOS")));

    const readout = h("p", { class: "qt-readout", "aria-hidden": "true" });
    root.append(canvas, veil, nav, rail, h("main", null, h("div", { class: "qt-scenes" }, scenes), gallery({ id: "qt-screens", layout: "coverflow", variant: "quantum", title: "界面形态" }), matrix), footer, readout);

    renderGrid();
    d.add(ctx.onAbi(renderGrid));

    /* ---------- field ---------- */
    const field = createField(canvas, COUNT);
    if (!field) {
      root.classList.add("qt-no-gl");
    } else {
      d.add(() => field.destroy());
      paint();
    }

    const state = {
      seg: -1,
      mix: 0,
      time: 0,
      rotX: 0,
      rotY: 0,
      tx: 0,
      ty: 0,
      mx: 9,
      my: 9,
      tmx: 9,
      tmy: 9,
      sx: 0,
      sy: 0,
      st: 1,
      explode: 0,
      scale: 1,
      ox: 0,
      oy: 0,
      hot: null,
      fps: 60,
    };

    const scrollProgress = () => {
      const first = scenes[0].offsetTop;
      const last = scenes[scenes.length - 1];
      const span = last.offsetTop + last.offsetHeight * 0.5 - first - innerHeight * 0.5;
      return clamp((window.scrollY - first) / Math.max(1, span), 0, 1) * (shapes.length - 1);
    };

    let lastSeg = -1;
    const applySegment = (p) => {
      const seg = Math.min(shapes.length - 2, Math.floor(p));
      if (seg !== lastSeg && field) {
        field.setShapes(shapes[seg], shapes[seg + 1]);
        lastSeg = seg;
      }
      state.mix = clamp(p - seg, 0, 1);
      state.seg = seg;
    };

    const onScroll = () => {
      const p = scrollProgress();
      applySegment(p);
      const active = Math.round(p);
      progressDots.forEach((dot, i) => dot.classList.toggle("is-on", i === active));
      rail.querySelector(".qt-rail-line i").style.transform = `scaleY(${(p / (shapes.length - 1)).toFixed(3)})`;
      scenes.forEach((s, i) => s.classList.toggle("is-active", i === active));
      const mRect = matrix.getBoundingClientRect();
      state.explode = clamp(1 - mRect.top / innerHeight, 0, 1);
      veil.style.opacity = (state.explode * 0.75).toFixed(3);
      nav.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    d.on(window, "scroll", onScroll, { passive: true });
    d.on(window, "resize", () => { field?.resize(); onScroll(); });

    progressDots.forEach((dot, i) => dot.addEventListener("click", () => {
      scenes[i].scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }));

    d.on(window, "pointermove", (event) => {
      state.tmx = (event.clientX / innerWidth) * 2 - 1;
      state.tmy = -((event.clientY / innerHeight) * 2 - 1);
      state.tx = state.tmx * 0.35;
      state.ty = state.tmy * 0.2;
    }, { passive: true });
    d.on(document, "pointerleave", () => { state.tmx = 9; state.tmy = 9; });
    d.on(window, "pointerdown", (event) => {
      if (event.target.closest("a, button, input")) return;
      state.sx = (event.clientX / innerWidth) * 2 - 1;
      state.sy = -((event.clientY / innerHeight) * 2 - 1);
      state.st = 0;
    });

    const setHot = (k) => {
      if (state.hot === k) return;
      state.hot = k;
      paint(k);
      pluginKeys.forEach((key) => key.classList.toggle("is-hot", Number(key.dataset.k) === k));
    };
    pluginKeys.forEach((key) => {
      const k = Number(key.dataset.k);
      key.addEventListener("pointerenter", () => setHot(k));
      key.addEventListener("focus", () => setHot(k));
      key.addEventListener("pointerleave", () => setHot(null));
      key.addEventListener("blur", () => setHot(null));
      key.addEventListener("click", () => {
        const id = ORDER[k];
        ctx.toast(`${PLUGINS[id].name}：${PLUGINS[id].desc}`);
      });
    });

    onScroll();

    const frames = loop((time, dt) => {
      state.time = time;
      if (dt > 0) state.fps += (1 / dt - state.fps) * 0.05;
      state.mx += (state.tmx - state.mx) * 0.08;
      state.my += (state.tmy - state.my) * 0.08;
      const auto = state.seg >= 2 ? time * 0.18 : Math.sin(time * 0.15) * 0.12;
      state.rotX += (state.tx + auto - state.rotX) * 0.04;
      state.rotY += (state.ty + (state.seg === 2 ? 0.25 : state.seg === 3 ? -0.55 : 0) * state.mix - state.rotY) * 0.04;
      if (state.st < 1) state.st = Math.min(1, state.st + dt * 0.9);
      const aspect = innerWidth / innerHeight;
      const narrow = innerWidth < 900;
      // Keep the field clear of the copy: wordmark sits high, later scenes shrink a little and shift right on wide screens.
      const p = (state.seg < 0 ? 0 : state.seg) + state.mix;
      const t = clamp(p, 0, 1);
      state.scale = clamp(aspect / (narrow ? 1.75 : 2.1), 0.28, 1) * (narrow ? 1 : 1 - 0.16 * t);
      const tox = narrow ? 0 : 0.5 * aspect * t;
      const toy = narrow ? 0.42 : 0.3 * (1 - t);
      state.ox += (tox - state.ox) * 0.08;
      state.oy += (toy - state.oy) * 0.08;
      field?.draw(state);
      readout.textContent = `粒子 ${COUNT.toLocaleString()}  ·  ${Math.round(state.fps)} FPS  ·  幕 ${Math.min(4, (state.seg < 0 ? 0 : state.seg) + (state.mix > 0.5 ? 2 : 1))}/4`;
    });

    if (reduced) {
      applySegment(1);
      state.mix = 0;
      field?.draw({ ...state, mx: 9, my: 9 });
      root.classList.add("qt-reduced");
    } else {
      frames.start();
      d.on(document, "visibilitychange", () => (document.hidden ? frames.stop() : frames.start()));
      d.add(() => frames.stop());
    }

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) entry.target.classList.add("is-in");
    }, { threshold: 0.3 });
    [...scenes, matrix].forEach((el) => io.observe(el));
    d.add(() => io.disconnect());

    return () => d.run();
  },
};
