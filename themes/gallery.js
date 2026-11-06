// Product screens for the site. Content and player pages are skeletons that mirror the
// app's real layout without any third-party artwork, titles or video frames; configuration
// pages are real screenshots. Each theme presents them with its own layout and variant.
import { h } from "./kit.js";

const PORTRAIT = { w: 270, h: 585 };
const LANDSCAPE = { w: 585, h: 270 };

/* ---------------------------------------------------------------- icons */

const PATHS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  cast: '<path d="M3 8V6.5A1.5 1.5 0 014.5 5h15A1.5 1.5 0 0121 6.5v11a1.5 1.5 0 01-1.5 1.5H14"/><path d="M3 11.5a7.5 7.5 0 017.5 7.5M3 15a4 4 0 014 4"/><circle cx="3.6" cy="18.4" r=".9" fill="currentColor"/>',
  pip: '<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="12" y="11.5" width="6.5" height="5" rx="1" fill="currentColor" stroke="none"/>',
  more: '<circle cx="5.5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  prev: '<path d="M6 5.5v13"/><path d="M19 6.2v11.6L9.6 12z" fill="currentColor"/>',
  next: '<path d="M18 5.5v13"/><path d="M5 6.2v11.6l9.4-5.8z" fill="currentColor"/>',
  play: '<path d="M8 5.2v13.6L19 12z" fill="currentColor"/>',
  danmaku: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 10h6M7 14h10"/>',
  fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  exitfs: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
  lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.4-4.4"/>',
  camera: '<path d="M4 8.5h3l1.8-2.5h6.4L17 8.5h3V19H4z"/><circle cx="12" cy="13.4" r="3.2"/>',
  rotate: '<path d="M4.5 11.5A7.5 7.5 0 0117.8 7M19.5 3.8v4.6h-4.6M19.5 12.5A7.5 7.5 0 016.2 17M4.5 20.2v-4.6h4.6"/>',
  episodes: '<path d="M4 6.5h16M4 12h16M4 17.5h10"/>',
  speed: '<path d="M4.6 17a8 8 0 1114.8 0"/><path d="M12 13l4.2-3.6"/>',
  aspect: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 11V9.5h3M17 13v1.5h-3"/>',
  sliders: '<path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9"/><circle cx="15" cy="7.5" r="2"/><circle cx="9" cy="16.5" r="2"/>',
  engine: '<rect x="6" y="7" width="12" height="10" rx="2"/><path d="M9 4v3M15 4v3M9 17v3M15 17v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
  heart: '<path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0112 7.8a3.9 3.9 0 017 2.3c0 5.1-7 9.4-7 9.4z"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/>',
  sort: '<path d="M8 5v14M4.5 15.5L8 19l3.5-3.5M16 19V5M12.5 8.5L16 5l3.5 3.5"/>',
  target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>',
};

function ic(name, cls = "") {
  const span = document.createElement("span");
  span.className = `gx-ic ${cls}`;
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
  return span;
}

/* ---------------------------------------------------------------- skeleton primitives */

const B = (cls, style) => h("i", { class: `gx-b ${cls || ""}`, style });
const note = (n, el) => { el.dataset.n = String(n); return el; };

function bottomNav(active) {
  const items = ["首页", "推荐", "周历", "频道", "短剧", "设置"];
  return h("div", { class: "gx-nav", "aria-hidden": "true" },
    items.map((t) => h("span", { class: t === active ? "is-on" : "" }, h("i"), t)));
}

function posterGrid(rows, cols = 3) {
  const cells = [];
  for (let i = 0; i < rows * cols; i++) {
    cells.push(h("div", { class: "gx-card" }, B("gx-poster"), B("gx-line", { width: `${60 + ((i * 17) % 30)}%` })));
  }
  return h("div", { class: "gx-grid", style: { "--cols": cols } }, cells);
}

