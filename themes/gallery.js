// Product screens for the site, drawn from the current mobile app (host 1.0.3, ui 1.0.3).
// Anything that would show data — posters, titles, sources, channels, video frames — is a
// skeleton that mirrors the real layout; settings pages, which hold no data, are real
// screenshots from the latest debug build. Each theme presents the catalogue with its own
// layout ("stage" | "coverflow" | "strip") and variant.
import { h } from "./kit.js";

const PORTRAIT = { w: 270, h: 585 };
const LANDSCAPE = { w: 585, h: 270 };

/* ---------------------------------------------------------------- icons */

const PATHS = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M10 6l6 6-6 6"/>',
  down: '<path d="M7 10l5 5 5-5"/>',
  home: '<path d="M4 11l8-6.5 8 6.5V20h-5v-5.5H9V20H4z"/>',
  spark: '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  tv: '<rect x="3" y="6.5" width="18" height="12.5" rx="2.5"/><path d="M8.5 3l3.5 3.5L15.5 3"/>',
  film: '<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 3.5v17M16 3.5v17M4 9h4M4 15h4M16 9h4M16 15h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  history: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v3.7h3.7M12 8v4.3l3 1.8"/>',
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
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6.5a3.5 3.5 0 000-7h-5a3.5 3.5 0 010-7H16"/>',
  heart: '<path d="M12 19.5s-7-4.3-7-9.4A3.9 3.9 0 0112 7.8a3.9 3.9 0 017 2.3c0 5.1-7 9.4-7 9.4z"/>',
  comment: '<path d="M5 18.5V6.5A2 2 0 017 4.5h10a2 2 0 012 2v8a2 2 0 01-2 2H9z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.2"/>',
  swap: '<path d="M5 8.5h13l-3.5-3.5M19 15.5H6l3.5 3.5"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/>',
  sort: '<path d="M8 5v14M4.5 15.5L8 19l3.5-3.5M16 19V5M12.5 8.5L16 5l3.5 3.5"/>',
  target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>',
  refresh: '<path d="M19 12a7 7 0 11-2.05-4.95M19 4.5v4h-4"/>',
};

function ic(name, cls = "") {
  const span = document.createElement("span");
  span.className = `gx-ic ${cls}`;
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
  return span;
}

/* ---------------------------------------------------------------- skeleton primitives */

const B = (cls, style) => h("i", { class: `gx-b ${cls || ""}`, style });
const L = (width, cls = "") => B(`gx-line ${cls}`, { width });
const note = (n, el) => { el.dataset.n = String(n); return el; };
const screen = (cls, ...children) => h("div", { class: `gx-screen ${cls}` }, ...children);

const NAV = [["首页", "home"], ["推荐", "spark"], ["周历", "calendar"], ["频道", "tv"], ["短剧", "film"], ["设置", "gear"]];

/** Floating liquid-glass capsule with the sliding lens, as in the app's default 悬浮胶囊 navigation. */
function navBar(active, dark = false) {
  const index = Math.max(0, NAV.findIndex(([t]) => t === active));
  return h("div", { class: `gx-nav${dark ? " is-dark" : ""}`, style: { "--i": index }, "aria-hidden": "true" },
    h("i", { class: "gx-nav-lens" }),
    NAV.map(([t, icon]) => h("span", { class: t === active ? "is-on" : "" }, ic(icon), h("small", null, t))));
}

const TAGS = ["更新至 12 集", "HD", "全 24 集", "4K", "更新至 8 集", "蓝光", "全 40 集", "HD", "已完结"];

function poster(i, tag = true, cls = "") {
  return h("div", { class: `gx-card ${cls}` },
    h("div", { class: "gx-poster-box" }, B("gx-poster"), tag && h("span", { class: "gx-tag" }, TAGS[i % TAGS.length])),
    L(`${58 + ((i * 17) % 32)}%`));
}

function posterGrid(rows, cols = 3, tag = true) {
  const cells = [];
  for (let i = 0; i < rows * cols; i++) cells.push(poster(i, tag));
  return h("div", { class: "gx-grid", style: { "--cols": cols } }, cells);
}

