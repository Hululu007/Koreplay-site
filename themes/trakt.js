// 「追更 × Trakt」showcase, shared by every theme.
//
// The phones mirror the real 追更 extension (app-mobile/.../ext/zhuiju): the week calendar in
// portrait and landscape, the follow card, auto-marking during playback and the Trakt account
// page. Anything that would be data — posters, titles, stills — is a skeleton; copy, layout and
// behaviour follow the app. One small in-memory model backs every screen, so an episode marked on
// one screen shows up on the others, and each change is "sent" to a mock Trakt with a visible
// packet and a line in the sync log. Nothing leaves the page.
//
// Koreplay uses Trakt but is not endorsed or certified by Trakt.
import { h } from "./kit.js";

const NOTICE = "Koreplay uses Trakt but is not endorsed or certified by Trakt.";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ================================================================ icons */

const P = {
  check: '<path d="M5 12.5l4.2 4.2L19 7"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  replay: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v3.7h3.7"/>',
  sync: '<path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1"/><path d="M17.5 3.5v3.6h-3.6M6.5 20.5v-3.6h3.6"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  land: '<rect x="2.5" y="6" width="19" height="12" rx="2.4"/><path d="M9.5 6v12"/>',
  card: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8.5h8"/><path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2"/>',
  mark: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M9 12.2l2.2 2.2 4.3-4.6"/>',
  user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 19.5a7.4 7.4 0 0 1 14.4 0"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.4"/><path d="M11 18h2"/>',
  tablet: '<rect x="4.5" y="3.5" width="15" height="17" rx="2.4"/><path d="M11 17.5h2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.3 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.3-3.8-8.5S9.4 5.9 12 3.5z"/>',
  apps: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><circle cx="16.75" cy="16.75" r="3.25"/>',
  key: '<circle cx="8" cy="15" r="3.8"/><path d="M10.8 12.3L19 4.5M15.8 7.6l2.2 2.2M13.6 9.8l1.6 1.6"/>',
  shield: '<path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.2 10"/>',
  offline: '<path d="M4 4l16 16"/><path d="M9 7.6A6.5 6.5 0 0 0 6 13a4 4 0 0 0 .9 7.9h10.6M11.4 6.5a6.4 6.4 0 0 1 7 5.6 4 4 0 0 1 2.3 6.2"/>',
  bolt: '<path d="M13 3L5.5 13.5H12L11 21l7.5-10.5H12z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  layers: '<path d="M12 4l8.5 4.5L12 13 3.5 8.5z"/><path d="M3.5 12.5L12 17l8.5-4.5M3.5 16.5L12 21l8.5-4.5"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.6"/>',
  copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M15.5 8V6a2 2 0 0 0-2-2H6.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2H8"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.6" cy="6.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.6" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.6" cy="17.5" r="1.1" fill="currentColor" stroke="none"/>',
  chevl: '<path d="M14.5 6l-6 6 6 6"/>',
  chevr: '<path d="M9.5 6l6 6-6 6"/>',
  chevd: '<path d="M6 9.5l6 6 6-6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  more: '<circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  cloud: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.5 18.5z"/>',
  zh: '<path d="M4 6h9M8.5 4v2c0 4.5-2 8-4.5 9.5M6 10.5c1.4 2.4 3.4 4 6 5"/><path d="M13 20l4-9 4 9M14.4 17h5.2"/>',
};

function ic(name, cls = "") {
  const span = h("span", { class: `tk-ic${cls ? ` ${cls}` : ""}`, "aria-hidden": "true" });
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${P[name] || ""}</svg>`;
  return span;
}
const sk = (width, cls = "") => h("i", { class: `tk-sk${cls ? ` ${cls}` : ""}`, style: { width } });
const spacer = () => h("span", { class: "tk-spacer" });

/* ================================================================ dates */

const DAY = 86400000;
const WD = ["一", "二", "三", "四", "五", "六", "日"];
const pad = (n) => String(n).padStart(2, "0");
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const weekday = (d) => (d.getDay() + 6) % 7;
const mondayOf = (d) => addDays(startOfDay(d), -weekday(d));
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const md = (d) => `${d.getMonth() + 1}月${d.getDate()}日`;
const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayDiff = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / DAY);

/** 「今晚 20:00」「明早 9:00」「周四 20:00」: the app writes local times this way. */
function airPhrase(today, date) {
  const diff = dayDiff(date, today);
  const hour = date.getHours();
  const time = `${hour}:${pad(date.getMinutes())}`;
  const part = hour < 11 ? "早" : hour < 18 ? "天" : "晚";
  if (diff === 0) return `今${part} ${time}`;
  if (diff === 1) return `明${part} ${time}`;
  if (diff === -1) return `昨${part} ${time}`;
  if (diff > 1 && diff < 7) return `周${WD[weekday(date)]} ${time}`;
  return `${md(date)} ${time}`;
}

function relDay(today, date) {
  const diff = dayDiff(date, today);
  const w = `周${WD[weekday(date)]}`;
  if (diff === 0) return `今天 · ${w}`;
  if (diff === 1) return `明天 · ${w}`;
  if (diff === -1) return `昨天 · ${w}`;
  return w;
}

/* ================================================================ demo model */

// Six followed shows, each airing on a weekday. `ep` is the episode that airs this week; `per`
// how many drop at once; `behind` how many of the latest aired episodes are still unwatched.
const SHOWS = [
  { id: "a", wd: 3, time: "20:00", season: 2, ep: 7, per: 1, last: 16, prior: 12, behind: 1, hue: 226, multi: true },
  { id: "b", wd: 1, time: "21:30", season: 4, ep: 3, per: 1, last: 10, prior: 30, behind: 1, hue: 276, multi: true },
  { id: "c", wd: 4, time: "12:00", season: 1, ep: 25, per: 2, last: 40, prior: 0, behind: 0, hue: 158 },
  { id: "d", wd: 6, time: "09:00", season: 1, ep: 9, per: 1, last: 12, prior: 0, behind: 0, hue: 28 },
  { id: "e", wd: 4, time: "22:00", season: 3, ep: 10, per: 1, last: 10, prior: 20, behind: 0, hue: 342, multi: true },
  { id: "f", wd: 5, time: "19:30", season: 5, ep: 1, per: 1, last: 8, prior: 36, behind: 0, hue: 196, multi: true },
];

function createModel() {
  const now = new Date();
  const today = startOfDay(now);
  const monday = mondayOf(now);
  const shows = SHOWS.map((s) => ({ ...s, following: true }));
  const byId = Object.fromEntries(shows.map((s) => [s.id, s]));
  const watched = new Set();
  const s1 = new Set(Array.from({ length: 12 }, (_, i) => i + 1)); // show a, season 1
  const listeners = new Set();
  const key = (s, e) => `${s.id}:${e}`;
  const eps = (s) => Array.from({ length: s.last }, (_, i) => i + 1);

  const airAt = (s, e) => {
    const d = addDays(monday, Math.floor((e - s.ep) / s.per) * 7 + s.wd);
    const [hh, mm] = s.time.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    return d;
  };
  const aired = (s, e) => airAt(s, e) <= now;
  const isWatched = (s, e) => watched.has(key(s, e));

  for (const s of shows) {
    const past = eps(s).filter((e) => aired(s, e));
    past.forEach((e) => watched.add(key(s, e)));
    past.slice(past.length - s.behind).forEach((e) => watched.delete(key(s, e)));
  }

  const notify = () => [...listeners].forEach((fn) => fn());
  const prior = (s) => (s.id === "a" ? s1.size : s.prior);

  const model = {
    now, today, monday, shows, byId, s1, airAt, aired, isWatched, prior,
    following: () => shows.filter((s) => s.following),
    code: (s, e) => (s.multi ? `S${s.season} · E${e}` : `E${e}`),
    longCode: (s, e) => (s.multi ? `第 ${s.season} 季第 ${e} 集` : `第 ${e} 集`),
    progress(s) {
      const list = eps(s);
      return { done: prior(s) + list.filter((e) => isWatched(s, e)).length, aired: s.prior + list.filter((e) => aired(s, e)).length };
    },
    latestAired: (s) => eps(s).filter((e) => aired(s, e)).pop() ?? null,
    nextUnwatched: (s) => eps(s).find((e) => aired(s, e) && !isWatched(s, e)) ?? null,
    nextAir: (s) => eps(s).find((e) => !aired(s, e)) ?? null,
    upcoming: (s, n = 4) => eps(s).filter((e) => !aired(s, e)).slice(0, n),
    onDate(date) {
      const out = [];
      for (const s of shows) {
        if (!s.following || weekday(date) !== s.wd) continue;
        const week = Math.round((mondayOf(date) - monday) / (7 * DAY));
        const start = s.ep + week * s.per;
        const list = [];
        for (let i = 0; i < s.per; i++) if (start + i >= 1 && start + i <= s.last) list.push(start + i);
        if (list.length) out.push({ show: s, eps: list });
      }
      return out.sort((x, y) => x.show.time.localeCompare(y.show.time));
    },
    nextUpdate(from) {
      for (let i = 1; i < 70; i++) {
        const d = addDays(from, i);
        const items = model.onDate(d);
        if (items.length) return { date: d, item: items[0] };
      }
      return null;
    },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    set(s, e, value) {
      const k = key(s, e);
      if (value === watched.has(k)) return false;
      if (value) watched.add(k); else watched.delete(k);
      notify();
      return true;
    },
    upTo(s, e) {
      let n = 0;
      for (let i = 1; i <= e; i++) if (aired(s, i) && !watched.has(key(s, i))) { watched.add(key(s, i)); n++; }
      if (n) notify();
      return n;
    },
    setS1(e, value) {
      if (value === s1.has(e)) return false;
      if (value) s1.add(e); else s1.delete(e);
      notify();
      return true;
    },
    follow(s, value) {
      if (s.following === value) return false;
      s.following = value;
      notify();
      return true;
    },
  };
  return model;
}

/* ================================================================ sync bus */

/** Mock Trakt account: packets fly between a phone and the cloud pill, the log records each call. */
function createSync(layer) {
  const list = h("ol", { class: "tk-log-list" });
  const state = h("small", null, "已连接");
  const pill = h("span", { class: "tk-cloud", title: "演示用的 Trakt 账号，不会联网" },
    h("i", { class: "tk-cloud-orb" }, ic("sync")), h("span", null, h("b", null, "Trakt"), state));
  const chips = new Set();
  let connected = true;
  let busy = 0;

  const clock = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };

  function log(dir, text, code = "完成") {
    const tone = code === "完成" ? "ok" : code === "本机" || code === "跳过" ? "dim" : "info";
    list.prepend(h("li", { class: `is-${tone}` }, h("time", null, clock()), h("b", null, dir), h("span", null, text), h("em", null, code)));
    while (list.children.length > 7) list.lastElementChild.remove();
  }

  function paint(text, tone) {
    for (const chip of chips) {
      if (!chip.isConnected) { chips.delete(chip); continue; }
      chip.dataset.state = tone;
      chip.lastChild.textContent = text;
    }
  }
  const idle = () => paint(connected ? "已同步" : "仅本机", connected ? "ok" : "local");

  function fly(from, to) {
    if (reduced() || !from?.isConnected || !to?.isConnected) return;
    const base = layer.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const x0 = a.left + a.width / 2 - base.left;
    const y0 = a.top + a.height / 2 - base.top;
    const x1 = b.left + b.width / 2 - base.left;
    const y1 = b.top + b.height / 2 - base.top;
    const mx = (x0 + x1) / 2 + (y1 - y0) * 0.18;
    const my = Math.min(y0, y1) - Math.max(60, Math.abs(x1 - x0) * 0.22);
    for (let i = 0; i < 3; i++) {
      const dot = h("i", { class: `tk-packet${i ? " is-trail" : ""}`, style: { "--k": i } });
      layer.append(dot);
      const run = dot.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(${1 - i * 0.25})`, opacity: 0 },
        { transform: `translate(${mx}px, ${my}px) scale(${1.25 - i * 0.3})`, opacity: 1 - i * 0.3, offset: 0.5 },
        { transform: `translate(${x1}px, ${y1}px) scale(.4)`, opacity: 0 },
      ], { duration: 640, delay: i * 50, easing: "cubic-bezier(.5, 0, .2, 1)" });
      const done = () => dot.remove();
      run.finished.then(done, done);
      setTimeout(done, 1100);
    }
  }

  function hit() {
    pill.classList.remove("is-hit");
    void pill.offsetWidth;
    pill.classList.add("is-hit");
  }

  function send(dir, text, from, code, inbound) {
    if (!connected) {
      log("○ 本机", `${text}（还没连接 Trakt，先记在本机）`, "本机");
      return;
    }
    busy++;
    paint("同步中", "busy");
    if (inbound) fly(pill, from); else fly(from, pill);
    setTimeout(() => {
      log(dir, text, code);
      hit();
      if (--busy <= 0) { busy = 0; idle(); }
    }, reduced() ? 0 : 600);
  }

  log("↓ 更新", "本月和接下来两个月的排期", "完成");
  log("↓ 更新", "待看列表", "完成");

  return {
    list,
    pill,
    log,
    chip() {
      const chip = h("span", { class: "tk-state", "data-state": connected ? "ok" : "local" }, h("i"), h("span", null, connected ? "已同步" : "仅本机"));
      chips.add(chip);
      return chip;
    },
    push: (text, from, code = "完成") => send("↑ 上传", text, from, code, false),
    pull: (text, to, code = "完成") => send("↓ 更新", text, to, code, true),
    get connected() { return connected; },
    setConnected(value) {
      connected = value;
      state.textContent = value ? "已连接" : "未连接";
      pill.classList.toggle("is-off", !value);
      idle();
    },
  };
}