function danmaku(count = 7) {
  const bars = [];
  for (let i = 0; i < count; i++) {
    const lane = i % 4;
    bars.push(h("i", {
      class: "gx-dm",
      style: { "--lane": lane, "--len": `${18 + ((i * 37) % 26)}%`, "--dur": `${7 + ((i * 13) % 6)}s`, "--delay": `${-((i * 2.3) % 9)}s` },
    }));
  }
  return h("div", { class: "gx-dms", "aria-hidden": "true" }, bars);
}

function scrubber(cls = "", marks = false) {
  return h("div", { class: `gx-scrub ${cls}` },
    h("i", { class: "gx-scrub-buf" }), h("i", { class: "gx-scrub-fill" }), h("i", { class: "gx-scrub-thumb" }),
    marks && h("i", { class: "gx-scrub-mark", style: { left: "6%" } }),
    marks && h("i", { class: "gx-scrub-mark", style: { left: "94%" } }));
}

/* ---------------------------------------------------------------- content screens */

function homeSkeleton() {
  return h("div", { class: "gx-screen" },
    h("div", { class: "gx-top" }, B("gx-dot"), B("gx-pill", { width: "34%" }), h("span", { class: "gx-spacer" }), B("gx-dot"), B("gx-dot"), B("gx-dot")),
    h("div", { class: "gx-tabs" }, ["电影", "剧集", "综艺", "动漫", "短剧"].map((t, i) => h("span", { class: i === 1 ? "is-on" : "" }, t))),
    [0, 1, 2].map((r) => h("div", { class: "gx-chips" }, [0, 1, 2, 3, 4, 5].map((c) => B(`gx-chip${c === 0 ? " is-on" : ""}`, { width: `${c === 0 ? 40 : 34 + ((r * 7 + c * 11) % 20)}px` })))),
    posterGrid(3),
    bottomNav("首页"));
}

function recommendSkeleton() {
  const row = (title) => h("div", { class: "gx-section" },
    h("div", { class: "gx-row-head" }, h("b", null, title), h("span", null, "更多")),
    h("div", { class: "gx-wide-row" }, [0, 1].map(() => h("div", { class: "gx-wide" },
      B("gx-poster"),
      h("div", { class: "gx-wide-meta" },
        B("gx-line", { width: "70%" }),
        B("gx-line is-thin", { width: "90%" }),
        h("div", { class: "gx-tags" }, B("gx-chip"), B("gx-chip"), B("gx-chip")))))));
  return h("div", { class: "gx-screen is-ambient" },
    h("div", { class: "gx-hero" },
      B("gx-hero-art"),
      h("div", { class: "gx-hero-meta" }, B("gx-logo"), B("gx-line is-light", { width: "56%" }), h("div", { class: "gx-dots" }, h("i", { class: "is-on" }), h("i"), h("i"), h("i")))),
    row("热播国产剧"),
    row("高分美剧"),
    bottomNav("推荐"));
}

function detailSkeleton() {
  return h("div", { class: "gx-screen is-dark" },
    h("div", { class: "gx-backdrop" }, B("gx-backdrop-art")),
    h("div", { class: "gx-detail" },
      B("gx-logo is-center"),
      h("div", { class: "gx-meta-row" }, B("gx-line is-light", { width: "40%" }), h("span", { class: "gx-tmdb" }, "TMDB"), h("b", { class: "gx-score" }, "8.6")),
      h("div", { class: "gx-actions" },
        h("span", { class: "gx-play" }, h("i", { class: "gx-play-icon" }), h("span", null, h("b", null, "播放"), h("small", null, "第 1 季 · 40 集"))),
        h("span", { class: "gx-glass" }, ic("search"), ic("episodes"), ic("target"), ic("danmaku"))),
      B("gx-line is-light", { width: "96%" }), B("gx-line is-light", { width: "88%" }), B("gx-line is-light", { width: "62%" }),
      h("div", { class: "gx-row-head is-light" }, h("b", null, "第 1 季")),
      h("div", { class: "gx-stills" }, B("gx-still"), B("gx-still")),
      h("div", { class: "gx-row-head is-light" }, h("b", null, "演职人员")),
      h("div", { class: "gx-cast" }, [0, 1, 2, 3].map(() => h("div", null, B("gx-avatar"), B("gx-line is-light", { width: "70%" }))))));
}

