/* =============================================================================
   Cashies Training Calendar — application logic

   You should not need to edit this file to update the calendar. All content
   lives in data/training-data.js.
   ============================================================================= */

(function () {
  "use strict";

  /* --- State ------------------------------------------------------------- */
  const state = {
    view: "calendar",           // calendar | list | pandc
    area: null,                 // null = All, otherwise a BUSINESS_AREAS key
    types: new Set(),           // empty = all
    categories: new Set(),      // empty = all
    thisMonth: false,           // restrict to the current calendar month
    search: "",
    periodMode: "fy",           // fy | cy
    periodYear: FY.startYear,   // year the visible window starts in
    modal: null,                // null | 'detail' | 'log' | 'log-done'
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

  function icon(name, cls) {
    return `<svg viewBox="0 0 24 24" class="${cls || ""}" aria-hidden="true">${ICONS[name] || ""}</svg>`;
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
    const vsWhite = 1.05 / (L + 0.05);
    const vsNavy = (L + 0.05) / 0.0655;   // #150721 has luminance ≈ 0.0155
    return vsNavy >= vsWhite ? "#150721" : "#ffffff";
  }

  /* --- Period (financial year / calendar year) ---------------------------- */
  function periodMonths() {
    const startMonth = state.periodMode === "fy" ? FY.startMonth : 1;
    const out = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(state.periodYear, startMonth - 1 + i, 1);
      out.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
    }
    return out;
  }

  function periodLabel() {
    if (state.periodMode === "cy") return String(state.periodYear);
    return "FY" + String(state.periodYear).slice(2) + "/" + String(state.periodYear + 1).slice(2);
  }

  function monthLabel(key) {
    const [y, m] = key.split("-").map(Number);
    return { name: MONTH_NAMES[m - 1], year: y };
  }

  function currentMonthKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
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

  function typeOf(item) {
    return TYPES[item.type] || { label: item.type, short: item.type, colour: "#8a7f99" };
  }

  /* --- Filtering ---------------------------------------------------------- */
  /* `skip` lets us compute facet counts by ignoring one dimension at a time. */
  function matches(item, skip) {
    if (skip !== "area" && state.area) {
      if (!(item.areas || []).includes(state.area)) return false;
    }
    if (skip !== "types" && state.types.size && !state.types.has(item.type)) return false;
    if (skip !== "categories" && state.categories.size && !state.categories.has(item.category)) return false;
    if (skip !== "thisMonth" && state.thisMonth) {
      if (!itemMonths(item).includes(currentMonthKey())) return false;
    }
    if (skip !== "search" && state.search) {
      const hay = [item.title, item.summary, item.owner, item.audience].join(" ").toLowerCase();
      if (!hay.includes(state.search)) return false;
    }
    return true;
  }

  function filtered() { return TRAINING.filter((i) => matches(i)); }

  /* Items that pass the filters but fall outside the visible year. */
  function outsidePeriod(items) {
    const window = periodMonths();
    return items.filter((i) => !itemMonths(i).some((m) => window.includes(m))).length;
  }

  function facetCount(dimension, value) {
    return TRAINING.filter((item) => {
      if (!matches(item, dimension)) return false;
      if (dimension === "area") return (item.areas || []).includes(value);
      if (dimension === "types") return item.type === value;
      if (dimension === "categories") return item.category === value;
      return true;
    }).length;
  }

  function anyFilterActive() {
    return state.area !== null || state.types.size > 0 || state.categories.size > 0 ||
      state.thisMonth || state.search !== "";
  }

  /* --- Shared fragments --------------------------------------------------- */
  function typeTag(item) {
    const t = typeOf(item);
    return `<span class="tag tag-type" style="background:${t.colour};color:${textOn(t.colour)}">${esc(t.short)}</span>`;
  }

  function areaTags(item) {
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

  /* --- Views -------------------------------------------------------------- */
  function renderCalendar(items) {
    const months = periodMonths();
    const now = currentMonthKey();

    const cells = months.map((key, idx) => {
      const label = monthLabel(key);
      const inMonth = items.filter((i) => itemMonths(i).includes(key));
      const isPast = key < now;
      const isCurrent = key === now;

      const body = inMonth.length
        ? inMonth.map((i) => `
            <div class="item" data-id="${esc(i.id)}" role="button" tabindex="0"
                 style="border-left-color:${typeOf(i).colour}">
              <div class="item-title">${esc(i.title)}</div>
              <div class="item-meta">${typeTag(i)}${areaTags(i)}${recurringTag(i)}${statusTag(i)}${resourceLink(i)}</div>
            </div>`).join("")
        : `<div class="month-empty">${anyFilterActive() ? "Nothing matching" : "Nothing scheduled"}</div>`;

      return `
        <section class="month${isPast ? " is-past" : ""}${isCurrent ? " is-current" : ""}" style="animation-delay:${idx * 20}ms">
          <div class="month-head">
            <div>
              <div class="month-name">${esc(label.name)}</div>
              <div class="month-year">${label.year}</div>
            </div>
            ${isCurrent ? '<span class="now-tag">This month</span>' : `<span class="month-count">${inMonth.length}</span>`}
          </div>
          ${body}
        </section>`;
    }).join("");

    return `<div class="calendar">${cells}</div>` + legend();
  }

  function renderList(items) {
    const blocks = periodMonths().map((key) => {
      const inMonth = items.filter((i) => itemMonths(i).includes(key));
      if (!inMonth.length) return "";
      const label = monthLabel(key);
      const rows = inMonth.map((i) => `
        <div class="row" data-id="${esc(i.id)}" role="button" tabindex="0"
             style="border-left-color:${typeOf(i).colour}">
          <div class="r-tags">${typeTag(i)}${areaTags(i)}${recurringTag(i)}${statusTag(i)}</div>
          <div>
            <div class="r-title">${esc(i.title)}</div>
            ${i.summary ? `<div class="r-sum">${esc(i.summary)}</div>` : ""}
          </div>
          <div class="r-tags">${resourceLink(i)}</div>
        </div>`).join("");

      return `
        <div class="list-month">
          <div class="list-month-head">
            <span class="bar" style="background:${typeOf(inMonth[0]).colour}"></span>
            <h3>${esc(label.name)} ${label.year}</h3>
            <span class="n">${inMonth.length} item${inMonth.length === 1 ? "" : "s"}</span>
          </div>
          ${rows}
        </div>`;
    }).join("");

    if (!blocks) return emptyState();
    return blocks + legend();
  }

  function renderPandC() {
    const months = periodMonths();
    const kindColour = (k) => (k === "feedback" ? "#0a9fbd" : "#8b6fb8");

    const rows = months.map((key) => {
      const inMonth = PANDC_YEAR.filter((p) => p.month === key);
      if (!inMonth.length) return "";
      const label = monthLabel(key);
      return inMonth.map((p, n) => `
        <div class="pc-item">
          <div class="pc-month">${n === 0 ? esc(label.name) + " " + label.year : ""}</div>
          <div class="pc-dot" style="background:${kindColour(p.kind)}"></div>
          <div>
            <div class="pc-title">${esc(p.title)}<span class="pc-kind" style="background:${kindColour(p.kind)}">${p.kind === "feedback" ? "Feedback" : "Cycle"}</span></div>
            ${p.summary ? `<div class="pc-sum">${esc(p.summary)}</div>` : ""}
          </div>
          <div>${p.resources
            ? `<a class="res-link" href="${esc(p.resources)}" target="_blank" rel="noopener">${icon("external")}Resources</a>`
            : `<span class="res-link is-empty">Resources to come</span>`}</div>
        </div>`).join("");
    }).join("");

    const continuous = PANDC_CONTINUOUS.map((c) => `
      <div class="pc-cont-card">
        <h4>${esc(c.title)}</h4>
        <p>${esc(c.summary)}</p>
      </div>`).join("");

    const feedbackCount = PANDC_YEAR.filter((p) => p.kind === "feedback").length;

    return `
      <div class="pc-intro">
        <h2>The People &amp; Capability Year</h2>
        <p>Every point across ${esc(periodLabel())} where we ask the business for feedback, alongside the P&amp;C cycle milestones that sit around them. ${feedbackCount} formal feedback moments, plus ${PANDC_CONTINUOUS.length} channels running continuously in the background.</p>
      </div>

      <div class="section-head"><span class="bar" style="background:#0a9fbd"></span><h3>Across the year</h3></div>
      ${rows ? `<div class="pc-timeline">${rows}</div>` : `<div class="empty"><h3>Nothing in this year</h3><p>Use the year toggle above to move to a year with P&amp;C activity in it.</p></div>`}

      <div class="section-head"><span class="bar" style="background:#8b6fb8"></span><h3>Running continuously</h3></div>
      <div class="pc-cont">${continuous}</div>

      <div class="note-draft">
        <b>These are placeholders.</b> The P&amp;C year has not been filled in from a source document yet — the dates and items above are examples to show the structure. Edit <code>PANDC_YEAR</code> in <code>data/training-data.js</code> to replace them with the real calendar.
      </div>`;
  }

  function legend() {
    const items = Object.keys(TYPES).map((k) => `
      <div class="legend-item">
        <span class="swatch" style="background:${TYPES[k].colour}"></span>
        <span class="t">${esc(TYPES[k].label)}</span>
      </div>`).join("");
    return `<div class="legend">${items}</div>`;
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
    return `
      <div class="segmented" role="group" aria-label="Year type">
        <button class="seg" data-period-mode="fy" aria-pressed="${state.periodMode === "fy"}">Financial year</button>
        <button class="seg" data-period-mode="cy" aria-pressed="${state.periodMode === "cy"}">Calendar year</button>
      </div>
      <div class="stepper">
        <button data-period-step="-1" aria-label="Previous year">&#8249;</button>
        <span class="period-label">${esc(periodLabel())}</span>
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
      ${chipRow("Delivery", "types", Object.entries(TYPES))}
      ${chipRow("Category", "categories", Object.entries(CATEGORIES))}
      <div class="filter-row">
        <div class="filter-label">Refine</div>
        <div class="chips" style="flex:0 0 auto">
          <button class="chip chip-now" aria-pressed="${state.thisMonth}" data-action="this-month">
            This month · ${esc(nowLabel.name)}
          </button>
        </div>
        <div class="search-wrap">
          <input class="search" id="search" type="search" placeholder="Search training, owner or audience…"
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
    const t = typeOf(item);
    const months = itemMonths(item).map((m) => {
      const l = monthLabel(m);
      return l.name + " " + l.year;
    }).join(", ");

    const cells = [
      ["When", months],
      ["Delivery", t.label],
      ["Business area", (item.areas || []).map((a) => (BUSINESS_AREAS[a] || { label: a }).label).join(", ")],
      ["Category", (CATEGORIES[item.category] || {}).label],
      ["Audience", item.audience],
      ["Owner", item.owner],
      ["Status", (STATUSES[item.status] || {}).label],
    ].filter(([, v]) => v).map(([k, v]) => `
      <div class="detail-cell"><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join("");

    let note = "";
    if (item.source === "placeholder") {
      note = `<div class="note-draft"><b>Placeholder.</b> This item was seeded as an example and did not come from the draft planner. Replace it with the real detail in <code>data/training-data.js</code>.</div>`;
    } else if (item.status && item.status !== "confirmed") {
      note = `<div class="note-draft"><b>${esc((STATUSES[item.status] || {}).label)}.</b> Dates and detail are not locked in yet.</div>`;
    }

    let action = "";
    if (item.type === "online") {
      action = item.link
        ? `<a class="btn btn-dark btn-link" href="${esc(item.link)}" target="_blank" rel="noopener">${icon("external")}Open module</a>`
        : "";
    } else if (item.resources) {
      action = `<a class="btn btn-dark btn-link" href="${esc(item.resources)}" target="_blank" rel="noopener">${icon("external")}Resources</a>`;
    } else {
      action = `<span class="result-count" style="margin-right:auto">No resources linked yet</span>`;
    }

    const ink = textOn(t.colour);
    return `
      <div class="overlay" data-close="1">
        <div class="panel" role="dialog" aria-modal="true" aria-label="${esc(item.title)}" tabindex="-1">
          <div class="panel-head" style="background:${t.colour}">
            <div class="p-eyebrow" style="color:${ink === "#ffffff" ? "rgba(255,255,255,0.75)" : "rgba(21,7,33,0.7)"}">${esc(t.label)}</div>
            <h2 style="color:${ink}">${esc(item.title)}</h2>
          </div>
          <div class="panel-body">
            <div class="detail-grid">${cells}</div>
            ${item.summary ? `<div class="detail-prose">${esc(item.summary)}</div>` : ""}
            ${note}
          </div>
          <div class="panel-foot">
            ${action}
            <button class="btn" data-close="1">Close</button>
          </div>
        </div>
      </div>`;
  }

  /* --- Log a workshop ----------------------------------------------------- */
  function workshopOptions() {
    return Array.from(new Set(TRAINING.map((i) => i.title))).sort()
      .map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
  }

  function renderLogForm(errorMsg) {
    let intro = "";
    if (WORKSHOP_LOG.mode === "none") {
      intro = `<div class="form-note">
        <b>Not connected yet.</b> Until this is wired up to SharePoint, submitting will copy a tidy summary to your clipboard and open an email to
        ${esc(WORKSHOP_LOG.fallbackEmail)} so nothing is lost. See <code>README.md</code> for the two-minute set-up.
      </div>`;
    }

    return `
      <div class="overlay" data-close="1">
        <div class="panel panel-wide" role="dialog" aria-modal="true" aria-label="Log a workshop" tabindex="-1">
          <div class="panel-head" style="background:${TYPES.workshop.colour}">
            <div class="p-eyebrow" style="color:rgba(21,7,33,0.7)">People &amp; Capability</div>
            <h2 style="color:#150721">Log a Workshop</h2>
          </div>
          <div class="panel-body">
            ${errorMsg ? `<div class="form-error">${esc(errorMsg)}</div>` : ""}
            ${intro}
            <form id="log-form" novalidate>
              <div class="field">
                <label for="f-title">Workshop <span class="req">*</span></label>
                <input list="f-title-list" id="f-title" name="workshop" placeholder="Start typing, or enter a new one" required>
                <datalist id="f-title-list">${workshopOptions()}</datalist>
              </div>

              <div class="field-2">
                <div class="field">
                  <label for="f-date">Date delivered <span class="req">*</span></label>
                  <input type="date" id="f-date" name="dateDelivered" required>
                </div>
                <div class="field">
                  <label for="f-state">State <span class="req">*</span></label>
                  <select id="f-state" name="state" required>
                    <option value="">Select…</option>
                    ${STATES_AU.map((s) => `<option>${s}</option>`).join("")}
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
                  <select id="f-area" name="businessArea">
                    ${Object.entries(BUSINESS_AREAS).map(([k, v]) => `<option value="${esc(k)}">${esc(v.label)}</option>`).join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="f-format">Format</label>
                  <select id="f-format" name="format">
                    <option>Face to face</option>
                    <option>Virtual</option>
                    <option>Blended</option>
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
              </div>
            </form>
          </div>
          <div class="panel-foot">
            <button class="btn btn-ghost" data-close="1">Cancel</button>
            <button class="btn" id="log-submit">Submit</button>
          </div>
        </div>
      </div>`;
  }

  function renderLogSuccess(message) {
    return `
      <div class="overlay" data-close="1">
        <div class="panel" role="dialog" aria-modal="true" aria-label="Workshop logged" tabindex="-1">
          <div class="panel-body">
            <div class="success">
              <div class="tick">&#10003;</div>
              <h3>Workshop logged</h3>
              <p>${esc(message)}</p>
            </div>
          </div>
          <div class="panel-foot" style="justify-content:center">
            <button class="btn" data-close="1">Done</button>
          </div>
        </div>
      </div>`;
  }

  function collectForm() {
    const data = {};
    new FormData($("#log-form")).forEach((v, k) => { data[k] = typeof v === "string" ? v.trim() : v; });
    return data;
  }

  function validate(data) {
    const required = [
      ["workshop", "Workshop name"],
      ["dateDelivered", "Date delivered"],
      ["state", "State"],
      ["trainer", "Trainer"],
      ["attendeeCount", "Number of attendees"],
    ];
    for (const [key, label] of required) if (!data[key]) return label + " is required.";
    if (!(Number(data.attendeeCount) > 0)) return "Number of attendees must be at least 1.";
    return null;
  }

  function asPlainText(data) {
    return [
      "Workshop:      " + data.workshop,
      "Date:          " + data.dateDelivered,
      "State:         " + data.state,
      "Trainer:       " + data.trainer,
      "Location:      " + (data.location || "—"),
      "Business area: " + ((BUSINESS_AREAS[data.businessArea] || {}).label || data.businessArea || "—"),
      "Format:        " + (data.format || "—"),
      "Attendees:     " + data.attendeeCount,
      "Duration:      " + (data.durationHours ? data.durationHours + " hours" : "—"),
      "",
      "Who attended:",
      data.attendees || "—",
      "",
      "Notes:",
      data.notes || "—",
    ].join("\n");
  }

  async function submitLog() {
    const data = collectForm();
    const err = validate(data);
    if (err) { paint(renderLogForm(err)); return; }

    data.submittedAt = new Date().toISOString();

    const btn = $("#log-submit");
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

    if (WORKSHOP_LOG.mode === "flow" && WORKSHOP_LOG.flowUrl) {
      try {
        // text/plain keeps this a "simple" CORS request, so the browser does not
        // send a preflight OPTIONS that Power Automate would reject.
        const res = await fetch(WORKSHOP_LOG.flowUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        state.modal = "log-done";
        paint(renderLogSuccess(WORKSHOP_LOG.successNote));
      } catch (e) {
        paint(renderLogForm("Could not reach the workshop log (" + e.message + "). Check the flow URL in data/training-data.js, or use the email fallback."));
      }
      return;
    }

    // No endpoint configured — make sure the trainer is never blocked.
    const body = asPlainText(data);
    try { await navigator.clipboard.writeText(body); } catch (e) { /* clipboard may be blocked; email still opens */ }

    const subject = "Workshop logged: " + data.workshop + " (" + data.state + ", " + data.dateDelivered + ")";
    window.location.href = "mailto:" + encodeURIComponent(WORKSHOP_LOG.fallbackEmail) +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    state.modal = "log-done";
    paint(renderLogSuccess("Copied to your clipboard and an email has been opened to " + WORKSHOP_LOG.fallbackEmail + ". If the email did not open, just paste it in yourself."));
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
    const isPandC = state.view === "pandc";

    $("#period").innerHTML = renderPeriod();
    $("#areas").innerHTML = renderAreas();
    $("#filters").innerHTML = renderFilters();
    $("#areas").style.display = isPandC ? "none" : "";
    $("#filters").style.display = isPandC ? "none" : "";

    document.querySelectorAll(".tab").forEach((t) => {
      t.setAttribute("aria-selected", String(t.dataset.view === state.view));
    });

    const items = filtered();
    let html;
    if (isPandC) html = renderPandC();
    else if (!items.length) html = emptyState();
    else if (state.view === "list") html = renderList(items);
    else html = renderCalendar(items);

    $("#content").innerHTML = html;
  }

  /* --- Events ------------------------------------------------------------- */
  function toggle(setName, value) {
    const set = state[setName];
    if (set.has(value)) set.delete(value); else set.add(value);
    render();
  }

  function closeModal() {
    state.modal = null;
    paint(null);
  }

  function openDetail(id) {
    const item = TRAINING.find((i) => i.id === id);
    if (item) { state.modal = "detail"; paint(renderDetail(item)); }
  }

  document.addEventListener("click", (e) => {
    // Real links always win — never swallow a resources click.
    if (e.target.closest("a[href]")) return;

    if (e.target.classList.contains("overlay")) { closeModal(); return; }
    if (e.target.closest("button[data-close]")) { closeModal(); return; }
    if (e.target.closest("#log-submit")) { submitLog(); return; }

    const tab = e.target.closest(".tab");
    if (tab) { state.view = tab.dataset.view; render(); return; }

    const mode = e.target.closest("[data-period-mode]");
    if (mode) { state.periodMode = mode.dataset.periodMode; render(); return; }

    const step = e.target.closest("[data-period-step]");
    if (step) { state.periodYear += Number(step.dataset.periodStep); render(); return; }

    const areaCard = e.target.closest(".area-card");
    if (areaCard) { state.area = areaCard.dataset.area || null; render(); return; }

    const chip = e.target.closest(".chip[data-dim]");
    if (chip) { toggle(chip.dataset.dim, chip.dataset.value); return; }

    const action = e.target.closest("[data-action]");
    if (action) {
      const a = action.dataset.action;
      if (a === "reset") {
        state.area = null; state.types.clear(); state.categories.clear();
        state.thisMonth = false; state.search = "";
        render();
      } else if (a === "this-month") {
        state.thisMonth = !state.thisMonth;
        if (state.thisMonth) snapPeriodToNow();
        render();
      } else if (a === "log") {
        if (WORKSHOP_LOG.mode === "form" && WORKSHOP_LOG.formUrl) {
          window.open(WORKSHOP_LOG.formUrl, "_blank", "noopener");
        } else {
          state.modal = "log";
          paint(renderLogForm());
        }
      } else if (a === "print") {
        window.print();
      }
      return;
    }

    const card = e.target.closest("[data-id]");
    if (card) openDetail(card.dataset.id);
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