/* ================================================================ shared phone bits */

const poster = (hue, cls = "") => h("i", { class: `tk-poster tk-shine${cls ? ` ${cls}` : ""}`, style: { "--hue": hue } });

function progressBar(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return h("i", { class: "tk-bar", style: { "--p": `${pct}%` } });
}

/* ---------------------------------------------------------------- week calendar */

function monthCard(env, landscape) {
  const { model } = env;
  const st = env.week;
  const sel = st.sel;
  const collapsed = !landscape && !st.open;
  const first = new Date(sel.getFullYear(), sel.getMonth(), 1);
  const last = new Date(sel.getFullYear(), sel.getMonth() + 1, 0);
  const gridStart = addDays(first, -weekday(first));
  const weeks = Math.ceil((weekday(first) + last.getDate()) / 7);
  const selWeek = mondayOf(sel);

  let monthEps = 0;
  for (let d = 1; d <= last.getDate(); d++) {
    for (const it of model.onDate(new Date(sel.getFullYear(), sel.getMonth(), d))) monthEps += it.eps.length;
  }

  const cell = (d) => {
    const items = model.onDate(d);
    const count = items.reduce((n, it) => n + it.eps.length, 0);
    const seen = count > 0 && items.every((it) => it.eps.every((e) => model.isWatched(it.show, e)));
    const cls = ["tk-cal-day", count ? "has" : "", seen ? "is-seen" : "", sameDay(d, model.today) ? "is-today" : "",
      sameDay(d, sel) ? "is-sel" : "", d.getMonth() !== sel.getMonth() ? "is-out" : ""].filter(Boolean).join(" ");
    return h("button", { type: "button", class: cls, "aria-label": `${md(d)}${count ? `，${count} 集更新` : ""}`, onclick: () => { st.sel = d; env.refresh(); } },
      h("b", null, String(d.getDate())),
      count ? h("small", null, seen ? ic("check") : `${count}集`) : h("small", { class: "is-empty" }));
  };

  const rows = [];
  for (let w = 0; w < weeks; w++) {
    const start = addDays(gridStart, w * 7);
    if (collapsed && !sameDay(start, selWeek)) continue;
    rows.push(h("div", { class: "tk-cal-row" }, WD.map((_, i) => cell(addDays(start, i)))));
  }
  if (collapsed && !rows.length) {
    rows.push(h("div", { class: "tk-cal-row" }, WD.map((_, i) => cell(addDays(selWeek, i)))));
  }

  const shift = (dir) => {
    if (collapsed) st.sel = addDays(sel, dir * 7);
    else {
      const target = new Date(sel.getFullYear(), sel.getMonth() + dir, 1);
      st.sel = target.getMonth() === model.today.getMonth() && target.getFullYear() === model.today.getFullYear() ? model.today : target;
    }
    env.refresh();
  };

  return h("div", { class: `tk-cal${collapsed ? " is-collapsed" : ""}` },
    h("div", { class: "tk-cal-head" },
      h("button", { type: "button", class: "tk-cal-nav", "aria-label": collapsed ? "上一周" : "上个月", onclick: () => shift(-1) }, ic("chevl")),
      h("b", null, `${sel.getFullYear()}年${sel.getMonth() + 1}月`),
      h("span", null, `本月 ${monthEps} 集`),
      spacer(),
      h("button", { type: "button", class: "tk-cal-nav", "aria-label": collapsed ? "下一周" : "下个月", onclick: () => shift(1) }, ic("chevr"))),
    h("div", { class: "tk-cal-wd" }, WD.map((w) => h("span", null, w))),
    h("div", { class: "tk-cal-rows" }, rows),
    landscape ? null : h("button", { type: "button", class: "tk-cal-handle", onclick: () => { st.open = !st.open; env.refresh(); } },
      h("i"), h("span", null, st.open ? "收起月历" : "展开月历")));
}

function epPill(env, s, e) {
  const m = env.model;
  const seen = m.isWatched(s, e);
  const ok = m.aired(s, e);
  return h("button", {
    type: "button",
    class: `tk-ep${seen ? " is-seen" : ""}${ok ? "" : " is-future"}`,
    title: ok ? (seen ? "取消已看" : "标记已看") : "还没播出",
    onclick: (event) => {
      if (!ok) { env.toast(`第 ${e} 集还没播出`); return; }
      env.sync.push(seen ? `已取消看过 ${m.code(s, e)}` : `已标记看过 ${m.code(s, e)}`, event.currentTarget);
      m.set(s, e, !seen);
    },
  }, seen ? ic("check") : h("i", { class: "tk-ep-ring" }), m.code(s, e));
}