function followSkeleton() {
  const days = ["一", "二", "三", "今天", "五", "六", "日"];
  const entry = (pct, today) => h("div", { class: "gx-entry" },
    B("gx-thumb"),
    h("div", { class: "gx-entry-meta" },
      B("gx-line", { width: "46%" }),
      h("span", { class: "gx-entry-sub" }, today ? "第25-26集 · 18:00" : "第20-23集 · 23:59"),
      h("span", { class: "gx-entry-progress", style: { "--p": `${pct}%` } }, h("i"), `看到第01集 · ${pct}%`)));
  return h("div", { class: "gx-screen" },
    h("div", { class: "gx-week-head" }, h("b", null, "11月2日 - 11月8日"), h("span", null, "本周 · 8 部更新 · 共追更 2 部")),
    h("div", { class: "gx-week" }, days.map((d, i) => h("span", { class: i === 3 ? "is-on" : "" }, h("small", null, d), String(i + 2)))),
    h("div", { class: "gx-day-head" }, h("b", null, "今天"), h("span", null, "11月5日"), h("span", { class: "gx-spacer" }), h("span", null, "2 部更新")),
    entry(41, true),
    entry(22, false),
    h("div", { class: "gx-day-head is-muted" }, h("b", null, "周五"), h("span", null, "11月6日")),
    entry(0, false),
    bottomNav("周历"));
}

function reviewSkeleton() {
  const review = (w) => h("div", { class: "gx-review" },
    h("div", { class: "gx-review-head" }, B("gx-avatar is-sm"), B("gx-line", { width: "28%" }), h("span", { class: "gx-spacer" }), h("span", { class: "gx-stars" }, "★★★★☆")),
    B("gx-line is-bold", { width: `${w}%` }),
    B("gx-line is-thin", { width: "98%" }), B("gx-line is-thin", { width: "94%" }), B("gx-line is-thin", { width: "60%" }),
    h("span", { class: "gx-review-foot" }, "有用 128 · 回复 12"));
  return h("div", { class: "gx-screen" },
    h("div", { class: "gx-video is-flush" }, h("div", { class: "gx-scene" }), h("div", { class: "gx-center" }, h("span", { class: "gx-c-main is-sm" }, ic("play")))),
    h("div", { class: "gx-detail-tabs" }, ["简介", "剧情", "追更", "剧评", "推荐"].map((t) => h("span", { class: t === "剧评" ? "is-on" : "" }, t))),
    h("div", { class: "gx-score-card" },
      B("gx-poster is-sm"),
      h("div", null, B("gx-line", { width: "50%" }), h("b", { class: "gx-big-score" }, "8.6"), h("span", { class: "gx-entry-sub" }, "短评 51 · 剧评 12"))),
    h("div", { class: "gx-seg" }, h("span", { class: "is-on" }, "剧评"), h("span", null, "短评")),
    review(72), review(58));
}

/* ---------------------------------------------------------------- player screens (影院控件) */