function danmaku(count = 7) {
  const bars = [];
  for (let i = 0; i < count; i++) {
    bars.push(h("i", {
      class: "gx-dm",
      style: { "--lane": i % 4, "--len": `${18 + ((i * 37) % 26)}%`, "--dur": `${7 + ((i * 13) % 6)}s`, "--delay": `${-((i * 2.3) % 9)}s` },
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

function homeScreen() {
  const chips = (items) => h("div", { class: "gx-chips" }, items.map((t, i) => h("span", { class: i === 0 ? "is-on" : "" }, t)));
  return screen("gx-home",
    h("div", { class: "gx-top" },
      note(1, h("span", { class: "gx-site" }, B("gx-site-logo"), L("52px"), ic("down", "is-mini"))),
      h("span", { class: "gx-spacer" }),
      note(2, h("span", { class: "gx-top-icons" }, ic("search"), ic("history"), ic("heart")))),
    note(3, h("div", { class: "gx-tabs" }, ["精选", "剧集", "电影", "动漫", "综艺", "短剧"].map((t, i) => h("span", { class: i === 1 ? "is-on" : "" }, t)))),
    note(4, h("div", { class: "gx-filters" },
      chips(["全部", "剧情", "悬疑", "科幻", "爱情", "喜剧"]),
      chips(["全部", "2026", "2025", "2024", "2023", "2022"]))),
    note(5, posterGrid(3)),
    note(6, navBar("首页")));
}

/* 首页 DIY: two built-in .rfwtxt themes in their booting state.
   While the home loads for the first time the shell renders the theme itself with placeholder
   data (RfwSkeleton.kt): posters become the theme's placeholder colour breathing between 55% and
   100%, titles / category / source names become rounded bars in the text colour at 10–18%
   opacity, and year / remarks / rating are empty, so badges and info lines disappear.
   Sizes below are the themes' dp values scaled to the 270px device (×0.657). */

const T = (w, ht, cls = "") => h("i", { class: `sk-t ${cls}`, style: { width: `${w}px`, height: `${ht}px` } });
const NAMES = [53, 66, 40, 79, 53, 66, 40, 79, 66];

/** 百变Emby（默认「奶油」风格）, portrait. */
function skinEmby() {
  const card = (i) => h("div", { class: "em-card" }, h("i", { class: "em-poster sk-b" }), T(NAMES[i] * 0.6, 6));
  return [
    h("div", { class: "em-hero" },
      h("i", { class: "em-hero-art sk-b" }),
      h("i", { class: "em-hero-veil" }),
      h("div", { class: "em-hero-title" }, T(79, 13)),
      h("div", { class: "em-dots" }, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => h("i", { class: i === 0 ? "is-on" : "" })))),
    h("div", { class: "em-chrome" },
      h("span", { class: "em-pill" }, h("span", { class: "em-glyph" }, ic("grid")), T(38, 6), ic("down", "em-caret")),
      h("span", { class: "em-round" }, ic("search"))),
    h("div", { class: "em-head" }, T(26, 9), h("span", { class: "em-more" }, "全部", ic("chev"))),
    h("div", { class: "em-row" }, [0, 1, 2, 3].map(card)),
  ];
}

/** 沉浸光影, portrait. */
function skinImmersive() {
  const chip = (i) => h("span", { class: `im-chip${i === 0 ? " is-on" : ""}` }, T(i % 2 ? 24 : 16, 5));
  const tool = (icon) => h("span", { class: "im-tool" }, ic(icon));
  const card = (i) => h("div", { class: "im-card" }, h("i", { class: "im-card-art" }), h("div", { class: "im-card-name" }, T(NAMES[i] * 0.48, 5)));
  return [
    h("div", { class: "im-hero" },
      h("i", { class: "im-hero-art sk-b" }),
      h("i", { class: "im-hero-shade" }),
      h("div", { class: "im-hero-title" }, T(74, 12)),
      h("div", { class: "im-dots" }, [0, 1, 2, 3, 4, 5, 6, 7].map((i) => h("i", { class: i === 0 ? "is-on" : "" })))),
    h("div", { class: "im-cats" }, h("div", { class: "im-cats-glass" }, [0, 1, 2, 3, 4, 5].map(chip))),
    h("div", { class: "im-bar" },
      h("div", { class: "im-source" }, T(50, 8), h("small", null, T(9, 4), "部内容 · 点击站源名切换站源")),
      h("div", { class: "im-tools" }, ["swap", "search", "cast", "history", "heart", "grid", "refresh"].map(tool))),
    h("div", { class: "im-grid" }, [0, 1, 2, 3, 4, 5, 6, 7, 8].map(card)),
  ];
}

const SKINS = [
  { id: "emby", name: "百变Emby", text: "百变Emby：竖版海报主视觉，每个分类一行、预览前六部，左上角站源胶囊展开成控制面板", tone: "light", render: skinEmby },
  { id: "immersive", name: "沉浸光影", text: "沉浸光影：主视觉动态取色，吸顶的玻璃分类栏，三列海报网格", tone: "dark", render: skinImmersive },
];

function diyScreen() {
  const skins = SKINS.map((skin, k) => {
    const el = h("div", { class: `gx-skin gx-skin--${skin.id}${skin.tone === "dark" ? " is-dark" : ""}`, style: { "--k": k } },
      h("div", { class: "gx-skin-body" }, skin.render()),
      h("span", { class: "gx-skin-name" }, h("i"), `${skin.name} · 首次加载骨架`),
      navBar("首页", skin.tone === "dark"));
    return note(k + 1, el);
  });
  return screen("gx-diy", h("div", { class: "gx-skins", style: { "--n": SKINS.length } }, skins));
}

function recommendScreen() {
  const row = (title) => h("div", { class: "gx-section" },
    h("div", { class: "gx-row-head" }, h("b", null, title), h("span", null, "更多")),
    h("div", { class: "gx-wide-row" }, [0, 1].map((i) => h("div", { class: "gx-wide" },
      B("gx-poster"),
      h("div", { class: "gx-wide-meta" },
        L("70%"), L("90%", "is-thin"),
        h("div", { class: "gx-tags" }, B("gx-chip"), B("gx-chip"), B("gx-chip")))))));
  return screen("is-ambient",
    note(1, h("div", { class: "gx-hero" },
      B("gx-hero-art"),
      h("div", { class: "gx-hero-meta" }, B("gx-logo"), L("56%", "is-light"), h("div", { class: "gx-dots" }, h("i", { class: "is-on" }), h("i"), h("i"), h("i"))))),
    note(2, row("热播剧集")),
    row("高分榜单"),
    navBar("推荐"));
}

function detailScreen() {
  return screen("is-dark",
    h("div", { class: "gx-backdrop" }, B("gx-backdrop-art")),
    h("div", { class: "gx-detail" },
      note(1, B("gx-logo is-center")),
      h("div", { class: "gx-meta-row" }, L("40%", "is-light"), h("span", { class: "gx-tmdb" }, "TMDB"), h("b", { class: "gx-score" }, "8.6")),
      h("div", { class: "gx-actions" },
        note(2, h("span", { class: "gx-play" }, h("i", { class: "gx-play-icon" }), h("span", null, h("b", null, "播放"), h("small", null, "第 1 季 · 40 集")))),
        note(3, h("span", { class: "gx-glass" }, ic("search"), ic("episodes"), ic("target"), ic("danmaku")))),
      L("96%", "is-light"), L("88%", "is-light"), L("62%", "is-light"),
      h("div", { class: "gx-row-head is-light" }, h("b", null, "第 1 季")),
      note(4, h("div", { class: "gx-stills" }, B("gx-still"), B("gx-still"))),
      h("div", { class: "gx-row-head is-light" }, h("b", null, "演职人员")),
      note(5, h("div", { class: "gx-cast" }, [0, 1, 2, 3].map(() => h("div", null, B("gx-avatar"), L("70%", "is-light")))))));
}

function followScreen() {
  const days = ["一", "二", "今天", "四", "五", "六", "日"];
  const entry = (pct, today) => h("div", { class: "gx-entry" },
    B("gx-thumb"),
    h("div", { class: "gx-entry-meta" },
      L("46%"),
      h("span", { class: "gx-entry-sub" }, today ? "第25-26集 · 18:00" : "第20-23集 · 23:59"),
      h("span", { class: "gx-entry-progress", style: { "--p": `${pct}%` } }, h("i"), `看到第01集 · ${pct}%`)));
  return screen("",
    h("div", { class: "gx-week-head" }, h("b", null, "11月23日 - 11月29日"), h("span", null, "本周 · 8 部更新 · 共追更 2 部")),
    note(1, h("div", { class: "gx-week" }, days.map((d, i) => h("span", { class: i === 2 ? "is-on" : "" }, h("small", null, d), String(i + 23))))),
    h("div", { class: "gx-day-head" }, h("b", null, "今天"), h("span", null, "11月25日"), h("span", { class: "gx-spacer" }), h("span", null, "2 部更新")),
    note(2, entry(41, true)),
    entry(22, false),
    h("div", { class: "gx-day-head is-muted" }, h("b", null, "周四"), h("span", null, "11月26日")),
    entry(0, false),
    navBar("周历"));
}

function shortDramaScreen() {
  const rail = (icon, text) => h("span", null, ic(icon), h("small", null, text));
  return screen("gx-drama is-dark",
    h("div", { class: "gx-scene is-portrait" }),
    h("div", { class: "gx-shade is-drama" }),
    note(1, h("div", { class: "gx-drama-top" },
      h("span", { class: "gx-glass-chip" }, ic("swap", "is-mini"), "换源"),
      h("span", { class: "gx-drama-tabs" }, h("b", null, "推荐"), h("span", null, "剧场")),
      ic("search", "is-glyph"))),
    note(2, h("div", { class: "gx-drama-rail" }, rail("heart", "2.1万"), rail("comment", "386"), rail("episodes", "选集"), rail("info", "详情"))),
    note(3, h("div", { class: "gx-drama-meta" },
      L("46%", "is-light is-bold"),
      h("span", { class: "gx-drama-ep" }, "第3集 / 共80集"),
      L("82%", "is-light is-thin"), L("60%", "is-light is-thin"))),
    note(4, h("div", { class: "gx-drama-scrub" }, scrubber("is-thin"))),
    note(5, h("div", { class: "gx-drama-all" }, ic("episodes", "is-mini"), h("span", null, "看全集 · 全80集"), h("span", { class: "gx-spacer" }), ic("chev", "is-mini"))),
    navBar("短剧", true));
}

function liveScreen() {
  const groups = ["收藏", "央视", "卫视", "地方", "体育", "电影", "少儿"];
  const channels = [0, 1, 2, 3, 4, 5].map((i) => h("div", { class: `gx-ch${i === 1 ? " is-on" : ""}` },
    h("span", { class: "gx-ch-no" }, String(i + 1).padStart(2, "0")),
    B("gx-ch-logo"),
    h("div", { class: "gx-ch-meta" },
      L(`${46 + ((i * 19) % 30)}%`, i === 1 ? "is-accent" : ""),
      L(`${60 + ((i * 13) % 30)}%`, "is-thin"),
      h("i", { class: "gx-ch-progress", style: { "--p": `${22 + ((i * 31) % 66)}%` } })),
    h("span", { class: "gx-ch-lines" }, `${1 + (i % 3)}线`)));
  return screen("gx-live",
    note(1, h("div", { class: "gx-video is-flush" },
      h("div", { class: "gx-scene" }),
      h("div", { class: "gx-shade" }),
      h("div", { class: "gx-p-top" }, ic("back", "is-glyph"), h("div", { class: "gx-p-title" }, L("46%", "is-light")), h("span", { class: "gx-capsule" }, ic("cast"), ic("more"))),
      h("div", { class: "gx-p-bottom" },
        h("span", { class: "gx-live-badge" }, h("i"), "直播中"),
        h("span", { class: "gx-spacer" }),
        h("span", { class: "gx-live-line" }, ic("route", "is-mini"), "线路 1/3"),
        ic("fullscreen", "is-glyph")))),
    note(2, h("div", { class: "gx-detail-tabs is-row" }, ["频道", "节目单", "直播源"].map((t, i) => h("span", { class: i === 0 ? "is-on" : "" }, t)), h("span", { class: "gx-spacer" }), ic("refresh", "is-mini"))),
    h("div", { class: "gx-live-body" },
      note(3, h("div", { class: "gx-live-groups" }, groups.map((g, i) => h("span", { class: i === 1 ? "is-on" : "" }, g)))),
      note(4, h("div", { class: "gx-live-list" }, channels))));
}

/* ---------------------------------------------------------------- player screens (影院控件) */

function inlinePlayer() {
  const video = h("div", { class: "gx-video is-flush" },
    h("div", { class: "gx-scene" }),
    danmaku(6),
    h("div", { class: "gx-shade" }),
    h("div", { class: "gx-p-top" },
      note(1, ic("back", "is-glyph")),
      h("div", { class: "gx-p-title" }, L("62%", "is-light"), h("small", null, "1920×1080")),
      note(2, h("span", { class: "gx-capsule" }, ic("cast"), ic("pip"), ic("more")))),
    note(3, h("div", { class: "gx-center" }, ic("prev", "gx-c-side"), h("span", { class: "gx-c-main" }, ic("play")), ic("next", "gx-c-side"))),
    h("div", { class: "gx-p-bottom" },
      h("span", { class: "gx-time" }, "12:08"),
      note(4, scrubber()),
      h("span", { class: "gx-time is-dim" }, "-33:45"),
      note(5, ic("fullscreen", "is-glyph"))));
  return screen("",
    video,
    note(6, h("div", { class: "gx-detail-tabs is-row" },
      ["简介", "选集", "追更", "剧评", "推荐"].map((t, i) => h("span", { class: i === 0 ? "is-on" : "" }, t)),
      h("span", { class: "gx-spacer" }), ic("search", "is-mini"), ic("danmaku", "is-mini"), ic("heart", "is-mini"))),
    h("div", { class: "gx-info" }, B("gx-poster is-md"), h("div", null, L("60%", "is-bold"), h("div", { class: "gx-tags" }, B("gx-chip"), B("gx-chip"), B("gx-chip")), L("92%", "is-thin"), L("70%", "is-thin"))),
    h("div", { class: "gx-row-head" }, h("b", null, "线路"), h("span", null, "3 条")),
    note(7, h("div", { class: "gx-lines" }, h("span", { class: "is-on" }, "线路 1"), h("span", null, "线路 2"), h("span", null, "线路 3"))),
    h("div", { class: "gx-row-head" }, h("b", null, "选集"), h("span", { class: "gx-head-icons" }, ic("grid", "is-mini"), ic("target", "is-mini"), ic("sort", "is-mini"))),
    note(8, h("div", { class: "gx-eps" }, [1, 2, 3, 4, 5, 6].map((n) => h("span", { class: n === 1 ? "is-on" : "" }, n === 1 && h("i", { class: "gx-eq" }, h("b"), h("b"), h("b")), `第${n}集`)))));
}

function fullscreenPlayer() {
  return screen("is-land",
    h("div", { class: "gx-scene" }),
    danmaku(9),
    h("div", { class: "gx-shade is-full" }),
    h("div", { class: "gx-f-top" },
      note(1, h("span", { class: "gx-gcircle" }, ic("back"))),
      note(2, h("span", { class: "gx-capsule is-lg" }, ic("pip"), ic("cast"))),
      h("span", { class: "gx-spacer" }),
      note(3, h("span", { class: "gx-status-line" }, "21:41", h("i", { class: "gx-batt" }), "86%", h("span", null, "2.4MB/s"))),
      note(4, h("span", { class: "gx-capsule is-lg" }, ic("danmaku"), ic("engine"), ic("route"), ic("more")))),
    note(5, h("div", { class: "gx-rail is-left" }, h("span", { class: "gx-gcircle" }, ic("lock")), h("span", { class: "gx-gcircle" }, ic("search")))),
    note(6, h("div", { class: "gx-rail is-right" }, h("span", { class: "gx-gcircle" }, ic("camera")), h("span", { class: "gx-gcircle" }, ic("rotate")))),
    note(7, h("div", { class: "gx-center is-lg" }, ic("prev", "gx-c-side"), h("span", { class: "gx-c-main" }, ic("play")), ic("next", "gx-c-side"))),
    h("div", { class: "gx-f-bottom" },
      h("div", { class: "gx-f-row" },
        note(8, h("div", { class: "gx-snapshot" },
          h("div", { class: "gx-snap-head" }, B("gx-logo is-sm"), h("span", { class: "gx-avatars" }, [0, 1, 2, 3].map(() => h("i")))),
          h("small", null, "第01集  ·  1920×1080"))),
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
  return screen("is-land",
    h("div", { class: "gx-scene" }),
    h("div", { class: "gx-shade is-full is-dim" }),
    h("div", { class: "gx-panel" },
      h("div", { class: "gx-panel-head" }, h("b", null, "选集"), h("span", null, "共 40 集"), h("span", { class: "gx-spacer" }), note(3, ic("sort", "is-mini"))),
      note(1, h("div", { class: "gx-ranges" }, h("span", { class: "is-on" }, "1-20"), h("span", null, "21-40"))),
      note(2, h("div", { class: "gx-ep-grid" }, chips))));
}

/* ---------------------------------------------------------------- catalogue */

const SHOT = "./assets/screens/";

const SCREENS = [
  {
    id: "home", group: "内容", label: "首页", note: "按分类与筛选浏览你自己的站源", render: homeScreen, tint: "#2f45ff",
    desc: "现代界面的首页：顶栏是站源与常用入口，下面是分类、可收起的筛选和海报墙。冷启动先铺上次的首页，下拉刷新有反馈，刷新失败保留原内容。",
    notes: ["站源名，轻点切换站源", "搜索 · 播放历史 · 我的收藏", "分类", "筛选，可展开或收起", "海报墙，角标显示更新进度", "液态玻璃底栏，选中项带滑动镜片"],
  },
  {
    id: "diy", group: "内容", label: "首页 DIY", note: "整页换主题，也能自己写", render: diyScreen, fresh: true, tint: "#8b5cf6", markers: false,
    desc: "首页可以整页换成 .rfwtxt 主题，这里轮播内置的百变Emby 和沉浸光影。画面是它们首次加载时自己画的骨架屏：版式、圆角和配色都来自主题源码，海报和文字换成占位，数据到了原地换成内容。主题可按接口、站源和时段设规则，改源码实时预览。",
    notes: SKINS.map((s) => s.text),
  },
  {
    id: "recommend", group: "内容", label: "推荐", note: "热播榜单，配 TMDB 字标轮播", render: recommendScreen, tint: "#4f6ad8",
    desc: "追剧扩展插件提供的推荐页：顶部是 TMDB 横图与标题字标轮播，下面按榜单分行，点开直接进详情。",
    notes: ["TMDB 横图与标题字标轮播", "按榜单分行，横向滑动"],
  },
  {
    id: "tmdb", group: "内容", label: "TMDB 详情", note: "沉浸背景、分集剧照与演职人员", render: detailScreen, dark: true, tint: "#7b6f9a",
    desc: "开启 TMDB 集成后的详情页：背景跟随影片取色，播放键旁是找源、选集、定位和弹幕入口，下方是分季剧照与演职人员。",
    notes: ["标题字标", "播放，显示季与集数", "找源 · 选集 · 定位 · 弹幕", "分集剧照", "演职人员"],
  },
  {
    id: "follow", group: "内容", label: "追更周历", note: "按周排出更新时间，记住看到哪集", render: followScreen, tint: "#2f45ff",
    desc: "追更的剧按周排进日历：每天更新哪几集、几点更新，以及你看到了第几集、看了多少。",
    notes: ["本周日历，今天高亮", "更新集数、时间与观看进度"],
  },
  {
    id: "shortdrama", group: "内容", label: "短剧", note: "竖屏连刷，切集不断流", render: shortDramaScreen, dark: true, tint: "#e5534b",
    desc: "短剧是独立的竖屏页：上下滑动换剧，新一集没出画时上一集继续放，后面两集提前预取；右侧是互动栏，底部一键看全集。",
    notes: ["换源 · 推荐 / 剧场 · 搜索", "收藏 · 评论 · 选集 · 详情", "剧名、集数与简介", "进度条", "看全集"],
  },
  {
    id: "live", group: "内容", label: "直播", note: "频道、节目单与回看", render: liveScreen, tint: "#e5534b",
    desc: "频道页播放直播源：支持 TVBox 直播配置、m3u / txt 订阅和本地文件。分组可加密，频道显示线路数与当前节目进度，节目单可回看。",
    notes: ["直播画面：线路切换、投屏与全屏", "频道 · 节目单 · 直播源", "分组，可设密码", "频道带线路数与节目进度"],
  },
  {
    id: "player", group: "播放", label: "竖屏播放", note: "影院控件，播放器下方是详情与选集", render: inlinePlayer, tint: "#3f5a7a",
    notes: ["返回", "投屏 · 画中画 · 更多", "上一集 · 播放 · 下一集", "进度条：按住变粗，拖动预览", "进入全屏", "页签贴着播放器底边：简介、选集、追更、剧评", "线路切换", "选集，当前集带律动条"],
    desc: "影院样式的竖屏播放：控件是玻璃胶囊，中央大播放键加上下集；弹幕搜索、简介、更多设置和选集都在播放器下方的页签里。",
  },
  {
    id: "fullscreen", group: "播放", label: "横屏全屏", note: "中央大播放键，四角控件分区", render: fullscreenPlayer, landscape: true, dark: true, tint: "#3f5a7a",
    desc: "全屏后控件分到四角：左侧锁定与弹幕搜索，右侧截图与旋转，底部是选集、倍速、画面和弹幕设置。锁屏后解锁按钮自动收起，点屏幕再唤出。",
    notes: ["退出全屏", "画中画 · 投屏", "时间 · 电量 · 网速", "弹幕 · 切换内核 · 解析线路 · 更多", "锁定控件 · 弹幕搜索", "截图 · 旋转方向", "上一集 · 播放 · 下一集", "TMDB 字标与演员头像", "选集 · 倍速 · 画面 · 弹幕设置 · 退出全屏", "进度条，标出片头片尾"],
  },
  {
    id: "episodes", group: "播放", label: "选集面板", note: "全屏时从右侧滑出，不打断播放", render: episodePanel, landscape: true, dark: true, tint: "#3f5a7a",
    desc: "全屏选集从右侧滑出，按区间分段，按集名长度自适应列宽；看过的变暗，当前集带律动条。",
    notes: ["按区间分段", "当前集高亮并带律动条", "正序 / 倒序"],
  },
  {
    id: "settings", group: "配置", label: "设置", note: "内容源、播放、个性化与存储", src: `${SHOT}settings.webp`, tall: true, tint: "#2f45ff",
    desc: "设置按内容源、播放、个性化、服务与存储分组。新版加入了首页 DIY、底部导航栏和存储与缓存。",
  },
  {
    id: "appearance", group: "配置", label: "主题与外观", note: "界面风格、强调色与字号", src: `${SHOT}appearance.webp`, tall: true, tint: "#2f45ff",
    desc: "经典与现代两种界面风格，浅色、深色或跟随系统。默认强调色换成与新图标同色的钴蓝，另有 11 种预设和自定义取色。",
  },
  {
    id: "navigation", group: "配置", label: "底部导航栏", note: "外形、材质、图标与配色", src: `${SHOT}navigation.webp`, tall: true, fresh: true, tint: "#14b8a6",
    desc: "底部导航可独立自定义：七套快速套用的外形，液态玻璃、磨砂等材质，图标、选中标识和配色都能调，方案可导出分享。「更多」只在真放不下时才出现。",
  },
  {
    id: "storage", group: "配置", label: "存储与缓存", note: "各类缓存一目了然，可分开清", src: `${SHOT}storage.webp`, tall: true, fresh: true, tint: "#14b8a6",
    desc: "图片、TMDB 资料、首页快照、爬虫包、网络请求和临时文件分开统计，可以智能清理或自选清理；接口数据和壁纸受保护，不会被一键带走。",
  },
  {
    id: "player-settings", group: "配置", label: "播放设置", note: "渲染方式、解码、缓冲与手势", src: `${SHOT}player-settings.webp`, tall: true, tint: "#22c55e",
    desc: "播放器界面、渲染方式、默认内核、解码与缓冲策略，以及画中画、后台播放、自动播放和记忆进度。",
  },
  {
    id: "danmaku", group: "配置", label: "弹幕外观", note: "配色、色池、字体与特效弹幕", src: `${SHOT}danmaku.webp`, tall: true, tint: "#ec4899",
    desc: "弹幕的原色、随机色与渐变色池，字体、粗细与描边；特效弹幕和普通弹幕一起飘，六种皮肤可切换。",
  },
];

const START = SCREENS.findIndex((s) => s.id === "diy");

/* ---------------------------------------------------------------- device */

function device(screen) {
  const size = screen.landscape ? LANDSCAPE : PORTRAIT;
  const content = screen.src
    ? h("div", { class: "gx-shot" }, h("img", { src: screen.src, alt: `${screen.label}界面截图`, loading: "lazy", decoding: "async" }))
    : screen.render();
  const viewport = h("div", { class: "gx-viewport" }, content);
  const dark = screen.dark || screen.id === "player" || screen.id === "live";
  const dev = h("div", {
    class: `gx-device${screen.landscape ? " is-land" : ""}${screen.tall ? " is-scroll" : ""}${dark ? " is-dark" : ""}`,
    "data-screen": screen.id,
  },
  !screen.landscape && h("div", { class: "gx-status", "aria-hidden": "true" },
    h("span", null, "21:41"),
    h("span", { class: "gx-status-icons" }, h("i", { class: "is-signal" }), h("i", { class: "is-wifi" }), h("i", { class: "is-batt" }))),
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
  if (!fit.screen.notes || fit.screen.markers === false) return;
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
  if (!screen.notes) return null;
  return h("ol", { class: `gx-legend${screen.markers === false ? " is-plain" : ""}` }, screen.notes.map((t, i) => h("li", {
    onpointerenter: () => onHover(i + 1),
    onpointerleave: () => onHover(0),
  }, h("b", null, String(i + 1)), h("span", null, t))));
}

function highlight(fit, n) {
  fit.viewport.querySelectorAll(".gx-mark").forEach((m) => m.classList.toggle("is-hot", m.dataset.mark === String(n)));
  fit.viewport.querySelectorAll("[data-n]").forEach((el) => el.classList.toggle("gx-is-hot", el.dataset.n === String(n)));
}

const fresh = () => h("i", { class: "gx-new" }, "新");
const kind = (screen) => (screen.src ? "应用截图" : "布局示意");

function caption(screen, index, onHover, extra) {
  return [
    h("p", { class: "gx-caption-kicker" }, `${screen.group} · ${String(index + 1).padStart(2, "0")} / ${String(SCREENS.length).padStart(2, "0")}`, h("span", { class: `gx-kind${screen.src ? " is-shot" : ""}` }, kind(screen))),
    h("div", { class: "gx-caption-title" }, h("b", null, screen.label, screen.fresh && fresh()), h("span", null, screen.desc || screen.note)),
    legend(screen, onHover),
    extra,
  ];
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------- layout: stage */

function stageLayout(root, opts) {
  const groups = [...new Set(SCREENS.map((s) => s.group))];
  const fits = SCREENS.map(device);
  const view = h("div", { class: "gx-stage-view" }, h("i", { class: "gx-stage-glow", "aria-hidden": "true" }), fits);
  const captionBox = h("div", { class: "gx-stage-caption", "aria-live": "polite" });
  const items = [];
  const list = h("div", { class: "gx-stage-list", role: "tablist", "aria-label": "界面" },
    groups.map((g) => h("div", { class: "gx-stage-group" },
      h("p", { class: "gx-stage-group-title" }, opts.groupLabel ? opts.groupLabel(g) : g, h("span", null, String(SCREENS.filter((s) => s.group === g).length))),
      SCREENS.filter((s) => s.group === g).map((s) => {
        const idx = SCREENS.indexOf(s);
        const btn = h("button", { type: "button", role: "tab", class: "gx-stage-item", onclick: () => { stopAuto(); show(idx); } },
          h("b", null, opts.itemLabel ? opts.itemLabel(s, idx) : s.label, s.fresh && fresh()),
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
      const pad = 32;
      setScale(f, Math.min((r.width - pad) / (w + 18), (r.height - pad) / (hh + 18), opts.maxScale || 1.5));
    }
  }

  const step = (d) => { stopAuto(); show((current + d + SCREENS.length) % SCREENS.length); };
  const pager = () => h("div", { class: "gx-caption-nav" },
    h("button", { type: "button", class: "gx-pager", "aria-label": "上一个界面", onclick: () => step(-1) }, ic("back")),
    h("button", { type: "button", class: "gx-pager is-next", "aria-label": "下一个界面", onclick: () => step(1) }, ic("back")));

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
    view.style.setProperty("--gx-tint", f.screen.tint || "#2f45ff");
    fitAll();
    if (prev && !reduced()) {
      f.classList.remove("is-entering");
      void f.offsetWidth;
      f.classList.add("is-entering");
    }
    setTimeout(() => placeMarkers(f), 60);
    captionBox.replaceChildren(...caption(f.screen, i, (n) => highlight(f, n), pager()).filter(Boolean));
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

  const main = h("div", { class: "gx-stage-main" }, view, captionBox);
  root.append(h("div", { class: "gx-stage" }, list, main));
  const ro = new ResizeObserver(fitAll);
  ro.observe(view);
  show(opts.start ?? START);
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
  const captionBox = h("div", { class: "gx-flow-caption", "aria-live": "polite" });
  const dots = h("div", { class: "gx-flow-dots" }, SCREENS.map((s, i) => h("button", { type: "button", "aria-label": s.label, onclick: () => go(i) })));
  let current = opts.start ?? START;

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
    captionBox.replaceChildren(...caption(f.screen, current, (n) => highlight(f, n)).filter(Boolean));
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
    captionBox,
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
      h("figcaption", null, h("span", null, String(i + 1).padStart(2, "0")), h("b", null, s.label, s.fresh && fresh()), h("small", null, s.note)));
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
 *   version: optional app version shown in the section head
 * Returns the section element; its `dispose` property releases observers and timers.
 */
export function gallery({ id = "screens", title = "界面一览", lead, layout = "stage", variant = "studio", version, ...opts } = {}) {
  const body = h("div", { class: "gx-body" });
  const shots = SCREENS.filter((s) => s.src).length;
  const section = h("section", { class: `gx gx--${variant} gx-layout-${layout}`, id, "aria-labelledby": `${id}-title` },
    h("div", { class: "gx-head" },
      h("div", null,
        h("h2", { id: `${id}-title` }, title),
        h("p", null, lead || "内容页和播放页按应用的真实布局画成骨架，不出现任何影片海报、片名、站源或画面；设置页是最新版应用的真实截图。")),
      h("ul", { class: "gx-head-meta" },
        version && h("li", null, h("b", null, `v${version}`), h("span", null, "对应版本")),
        h("li", null, h("b", null, String(SCREENS.length)), h("span", null, "个界面")),
        h("li", null, h("b", null, String(shots)), h("span", null, "张应用截图")),
        h("li", { class: "is-new" }, h("b", null, String(SCREENS.filter((s) => s.fresh).length)), h("span", null, "项新功能")))),
    body);
  const build = { stage: stageLayout, coverflow: coverflowLayout, strip: stripLayout }[layout] || stageLayout;
  // Wait until the section is in the document so sizes can be measured.
  queueMicrotask(() => { section.dispose = build(body, opts); });
  return section;
}
