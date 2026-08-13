// pwnt UI shell — a standalone, offline harness for editing the menu.
//
// This repo is the game's index.html with the game REMOVED. There is no
// three.js, no wasm, no WebSocket, and nothing here reaches the network. The
// real client boots /src/main.ts, which pulls in the renderer and opens a
// socket to the game server on :8080; this file stands in for all of that with
// canned data so the menu renders fully populated and every pane is reachable.
//
// What that means when you edit:
//   - index.html and its <style> block are the real thing, byte for byte,
//     minus the Google Fonts link (vendored) and the main.ts script tag.
//   - Anything you change here must be carried back to the real client by
//     hand. This is a design surface, not a source of truth.
//   - Buttons that would talk to a server (deploy, buy, invite, chat) are
//     wired to local fakes. They look right; they do nothing.

const $ = (id) => document.getElementById(id);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

// ---------------------------------------------------------------- fake data

const OPERATOR = localStorage.getItem("fps.name") || "OPERATOR";

const FRIENDS = [
  { name: "Banana", online: true, status: "tdm" },
  { name: "Reaper", online: true, status: "shop" },
  { name: "Vex", online: true, status: "board" },
  { name: "Sable", online: true, status: "menu" },
  { name: "Koda", online: false, status: "" },
  { name: "Mirth", online: false, status: "" },
];

// Mirrors STATUS_LABEL in the real client.
const STATUS_LABEL = {
  tdm: "IN TDM",
  ffa: "IN FFA",
  menu: "IN MENU",
  shop: "IN THE ARMORY",
  stash: "IN THE STASH",
  board: "ON THE BOARD",
  social: "IN SOCIAL",
  settings: "IN SETTINGS",
};

// `fav` indexes CLS_SIL below — the favourite-class silhouette on a podium
// card. -1 means none, which the real client also allows.
const BOARD = [
  { name: "Vex", kills: 412, deaths: 180, wins: 38, hs: 31, fav: 1 },
  { name: "Banana", kills: 388, deaths: 205, wins: 35, hs: 24, fav: 0 },
  { name: OPERATOR, kills: 341, deaths: 199, wins: 31, hs: 28, fav: 2 },
  { name: "Reaper", kills: 296, deaths: 240, wins: 24, hs: 19, fav: 3 },
  { name: "Sable", kills: 271, deaths: 233, wins: 22, hs: 22, fav: 0 },
  { name: "Koda", kills: 188, deaths: 260, wins: 14, hs: 12, fav: -1 },
  { name: "Mirth", kills: 154, deaths: 221, wins: 11, hs: 17, fav: 2 },
  { name: "Halcyon", kills: 133, deaths: 190, wins: 9, hs: 15, fav: 1 },
];

const CLS_SIL = [
  "/icons/kf-assault.png",
  "/icons/kf-sniper.png",
  "/icons/kf-smg.png",
  "/icons/kf-shotgun.png",
];
const CLS_NAME = ["ASSAULT", "SNIPER", "SMG", "SHOTGUN"];

const SHOP = [
  { id: "tracer_glacier", kind: "tracer", name: "Glacier", hex: "#6fd9ff", cost: 150 },
  { id: "tracer_toxin", kind: "tracer", name: "Toxin", hex: "#7dff5a", cost: 150 },
  { id: "tracer_hellfire", kind: "tracer", name: "Hellfire", hex: "#ff4d3d", cost: 200 },
  { id: "tracer_voltage", kind: "tracer", name: "Voltage", hex: "#c77dff", cost: 200 },
  { id: "tracer_goldrush", kind: "tracer", name: "Goldrush", hex: "#ffd36b", cost: 250 },
  { id: "ward_ember", kind: "ward", name: "Ember", hex: "#ffb457", cost: 175 },
  { id: "ward_emerald", kind: "ward", name: "Emerald", hex: "#52ffa8", cost: 175 },
  { id: "ward_crimson", kind: "ward", name: "Crimson", hex: "#ff5d57", cost: 300 },
  { id: "gear_ash", kind: "gear", name: "Ash", hex: "#8d9299", cost: 200 },
  { id: "gear_sand", kind: "gear", name: "Sand", hex: "#c8a97a", cost: 200 },
  { id: "gear_arctic", kind: "gear", name: "Arctic", hex: "#dfe7ef", cost: 250 },
  { id: "name_gold", kind: "name", name: "Gold", hex: "#ffd36b", cost: 200 },
];

const OWNED = new Set(["tracer_glacier", "ward_ember", "gear_ash"]);
let stacks = 1450;

// ------------------------------------------------------------------- header