function inlinePlayer() {
  const video = h("div", { class: "gx-video is-flush" },
    h("div", { class: "gx-scene" }),
    danmaku(6),
    h("div", { class: "gx-shade" }),
    h("div", { class: "gx-p-top" },
      note(1, ic("back", "is-glyph")),
      h("div", { class: "gx-p-title" }, B("gx-line is-light", { width: "62%" }), h("small", null, "1080P")),
      note(2, h("span", { class: "gx-capsule" }, ic("cast"), ic("pip"), ic("more")))),
    note(3, h("div", { class: "gx-center" }, ic("prev", "gx-c-side"), h("span", { class: "gx-c-main" }, ic("play")), ic("next", "gx-c-side"))),
    h("div", { class: "gx-p-bottom" },
      h("span", { class: "gx-time" }, "12:08"),
      note(4, scrubber()),
      h("span", { class: "gx-time is-dim" }, "-33:45"),
      note(5, ic("danmaku", "is-glyph")),
      note(6, ic("fullscreen", "is-glyph"))));
  return h("div", { class: "gx-screen" },
    video,
    h("div", { class: "gx-detail-tabs is-row" },
      ["简介", "剧情", "追更", "剧评", "推荐"].map((t, i) => h("span", { class: i === 0 ? "is-on" : "" }, t)),
      h("span", { class: "gx-spacer" }), ic("search", "is-mini"), ic("danmaku", "is-mini"), ic("heart", "is-mini")),
    h("div", { class: "gx-info" }, B("gx-poster is-md"), h("div", null, B("gx-line is-bold", { width: "60%" }), h("div", { class: "gx-tags" }, B("gx-chip"), B("gx-chip"), B("gx-chip")), B("gx-line is-thin", { width: "92%" }), B("gx-line is-thin", { width: "70%" }))),
    h("div", { class: "gx-row-head" }, h("b", null, "线路"), h("span", null, "3 条")),
    note(7, h("div", { class: "gx-lines" }, h("span", { class: "is-on" }, "线路 1"), h("span", null, "线路 2"), h("span", null, "线路 3"))),
    h("div", { class: "gx-row-head" }, h("b", null, "选集"), h("span", { class: "gx-head-icons" }, ic("grid", "is-mini"), ic("target", "is-mini"), ic("sort", "is-mini"))),
    note(8, h("div", { class: "gx-eps" }, [1, 2, 3, 4, 5, 6].map((n) => h("span", { class: n === 1 ? "is-on" : "" }, n === 1 && h("i", { class: "gx-eq" }, h("b"), h("b"), h("b")), `第${n}集`)))));
}

function fullscreenPlayer() {
  return h("div", { class: "gx-screen is-land" },
    h("div", { class: "gx-scene" }),
    danmaku(9),
    h("div", { class: "gx-shade is-full" }),
    h("div", { class: "gx-f-top" },
      note(1, h("span", { class: "gx-gcircle" }, ic("back"))),
      note(2, h("span", { class: "gx-capsule is-lg" }, ic("pip"), ic("cast"))),
      h("span", { class: "gx-spacer" }),
      note(3, h("span", { class: "gx-status-line" }, "21:41", h("i", { class: "gx-batt" }), "86%", h("span", null, "2.4MB/s"))),
      note(4, h("span", { class: "gx-capsule is-lg" }, ic("danmaku"), ic("engine"), ic("more")))),
    note(5, h("div", { class: "gx-rail is-left" }, h("span", { class: "gx-gcircle" }, ic("lock")), h("span", { class: "gx-gcircle" }, ic("search")))),
    note(6, h("div", { class: "gx-rail is-right" }, h("span", { class: "gx-gcircle" }, ic("camera")), h("span", { class: "gx-gcircle" }, ic("rotate")))),
    note(7, h("div", { class: "gx-center is-lg" }, ic("prev", "gx-c-side"), h("span", { class: "gx-c-main" }, ic("play")), ic("next", "gx-c-side"))),
    h("div", { class: "gx-f-bottom" },
      h("div", { class: "gx-f-row" },
        note(8, h("div", { class: "gx-snapshot" },
          h("div", { class: "gx-snap-head" }, B("gx-logo is-sm"), h("span", { class: "gx-avatars" }, [0, 1, 2, 3].map(() => h("i")))),
          h("small", null, "第01集  ·  1080P"))),
        h("span", { class: "gx-spacer" }),
        note(9, h("span", { class: "gx-f-actions" }, ic("episodes"), ic("speed"), ic("aspect"), ic("sliders"), ic("exitfs")))),
      note(10, scrubber("is-lg", true)),
      h("div", { class: "gx-f-times" }, h("span", null, "12:08"), h("span", null, "-33:45"))));
}

