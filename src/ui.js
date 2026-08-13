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
    on(btn, "click", () => {
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
    });
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

// One render for both panes, same as the real client's render().
function renderShop() {
  const shop = $("shop-grid");
  if (shop) {
    shop.textContent = "";
    const sub = document.querySelector("#mm-shop .mm-pane-sub");
    if (sub) sub.textContent = SHOP_PITCH[shopCat] ?? "";

    const banner = document.createElement("div");
    banner.id = "stacks-banner";
    banner.classList.toggle("live", shopCat === "stacks");
    const bIcon = document.createElement("img");
    bIcon.src = "/images/stacks-web.webp";
    bIcon.alt = "";
    const bText = document.createElement("div");
    bText.className = "sb-text";
    const bTitle = document.createElement("b");
    bTitle.textContent = "GET STACKS";
    const bSub = document.createElement("span");
    bSub.textContent = "fuel the armory — up to +30% bonus on bigger packs";
    bText.append(bTitle, bSub);
    const bCta = document.createElement("span");
    bCta.className = "sb-cta";
    bCta.textContent = shopCat === "stacks" ? "PICK A PACK" : "SHOP PACKS →";
    banner.append(bIcon, bText, bCta);
    on(banner, "click", () => { shopCat = "stacks"; renderShop(); });
    shop.append(banner);

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
  }

  const stash = $("stash-grid");
  if (stash) {
    stash.textContent = "";
    const stashItems = (kind) => [
      ...SHOP_DEFAULTS.filter((i) => i.kind === kind),
      ...owned.map((id) => SHOP_CATALOG.find((i) => i.id === id)).filter((i) => i && i.kind === kind),
    ];
    const counts = new Map(KINDS.map(([k]) => [k, stashItems(k).length]));
    stash.append(chipRow(stashCat, counts, (k) => { stashCat = k; renderShop(); }));
    const grid = document.createElement("div");
    grid.className = "shop-grid";
    for (const item of stashItems(stashCat).sort(byRarity)) grid.append(card(item, true));
    stash.append(grid);
  }
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
    #mainmenu > .mm-head, #mainmenu > .mm-body { position: relative; z-index: 1; }
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

  const rand = (a, b) => a + Math.random() * (b - a);

  const makeEmber = (seed = false) => ({
    x: rand(0, W),
    y: seed ? rand(0, H) : H + rand(0, 60),
    r: rand(1.1, 3.2),
    vy: rand(240, 420),      // px/sec upward — fast rise
    vx: rand(-45, 45),       // px/sec sideways — sets the arc's launch angle
    ax: rand(-40, 40),       // sideways accel — this is what bends the path
    phase: rand(0, Math.PI * 2),
    flick: rand(6, 13),      // flicker speed
    life: rand(1.1, 3.2),    // short so they flare up and fade out fast
    age: seed ? rand(0, 2) : 0,
    hot: Math.random() < 0.28, // brighter, whiter sparks
  });

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
    const emberCount = Math.round(Math.min(45, (W * H) / 42000));
    embers = Array.from({ length: emberCount }, () => makeEmber(true));
    glows = Array.from({ length: 5 }, makeGlow);
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
    const a = fade * (0.65 + rise * 0.35) * flick;
    if (a <= 0) return;
    const x = e.x;

    // Outer halo — tight so it glows without smearing into haze.
    const halo = ctx.createRadialGradient(x, e.y, 0, x, e.y, e.r * 3);
    if (e.hot) {
      halo.addColorStop(0, `rgba(255, 220, 150, ${a * 0.7})`);
      halo.addColorStop(0.5, `rgba(255, 150, 60, ${a * 0.35})`);
    } else {
      halo.addColorStop(0, `rgba(255, 170, 80, ${a * 0.6})`);
      halo.addColorStop(0.5, `rgba(230, 120, 30, ${a * 0.28})`);
    }
    halo.addColorStop(1, "rgba(200, 80, 15, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, e.y, e.r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Bright solid core — this is what makes it read as a live spark.
    ctx.fillStyle = e.hot
      ? `rgba(255, 245, 225, ${Math.min(1, a * 1.15)})`
      : `rgba(255, 210, 150, ${Math.min(1, a)})`;
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
