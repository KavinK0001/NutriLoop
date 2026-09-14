/* ==========================================================================
   NutriLoop — app.js
   Vanilla ES6+ SPA logic: state, live clock, contextual banners, choice
   engine, surplus broadcast bus, mock Vision AI scanner, toasts.
   No frameworks. All rendering is template-string based + event delegation.
   ========================================================================== */
"use strict";

/* ---------------- Central state ---------------- */
const state = {
  activeRole: "student", // 'student' | 'kitchen'
  activeStudentTab: "student", // 'student' | 'scanner'
  selections: {}, // dishId -> qty
  locked: false,
  surplusAlerts: [], // { id, slot, items, count, counter, validBefore, time }
  scanHistory: [], // { id, tier, label, dishes, time, fileName }
  autoBroadcastDone: {}, // slotName -> dateKey (prevents repeat auto alerts)
  prepBoost: {}, // dishId -> extra demand from locked prefs
};

/* ---------------- Static campus data ---------------- */
const MEAL_SLOTS = [
  { name: "Breakfast", start: "07:00", end: "09:00", icon: "sunrise", emoji: "☀️" },
  { name: "Lunch", start: "12:30", end: "14:30", icon: "sandwich", emoji: "🥪" },
  { name: "Snacks", start: "16:30", end: "18:15", icon: "cookie", emoji: "🌙" },
  { name: "Dinner", start: "19:00", end: "20:45", icon: "moon-star", emoji: "🍳" },
];

// 15-min broadcast trigger = 15 min before slot end
const SURPLUS_TRIGGER = {
  Breakfast: "08:45",
  Lunch: "14:15",
  Snacks: "18:00",
  Dinner: "20:30",
};