function episodePanel() {
  const chips = [];
  for (let n = 1; n <= 20; n++) {
    chips.push(h("span", { class: n === 7 ? "is-on" : n < 7 ? "is-seen" : "" }, n === 7 && h("i", { class: "gx-eq" }, h("b"), h("b"), h("b")), String(n).padStart(2, "0")));
  }
  return h("div", { class: "gx-screen is-land" },
    h("div", { class: "gx-scene" }),
    h("div", { class: "gx-shade is-full is-dim" }),
    h("div", { class: "gx-panel" },
      h("div", { class: "gx-panel-head" }, h("b", null, "选集"), h("span", null, "共 40 集"), h("span", { class: "gx-spacer" }), note(3, ic("sort", "is-mini"))),
      note(1, h("div", { class: "gx-ranges" }, h("span", { class: "is-on" }, "1-20"), h("span", null, "21-40"))),
      note(2, h("div", { class: "gx-ep-grid" }, chips))));
}

/* ---------------------------------------------------------------- catalogue */

const SCREENS = [
  { id: "home", group: "内容", label: "首页", note: "按分类与筛选浏览你自己的站源", render: homeSkeleton },
  { id: "recommend", group: "内容", label: "推荐", note: "豆瓣热播榜单，配 TMDB 字标轮播", render: recommendSkeleton },
  { id: "tmdb", group: "内容", label: "TMDB 详情", note: "沉浸背景、分集剧照与演职人员", render: detailSkeleton, dark: true },
  { id: "follow", group: "内容", label: "追更周历", note: "按周排出更新时间，记住看到哪一集", render: followSkeleton },
  { id: "review", group: "内容", label: "剧评", note: "豆瓣评分、剧评与短评", render: reviewSkeleton },
  {
    id: "player", group: "播放", label: "竖屏播放", note: "影院控件，播放器下方就是详情与选集", render: inlinePlayer,
    notes: ["返回", "投屏 · 画中画 · 更多", "上一集 · 播放 · 下一集", "进度条：按住变粗，拖动预览", "弹幕开关", "进入全屏", "线路切换", "选集，当前集带律动条"],
  },
  {
    id: "fullscreen", group: "播放", label: "横屏全屏", note: "中央大播放键，四角控件分区", render: fullscreenPlayer, landscape: true, dark: true,
    notes: ["退出全屏", "画中画 · 投屏", "时间 · 电量 · 网速", "弹幕 · 切换内核 · 更多", "锁定控件 · 弹幕搜索", "截图 · 旋转方向", "上一集 · 播放 · 下一集", "TMDB 字标与演员头像", "选集 · 倍速 · 画面 · 弹幕设置 · 退出全屏", "进度条，标出片头片尾"],
  },
  {
    id: "episodes", group: "播放", label: "选集面板", note: "全屏时从右侧滑出，不打断播放", render: episodePanel, landscape: true, dark: true,
    notes: ["按区间分段", "当前集高亮并带律动条", "正序 / 倒序"],
  },
  { id: "settings", group: "配置", label: "设置", note: "内容源、播放、个性化集中管理", src: "./assets/screens/settings.webp" },
  { id: "player-settings", group: "配置", label: "播放设置", note: "渲染方式、解码、缓冲与手势", src: "./assets/screens/player-settings.webp", tall: true },
  { id: "appearance", group: "配置", label: "主题与外观", note: "界面风格、强调色、字号与动效", src: "./assets/screens/appearance.webp", tall: true },
  { id: "danmaku", group: "配置", label: "弹幕外观", note: "配色、色池、字体与描边", src: "./assets/screens/danmaku.webp", tall: true },
];

/* ---------------------------------------------------------------- device */

function device(screen) {
  const size = screen.landscape ? LANDSCAPE : PORTRAIT;
  const content = screen.src
    ? h("div", { class: "gx-shot" }, h("img", { src: screen.src, alt: `${screen.label}界面截图`, loading: "lazy", decoding: "async" }))
    : screen.render();
  const viewport = h("div", { class: "gx-viewport" }, content);
  const dev = h("div", {
    class: `gx-device${screen.landscape ? " is-land" : ""}${screen.tall ? " is-scroll" : ""}${screen.dark ? " is-dark" : ""}`,
    "data-screen": screen.id,
  },
  !screen.landscape && h("div", { class: "gx-status", "aria-hidden": "true" }, h("span", null, "9:41"), h("span", { class: "gx-status-icons" }, h("i"), h("i"), h("i"))),
  viewport);
  const fit = h("div", { class: "gx-fit", style: { "--bw": size.w, "--bh": size.h } }, dev);
  fit.screen = screen;
  fit.viewport = viewport;
  return fit;
}

