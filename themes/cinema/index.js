import { ABIS, ABI_HINT, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, clamp, disposer, downloadLink, formatSize, h, icon } from "../kit.js";

function grainTiles(count = 4, size = 160) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const c = canvas.getContext("2d");
  const tiles = [];
  for (let n = 0; n < count; n++) {
    const image = c.createImageData(size, size);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 26;
    }
    c.putImageData(image, 0, 0);
    tiles.push(`url(${canvas.toDataURL()})`);
  }
  return tiles;
}

function countdown(root, reduced) {
  return new Promise((resolve) => {
    if (reduced) return resolve();
    const num = h("span", { class: "cn-leader-num" }, "3");
    const overlay = h("div", { class: "cn-leader", role: "presentation" },
      h("div", { class: "cn-leader-ring" }, h("span", { class: "cn-leader-sweep" }), h("i", { class: "cn-cross-h" }), h("i", { class: "cn-cross-v" }), num),
      h("button", { class: "cn-leader-skip", type: "button" }, "跳过片头"));
    root.append(overlay);
    let n = 3;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(timer);
      overlay.classList.add("is-out");
      setTimeout(() => { overlay.remove(); }, 600);
      resolve();
    };
    const timer = setInterval(() => {
      n -= 1;
      if (n <= 0) return finish();
      num.textContent = String(n);
      overlay.querySelector(".cn-leader-sweep").style.animation = "none";
      void overlay.offsetWidth;
      overlay.querySelector(".cn-leader-sweep").style.animation = "";
    }, 700);
    overlay.addEventListener("click", finish);
    window.addEventListener("keydown", finish, { once: true });
  });
}

function frame(ctx, pkg, index) {
  const meta = PLUGINS[pkg.id] || { name: pkg.id, en: pkg.id, kind: "runtime", desc: "独立安装的插件。" };
  const kindLabel = meta.kind === "ui" ? "必需" : GROUPS.find((g) => g.kind === meta.kind)?.title || "插件";
  return h("article", { class: "cn-frame", "data-kind": meta.kind },
    h("div", { class: "cn-frame-pic" },
      h("span", { class: "cn-frame-no" }, String(index + 1).padStart(2, "0")),
      h("span", { class: "cn-frame-en" }, meta.en),
      h("span", { class: "cn-frame-kind" }, kindLabel)),
    h("div", { class: "cn-frame-body" },
      h("h3", null, meta.name),
      h("p", null, meta.desc),
      h("div", { class: "cn-frame-meta" },
        h("span", null, `v${pkg.version}`),
        h("span", null, ABIS[pkg.abi].short),
        h("span", null, formatSize(pkg.size))),
      h("div", { class: "cn-frame-actions" },
        downloadLink(pkg, { class: "cn-ticket", "aria-label": `下载 ${meta.name}（${ABIS[pkg.abi].short}）` }, icon("download"), h("span", null, "下载")),
        h("button", { class: "cn-sha", type: "button", title: `SHA-256 ${pkg.sha256}`, onclick: () => ctx.copy(pkg.sha256, "已复制 SHA-256") }, "复制 SHA-256"))));
}