function updateCard(env, item) {
  const m = env.model;
  const { show: s, eps } = item;
  const at = m.airAt(s, eps[0]);
  const tag = eps[0] === 1 ? (s.season > 1 ? "新季" : "首播") : eps.includes(s.last) ? "季终" : sameDay(at, m.today) ? "新" : null;
  const p = m.progress(s);
  return h("article", { class: "tk-up", style: { "--hue": s.hue } },
    poster(s.hue),
    h("div", { class: "tk-up-body" },
      h("div", { class: "tk-up-title" }, sk(`${46 + (s.hue % 34)}%`, "is-title"), tag ? h("span", { class: `tk-tag${tag === "季终" ? " is-end" : ""}` }, tag) : null),
      h("div", { class: "tk-up-sub" }, h("i", { class: "tk-net" }), sk("40%", "is-thin")),
      h("div", { class: "tk-up-eps" }, eps.map((e) => epPill(env, s, e)), h("span", { class: "tk-up-time" }, hm(at))),
      h("div", { class: "tk-up-prog" }, progressBar(p.done, p.aired), h("span", null, `已看 ${p.done}/${p.aired}`))));
}

function behindList(env) {
  const m = env.model;
  const rows = m.following().filter((s) => m.nextUnwatched(s) != null);
  if (!rows.length) return null;
  return h("div", { class: "tk-behind" },
    h("div", { class: "tk-sec-head" }, h("b", null, "还没看"), h("span", null, `${rows.length} 部`)),
    rows.map((s) => {
      const e = m.nextUnwatched(s);
      const p = m.progress(s);
      return h("div", { class: "tk-behind-row", style: { "--hue": s.hue } },
        poster(s.hue, "is-sm"),
        h("div", { class: "tk-behind-meta" },
          sk(`${44 + (s.hue % 30)}%`, "is-title"),
          h("span", null, `下一集 ${m.code(s, e)} · 已播出`),
          h("div", { class: "tk-up-prog" }, progressBar(p.done, p.aired), h("span", null, `${p.done}/${p.aired}`))),
        h("div", { class: "tk-behind-act" },
          h("button", { type: "button", class: "tk-mini", onclick: (event) => { env.sync.push(`已标记看过 ${m.code(s, e)}`, event.currentTarget); m.set(s, e, true); } }, ic("check"), "标记看过"),
          h("button", { type: "button", class: "tk-mini is-solid", onclick: () => env.goto("play") }, ic("play"), "接着看")));
    }));
}

function dayList(env) {
  const m = env.model;
  const sel = env.week.sel;
  const items = m.onDate(sel);
  const total = items.reduce((n, it) => n + it.eps.length, 0);
  const head = h("div", { class: "tk-day" },
    h("b", null, md(sel)), h("span", null, relDay(m.today, sel)), spacer(),
    h("span", { class: "tk-day-count" }, items.length ? `${items.length} 部 · ${total} 集` : ""));
  let body;
  if (items.length) body = items.map((it) => updateCard(env, it));
  else {
    const next = m.nextUpdate(sel);
    body = h("button", { type: "button", class: "tk-empty", onclick: () => { if (next) { env.week.sel = next.date; env.refresh(); } } },
      h("b", null, "这天没有更新"),
      next ? h("span", null, `下次更新：${md(next.date)} · ${m.code(next.item.show, next.item.eps[0])}`, ic("chevr")) : null);
  }
  return [head, body];
}

function weekTop(env) {
  return h("div", { class: "tk-w-top" },
    h("b", { class: "tk-w-title" }, "追更"),
    env.sync.chip(),
    spacer(),
    h("button", { type: "button", class: "tk-round", "aria-label": "刷新", onclick: (event) => env.sync.pull("已是最新", event.currentTarget) }, ic("sync")),
    h("button", { type: "button", class: "tk-round", "aria-label": "全部追更", onclick: () => env.toast(`全部追更 ${env.model.following().length} 部`) }, ic("list")));
}

function weekScreen(env) {
  return h("div", { class: "tk-w" }, weekTop(env), monthCard(env, false), dayList(env), behindList(env), h("div", { class: "tk-tail" }));
}

function weekLandScreen(env) {
  return h("div", { class: "tk-w is-land" },
    h("div", { class: "tk-w-left" }, weekTop(env), monthCard(env, true)),
    h("div", { class: "tk-w-right" }, dayList(env), behindList(env), h("div", { class: "tk-tail" })));
}

/* ---------------------------------------------------------------- follow card */

function cardScreen(env) {
  const m = env.model;
  const s = m.byId.a;
  const st = env.card;
  const p = m.progress(s);
  const next = m.nextUnwatched(s);
  const nextAir = m.nextAir(s);
  const nextLine = next != null
    ? `下一集：${m.longCode(s, next)} · 已播出，可以接着看`
    : nextAir != null ? `已追平 · 下一集 ${airPhrase(m.today, m.airAt(s, nextAir))} 播出` : "已追平最新一集";

  const followBtn = h("button", {
    type: "button",
    class: `tk-follow${s.following ? " is-on" : ""}`,
    onclick: (event) => {
      if (s.following) {
        env.sync.push("取消追更，也从 Trakt 日历里移除", event.currentTarget);
        m.follow(s, false);
        env.toast("已取消追更");
      } else {
        env.sync.push("追更，已加入 Trakt 待看", event.currentTarget);
        m.follow(s, true);
        env.toast("已加入追更周历");
      }
    },
  }, s.following ? ic("check") : ic("plus"), s.following ? "已追更" : "追更");

  const seasonTabs = h("div", { class: "tk-seasons" },
    [1, 2].map((n) => h("button", { type: "button", class: st.season === n ? "is-on" : "", onclick: () => { st.season = n; env.refresh(); } },
      `第 ${n} 季`, h("small", null, n === 1 ? `${m.s1.size}/12` : `${m.progress(s).done - m.s1.size}/${m.latestAired(s) ?? 0}`))));

  const cells = [];
  const total = st.season === 1 ? 12 : s.last;
  for (let e = 1; e <= total; e++) {
    const seen = st.season === 1 ? m.s1.has(e) : m.isWatched(s, e);
    const ok = st.season === 1 || m.aired(s, e);
    const today = st.season === 2 && sameDay(m.airAt(s, e), m.today);
    const code = st.season === 1 ? `S1 · E${e}` : m.code(s, e);
    let timer = 0;
    let held = false;
    const set = (value) => (st.season === 1 ? m.setS1(e, value) : m.set(s, e, value));
    const cell = h("button", {
      type: "button",
      class: `tk-cell${seen ? " is-seen" : ok ? " is-due" : " is-future"}${today ? " is-today" : ""}`,
      "aria-label": `第 ${e} 集${seen ? "，已看" : ok ? "，未看" : "，未播出"}`,
      oncontextmenu: (event) => event.preventDefault(),
      onpointerdown: () => {
        held = false;
        clearTimeout(timer);
        if (!ok) return;
        timer = setTimeout(() => {
          held = true;
          let changed = 0;
          if (st.season === 1) {
            for (let i = 1; i <= e; i++) if (!m.s1.has(i)) { m.s1.add(i); changed++; }
            if (changed) env.refresh();
          } else changed = m.upTo(s, e);
          env.sync.push(`已标记看到第 ${e} 集${changed ? `（补上 ${changed} 集）` : ""}`, cell);
          env.toast(`已标记看到第 ${e} 集`);
        }, 480);
      },
      onpointerup: () => clearTimeout(timer),
      onpointerleave: () => clearTimeout(timer),
      onpointercancel: () => clearTimeout(timer),
      onclick: () => {
        if (held) { held = false; return; }
        if (!ok) { env.toast(`第 ${e} 集还没播出`); return; }
        env.sync.push(seen ? `已取消看过 ${code}` : `已标记看过 ${code}`, cell);
        set(!seen);
      },
    }, String(e));
    cells.push(cell);
  }

  const upcoming = m.upcoming(s, 4).map((e) => {
    const at = m.airAt(s, e);
    const diff = dayDiff(at, m.today);
    return h("div", { class: "tk-next-row" },
      h("span", { class: "tk-next-date" }, h("b", null, md(at)), h("small", null, `周${WD[weekday(at)]} ${hm(at)}`)),
      h("span", { class: "tk-next-code" }, m.code(s, e)),
      h("em", null, diff <= 0 ? "今天" : diff === 1 ? "明天" : `${diff} 天后`));
  });

  const playing = env.nowPlaying;

  return h("div", { class: "tk-c", style: { "--hue": s.hue } },
    h("div", { class: "tk-c-hero" },
      h("i", { class: "tk-c-art tk-shine" }),
      h("i", { class: "tk-c-veil" }),
      h("div", { class: "tk-c-top" }, ic("back"), spacer(), ic("more")),
      h("div", { class: "tk-c-id" },
        poster(s.hue, "is-md"),
        h("div", null,
          sk("72%", "is-title is-lg"),
          h("span", { class: "tk-c-status" }, h("i"), `连载中 · 每周${WD[s.wd]}更新`),
          h("span", { class: "tk-c-net" }, h("i", { class: "tk-net" }), sk("46px", "is-thin"))))),
    h("div", { class: "tk-c-tabs" }, ["简介", "选集", "追更", "剧评"].map((t) => h("span", { class: t === "追更" ? "is-on" : "" }, t))),
    h("div", { class: "tk-c-follow" },
      followBtn,
      h("span", { class: "tk-c-sync" }, s.following ? (env.sync.connected ? "已同步到 Trakt" : "仅保存在本机") : "追更后同步到 Trakt")),
    playing ? h("div", { class: "tk-c-playing" }, h("i", { class: "tk-eq" }, h("b"), h("b"), h("b")), `正在看 ${playing.code} · ${playing.pct}%`) : null,
    h("div", { class: "tk-c-prog" },
      h("p", { class: "tk-c-num" }, "已看 ", h("b", null, String(p.done)), ` / ${p.aired} 集`),
      progressBar(p.done, p.aired),
      h("p", { class: "tk-c-next" }, nextLine)),
    seasonTabs,
    h("div", { class: "tk-cells" }, cells),
    h("p", { class: "tk-c-hint" }, "点一下标记看过，长按标记看到这一集为止"),
    upcoming.length ? h("div", { class: "tk-next" }, h("div", { class: "tk-sec-head" }, h("b", null, "接下来"), h("span", null, `${upcoming.length} 期`)), upcoming) : null,
    env.sync.connected ? null : h("button", { type: "button", class: "tk-c-connect", onclick: () => env.goto("acct") }, ic("link"), "连接 Trakt，追更进度多设备同步"),
    h("div", { class: "tk-tail" }));
}