function setScale(fit, s) {
  fit.style.setProperty("--s", s.toFixed(4));
}

/** Numbered markers on the elements tagged with data-n, positioned in viewport percentages. */
function placeMarkers(fit) {
  if (!fit.screen.notes) return;
  const vp = fit.viewport;
  const vr = vp.getBoundingClientRect();
  if (!vr.width) return;
  vp.querySelectorAll(".gx-mark").forEach((m) => m.remove());
  for (const el of vp.querySelectorAll("[data-n]")) {
    const r = el.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - vr.left) / vr.width) * 100;
    const y = ((r.top - vr.top) / vr.height) * 100;
    vp.append(h("span", { class: "gx-mark", "data-mark": el.dataset.n, style: { left: `${x}%`, top: `${Math.max(1, y - 2)}%` } }, el.dataset.n));
  }
}

function legend(screen, onHover) {
  if (!screen.notes) return h("p", { class: "gx-legend-empty" }, screen.note);
  return h("ol", { class: "gx-legend" }, screen.notes.map((t, i) => h("li", {
    onpointerenter: () => onHover(i + 1),
    onpointerleave: () => onHover(0),
  }, h("b", null, String(i + 1)), h("span", null, t))));
}

function highlight(fit, n) {
  fit.viewport.querySelectorAll(".gx-mark").forEach((m) => m.classList.toggle("is-hot", m.dataset.mark === String(n)));
  fit.viewport.querySelectorAll("[data-n]").forEach((el) => el.classList.toggle("gx-is-hot", el.dataset.n === String(n)));
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------- layout: stage */

function stageLayout(root, opts) {
  const groups = [...new Set(SCREENS.map((s) => s.group))];
  const fits = SCREENS.map(device);
  const view = h("div", { class: "gx-stage-view" }, fits);
  const caption = h("div", { class: "gx-stage-caption", "aria-live": "polite" });
  const items = [];
  const list = h("div", { class: "gx-stage-list", role: "tablist", "aria-label": "界面" },
    groups.map((g) => h("div", { class: "gx-stage-group" },
      h("p", { class: "gx-stage-group-title" }, opts.groupLabel ? opts.groupLabel(g) : g),
      SCREENS.filter((s) => s.group === g).map((s) => {
        const idx = SCREENS.indexOf(s);
        const btn = h("button", { type: "button", role: "tab", class: "gx-stage-item", onclick: () => { stopAuto(); show(idx); } },
          h("b", null, opts.itemLabel ? opts.itemLabel(s, idx) : s.label),
          h("span", null, s.note));
        items[idx] = btn;
        return btn;
      }))));
  let current = -1;
  let timer = 0;

  function fitAll() {
    const r = view.getBoundingClientRect();
    if (!r.width) return;
    for (const f of fits) {
      const { w, h: hh } = f.screen.landscape ? LANDSCAPE : PORTRAIT;
      const pad = 24;
      setScale(f, Math.min((r.width - pad) / (w + 18), (r.height - pad) / (hh + 18), opts.maxScale || 1.5));
    }
  }

  function show(i) {
    if (i === current) return;
    const prev = fits[current];
    current = i;
    fits.forEach((f, k) => f.classList.toggle("is-on", k === i));
    items.forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
    // In the narrow layout the list is a horizontal tab row: keep the selected tab in view
    // without scrolling the page itself.
    if (list.scrollWidth > list.clientWidth + 1) {
      const b = items[i];
      const target = b.offsetLeft - (list.clientWidth - b.offsetWidth) / 2;
      const left = Math.max(0, Math.min(target, list.scrollWidth - list.clientWidth));
      if (prev && !reduced() && "scrollBehavior" in list.style) list.scrollTo({ left, behavior: "smooth" });
      // Smooth scrolling can stall when the page is not being painted; make sure it lands.
      setTimeout(() => { if (Math.abs(list.scrollLeft - left) > 2) list.scrollLeft = left; }, 450);
      if (!prev || reduced()) list.scrollLeft = left;
    }
    const f = fits[i];
    main.classList.toggle("is-land", !!f.screen.landscape);
    fitAll();
    if (prev && !reduced()) {
      f.classList.remove("is-entering");
      void f.offsetWidth;
      f.classList.add("is-entering");
    }
    setTimeout(() => placeMarkers(f), 60);
    caption.replaceChildren(
      h("div", { class: "gx-caption-title" }, h("b", null, f.screen.label), h("span", null, f.screen.note)),
      legend(f.screen, (n) => highlight(f, n)));
  }

  function stopAuto() { clearInterval(timer); timer = 0; }

  list.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    stopAuto();
    const next = (current + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + SCREENS.length) % SCREENS.length;
    show(next);
    items[next].focus();
  });

  const main = h("div", { class: "gx-stage-main" }, view, caption);
  root.append(h("div", { class: "gx-stage" }, list, main));
  const ro = new ResizeObserver(fitAll);
  ro.observe(view);
  show(opts.start ?? 5);
  if (opts.autoplay && !reduced()) {
    timer = setInterval(() => show((current + 1) % SCREENS.length), opts.autoplay);
    root.addEventListener("pointerenter", stopAuto, { once: true });
  }
  return () => { ro.disconnect(); stopAuto(); };
}

