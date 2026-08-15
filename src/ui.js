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
  { name: "Banana", online: true, status: "tdm", level: 42 },
  { name: "Reaper", online: true, status: "shop", level: 71 },
  { name: "Vex", online: true, status: "board", level: 108 },
  { name: "Sable", online: true, status: "menu", level: 17 },
  { name: "Koda", online: false, status: "", level: 33 },
  { name: "Mirth", online: false, status: "", level: 9 },
];

// Mirrors the party widget's level-badge tiers: colour ramps up with rank.
function lvlTier(level) {
  if (level >= 100) return "t6";
  if (level >= 75) return "t5";
  if (level >= 50) return "t4";
  if (level >= 25) return "t3";
  if (level >= 10) return "t2";
  return "";
}

function makeLvlBadge(level) {
  const badge = document.createElement("span");
  badge.className = ("lvl-badge mini " + lvlTier(level)).trim();
  badge.style.setProperty("--p", `${level % 100}%`);
  const b = document.createElement("b");
  b.textContent = String(level);
  badge.append(b);
  return badge;
}

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

// Mirrors SHOP_CATALOG in the real client: id/kind/name/hex/price/tier.
// `hex` is a colour for most kinds but a DECAL TOKEN for patches, which is
// why patch previews load /images/patch_<hex>.webp.
const SHOP_CATALOG = [
  { id: "tracer_glacier", kind: "tracer", name: "Glacier", hex: "#6fd9ff", price: 150, tier: "common" },
  { id: "tracer_toxin", kind: "tracer", name: "Toxin", hex: "#7dff5a", price: 150, tier: "common" },
  { id: "tracer_hellfire", kind: "tracer", name: "Hellfire", hex: "#ff4d3d", price: 200, tier: "rare" },
  { id: "tracer_voltage", kind: "tracer", name: "Voltage", hex: "#c77dff", price: 200, tier: "rare" },
  { id: "tracer_abyss", kind: "tracer", name: "Abyss", hex: "#3d5aff", price: 200, tier: "rare" },
  { id: "tracer_goldrush", kind: "tracer", name: "Goldrush", hex: "#ffd36b", price: 250, tier: "epic" },
  { id: "tracer_whiteout", kind: "tracer", name: "Whiteout", hex: "#f2f6ff", price: 250, tier: "epic" },
  { id: "ward_ember", kind: "ward", name: "Ember", hex: "#ffb457", price: 175, tier: "common" },
  { id: "ward_emerald", kind: "ward", name: "Emerald", hex: "#52ffa8", price: 175, tier: "common" },
  { id: "ward_void", kind: "ward", name: "Void", hex: "#8a2be2", price: 175, tier: "common" },
  { id: "ward_gold", kind: "ward", name: "Gold", hex: "#ffd36b", price: 250, tier: "epic" },
  { id: "ward_crimson", kind: "ward", name: "Crimson", hex: "#ff5d57", price: 300, tier: "legendary" },
  { id: "name_copper", kind: "name", name: "Copper", hex: "#f79422", price: 100, tier: "common" },
  { id: "name_ice", kind: "name", name: "Ice", hex: "#6fd9ff", price: 100, tier: "common" },
  { id: "name_toxin", kind: "name", name: "Toxin", hex: "#7dff5a", price: 100, tier: "common" },
  { id: "name_gold", kind: "name", name: "Gold", hex: "#ffd36b", price: 200, tier: "epic" },
  { id: "gear_ash", kind: "gear", name: "Ash", hex: "#8d9299", price: 200, tier: "common" },
  { id: "gear_sand", kind: "gear", name: "Sand", hex: "#c8a97a", price: 200, tier: "common" },
  { id: "gear_forest", kind: "gear", name: "Forest", hex: "#5c7a52", price: 200, tier: "common" },
  { id: "gear_arctic", kind: "gear", name: "Arctic", hex: "#dfe7ef", price: 250, tier: "rare" },
  { id: "gear_crimson", kind: "gear", name: "Crimson", hex: "#a33c33", price: 300, tier: "epic" },
  { id: "gear_midnight", kind: "gear", name: "Midnight", hex: "#39415c", price: 300, tier: "epic" },
  { id: "patch_usa", kind: "patch", name: "United States", hex: "usa", price: 150, tier: "common" },
  { id: "patch_uk", kind: "patch", name: "United Kingdom", hex: "uk", price: 150, tier: "common" },
  { id: "patch_france", kind: "patch", name: "France", hex: "france", price: 150, tier: "common" },
  { id: "patch_germany", kind: "patch", name: "Germany", hex: "germany", price: 150, tier: "common" },
  { id: "patch_russia", kind: "patch", name: "Russia", hex: "russia", price: 150, tier: "common" },
  { id: "patch_china", kind: "patch", name: "China", hex: "china", price: 150, tier: "common" },
  { id: "patch_australia", kind: "patch", name: "Australia", hex: "australia", price: 150, tier: "common" },
];

// Free starting kit — always in the stash, never in the shop.
const SHOP_DEFAULTS = [
  { id: "tracer_default", kind: "tracer", name: "Ember", hex: "#ffb457", price: 0, tier: "" },
  { id: "ward_default", kind: "ward", name: "Frost", hex: "#78ebff", price: 0, tier: "" },
  { id: "name_default", kind: "name", name: "Steel", hex: "#e9f1f7", price: 0, tier: "" },
];