/* ---------------------------------------------------------------- auto mark while playing */

function playComponent(env) {
  const m = env.model;
  const DURATION = 45 * 60 + 12;
  const st = { p: 0.58, playing: true, sample: 0, marked: false };

  const sampleList = () => {
    const a = m.byId.a;
    const n = m.nextUnwatched(a) ?? m.latestAired(a) ?? 1;
    return [
      { name: `第2季第${n}集`, how: "集名里写了第几季第几集", show: a, ep: n },
      { name: `S02E${pad(n)}`, how: "常见的英文写法", show: a, ep: n },
      { name: "第五集", how: "只有一季，按集数算", show: m.byId.d, ep: 5 },
      { name: "幕后花絮 · 特别篇", how: "认不出是第几集", show: null, ep: null },
    ];
  };
  let samples = sampleList();

  const fill = h("i", { class: "tk-scrub-fill" });
  const thumb = h("i", { class: "tk-scrub-thumb" });
  const mark = h("i", { class: "tk-scrub-mark" }, h("span", null, "85%"));
  const track = h("div", { class: "tk-scrub", role: "slider", tabindex: "0", "aria-label": "播放进度", "aria-valuemin": "0", "aria-valuemax": "100" },
    h("i", { class: "tk-scrub-buf" }), fill, mark, thumb);
  const tNow = h("span", { class: "tk-v-time" });
  const tLeft = h("span", { class: "tk-v-time is-dim" });
  const playBtn = h("button", { type: "button", class: "tk-v-play", "aria-label": "播放 / 暂停" });
  const chip = h("div", { class: "tk-now" });
  const burst = h("i", { class: "tk-burst" });
  const mapList = h("div", { class: "tk-map-list" });
  const title = h("div", { class: "tk-v-title" }, sk("58%", "is-light"), h("small", null, "演示快进"));

  const fmt = (sec) => `${Math.floor(sec / 60)}:${pad(Math.floor(sec % 60))}`;
  const current = () => samples[st.sample];

  function renderMap() {
    mapList.replaceChildren(...samples.map((smp, i) => h("button", {
      type: "button",
      class: `tk-map${i === st.sample ? " is-on" : ""}${smp.show ? "" : " is-bad"}`,
      onclick: () => { st.sample = i; restart(); },
    },
    h("code", null, smp.name),
    ic("arrow", "tk-map-arrow"),
    h("b", null, smp.show ? m.code(smp.show, smp.ep) : "不记录"),
    h("small", null, smp.how))));
  }

  function paint() {
    const pct = Math.round(st.p * 100);
    fill.style.width = `${st.p * 100}%`;
    thumb.style.left = `${st.p * 100}%`;
    track.setAttribute("aria-valuenow", String(pct));
    tNow.textContent = fmt(st.p * DURATION);
    tLeft.textContent = `-${fmt((1 - st.p) * DURATION)}`;
    playBtn.replaceChildren(ic(st.p >= 1 ? "replay" : st.playing ? "pause" : "play"));
    const smp = current();
    const code = smp.show ? m.code(smp.show, smp.ep) : `「${smp.name}」`;
    let tone = "run";
    let text = `正在看 ${code} · ${pct}%`;
    if (st.marked) {
      if (!smp.show) { tone = "bad"; text = "认不出第几集，不会自动记"; }
      else if (st.markedNew) { tone = "ok"; text = `已标记看过 ${code}`; }
      else { tone = "ok"; text = `这一集已经看过 · ${code}`; }
    } else if (!smp.show) {
      text = `正在看 ${code} · ${pct}% · 认不出第几集`;
      tone = "warn";
    }
    chip.dataset.tone = tone;
    chip.replaceChildren(tone === "ok" ? ic("check") : tone === "bad" ? ic("minus") : h("i", { class: "tk-eq" }, h("b"), h("b"), h("b")), h("span", null, text));
    env.nowPlaying = smp.show ? { code: m.code(smp.show, smp.ep), pct } : null;
  }

  function check() {
    if (st.marked || st.p < 0.85) return;
    st.marked = true;
    const smp = current();
    if (!smp.show) {
      env.sync.log("· 跳过", `「${smp.name}」认不出是第几集，没有自动记`, "跳过");
    } else if (m.isWatched(smp.show, smp.ep)) {
      st.markedNew = false;
    } else {
      st.markedNew = true;
      env.sync.push(`看到 85%，记为看过 ${m.code(smp.show, smp.ep)}`, mark);
      m.set(smp.show, smp.ep, true);
      if (!reduced()) { burst.classList.remove("is-on"); void burst.offsetWidth; burst.classList.add("is-on"); }
    }
  }

  function restart() {
    samples = sampleList();
    st.p = 0.55;
    st.marked = false;
    st.markedNew = false;
    st.playing = true;
    renderMap();
    paint();
  }

  function seek(clientX) {
    const r = track.getBoundingClientRect();
    st.p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    if (st.p < 0.85 && st.marked) { st.marked = false; samples = sampleList(); }
    check();
    paint();
  }

  let dragging = false;
  track.addEventListener("pointerdown", (e) => { dragging = true; track.setPointerCapture?.(e.pointerId); seek(e.clientX); });
  track.addEventListener("pointermove", (e) => { if (dragging) seek(e.clientX); });
  const end = () => { dragging = false; };
  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);
  track.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    st.p = e.key === "Home" ? 0 : e.key === "End" ? 1 : Math.min(1, Math.max(0, st.p + (e.key === "ArrowRight" ? 0.03 : -0.03)));
    check();
    paint();
  });
  playBtn.addEventListener("click", () => {
    if (st.p >= 1) restart();
    else { st.playing = !st.playing; paint(); }
  });

  const el = h("div", { class: "tk-p" },
    h("div", { class: "tk-video" },
      h("i", { class: "tk-scene" }),
      h("i", { class: "tk-scene-shade" }),
      h("div", { class: "tk-v-top" }, ic("back"), title, ic("more")),
      playBtn,
      h("div", { class: "tk-v-bottom" }, tNow, track, tLeft),
      burst),
    chip,
    h("div", { class: "tk-c-tabs is-flat" }, ["简介", "选集", "追更", "剧评"].map((t) => h("span", { class: t === "追更" ? "is-on" : "" }, t))),
    h("div", { class: "tk-rule" },
      h("div", { class: "tk-rule-head" }, ic("mark"), h("b", null, "看到 85% 自动标记")),
      h("p", null, "追更的剧看到 85%，自动记为看过；连着 Trakt 时会同步过去。"),
      h("div", { class: "tk-rule-meter" }, h("span", null, "时长 45:12"), h("span", null, "≥ 60 秒 ✓"), h("span", null, "阈值 85%"))),
    h("div", { class: "tk-mapper" },
      h("div", { class: "tk-sec-head" }, h("b", null, "认集数"), h("span", null, "点一个换着试")),
      mapList,
      h("p", { class: "tk-c-hint" }, "认不出是第几集就不记，免得把你的进度记错。")),
    h("div", { class: "tk-tail" }));

  renderMap();
  paint();

  return {
    el,
    tick(dt) {
      if (!st.playing || dragging || st.p >= 1) return;
      st.p = Math.min(1, st.p + dt / 16);
      if (st.p >= 1) st.playing = false;
      check();
      paint();
    },
    sync() { if (!st.marked) samples = sampleList(); renderMap(); paint(); },
  };
}

/* ---------------------------------------------------------------- Trakt account page */