/* ---------------------------------------------------------------- layout: coverflow */

function coverflowLayout(root, opts) {
  const fits = SCREENS.map(device);
  const ring = h("div", { class: "gx-flow-ring" }, fits);
  const stage = h("div", { class: "gx-flow", tabindex: "0", "aria-label": "界面轮播，左右方向键或拖动切换" }, ring);
  const caption = h("div", { class: "gx-flow-caption", "aria-live": "polite" });
  const dots = h("div", { class: "gx-flow-dots" }, SCREENS.map((s, i) => h("button", { type: "button", "aria-label": s.label, onclick: () => go(i) })));
  let current = opts.start ?? 5;

  function layout() {
    const r = stage.getBoundingClientRect();
    if (!r.width) return;
    const target = r.height * 0.86;
    const widths = fits.map((f, i) => {
      const { w, h: hh } = f.screen.landscape ? LANDSCAPE : PORTRAIT;
      const focus = i === current;
      // Landscape devices are wide: centred they fill the stage, as neighbours they shrink further.
      const s = f.screen.landscape
        ? Math.min(target * (focus ? 0.72 : 0.5) / (hh + 18), r.width * (focus ? 0.66 : 0.34) / (w + 18))
        : target / (hh + 18);
      setScale(f, s);
      return (w + 18) * s;
    });
    // Neighbours sit edge to edge with a fixed overlap, measured from their real widths.
    const offset = new Array(fits.length).fill(0);
    const overlap = 0.42;
    for (let i = current + 1; i < fits.length; i++) offset[i] = offset[i - 1] + (widths[i - 1] + widths[i]) / 2 * (i === current + 1 ? 0.86 : overlap);
    for (let i = current - 1; i >= 0; i--) offset[i] = offset[i + 1] - (widths[i + 1] + widths[i]) / 2 * (i === current - 1 ? 0.86 : overlap);
    fits.forEach((f, i) => {
      const d = i - current;
      const ad = Math.abs(d);
      f.style.setProperty("--tx", `${offset[i]}px`);
      f.style.setProperty("--tz", `${-ad * 150}px`);
      f.style.setProperty("--ry", `${-Math.sign(d) * Math.min(ad, 1) * 32}deg`);
      f.style.opacity = ad > 3 ? "0" : String(1 - ad * 0.2);
      f.style.zIndex = String(100 - ad);
      f.classList.toggle("is-on", d === 0);
      f.style.pointerEvents = ad > 3 ? "none" : "";
    });
    [...dots.children].forEach((b, i) => b.classList.toggle("is-on", i === current));
  }

  function go(i) {
    current = (i + SCREENS.length) % SCREENS.length;
    layout();
    const f = fits[current];
    setTimeout(() => placeMarkers(f), 420);
    caption.replaceChildren(
      h("div", { class: "gx-caption-title" }, h("b", null, f.screen.label), h("span", null, f.screen.note)),
      legend(f.screen, (n) => highlight(f, n)));
  }

  fits.forEach((f, i) => f.addEventListener("click", () => { if (i !== current) go(i); }));
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
  });
  let drag = null;
  stage.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, moved: false }; });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 70) { go(current + (dx < 0 ? 1 : -1)); drag.x = e.clientX; drag.moved = true; }
  });
  const end = () => { drag = null; };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("pointerleave", end);

  root.append(stage, h("div", { class: "gx-flow-foot" },
    h("button", { type: "button", class: "gx-flow-arrow", "aria-label": "上一个", onclick: () => go(current - 1) }, ic("back")),
    caption,
    h("button", { type: "button", class: "gx-flow-arrow is-next", "aria-label": "下一个", onclick: () => go(current + 1) }, ic("back"))),
  dots);
  const ro = new ResizeObserver(layout);
  ro.observe(stage);
  go(current);
  return () => ro.disconnect();
}