const KINDS = [
  ["tracer", "TRACERS"],
  ["ward", "SPAWN WARDS"],
  ["name", "CALLSIGNS"],
  ["gear", "OPERATOR GEAR"],
  ["patch", "PATCHES"],
];
const KIND_LABEL = { tracer: "tracer", ward: "spawn ward", name: "callsign" };
const SHOP_PITCH = {
  tracer: "every shot you fire is signed — the whole lobby watches YOUR colour cut the air",
  ward: "spawn like you mean it — your shield, your colour, their warning",
  name: "own the killfeed — callsign colours that make every frag read louder",
  gear: "paint your operator — kit colours everyone reads across the map",
  patch: "fly your colours — a shoulder patch every corpse gets a good look at",
  stacks: "fuel the armory — bigger packs carry a bonus",
};
const STACK_PACKS = [
  { id: "pk_pocket", name: "Pocket Stack", stacks: 500, bonus: 0, usd: 4.99, tag: "STARTER", line: "dip a toe in" },
  { id: "pk_crate", name: "Supply Crate", stacks: 1100, bonus: 10, usd: 9.99, tag: "MOST POPULAR", line: "the crowd favourite" },
  { id: "pk_vault", name: "Vault", stacks: 2400, bonus: 20, usd: 19.99, tag: "", line: "serious kit money" },
  { id: "pk_lode", name: "Motherlode", stacks: 6500, bonus: 30, usd: 49.99, tag: "BEST VALUE", line: "never count stacks again" },
];
// Featured drop + set/shipment framing shown at the top of the armory.
const FEATURED = {
  id: "tracer_hellfire",
  kicker: "FEATURED DROP",
  blurb: "Every shot you fire is a warning.",
  ends: "2D 14H LEFT",
  img: "/shop-featured-hellfire.webp",
};
const INFERNO_SET = {
  price: 499,
  bonus: "+30% STACKS",
  items: [
    { id: "tracer_hellfire", name: "HELLFIRE" },
    { id: "gear_crimson", name: "INFERNO HELM" },
    { id: "ward_crimson", name: "INFERNO CORE" },
  ],
};
const NEXT_SHIP = { in: "0D 21H 37M", line: "Weapon skins · Operator gear · More tracers" };

const TIER_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3, "": 4 };
const byRarity = (a, b) =>
  (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9) || a.price - b.price;

