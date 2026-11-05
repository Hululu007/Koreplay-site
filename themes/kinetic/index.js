import { ABIS, ABI_HINT, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, clamp, disposer, downloadLink, formatSize, h, icon, loop } from "../kit.js";

// Disk fill / label colours. Restrained palette: one signal orange, the rest graphite to porcelain.
const COLORS = {
  ui: ["#ff4d00", "#ffffff"],
  java: ["#232323", "#f4f4f1"],
  python: ["#3f4247", "#f4f4f1"],
  node: ["#62666a", "#f4f4f1"],
  quickjs: ["#9b9d99", "#121212"],
  media3: ["#fbfbf9", "#121212"],
  ijk: ["#d3d4cf", "#121212"],
};
const ORDER = ["ui", "java", "quickjs", "python", "node", "media3", "ijk"];
const PRESET = ["ui", "java", "quickjs", "media3"];
const RACK_KEY = "koreplay.kinetic.rack";
const G = 2600;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function readRack() {
  try {
    const saved = JSON.parse(localStorage.getItem(RACK_KEY) || "null");
    if (Array.isArray(saved)) return new Set(saved.filter((id) => ORDER.includes(id)));
  } catch (_) { /* ignore */ }
  return new Set();
}
function saveRack(rack) {
  try { localStorage.setItem(RACK_KEY, JSON.stringify([...rack])); } catch (_) { /* ignore */ }
}