function paintHeader() {
  const user = $("mm-user");
  if (user) user.textContent = OPERATOR.toUpperCase();
  const cur = $("cur-stacks");
  if (cur) cur.textContent = stacks.toLocaleString();
  const tip = $("mm-tip");
  if (tip) tip.textContent = "offline UI shell — no server, no game loop";
}

// -------------------------------------------------------------------- panes

function setupTabs() {
  const tabs = document.querySelectorAll(".mm-tabs button");
  const panes = {
    play: $("mm-play"),
    settings: $("mm-settings"),
    shop: $("mm-shop"),
    stash: $("mm-stash"),
    board: $("mm-board"),
    social: $("mm-social"),
  };
  tabs.forEach((t) => {
    on(t, "click", () => {
      tabs.forEach((x) => x.classList.toggle("on", x === t));
      for (const [k, p] of Object.entries(panes)) {
        if (p) p.classList.toggle("on", k === t.dataset.tab);
      }
    });
  });
}

// -------------------------------------------------------------------- social

function paintFriends() {
  const list = $("soc-flist");
  if (!list) return;
  list.textContent = "";
  const sorted = [...FRIENDS].sort(
    (a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name),
  );
  for (const f of sorted) {
    const inGame = f.status === "tdm" || f.status === "ffa";
    const row = document.createElement("div");
    row.className = "soc-friend" + (f.online ? (inGame ? " ingame online" : " online") : "");
    const dot = document.createElement("span");
    dot.className = "dot";
    const fn = document.createElement("span");
    fn.className = "fn";
    fn.textContent = f.name;
    const st = document.createElement("span");
    st.className = "st";
    st.textContent = f.online ? (STATUS_LABEL[f.status] ?? "ONLINE") : "OFFLINE";
    row.append(dot, fn, st);
    if (f.online) {
      for (const label of ["DM", "INVITE"]) {
        const b = document.createElement("button");
        b.className = "fbtn";
        b.type = "button";
        b.textContent = label;
        on(b, "click", () => say(`${label.toLowerCase()} → ${f.name} (offline shell)`));
        row.append(b);
      }
    }
    list.append(row);
  }
}

function say(text, from = "") {
  const box = $("soc-msgs");
  if (!box) return;
  const line = document.createElement("div");
  line.className = "soc-msg" + (from ? "" : " sys");
  if (from) {
    const who = document.createElement("b");
    who.textContent = from + " ";
    line.append(who);
  }
  line.append(document.createTextNode(text));
  box.append(line);
  box.scrollTop = box.scrollHeight;
}

function setupSocial() {
  const tabs = $("soc-chat-tabs");
  if (tabs) {
    tabs.textContent = "";
    for (const name of ["GLOBAL", "Banana"]) {
      const b = document.createElement("button");
      b.type = "button";
      b.classList.toggle("on", name === "GLOBAL");
      b.textContent = name;
      on(b, "click", () => {
        [...tabs.children].forEach((c) => c.classList.toggle("on", c === b));
      });
      tabs.append(b);
    }
  }
  paintFriends();
  say("lobby chat is faked in this build — messages stay on your machine");
  say("nice shot", "Vex");
  say("running it back", "Banana");

  on($("soc-form"), "submit", (e) => {
    e.preventDefault();
    const input = $("soc-text");
    if (input && input.value.trim()) {
      say(input.value.trim(), OPERATOR);
      input.value = "";
    }
  });
  on($("soc-add-form"), "submit", (e) => {
    e.preventDefault();
    const input = $("soc-add-name");
    if (input && input.value.trim()) {
      FRIENDS.push({ name: input.value.trim(), online: false, status: "" });
      input.value = "";
      paintFriends();
    }
  });
}

// --------------------------------------------------------------------- board

const kd = (r) => (r.kills / Math.max(1, r.deaths)).toFixed(2);

