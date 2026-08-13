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

const BOARD = [
  { name: "Vex", kills: 412, deaths: 180, hs: 31 },
  { name: "Banana", kills: 388, deaths: 205, hs: 24 },
  { name: OPERATOR, kills: 341, deaths: 199, hs: 28 },
  { name: "Reaper", kills: 296, deaths: 240, hs: 19 },
  { name: "Sable", kills: 271, deaths: 233, hs: 22 },
  { name: "Koda", kills: 188, deaths: 260, hs: 12 },
];

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

function paintBoard() {
  const rows = $("mm-lb-rows");
  if (!rows) return;
  rows.textContent = "";
  BOARD.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "lb-row" + (r.name === OPERATOR ? " me" : "");
    for (const [cls, val] of [
      ["lb-rank", `#${i + 1}`],
      ["lb-name", r.name],
      ["lb-k", r.kills],
      ["lb-d", r.deaths],
      ["lb-kd", (r.kills / Math.max(1, r.deaths)).toFixed(2)],
      ["lb-hs", `${r.hs}%`],
    ]) {
      const c = document.createElement("span");
      c.className = cls;
      c.textContent = String(val);
      row.append(c);
    }
    rows.append(row);
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