// Mock MessIT menu (grouped). emoji used as lightweight dish art.
const MENU_DATA = [
  {
    meal: "Breakfast",
    slot: "07:00 – 09:00",
    items: [
      { id: "b-dosa", name: "Masala Dosa", category: "Veg", emoji: "🥞", serving: "2 pcs + sambar", protein: 8, fibre: 3, carbs: 52, fats: 12, tags: { protein: "yellow", fibre: "yellow", carbs: "red", fats: "yellow" } },
      { id: "b-egg", name: "Boiled Eggs", category: "Non-Veg", emoji: "🥚", serving: "2 eggs", protein: 13, fibre: 0, carbs: 1, fats: 10, tags: { protein: "green", fibre: "red", carbs: "green", fats: "yellow" } },
      { id: "b-idli", name: "Idli Sambar", category: "Vegan", emoji: "🍚", serving: "4 pcs + sambar", protein: 7, fibre: 5, carbs: 44, fats: 3, tags: { protein: "yellow", fibre: "green", carbs: "yellow", fats: "green" } },
      { id: "b-poha", name: "Veg Poha", category: "Vegan", emoji: "🍛", serving: "1 plate", protein: 5, fibre: 4, carbs: 46, fats: 7, tags: { protein: "yellow", fibre: "green", carbs: "yellow", fats: "yellow" } },
      { id: "b-omelette", name: "Bread Omelette", category: "Non-Veg", emoji: "🍳", serving: "2 slice + 2 egg", protein: 14, fibre: 1, carbs: 28, fats: 16, tags: { protein: "green", fibre: "red", carbs: "yellow", fats: "red" } },
      { id: "b-coffee", name: "Filter Coffee", category: "Veg", emoji: "☕", serving: "150 ml", protein: 2, fibre: 0, carbs: 9, fats: 3, tags: { protein: "yellow", fibre: "red", carbs: "yellow", fats: "green" } },
    ],
  },
  {
    meal: "Lunch",
    slot: "12:30 – 14:30",
    items: [
      { id: "l-paneer", name: "Paneer Butter Masala", category: "Veg", emoji: "🧀", serving: "150 g + gravy", protein: 14, fibre: 3, carbs: 12, fats: 22, tags: { protein: "green", fibre: "yellow", carbs: "green", fats: "red" } },
      { id: "l-dal", name: "Dal Tadka", category: "Vegan", emoji: "🍲", serving: "1 katori", protein: 9, fibre: 7, carbs: 22, fats: 5, tags: { protein: "green", fibre: "green", carbs: "green", fats: "green" } },
      { id: "l-rice", name: "Jeera Rice", category: "Vegan", emoji: "🍚", serving: "1 plate", protein: 4, fibre: 1, carbs: 58, fats: 4, tags: { protein: "red", fibre: "red", carbs: "red", fats: "green" } },
      { id: "l-chapati", name: "Whole Wheat Chapati", category: "Vegan", emoji: "🫓", serving: "3 pcs", protein: 8, fibre: 6, carbs: 42, fats: 3, tags: { protein: "yellow", fibre: "green", carbs: "yellow", fats: "green" } },
      { id: "l-curd", name: "Curd Rice / Curd", category: "Veg", emoji: "🥣", serving: "1 katori", protein: 6, fibre: 0, carbs: 12, fats: 5, tags: { protein: "yellow", fibre: "red", carbs: "green", fats: "yellow" } },
      { id: "l-papad", name: "Roasted Papad", category: "Vegan", emoji: "🫧", serving: "2 pcs", protein: 3, fibre: 1, carbs: 14, fats: 1, tags: { protein: "yellow", fibre: "red", carbs: "yellow", fats: "green" } },
    ],
  },
  {
    meal: "Snacks",
    slot: "16:30 – 18:15",
    items: [
      { id: "s-samosa", name: "Punjabi Samosa", category: "Veg", emoji: "🥟", serving: "2 pcs", protein: 5, fibre: 2, carbs: 38, fats: 20, tags: { protein: "red", fibre: "red", carbs: "red", fats: "red" } },
      { id: "s-puff", name: "Veg Puff", category: "Veg", emoji: "🥐", serving: "1 pc", protein: 4, fibre: 1, carbs: 32, fats: 18, tags: { protein: "red", fibre: "red", carbs: "red", fats: "red" } },
      { id: "s-chai", name: "Masala Chai", category: "Veg", emoji: "🍵", serving: "150 ml", protein: 2, fibre: 0, carbs: 11, fats: 3, tags: { protein: "yellow", fibre: "red", carbs: "yellow", fats: "green" } },
      { id: "s-pakora", name: "Bread Pakora", category: "Vegan", emoji: "🍞", serving: "2 pcs", protein: 6, fibre: 2, carbs: 30, fats: 16, tags: { protein: "yellow", fibre: "yellow", carbs: "red", fats: "red" } },
    ],
  },
  {
    meal: "Dinner",
    slot: "19:00 – 20:45",
    items: [
      { id: "d-chicken", name: "Chicken Curry", category: "Non-Veg", emoji: "🍗", serving: "150 g", protein: 24, fibre: 1, carbs: 6, fats: 14, tags: { protein: "green", fibre: "red", carbs: "green", fats: "yellow" } },
      { id: "d-vegkolha", name: "Veg Kolhapuri", category: "Vegan", emoji: "🥗", serving: "150 g", protein: 7, fibre: 6, carbs: 18, fats: 9, tags: { protein: "yellow", fibre: "green", carbs: "green", fats: "yellow" } },
      { id: "d-dal", name: "Dal Fry", category: "Vegan", emoji: "🍲", serving: "1 katori", protein: 9, fibre: 7, carbs: 21, fats: 5, tags: { protein: "green", fibre: "green", carbs: "green", fats: "green" } },
      { id: "d-roti", name: "Tandoori Roti", category: "Vegan", emoji: "🫓", serving: "3 pcs", protein: 9, fibre: 6, carbs: 45, fats: 3, tags: { protein: "yellow", fibre: "green", carbs: "yellow", fats: "green" } },
      { id: "d-gulab", name: "Gulab Jamun", category: "Veg", emoji: "🍩", serving: "2 pcs", protein: 3, fibre: 0, carbs: 42, fats: 12, tags: { protein: "red", fibre: "red", carbs: "red", fats: "red" } },
    ],
  },
];

// Kitchen: static baseline vs live demand seed
const PREP_TARGETS = [
  { dishId: "b-egg", label: "Boiled Eggs", unit: "units", demand: 450, baseline: 700 },
  { dishId: "l-paneer", label: "Paneer Portions", unit: "portions", demand: 320, baseline: 500 },
  { dishId: "l-dal", label: "Dal Servings", unit: "servings", demand: 610, baseline: 750 },
  { dishId: "l-rice", label: "Rice Servings", unit: "servings", demand: 580, baseline: 800 },
  { dishId: "d-chicken", label: "Chicken Portions", unit: "portions", demand: 240, baseline: 400 },
  { dishId: "d-roti", label: "Roti Pieces", unit: "pcs", demand: 1150, baseline: 1500 },
];