export default {
  mount(root, ctx) {
    const d = disposer();
    const reduced = ctx.reducedMotion;
    const host = ctx.host;
    const release = ctx.release;

    /* grain + beam */
    const grain = h("div", { class: "cn-grain", "aria-hidden": "true" });
    const tiles = grainTiles();
    let grainIndex = 0;
    grain.style.backgroundImage = tiles[0];
    if (!reduced) {
      const grainTimer = setInterval(() => {
        grainIndex = (grainIndex + 1) % tiles.length;
        grain.style.backgroundImage = tiles[grainIndex];
        grain.style.backgroundPosition = `${(Math.random() * 160) | 0}px ${(Math.random() * 160) | 0}px`;
      }, 70);
      d.add(() => clearInterval(grainTimer));
    }

    const hostAnchor = (cls, ...children) => (host
      ? downloadLink(host, { class: cls }, ...children)
      : h("a", { class: `${cls} is-pending`, href: "#cn-reel", "aria-disabled": "true" }, ...children));

    const nav = h("header", { class: "cn-nav" },
      h("a", { class: "cn-brand", href: "#cn-top" }, "KOREPLAY", h("small", null, "出品")),
      h("nav", { "aria-label": "主导航" },
        h("a", { href: "#cn-slate" }, "本体"),
        h("a", { href: "#cn-reel" }, "插件"),
        h("a", { href: "#cn-board" }, "安装"),
        h("a", { href: "#cn-credits" }, "片尾")));

    /* hero title card */
    const hero = h("section", { class: "cn-hero", id: "cn-top", "aria-labelledby": "cn-title" },
      h("div", { class: "cn-beam", "aria-hidden": "true" }),
      h("div", { class: "cn-bars", "aria-hidden": "true" }, h("i"), h("i")),
      h("div", { class: "cn-title-card" },
        h("p", { class: "cn-present" }, "一部 Android 媒体客户端"),
        h("h1", { id: "cn-title" }, h("span", { class: "cn-title-en" }, "Koreplay"), h("span", { class: "cn-title-zh" }, "一个本体，按需装配")),
        h("p", { class: "cn-tagline" }, "界面、运行时和播放器都是独立插件。只装你需要的，各自更新。"),
        h("div", { class: "cn-hero-actions" },
          hostAnchor("cn-btn cn-btn-red", icon("play"), h("span", null, "下载本体")),
          h("a", { class: "cn-btn cn-btn-line", href: "#cn-reel" }, "看插件片单")),
        h("p", { class: "cn-rating" },
          h("span", { class: "cn-rating-box" }, "通用"),
          host ? `v${host.version} · ${formatSize(host.size)} · ARM64 / ARM32` : "版本清单暂不可用")),
      h("p", { class: "cn-scroll-cue", "aria-hidden": "true" }, "向下滚动开始放映"));

    /* clapperboard */
    const fields = [
      ["片名", "Koreplay 本体"],
      ["版本", host ? `v${host.version}` : "—"],
      ["场次", release?.tag || "—"],
      ["日期", release?.date || "—"],
      ["大小", host ? formatSize(host.size) : "—"],
      ["架构", "通用"],
    ];
    const clapper = h("div", { class: "cn-clapper" },
      h("div", { class: "cn-clap-top", "aria-hidden": "true" }),
      h("div", { class: "cn-clap-base", "aria-hidden": "true" }),
      h("dl", { class: "cn-slate-grid" }, fields.map(([k, v]) => h("div", null, h("dt", null, k), h("dd", null, v)))));
    const slate = h("section", { class: "cn-section cn-slate", id: "cn-slate", "aria-labelledby": "cn-slate-title" },
      h("div", { class: "cn-slate-copy" },
        h("h2", { id: "cn-slate-title" }, "第一场：本体"),
        h("p", null, "一个 APK 适配所有 ARM 设备。只有本体时，应用以轻量文件管理界面启动；装上界面插件，正片开始。"),
        host
          ? downloadLink(host, { class: "cn-btn cn-btn-red cn-clap-trigger" }, icon("download"), h("span", null, "开拍 · 下载 APK"))
          : h("p", { class: "cn-error" }, `${ctx.error}。请稍后刷新页面。`),
        host && h("button", { class: "cn-sha cn-sha-lg", type: "button", onclick: () => ctx.copy(host.sha256, "已复制 SHA-256") }, `SHA-256 ${host.sha256.slice(0, 24)}… 点击复制`)),
      clapper);

    const clap = () => {
      clapper.classList.remove("is-clap");
      void clapper.offsetWidth;
      clapper.classList.add("is-clap");
    };
    slate.querySelectorAll(".cn-clap-trigger").forEach((el) => {
      el.addEventListener("pointerenter", clap);
      el.addEventListener("click", clap);
    });
    clapper.addEventListener("click", clap);

    /* film reel */
    const abiButtons = Object.entries(ABIS).map(([abi, info]) => h("button", {
      type: "button", role: "radio", "data-abi": abi, onclick: () => ctx.setAbi(abi),
    }, info.short, h("small", null, info.bits)));
    const syncAbi = () => abiButtons.forEach((b) => {
      const on = b.dataset.abi === ctx.abi;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const abiGroup = h("div", { class: "cn-abi", role: "radiogroup", "aria-label": "设备架构" }, abiButtons);
    d.on(abiGroup, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const next = abiButtons.find((b) => b.dataset.abi !== ctx.abi);
      ctx.setAbi(next.dataset.abi);
      next.focus();
    });

    const strip = h("div", { class: "cn-strip" });
    const counter = h("span", { class: "cn-counter" }, "01");
    const reelSticky = h("div", { class: "cn-reel-sticky" },
      h("div", { class: "cn-reel-head" },
        h("div", null,
          h("h2", { id: "cn-reel-title" }, "第二场：插件片单"),
          h("p", null, ABI_HINT)),
        h("div", { class: "cn-reel-tools" }, abiGroup, h("p", { class: "cn-counter-wrap", "aria-hidden": "true" }, "第 ", counter, " 格"))),
      h("div", { class: "cn-strip-window" }, strip));
    const reel = h("section", { class: "cn-reel", id: "cn-reel", "aria-labelledby": "cn-reel-title" }, reelSticky);

    const renderStrip = () => {
      syncAbi();
      if (!ctx.manifest) {
        strip.replaceChildren(h("p", { class: "cn-error" }, `${ctx.error}。请稍后刷新页面。`));
        return;
      }
      const plugins = [];
      for (const group of GROUPS) plugins.push(...ctx.plugins().filter((pkg) => (PLUGINS[pkg.id]?.kind || "runtime") === group.kind));
      strip.replaceChildren(...plugins.map((pkg, i) => frame(ctx, pkg, i)));
      layoutReel();
    };

    let travel = 0;
    let wide = matchMedia("(min-width: 900px)").matches;
    function layoutReel() {
      wide = matchMedia("(min-width: 900px)").matches;
      if (!wide || reduced) {
        reel.style.height = "";
        strip.style.transform = "";
        reel.classList.add("is-native");
        return;
      }
      reel.classList.remove("is-native");
      travel = Math.max(0, strip.scrollWidth - strip.parentElement.clientWidth);
      reel.style.height = `${innerHeight + travel}px`;
      onScroll();
    }

    /* storyboard */
    const board = h("section", { class: "cn-section cn-board", id: "cn-board", "aria-labelledby": "cn-board-title" },
      h("h2", { id: "cn-board-title" }, "第三场：分镜"),
      h("p", { class: "cn-sub" }, "第一次安装时按顺序完成。以后本体和插件可以分别更新。"),
      h("ol", { class: "cn-panels" }, STEPS.map((step, i) => h("li", { class: "cn-panel" },
        h("div", { class: "cn-panel-shot", "aria-hidden": "true" }, h("span", null, `镜头 ${i + 1}`), h("b", null, ["APK", "UI", "+ +", "CFG"][i])),
        h("h3", null, step.title),
        h("p", null, step.text)))));

    /* credits */
    const roll = h("div", { class: "cn-roll" },
      h("p", { class: "cn-credit-role" }, "出品"), h("p", { class: "cn-credit-name" }, "Koreplay"),
      h("p", { class: "cn-credit-role" }, "版本"), h("p", { class: "cn-credit-name" }, release ? `${release.tag}` : "—"),
      h("p", { class: "cn-credit-role" }, "演员表"),
      ...Object.values(PLUGINS).map((meta) => h("p", { class: "cn-credit-pair" }, h("span", null, meta.name), h("span", null, meta.en))),
      h("p", { class: "cn-credit-role" }, "下载须知"), h("p", { class: "cn-credit-text" }, AUTH_NOTE),
      h("p", { class: "cn-credit-role" }, "完整性校验"),
      h("p", { class: "cn-credit-text" }, "每个安装包都附带 SHA-256，可在上方点击复制，或下载校验文件比对。"),
      h("p", { class: "cn-credit-links" },
        h("a", { href: ctx.checksums, download: "SHA256SUMS" }, "SHA256SUMS"),
        h("a", { href: LINKS.login, target: "_blank", rel: "noreferrer" }, "登录 GitHub")),
      h("p", { class: "cn-credit-role" }, "特别鸣谢"), h("p", { class: "cn-credit-name is-small" }, "TVBoxOS 上游作者与贡献者"),
      h("p", { class: "cn-credit-role" }, "声明"), h("p", { class: "cn-credit-text" }, DISCLAIMER),
      h("p", { class: "cn-credit-links" },
        h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "源码"),
        h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0"),
        h("a", { href: LINKS.upstream, target: "_blank", rel: "noreferrer" }, "上游 TVBoxOS")),
      h("p", { class: "cn-fin" }, "完"));
    const credits = h("section", { class: "cn-credits", id: "cn-credits", "aria-label": "片尾字幕" }, roll);

    root.append(grain, nav, h("main", null, hero, slate, reel, board, credits));

    /* scroll-driven */
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 40);
      hero.style.setProperty("--p", clamp(y / innerHeight, 0, 1).toFixed(3));
      if (wide && !reduced) {
        const rect = reel.getBoundingClientRect();
        const p = clamp(-rect.top / Math.max(1, rect.height - innerHeight), 0, 1);
        strip.style.transform = `translate3d(${(-travel * p).toFixed(1)}px, 0, 0)`;
        const frames = strip.children.length || 1;
        counter.textContent = String(Math.min(frames, Math.floor(p * frames) + 1)).padStart(2, "0");
      }
    };
    d.on(window, "scroll", onScroll, { passive: true });
    d.on(window, "resize", layoutReel);
    d.on(strip, "scroll", () => {
      if (!reel.classList.contains("is-native")) return;
      const frames = strip.children.length || 1;
      const p = strip.scrollLeft / Math.max(1, strip.scrollWidth - strip.clientWidth);
      counter.textContent = String(Math.min(frames, Math.round(p * (frames - 1)) + 1)).padStart(2, "0");
    }, { passive: true });

    renderStrip();
    d.add(ctx.onAbi(renderStrip));

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
    }, { rootMargin: "0px 0px -15% 0px" });
    [slate, board, ...board.querySelectorAll(".cn-panel")].forEach((el) => io.observe(el));
    const creditsIo = new IntersectionObserver(([entry]) => credits.classList.toggle("is-rolling", entry.isIntersecting), { threshold: 0.05 });
    creditsIo.observe(credits);
    d.add(() => { io.disconnect(); creditsIo.disconnect(); });

    if (reduced) root.classList.add("cn-reduced");
    countdown(root, reduced || sessionStorage.getItem("koreplay.cinema.leader") === "1").then(() => {
      try { sessionStorage.setItem("koreplay.cinema.leader", "1"); } catch (_) { /* ignore */ }
      root.classList.add("is-rolling");
    });

    return () => d.run();
  },
};