// Mirrors renderBoard() in the real client: a 2nd|1st|3rd podium, then a
// header row, then the table carrying on from #4 so nobody appears twice.
function paintBoard(rowsData = BOARD) {
  const rowsEl = $("mm-lb-rows");
  if (!rowsEl) return;
  rowsEl.textContent = "";

  const podium = document.createElement("div");
  podium.className = "mm-podium";
  for (const i of [1, 0, 2]) {
    const r = rowsData[i];
    if (!r) continue;
    const pd = document.createElement("div");
    pd.className = `pd pd${i + 1}`;
    const card = document.createElement("div");
    card.className = "pd-card";
    const medal = document.createElement("div");
    medal.className = "pd-medal";
    if (i === 0) {
      medal.innerHTML =
        '<svg viewBox="0 0 24 14"><path d="M2 13 L2 4 L7.5 8 L12 1 L16.5 8 L22 4 L22 13 Z"/></svg>';
    } else {
      medal.textContent = String(i + 1);
    }
    card.append(medal);
    if (r.fav >= 0) {
      const sil = document.createElement("div");
      sil.className = "pd-sil";
      sil.style.setProperty("--sil", `url('${CLS_SIL[r.fav]}')`);
      sil.title = CLS_NAME[r.fav];
      card.append(sil);
    }
    const nm = document.createElement("div");
    nm.className = "pd-name";
    nm.textContent = r.name;
    const kills = document.createElement("div");
    kills.className = "pd-kills";
    const kn = document.createElement("b");
    kn.textContent = String(r.kills);
    kills.append(kn, " KILLS");
    const sub = document.createElement("div");
    sub.className = "pd-sub";
    sub.textContent = `${r.wins} W · K/D ${kd(r)} · ${r.hs} HS`;
    card.append(nm, kills, sub);
    const step = document.createElement("div");
    step.className = "pd-step";
    step.textContent = `#${i + 1}`;
    pd.append(card, step);
    podium.append(pd);
  }
  rowsEl.append(podium);

  const rest = rowsData.slice(3);
  if (!rest.length) return;
  const hdr = document.createElement("div");
  hdr.className = "mm-lb-row hdr";
  for (const [txt, cls] of [
    ["#", "mm-lb-rank"],
    ["Operator", ""],
    ["Kills", "mm-lb-k"],
    ["K/D", "mm-lb-kd"],
    ["Wins", "mm-lb-w"],
    ["HS", "mm-lb-hs"],
  ]) {
    const c = document.createElement("div");
    if (cls) c.className = cls;
    c.textContent = txt;
    hdr.append(c);
  }
  rowsEl.append(hdr);

  rest.forEach((r, j) => {
    const i = j + 3;
    const row = document.createElement("div");
    row.className = "mm-lb-row";
    for (const [cls, val] of [
      ["mm-lb-rank", `#${i + 1}`],
      ["", r.name],
      ["mm-lb-k", String(r.kills)],
      ["mm-lb-kd", kd(r)],
      ["mm-lb-w", String(r.wins)],
      ["mm-lb-hs", String(r.hs)],
    ]) {
      const c = document.createElement("div");
      if (cls) c.className = cls;
      c.textContent = val;
      row.append(c);
    }
    rowsEl.append(row);
  });
}

// Mode/period buttons: re-render with scaled numbers so switching visibly
// does something, the way it would against a real stats server.
function setupBoardControls() {
  const scaled = (f) =>
    BOARD.map((r) => ({
      ...r,
      kills: Math.round(r.kills * f),
      deaths: Math.round(r.deaths * f),
      wins: Math.round(r.wins * f),
    }));
  const factors = { life: 1, weekly: 0.22, daily: 0.05 };
  let period = "life";
  let mode = "tdm";
  const redraw = () => paintBoard(scaled(factors[period] * (mode === "ffa" ? 0.6 : 1)));
  document.querySelectorAll(".mm-periods button").forEach((b) => {
    on(b, "click", () => {
      document
        .querySelectorAll(".mm-periods button")
        .forEach((x) => x.classList.toggle("on", x === b));
      period = b.dataset.period || "life";
      redraw();
    });
  });
  document.querySelectorAll(".mm-modesel button").forEach((b) => {
    on(b, "click", () => {
      document
        .querySelectorAll(".mm-modesel button")
        .forEach((x) => x.classList.toggle("on", x === b));
      mode = b.dataset.lbmode || "tdm";
      redraw();
    });
  });
}

// ---------------------------------------------------------------- shop/stash

function card(item, owned) {
  const c = document.createElement("div");
  c.className = "shop-card" + (owned ? " owned" : "");
  const sw = document.createElement("div");
  sw.className = "shop-swatch";
  sw.style.background = item.hex;
  const nm = document.createElement("div");
  nm.className = "shop-name";
  nm.textContent = item.name;
  const kind = document.createElement("div");
  kind.className = "shop-kind";
  kind.textContent = item.kind.toUpperCase();
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-buy";
  btn.textContent = owned ? "OWNED" : `${item.cost}`;
  btn.disabled = owned;
  on(btn, "click", () => {
    if (stacks < item.cost) return say("not enough stacks (offline shell)");
    stacks -= item.cost;
    OWNED.add(item.id);
    paintHeader();
    paintShop();
    paintStash();
  });
  c.append(sw, nm, kind, btn);
  return c;
}