// Mock Vision AI profiles (deterministic rotation)
const SCAN_PROFILES = [
  {
    tier: "A", title: "Excellent balance — high protein, smart carbs",
    dishes: [
      { name: "Dal Tadka", conf: "98%", protein: 9, fibre: 7, carbs: 22, fats: 5, tags: { protein: "green", fibre: "green", carbs: "green", fats: "green" } },
      { name: "Boiled Eggs", conf: "96%", protein: 13, fibre: 0, carbs: 1, fats: 10, tags: { protein: "green", fibre: "red", carbs: "green", fats: "yellow" } },
      { name: "Whole Wheat Chapati", conf: "91%", protein: 8, fibre: 6, carbs: 42, fats: 3, tags: { protein: "yellow", fibre: "green", carbs: "yellow", fats: "green" } },
    ],
  },
  {
    tier: "S", title: "S-Tier · textbook sustainable plate",
    dishes: [
      { name: "Dal Fry", conf: "99%", protein: 9, fibre: 7, carbs: 21, fats: 5, tags: { protein: "green", fibre: "green", carbs: "green", fats: "green" } },
      { name: "Veg Kolhapuri", conf: "94%", protein: 7, fibre: 6, carbs: 18, fats: 9, tags: { protein: "yellow", fibre: "green", carbs: "green", fats: "yellow" } },
      { name: "Curd", conf: "90%", protein: 6, fibre: 0, carbs: 12, fats: 5, tags: { protein: "yellow", fibre: "red", carbs: "green", fats: "yellow" } },
    ],
  },
  {
    tier: "C", title: "Average — heavy on refined carbs, light on protein",
    dishes: [
      { name: "Jeera Rice", conf: "97%", protein: 4, fibre: 1, carbs: 58, fats: 4, tags: { protein: "red", fibre: "red", carbs: "red", fats: "green" } },
      { name: "Punjabi Samosa", conf: "88%", protein: 5, fibre: 2, carbs: 38, fats: 20, tags: { protein: "red", fibre: "red", carbs: "red", fats: "red" } },
      { name: "Dal Tadka", conf: "85%", protein: 9, fibre: 7, carbs: 22, fats: 5, tags: { protein: "green", fibre: "green", carbs: "green", fats: "green" } },
    ],
  },
];

/* ---------------- Helpers ---------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const nowMinutes = (d = new Date()) => d.getHours() * 60 + d.getMinutes();
const dateKey = (d = new Date()) => d.toISOString().slice(0, 10);

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
}
function badgeForCategory(cat) {
  if (cat === "Non-Veg") return '<span class="badge badge-nonveg"><span style="width:.45rem;height:.45rem;border-radius:99px;border:1.5px solid currentColor;display:inline-block"></span>Non-Veg</span>';
  if (cat === "Vegan") return '<span class="badge badge-vegan">Vegan</span>';
  return '<span class="badge badge-veg"><span style="width:.45rem;height:.45rem;border-radius:99px;border:1.5px solid currentColor;display:inline-block"></span>Veg</span>';
}

/* ---------------- Toast system (shadcn style) ---------------- */
function toast(title, message, type = "success", icon = null) {
  const root = $("#toast-root");
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  const iconName = icon || (type === "success" ? "check-circle-2" : type === "alert" ? "megaphone" : type === "error" ? "alert-triangle" : "info");
  el.innerHTML = `<span class="toast-icon"><i data-lucide="${iconName}"></i></span>
    <div><strong>${esc(title)}</strong><p>${esc(message)}</p></div>`;
  root.appendChild(el);
  refreshIcons();
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, 4200);
}

/* ---------------- Time engine ---------------- */
function getSlotStatus(slot, nowMin) {
  const s = toMinutes(slot.start), e = toMinutes(slot.end);
  if (nowMin >= s && nowMin <= e) return "live";
  // "soon" = within 60 min before start
  if (nowMin < s && s - nowMin <= 60) return "soon";
  return "closed";
}
function activeSlot(nowMin = nowMinutes()) {
  return MEAL_SLOTS.find((s) => nowMin >= toMinutes(s.start) && nowMin <= toMinutes(s.end)) || null;
}
// Contextual banner spec from brief
function contextualFor(nowMin) {
  const inRange = (a, b) => nowMin >= toMinutes(a) && nowMin <= toMinutes(b);
  if (inRange("07:00", "09:00"))
    return { emoji: "☀️", title: "Breakfast Time! Submit your choices for Lunch (12:30 PM)", desc: "Kitchen starts lunch prep from your live demand — lock quantities before 11:30 AM.", nextMeal: "Lunch" };
  if (inRange("12:30", "14:30"))
    return { emoji: "🥪", title: "Lunch Time! Submit your choices for Snacks (04:30 PM)", desc: "Evening snack batch is sized from this window's selections.", nextMeal: "Snacks" };
  if (inRange("16:30", "18:15"))
    return { emoji: "🌙", title: "Snacks Time! Submit your choices for Dinner (07:00 PM)", desc: "Dinner proteins (paneer / chicken) are cooked to your forecasted count.", nextMeal: "Dinner" };
  if (inRange("19:00", "20:45"))
    return { emoji: "🍳", title: "Dinner Time! Submit your choices for Tomorrow's Breakfast", desc: "Overnight prep (eggs, batter, poha) locks at 10:00 PM from tonight's demand.", nextMeal: "Breakfast" };
  // Outside slots → point to next upcoming
  const order = ["07:00", "12:30", "16:30", "19:00"];
  const labels = ["Breakfast (07:00 AM)", "Lunch (12:30 PM)", "Snacks (04:30 PM)", "Dinner (07:00 PM)"];
  for (let i = 0; i < order.length; i++) {
    if (nowMin < toMinutes(order[i]))
      return { emoji: "⏰", title: `Coming up: ${labels[i]} — pre-select now`, desc: "Early demand signals help the kitchen cut overproduction before the slot opens.", nextMeal: labels[i].split(" ")[0] };
  }
  return { emoji: "🌅", title: "Kitchen closed — plan Tomorrow's Breakfast", desc: "Selections made now seed the 5:00 AM prep sheet.", nextMeal: "Breakfast" };
}

