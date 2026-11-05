const pluginNames = {
  ui: ["界面插件", "独立提供移动端界面，随本体更新保持兼容。"],
  java: ["Java 运行时", "运行依赖 Java 环境的扩展。"],
  python: ["Python 运行时", "运行 Python 扩展；按设备架构选择安装包。"],
  node: ["Node.js 运行时", "提供 Node.js 接口的运行环境。"],
  quickjs: ["QuickJS 运行时", "运行 QuickJS 脚本扩展。"],
  media3: ["Media3 播放组件", "提供 ExoPlayer / Media3 播放能力。"],
  ijk: ["IJK 播放组件", "提供 IJK 播放能力。"],
};

const abiLabels = {
  "arm64-v8a": "ARM64",
  "armeabi-v7a": "ARM32",
};

function formatSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function packageLink(pkg, label) {
  const link = document.createElement("a");
  link.className = "abi-link";
  link.href = pkg.url;
  link.download = pkg.file;
  link.title = `${pkg.file} · SHA-256 ${pkg.sha256}`;
  const name = document.createElement("strong");
  name.textContent = label;
  const detail = document.createElement("span");
  detail.textContent = `v${pkg.version} · ${formatSize(pkg.size)}`;
  link.append(name, detail);
  return link;
}

function render(manifest) {
  const host = manifest.packages.find((pkg) => pkg.id === "host");
  if (!host) throw new Error("版本清单缺少本体安装包");

  document.title = `Koreplay ${manifest.hostVersion} | 官方下载`;
  document.querySelector("#release-label").textContent = `应用版本 ${manifest.hostVersion}`;
  document.querySelector("#release-tag").textContent = manifest.releaseTag;
  document.querySelector("#host-version").textContent = `v${host.version} · ${formatSize(host.size)}`;

  const hostLink = document.querySelector("#host-link");
  hostLink.href = host.url;
  hostLink.download = host.file;
  hostLink.textContent = "下载 APK";
  hostLink.classList.remove("disabled");
  hostLink.removeAttribute("aria-disabled");

  const groups = new Map();
  for (const pkg of manifest.packages.filter((item) => item.id !== "host")) {
    if (!groups.has(pkg.id)) groups.set(pkg.id, []);
    groups.get(pkg.id).push(pkg);
  }

  const list = document.querySelector("#plugin-list");
  list.replaceChildren();
  for (const [id, packages] of groups) {
    const [name, description] = pluginNames[id] || [id, "独立安装的运行时插件。"];
    const row = document.createElement("article");
    row.className = "plugin-row";

    const icon = document.createElement("div");
    icon.className = "package-icon plugin-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = id.slice(0, 2).toUpperCase();

    const info = document.createElement("div");
    info.className = "package-info";
    const title = document.createElement("h3");
    title.textContent = name;
    const summary = document.createElement("p");
    summary.textContent = description;
    info.append(title, summary);

    const versions = document.createElement("span");
    versions.className = "version";
    versions.textContent = `版本 ${packages.map((pkg) => pkg.version).join(" / ")}`;

    const links = document.createElement("div");
    links.className = "abi-downloads";
    for (const abi of ["arm64-v8a", "armeabi-v7a"]) {
      const pkg = packages.find((item) => item.abi === abi);
      if (pkg) links.append(packageLink(pkg, abiLabels[abi]));
    }
    row.append(icon, info, versions, links);
    list.append(row);
  }

  document.querySelector("#checksums-link").href = manifest.checksums;
}

fetch("./data/latest.json", { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("暂时无法读取官方版本清单");
    return response.json();
  })
  .then(render)
  .catch((error) => {
    document.querySelector("#release-label").textContent = "版本清单暂不可用";
    document.querySelector("#plugin-list").innerHTML = "";
    const message = document.createElement("p");
    message.className = "error-state";
    message.textContent = `${error.message}。请稍后刷新页面。`;
    document.querySelector("#plugin-list").append(message);
    document.querySelector("#host-version").textContent = "暂不可用";
  });
