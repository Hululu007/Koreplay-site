import { ABIS, AUTH_NOTE, DISCLAIMER, GROUPS, LINKS, PLUGINS, STEPS, disposer, downloadLink, formatSize, h } from "../kit.js";
import { gallery } from "../gallery.js";

const LOGO = [
  "   ▄▄▄▄▄▄▄▄▄▄▄   ",
  "  ████▀▀███████  ",
  "  ████   ▀▀████  ",
  "  ████     ▀▀██  ",
  "  ████     ▄▄██  ",
  "  ████   ▄▄████  ",
  "  ████▄▄███████  ",
  "   ▀▀▀▀▀▀▀▀▀▀▀   ",
];

const ALIASES = { arm64: "arm64-v8a", "arm64-v8a": "arm64-v8a", "64": "arm64-v8a", arm32: "armeabi-v7a", "armeabi-v7a": "armeabi-v7a", "32": "armeabi-v7a" };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  mount(root, ctx) {
    const d = disposer();
    const reduced = ctx.reducedMotion;
    const host = ctx.host;
    const release = ctx.release;
    let alive = true;
    d.add(() => { alive = false; });

    /* ---------- layout ---------- */
    const output = h("div", { class: "tm-output", role: "log", "aria-live": "polite", "aria-label": "终端输出" });
    const input = h("input", {
      class: "tm-input",
      type: "text",
      autocomplete: "off",
      autocapitalize: "off",
      spellcheck: "false",
      "aria-label": "输入命令，输入 help 查看全部命令",
      enterkeyhint: "send",
    });
    const ghost = h("span", { class: "tm-ghost", "aria-hidden": "true" });
    const promptLine = h("label", { class: "tm-prompt-line" },
      h("span", { class: "tm-ps1" }, h("b", null, "guest@koreplay"), ":", h("i", null, "~"), "$ "),
      h("span", { class: "tm-input-wrap" }, input, ghost));
    const screen = h("div", { class: "tm-screen" }, output, promptLine);

    const chips = ["help", "ls", "get host", "abi arm32", "install", "neofetch", "matrix"].map((cmd) =>
      h("button", { class: "tm-chip", type: "button", onclick: () => run(cmd, true) }, cmd));

    const termPane = h("section", { class: "tm-pane tm-term", "aria-label": "交互式终端" },
      h("header", { class: "tm-pane-head" },
        h("span", { class: "tm-dots", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
        h("span", null, "koreplay — zsh — 1"),
        h("span", { class: "tm-pane-tag" }, "可输入")),
      screen,
      h("div", { class: "tm-chips", "aria-label": "常用命令" }, chips));

    const table = h("div", { class: "tm-table" });
    const abiKeys = Object.entries(ABIS).map(([abi, info], i) => h("button", {
      class: "tm-key",
      type: "button",
      "data-abi": abi,
      onclick: () => ctx.setAbi(abi),
    }, h("kbd", null, `F${i + 1}`), info.short));
    const sidePane = h("section", { class: "tm-pane tm-side", "aria-labelledby": "tm-side-title" },
      h("header", { class: "tm-pane-head" },
        h("span", { id: "tm-side-title" }, "pkgtop — 安装包"),
        h("span", { class: "tm-pane-tag" }, "可点击")),
      h("div", { class: "tm-keys", role: "group", "aria-label": "设备架构" }, abiKeys),
      table);

    const clock = h("span", { class: "tm-clock" });
    const statusBar = h("footer", { class: "tm-status" },
      h("span", { class: "tm-status-mode" }, "KOREPLAY"),
      h("span", null, release ? release.tag : "offline"),
      h("span", { class: "tm-abi-status" }),
      h("span", { class: "tm-status-spacer" }),
      h("a", { href: LINKS.repo, target: "_blank", rel: "noreferrer" }, "github"),
      h("a", { href: LINKS.license, target: "_blank", rel: "noreferrer" }, "AGPL-3.0"),
      clock);

    const topBar = h("header", { class: "tm-top" },
      h("h1", null, "Koreplay", h("span", null, " — Android 媒体客户端，一个本体，按需装配插件")),
      host ? downloadLink(host, { class: "tm-top-get" }, "[ 下载本体 APK ]") : h("span", { class: "tm-top-get is-off" }, "[ 离线 ]"));

    const rain = h("canvas", { class: "tm-rain", "aria-hidden": "true" });
    const crt = h("div", { class: "tm-crt" }, topBar, h("div", { class: "tm-grid" }, termPane, sidePane), statusBar, rain);
    const note = h("p", { class: "tm-note" }, DISCLAIMER);
    root.append(h("main", { class: "tm-wrap" }, crt, gallery({ id: "tm-screens", layout: "stage", variant: "terminal", title: "$ koreplay --screens", lead: "骨架渲染的内容页与播放页，加上配置页实拍。左侧选择，右侧逐项标注控件。" }), note));

    /* ---------- output helpers ---------- */
    const scrollDown = () => { screen.scrollTop = screen.scrollHeight; };
    const line = (...children) => {
      const node = h("div", { class: "tm-line" }, ...children);
      output.append(node);
      scrollDown();
      return node;
    };
    const span = (cls, text) => h("span", { class: cls }, text);
    const pad = (text, width) => {
      const str = String(text);
      let len = 0;
      for (const ch of str) len += /[　-鿿＀-￯]/.test(ch) ? 2 : 1;
      return str + " ".repeat(Math.max(0, width - len));
    };

    async function type(text, cls = "", speed = 8) {
      const node = line();
      if (cls) node.classList.add(cls);
      if (reduced) { node.textContent = text; return node; }
      for (let i = 0; i < text.length && alive; i += 2) {
        node.textContent = text.slice(0, i + 2);
        scrollDown();
        await sleep(speed);
      }
      return node;
    }

    const findPkg = (id) => {
      if (!ctx.manifest) return null;
      if (id === "host" || id === "koreplay" || id === "apk") return ctx.host;
      return ctx.plugins().find((pkg) => pkg.id === id) || null;
    };

    const pkgLink = (pkg, label) => downloadLink(pkg, { class: "tm-a" }, label || pkg.file);

    /* ---------- commands ---------- */
    const COMMANDS = {
      help: {
        desc: "列出全部命令",
        run() {
          line(span("tm-dim", "可用命令（Tab 补全，↑↓ 翻历史）："));
          for (const [name, cmd] of Object.entries(COMMANDS)) {
            if (cmd.hidden) continue;
            line(span("tm-hl", pad(`  ${name}${cmd.args ? ` ${cmd.args}` : ""}`, 22)), cmd.desc);
          }
        },
      },
      ls: {
        desc: "列出当前架构的全部安装包",
        run() {
          if (!ctx.manifest) return line(span("tm-err", `ls: ${ctx.error}`));
          line(span("tm-dim", `${pad("ID", 10)}${pad("名称", 18)}${pad("版本", 10)}${pad("大小", 10)}文件`));
          const all = [ctx.host, ...ctx.plugins()];
          for (const pkg of all) {
            const meta = pkg.id === "host" ? { name: "Koreplay 本体" } : PLUGINS[pkg.id] || { name: pkg.id };
            line(span(pkg.id === "host" ? "tm-amber" : "tm-hl", pad(pkg.id, 10)), pad(meta.name, 18), pad(`v${pkg.version}`, 10), pad(formatSize(pkg.size), 10), pkgLink(pkg));
          }
          line(span("tm-dim", `当前架构 ${ABIS[ctx.abi].short}。用 get <ID> 下载，abi arm32 切换架构。`));
        },
      },
      get: {
        args: "<ID>",
        desc: "下载安装包，例如 get host、get media3",
        complete: () => ["host", ...ctx.plugins().map((pkg) => pkg.id)],
        run([id], fromUser) {
          if (!id) return line(span("tm-err", "get: 缺少 ID。示例：get host"));
          const pkg = findPkg(id.toLowerCase());
          if (!pkg) return line(span("tm-err", `get: 找不到 “${id}”。输入 ls 查看可用 ID。`));
          line(span("tm-ok", "→ "), "开始下载 ", pkgLink(pkg), span("tm-dim", ` (${formatSize(pkg.size)})`));
          line(span("tm-dim", "  如果浏览器跳到 GitHub 404，说明需要先登录有权限的账号。输入 auth 了解详情。"));
          if (fromUser) {
            const a = downloadLink(pkg, { hidden: true });
            document.body.append(a);
            a.click();
            a.remove();
          }
        },
      },
      abi: {
        args: "[arm64|arm32]",
        desc: "查看或切换设备架构",
        complete: () => ["arm64", "arm32"],
        run([value]) {
          if (!value) {
            line("当前架构：", span("tm-hl", ABIS[ctx.abi].short), span("tm-dim", `（${ctx.abi}）`));
            line(span("tm-dim", "近几年的手机和平板大多是 ARM64。可在“关于手机”里查看处理器信息。"));
            return;
          }
          const abi = ALIASES[value.toLowerCase()];
          if (!abi) return line(span("tm-err", `abi: 不认识 “${value}”，可用 arm64 或 arm32`));
          ctx.setAbi(abi);
          line(span("tm-ok", "✓ "), `已切换到 ${ABIS[abi].short}，右侧列表已更新。`);
        },
      },
      sha: {
        args: "<ID>",
        desc: "显示并复制安装包的 SHA-256",
        complete: () => ["host", ...ctx.plugins().map((pkg) => pkg.id)],
        run([id]) {
          if (!id) return line(span("tm-err", "sha: 缺少 ID。示例：sha host"));
          const pkg = findPkg(id.toLowerCase());
          if (!pkg) return line(span("tm-err", `sha: 找不到 “${id}”`));
          line(span("tm-amber", pkg.sha256), "  ", pkg.file);
          ctx.copy(pkg.sha256, "已复制 SHA-256");
        },
      },
      install: {
        desc: "首次安装步骤",
        async run() {
          for (const [i, step] of STEPS.entries()) {
            line(span("tm-amber", `[${i + 1}/4] `), span("tm-hl", step.title));
            await type(`      ${step.text}`, "", 4);
          }
        },
      },
      auth: {
        desc: "下载权限说明",
        run() {
          line(AUTH_NOTE);
          line("登录：", h("a", { class: "tm-a", href: LINKS.login, target: "_blank", rel: "noreferrer" }, LINKS.login));
        },
      },
      verify: {
        desc: "校验文件说明",
        run() {
          line("每个安装包都有 SHA-256。下载后计算哈希值，与本页一致即说明文件完整。");
          line("校验文件：", h("a", { class: "tm-a", href: ctx.checksums, download: "SHA256SUMS" }, "SHA256SUMS"));
          line(span("tm-dim", "  Linux/macOS:  sha256sum -c SHA256SUMS"));
          line(span("tm-dim", "  Windows:      certutil -hashfile <文件> SHA256"));
        },
      },
      neofetch: {
        desc: "系统信息",
        run() {
          const info = [
            ["", span("tm-hl", "guest@koreplay")],
            ["", span("tm-dim", "──────────────")],
            ["应用", "Koreplay（Android 媒体客户端）"],
            ["版本", release ? `${release.hostVersion} · ${release.tag}` : "未知"],
            ["接口", release ? `Host API ${release.hostApi}` : "未知"],
            ["架构", `${ABIS[ctx.abi].short}（本体通用）`],
            ["插件", `${ctx.plugins().length} 个可用`],
            ["发布", release?.date || "未知"],
            ["许可", "AGPL-3.0"],
            ["", h("span", { class: "tm-palette" }, ["#39ff88", "#ffb000", "#ff5f56", "#5fb3ff", "#c792ea", "#e8ffe8"].map((c) => h("i", { style: { background: c } })))],
          ];
          LOGO.forEach((art, i) => {
            const [k, v] = info[i] || ["", ""];
            line(span("tm-amber", art), "   ", k ? span("tm-hl", pad(k, 6)) : "", v);
          });
          for (const [k, v] of info.slice(LOGO.length)) line(" ".repeat(LOGO[0].length + 3), k ? span("tm-hl", pad(k, 6)) : "", v);
        },
      },
      theme: {
        args: "[ID]",
        desc: "切换网页主题",
        complete: () => ctx.themes.map((t) => t.id),
        run([id]) {
          if (!id) {
            for (const t of ctx.themes) line(span(t.id === ctx.theme ? "tm-amber" : "tm-hl", pad(`  ${t.id}`, 14)), `${t.name} — ${t.desc}`);
            line(span("tm-dim", "示例：theme nebula"));
            return;
          }
          if (!ctx.themes.some((t) => t.id === id)) return line(span("tm-err", `theme: 没有 “${id}”`));
          line(span("tm-ok", "→ "), `正在切换到 ${id} …`);
          const rect = input.getBoundingClientRect();
          setTimeout(() => ctx.setTheme(id, { x: rect.left + 40, y: rect.top }), 250);
        },
      },
      about: {
        desc: "项目说明",
        run() {
          line("Koreplay 是 Android 手机和平板上的媒体客户端。");
          line("本体保持精简，界面、运行时和播放器都是独立插件，按需安装、各自更新。");
          line(span("tm-dim", DISCLAIMER));
          line("源码：", h("a", { class: "tm-a", href: LINKS.repo, target: "_blank", rel: "noreferrer" }, LINKS.repo));
        },
      },
      matrix: { desc: "？", run: () => matrix() },
      history: { desc: "命令历史", run: () => history.forEach((cmd, i) => line(span("tm-dim", pad(String(i + 1), 5)), cmd)) },
      clear: { desc: "清屏", run: () => output.replaceChildren() },
      sudo: { hidden: true, run: () => line(span("tm-err", "guest 不在 sudoers 文件中。此事将被记录。")) },
      exit: { hidden: true, run: () => line(span("tm-dim", "这里没有出口。试试 theme 换一个世界。")) },
      rm: { hidden: true, run: () => line(span("tm-err", "rm: 只读文件系统")) },
    };
    COMMANDS.dir = { hidden: true, run: COMMANDS.ls.run };
    COMMANDS.cls = { hidden: true, run: COMMANDS.clear.run };

    const history = [];
    let cursor = 0;
    let busy = false;

    async function run(raw, fromUser = false) {
      const text = raw.trim();
      if (busy) return;
      line(span("tm-ps1-echo", "guest@koreplay:~$ "), text);
      if (!text) return;
      history.push(text);
      cursor = history.length;
      const [name, ...args] = text.split(/\s+/);
      const cmd = COMMANDS[name.toLowerCase()];
      if (!cmd) {
        line(span("tm-err", `zsh: command not found: ${name}`), span("tm-dim", "  输入 help 查看可用命令"));
        return;
      }
      busy = true;
      promptLine.classList.add("is-busy");
      try { await cmd.run(args, fromUser); } finally {
        busy = false;
        promptLine.classList.remove("is-busy");
        scrollDown();
      }
    }

    /* ---------- completion ---------- */
    function suggestions(value) {
      const parts = value.split(/\s+/);
      if (parts.length <= 1) return Object.keys(COMMANDS).filter((n) => !COMMANDS[n].hidden && n.startsWith(parts[0].toLowerCase()));
      const cmd = COMMANDS[parts[0].toLowerCase()];
      if (!cmd?.complete) return [];
      const last = parts[parts.length - 1].toLowerCase();
      return cmd.complete().filter((opt) => opt.startsWith(last));
    }
    function updateGhost() {
      const value = input.value;
      if (!value || /\s$/.test(value)) { ghost.textContent = ""; return; }
      const options = suggestions(value);
      const last = value.split(/\s+/).pop();
      ghost.textContent = options.length ? value + options[0].slice(last.length) : "";
    }

    d.on(input, "input", updateGhost);
    d.on(input, "keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const value = input.value;
        input.value = "";
        ghost.textContent = "";
        run(value, true);
      } else if (event.key === "Tab") {
        const options = suggestions(input.value);
        if (!input.value) return;
        event.preventDefault();
        if (options.length === 1) {
          const parts = input.value.split(/\s+/);
          parts[parts.length - 1] = options[0];
          input.value = `${parts.join(" ")} `;
        } else if (options.length > 1) {
          line(span("tm-ps1-echo", "guest@koreplay:~$ "), input.value);
          line(span("tm-dim", options.join("    ")));
        }
        updateGhost();
      } else if (event.key === "ArrowUp") {
        if (!history.length) return;
        event.preventDefault();
        cursor = Math.max(0, cursor - 1);
        input.value = history[cursor];
        updateGhost();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        cursor = Math.min(history.length, cursor + 1);
        input.value = history[cursor] || "";
        updateGhost();
      } else if (event.key === "ArrowRight" && ghost.textContent && input.selectionStart === input.value.length) {
        input.value = ghost.textContent;
        updateGhost();
      } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
        event.preventDefault();
        output.replaceChildren();
      }
    });
    d.on(screen, "click", () => {
      if (!window.getSelection()?.toString()) input.focus({ preventScroll: true });
    });

    /* ---------- side table ---------- */
    function renderTable() {
      for (const key of abiKeys) key.classList.toggle("is-on", key.dataset.abi === ctx.abi);
      crt.querySelector(".tm-abi-status").textContent = ABIS[ctx.abi].short;
      if (!ctx.manifest) {
        table.replaceChildren(h("p", { class: "tm-err" }, `${ctx.error}。请稍后刷新页面。`));
        return;
      }
      const rows = [];
      const max = Math.max(...ctx.allPackages.map((pkg) => pkg.size));
      const row = (pkg, name, tag) => {
        const bars = Math.max(1, Math.round((pkg.size / max) * 12));
        return downloadLink(pkg, { class: `tm-row${pkg.id === "host" ? " is-host" : ""}`, title: `${pkg.file}\nSHA-256 ${pkg.sha256}` },
          h("span", { class: "tm-row-name" }, name, tag ? h("em", null, tag) : null),
          h("span", { class: "tm-row-ver" }, `v${pkg.version}`),
          h("span", { class: "tm-row-bar", "aria-hidden": "true" }, "▮".repeat(bars), h("i", null, "▮".repeat(12 - bars))),
          h("span", { class: "tm-row-size" }, formatSize(pkg.size)));
      };
      rows.push(h("div", { class: "tm-row-head" }, h("span", null, "本体"), h("span", null, "通用")));
      rows.push(row(ctx.host, "Koreplay", "APK"));
      for (const group of GROUPS) {
        const members = ctx.plugins().filter((pkg) => (PLUGINS[pkg.id]?.kind || "runtime") === group.kind);
        if (!members.length) continue;
        rows.push(h("div", { class: "tm-row-head" }, h("span", null, group.title), h("span", null, group.note)));
        for (const pkg of members) rows.push(row(pkg, PLUGINS[pkg.id]?.name || pkg.id, group.kind === "ui" ? "必需" : ""));
      }
      table.replaceChildren(...rows);
    }
    renderTable();
    d.add(ctx.onAbi(renderTable));

    d.on(window, "keydown", (event) => {
      if (event.key === "F1" || event.key === "F2") {
        event.preventDefault();
        ctx.setAbi(event.key === "F1" ? "arm64-v8a" : "armeabi-v7a");
      }
    });

    /* ---------- clock ---------- */
    const tickClock = () => { clock.textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false }); };
    tickClock();
    const clockTimer = setInterval(tickClock, 1000);
    d.add(() => clearInterval(clockTimer));

    /* ---------- matrix rain ---------- */
    let rainFrame = 0;
    function matrix() {
      if (reduced) return line(span("tm-dim", "已为减少动态效果的设置跳过动画。"));
      line(span("tm-ok", "Wake up, Neo… "), span("tm-dim", "（按任意键退出）"));
      const c = rain.getContext("2d");
      const rect = crt.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      rain.width = rect.width * dpr;
      rain.height = rect.height * dpr;
      c.scale(dpr, dpr);
      const size = 16;
      const cols = Math.ceil(rect.width / size);
      const drops = Array.from({ length: cols }, () => Math.random() * -40);
      const glyphs = "コレプレイKOREPLAY0123456789アイウエオカキクケコサシスセソ插件本体播放";
      rain.classList.add("is-on");
      const started = performance.now();
      const stop = () => {
        cancelAnimationFrame(rainFrame);
        rain.classList.remove("is-on");
        window.removeEventListener("keydown", stop, true);
        crt.removeEventListener("pointerdown", stop);
      };
      const draw = (now) => {
        c.fillStyle = "rgba(4, 10, 6, .12)";
        c.fillRect(0, 0, rect.width, rect.height);
        c.font = `${size}px monospace`;
        for (let i = 0; i < cols; i++) {
          const y = drops[i] * size;
          c.fillStyle = "#d8ffe6";
          c.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, y);
          c.fillStyle = "#39ff88";
          c.fillText(glyphs[(Math.random() * glyphs.length) | 0], i * size, y - size);
          if (y > rect.height && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 0.6;
        }
        if (now - started > 7000 || !alive) return stop();
        rainFrame = requestAnimationFrame(draw);
      };
      setTimeout(() => {
        window.addEventListener("keydown", stop, true);
        crt.addEventListener("pointerdown", stop);
      }, 300);
      rainFrame = requestAnimationFrame(draw);
      d.add(stop);
    }

    /* ---------- boot sequence ---------- */
    const BOOT = [
      ["[    0.000000] ", "Koreplay loader 启动"],
      ["[    0.004127] ", "挂载插件仓库 /plugins … ", "OK"],
      ["[    0.018330] ", `读取版本清单 ${release ? release.tag : "失败"} … `, release ? "OK" : "FAIL"],
      ["[    0.021954] ", `检测到 ${ctx.allPackages.length} 个安装包，签名已登记 … `, release ? "OK" : "SKIP"],
      ["[    0.026001] ", "启动交互式 shell"],
    ];
    let skip = false;
    const skipBoot = () => { skip = true; };
    d.on(window, "keydown", skipBoot, { once: true });
    d.on(screen, "pointerdown", skipBoot, { once: true });

    (async () => {
      for (const [stamp, text, status] of BOOT) {
        if (!alive) return;
        line(span("tm-dim", stamp), text, status ? span(status === "OK" ? "tm-ok" : "tm-err", `[ ${status} ]`) : "");
        if (!reduced && !skip) await sleep(170);
      }
      line("");
      if (!alive) return;
      if (!skip && !reduced) await type("欢迎使用 Koreplay。这是一个真的终端：输入 help 查看命令，或者直接点右边的安装包。", "tm-hl", 14);
      else line(span("tm-hl", "欢迎使用 Koreplay。这是一个真的终端：输入 help 查看命令，或者直接点右边的安装包。"));
      line("");
      await run("neofetch");
      if (alive && matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
    })();

    return () => d.run();
  },
};