/* ---------------- Render: slots ---------------- */
function renderSlots() {
  const nowMin = nowMinutes();
  const grid = $("#slot-grid");
  grid.innerHTML = MEAL_SLOTS.map((s) => {
    const status = getSlotStatus(s, nowMin);
    const badge = status === "live"
      ? '<span class="badge badge-live"><span style="width:.4rem;height:.4rem;border-radius:99px;background:currentColor;display:inline-block"></span>LIVE</span>'
      : status === "soon" ? '<span class="badge badge-soon">Starting soon</span>' : '<span class="badge badge-closed">Closed</span>';
    const counts = { Breakfast: "612 locked", Lunch: "845 locked", Snacks: "388 locked", Dinner: "704 locked" };
    return `<div class="card slot-card ${status === "live" ? "is-live" : ""}">
      <div class="slot-top"><span class="slot-name"><i data-lucide="${s.icon}"></i>${s.name}</span>${badge}</div>
      <div class="slot-time">${s.start} – ${s.end}</div>
      <div class="slot-count">${counts[s.name].split(" ")[0]}</div>
      <div class="slot-sub">${counts[s.name].split(" ").slice(1).join(" ")} preferences · surplus at ${SURPLUS_TRIGGER[s.name]}</div>
    </div>`;
  }).join("");
  refreshIcons();
}

