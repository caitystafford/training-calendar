/* =============================================================================
   Cashies Training Calendar — application logic

   You should not need to edit this file to update the calendar. All content
   lives in data/training-data.js.
   ============================================================================= */

(function () {
  "use strict";

  /* --- State ------------------------------------------------------------- */
  const state = {
    view: "calendar",           // calendar | list
    area: null,                 // null = All, otherwise a BUSINESS_AREAS key
    types: new Set(),           // empty = all
    departments: new Set(),     // empty = all
    thisMonth: false,           // restrict to the current calendar month
    search: "",
    periodMode: "fy",           // fy | cy
    periodYear: FY.startYear,   // year the visible window starts in
    modal: null,                // null | 'detail' | 'log' | 'request' | 'done'
  };

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const STATES_AU = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "NT", "ACT", "National"];

  /* --- Icons -------------------------------------------------------------- */
  const ICONS = {
    all: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    stores: '<path d="M3 9h18l-1.6-5H4.6L3 9Z"/><path d="M5 9v11h14V9"/><path d="M9.5 20v-5.5h5V20"/>',
    ccpf: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11"/><path d="M14.8 9.4c0-1.1-1.25-2-2.8-2s-2.8.9-2.8 2 1.25 2 2.8 2 2.8.9 2.8 2-1.25 2-2.8 2-2.8-.9-2.8-2"/>',
    "head-office": '<path d="M4 21V6l8-3 8 3v15"/><path d="M3 21h18"/><path d="M9.5 21v-5h5v5"/><path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01M8.5 13h.01M15.5 13h.01"/>',
    external: '<path d="M14 3h7v7"/><path d="M10.5 13.5 21 3"/><path d="M21 14.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5.5"/>',
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  }

  /* --- Small helpers ----------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Pick navy or white text for a coloured background, whichever reads better. */
  function textOn(hex) {
    const n = parseInt(hex.slice(1), 16);
    const srgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
    return (L + 0.05) / 0.0655 >= 1.05 / (L + 0.05) ? "#150721" : "#ffffff";
  }

  function deptOf(item) {
    return DEPARTMENTS[item.department] || { label: item.department || "—", short: item.department || "—", colour: "#8a7f99" };
  }

  /* --- Period (financial year / calendar year) ---------------------------- */
  function periodStartMonth() { return state.periodMode === "fy" ? FY.startMonth : 1; }

  function periodMonths() {
    const start = periodStartMonth();
    const out = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(state.periodYear, start - 1 + i, 1);
      out.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
    }
    return out;
  }

  function yearLabel(y) {
    return state.periodMode === "cy"
      ? String(y)
      : "FY" + String(y).slice(2) + "/" + String(y + 1).slice(2);
  }

  function periodLabel() { return yearLabel(state.periodYear); }

  function monthLabel(key) {
    const [y, m] = key.split("-").map(Number);
    return { name: MONTH_NAMES[m - 1], year: y, monthNo: m };
  }

  function currentMonthKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }

  function isBlackout(key) {
    return BLACKOUT_MONTHS.indexOf(monthLabel(key).monthNo) !== -1;
  }

  /* Move the visible window so it contains the current month. */
  function snapPeriodToNow() {
    if (periodMonths().includes(currentMonthKey())) return;
    const d = new Date();
    state.periodYear = state.periodMode === "cy"
      ? d.getFullYear()
      : (d.getMonth() + 1 >= FY.startMonth ? d.getFullYear() : d.getFullYear() - 1);
  }

  /* The months an item appears in — supports both `month` and `months`. */
  function itemMonths(item) {
    if (Array.isArray(item.months) && item.months.length) return item.months;
    return item.month ? [item.month] : [];
  }

  function isParked(item) { return item.status === "parked" || !itemMonths(item).length; }

  /* --- Filtering ---------------------------------------------------------- */
  /* `skip` lets us compute facet counts by ignoring one dimension at a time. */
  function matches(item, skip) {
    if (skip !== "area" && state.area && !(item.areas || []).includes(state.area)) return false;
    if (skip !== "types" && state.types.size && !state.types.has(item.type)) return false;
    if (skip !== "departments" && state.departments.size && !state.departments.has(item.department)) return false;
    if (skip !== "thisMonth" && state.thisMonth && !itemMonths(item).includes(currentMonthKey())) return false;
    if (skip !== "search" && state.search) {
      const hay = [item.title, item.summary, item.audience].join(" ").toLowerCase();
      if (!hay.includes(state.search)) return false;
    }
    return true;
  }

  function filtered() { return TRAINING.filter((i) => matches(i)); }

  /* Items that pass the filters but fall outside the visible year. */
  function outsidePeriod(items) {
    const window = periodMonths();
    return items.filter((i) => !isParked(i) && !itemMonths(i).some((m) => window.includes(m))).length;
  }

  function facetCount(dimension, value) {
    return TRAINING.filter((item) => {
      if (!matches(item, dimension)) return false;
      if (dimension === "area") return (item.areas || []).includes(value);
      if (dimension === "types") return item.type === value;
      if (dimension === "departments") return item.department === value;
      return true;
    }).length;
  }

  function anyFilterActive() {
    return state.area !== null || state.types.size > 0 || state.departments.size > 0 ||
      state.thisMonth || state.search !== "";
  }

  /* --- Shared fragments --------------------------------------------------- */
  function deptTag(item) {
    const d = deptOf(item);
    return `<span class="tag tag-dept" style="background:${d.colour};color:${textOn(d.colour)}">${esc(d.short)}</span>`;
  }

  function typeTag(item) {
    const t = TYPES[item.type] || { short: item.type };
    return `<span class="tag tag-type">${esc(t.short)}</span>`;
  }

  /* Business area tags are redundant once you have picked a single area. */
  function areaTags(item) {
    if (state.area) return "";
    return (item.areas || [])
      .map((a) => `<span class="tag tag-area">${esc((BUSINESS_AREAS[a] || { short: a }).short)}</span>`)
      .join("");
  }

  function statusTag(item) {
    if (!item.status || item.status === "confirmed") return "";
    return `<span class="tag tag-status">${esc((STATUSES[item.status] || {}).label || item.status)}</span>`;
  }

  function recurringTag(item) {
    return itemMonths(item).length > 1 ? `<span class="tag tag-recurring">Recurring</span>` : "";
  }

  /* Resources link — shown on everything except online modules, where the
     module itself is the resource. */
  function resourceLink(item) {
    if (item.type === "online") {
      return item.link
        ? `<a class="res-link" href="${esc(item.link)}" target="_blank" rel="noopener">${icon("external")}Module</a>`
        : "";
    }
    if (item.resources) {
      return `<a class="res-link" href="${esc(item.resources)}" target="_blank" rel="noopener">${icon("external")}Resources</a>`;
    }
    return `<span class="res-link is-empty">Resources to come</span>`;
  }

  function card(item) {
    return `
      <div class="item" data-id="${esc(item.id)}" role="button" tabindex="0"
           style="border-left-color:${deptOf(item).colour}">
        <div class="item-title">${esc(item.title)}</div>
        <div class="item-meta">${deptTag(item)}${typeTag(item)}${areaTags(item)}${recurringTag(item)}${statusTag(item)}${resourceLink(item)}</div>
      </div>`;
  }

  /* --- Views -------------------------------------------------------------- */
  function renderCalendar(items) {
    const months = periodMonths();
    const now = currentMonthKey();

    const cells = months.map((key, idx) => {
      const label = monthLabel(key);
      const inMonth = items.filter((i) => itemMonths(i).includes(key));
      const blackout = isBlackout(key);
      const isCurrent = key === now;

      let body;
      if (inMonth.length) {
        body = (blackout
          ? `<div class="blackout-warn">Scheduled during a blackout month</div>`
          : "") + inMonth.map(card).join("");
      } else if (blackout) {
        body = `<div class="month-empty">No training scheduled</div>`;
      } else {
        body = `<div class="month-empty">${anyFilterActive() ? "Nothing matching" : "Nothing scheduled"}</div>`;
      }

      return `
        <section class="month${key < now ? " is-past" : ""}${isCurrent ? " is-current" : ""}${blackout ? " is-blackout" : ""}"
                 style="animation-delay:${idx * 20}ms">
          <div class="month-head">
            <div>
              <div class="month-name">${esc(label.name)}</div>
              <div class="month-year">${label.year}</div>
            </div>
            ${isCurrent ? '<span class="now-tag">This month</span>'
              : blackout ? '<span class="blackout-tag">Blackout</span>'
              : `<span class="month-count">${inMonth.length}</span>`}
          </div>
          ${body}
        </section>`;
    }).join("");

    return `<div class="calendar">${cells}</div>` + parked(items) + legend();
  }

  function renderList(items) {
    const now = currentMonthKey();
    const blocks = periodMonths().map((key) => {
      const inMonth = items.filter((i) => itemMonths(i).includes(key));
      const blackout = isBlackout(key);
      if (!inMonth.length && !blackout) return "";
      const label = monthLabel(key);

      if (!inMonth.length) {
        return `
          <div class="list-month">
            <div class="list-month-head">
              <span class="bar" style="background:var(--line)"></span>
              <h3>${esc(label.name)} ${label.year}</h3>
              <span class="blackout-tag">Blackout · no training scheduled</span>
            </div>
          </div>`;
      }

      const rows = inMonth.map((i) => `
        <div class="row" data-id="${esc(i.id)}" role="button" tabindex="0"
             style="border-left-color:${deptOf(i).colour}">
          <div class="r-tags">${deptTag(i)}${typeTag(i)}${areaTags(i)}${recurringTag(i)}${statusTag(i)}</div>
          <div>
            <div class="r-title">${esc(i.title)}</div>
            ${i.summary ? `<div class="r-sum">${esc(i.summary)}</div>` : ""}
          </div>
          <div class="r-tags">${resourceLink(i)}</div>
        </div>`).join("");

      return `
        <div class="list-month">
          <div class="list-month-head">
            <span class="bar" style="background:${deptOf(inMonth[0]).colour}"></span>
            <h3>${esc(label.name)} ${label.year}</h3>
            <span class="n">${inMonth.length} item${inMonth.length === 1 ? "" : "s"}</span>
            ${key === now ? '<span class="now-tag">This month</span>' : ""}
            ${blackout ? '<span class="blackout-tag">Blackout</span>' : ""}
          </div>
          ${rows}
        </div>`;
    }).join("");

    if (!blocks) return emptyState();
    return blocks + parked(items) + legend();
  }

  /* Items with no date agreed yet, listed so they are not forgotten. */
  function parked(items) {
    const list = items.filter(isParked);
    if (!list.length) return "";
    return `
      <div class="section-head" style="margin-top:34px">
        <span class="bar" style="background:var(--ink-40)"></span>
        <h3>Parked</h3>
        <span class="n">${list.length} with no date yet</span>
      </div>
      <div class="parked-grid">${list.map(card).join("")}</div>`;
  }

  function legend() {
    const items = Object.keys(DEPARTMENTS).map((k) => `
      <div class="legend-item">
        <span class="swatch" style="background:${DEPARTMENTS[k].colour}"></span>
        <span class="t">${esc(DEPARTMENTS[k].label)}</span>
      </div>`).join("");
    return `<div class="legend"><div class="legend-label">Departments</div>${items}</div>`;
  }

  function emptyState() {
    return `
      <div class="empty">
        <h3>Nothing matches those filters</h3>
        <p>Try a different business area, or widen the delivery type.</p>
        <button class="btn btn-ghost" data-action="reset">Clear all filters</button>
      </div>`;
  }

  /* --- Controls ----------------------------------------------------------- */
  function renderPeriod() {
    const span = FY.pickerRange || 4;
    const years = [];
    for (let y = FY.startYear - span; y <= FY.startYear + span; y++) years.push(y);
    if (!years.includes(state.periodYear)) years.push(state.periodYear);
    years.sort((a, b) => a - b);

    const options = years.map((y) =>
      `<option value="${y}"${y === state.periodYear ? " selected" : ""}>${esc(yearLabel(y))}</option>`).join("");

    return `
      <div class="segmented" role="group" aria-label="Year type">
        <button class="seg" data-period-mode="fy" aria-pressed="${state.periodMode === "fy"}">Financial year</button>
        <button class="seg" data-period-mode="cy" aria-pressed="${state.periodMode === "cy"}">Calendar year</button>
      </div>
      <div class="stepper">
        <button data-period-step="-1" aria-label="Previous year">&#8249;</button>
        <select class="year-select" id="year-select" aria-label="Choose year">${options}</select>
        <button data-period-step="1" aria-label="Next year">&#8250;</button>
      </div>`;
  }

  function renderAreas() {
    const cards = [["", { label: "All areas", blurb: "Everything across the business", iconKey: "all" }]]
      .concat(Object.entries(BUSINESS_AREAS).map(([k, v]) => [k, Object.assign({ iconKey: k }, v)]));

    return cards.map(([key, meta]) => {
      const on = key === "" ? state.area === null : state.area === key;
      const n = key === "" ? TRAINING.filter((i) => matches(i, "area")).length : facetCount("area", key);
      return `
        <button class="area-card" data-area="${esc(key)}" aria-pressed="${on}">
          <span class="ico">${icon(meta.iconKey)}</span>
          <span>
            <span class="a-name">${esc(meta.label)}</span>
            <span class="a-blurb">${esc(meta.blurb)}</span>
          </span>
          <span class="a-count">${n} item${n === 1 ? "" : "s"}</span>
        </button>`;
    }).join("");
  }

  function chipRow(label, dimension, entries) {
    const chips = entries.map(([value, meta]) => {
      const on = state[dimension].has(value);
      const n = facetCount(dimension, value);
      return `
        <button class="chip" aria-pressed="${on}" data-dim="${dimension}" data-value="${esc(value)}"
                ${n === 0 && !on ? 'style="opacity:.45"' : ""}>
          ${meta.colour ? `<span class="swatch" style="background:${meta.colour}"></span>` : ""}
          ${esc(meta.label)}<span class="count">${n}</span>
        </button>`;
    }).join("");

    return `
      <div class="filter-row">
        <div class="filter-label">${esc(label)}</div>
        <div class="chips">${chips}</div>
      </div>`;
  }

  function renderFilters() {
    const items = filtered();
    const outside = outsidePeriod(items);
    const nowLabel = monthLabel(currentMonthKey());

    return `
      ${chipRow("Department", "departments", Object.entries(DEPARTMENTS))}
      ${chipRow("Delivery", "types", Object.entries(TYPES))}
      <div class="filter-row">
        <div class="filter-label">Refine</div>
        <div class="chips" style="flex:0 0 auto">
          <button class="chip chip-now" aria-pressed="${state.thisMonth}" data-action="this-month">
            This month · ${esc(nowLabel.name)}
          </button>
        </div>
        <div class="search-wrap">
          <input class="search" id="search" type="search" placeholder="Search training or audience…"
                 value="${esc(state.search)}" autocomplete="off">
        </div>
      </div>
      <div class="filter-meta">
        <div class="result-count">
          Showing <b>${items.length}</b> of <b>${TRAINING.length}</b> items
          ${outside ? `<span class="outside">· ${outside} outside ${esc(periodLabel())}</span>` : ""}
        </div>
        ${anyFilterActive() ? '<button class="link-btn" data-action="reset">Clear all filters</button>' : ""}
      </div>`;
  }

  /* --- Detail modal ------------------------------------------------------- */
  function renderDetail(item) {
    const d = deptOf(item);
    const months = itemMonths(item).map((m) => {
      const l = monthLabel(m);
      return l.name + " " + l.year;
    }).join(", ");

    const cells = [
      ["When", months || "No date yet"],
      ["Delivery", (TYPES[item.type] || {}).label],
      ["Department", d.label],
      ["Business area", (item.areas || []).map((a) => (BUSINESS_AREAS[a] || { label: a }).label).join(", ")],
      ["Audience", item.audience],
      ["Status", (STATUSES[item.status] || {}).label],
    ].filter(([, v]) => v).map(([k, v]) => `
      <div class="detail-cell"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join("");

    const notes = [];
    if (item.source === "placeholder") {
      notes.push(`<b>Placeholder.</b> Seeded as an example — it did not come from either spreadsheet. Replace it with the real detail in <code>data/training-data.js</code>.`);
    } else if (item.status && item.status !== "confirmed") {
      notes.push(`<b>${esc((STATUSES[item.status] || {}).label)}.</b> Dates and detail are not locked in yet.`);
    }
    if (itemMonths(item).some(isBlackout)) {
      notes.push(`<b>Blackout month.</b> This falls in ${BLACKOUT_MONTHS.map((m) => MONTH_NAMES[m - 1]).join(" or ")}, when we do not normally schedule training.`);
    }
    const note = notes.map((n) => `<div class="note-draft">${n}</div>`).join("");

    let action;
    if (item.type === "online") {
      action = item.link
        ? `<a class="btn btn-dark btn-link" href="${esc(item.link)}" target="_blank" rel="noopener">${icon("external")}Open module</a>`
        : `<span class="result-count" style="margin-right:auto">No module link yet</span>`;
    } else if (item.resources) {
      action = `<a class="btn btn-dark btn-link" href="${esc(item.resources)}" target="_blank" rel="noopener">${icon("external")}Resources</a>`;
    } else {
      action = `<span class="result-count" style="margin-right:auto">No resources linked yet</span>`;
    }

    const ink = textOn(d.colour);
    return `
      <div class="overlay" data-close="1">
        <div class="panel" role="dialog" aria-modal="true" aria-label="${esc(item.title)}" tabindex="-1">
          <div class="panel-head" style="background:${d.colour}">
            <div class="p-eyebrow" style="color:${ink === "#ffffff" ? "rgba(255,255,255,0.78)" : "rgba(21,7,33,0.7)"}">${esc(d.label)}</div>
            <h2 style="color:${ink}">${esc(item.title)}</h2>
          </div>
          <div class="panel-body">
            <div class="detail-grid">${cells}</div>
            ${item.summary ? `<div class="detail-prose">${esc(item.summary)}</div>` : ""}
            ${note}
          </div>
          <div class="panel-foot">${action}<button class="btn" data-close="1">Close</button></div>
        </div>
      </div>`;
  }

  /* --- Forms -------------------------------------------------------------- */
  function trainingOptions() {
    return Array.from(new Set(TRAINING.map((i) => i.title))).sort()
      .map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
  }

  function areaOptions() {
    return Object.entries(BUSINESS_AREAS)
      .map(([k, v]) => `<option value="${esc(k)}">${esc(v.label)}</option>`).join("");
  }

  function notConnectedNote(cfg) {
    if (cfg.mode !== "none") return "";
    return `<div class="form-note">
      <b>Not connected yet.</b> Until this is wired up to SharePoint, submitting will copy a tidy summary to your clipboard and open an email to
      ${esc(cfg.fallbackEmail)} so nothing is lost. See <code>README.md</code> for the two-minute set-up.
    </div>`;
  }

  function formShell(opts) {
    return `
      <div class="overlay" data-close="1">
        <div class="panel panel-wide" role="dialog" aria-modal="true" aria-label="${esc(opts.title)}" tabindex="-1">
          <div class="panel-head" style="background:${opts.colour}">
            <div class="p-eyebrow" style="color:${textOn(opts.colour) === "#ffffff" ? "rgba(255,255,255,0.78)" : "rgba(21,7,33,0.7)"}">People &amp; Capability</div>
            <h2 style="color:${textOn(opts.colour)}">${esc(opts.title)}</h2>
          </div>
          <div class="panel-body">
            ${opts.error ? `<div class="form-error">${esc(opts.error)}</div>` : ""}
            ${notConnectedNote(opts.cfg)}
            <form id="entry-form" novalidate>${opts.fields}</form>
          </div>
          <div class="panel-foot">
            <button class="btn btn-ghost" data-close="1">Cancel</button>
            <button class="btn" data-submit="${esc(opts.kind)}">${esc(opts.cta)}</button>
          </div>
        </div>
      </div>`;
  }

  function renderLogForm(error) {
    return formShell({
      kind: "log", title: "Log a Workshop", cta: "Submit",
      colour: DEPARTMENTS.operations.colour, cfg: WORKSHOP_LOG, error: error,
      fields: `
        <div class="field">
          <label for="f-title">Workshop <span class="req">*</span></label>
          <input list="f-title-list" id="f-title" name="workshop" placeholder="Start typing, or enter a new one" required>
          <datalist id="f-title-list">${trainingOptions()}</datalist>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="f-date">Date delivered <span class="req">*</span></label>
            <input type="date" id="f-date" name="dateDelivered" required>
          </div>
          <div class="field">
            <label for="f-state">State <span class="req">*</span></label>
            <select id="f-state" name="state" required>
              <option value="">Select…</option>${STATES_AU.map((s) => `<option>${s}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="f-trainer">Trainer <span class="req">*</span></label>
            <input id="f-trainer" name="trainer" placeholder="Your name" required>
          </div>
          <div class="field">
            <label for="f-location">Location</label>
            <input id="f-location" name="location" placeholder="Store, venue or Teams">
          </div>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="f-area">Business area</label>
            <select id="f-area" name="businessArea">${areaOptions()}</select>
          </div>
          <div class="field">
            <label for="f-format">Format</label>
            <select id="f-format" name="format">
              <option>Face to face</option><option>Virtual</option><option>Blended</option>
            </select>
          </div>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="f-attendees">Attendees <span class="req">*</span></label>
            <input type="number" id="f-attendees" name="attendeeCount" min="1" step="1" placeholder="e.g. 12" required>
          </div>
          <div class="field">
            <label for="f-duration">Duration (hours)</label>
            <input type="number" id="f-duration" name="durationHours" min="0" step="0.5" placeholder="e.g. 3.5">
          </div>
        </div>
        <div class="field">
          <label for="f-who">Who attended</label>
          <textarea id="f-who" name="attendees" placeholder="Names or store numbers, one per line"></textarea>
        </div>
        <div class="field">
          <label for="f-notes">Notes</label>
          <textarea id="f-notes" name="notes" placeholder="How did it go? Anything P&amp;C should know?"></textarea>
        </div>`,
    });
  }

  function renderRequestForm(error) {
    return formShell({
      kind: "request", title: "Request Training", cta: "Send request",
      colour: DEPARTMENTS["people-culture"].colour, cfg: TRAINING_REQUEST, error: error,
      fields: `
        <div class="field">
          <label for="r-what">What training do you need? <span class="req">*</span></label>
          <input list="r-what-list" id="r-what" name="training" placeholder="Pick something existing, or describe what you need" required>
          <datalist id="r-what-list">${trainingOptions()}</datalist>
        </div>
        <div class="field">
          <label for="r-why">What is driving the request? <span class="req">*</span></label>
          <textarea id="r-why" name="reason" placeholder="What is happening that this training would fix?" required></textarea>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="r-area">Business area</label>
            <select id="r-area" name="businessArea">${areaOptions()}</select>
          </div>
          <div class="field">
            <label for="r-state">State</label>
            <select id="r-state" name="state">
              <option value="">Select…</option>${STATES_AU.map((s) => `<option>${s}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="r-who">Who is it for? <span class="req">*</span></label>
            <input id="r-who" name="audience" placeholder="e.g. Store Managers, WA" required>
          </div>
          <div class="field">
            <label for="r-count">Roughly how many people?</label>
            <input type="number" id="r-count" name="headcount" min="1" step="1" placeholder="e.g. 25">
          </div>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="r-when">When do you need it by?</label>
            <input type="month" id="r-when" name="neededBy">
          </div>
          <div class="field">
            <label for="r-urgency">Urgency</label>
            <select id="r-urgency" name="urgency">
              <option>Nice to have</option>
              <option>Needed this quarter</option>
              <option>Urgent — compliance or safety</option>
            </select>
          </div>
        </div>
        <div class="field-2">
          <div class="field">
            <label for="r-name">Your name <span class="req">*</span></label>
            <input id="r-name" name="requestedBy" placeholder="Your name" required>
          </div>
          <div class="field">
            <label for="r-email">Your email <span class="req">*</span></label>
            <input type="email" id="r-email" name="requestedByEmail" placeholder="name@cashconverters.com" required>
          </div>
        </div>`,
    });
  }

  function renderSuccess(heading, message) {
    return `
      <div class="overlay" data-close="1">
        <div class="panel" role="dialog" aria-modal="true" aria-label="${esc(heading)}" tabindex="-1">
          <div class="panel-body">
            <div class="success">
              <div class="tick">&#10003;</div>
              <h3>${esc(heading)}</h3>
              <p>${esc(message)}</p>
            </div>
          </div>
          <div class="panel-foot" style="justify-content:center">
            <button class="btn" data-close="1">Done</button>
          </div>
        </div>
      </div>`;
  }

  /* Field definitions per form: [key, label, required?] */
  const FORM_SPEC = {
    log: {
      cfg: WORKSHOP_LOG,
      heading: "Workshop logged",
      subject: (d) => "Workshop logged: " + d.workshop + " (" + d.state + ", " + d.dateDelivered + ")",
      rerender: renderLogForm,
      required: [["workshop", "Workshop name"], ["dateDelivered", "Date delivered"],
        ["state", "State"], ["trainer", "Trainer"], ["attendeeCount", "Number of attendees"]],
      lines: [["Workshop", "workshop"], ["Date", "dateDelivered"], ["State", "state"],
        ["Trainer", "trainer"], ["Location", "location"], ["Business area", "businessArea"],
        ["Format", "format"], ["Attendees", "attendeeCount"], ["Duration (hrs)", "durationHours"],
        ["Who attended", "attendees"], ["Notes", "notes"]],
    },
    request: {
      cfg: TRAINING_REQUEST,
      heading: "Request sent",
      subject: (d) => "Training request: " + d.training + " (" + (d.state || "National") + ")",
      rerender: renderRequestForm,
      required: [["training", "What training you need"], ["reason", "What is driving the request"],
        ["audience", "Who it is for"], ["requestedBy", "Your name"], ["requestedByEmail", "Your email"]],
      lines: [["Training", "training"], ["Why", "reason"], ["Business area", "businessArea"],
        ["State", "state"], ["Who for", "audience"], ["Headcount", "headcount"],
        ["Needed by", "neededBy"], ["Urgency", "urgency"],
        ["Requested by", "requestedBy"], ["Email", "requestedByEmail"]],
    },
  };

  function asPlainText(spec, data) {
    const width = Math.max.apply(null, spec.lines.map(([l]) => l.length)) + 2;
    return spec.lines.map(([label, key]) => {
      let v = data[key];
      if (key === "businessArea") v = (BUSINESS_AREAS[v] || {}).label || v;
      return (label + ":").padEnd(width) + (v || "—");
    }).join("\n");
  }

  async function submitForm(kind) {
    const spec = FORM_SPEC[kind];
    const data = {};
    new FormData($("#entry-form")).forEach((v, k) => { data[k] = typeof v === "string" ? v.trim() : v; });

    for (const [key, label] of spec.required) {
      if (!data[key]) { paint(spec.rerender(label + " is required.")); return; }
    }
    if (kind === "log" && !(Number(data.attendeeCount) > 0)) {
      paint(spec.rerender("Number of attendees must be at least 1.")); return;
    }
    if (kind === "request" && !/^\S+@\S+\.\S+$/.test(data.requestedByEmail || "")) {
      paint(spec.rerender("That email address does not look right.")); return;
    }

    data.submittedAt = new Date().toISOString();

    const btn = $("[data-submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

    const cfg = spec.cfg;
    if (cfg.mode === "flow" && cfg.flowUrl) {
      try {
        // text/plain keeps this a "simple" CORS request, so the browser does not
        // send a preflight OPTIONS that Power Automate would reject.
        const res = await fetch(cfg.flowUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        state.modal = "done";
        paint(renderSuccess(spec.heading, cfg.successNote));
      } catch (e) {
        paint(spec.rerender("Could not reach the endpoint (" + e.message + "). Check the flow URL in data/training-data.js, or use the email fallback."));
      }
      return;
    }

    // No endpoint configured — make sure nobody is ever blocked.
    const body = asPlainText(spec, data);
    try { await navigator.clipboard.writeText(body); } catch (e) { /* clipboard may be blocked; email still opens */ }

    window.location.href = "mailto:" + encodeURIComponent(cfg.fallbackEmail) +
      "?subject=" + encodeURIComponent(spec.subject(data)) + "&body=" + encodeURIComponent(body);

    state.modal = "done";
    paint(renderSuccess(spec.heading, "Copied to your clipboard and an email has been opened to " + cfg.fallbackEmail + ". If the email did not open, just paste it in yourself."));
  }

  /* --- Render ------------------------------------------------------------- */
  function paint(modalHtml) {
    $("#modal-root").innerHTML = modalHtml || "";
    if (modalHtml) {
      const panel = $("#modal-root .panel");
      if (panel) panel.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  function render() {
    $("#period").innerHTML = renderPeriod();
    $("#areas").innerHTML = renderAreas();
    $("#filters").innerHTML = renderFilters();

    document.querySelectorAll(".tab").forEach((t) => {
      t.setAttribute("aria-selected", String(t.dataset.view === state.view));
    });

    const items = filtered();
    $("#content").innerHTML = !items.length ? emptyState()
      : state.view === "list" ? renderList(items)
      : renderCalendar(items);
  }

  /* --- Events ------------------------------------------------------------- */
  function closeModal() { state.modal = null; paint(null); }

  function openDetail(id) {
    const item = TRAINING.find((i) => i.id === id);
    if (item) { state.modal = "detail"; paint(renderDetail(item)); }
  }

  function openForm(kind) {
    const cfg = FORM_SPEC[kind].cfg;
    if (cfg.mode === "form" && cfg.formUrl) { window.open(cfg.formUrl, "_blank", "noopener"); return; }
    state.modal = kind;
    paint(kind === "log" ? renderLogForm() : renderRequestForm());
  }

  document.addEventListener("click", (e) => {
    // Real links always win — never swallow a resources click.
    if (e.target.closest("a[href]")) return;

    if (e.target.classList.contains("overlay")) { closeModal(); return; }
    if (e.target.closest("button[data-close]")) { closeModal(); return; }

    const submit = e.target.closest("[data-submit]");
    if (submit) { submitForm(submit.dataset.submit); return; }

    const tab = e.target.closest(".tab");
    if (tab) { state.view = tab.dataset.view; render(); return; }

    const mode = e.target.closest("[data-period-mode]");
    if (mode) { state.periodMode = mode.dataset.periodMode; render(); return; }

    const step = e.target.closest("[data-period-step]");
    if (step) { state.periodYear += Number(step.dataset.periodStep); render(); return; }

    const areaCard = e.target.closest(".area-card");
    if (areaCard) { state.area = areaCard.dataset.area || null; render(); return; }

    const chip = e.target.closest(".chip[data-dim]");
    if (chip) {
      const set = state[chip.dataset.dim];
      if (set.has(chip.dataset.value)) set.delete(chip.dataset.value);
      else set.add(chip.dataset.value);
      render();
      return;
    }

    const action = e.target.closest("[data-action]");
    if (action) {
      const a = action.dataset.action;
      if (a === "reset") {
        state.area = null; state.types.clear(); state.departments.clear();
        state.thisMonth = false; state.search = "";
        render();
      } else if (a === "this-month") {
        state.thisMonth = !state.thisMonth;
        if (state.thisMonth) snapPeriodToNow();
        render();
      } else if (a === "log" || a === "request") {
        openForm(a);
      } else if (a === "print") {
        window.print();
      }
      return;
    }

    const card = e.target.closest("[data-id]");
    if (card) openDetail(card.dataset.id);
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "year-select") {
      state.periodYear = Number(e.target.value);
      render();
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id !== "search") return;
    state.search = e.target.value.trim().toLowerCase();
    const pos = e.target.selectionStart;
    render();
    const next = $("#search");
    if (next) { next.focus(); try { next.setSelectionRange(pos, pos); } catch (err) {} }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.modal) { closeModal(); return; }
    if ((e.key === "Enter" || e.key === " ") && !state.modal) {
      const card = e.target.closest && e.target.closest("[data-id][role='button']");
      if (card) { e.preventDefault(); openDetail(card.dataset.id); }
    }
  });

  /* --- Boot --------------------------------------------------------------- */
  snapPeriodToNow();
  render();
})();