/* ---------------------------------------------------------------- layout: film strip */

function stripLayout(root) {
  const frames = SCREENS.map((s, i) => {
    const f = device(s);
    return h("figure", { class: `gx-frame${s.landscape ? " is-land" : ""}` },
      f,
      h("figcaption", null, h("span", null, String(i + 1).padStart(2, "0")), h("b", null, s.label), h("small", null, s.note)));
  });
  const track = h("div", { class: "gx-strip-track" }, frames);
  const strip = h("div", { class: "gx-strip", tabindex: "0", "aria-label": "界面胶片，可左右滚动" }, track);
  const fitAll = () => {
    const hgt = strip.getBoundingClientRect().height - 150;
    for (const fr of frames) {
      const f = fr.firstChild;
      const { h: hh } = f.screen.landscape ? LANDSCAPE : PORTRAIT;
      setScale(f, Math.max(0.5, hgt / hh));
    }
  };
  const nudge = (dir) => strip.scrollBy({ left: dir * strip.clientWidth * 0.7, behavior: reduced() ? "auto" : "smooth" });
  root.append(strip, h("div", { class: "gx-strip-nav" },
    h("button", { type: "button", "aria-label": "向左", onclick: () => nudge(-1) }, ic("back")),
    h("button", { type: "button", class: "is-next", "aria-label": "向右", onclick: () => nudge(1) }, ic("back"))));
  const ro = new ResizeObserver(fitAll);
  ro.observe(strip);
  return () => ro.disconnect();
}

/* ---------------------------------------------------------------- entry */

/**
 * Build the screen section.
 *   layout:  "stage" | "coverflow" | "strip"
 *   variant: theme styling hook (gx--studio, gx--holo, ...)
 * Returns the section element; its `dispose` property releases observers and timers.
 */
export function gallery({ id = "screens", title = "界面一览", lead, layout = "stage", variant = "studio", ...opts } = {}) {
  const body = h("div", { class: "gx-body" });
  const section = h("section", { class: `gx gx--${variant} gx-layout-${layout}`, id, "aria-labelledby": `${id}-title` },
    h("div", { class: "gx-head" },
      h("div", null,
        h("h2", { id: `${id}-title` }, title),
        h("p", null, lead || "内容页和播放页用骨架示意真实布局，不展示任何影片海报、片名或画面；配置页是应用的真实截图。"))),
    body);
  const build = { stage: stageLayout, coverflow: coverflowLayout, strip: stripLayout }[layout] || stageLayout;
  // Wait until the section is in the document so sizes can be measured.
  queueMicrotask(() => { section.dispose = build(body, opts); });
  return section;
}