let owned = ["tracer_glacier", "ward_ember", "gear_ash"];
let equip = { tracer: "tracer_glacier" };
let shopCat = "tracer";
let stashCat = "tracer";
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
  const head = document.querySelector(".mm-head");
  const burger = $("mm-burger");
  const closeNav = () => {
    if (head) head.classList.remove("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  };
  if (burger && head) {
    on(burger, "click", () => {
      const open = head.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  tabs.forEach((t) => {
    on(t, "click", () => {
      tabs.forEach((x) => x.classList.toggle("on", x === t));
      for (const [k, p] of Object.entries(panes)) {
        if (p) p.classList.toggle("on", k === t.dataset.tab);
      }
      closeNav();
    });
  });
}

// -------------------------------------------------------------------- social

function paintFriends() {
  const list = $("soc-flist");
  if (!list) return;
  list.textContent = "";
  const byName = (a, b) => a.name.localeCompare(b.name);
  const online = FRIENDS.filter((f) => f.online).sort(byName);
  const offline = FRIENDS.filter((f) => !f.online).sort(byName);

  const section = (label, group) => {
    if (!group.length) return;
    const head = document.createElement("div");
    head.className = "soc-fhead";
    head.textContent = `${label} — ${group.length}`;
    list.append(head);
    for (const f of group) list.append(friendRow(f));
  };

  section("ONLINE", online);
  section("OFFLINE", offline);
}

function friendRow(f) {
  const inGame = f.status === "tdm" || f.status === "ffa";
  const row = document.createElement("div");
  row.className = "soc-friend" + (f.online ? (inGame ? " ingame online" : " online") : "");

  const badge = makeLvlBadge(f.level);

  const mid = document.createElement("div");
  mid.className = "soc-fmid";
  const fn = document.createElement("span");
  fn.className = "fn";
  fn.textContent = f.name;
  const st = document.createElement("span");
  st.className = "st";
  const dot = document.createElement("span");
  dot.className = "dot";
  const stText = document.createElement("span");
  stText.textContent = f.online ? (STATUS_LABEL[f.status] ?? "ONLINE") : "OFFLINE";
  st.append(dot, stText);
  mid.append(fn, st);

  row.append(badge, mid);

  if (f.online) {
    const acts = document.createElement("div");
    acts.className = "soc-facts";
    for (const label of ["DM", "INVITE"]) {
      const b = document.createElement("button");
      b.className = "fbtn";
      b.type = "button";
      b.textContent = label;
      on(b, "click", () => say(`${label.toLowerCase()} → ${f.name} (offline shell)`));
      acts.append(b);
    }
    row.append(acts);
  }
  return row;
}

// Known speakers get a signature colour; the dev (Banana) gets molten flair.
const SPEAKERS = {
  Vex: { color: "#6fd9ff" },
  Reaper: { color: "#ff8f6b" },
  Sable: { color: "#c8a97a" },
  Banana: { color: "#ffb45e", dev: true },
};
const NAME_PALETTE = ["#6fd9ff", "#7dff5a", "#ff8f6b", "#ffd36b", "#c77dff", "#52ffa8"];

function speakerColor(name) {
  if (SPEAKERS[name]) return SPEAKERS[name].color;
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return NAME_PALETTE[h % NAME_PALETTE.length];
}

function clockNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

let lastFrom = null;

function say(text, from = "") {
  const box = $("soc-msgs");
  if (!box) return;

  if (!from) {
    lastFrom = null;
    const sys = document.createElement("div");
    sys.className = "soc-msg sys";
    const inner = document.createElement("span");
    inner.textContent = text;
    sys.append(inner);
    box.append(sys);
    box.scrollTop = box.scrollHeight;
    return;
  }

  const self = from === OPERATOR;
  lastFrom = from;
  const isDev = SPEAKERS[from]?.dev;
  const accent = self ? "#35d07f" : speakerColor(from);

  const line = document.createElement("div");
  line.className = "soc-msg" + (self ? " self" : " other");
  line.style.setProperty("--accent", accent);

  const tick = document.createElement("span");
  tick.className = "soc-tick";
  line.append(tick);

  if (isDev) {
    const chip = document.createElement("span");
    chip.className = "dev-chip";
    chip.textContent = "DEV";
    line.append(chip);
  }

  const who = document.createElement("b");
  who.className = "name" + (isDev ? " dev-name" : "");
  if (!isDev) who.style.color = accent;
  who.textContent = from;
  line.append(who);

  const body = document.createElement("span");
  body.className = "soc-text";
  body.textContent = text;
  body.title = text;
  line.append(body);

  const time = document.createElement("time");
  time.textContent = clockNow();
  line.append(time);

  box.append(line);
  box.scrollTop = box.scrollHeight;
}

function setupSocial() {
  const tabs = $("soc-chat-tabs");
  if (tabs) {
    tabs.textContent = "";
    const activate = (b) =>
      [...tabs.children].forEach((c) => c.classList.toggle("on", c === b));

    const global = document.createElement("button");
    global.type = "button";
    global.className = "tab-global on";
    const gIcon = document.createElement("span");
    gIcon.className = "ti";
    gIcon.innerHTML =
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.5 2.6 15.5 0 18M12 3c-2.6 2.5-2.6 15.5 0 18"/></svg>';
    const gLabel = document.createElement("span");
    gLabel.className = "tl";
    gLabel.textContent = "Global";
    const gLive = document.createElement("i");
    gLive.className = "live";
    global.append(gIcon, gLabel, gLive);
    on(global, "click", () => activate(global));
    tabs.append(global);

    for (const name of ["Banana"]) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tab-dm";
      const dot = document.createElement("span");
      dot.className = "dm-dot online";
      const label = document.createElement("span");
      label.className = "tl";
      label.textContent = "@" + name;
      const x = document.createElement("i");
      x.className = "x";
      x.textContent = "\u00d7";
      on(x, "click", (e) => {
        e.stopPropagation();
        if (b.classList.contains("on")) activate(global);
        b.remove();
      });
      b.append(dot, label, x);
      on(b, "click", () => activate(b));
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
  if (!rowsData.length) return;

  const top = Math.max(1, rowsData[0].kills);
  const isMe = (r) => r.name === OPERATOR;
  const youTag = () => {
    const s = document.createElement("span");
    s.className = "mm-lb-you";
    s.textContent = "YOU";
    return s;
  };
  const clsIcon = (fav) => {
    if (fav < 0) return null;
    const el = document.createElement("i");
    el.style.setProperty("--sil", `url('${CLS_SIL[fav]}')`);
    el.title = CLS_NAME[fav];
    return el;
  };
  const clsLabel = (fav) => (fav >= 0 ? CLS_NAME[fav] : "UNRANKED CLASS");

  // ---- champion spotlight (rank 1)
  const c = rowsData[0];
  const champ = document.createElement("div");
  champ.className = "lb-champ" + (isMe(c) ? " me" : "");

  const crest = document.createElement("div");
  crest.className = "lb-champ-crest";
  crest.innerHTML =
    '<svg viewBox="0 0 24 14"><path d="M2 13 L2 4 L7.5 8 L12 1 L16.5 8 L22 4 L22 13 Z"/></svg>' +
    '<span class="lb-champ-num">01</span><span class="lb-champ-badge">CHAMPION</span>';

  const info = document.createElement("div");
  info.className = "lb-champ-info";
  const cName = document.createElement("div");
  cName.className = "lb-champ-name";
  const cNameTxt = document.createElement("span");
  cNameTxt.textContent = c.name;
  cName.append(cNameTxt);
  if (isMe(c)) cName.append(youTag());
  const cCls = document.createElement("div");
  cCls.className = "lb-champ-cls";
  const cIcon = clsIcon(c.fav);
  if (cIcon) cCls.append(cIcon);
  cCls.append(document.createTextNode(clsLabel(c.fav)));
  const stats = document.createElement("div");
  stats.className = "lb-champ-stats";
  for (const [val, lbl] of [
    [c.kills, "KILLS"],
    [kd(c), "K/D"],
    [c.wins, "WINS"],
    [c.hs, "HS"],
  ]) {
    const cs = document.createElement("div");
    cs.className = "cs";
    const b = document.createElement("b");
    b.textContent = String(val);
    const sp = document.createElement("span");
    sp.textContent = lbl;
    cs.append(b, sp);
    stats.append(cs);
  }
  info.append(cName, cCls, stats);
  champ.append(crest, info);
  if (c.fav >= 0) {
    const sil = document.createElement("div");
    sil.className = "lb-champ-sil";
    sil.style.setProperty("--sil", `url('${CLS_SIL[c.fav]}')`);
    champ.append(sil);
  }
  rowsEl.append(champ);

  // ---- contenders (rank 2 & 3)
  const duo = document.createElement("div");
  duo.className = "lb-duo";
  [1, 2].forEach((idx) => {
    const r = rowsData[idx];
    if (!r) return;
    const con = document.createElement("div");
    con.className = `lb-con con${idx + 1}` + (isMe(r) ? " me" : "");
    const num = document.createElement("div");
    num.className = "lb-con-num";
    num.textContent = `0${idx + 1}`;
    const body = document.createElement("div");
    body.className = "lb-con-body";
    const nm = document.createElement("div");
    nm.className = "lb-con-name";
    const nmTxt = document.createElement("span");
    nmTxt.textContent = r.name;
    nm.append(nmTxt);
    if (isMe(r)) nm.append(youTag());
    const cls = document.createElement("div");
    cls.className = "lb-con-cls";
    const cli = clsIcon(r.fav);
    if (cli) cls.append(cli);
    cls.append(document.createTextNode(clsLabel(r.fav)));
    const kills = document.createElement("div");
    kills.className = "lb-con-kills";
    const kb = document.createElement("b");
    kb.textContent = String(r.kills);
    kills.append(kb, "KILLS");
    const sub = document.createElement("div");
    sub.className = "lb-con-sub";
    sub.textContent = `${r.wins} W · K/D ${kd(r)} · ${r.hs} HS`;
    body.append(nm, cls, kills, sub);
    con.append(num, body);
    if (r.fav >= 0) {
      const sil = document.createElement("div");
      sil.className = "lb-con-sil";
      sil.style.setProperty("--sil", `url('${CLS_SIL[r.fav]}')`);
      con.append(sil);
    }
    duo.append(con);
  });
  rowsEl.append(duo);

  // ---- combat ladder (rank 4+)
  const rest = rowsData.slice(3);
  if (!rest.length) return;
  const ladder = document.createElement("div");
  ladder.className = "lb-ladder";
  const hdr = document.createElement("div");
  hdr.className = "lb-lad-hdr";
  for (const t of ["#", "Operator", "Kills", "K/D", "Wins", "HS"]) {
    const s = document.createElement("span");
    s.textContent = t;
    hdr.append(s);
  }
  ladder.append(hdr);

  rest.forEach((r, j) => {
    const i = j + 3;
    const me = isMe(r);
    const row = document.createElement("div");
    row.className = "lb-row" + (me ? " me" : "");
    row.style.setProperty("--share", `${Math.round((r.kills / top) * 100)}%`);

    const rank = document.createElement("div");
    rank.className = "lb-rank";
    rank.textContent = String(i + 1).padStart(2, "0");

    const op = document.createElement("div");
    op.className = "lb-op";
    const oi = clsIcon(r.fav);
    if (oi) op.append(oi);
    const nm = document.createElement("span");
    nm.className = "nm";
    nm.textContent = r.name;
    op.append(nm);
    if (me) op.append(youTag());
    row.append(rank, op);

    for (const [cls, val] of [
      ["lb-k", String(r.kills)],
      ["lb-kd", kd(r)],
      ["lb-w", String(r.wins)],
      ["lb-hs", String(r.hs)],
    ]) {
      const d = document.createElement("div");
      d.className = cls;
      d.textContent = val;
      row.append(d);
    }
    ladder.append(row);
  });
  rowsEl.append(ladder);
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

// preview(): each kind renders a different swatch element, and the stylesheet
// draws them — a tracer is a .streak, a ward an .orb, a callsign coloured
// text, gear a tinted portrait, a patch a decal image.
function preview(kind, hex) {
  const prev = document.createElement("div");
  prev.className = "shop-prev";
  if (kind === "patch") {
    const el = document.createElement("div");
    el.className = "patch-prev";
    const img = document.createElement("img");
    img.src = `/images/patch_${hex}.webp`;
    img.alt = "";
    el.append(img);
    prev.append(el);
    return prev;
  }
  if (kind === "gear") {
    const el = document.createElement("div");
    el.className = "gear-prev";
    el.style.setProperty("--c", hex);
    const img = document.createElement("img");
    img.src = "/images/op-portrait.webp";
    img.alt = "";
    el.append(img);
    prev.append(el);
    return prev;
  }
  if (kind === "name") {
    const el = document.createElement("div");
    el.className = "callsign";
    el.style.setProperty("--c", hex);
    el.textContent = OPERATOR;
    prev.append(el);
    return prev;
  }
  const el = document.createElement("div");
  el.className = kind === "tracer" ? "streak" : "orb";
  el.style.setProperty("--c", hex);
  prev.append(el);
  return prev;
}

function card(item, inStash) {
  const isEquipped =
    equip[item.kind] === item.id || (item.id.endsWith("_default") && !equip[item.kind]);
  const c = document.createElement("div");
  c.className =
    "shop-card" + (isEquipped ? " equipped" : "") + (item.tier ? ` tier-${item.tier}` : "");
  if (item.tier) {
    const tag = document.createElement("span");
    tag.className = "tier-tag";
    tag.textContent = item.tier.toUpperCase();
    c.append(tag);
  }
  c.append(preview(item.kind, item.hex));
  const nm = document.createElement("div");
  nm.className = "shop-name";
  nm.textContent = item.name;
  const kd_ = document.createElement("div");
  kd_.className = "shop-kind";
  kd_.textContent = KIND_LABEL[item.kind] ?? item.kind;
  c.append(nm, kd_);
  const has = owned.includes(item.id) || item.id.endsWith("_default");
  if (!inStash) {
    const price = document.createElement("div");
    price.className = "shop-price";
    const icon = document.createElement("img");
    icon.src = "/images/stacks-web.webp";
    icon.alt = "stacks";
    price.append(icon, String(item.price));
    c.append(price);
  }
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-btn";
  if (isEquipped) {
    btn.classList.add("eq");
    btn.textContent = "EQUIPPED";
  } else if (has) {
    btn.classList.add("own");
    btn.textContent = "EQUIP";
    on(btn, "click", () => {
      equip[item.kind] = item.id;
      renderShop();
    });
  } else {
    btn.textContent = "BUY";
    on(btn, "click", () => purchase(item, btn));
  }
  c.append(btn);
  if (!has) c.dataset.item = item.id;
  return c;
}

function chipRow(active, counts, pick) {
  const row = document.createElement("div");
  row.className = "mm-modesel shop-cats";
  for (const [kind, label] of KINDS) {
    const b = document.createElement("button");
    b.type = "button";
    b.classList.add(`chip-${kind}`);
    b.classList.toggle("on", kind === active);
    b.textContent = label;
    const n = counts.get(kind) ?? 0;
    if (n) {
      const i = document.createElement("i");
      i.className = "cat-n";
      i.textContent = String(n);
      b.append(i);
    }
    on(b, "click", () => pick(kind));
    row.append(b);
  }
  return row;
}

function stackCard(pk) {
  const c = document.createElement("div");
  c.className = `shop-card stack-pack ${pk.id}`;
  if (pk.tag) {
    const tag = document.createElement("div");
    tag.className = "sp-tag" + (pk.tag === "BEST VALUE" ? " best" : "");
    tag.textContent = pk.tag;
    c.append(tag);
  }
  const img = document.createElement("img");
  img.src = "/images/stacks-web.webp";
  img.alt = "";
  img.className = "sp-icon";
  const nm = document.createElement("div");
  nm.className = "shop-name";
  nm.textContent = pk.name;
  const amt = document.createElement("div");
  amt.className = "sp-amt";
  amt.textContent = pk.stacks.toLocaleString();
  const sub = document.createElement("div");
  sub.className = "sp-bonus";
  sub.textContent = pk.bonus ? `+${pk.bonus}% BONUS` : " ";
  const line = document.createElement("div");
  line.className = "sp-line";
  line.textContent = pk.line;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "shop-btn";
  btn.textContent = `$${pk.usd.toFixed(2)}`;
  on(btn, "click", () => {
    btn.textContent = "AFTER ALPHA";
    setTimeout(() => { btn.textContent = `$${pk.usd.toFixed(2)}`; }, 1400);
  });
  c.append(img, nm, amt, sub, line, btn);
  return c;
}

function mk(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
}

function purchase(item, btn) {
  if (stacks < item.price) {
    btn.classList.add("err");
    btn.textContent = "NOT ENOUGH";
    setTimeout(renderShop, 1400);
    return;
  }
  stacks -= item.price;
  owned = [...owned, item.id];
  equip[item.kind] = item.id;
  paintHeader();
  renderShop();
}

function stacksPrice(value, prefix) {
  const wrap = mk("span", "px-inline");
  if (prefix) wrap.append(document.createTextNode(prefix));
  const ic = document.createElement("img");
  ic.src = "/images/stacks-web.webp";
  ic.alt = "stacks";
  wrap.append(ic, document.createTextNode(String(value)));
  return wrap;
}

// Featured hero + "shop packs" aside — the top row of the armory.
function featuredTop() {
  const item = SHOP_CATALOG.find((i) => i.id === FEATURED.id);
  const wrap = mk("div", "shop-top");

  const feat = mk("div", "featured tier-" + item.tier);
  feat.style.setProperty("--rc", item.hex);
  const media = mk("div", "ft-media");
  const img = document.createElement("img");
  img.src = FEATURED.img;
  img.alt = "";
  media.append(img);
  feat.append(media);

  const info = mk("div", "ft-info");
  info.append(mk("span", "ft-kicker", FEATURED.kicker));
  const h = mk("h3", "ft-title");
  h.append(document.createTextNode(item.name.toUpperCase() + " "));
  h.append(mk("i", null, "// " + item.tier.toUpperCase()));
  info.append(h, mk("p", "ft-blurb", FEATURED.blurb), mk("span", "ft-timer", FEATURED.ends));

  const actions = mk("div", "ft-actions");
  const has = owned.includes(item.id);
  const isEq = equip[item.kind] === item.id;
  const buy = mk("button", "ft-buy");
  buy.type = "button";
  if (isEq) {
    buy.classList.add("eq");
    buy.textContent = "EQUIPPED";
  } else if (has) {
    buy.textContent = "EQUIP";
    on(buy, "click", () => { equip[item.kind] = item.id; renderShop(); });
  } else {
    buy.append(stacksPrice(item.price, "BUY FOR "));
    on(buy, "click", () => purchase(item, buy));
  }
  const prev = mk("button", "ft-preview", "VIEW PREVIEW");
  prev.type = "button";
  on(prev, "click", () => { shopCat = item.kind; renderShop(); });
  actions.append(buy, prev);
  info.append(actions);

  const dots = mk("div", "ft-dots");
  for (let i = 0; i < 4; i++) dots.append(mk("span", "ft-dot" + (i === 0 ? " on" : "")));
  info.append(dots);

  feat.append(info);
  wrap.append(feat);

  const aside = mk("div", "packs-aside");
  aside.append(mk("span", "pa-kicker", "LIVE IN INFERNO"));
  const paIcon = document.createElement("img");
  paIcon.src = "/images/stacks-web.webp";
  paIcon.alt = "";
  paIcon.className = "pa-icon";
  aside.append(paIcon, mk("p", "pa-line", "Fuel the servers. Up to +30% bonus on bigger packs."));
  const paBtn = mk("button", "pa-btn", "SHOP PACKS");
  paBtn.type = "button";
  on(paBtn, "click", () => { shopCat = "stacks"; renderShop(); });
  aside.append(paBtn);
  wrap.append(aside);

  return wrap;
}

// "Complete the set" progress strip.
function setStrip() {
  const strip = mk("div", "set-strip");
  strip.append(mk("span", "ss-kicker", "COMPLETE THE INFERNO SET"));

  const cells = mk("div", "ss-items");
  let have = 0;
  for (const s of INFERNO_SET.items) {
    const cat = SHOP_CATALOG.find((i) => i.id === s.id);
    const owns = owned.includes(s.id);
    if (owns) have++;
    const cell = mk("div", "ss-cell" + (owns ? " owned" : ""));
    const sw = mk("span", "ss-swatch");
    sw.style.setProperty("--c", cat.hex);
    cell.append(sw, mk("span", "ss-name", s.name));
    if (owns) cell.append(mk("i", "ss-check", "\u2713"));
    cells.append(cell);
  }
  strip.append(cells);

  const prog = mk("div", "ss-prog");
  prog.append(mk("span", "ss-count", `${have}/${INFERNO_SET.items.length} OWNED`));
  const bar = mk("div", "ss-bar");
  const fill = mk("i", "ss-fill");
  fill.style.width = `${(have / INFERNO_SET.items.length) * 100}%`;
  bar.append(fill);
  prog.append(bar, mk("span", "ss-bonus", INFERNO_SET.bonus));
  strip.append(prog);

  const btn = mk("button", "ss-btn");
  btn.type = "button";
  btn.append(stacksPrice(INFERNO_SET.price, "COMPLETE SET \u2014 "));
  on(btn, "click", () => {
    if (stacks < INFERNO_SET.price) {
      btn.textContent = "NOT ENOUGH";
      setTimeout(renderShop, 1400);
      return;
    }
    stacks -= INFERNO_SET.price;
    for (const s of INFERNO_SET.items) if (!owned.includes(s.id)) owned = [...owned, s.id];
    paintHeader();
    renderShop();
  });
  strip.append(btn);
  return strip;
}

// "Next shipment" teaser bar.
function shipBar() {
  const bar = mk("div", "ship-bar");
  const icon = document.createElement("img");
  icon.src = "/images/stacks-web.webp";
  icon.alt = "";
  icon.className = "sh-icon";
  const txt = mk("div", "sh-txt");
  txt.append(mk("span", "sh-kicker", "NEXT SHIPMENT"), mk("span", "sh-timer", NEXT_SHIP.in));
  bar.append(icon, txt, mk("p", "sh-line", NEXT_SHIP.line));
  const btn = mk("button", "sh-btn", "SNEAK PEEK");
  btn.type = "button";
  bar.append(btn);
  return bar;
}

// Equipped-gear summary shown at the top of the stash.
const isOwned = (id) => owned.includes(id) || id.endsWith("_default");

function optionsFor(kind) {
  return [
    ...SHOP_DEFAULTS.filter((i) => i.kind === kind),
    ...SHOP_CATALOG.filter((i) => i.kind === kind).sort(byRarity),
  ];
}

function loSwatch(item) {
  if (!item) return mk("span", "lo-sw empty");
  if (item.kind === "patch") {
    const s = mk("span", "lo-sw patch");
    const img = document.createElement("img");
    img.src = `/images/patch_${item.hex}.webp`;
    img.alt = "";
    s.append(img);
    return s;
  }
  const s = mk("span", "lo-sw");
  s.style.setProperty("--c", item.hex.startsWith("#") ? item.hex : "#5a6572");
  return s;
}

function optionRow(item, kind) {
  const own = isOwned(item.id);
  const equipped = equip[kind] === item.id || (item.id.endsWith("_default") && !equip[kind]);
  const r = mk("div", "opt" + (own ? "" : " locked") + (equipped ? " eq" : ""));
  r.append(loSwatch(item));
  const t = mk("div", "opt-txt");
  t.append(mk("span", "opt-name", item.name));
  if (item.tier) t.append(mk("span", "opt-tier tier-" + item.tier, item.tier));
  r.append(t);
  if (equipped) {
    r.append(mk("span", "opt-badge", "EQUIPPED"));
  } else if (own) {
    const b = mk("button", "opt-btn own", "EQUIP");
    b.type = "button";
    on(b, "click", () => { equip[kind] = item.id; paintHeader(); renderShop(); });
    r.append(b);
  } else {
    const b = mk("button", "opt-btn buy");
    b.type = "button";
    b.append(stacksPrice(item.price));
    on(b, "click", () => purchase(item, b));
    r.append(b);
  }
  return r;
}

function stashLoadout() {
  const wrap = mk("div", "stash-lo");
  const all = [...SHOP_DEFAULTS, ...SHOP_CATALOG];
  const bar = mk("div", "lo-bar");
  let openSlot = null;
  for (const [kind, label] of KINDS) {
    const equipped =
      all.find((i) => i.id === equip[kind]) || SHOP_DEFAULTS.find((i) => i.kind === kind) || null;
    const open = stashCat === kind;
    const slot = mk("button", "lo-slot" + (open ? " open" : ""));
    slot.type = "button";
    slot.setAttribute("aria-expanded", open ? "true" : "false");
    slot.append(loSwatch(equipped));
    const txt = mk("div", "sl-txt");
    txt.append(
      mk("span", "sl-kind", label),
      mk("span", "sl-name", equipped ? equipped.name : "None"),
    );
    slot.append(txt);
    slot.append(mk("span", "lo-chev"));
    on(slot, "click", () => { stashCat = open ? null : kind; renderShop(); });
    if (open) openSlot = slot;
    bar.append(slot);
  }
  wrap.append(bar);

  if (stashCat) {
    const kind = stashCat;
    const label = (KINDS.find(([k]) => k === kind) || ["", ""])[1];
    const opts = optionsFor(kind);
    const ownedN = opts.filter((o) => isOwned(o.id)).length;
    const drop = mk("div", "lo-drop");
    drop.append(mk("span", "lo-notch"));
    const dh = mk("div", "lo-drop-head");
    dh.append(mk("span", "ldh-label", label));
    dh.append(mk("span", "ldh-meta", `${ownedN} / ${opts.length} owned`));
    drop.append(dh);
    const grid = mk("div", "lo-grid");
    for (const item of opts) grid.append(optionRow(item, kind));
    drop.append(grid);
    wrap.append(drop);
    wrap._openSlot = openSlot;
    wrap._drop = drop;
  }
  return wrap;
}

// One render for both panes, same as the real client's render().
function renderShop() {
  const shop = $("shop-grid");
  if (shop) {
    shop.textContent = "";
    const sub = document.querySelector("#mm-shop .mm-pane-sub");
    if (sub) sub.textContent = SHOP_PITCH[shopCat] ?? "";

    shop.append(featuredTop());

    const counts = new Map(
      KINDS.map(([k]) => [k, SHOP_CATALOG.filter((i) => i.kind === k).length]),
    );
    shop.append(chipRow(shopCat, counts, (k) => { shopCat = k; renderShop(); }));
    const grid = document.createElement("div");
    grid.className = "shop-grid";
    if (shopCat === "stacks") {
      for (const pk of STACK_PACKS) grid.append(stackCard(pk));
    } else {
      for (const item of SHOP_CATALOG.filter((i) => i.kind === shopCat).sort(byRarity)) {
        grid.append(card(item, false));
      }
    }
    shop.append(grid);

    if (shopCat !== "stacks") {
      shop.append(setStrip(), shipBar());
    }
  }

  const stash = $("stash-grid");
  if (stash) {
    stash.textContent = "";
    const lo = stashLoadout();
    stash.append(lo);
    if (lo._openSlot && lo._drop) {
      const s = lo._openSlot;
      lo._drop.style.top = `${s.offsetTop + s.offsetHeight}px`;
      lo._drop.style.setProperty("--notch", `${s.offsetLeft + s.offsetWidth / 2}px`);
    }
    const foot = mk("div", "stash-foot");
    const more = mk("button", "stb-more", "Browse the full Armory \u2192");
    more.type = "button";
    on(more, "click", () => {
      const tab = document.querySelector('.mm-tabs [data-tab="shop"]');
      if (tab) tab.click();
    });
    foot.append(more);
    stash.append(foot);
  }
}

// ------------------------------------------------------------------ settings

// Paints the copper-filled portion of a range track up to its current value.
function setFill(el) {
  const min = Number(el.min || 0);
  const max = Number(el.max || 100);
  const pct = max > min ? ((Number(el.value) - min) / (max - min)) * 100 : 50;
  el.style.setProperty("--fill", `${pct.toFixed(1)}%`);
}

function setupSettings() {
  // Crosshair — same localStorage key and CSS vars as the real client, so a
  // look tuned here transfers.
  const DEF = { len: 9, th: 2, gap: 4, op: 0.92, dot: false, c: "#e9f1f7" };
  const cfg = { ...DEF, ...JSON.parse(localStorage.getItem("fps.xh") || "{}") };
  const apply = () => {
    for (const el of [$("crosshair"), $("xh-demo")]) {
      if (!el) continue;
      el.style.setProperty("--xh-len", `${cfg.len}px`);
      el.style.setProperty("--xh-th", `${cfg.th}px`);
      el.style.setProperty("--xh-gap", `${cfg.gap}px`);
      el.style.setProperty("--xh-op", String(cfg.op));
      el.style.setProperty("--xh-c", cfg.c);
      el.style.setProperty("--xh-dot", cfg.dot ? "block" : "none");
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
    setFill(el);
    if (out) out.textContent = fmt(cfg[key]);
    on(el, "input", () => {
      cfg[key] = Number(el.value);
      setFill(el);
      if (out) out.textContent = fmt(el.value);
      apply();
    });
  }

  // Crosshair colour — preset swatches plus a free colour picker, kept in sync.
  const SWATCHES = ["#e9f1f7", "#00e676", "#ff3b3b", "#f79422", "#25c4ff", "#ff4fd8"];
  const swatchWrap = $("xh-swatches");
  const colorInput = $("xh-c");
  const paintSwatches = () => {
    if (!swatchWrap) return;
    for (const i of swatchWrap.children) {
      i.classList.toggle("on", i.dataset.c.toLowerCase() === cfg.c.toLowerCase());
    }
  };
  if (swatchWrap) {
    swatchWrap.textContent = "";
    for (const hex of SWATCHES) {
      const i = document.createElement("i");
      i.dataset.c = hex;
      i.style.background = hex;
      i.setAttribute("role", "button");
      i.setAttribute("aria-label", `crosshair colour ${hex}`);
      i.tabIndex = 0;
      const pick = () => {
        cfg.c = hex;
        if (colorInput) colorInput.value = hex;
        paintSwatches();
        apply();
      };
      on(i, "click", pick);
      on(i, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      });
      swatchWrap.append(i);
    }
  }
  if (colorInput) {
    colorInput.value = cfg.c;
    on(colorInput, "input", () => {
      cfg.c = colorInput.value;
      paintSwatches();
      apply();
    });
  }
  paintSwatches();

  // Centre dot toggle.
  const dotEl = $("xh-dot");
  if (dotEl) {
    dotEl.checked = !!cfg.dot;
    on(dotEl, "change", () => {
      cfg.dot = dotEl.checked;
      apply();
    });
  }

  const reset = $("xh-reset");
  if (reset) {
    on(reset, "click", () => {
      Object.assign(cfg, DEF);
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
        setFill(el);
        if (out) out.textContent = fmt(cfg[key]);
      }
      if (colorInput) colorInput.value = cfg.c;
      if (dotEl) dotEl.checked = cfg.dot;
      paintSwatches();
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
    setFill(el);
    if (out) out.textContent = fmt(val);
    on(el, "input", () => {
      localStorage.setItem(key, el.value);
      setFill(el);
      if (out) out.textContent = fmt(el.value);
    });
  }

  // Resolution — segmented picker (visual persistence only in this shell).
  const seg = $("gx-res");
  if (seg) {
    const savedRes = localStorage.getItem("fps.res");
    const buttons = [...seg.querySelectorAll("button")];
    const select = (btn) => {
      for (const b of buttons) {
        const on2 = b === btn;
        b.classList.toggle("on", on2);
        b.setAttribute("aria-checked", on2 ? "true" : "false");
      }
      localStorage.setItem("fps.res", btn.dataset.res);
    };
    if (savedRes) {
      const match = buttons.find((b) => b.dataset.res === savedRes);
      if (match) select(match);
    }
    for (const b of buttons) on(b, "click", () => select(b));
  }

  // Filmic vignette — visual toggle persisted in this shell.
  const vig = $("gx-vig");
  if (vig) {
    const savedVig = localStorage.getItem("fps.vig");
    if (savedVig !== null) vig.checked = savedVig === "1";
    on(vig, "change", () => localStorage.setItem("fps.vig", vig.checked ? "1" : "0"));
  }
}

// ------------------------------------------------------------- ambient embers

// A living backdrop for the whole menu: warm sparks drift upward with a slow
// flicker, soft copper glows breathe behind them for depth, and the odd bright
// spark streaks through. Pure canvas — no assets, no network. It sits behind
// every pane (the cards are translucent charcoal, so they read cleanly on top).
function setupAmbient() {
  const menu = $("mainmenu");
  if (!menu) return;

  const style = document.createElement("style");
  style.textContent = `
    #mm-fx { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
    #mainmenu > .mm-body { position: relative; z-index: 1; }
    #mainmenu > .mm-head { position: relative; z-index: 3; }
    /* Cinematic vignette: darkens the far edges so the lit centre reads with
       depth, the way a AAA menu frames its focal point. */
    #mainmenu::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;
      background: radial-gradient(135% 105% at 50% 40%, transparent 56%, rgba(0, 0, 0, 0.34) 100%);
    }
  `;
  document.head.append(style);

  const canvas = document.createElement("canvas");
  canvas.id = "mm-fx";
  canvas.setAttribute("aria-hidden", "true");
  menu.prepend(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dpr = 1;
  let embers = [];
  let glows = [];
  let smoke = [];

  const rand = (a, b) => a + Math.random() * (b - a);

  const makeEmber = (seed = false) => ({
    x: rand(0, W),
    y: seed ? rand(0, H) : H + rand(0, 60),
    r: rand(0.8, 2.3),
    vy: rand(480, 780),      // px/sec upward — fast rise
    vx: rand(-120, 120),     // px/sec sideways — sets the arc's launch angle
    ax: rand(-130, 130),     // sideways accel — this is what bends the path
    phase: rand(0, Math.PI * 2),
    flick: rand(6, 13),      // flicker speed
    life: rand(0.7, 2.1),    // short so they flare up and fade out fast
    age: seed ? rand(0, 2) : 0,
    hot: Math.random() < 0.28, // brighter, whiter sparks
  });

  const makeSmoke = (seed = false) => {
    // Each puff is several offset lobes so its silhouette is irregular and
    // billowy rather than a single symmetric blob.
    const lobes = Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => ({
      ox: rand(-0.7, 0.7),      // offset as a fraction of the puff radius
      oy: rand(-0.9, 0.5),
      rf: rand(0.45, 0.95),     // this lobe's size relative to the puff
      swayX: rand(0.4, 1.1),    // per-lobe turbulence — they don't move in lockstep
      swayY: rand(0.3, 0.9),
      phase: rand(0, Math.PI * 2),
      amp: rand(0.05, 0.18),
    }));
    return {
      x: rand(0, W),
      y: seed ? rand(0, H) : H + rand(20, 90),
      r: rand(50, 100),          // starting radius — it swells as it climbs
      grow: rand(24, 52),        // px/sec the puff expands
      vy: rand(30, 60),          // slow lazy rise
      vx: rand(-16, 16),
      drift: rand(12, 30),       // sideways wander strength
      phase: rand(0, Math.PI * 2),
      sway: rand(0.25, 0.6),     // wander speed
      stretch: rand(1.25, 1.7),  // vertical elongation — smoke rises in columns
      life: rand(7, 13),         // long-lived so it fades gently
      age: seed ? rand(0, 6) : 0,
      lobes,
    };
  };

  const makeGlow = () => ({
    x: rand(0, W),
    y: rand(H * 0.25, H),
    r: rand(120, 280),
    vx: rand(-6, 6),
    vy: rand(-8, -2),
    phase: rand(0, Math.PI * 2),
    breathe: rand(0.25, 0.5),
  });

  const resize = () => {
    const w = menu.clientWidth, h = menu.clientHeight;
    if (w === 0 || h === 0) return; // menu still hidden — wait for it to show
    if (w === W && h === H) return; // no real change
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = w;
    H = h;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const emberCount = Math.round(Math.min(24, (W * H) / 80000));
    embers = Array.from({ length: emberCount }, () => makeEmber(true));
    glows = Array.from({ length: 5 }, makeGlow);
    const smokeCount = Math.round(Math.min(10, (W * H) / 200000));
    smoke = Array.from({ length: smokeCount }, () => makeSmoke(true));
  };

  const drawSmoke = (t) => {
    ctx.globalCompositeOperation = "source-over";
    for (const s of smoke) {
      // Puffs fade in, thin out as they swell, then fade away near end of life.
      const grown = 1 - Math.min(1, (s.r - 60) / 260) * 0.55;
      const fade = Math.min(1, s.age / 1.8) * Math.max(0, 1 - s.age / s.life);
      const base = fade * grown * 0.14;
      if (base <= 0) continue;
      const wob = Math.sin(t * s.sway + s.phase) * s.drift;
      ctx.save();
      ctx.translate(s.x + wob, s.y);
      ctx.scale(1, s.stretch);   // elongate vertically into a rising column
      for (const lo of s.lobes) {
        const tx = lo.ox * s.r + Math.sin(t * lo.swayX + lo.phase) * s.r * lo.amp;
        const ty = lo.oy * s.r + Math.cos(t * lo.swayY + lo.phase) * s.r * lo.amp;
        const lr = s.r * lo.rf;
        const a = base;
        const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, lr);
        grad.addColorStop(0, `rgba(158, 136, 120, ${a})`);
        grad.addColorStop(0.5, `rgba(112, 97, 88, ${a * 0.5})`);
        grad.addColorStop(1, "rgba(70, 60, 55, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(tx, ty, lr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  const drawGlows = (t) => {
    ctx.globalCompositeOperation = "lighter";
    for (const g of glows) {
      const pulse = 0.5 + 0.5 * Math.sin(t * g.breathe + g.phase);
      const a = 0.05 + pulse * 0.06;
      const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
      grad.addColorStop(0, `rgba(255, 150, 60, ${a})`);
      grad.addColorStop(0.5, `rgba(210, 100, 30, ${a * 0.4})`);
      grad.addColorStop(1, "rgba(120, 50, 10, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawEmber = (e, t) => {
    const fade = Math.min(1, e.age / 0.6) * Math.max(0, 1 - e.age / e.life);
    const rise = 1 - e.y / H;
    const flick = 0.75 + 0.25 * Math.sin(t * e.flick + e.phase);
    const a = fade * (0.8 + rise * 0.2) * flick;
    if (a <= 0) return;
    const x = e.x;

    // Outer halo — tight so it glows without smearing into haze.
    const halo = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.r * 3);
    if (e.hot) {
      halo.addColorStop(0, `rgba(255, 235, 190, ${Math.min(1, a)})`);
      halo.addColorStop(0.5, `rgba(255, 165, 70, ${a * 0.5})`);
    } else {
      halo.addColorStop(0, `rgba(255, 190, 100, ${a * 0.85})`);
      halo.addColorStop(0.5, `rgba(240, 135, 40, ${a * 0.42})`);
    }
    halo.addColorStop(1, "rgba(200, 80, 15, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, e.y, e.r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Bright solid core — this is what makes it read as a live spark.
    ctx.fillStyle = e.hot
      ? `rgba(255, 250, 235, ${Math.min(1, a * 1.4)})`
      : `rgba(255, 225, 175, ${Math.min(1, a * 1.25)})`;
    ctx.beginPath();
    ctx.arc(x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();
  };

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const active = menu.classList.contains("show") && !document.hidden;

    if (active) {
      ctx.clearRect(0, 0, W, H);
      drawSmoke(t);
      for (const s of smoke) {
        s.age += dt;
        s.x += s.vx * dt;
        s.y -= s.vy * dt;
        s.r += s.grow * dt;
        if (s.age >= s.life || s.y + s.r < -20)
          Object.assign(s, makeSmoke(false));
      }
      drawGlows(t);
      ctx.globalCompositeOperation = "lighter";
      for (const g of glows) {
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        if (g.y + g.r < 0) { g.y = H + g.r; g.x = rand(0, W); }
        if (g.x < -g.r) g.x = W + g.r;
        if (g.x > W + g.r) g.x = -g.r;
      }
      for (const e of embers) {
        e.age += dt;
        e.vx += e.ax * dt;       // bend the trajectory into an arc
        e.vy *= 1 - 0.22 * dt;   // buoyancy fades — the ember slows and arcs over
        e.x += e.vx * dt;
        e.y -= e.vy * dt;
        drawEmber(e, t);
        if (e.age >= e.life || e.y < -20 || e.x < -40 || e.x > W + 40)
          Object.assign(e, makeEmber(false));
      }
      ctx.globalCompositeOperation = "source-over";
    }
    requestAnimationFrame(frame);
  };

  if (reduce) {
    // Static, calm field — draw once the menu has real size, then stop.
    const ro = new ResizeObserver(() => {
      resize();
      if (W === 0 || H === 0) return;
      ctx.clearRect(0, 0, W, H);
      drawSmoke(0);
      drawGlows(0);
      for (const e of embers) drawEmber(e, 0);
      ctx.globalCompositeOperation = "source-over";
    });
    ro.observe(menu);
    return;
  }

  new ResizeObserver(resize).observe(menu);
  requestAnimationFrame(frame);
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
  renderShop();
  setupAmbient();
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