/* ---------------- Render: menu / choice engine ---------------- */
function renderMenu() {
  const host = $("#menu-groups");
  host.innerHTML = MENU_DATA.map((group) => `
    <div class="meal-group-label"><span>${esc(group.meal)}</span><span class="badge badge-outline">${esc(group.slot)}</span><span class="line"></span></div>
    <div class="grid grid-menu">
      ${group.items.map((item) => {
        const qty = state.selections[item.id] || 0;
        return `<article class="card dish-card" data-dish="${item.id}">
          <div class="dish-media" aria-hidden="true">${item.emoji}</div>
          <div class="dish-body">
            <div class="dish-title-row">
              <span class="dish-title">${esc(item.name)}</span>
              ${badgeForCategory(item.category)}
            </div>
            <div class="dish-meta">${esc(item.serving)} · P ${item.protein}g · C ${item.carbs}g · F ${item.fats}g</div>
            <div class="qty-row">
              <span class="serving-note">Qty (servings)</span>
              <span class="qty-ctrl" role="group" aria-label="Quantity for ${esc(item.name)}">
                <button class="qty-btn" type="button" data-action="dec" data-dish="${item.id}" aria-label="Decrease"><i data-lucide="minus"></i></button>
                <input class="qty-val" data-dish-input="${item.id}" value="${qty}" inputmode="numeric" aria-label="${esc(item.name)} quantity" />
                <button class="qty-btn" type="button" data-action="inc" data-dish="${item.id}" aria-label="Increase"><i data-lucide="plus"></i></button>
              </span>
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>`).join("");
  refreshIcons();
  updateLockSummary();
}

function setQty(dishId, qty) {
  qty = Math.max(0, Math.min(10, Number.isFinite(+qty) ? +qty : 0));
  state.selections[dishId] = qty;
  const input = document.querySelector(`[data-dish-input="${dishId}"]`);
  if (input) input.value = qty;
  updateLockSummary();
}

function updateLockSummary() {
  const entries = Object.entries(state.selections).filter(([, q]) => q > 0);
  const servings = entries.reduce((a, [, q]) => a + q, 0);
  // Short mobile-first label fits the sticky thumb-zone CTA
  $("#lock-summary").textContent = `${entries.length} items · ${servings} servings`;
  const ctx = contextualFor(nowMinutes());
  $("#choice-subtitle").textContent = `Pick exact quantities for ${ctx.nextMeal}. Kitchen cooks to your demand — nothing more.`;
}

/* ---------------- Render: surplus feeds ---------------- */
function surplusCard(a) {
  return `<div class="alert alert-amber surplus-banner">
    <span class="alert-icon"><i data-lucide="megaphone"></i></span>
    <div style="flex:1">
      <div class="alert-title">📢 SURPLUS ALERT: ${esc(a.items)} remaining at ${esc(a.counter)}!</div>
      <div class="alert-desc">Head over before <strong>${esc(a.validBefore)}</strong> to claim extra portions · ${esc(a.slot)} slot · broadcast ${esc(a.time)}</div>
    </div>
    <span class="badge badge-soon">${esc(a.slot)}</span>
  </div>`;
}

function renderSurplus() {
  const feed = $("#surplus-feed");
  feed.innerHTML = state.surplusAlerts.length
    ? state.surplusAlerts.slice().reverse().map(surplusCard).join("")
    : `<div class="feed-empty">No surplus alerts right now. Broadcasts appear here 15 minutes before each slot closes.</div>`;
  const kf = $("#kitchen-feed");
  kf.innerHTML = state.surplusAlerts.length
    ? state.surplusAlerts.slice().reverse().slice(0, 4).map(surplusCard).join("")
    : `<div class="feed-empty">No broadcasts yet this session.</div>`;
  refreshIcons();
}

function pushSurplus({ slot, items, counter, validBefore, count }) {
  const now = new Date();
  const alert = {
    id: `s-${Date.now()}`,
    slot, items, counter, validBefore, count,
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  state.surplusAlerts.push(alert);
  renderSurplus();
  // Kitchen metrics nudge
  bumpMetrics(count);
  toast("Surplus broadcast live", `${items} at ${counter} — students notified.`, "alert", "megaphone");
  return alert;
}

/* ---------------- Render: kitchen prep ---------------- */
function effectiveDemand(t) {
  return t.demand + (state.prepBoost[t.dishId] || 0);
}
function renderPrep() {
  const host = $("#prep-list");
  host.innerHTML = PREP_TARGETS.map((t) => {
    const demand = effectiveDemand(t);
    const pctDemand = Math.min(100, Math.round((demand / t.baseline) * 100));
    const saved = Math.max(0, t.baseline - demand);
    return `<div class="prep-row">
      <div class="prep-top">
        <span class="prep-name">${esc(t.label)} Requested: <strong>${demand} ${esc(t.unit)}</strong></span>
        <span class="prep-vals">Baseline ${t.baseline} ${esc(t.unit)} · saving ${saved} ${esc(t.unit)}</span>
      </div>
      <div class="progress" role="progressbar" aria-valuenow="${pctDemand}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(t.label)} demand vs baseline">
        <span style="width:${pctDemand}%"></span>
      </div>
      <div class="progress baseline mt-1" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(t.label)} static baseline">
        <span style="width:100%"></span>
      </div>
    </div>`;
  }).join("") + `
    <div class="progress-legend">
      <span><span class="legend-swatch" style="background:hsl(var(--primary))"></span>Live demand (forecast)</span>
      <span><span class="legend-swatch" style="background:hsl(var(--muted-foreground) / .55)"></span>Old static baseline</span>
    </div>
    <div class="savings-callout"><i data-lucide="trending-down"></i><span id="savings-line">Forecast cooking saves ≈ ${totalSavedUnits()} units vs static baseline today.</span></div>`;
  refreshIcons();
}
function totalSavedUnits() {
  return PREP_TARGETS.reduce((a, t) => a + Math.max(0, t.baseline - effectiveDemand(t)), 0).toLocaleString("en-IN");
}

let metrics = { kg: 18.4, rs: 4620, portions: 312 };
function renderMetrics() {
  $("#metric-saved-kg").textContent = `${metrics.kg.toFixed(1)} kg`;
  $("#metric-saved-rs").textContent = `₹${metrics.rs.toLocaleString("en-IN")}`;
  $("#metric-portions").textContent = metrics.portions.toLocaleString("en-IN");
}
function bumpMetrics(extraPortions = 0) {
  const n = Number(extraPortions) || 0;
  metrics.portions += n;
  metrics.kg = +(metrics.kg + n * 0.22).toFixed(1);
  metrics.rs += Math.round(n * 28);
  renderMetrics();
  renderPrep();
}

/* ---------------- Render: scanner ---------------- */
function dot(cls) { return `<span class="dot dot-${cls}"></span>`; }
function macroRows(d) {
  const row = (label, val, tag) => `<div class="macro-row"><span>${label}</span><span class="macro-val">${val}g ${dot(tag)}</span></div>`;
  return row("Protein", d.protein, d.tags.protein) + row("Fibre", d.fibre, d.tags.fibre) + row("Carbs", d.carbs, d.tags.carbs) + row("Fats", d.fats, d.tags.fats);
}
function renderScanResult(profile, fileName) {
  const out = $("#scan-output");
  out.innerHTML = `
    <div class="tier-stage">
      <div class="tier-badge tier-${profile.tier}" aria-label="Plate tier ${profile.tier}">${profile.tier}</div>
      <div class="tier-copy">
        <h3>${profile.tier}-Tier Plate</h3>
        <p>${esc(profile.title)} · matched against today's MessIT menu (${esc(fileName)}).</p>
        <p class="mt-1"><span class="badge badge-primary"><i data-lucide="sparkles"></i> Vision AI · mock response</span></p>
      </div>
    </div>
    <h4 class="small mt-2" style="font-weight:800">Identified dishes</h4>
    <ul class="detect-list mt-1">
      ${profile.dishes.map((d) => `<li><i data-lucide="check-circle-2"></i>${esc(d.name)}<span class="conf">${esc(d.conf)} match</span></li>`).join("")}
    </ul>
    <h4 class="small mt-2" style="font-weight:800">Macronutrient breakdown</h4>
    <div class="grid grid-macros mt-1">
      ${profile.dishes.map((d) => `<div class="macro-card"><h4>${esc(d.name)}</h4>${macroRows(d)}</div>`).join("")}
    </div>`;
  refreshIcons();
}
function renderHistory() {
  const host = $("#scan-history");
  if (!state.scanHistory.length) { host.innerHTML = `<div class="feed-empty">No scans recorded yet.</div>`; return; }
  host.innerHTML = state.scanHistory.slice().reverse().slice(0, 5).map((h) => `
    <div class="alert"><span class="alert-icon"><i data-lucide="scan-line"></i></span>
      <div><div class="alert-title">Tier ${h.tier} · ${esc(h.fileName)}</div>
      <div class="alert-desc">${esc(h.label)} · ${esc(h.time)} · ${h.dishes.length} dishes detected</div></div>
      <span class="badge badge-outline" style="margin-left:auto">${esc(h.tier)}-Tier</span>
    </div>`).join("");
  refreshIcons();
}

/* ---------------- Clock + contextual + auto surplus ---------------- */
function tickClock() {
  const now = new Date();
  $("#clock-time").textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const nowMin = nowMinutes(now);
  const slot = activeSlot(nowMin);
  $("#clock-slot").textContent = slot ? `· ${slot.name} LIVE` : "· Between slots";

  const ctx = contextualFor(nowMin);
  $("#contextual-title").textContent = `${ctx.emoji} ${ctx.title}`;
  $("#contextual-desc").textContent = ctx.desc;

  renderSlotsThrottled();
  autoSurplusCheck(now, nowMin);
}

let lastSlotRender = 0;
function renderSlotsThrottled() {
  const t = Date.now();
  if (t - lastSlotRender > 30000) { lastSlotRender = t; renderSlots(); }
}

// Fire a demo broadcast automatically inside each 15-min pre-close window.
function autoSurplusCheck(now, nowMin) {
  const key = dateKey(now);
  const defaults = {
    Breakfast: { items: "60 Veg Puffs & 30 Servings of Poha", counter: "Counter 1", validBefore: "09:00 AM", count: 90 },
    Lunch: { items: "45 Boiled Eggs & 20 Servings of Dal", counter: "Counter 2", validBefore: "02:30 PM", count: 65 },
    Snacks: { items: "40 Samosas & 25 Cups of Chai", counter: "Counter 3", validBefore: "06:15 PM", count: 65 },
    Dinner: { items: "35 Chicken Portions & 50 Rotis", counter: "Counter 2", validBefore: "08:45 PM", count: 85 },
  };
  for (const slot of MEAL_SLOTS) {
    const trig = toMinutes(SURPLUS_TRIGGER[slot.name]);
    const end = toMinutes(slot.end);
    if (nowMin >= trig && nowMin <= end && state.autoBroadcastDone[slot.name] !== key) {
      state.autoBroadcastDone[slot.name] = key;
      const d = defaults[slot.name];
      pushSurplus({ slot: slot.name, ...d });
    }
  }
}

/* ---------------- View / role switching (tab bar synced) ---------------- */
function currentView() {
  if (state.activeRole === "kitchen") return "kitchen";
  return state.activeStudentTab; // 'student' | 'scanner'
}
function syncTabbar() {
  const v = currentView();
  $$(".tabbar-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.view === v));
}
// Unified entry point used by header switcher, desktop tabs, and bottom tab bar.
function goTo(view) {
  if (view === "kitchen") { setRole("kitchen"); return; }
  if (state.activeRole === "kitchen") setRole("student");
  setStudentTab(view === "scanner" ? "scanner" : "student");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function setRole(role) {
  state.activeRole = role;
  const isKitchen = role === "kitchen";
  $("#role-student-btn").setAttribute("aria-pressed", String(!isKitchen));
  $("#role-kitchen-btn").setAttribute("aria-pressed", String(isKitchen));
  $("#student-view").classList.toggle("hidden", isKitchen || state.activeStudentTab !== "student");
  $("#scanner-view").classList.toggle("hidden", isKitchen || state.activeStudentTab !== "scanner");
  $("#student-tabs").style.display = isKitchen ? "none" : "";
  $("#kitchen-view").classList.toggle("hidden", !isKitchen);
  // Sticky lock CTA only belongs to the meals view
  const lockBar = $("#lock-bar");
  if (lockBar) lockBar.style.display = (!isKitchen && state.activeStudentTab === "student") ? "" : "none";
  syncTabbar();
  refreshIcons();
}
function setStudentTab(tab) {
  state.activeStudentTab = tab;
  const ts = $("#tab-student"), tc = $("#tab-scanner");
  if (ts) ts.setAttribute("aria-selected", String(tab === "student"));
  if (tc) tc.setAttribute("aria-selected", String(tab === "scanner"));
  if (state.activeRole === "student") {
    $("#student-view").classList.toggle("hidden", tab !== "student");
    $("#scanner-view").classList.toggle("hidden", tab !== "scanner");
  }
  const lockBar = $("#lock-bar");
  if (lockBar) lockBar.style.display = (state.activeRole === "student" && tab === "student") ? "" : "none";
  syncTabbar();
  refreshIcons();
}

/* ---------------- Events ---------------- */
function bindEvents() {
  $("#role-student-btn").addEventListener("click", () => goTo("student"));
  $("#role-kitchen-btn").addEventListener("click", () => goTo("kitchen"));
  $$(".view-tabs button").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.view)));
  // Bottom tab bar — primary mobile navigation
  $$(".tabbar-btn").forEach((b) => b.addEventListener("click", () => goTo(b.dataset.view)));

  // Theme toggle (persisted)
  $("#theme-toggle").addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("nutriloop-theme", dark ? "dark" : "light"); } catch (_) {}
    $("#theme-toggle").innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;
    refreshIcons();
  });

  // Quantity delegation (buttons + manual input)
  $("#menu-groups").addEventListener("click", (e) => {
    const btn = e.target.closest(".qty-btn");
    if (!btn) return;
    const id = btn.dataset.dish;
    const cur = state.selections[id] || 0;
    setQty(id, btn.dataset.action === "inc" ? cur + 1 : cur - 1);
  });
  $("#menu-groups").addEventListener("change", (e) => {
    const input = e.target.closest("[data-dish-input]");
    if (input) setQty(input.getAttribute("data-dish-input"), parseInt(input.value, 10));
  });

  // Lock preferences
  $("#lock-prefs-btn").addEventListener("click", () => {
    const entries = Object.entries(state.selections).filter(([, q]) => q > 0);
    if (!entries.length) { toast("Nothing selected", "Add at least one serving before locking preferences.", "error"); return; }
    const servings = entries.reduce((a, [, q]) => a + q, 0);
    state.locked = true;
    // Feed locked demand into kitchen forecast
    for (const [id, q] of entries) state.prepBoost[id] = (state.prepBoost[id] || 0) + q * 12;
    renderPrep();
    toast("Preferences locked", `${entries.length} dishes · ${servings} servings sent to kitchen forecast.`, "success", "lock");
  });
  $("#reset-prefs-btn").addEventListener("click", () => {
    state.selections = {}; state.locked = false;
    renderMenu();
    toast("Selections cleared", "Quantities reset to zero.", "success", "rotate-ccw");
  });

  // Surplus broadcast form
  $("#surplus-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const slot = $("#surplus-slot").value;
    const items = $("#surplus-items").value.trim();
    const counter = $("#surplus-counter").value;
    const validBefore = $("#surplus-valid").value.trim() || "end of slot";
    const count = parseInt($("#surplus-count").value, 10) || 0;
    if (!items) { toast("Missing details", "Describe the remaining items first.", "error"); return; }
    pushSurplus({ slot, items, counter, validBefore, count });
    if (state.activeRole === "student") toast("Students notified", "Switch views to see the live banner.", "success", "bell-ring");
  });
  $("#surplus-simulate").addEventListener("click", () => {
    $("#surplus-slot").value = "Lunch";
    $("#surplus-items").value = "45 Boiled Eggs & 20 Servings of Dal";
    $("#surplus-counter").value = "Counter 2";
    $("#surplus-count").value = "65";
    $("#surplus-valid").value = "02:30 PM";
    toast("Console pre-filled", "Review and hit Broadcast to push the 15-minute alert.", "success", "zap");
  });

  // Scanner: dropzone interactions (mobile camera-first)
  const dz = $("#dropzone"), fi = $("#tray-input"), fiCam = $("#tray-camera-input");
  const camBtn = $("#camera-btn"), galBtn = $("#gallery-btn");
  if (camBtn) camBtn.addEventListener("click", (e) => { e.stopPropagation(); (fiCam || fi).click(); });
  if (galBtn) galBtn.addEventListener("click", (e) => { e.stopPropagation(); fi.click(); });
  if (fiCam) fiCam.addEventListener("change", () => { if (fiCam.files.length) handleTrayFile(fiCam.files[0]); });
  dz.addEventListener("click", () => fi.click());
  dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fi.click(); } });
  ["dragenter", "dragover"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("is-drag"); }));
  ["dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("is-drag"); }));
  dz.addEventListener("drop", (e) => { if (e.dataTransfer.files.length) handleTrayFile(e.dataTransfer.files[0]); });
  fi.addEventListener("change", () => { if (fi.files.length) handleTrayFile(fi.files[0]); });

  // Analyze
  $("#analyze-btn").addEventListener("click", runMockAnalysis);
}

/* ---------------- Scanner logic ---------------- */
let pendingTray = null;
let scanCount = 0;

function handleTrayFile(file) {
  if (!file.type.startsWith("image/")) { toast("Invalid file", "Please upload an image file.", "error"); return; }
  pendingTray = file;
  const url = URL.createObjectURL(file);
  $("#preview-img").src = url;
  $("#preview-wrap").classList.add("show");
  $("#preview-name").textContent = file.name;
  $("#preview-size").textContent = `${(file.size / 1024).toFixed(0)} KB · ${file.type.split("/")[1].toUpperCase()}`;
  $("#analyze-btn").disabled = false;
  toast("Tray photo ready", "Hit Analyze to run the mock Vision AI pipeline.", "success", "camera");
}

function runMockAnalysis() {
  if (!pendingTray) return;
  const btn = $("#analyze-btn");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Analyzing tray…`;
  $("#scan-output").innerHTML = `<div class="skeleton"></div><p class="small muted mt-1">Matching dishes against today's MessIT menu · estimating macros…</p>`;

  setTimeout(() => {
    const profile = SCAN_PROFILES[scanCount % SCAN_PROFILES.length];
    scanCount += 1;
    renderScanResult(profile, pendingTray.name);
    state.scanHistory.push({
      id: `scan-${Date.now()}`, tier: profile.tier, label: profile.title,
      dishes: profile.dishes, fileName: pendingTray.name,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    renderHistory();
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="scan-line"></i> Analyze Tray Quality &amp; Macros`;
    refreshIcons();
    toast(`Plate graded ${profile.tier}-Tier`, profile.title, profile.tier <= "B" ? "success" : "alert", "award");
  }, 1600);
}

/* ---------------- Init ---------------- */
function init() {
  try {
    if (localStorage.getItem("nutriloop-theme") === "dark") {
      document.documentElement.classList.add("dark");
      $("#theme-toggle").innerHTML = `<i data-lucide="sun"></i>`;
    }
  } catch (_) {}
  // Seed with one demo broadcast so student view isn't empty on first paint
  if (!state.surplusAlerts.length) {
    state.surplusAlerts.push({
      id: "seed-1", slot: "Lunch", items: "45 Boiled Eggs & 20 Servings of Dal",
      counter: "Counter 2", validBefore: "02:30 PM", count: 65,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }
  renderSlots(); lastSlotRender = Date.now();
  renderMenu();
  renderSurplus();
  renderPrep();
  renderMetrics();
  renderHistory();
  bindEvents();
  syncTabbar();
  tickClock();
  setInterval(tickClock, 1000);
  // Sync label = today
  $("#sync-label").textContent = `Menu synced from messit.vinnovateit.com · ${new Date().toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}`;
  refreshIcons();
}

document.addEventListener("DOMContentLoaded", init);