function acctComponent(env) {
  const body = h("div", { class: "tk-a-body" });
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
  const clear = () => { timers.forEach(clearTimeout); timers.clear(); };
  let view = env.sync.connected ? "on" : "off";
  let confirm = false;

  const hero = () => h("div", { class: "tk-a-orb" }, h("i"), h("i"), ic("sync"));

  function connect(from) {
    env.sync.setConnected(true);
    env.sync.pull("连接成功，正在同步待看、进度和日历", from);
    show("on");
    env.refresh(true);
  }

  const views = {
    off: () => [
      hero(),
      h("h4", null, "连接 Trakt，追更进度多设备同步"),
      h("p", null, "追更和看到哪一集以 Trakt 为准，所有设备保持一致。"),
      h("button", { type: "button", class: "tk-cta", onclick: () => show("browser") }, ic("globe"), "连接 Trakt"),
      h("button", { type: "button", class: "tk-ghost", onclick: () => show("device") }, ic("tablet"), "用设备码连接"),
      h("div", { class: "tk-a-paste" }, h("span", null, "浏览器没有自动跳回时用"),
        h("button", { type: "button", onclick: () => { env.toast("已识别剪贴板里的授权链接"); show("finish"); later(() => connect(body), 900); } }, ic("link"), "粘贴授权链接")),
    ],
    browser: () => {
      const allow = h("span", { class: "tk-br-allow" }, "允许");
      const steps = h("p", { class: "tk-a-step" }, "在浏览器里登录 Trakt 并点「允许」");
      later(() => allow.classList.add("is-press"), 1600);
      later(() => { steps.textContent = "正在回到 Koreplay…"; }, 2200);
      later(() => { show("finish"); later(() => connect(body), 1000); }, 2900);
      return [
        h("div", { class: "tk-br" },
          h("div", { class: "tk-br-bar" }, ic("lock"), h("span", null, "auth.trakt.tv/oauth/authorize")),
          h("div", { class: "tk-br-page" },
            h("i", { class: "tk-br-logo" }),
            sk("62%", "is-title"), sk("80%"), sk("54%"),
            h("div", { class: "tk-br-btns" }, h("span", null, "拒绝"), allow),
            h("i", { class: "tk-br-cursor" }))),
        steps,
        h("button", { type: "button", class: "tk-ghost", onclick: () => show("off") }, "取消"),
      ];
    },
    device: () => {
      const pool = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const code = Array.from({ length: 8 }, () => pool[Math.floor(Math.random() * pool.length)]);
      const ring = h("i", { class: "tk-a-ring" });
      const left = h("span", null, "10:00 后过期");
      let remain = 600;
      const tick = () => {
        remain -= 1;
        left.textContent = `${Math.floor(remain / 60)}:${pad(remain % 60)} 后过期`;
        ring.style.setProperty("--p", `${(remain / 600) * 100}%`);
        if (remain > 590) later(tick, 1000);
      };
      later(tick, 1000);
      const status = h("p", { class: "tk-a-wait" }, h("i", { class: "tk-dots" }, h("b"), h("b"), h("b")), "等待授权");
      later(() => { status.lastChild.textContent = "另一台设备上点了「允许」"; }, 6200);
      later(() => { show("finish"); later(() => connect(body), 1000); }, 7000);
      return [
        h("h4", null, "设备码授权"),
        h("p", null, "在任意设备上打开下面的网址"),
        h("span", { class: "tk-a-url" }, ic("globe"), "trakt.tv/activate"),
        h("p", null, "在其他设备的浏览器里输入代码"),
        h("div", { class: "tk-a-code" }, code.map((c, i) => h("span", { style: { "--i": i } }, c))),
        h("div", { class: "tk-a-exp" }, ring, left),
        status,
        h("div", { class: "tk-a-row" },
          h("button", { type: "button", class: "tk-ghost", onclick: () => { navigator.clipboard?.writeText(code.join("")).catch(() => {}); env.toast("已复制"); } }, ic("copy"), "复制代码"),
          h("button", { type: "button", class: "tk-ghost", onclick: () => show("off") }, "取消")),
      ];
    },
    finish: () => [h("div", { class: "tk-a-spin" }), h("h4", null, "正在连接…"), h("p", null, "马上就好")],
    on: () => {
      const syncBtn = h("button", {
        type: "button",
        class: "tk-cta",
        onclick: () => {
          syncBtn.classList.add("is-busy");
          later(() => {
            syncBtn.classList.remove("is-busy");
            env.sync.pull("同步完成，1 部剧的进度有更新", syncBtn);
            last.textContent = "刚刚同步";
          }, 900);
        },
      }, ic("sync"), "立即同步");
      const last = h("b", null, "刚刚同步");
      const box = confirm
        ? h("div", { class: "tk-a-confirm" },
          h("b", null, "断开 Trakt？"),
          h("p", null, "本机的追更会保留，Trakt 上的数据不受影响。"),
          h("div", { class: "tk-a-row" },
            h("button", { type: "button", class: "tk-ghost", onclick: () => { confirm = false; show("on"); } }, "取消"),
            h("button", { type: "button", class: "tk-ghost is-danger", onclick: () => {
              confirm = false;
              env.sync.log("↑ 断开", "已断开 Trakt，本机的追更记录保留", "完成");
              env.sync.setConnected(false);
              show("off");
              env.refresh(true);
            } }, "断开")))
        : null;
      return [
        h("div", { class: "tk-a-me" },
          h("i", { class: "tk-a-avatar" }),
          h("div", null, sk("90px", "is-title"), sk("60px", "is-thin")),
          spacer(),
          h("span", { class: "tk-a-badge" }, h("i"), "已连接")),
        h("dl", { class: "tk-a-list" },
          h("div", null, h("dt", null, "同步状态"), h("dd", null, env.sync.chip())),
          h("div", null, h("dt", null, "上次同步"), h("dd", null, last)),
          h("div", null, h("dt", null, "待同步"), h("dd", null, h("b", null, "0 项"))),
          h("div", null, h("dt", null, "Trakt 中转地址"), h("dd", null, h("b", null, "直连")))),
        syncBtn,
        h("button", { type: "button", class: "tk-ghost", onclick: (event) => env.sync.push("本机的 3 部追更已传到 Trakt", event.currentTarget) }, ic("layers"), "上传本机追更"),
        box || h("button", { type: "button", class: "tk-ghost is-danger", onclick: () => { confirm = true; show("on"); } }, "断开连接"),
      ];
    },
  };

  function show(next) {
    clear();
    view = next;
    body.dataset.view = next;
    body.replaceChildren(...views[next]().filter(Boolean));
  }

  const el = h("div", { class: "tk-a" },
    h("div", { class: "tk-a-head" }, ic("back"), h("b", null, "追更与剧评"), spacer()),
    h("p", { class: "tk-a-group" }, "Trakt 账号"),
    body,
    h("p", { class: "tk-a-notice" }, NOTICE),
    h("div", { class: "tk-tail" }));
  show(view);
  return { el, show: () => show(env.sync.connected ? "on" : view === "on" || view === "finish" ? "off" : view), hide: clear };
}

/* ================================================================ demo shell */

const TABS = [
  {
    id: "week", label: "周历", icon: "calendar", kicker: "竖屏 · 追更周历",
    title: "今晚追哪部，打开就知道",
    text: "每天更新哪几集、几点播出，都按你所在的时区排好。已经播出还没看的剧，单独列在「还没看」里，不会漏掉。",
    points: ["点月历上的日期，看那天更新了什么", "点集号就能标记看过", "「展开月历」看整个月的排期"],
    hint: "点一个带圈的集号试试。",
  },
  {
    id: "land", label: "平板横屏", icon: "land", landscape: true, kicker: "平板 · 横屏",
    title: "平板上，一屏看全",
    text: "横屏时左边是整月月历，右边是当天的更新和还没看的剧，不用来回切换。",
    points: ["月历和当天更新同时看得到", "在这里标记的集，切回竖屏也一样", "手机横过来也能用，月历会变紧凑"],
    hint: "点左边别的日期，右边跟着换。",
  },
  {
    id: "card", label: "追更卡", icon: "card", kicker: "详情页 · 追更",
    title: "每一集看没看，一眼就清楚",
    text: "在剧的详情页就能追更：看到第几集、下一集什么时候播、接下来几期的日期，都在这张卡片上。",
    points: ["实心是看过，描边是没看，灰色是还没播", "点一下标记一集，长按把前面的集一起补上", "不想追了，点「已追更」就能取消"],
    hint: "长按第 2 季的任意一集试试。",
  },
  {
    id: "play", label: "自动标记", icon: "mark", kicker: "播放 · 自动记录",
    title: "看完不用自己点",
    text: "追更的剧看到 85%，就自动记为看过，连着 Trakt 时同步过去。",
    points: ["「S02E05」「第2季第5集」「第五集」这类集名都认得", "认不出是第几集的，不会自动记，免得记错", "已经看过的集不会重复记"],
    hint: "把进度条拖过 85% 看看，也可以换个集名。",
  },
  {
    id: "acct", label: "Trakt 账号", icon: "user", kicker: "设置 · 追更与剧评",
    title: "连一次，所有设备都同步",
    text: "在浏览器里登录 Trakt、点「允许」就连上了，密码只在 Trakt 的页面里输入。电视盒子这类没有浏览器的设备，可以用设备码连接。",
    points: ["随时看得到上次同步的时间", "以前只存在本机的追更，可以一键传到 Trakt", "断开以后，本机的追更记录还在"],
    hint: "先断开，再换一种方式连接试试。",
  },
];

const SIZE = { portrait: [300, 640], landscape: [700, 330] };