export default {
  mount(root, ctx) {
    const d = disposer();
    const reduced = ctx.reducedMotion;
    const host = ctx.host;
    const release = ctx.release;
    const rack = readRack();
    const pkgOf = (id) => ctx.plugins().find((pkg) => pkg.id === id);
    const available = ORDER.filter((id) => pkgOf(id));

    /* ---------------- markup ---------------- */
    const hostAnchor = (cls, ...children) => (host
      ? downloadLink(host, { class: cls }, ...children)
      : h("a", { class: `${cls} is-pending`, href: "#kn-parts", "aria-disabled": "true" }, ...children));

    const nav = h("header", { class: "kn-bar" },
      h("a", { class: "kn-brand", href: "#kn-top" },
        h("img", { src: "./assets/koreplay-app.png", alt: "", width: "26", height: "26" }),
        h("span", null, "Koreplay"),
        release && h("small", null, release.tag)),
      h("nav", { "aria-label": "主导航" },
        h("a", { href: "#kn-parts" }, "组件"),
        h("a", { href: "#kn-steps" }, "安装"),
        h("a", { href: "#kn-notes" }, "说明"),
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "GitHub")),
      hostAnchor("kn-btn kn-btn-ink kn-btn-sm", "下载本体"));

    const abiButtons = Object.entries(ABIS).map(([abi, info]) => h("button", {
      type: "button", role: "radio", "data-abi": abi, onclick: () => ctx.setAbi(abi),
    }, info.short, h("small", null, info.bits)));
    const abiGroup = h("div", { class: "kn-seg", role: "radiogroup", "aria-label": "设备架构" }, abiButtons);
    d.on(abiGroup, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = abiButtons.find((b) => b.dataset.abi !== ctx.abi);
      ctx.setAbi(next.dataset.abi);
      next.focus();
    });
    const syncAbi = () => abiButtons.forEach((b) => {
      const on = b.dataset.abi === ctx.abi;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });

    const presetButtons = h("div", { class: "kn-presets" },
      h("button", { class: "kn-chip", type: "button", onclick: () => applyPreset(PRESET) }, "常用组合"),
      h("button", { class: "kn-chip", type: "button", onclick: () => applyPreset(available) }, "全部装上"),
      h("button", { class: "kn-chip", type: "button", onclick: () => applyPreset([]) }, "清空"));

    const intro = h("div", { class: "kn-intro" },
      h("h1", { id: "kn-title" }, "把需要的插件，", h("br"), "拖进手机。"),
      h("p", { class: "kn-lead" }, "Koreplay 是 Android 手机和平板上的媒体客户端。本体保持精简，界面、运行时和播放器都是独立插件。右边每个圆片就是一个插件，面积对应它的安装包大小。"),
      h("div", { class: "kn-intro-actions" },
        hostAnchor("kn-btn kn-btn-signal", icon("download"), h("span", null, "下载本体 APK")),
        h("span", { class: "kn-intro-meta" }, host ? `v${host.version}，${formatSize(host.size)}，ARM64 和 ARM32 通用` : "暂时无法读取版本清单")),
      h("div", { class: "kn-controls" },
        h("div", null, h("p", { class: "kn-label" }, "设备架构"), abiGroup),
        h("div", null, h("p", { class: "kn-label" }, "快速装配"), presetButtons)),
      h("p", { class: "kn-hint" }, ABI_HINT));

    const canvas = h("canvas", { class: "kn-canvas", "aria-hidden": "true" });
    const phoneList = h("ul", { class: "kn-phone-list" });
    const phoneCount = h("span", { class: "kn-phone-count" });
    const phoneTotal = h("p", { class: "kn-phone-total" });
    const phoneGet = h("button", { class: "kn-phone-get", type: "button", onclick: () => downloadRack() }, icon("download"), h("span", null, "下载已装配的插件"));
    const phone = h("div", { class: "kn-phone", "aria-label": "已装配的插件" },
      h("span", { class: "kn-phone-notch", "aria-hidden": "true" }),
      h("div", { class: "kn-phone-screen" },
        h("div", { class: "kn-phone-head" },
          h("img", { src: "./assets/koreplay-app.png", alt: "", width: "28", height: "28" }),
          h("div", null, h("b", null, "Koreplay"), h("small", null, host ? `本体 ${formatSize(host.size)}` : "本体")),
          phoneCount),
        phoneList,
        h("div", { class: "kn-phone-foot" }, phoneTotal, phoneGet)));
    const status = h("p", { class: "kn-status", "aria-live": "polite" }, "拖动圆片放进手机，或者直接点一下。");
    const bench = h("div", { class: "kn-bench" }, canvas, phone, h("div", { class: "kn-drop-ring", "aria-hidden": "true" }));

    const hero = h("section", { class: "kn-hero", id: "kn-top", "aria-labelledby": "kn-title" },
      intro,
      h("div", { class: "kn-bench-wrap" }, bench, status));

    const parts = h("div", { class: "kn-parts-grid" });
    const partsSection = h("section", { class: "kn-section", id: "kn-parts", "aria-labelledby": "kn-parts-title" },
      h("header", { class: "kn-section-head" },
        h("h2", { id: "kn-parts-title" }, "组件清单"),
        h("p", null, "和上面的装配台同步。也可以在这里逐个装配、下载或复制 SHA-256。")),
      parts);

    const steps = h("section", { class: "kn-section", id: "kn-steps", "aria-labelledby": "kn-steps-title" },
      h("header", { class: "kn-section-head" },
        h("h2", { id: "kn-steps-title" }, "第一次安装"),
        h("p", null, "按顺序完成。以后本体和插件可以分别更新。")),
      h("ol", { class: "kn-steps" }, STEPS.map((step, i) => h("li", null,
        h("span", { class: "kn-step-no", "aria-hidden": "true" }, String(i + 1)),
        h("h3", null, step.title),
        h("p", null, step.text)))));

    const notes = h("section", { class: "kn-section kn-notes", id: "kn-notes", "aria-labelledby": "kn-notes-title" },
      h("h2", { id: "kn-notes-title", class: "kn-sr" }, "下载与校验说明"),
      h("div", { class: "kn-note" },
        h("h3", null, "下载需要授权"),
        h("p", null, AUTH_NOTE),
        h("a", { class: "kn-link", href: LINKS.login, target: "_blank", rel: "noreferrer" }, "登录 GitHub")),
      h("div", { class: "kn-note" },
        h("h3", null, "核对文件完整性"),
        h("p", null, "组件清单里每一项都能复制 SHA-256。下载后计算哈希值，与本页或校验文件一致，说明文件完整。"),
        h("a", { class: "kn-link", href: ctx.checksums, download: "SHA256SUMS" }, "下载 SHA256SUMS")));

    const footer = h("footer", { class: "kn-footer" },
      h("p", null, DISCLAIMER),
      h("nav", { "aria-label": "页脚" },
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码"),
        h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0"),
        h("a", { href: LINKS.upstream, target: "_blank", rel: "noreferrer" }, "上游 TVBoxOS")));

    root.append(nav, h("main", null, hero, partsSection, steps, notes), footer);

    /* ---------------- physics bench ---------------- */
    const c2d = canvas.getContext("2d");
    let W = 0;
    let H = 0;
    let dpr = 1;
    let rMax = 80;
    let phoneBox = { x: 0, y: 0, w: 0, h: 0 };
    const pointer = { x: 0, y: 0, down: false, drag: null, sx: 0, sy: 0, st: 0, moved: false };
    let hover = null;
    const maxSize = () => Math.max(...ctx.plugins().map((p) => p.size), 1);

    const disks = available.map((id) => ({
      id,
      r: 0,
      tr: 0,
      x: 0,
      y: -200,
      vx: 0,
      vy: 0,
      installed: rack.has(id),
      fly: null,
      spawned: false,
    }));
    const diskOf = (id) => disks.find((disk) => disk.id === id);

    function targetRadius(id) {
      const pkg = pkgOf(id);
      if (!pkg) return 24;
      return clamp(rMax * Math.sqrt(pkg.size / maxSize()), Math.max(20, rMax * 0.26), rMax);
    }

    // Free area for loose discs: left of the phone on wide layouts, above it when the phone docks at the bottom.
    const stacked = () => phoneBox.y > H * 0.3;
    const freeRight = () => (stacked() ? W : phoneBox.x);

    function measure() {
      const rect = bench.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      const p = phone.getBoundingClientRect();
      phoneBox = { x: p.left - rect.left, y: p.top - rect.top, w: p.width, h: p.height };
      rMax = stacked()
        ? clamp(Math.min(W, phoneBox.y) * 0.22, 34, 70)
        : clamp(Math.min(W - phoneBox.w, H) * 0.2, 46, 96);
      for (const disk of disks) {
        disk.tr = targetRadius(disk.id);
        if (!disk.r) disk.r = disk.tr;
        disk.x = clamp(disk.x, disk.r, W - disk.r);
      }
    }

    function spawn(disk, delay = 0) {
      const left = disk.tr + 8;
      const right = Math.max(left + 1, freeRight() - disk.tr - 16);
      disk.x = left + Math.random() * (right - left);
      disk.y = -disk.tr - 40 - delay * 260;
      disk.vx = (Math.random() - 0.5) * 160;
      disk.vy = 0;
      disk.installed = false;
      disk.fly = null;
      disk.spawned = true;
    }

    function restLayout() {
      // Static arrangement for reduced motion: a single packed row along the floor.
      let x = 12;
      let row = 0;
      for (const disk of disks) {
        if (disk.installed) continue;
        disk.r = disk.tr;
        if (x + disk.r * 2 > freeRight() - 12) { x = 12; row += 1; }
        disk.x = x + disk.r;
        disk.y = (stacked() ? phoneBox.y - 12 : H - 12) - disk.r - row * (rMax * 2 + 8);
        x += disk.r * 2 + 10;
        disk.vx = disk.vy = 0;
        disk.spawned = true;
      }
    }

    function install(id, animate = !reduced) {
      const disk = diskOf(id);
      if (!disk || rack.has(id)) return;
      rack.add(id);
      saveRack(rack);
      if (animate && disk.spawned && !disk.installed) {
        disk.fly = { t: 0, x: disk.x, y: disk.y, r: disk.r };
      } else {
        disk.installed = true;
      }
      syncAll(id);
    }

    function uninstall(id) {
      const disk = diskOf(id);
      if (!disk || !rack.has(id)) return;
      rack.delete(id);
      saveRack(rack);
      disk.fly = null;
      if (reduced) {
        disk.installed = false;
        restLayout();
      } else {
        spawn(disk);
      }
      syncAll();
    }

    function toggle(id) {
      if (rack.has(id)) uninstall(id);
      else install(id);
    }

    async function applyPreset(ids) {
      const want = new Set(ids);
      for (const id of available) if (rack.has(id) && !want.has(id)) uninstall(id);
      for (const id of ORDER) {
        if (want.has(id) && !rack.has(id)) {
          install(id);
          if (!reduced) await sleep(110);
        }
      }
    }

    async function downloadRack() {
      const pkgs = ORDER.filter((id) => rack.has(id)).map(pkgOf).filter(Boolean);
      if (!pkgs.length) {
        ctx.toast("手机里还没有插件");
        return;
      }
      ctx.toast(`开始下载 ${pkgs.length} 个安装包，浏览器可能会询问是否允许多个下载`);
      for (const pkg of pkgs) {
        const a = downloadLink(pkg, { hidden: true });
        document.body.append(a);
        a.click();
        a.remove();
        await sleep(450);
      }
    }

    function hit(x, y) {
      for (let i = disks.length - 1; i >= 0; i--) {
        const disk = disks[i];
        if (disk.installed || disk.fly) continue;
        if (Math.hypot(x - disk.x, y - disk.y) <= disk.r) return disk;
      }
      return null;
    }
    const insidePhone = (x, y) => x > phoneBox.x && x < phoneBox.x + phoneBox.w && y > phoneBox.y && y < phoneBox.y + phoneBox.h;

    function local(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function describe(disk) {
      if (!disk) {
        status.textContent = rack.size ? `手机里有 ${rack.size} 个插件。拖出不需要的，或者在手机屏幕上移除。` : "拖动圆片放进手机，或者直接点一下。";
        return;
      }
      const meta = PLUGINS[disk.id];
      const pkg = pkgOf(disk.id);
      status.textContent = `${meta.name}，${formatSize(pkg.size)}。${meta.desc}`;
    }

    d.on(bench, "pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(".kn-phone")) return;
      const p = local(event);
      const disk = hit(p.x, p.y);
      if (!disk) return;
      event.preventDefault();
      bench.setPointerCapture(event.pointerId);
      Object.assign(pointer, { down: true, drag: disk, x: p.x, y: p.y, sx: p.x, sy: p.y, st: performance.now(), moved: false, ox: p.x - disk.x, oy: p.y - disk.y });
      // Bring to front.
      disks.splice(disks.indexOf(disk), 1);
      disks.push(disk);
      bench.classList.add("is-dragging");
    });
    d.on(bench, "pointermove", (event) => {
      const p = local(event);
      pointer.x = p.x;
      pointer.y = p.y;
      if (pointer.drag) {
        if (Math.hypot(p.x - pointer.sx, p.y - pointer.sy) > 6) pointer.moved = true;
        bench.classList.toggle("is-over", insidePhone(p.x, p.y));
        return;
      }
      const next = hit(p.x, p.y);
      if (next !== hover) {
        hover = next;
        bench.style.cursor = hover ? "grab" : "";
        describe(hover);
      }
    });
    const endDrag = (event) => {
      const disk = pointer.drag;
      if (!disk) return;
      const p = local(event);
      const quick = performance.now() - pointer.st < 320;
      pointer.drag = null;
      pointer.down = false;
      bench.classList.remove("is-dragging", "is-over");
      if (!pointer.moved && quick) toggle(disk.id);
      else if (insidePhone(p.x, p.y)) install(disk.id);
      describe(hit(p.x, p.y));
    };
    d.on(bench, "pointerup", endDrag);
    d.on(bench, "pointercancel", endDrag);
    d.on(bench, "pointerleave", () => {
      if (!pointer.drag && hover) { hover = null; bench.style.cursor = ""; describe(null); }
    });

    function collideBox(disk) {
      const b = phoneBox;
      const cx = clamp(disk.x, b.x, b.x + b.w);
      const cy = clamp(disk.y, b.y, b.y + b.h);
      const dx = disk.x - cx;
      const dy = disk.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist >= disk.r || dist === 0) return;
      const nx = dx / dist;
      const ny = dy / dist;
      const push = disk.r - dist;
      disk.x += nx * push;
      disk.y += ny * push;
      const vn = disk.vx * nx + disk.vy * ny;
      if (vn < 0) {
        disk.vx -= 1.4 * vn * nx;
        disk.vy -= 1.4 * vn * ny;
      }
    }

    function constrain(disk) {
      const floor = stacked() ? phoneBox.y - 10 : H;
      if (disk.x - disk.r < 0) { disk.x = disk.r; disk.vx = Math.abs(disk.vx) * 0.45; }
      if (disk.x + disk.r > W) { disk.x = W - disk.r; disk.vx = -Math.abs(disk.vx) * 0.45; }
      if (disk.y + disk.r > floor) {
        disk.y = floor - disk.r;
        if (disk.vy > 0) disk.vy = -disk.vy * 0.32;
        if (Math.abs(disk.vy) < 40) disk.vy = 0;
        disk.vx *= 0.92;
      }
      if (!stacked()) collideBox(disk);
    }

    function step(dt) {
      const live = disks.filter((disk) => !disk.installed && !disk.fly && disk.spawned);
      for (const disk of disks) disk.r += (disk.tr - disk.r) * Math.min(1, dt * 10);

      for (const disk of live) {
        if (disk === pointer.drag) {
          const tx = pointer.x - pointer.ox;
          const ty = pointer.y - pointer.oy;
          disk.vx = (tx - disk.x) / Math.max(dt, 1 / 240) * 0.6;
          disk.vy = (ty - disk.y) / Math.max(dt, 1 / 240) * 0.6;
          disk.x += (tx - disk.x) * 0.6;
          disk.y += (ty - disk.y) * 0.6;
          continue;
        }
        disk.vy += G * dt;
        disk.vx *= 0.999;
        disk.x += disk.vx * dt;
        disk.y += disk.vy * dt;
        constrain(disk);
      }

      for (let iter = 0; iter < 3; iter++) {
        for (let i = 0; i < live.length; i++) {
          for (let j = i + 1; j < live.length; j++) {
            const a = live[i];
            const b = live[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 0.001;
            const overlap = a.r + b.r - dist;
            if (overlap <= 0) continue;
            const nx = dx / dist;
            const ny = dy / dist;
            const wa = a === pointer.drag ? 0 : b === pointer.drag ? 1 : 0.5;
            const wb = 1 - wa;
            a.x -= nx * overlap * wa;
            a.y -= ny * overlap * wa;
            b.x += nx * overlap * wb;
            b.y += ny * overlap * wb;
            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rv < 0) {
              const impulse = -1.3 * rv;
              a.vx -= impulse * nx * wa;
              a.vy -= impulse * ny * wa;
              b.vx += impulse * nx * wb;
              b.vy += impulse * ny * wb;
            }
          }
        }
        // Re-apply walls and the phone after each pass so neighbours can't shove a disc into the phone.
        for (const disk of live) if (disk !== pointer.drag) constrain(disk);
      }

      for (const disk of disks) {
        if (!disk.fly) continue;
        disk.fly.t += dt / 0.55;
        if (disk.fly.t >= 1) {
          disk.fly = null;
          disk.installed = true;
          phone.classList.remove("is-gulp");
          void phone.offsetWidth;
          phone.classList.add("is-gulp");
        }
      }
    }

    function drawDisk(disk, x, y, r, alpha = 1) {
      const [fill, ink] = COLORS[disk.id] || ["#444", "#fff"];
      const meta = PLUGINS[disk.id];
      const pkg = pkgOf(disk.id);
      const lifted = disk === pointer.drag || disk === hover;
      c2d.save();
      c2d.globalAlpha = alpha;
      c2d.shadowColor = "rgba(18, 18, 18, .22)";
      c2d.shadowBlur = lifted ? 28 : 14;
      c2d.shadowOffsetY = lifted ? 14 : 6;
      c2d.beginPath();
      c2d.arc(x, y, r, 0, Math.PI * 2);
      c2d.fillStyle = fill;
      c2d.fill();
      c2d.restore();

      c2d.save();
      c2d.globalAlpha = alpha;
      if (fill === "#fbfbf9" || fill === "#d3d4cf") {
        c2d.lineWidth = 1.5;
        c2d.strokeStyle = "rgba(18, 18, 18, .18)";
        c2d.beginPath();
        c2d.arc(x, y, r - 0.75, 0, Math.PI * 2);
        c2d.stroke();
      }
      // Machined inner ring.
      c2d.lineWidth = 1;
      c2d.strokeStyle = ink === "#121212" ? "rgba(18, 18, 18, .12)" : "rgba(255, 255, 255, .16)";
      c2d.beginPath();
      c2d.arc(x, y, r * 0.78, 0, Math.PI * 2);
      c2d.stroke();

      c2d.fillStyle = ink;
      c2d.textAlign = "center";
      c2d.textBaseline = "middle";
      const big = Math.max(11, r * 0.36);
      c2d.font = `700 ${big}px "HarmonyOS Sans SC", "MiSans", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`;
      const label = meta.en === "Interface" ? "界面" : meta.en;
      c2d.fillText(label, x, y - (r > 34 ? big * 0.32 : 0), r * 1.6);
      if (r > 34) {
        c2d.globalAlpha = alpha * 0.66;
        c2d.font = `500 ${Math.max(10, r * 0.2)}px "HarmonyOS Sans SC", "MiSans", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`;
        c2d.fillText(formatSize(pkg.size), x, y + big * 0.62, r * 1.6);
      }
      c2d.restore();
    }

    function draw() {
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      c2d.clearRect(0, 0, W, H);
      const target = { x: phoneBox.x + phoneBox.w / 2, y: phoneBox.y + phoneBox.h * 0.42 };
      for (const disk of disks) {
        if (disk.installed || !disk.spawned) continue;
        if (disk.fly) {
          const t = easeInOut(Math.min(1, disk.fly.t));
          const arc = Math.sin(t * Math.PI) * -80;
          const x = disk.fly.x + (target.x - disk.fly.x) * t;
          const y = disk.fly.y + (target.y - disk.fly.y) * t + arc;
          drawDisk(disk, x, y, disk.fly.r * (1 - t * 0.82), 1 - t * 0.4);
        } else {
          drawDisk(disk, disk.x, disk.y, disk === pointer.drag ? disk.r * 1.05 : disk.r);
        }
      }
    }

    /* ---------------- DOM sync ---------------- */
    function renderPhone(justAdded) {
      const ids = ORDER.filter((id) => rack.has(id) && pkgOf(id));
      phoneCount.textContent = `${ids.length} 个插件`;
      phoneList.replaceChildren(...ids.map((id) => {
        const meta = PLUGINS[id];
        const pkg = pkgOf(id);
        return h("li", { class: id === justAdded ? "is-new" : "" },
          h("span", { class: "kn-dot", style: { "--c": COLORS[id][0] }, "aria-hidden": "true" }),
          h("span", { class: "kn-phone-name" }, meta.name),
          h("span", { class: "kn-phone-size" }, formatSize(pkg.size)),
          h("button", { class: "kn-phone-x", type: "button", "aria-label": `移除 ${meta.name}`, onclick: () => uninstall(id) }, icon("close")));
      }));
      if (!ids.length) phoneList.append(h("li", { class: "kn-phone-empty" }, "把圆片拖到这里"));
      const total = ids.reduce((sum, id) => sum + pkgOf(id).size, host?.size || 0);
      phoneTotal.textContent = host ? `连同本体共 ${formatSize(total)}` : "";
      phoneGet.disabled = !ids.length;
      const hasUi = rack.has("ui");
      const hasPlayer = rack.has("media3") || rack.has("ijk");
      phone.classList.toggle("is-ready", hasUi && hasPlayer);
    }

    function renderParts() {
      if (!ctx.manifest) {
        parts.replaceChildren(h("p", { class: "kn-error" }, `${ctx.error}。请稍后刷新页面。`));
        return;
      }
      const max = maxSize();
      const card = (pkg, meta, kindLabel, color, isHost) => h("article", { class: `kn-part${isHost ? " is-host" : ""}`, "data-id": pkg.id },
        h("div", { class: "kn-part-top" },
          h("span", { class: "kn-part-swatch", style: { "--c": color, "--s": isHost ? 1 : Math.max(0.28, Math.sqrt(pkg.size / max)) }, "aria-hidden": "true" }),
          h("div", null, h("h3", null, meta.name), h("p", null, kindLabel))),
        h("p", { class: "kn-part-desc" }, meta.desc),
        h("dl", { class: "kn-part-meta" },
          h("div", null, h("dt", null, "版本"), h("dd", null, `v${pkg.version}`)),
          h("div", null, h("dt", null, "大小"), h("dd", null, formatSize(pkg.size))),
          h("div", null, h("dt", null, "架构"), h("dd", null, isHost ? "通用" : ABIS[pkg.abi].short))),
        h("div", { class: "kn-part-actions" },
          isHost
            ? h("span", { class: "kn-part-note" }, "手机本身")
            : h("button", {
              class: "kn-toggle",
              type: "button",
              "aria-pressed": String(rack.has(pkg.id)),
              onclick: () => toggle(pkg.id),
            }, h("span", { class: "kn-toggle-on" }, icon("check"), "已装配"), h("span", { class: "kn-toggle-off" }, "装进手机")),
          h("button", { class: "kn-icon-btn", type: "button", title: "复制 SHA-256", "aria-label": `复制 ${meta.name} 的 SHA-256`, onclick: () => ctx.copy(pkg.sha256, "已复制 SHA-256") }, icon("copy")),
          downloadLink(pkg, { class: "kn-icon-btn", title: "下载", "aria-label": `下载 ${meta.name}` }, icon("download"))));

      const nodes = [card(ctx.host, { name: "Koreplay 本体", desc: "通用 APK。只有本体时应用以文件管理模式启动。" }, "本体", "#121212", true)];
      for (const group of GROUPS) {
        for (const pkg of ctx.plugins().filter((p) => (PLUGINS[p.id]?.kind || "runtime") === group.kind)) {
          const meta = PLUGINS[pkg.id];
          nodes.push(card(pkg, meta, group.kind === "ui" ? "界面，必需" : group.title, COLORS[pkg.id]?.[0] || "#444", false));
        }
      }
      parts.replaceChildren(...nodes);
    }

    function syncToggles() {
      parts.querySelectorAll(".kn-toggle").forEach((button) => {
        const id = button.closest(".kn-part").dataset.id;
        button.setAttribute("aria-pressed", String(rack.has(id)));
      });
    }

    function syncAll(justAdded) {
      renderPhone(justAdded);
      syncToggles();
      describe(null);
    }

    /* ---------------- boot ---------------- */
    syncAbi();
    renderParts();
    renderPhone();
    d.add(ctx.onAbi(() => {
      syncAbi();
      for (const disk of disks) disk.tr = targetRadius(disk.id);
      renderParts();
      renderPhone();
    }));

    requestAnimationFrame(() => {
      measure();
      if (reduced) {
        restLayout();
      } else {
        disks.filter((disk) => !disk.installed).forEach((disk, i) => spawn(disk, i * 0.6));
      }
      draw();
    });

    let measuredW = 0;
    const ro = new ResizeObserver(() => {
      measure();
      // A real layout change (rotation, breakpoint) re-drops the loose discs so none stay stranded.
      const relayout = measuredW && Math.abs(W - measuredW) > 40;
      measuredW = W;
      if (reduced) restLayout();
      else if (relayout) disks.filter((disk) => !disk.installed && !disk.fly).forEach((disk, i) => spawn(disk, i * 0.25));
      draw();
    });
    ro.observe(bench);
    d.add(() => ro.disconnect());

    const frames = loop((_, dt) => {
      const sub = 3;
      for (let i = 0; i < sub; i++) step(dt / sub);
      draw();
    });
    frames.start();
    d.on(document, "visibilitychange", () => (document.hidden ? frames.stop() : frames.start()));
    d.add(() => frames.stop());

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    d.on(window, "scroll", onScroll, { passive: true });
    onScroll();

    return () => d.run();
  },
};