function paintShop() {
  const shop = $("shop-grid");
  if (!shop) return;
  shop.textContent = "";
  const grid = document.createElement("div");
  grid.className = "shop-grid";
  for (const item of SHOP) grid.append(card(item, OWNED.has(item.id)));
  shop.append(grid);
}

function paintStash() {
  const grid = $("stash-grid");
  if (!grid) return;
  grid.textContent = "";
  const owned = SHOP.filter((i) => OWNED.has(i.id));
  if (!owned.length) {
    const empty = document.createElement("div");
    empty.className = "mm-empty-sub";
    empty.textContent = "nothing owned yet — buy something in the armory";
    grid.append(empty);
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "shop-grid";
  for (const item of owned) wrap.append(card(item, true));
  grid.append(wrap);
}

// ------------------------------------------------------------------ settings

function setupSettings() {
  // Crosshair — same localStorage key and CSS vars as the real client, so a
  // look tuned here transfers.
  const DEF = { len: 9, th: 2, gap: 4, op: 0.92, dot: false };
  const cfg = { ...DEF, ...JSON.parse(localStorage.getItem("fps.xh") || "{}") };
  const apply = () => {
    for (const el of [$("crosshair"), $("xh-demo")]) {
      if (!el) continue;
      el.style.setProperty("--xh-len", `${cfg.len}px`);
      el.style.setProperty("--xh-th", `${cfg.th}px`);
      el.style.setProperty("--xh-gap", `${cfg.gap}px`);
      el.style.setProperty("--xh-op", String(cfg.op));
    }
    localStorage.setItem("fps.xh", JSON.stringify(cfg));
  };
  for (const [id, key, fmt] of [
    ["xh-len", "len", (v) => `${v}px`],
    ["xh-th", "th", (v) => `${v}px`],
    ["xh-gap", "gap", (v) => `${v}px`],
    ["xh-op", "op", (v) => Number(v).toFixed(2)],
  ]) {
    const el = $(id);
    const out = $(`${id}-v`);
    if (!el) continue;
    el.value = String(cfg[key]);
    if (out) out.textContent = fmt(cfg[key]);
    on(el, "input", () => {
      cfg[key] = Number(el.value);
      if (out) out.textContent = fmt(el.value);
      apply();
    });
  }
  apply();

  // Sliders that only need to move and persist in this build.
  for (const [id, key, fmt, def] of [
    ["ct-sens", "fps.sens", (v) => `${Number(v).toFixed(2)}x`, 1],
    ["au-vol", "fps.vol", (v) => `${Math.round(v * 100)}%`, 0.8],
    ["au-music", "fps.musicvol", (v) => `${Math.round(v * 100)}%`, 0.35],
  ]) {
    const el = $(id);
    const out = $(`${id}-v`);
    if (!el) continue;
    const saved = Number(localStorage.getItem(key));
    const val = Number.isFinite(saved) && localStorage.getItem(key) !== null ? saved : def;
    el.value = String(val);
    if (out) out.textContent = fmt(val);
    on(el, "input", () => {
      localStorage.setItem(key, el.value);
      if (out) out.textContent = fmt(el.value);
    });
  }
}

// ---------------------------------------------------------------------- boot

function openMenu() {
  document.querySelector("#overlay .card")?.classList.add("hidden-card");
  $("mainmenu")?.classList.add("show");
  document.documentElement.classList.remove("tomenu");
  paintHeader();
}

function setupDeploy() {
  on($("deploy-btn"), "click", () => {
    const nameIn = document.querySelector("#overlay input[type='text']");
    if (nameIn && nameIn.value.trim()) localStorage.setItem("fps.name", nameIn.value.trim());
    openMenu();
  });
  // Mode cards would drop you into a match. There is no game here, so say so
  // rather than half-starting something.
  for (const id of ["mm-mode-tdm", "mm-mode-ffa"]) {
    const el = $(id);
    if (!el) continue;
    on(el, "click", () => {
      const sub = el.querySelector(".mm-mode-sub");
      if (sub) sub.textContent = "UI shell — no game in this build";
    });
  }
  on($("mm-logout"), "click", () => {
    localStorage.removeItem("fps.name");
    location.reload();
  });
}

function boot() {
  setupTabs();
  setupDeploy();
  setupSocial();
  setupSettings();
  paintHeader();
  paintBoard();
  setupBoardControls();
  paintShop();
  paintStash();
  // The inline guard in index.html sets .tomenu when credentials are saved.
  if (document.documentElement.classList.contains("tomenu")) openMenu();
  // Nothing renders into #app in this build; drop the game canvas hole.
  const app = $("app");
  if (app) app.style.display = "none";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