function demo(id, visible) {
  const layer = h("div", { class: "tk-demo", id: `${id}-demo` });
  const sync = createSync(layer);
  const model = createModel();
  const toastEl = h("div", { class: "tk-ptoast", role: "status" });
  const viewport = h("div", { class: "tk-vp" });
  const status = h("div", { class: "tk-status", "aria-hidden": "true" },
    h("span", { class: "tk-clock" }, hm(new Date())), h("span", { class: "tk-status-ic" }, h("i"), h("i"), h("i")));
  const dev = h("div", { class: "tk-dev" }, status, viewport, toastEl);
  const fit = h("div", { class: "tk-fit" }, dev);
  const rotTip = h("p", { class: "tk-rot-tip", "aria-hidden": "true" }, ic("phone"), "横屏画面 · 把手机横过来看");
  const stage = h("div", { class: "tk-stage" }, h("i", { class: "tk-stage-glow", "aria-hidden": "true" }), h("i", { class: "tk-stage-grid", "aria-hidden": "true" }), fit, sync.pill, rotTip);

  const kicker = h("p", { class: "tk-ex-kicker" });
  const title = h("h3", null);
  const text = h("p", { class: "tk-ex-text" });
  const points = h("ul", { class: "tk-ex-points" });
  const hint = h("p", { class: "tk-ex-hint" });
  const explain = h("div", { class: "tk-ex", "aria-live": "polite" }, kicker, title, text, points, hint);
  const logBox = h("div", { class: "tk-log" },
    h("div", { class: "tk-log-head" }, h("i", { class: "tk-live" }), h("b", null, "同步记录"), spacer(), h("span", null, "演示，不会真的联网")),
    sync.list);

  const tabs = TABS.map((tab, i) => h("button", {
    type: "button", role: "tab", class: "tk-tab", id: `${id}-tab-${tab.id}`, "aria-controls": `${id}-stage`,
    onclick: () => goto(tab.id),
    onkeydown: (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const next = TABS[(i + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length];
      goto(next.id);
      tabs[TABS.indexOf(next)].focus();
    },
  }, ic(tab.icon), h("span", null, tab.label)));
  stage.id = `${id}-stage`;

  let toastTimer = 0;
  const env = {
    model,
    sync,
    week: { sel: model.today, open: false },
    card: { season: 2 },
    nowPlaying: null,
    toast(message) {
      toastEl.textContent = message;
      toastEl.classList.add("is-on");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 1600);
    },
    goto: (tab) => goto(tab),
    refresh: (all) => render(all),
  };

  const play = playComponent(env);
  const acct = acctComponent(env);
  const screens = { week: () => weekScreen(env), land: () => weekLandScreen(env), card: () => cardScreen(env) };
  let current = null;

  function render() {
    if (!current) return;
    if (current.id === "play") { play.sync(); return; }
    if (current.id === "acct") return;
    const top = viewport.scrollTop;
    viewport.replaceChildren(screens[current.id]());
    viewport.scrollTop = top;
  }
  model.on(() => render());

  function fitDevice() {
    if (!current) return;
    const [w, hh] = current.landscape ? SIZE.landscape : SIZE.portrait;
    const r = stage.getBoundingClientRect();
    if (!r.width) return;
    // On a phone the stage is narrow: size the device to the width and let the stage grow to fit it.
    // A landscape screen would shrink to unreadable there, so it is turned on its side instead.
    const narrow = r.width < 560;
    const rot = narrow && !!current.landscape;
    stage.classList.toggle("is-narrow", narrow);
    stage.classList.toggle("is-rot", rot);
    fit.classList.toggle("is-rot", rot);
    const s = narrow
      ? Math.min((r.width - 24) / ((rot ? hh : w) + 20), 1.04)
      : Math.min((r.width - 48) / (w + 20), (r.height - 64) / (hh + 20), current.landscape ? 1.15 : 1.12);
    fit.style.setProperty("--w", w);
    fit.style.setProperty("--h", hh);
    fit.style.setProperty("--s", Math.max(0.42, s).toFixed(4));
  }

  function goto(tabId) {
    const tab = TABS.find((t) => t.id === tabId) || TABS[0];
    if (current?.id === "acct" && tab.id !== "acct") acct.hide();
    const switching = current && current.id !== tab.id;
    current = tab;
    tabs.forEach((b, i) => {
      const on = TABS[i].id === tab.id;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    // The tab row scrolls sideways on phones: bring the selected tab into view without moving the page.
    const bar = tabs[0].parentElement;
    const active = tabs[TABS.indexOf(tab)];
    if (bar && bar.scrollWidth > bar.clientWidth + 1) {
      const left = Math.max(0, Math.min(active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2, bar.scrollWidth - bar.clientWidth));
      if (switching && !reduced()) bar.scrollTo({ left, behavior: "smooth" }); else bar.scrollLeft = left;
    }
    dev.classList.toggle("is-land", !!tab.landscape);
    status.hidden = !!tab.landscape;
    viewport.scrollTop = 0;
    if (tab.id === "play") { play.sync(); viewport.replaceChildren(play.el); }
    else if (tab.id === "acct") { acct.show(); viewport.replaceChildren(acct.el); }
    else viewport.replaceChildren(screens[tab.id]());
    fitDevice();
    if (switching && !reduced()) {
      dev.classList.remove("is-swap");
      void dev.offsetWidth;
      dev.classList.add("is-swap");
    }
    kicker.textContent = tab.kicker;
    title.textContent = tab.title;
    text.textContent = tab.text;
    points.replaceChildren(...tab.points.map((p) => h("li", null, ic("check"), h("span", null, p))));
    hint.replaceChildren(ic("target"), h("span", null, tab.hint));
  }

  layer.append(
    h("div", { class: "tk-tabs", role: "tablist", "aria-label": "追更界面" }, tabs),
    h("div", { class: "tk-demo-grid" }, stage, h("div", { class: "tk-side" }, explain, logBox)),
  );

  const ro = new ResizeObserver(fitDevice);
  ro.observe(stage);
  // ?trakt=card opens the demo on that screen, so a link can point at one feature.
  const wanted = new URLSearchParams(location.search).get("trakt");
  goto(TABS.some((t) => t.id === wanted) ? wanted : "week");

  return {
    el: layer,
    tick(dt) { if (current?.id === "play" && visible()) play.tick(dt); },
    dispose() { ro.disconnect(); acct.hide(); clearTimeout(toastTimer); },
  };
}

/* ================================================================ hero: sync constellation */

const NODES = [
  { x: 92, y: 118, icon: "phone", label: "Koreplay 手机", sub: "随手标记看过" },
  { x: 470, y: 100, icon: "tablet", label: "Koreplay 平板", sub: "打开就是最新进度" },
  { x: 488, y: 404, icon: "globe", label: "Trakt 网页", sub: "网页上改的也算数" },
  { x: 74, y: 398, icon: "apps", label: "其他 Trakt 应用", sub: "进度一起同步" },
];

function orbit() {
  const cx = 280;
  const cy = 258;
  const motion = !reduced();
  const paths = NODES.map((n, i) => {
    const qx = (n.x + cx) / 2 + (i % 2 ? 60 : -60);
    const qy = (n.y + cy) / 2 + (i < 2 ? 40 : -40);
    return `M${n.x} ${n.y} Q${qx} ${qy} ${cx} ${cy}`;
  });
  const packets = motion ? paths.map((d, i) => [
    `<circle r="4.2" class="tk-o-pk is-out"><animateMotion dur="${2.4 + i * 0.35}s" begin="${-i * 0.7}s" repeatCount="indefinite" path="${d}"/></circle>`,
    `<circle r="3.2" class="tk-o-pk is-in"><animateMotion dur="${3 + i * 0.3}s" begin="${-i * 1.1}s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" path="${d}"/></circle>`,
  ].join("")).join("") : "";
  const nodes = NODES.map((n) => `
    <g class="tk-o-node" transform="translate(${n.x} ${n.y})">
      <circle r="34" class="tk-o-halo"/>
      <rect x="-25" y="-25" width="50" height="50" rx="16" class="tk-o-chip"/>
      <g transform="translate(-12 -12)" class="tk-o-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[n.icon]}</g>
      <text y="50" text-anchor="middle" class="tk-o-label">${n.label}</text>
      <text y="67" text-anchor="middle" class="tk-o-sub">${n.sub}</text>
    </g>`).join("");
  const svg = `
    <svg viewBox="0 0 560 520" role="img" aria-label="手机、平板、Trakt 网页和其他 Trakt 应用共用同一个 Trakt 账号的追剧进度">
      <defs>
        <radialGradient id="tkCore" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#ff6aa2"/><stop offset=".55" stop-color="#c03ce0"/><stop offset="1" stop-color="#5b2bd6"/></radialGradient>
        <linearGradient id="tkWire" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="tk-o-s1"/><stop offset=".5" class="tk-o-s2"/><stop offset="1" class="tk-o-s3"/></linearGradient>
      </defs>
      <g class="tk-o-rings">
        <circle cx="${cx}" cy="${cy}" r="112" class="tk-o-ring is-a"/>
        <circle cx="${cx}" cy="${cy}" r="164" class="tk-o-ring is-b"/>
        <circle cx="${cx}" cy="${cy}" r="226" class="tk-o-ring is-c"/>
      </g>
      ${paths.map((d) => `<path d="${d}" class="tk-o-wire"/>`).join("")}
      ${packets}
      <g class="tk-o-core">
        <circle cx="${cx}" cy="${cy}" r="88" class="tk-o-aura"/>
        <circle cx="${cx}" cy="${cy}" r="64" fill="url(#tkCore)"/>
        <circle cx="${cx}" cy="${cy}" r="64" class="tk-o-gloss"/>
        <text x="${cx}" y="${cy + 2}" text-anchor="middle" class="tk-o-name">Trakt</text>
        <text x="${cx}" y="${cy + 24}" text-anchor="middle" class="tk-o-role">你的账号</text>
      </g>
      ${nodes}
    </svg>`;
  const box = h("div", { class: "tk-orbit", html: svg });
  return box;
}

const TICKER = [
  ["↑", "标记看过 S2 · E7", "已同步"],
  ["↓", "平板上看完一集，手机跟着更新", "已同步"],
  ["↑", "追更了一部新剧", "已同步"],
  ["○", "没网，先记在手机上", "待同步 3"],
  ["↑", "网络恢复，3 条改动补传完毕", "已同步"],
  ["↓", "在 Trakt 网页上取消了一部", "已同步"],
];

/* ================================================================ OAuth + PKCE flow */

function flow() {
  const steps = [
    { icon: "globe", tag: "第 1 步", title: "点「连接 Trakt」", text: "Koreplay 会打开浏览器，进入 Trakt 官方的登录页面。" },
    { icon: "key", tag: "第 2 步", title: "登录，点「允许」", text: "账号密码只在 Trakt 的页面里输入，Koreplay 看不到，也不会保存。" },
    { icon: "link", tag: "第 3 步", title: "自动回到 Koreplay", text: "授权完成后会自动跳回 App。浏览器拦了跳转也没关系，点页面上的按钮就能回来。" },
    { icon: "shield", tag: "第 4 步", title: "连接完成", text: "第一次会把你在 Trakt 上的待看和进度同步下来。以后不想用了，随时可以断开。" },
  ];
  return h("div", { class: "tk-flow tk-rv" },
    h("div", { class: "tk-sub-head" },
      h("p", { class: "tk-eyebrow" }, "连接"),
      h("h3", null, "在 Trakt 自己的页面登录，", h("br"), "Koreplay 碰不到你的密码。"),
      h("p", null, "用的是 Trakt 官方推荐的授权方式。Koreplay 只拿到一个随时可以撤销的授权，安装包里也没有存放任何密钥。")),
    h("div", { class: "tk-flow-track" },
      h("div", { class: "tk-flow-rail", "aria-hidden": "true" }, h("i")),
      h("ol", { class: "tk-steps" }, steps.map((step, i) => h("li", { class: "tk-step", style: { "--i": i } },
        h("span", { class: "tk-step-no" }, String(i + 1).padStart(2, "0")),
        h("span", { class: "tk-step-ic" }, ic(step.icon)),
        h("small", null, step.tag),
        h("b", null, step.title),
        h("p", null, step.text))))),
    h("div", { class: "tk-fallbacks" },
      [["offline", "在浏览器里待太久，App 被系统关了？", "10 分钟内回来，照样能连上"],
        ["link", "浏览器没有跳回 Koreplay？", "复制地址栏里的链接，回到 App 粘贴就行"],
        ["tablet", "设备上没有浏览器？", "用 8 位设备码，在手机或电脑上授权"]].map(([icon, q, a]) =>
        h("div", { class: "tk-fb" }, ic(icon), h("span", null, h("b", null, q), h("small", null, a))))));
}

/* ================================================================ offline-first sync engine */

function engine(visible) {
  let online = true;
  let letter = 0;
  let episode = 4;
  let served = 0;
  let waiting = 0;
  const queue = [];
  const counts = { list: 24, eps: 318 };
  const lastAdded = [];

  const localList = h("ol", { class: "tk-en-local" });
  const queueList = h("ol", { class: "tk-en-queue" });
  const qCount = h("b", null, "0");
  const listNum = h("b", null, String(counts.list));
  const epsNum = h("b", null, String(counts.eps));
  const lastCode = h("em", { class: "tk-en-code" }, "—");
  const traktBox = h("div", { class: "tk-en-trakt" });
  const netBtn = h("button", { type: "button", class: "tk-switch", role: "switch", "aria-checked": "true" }, h("i"), h("span", null, "在线"));
  const note = h("p", { class: "tk-en-note" }, "试试先关掉网络，点几下按钮，再把网络打开。");

  function addLocal(text, icon) {
    localList.prepend(h("li", null, ic(icon), h("span", null, text), h("small", null, "已记下")));
    while (localList.children.length > 5) localList.lastElementChild.remove();
  }

  function paintQueue() {
    qCount.textContent = String(queue.length);
    queueList.replaceChildren(...queue.map((item) => item.el));
    if (!queue.length) queueList.append(h("li", { class: "tk-en-empty" }, online ? "没有等待同步的改动" : "断网时的改动会排在这里"));
  }

  function enqueue(op, label, icon, extra = {}) {
    const el = h("li", { class: `tk-q is-${op}` }, ic(icon), h("span", null, label), h("small", null, online ? "待同步" : "等网络"));
    const item = { op, label, el, ...extra };
    queue.push(item);
    paintQueue();
    return item;
  }

  const actions = [
    ["plus", "追更一部", () => {
      const name = `剧 ${String.fromCharCode(65 + (letter++ % 26))}`;
      addLocal(`追更「${name}」`, "plus");
      lastAdded.push(enqueue("add", `加入待看「${name}」`, "plus", { name }));
    }],
    ["check", "标记看过", () => {
      const code = `S2 · E${episode++}`;
      addLocal(`看过 ${code}`, "check");
      enqueue("watch", `看过 ${code}`, "check");
    }],
    ["minus", "取消刚追的", () => {
      const add = lastAdded.pop();
      if (!add) { note.textContent = "先「追更一部」，再来取消它。"; return; }
      addLocal(`取消追更「${add.name}」`, "minus");
      const index = queue.indexOf(add);
      if (index >= 0) {
        // 「加 → 删」还没送出去：两条在队列里直接抵消
        add.el.classList.add("is-cancel");
        add.el.lastChild.textContent = "已抵消";
        setTimeout(() => { const k = queue.indexOf(add); if (k >= 0) queue.splice(k, 1); paintQueue(); }, reduced() ? 0 : 650);
        note.textContent = "刚追又取消，两条改动还没传出去就抵掉了，不用再同步。";
      } else {
        enqueue("remove", `取消追更「${add.name}」`, "minus");
      }
    }],
  ].map(([icon, label, fn]) => h("button", { type: "button", class: "tk-en-act", onclick: fn }, ic(icon), label));

  netBtn.addEventListener("click", () => {
    online = !online;
    netBtn.setAttribute("aria-checked", String(online));
    netBtn.lastChild.textContent = online ? "在线" : "离线";
    traktBox.classList.toggle("is-off", !online);
    queue.forEach((item) => { item.el.lastChild.textContent = online ? "待同步" : "等网络"; });
    note.textContent = online ? (queue.length ? `网络恢复了，正在补传 ${queue.length} 条改动。` : "已联网：改动会直接同步到 Trakt。") : "已断网：照常追更、标记，改动先记在手机上。";
    paintQueue();
  });

  function drain() {
    if (!online || waiting || !queue.length || !visible()) return;
    const item = queue[0];
    if (item.el.classList.contains("is-cancel")) return;
    served++;
    if (served % 5 === 3) {
      // 偶尔遇到限流：读 Retry-After 等一会儿再发，不丢、不乱序
      waiting = 1;
      item.el.classList.add("is-wait");
      item.el.lastChild.textContent = "网络忙，稍后再试";
      lastCode.textContent = "稍等";
      lastCode.dataset.tone = "warn";
      setTimeout(() => { waiting = 0; item.el.classList.remove("is-wait"); item.el.lastChild.textContent = "正在重试"; }, 1600);
      return;
    }
    queue.shift();
    item.el.classList.add("is-sent");
    item.el.lastChild.textContent = "已同步";
    if (item.op === "add") counts.list++;
    if (item.op === "remove") counts.list--;
    if (item.op === "watch") counts.eps++;
    listNum.textContent = String(counts.list);
    epsNum.textContent = String(counts.eps);
    lastCode.textContent = "正常";
    lastCode.dataset.tone = "ok";
    traktBox.classList.remove("is-hit");
    void traktBox.offsetWidth;
    traktBox.classList.add("is-hit");
    setTimeout(paintQueue, reduced() ? 0 : 420);
  }

  traktBox.append(
    h("div", { class: "tk-en-orb" }, ic("cloud")),
    h("b", { class: "tk-en-name" }, "Trakt"),
    h("div", { class: "tk-en-stats" },
      h("span", null, listNum, h("small", null, "待看")),
      h("span", null, epsNum, h("small", null, "已看集数"))),
    h("p", null, "状态 ", lastCode));

  const el = h("div", { class: "tk-engine tk-rv" },
    h("div", { class: "tk-sub-head" },
      h("p", { class: "tk-eyebrow" }, "离线"),
      h("h3", null, "没网也能照常追，", h("br"), "有网了自动补上。"),
      h("p", null, "在地铁上标记的集、新追的剧，都先记在手机上，界面马上就变；等网络恢复，再按顺序同步到 Trakt。")),
    h("div", { class: "tk-en" },
      h("div", { class: "tk-en-bar" }, netBtn, h("div", { class: "tk-en-acts" }, actions)),
      h("div", { class: "tk-en-cols" },
        h("section", { class: "tk-en-col" }, h("header", null, ic("phone"), h("b", null, "本机"), h("small", null, "马上生效")), localList),
        h("section", { class: "tk-en-col is-queue" }, h("header", null, ic("layers"), h("b", null, "等待同步"), qCount), queueList),
        h("section", { class: "tk-en-col" }, h("header", null, ic("sync"), h("b", null, "Trakt"), h("small", null, "你的账号")), traktBox)),
      note,
      h("ul", { class: "tk-en-rules" },
        [["自动重试", "网络不稳时会自动再试"], ["按顺序", "断网时的改动按先后补传"], ["会提醒你", "Trakt 账号满了会直接告诉你"], ["自动续期", "登录过期会自动续上"]].map(([code, text]) =>
          h("li", null, h("code", null, code), h("span", null, text))))));

  paintQueue();
  addLocal("看过 S2 · E3", "check");
  addLocal("追更「剧 Z」", "plus");
  const timer = setInterval(drain, 820);
  return { el, dispose: () => clearInterval(timer) };
}

/* ================================================================ feature bento */

const FEATURES = [
  { icon: "sync", title: "所有设备，同一份进度", text: "在 Koreplay 里追更、看完一集，会同步到 Trakt；在 Trakt 网页或其他支持 Trakt 的 App 里改的，也会同步回来。", wide: true },
  { icon: "bolt", title: "打开就有", text: "先显示手机上存好的内容，再在后台更新；网络不好也不会白屏。" },
  { icon: "layers", title: "不费流量", text: "只同步有变化的部分，平时打开周历几乎不用等。" },
  { icon: "target", title: "不会乱记进度", text: "认不出是第几集，就不自动记，免得把你在 Trakt 上的进度弄乱。" },
  { icon: "zh", title: "中文剧名和海报", text: "剧名、海报、剧照和每集标题，都用 TMDB 的中文资料。" },
  { icon: "clock", title: "按你的时区显示", text: "播出时间换成你当地的时间，写成「今晚 20:00」「明早 9:00」；Trakt 上没有排期的剧，用 TMDB 的播出日期补上。" },
  { icon: "shield", title: "免费账号也能用", text: "Trakt 免费账号有数量上限，满了会直接提示你，不会一直失败。" },
  { icon: "offline", title: "不连 Trakt 也能追", text: "不想连接也可以，追更只存在手机上；以后连上了，一键把以前的记录传过去。", span: true },
];

function bento() {
  const cards = FEATURES.map((f, i) => {
    const card = h("article", { class: `tk-bn${f.wide ? " is-wide" : ""}${f.span ? " is-span" : ""} tk-rv`, style: { "--i": i } },
      h("span", { class: "tk-bn-ic" }, ic(f.icon)),
      h("b", null, f.title),
      h("p", null, f.text),
      f.wide ? h("div", { class: "tk-bn-viz", "aria-hidden": "true" },
        h("span", { class: "tk-bn-dev" }, ic("phone")), h("i", { class: "tk-bn-line" }, h("b"), h("b")),
        h("span", { class: "tk-bn-core" }, "Trakt"),
        h("i", { class: "tk-bn-line is-rev" }, h("b"), h("b")), h("span", { class: "tk-bn-dev" }, ic("tablet"))) : null);
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
    return card;
  });
  return h("div", { class: "tk-bento-wrap" },
    h("div", { class: "tk-sub-head tk-rv" },
      h("p", { class: "tk-eyebrow" }, "细节"),
      h("h3", null, "这些小地方，", h("br"), "也替你想好了。")),
    h("div", { class: "tk-bento" }, cards));
}

/* ================================================================ entry */

/**
 * Build the 「追更 × Trakt」 section.
 *   id:      section id (the demo gets `${id}-demo`)
 *   variant: theme styling hook (tk--studio, tk--holo, ...)
 * Returns the section; its `dispose` releases timers and observers. Everything also stops by
 * itself once the section leaves the document (themes swap their whole tree on switch).
 */
export function traktShowcase({ id = "trakt", variant = "studio" } = {}) {
  let onScreen = false;
  const visible = () => onScreen && !document.hidden;

  const stats = [
    { n: 85, suf: "%", label: "看到这里，自动记为看过" },
    { n: 3, suf: " 种", label: "连接方式：浏览器、设备码、粘贴链接" },
    { n: 4, suf: " 期", label: "追更卡上提前看到的排期" },
    { n: 2, suf: " 套", label: "周历布局：手机竖屏、平板横屏" },
  ].map((s) => {
    const num = h("b", { "data-to": String(s.n) }, "0");
    return h("li", null, h("span", { class: "tk-stat-num" }, s.pre ? h("small", null, s.pre) : null, num, s.suf ? h("small", null, s.suf) : null), h("span", null, s.label));
  });

  const tickerText = h("span", { class: "tk-tick-text" });
  const tickerDir = h("b", { class: "tk-tick-dir" });
  const tickerCode = h("em", null);
  const ticker = h("div", { class: "tk-ticker", "aria-hidden": "true" }, h("i", { class: "tk-live" }), tickerDir, tickerText, tickerCode);
  let tickIndex = 0;
  const showTick = () => {
    const [dir, text, code] = TICKER[tickIndex++ % TICKER.length];
    ticker.classList.remove("is-in");
    void ticker.offsetWidth;
    tickerDir.textContent = dir;
    tickerText.textContent = text;
    tickerCode.textContent = code;
    ticker.classList.add("is-in");
  };
  showTick();

  const hero = h("header", { class: "tk-hero" },
    h("div", { class: "tk-hero-copy tk-rv" },
      h("p", { class: "tk-kicker" }, h("i", { class: "tk-live" }), "追更 × Trakt", h("span", null, "新")),
      h("h2", { id: `${id}-title`, class: "tk-h" }, "追剧进度，", h("br"), h("em", null, "换台手机也还在。")),
      h("p", { class: "tk-lead" }, "连上你自己的 Trakt 账号，追了哪些剧、看到第几集、这周哪天更新，在手机、平板和 Trakt 网页上都一样。换手机、重装 App 也不会丢；不想连也没关系，追更照样能用。"),
      h("div", { class: "tk-cta-row" },
        h("a", { class: "tk-btn is-primary", href: `#${id}-demo` }, ic("play"), "试试看"),
        h("a", { class: "tk-btn", href: "./trakt/" }, "Trakt 接入说明", ic("arrow"))),
      h("ul", { class: "tk-stats" }, stats)),
    h("div", { class: "tk-hero-art tk-rv" }, orbit(), ticker));

  let demoPart = null;
  let enginePart = null;
  const section = h("section", { class: `tk tk--${variant}`, id, "aria-labelledby": `${id}-title` });
  demoPart = demo(id, visible);
  enginePart = engine(visible);

  section.append(
    h("i", { class: "tk-aurora", "aria-hidden": "true" }),
    hero,
    h("div", { class: "tk-demo-head tk-rv" },
      h("p", { class: "tk-eyebrow" }, "试试看"),
      h("h3", null, "直接点点看。"),
      h("p", null, "这是 App 里的真实布局，海报和片名换成了占位块。在任何一个界面标记看过，其他界面会跟着变，右边的同步记录会告诉你发生了什么。")),
    demoPart.el,
    flow(),
    enginePart.el,
    bento(),
    h("footer", { class: "tk-foot tk-rv" },
      h("p", { class: "tk-foot-notice" }, NOTICE),
      h("p", null, "Trakt 是可选功能，只用于你自己的待看列表、观看记录、进度和播出日历；不连接也能在本机追更。Koreplay 不提供任何影视内容。"),
      h("nav", null,
        h("a", { href: "./trakt/" }, "Trakt 接入说明"),
        h("a", { href: "./privacy/" }, "隐私政策"))));

  // Counters and reveal-on-scroll.
  const countUp = (el) => {
    const to = Number(el.dataset.to);
    if (reduced() || to === 0) { el.textContent = String(to); return; }
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / 1200);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      entry.target.querySelectorAll("[data-to]").forEach(countUp);
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.18 });
  const presence = new IntersectionObserver((entries) => { onScreen = entries.some((e) => e.isIntersecting); });

  let frame = 0;
  let last = 0;
  let disposed = false;
  const tickTimer = setInterval(() => {
    if (!section.isConnected) { section.dispose(); return; }
    if (visible() && !reduced()) showTick();
  }, 2600);
  const loop = (t) => {
    if (disposed) return;
    if (!section.isConnected && last) { section.dispose(); return; }
    const dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
    last = t;
    demoPart.tick(dt);
    frame = requestAnimationFrame(loop);
  };

  section.dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    clearInterval(tickTimer);
    reveal.disconnect();
    presence.disconnect();
    demoPart.dispose();
    enginePart.dispose();
  };

  queueMicrotask(() => {
    if (reduced()) section.querySelectorAll(".tk-rv").forEach((el) => el.classList.add("is-in"));
    else section.querySelectorAll(".tk-rv").forEach((el) => reveal.observe(el));
    if (reduced()) section.querySelectorAll("[data-to]").forEach((el) => { el.textContent = el.dataset.to; });
    presence.observe(section);
    frame = requestAnimationFrame(loop);
  });
  return section;
}
