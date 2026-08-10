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
    streams: new Set(),         // empty = all
    types: new Set(),
    areas: new Set(),
    search: "",
    openItem: null,
    modal: null,                // null | 'detail' | 'log'
  };

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const STATES_AU = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "NT", "ACT", "National"];

  /* --- Small helpers ----------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Every month key in the financial year, e.g. ["2026-07", ... "2027-06"] */
  function fyMonths() {
    const [y, m] = FY.startMonth.split("-").map(Number);
    const out = [];
    for (let i = 0; i < FY.months; i++) {
      const d = new Date(y, m - 1 + i, 1);
      out.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
    }
    return out;
  }

  function monthLabel(key) {
    const [y, m] = key.split("-").map(Number);
    return { name: MONTH_NAMES[m - 1], short: MONTH_NAMES[m - 1].slice(0, 3), year: y };
  }

  function currentMonthKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }

  /* The months an item appears in — supports both `month` and `months`. */
  function itemMonths(item) {
    if (Array.isArray(item.months) && item.months.length) return item.months;
    return item.month ? [item.month] : [];
  }

  function typeOf(item) { return TYPES[item.type] || { label: item.type, short: item.type, colour: "#372550" }; }

  /* --- Filtering ---------------------------------------------------------- */
  /* `skip` lets us compute facet counts by ignoring one dimension at a time. */
  function matches(item, skip) {
    if (skip !== "streams" && state.streams.size) {
      const s = item.streams || [];
      if (!s.some((x) => state.streams.has(x))) return false;
    }
    if (skip !== "types" && state.types.size && !state.types.has(item.type)) return false;
    if (skip !== "areas" && state.areas.size && !state.areas.has(item.area)) return false;
    if (skip !== "search" && state.search) {
      const hay = [item.title, item.summary, item.owner, item.audience].join(" ").toLowerCase();
      if (!hay.includes(state.search)) return false;
    }
    return true;
  }

  function filtered() { return TRAINING.filter((i) => matches(i)); }

  function facetCount(dimension, value) {
    return TRAINING.filter((item) => {
      if (!matches(item, dimension)) return false;
      if (dimension === "streams") return (item.streams || []).includes(value);
      if (dimension === "types") return item.type === value;
      if (dimension === "areas") return item.area === value;
      return true;
    }).length;
  }

  function anyFilterActive() {
    return state.streams.size > 0 || state.types.size > 0 || state.areas.size > 0 || state.search !== "";
  }

  /* --- Shared fragments --------------------------------------------------- */
  function typeTag(item) {
    const t = typeOf(item);
    return `<span class="tag tag-type" style="background:${t.colour}">${esc(t.short)}</span>`;
  }

  function streamTags(item) {
    return (item.streams || [])
      .map((s) => `<span class="tag tag-stream">${esc((STREAMS[s] || { short: s }).short)}</span>`)
      .join("");
  }

  function statusTag(item) {
    if (!item.status || item.status === "confirmed") return "";
    return `<span class="tag tag-status">${esc((STATUSES[item.status] || {}).label || item.status)}</span>`;
  }

  function recurringTag(item) {
    return itemMonths(item).length > 1 ? `<span class="tag tag-recurring">Recurring</span>` : "";
  }

  /* --- Views -------------------------------------------------------------- */
  function renderCalendar(items) {
    const months = fyMonths();
    const now = currentMonthKey();

    const cells = months.map((key, idx) => {
      const label = monthLabel(key);
      const inMonth = items.filter((i) => itemMonths(i).includes(key));
      const isPast = key < now;
      const isCurrent = key === now;

      const body = inMonth.length
        ? inMonth.map((i) => `
            <button class="item" data-id="${esc(i.id)}" style="border-left-color:${typeOf(i).colour}">
              <div class="item-title">${esc(i.title)}</div>
              <div class="item-meta">${typeTag(i)}${streamTags(i)}${recurringTag(i)}${statusTag(i)}</div>
            </button>`).join("")
        : `<div class="month-empty">${anyFilterActive() ? "Nothing matching" : "Nothing scheduled"}</div>`;

      return `
        <section class="month${isPast ? " is-past" : ""}${isCurrent ? " is-current" : ""}" style="animation-delay:${idx * 22}ms">
          <div class="month-head">
            <div>
              <div class="month-name">${esc(label.name)}</div>
              <div class="month-year">${label.year}</div>
            </div>
            ${isCurrent ? '<span class="now-tag">Now</span>' : `<span class="month-count">${inMonth.length}</span>`}
          </div>
          ${body}
        </section>`;
    }).join("");

    return `<div class="calendar">${cells}</div>` + legend();
  }

  function renderList(items) {
    const months = fyMonths();
    const blocks = months.map((key) => {
      const inMonth = items.filter((i) => itemMonths(i).includes(key));
      if (!inMonth.length) return "";
      const label = monthLabel(key);
      const rows = inMonth.map((i) => `
        <button class="row" data-id="${esc(i.id)}" style="border-left-color:${typeOf(i).colour}">
          <div class="r-tags">${typeTag(i)}${streamTags(i)}${recurringTag(i)}${statusTag(i)}</div>
          <div>
            <div class="r-title">${esc(i.title)}</div>
            ${i.summary ? `<div class="r-sum">${esc(i.summary)}</div>` : ""}
          </div>
          <div class="r-tags">${i.owner ? `<span class="tag tag-stream">${esc(i.owner)}</span>` : ""}</div>
        </button>`).join("");

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
    const months = fyMonths();
    const byMonth = months
      .map((key) => ({ key, items: PANDC_YEAR.filter((p) => p.month === key) }))
      .filter((g) => g.items.length);

    const kindColour = (k) => (k === "feedback" ? "#85e3f4" : "#b5a4d0");

    const timeline = byMonth.map((g) => {
      const label = monthLabel(g.key);
      return g.items.map((p, n) => `
        <div class="pc-item">
          <div class="pc-month">${n === 0 ? esc(label.name) + " " + label.year : ""}</div>
          <div class="pc-dot" style="background:${kindColour(p.kind)}"></div>
          <div>
            <div class="pc-title">${esc(p.title)}<span class="pc-kind" style="background:${kindColour(p.kind)};color:#150721">${p.kind === "feedback" ? "Feedback" : "Cycle"}</span></div>
            ${p.summary ? `<div class="pc-sum">${esc(p.summary)}</div>` : ""}
          </div>
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
        <p>Every point across ${esc(FY.label)} where we ask the business for feedback, alongside the P&amp;C cycle milestones that sit around them. ${feedbackCount} formal feedback moments, plus ${PANDC_CONTINUOUS.length} channels running continuously in the background.</p>
      </div>

      <div class="section-head"><span class="bar" style="background:#85e3f4"></span><h3>Across the year</h3></div>
      <div class="pc-timeline">${timeline}</div>

      <div class="section-head"><span class="bar" style="background:#b5a4d0"></span><h3>Running continuously</h3></div>
      <div class="pc-cont">${continuous}</div>

      <div class="note-draft" style="background:#241335;color:rgba(255,255,255,0.8);border-left-color:#ecb21f;margin-top:30px">
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
        <p>Try widening the audience or delivery type.</p>
        <button class="btn btn-ghost" data-action="reset">Clear all filters</button>
      </div>`;
  }

  /* --- Filter panel ------------------------------------------------------- */
  function chipRow(label, dimension, entries) {
    const chips = entries.map(([value, meta]) => {
      const on = state[dimension].has(value);
      const n = facetCount(dimension, value);
      return `
        <button class="chip" role="button" aria-pressed="${on}"
                data-dim="${dimension}" data-value="${esc(value)}"
                ${n === 0 && !on ? 'style="opacity:.4"' : ""}>
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
    const total = filtered().length;
    return `
      ${chipRow("Audience", "streams", Object.entries(STREAMS))}
      ${chipRow("Delivery", "types", Object.entries(TYPES))}
      ${chipRow("Business area", "areas", Object.entries(AREAS))}
      <div class="filter-row">
        <div class="filter-label">Search</div>
        <div class="search-wrap">
          <input class="search" id="search" type="search" placeholder="Search training, owner or audience…"
                 value="${esc(state.search)}" autocomplete="off">
        </div>
      </div>
      <div class="filter-meta">
        <div class="result-count">Showing <b>${total}</b> of <b>${TRAINING.length}</b> items</div>
        ${anyFilterActive() ? '<button class="link-btn" data-action="reset">Clear all filters</button>' : ""}
      </div>`;
  }

  function renderKpis() {
    const items = filtered();
    const count = (fn) => items.filter(fn).length;
    const tiles = [
      { n: items.length, l: "Total items", c: "#372550" },
      { n: count((i) => i.type === "workshop"), l: "Workshops", c: TYPES.workshop.colour },
      { n: count((i) => i.type === "online"), l: "Online", c: TYPES.online.colour },
      { n: count((i) => i.type === "policy"), l: "Policy", c: TYPES.policy.colour },
      { n: count((i) => (i.streams || []).includes("stores")), l: "Affecting stores", c: "#372550" },
      { n: count((i) => (i.streams || []).includes("ccpf")), l: "Affecting CCPF", c: "#372550" },
    ];
    return tiles.map((t) => `
      <div class="kpi" style="border-top-color:${t.c}">
        <div class="n">${t.n}</div>
        <div class="l">${esc(t.l)}</div>
      </div>`).join("");
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
      ["Business area", (AREAS[item.area] || {}).label],
      ["Audience", item.audience],
      ["Affects", (item.streams || []).map((s) => (STREAMS[s] || { label: s }).label).join(", ")],
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

    return `
      <div class="overlay" data-close="1">
        <div class="panel" role="dialog" aria-modal="true" aria-label="${esc(item.title)}" tabindex="-1">
          <div class="panel-head" style="background:${t.colour}">
            <div class="p-eyebrow">${esc(t.label)}${item.owner ? " · " + esc(item.owner) : ""}</div>
            <h2>${esc(item.title)}</h2>
          </div>
          <div class="panel-body">
            <div class="detail-grid">${cells}</div>
            ${item.summary ? `<div class="detail-prose">${esc(item.summary)}</div>` : ""}
            ${note}
          </div>
          <div class="panel-foot">
            ${item.link ? `<a class="btn btn-ghost" style="color:#150721;border-color:#e2dee9;text-decoration:none;display:inline-block" href="${esc(item.link)}" target="_blank" rel="noopener">Open</a>` : ""}
            <button class="btn" data-close="1">Close</button>
          </div>
        </div>
      </div>`;
  }

  /* --- Log a workshop ----------------------------------------------------- */
  function workshopOptions() {
    const titles = Array.from(new Set(TRAINING.map((i) => i.title))).sort();
    return titles.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join("");
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
            <div class="p-eyebrow">People &amp; Capability</div>
            <h2>Log a Workshop</h2>
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
                  <label for="f-stream">Audience</label>
                  <select id="f-stream" name="stream">
                    ${Object.entries(STREAMS).map(([k, v]) => `<option value="${esc(k)}">${esc(v.label)}</option>`).join("")}
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
            <button class="btn btn-ghost" style="color:#150721;border-color:#e2dee9" data-close="1">Cancel</button>
            <button class="btn" id="log-submit">Submit</button>
          </div>
        </div>
      </div>`;
  }

  function renderLogSuccess(message) {
    return `
      <div class="overlay" data-close="1">
        <div class="panel" role="dialog" aria-modal="true" aria-label="Workshop logged" tabindex="-1">
          <div class="panel-body" style="border-radius:22px">
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
    const form = $("#log-form");
    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = typeof v === "string" ? v.trim() : v; });
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
    for (const [key, label] of required) {
      if (!data[key]) return label + " is required.";
    }
    if (!(Number(data.attendeeCount) > 0)) return "Number of attendees must be at least 1.";
    return null;
  }

  function asPlainText(data) {
    const lines = [
      "Workshop:  " + data.workshop,
      "Date:      " + data.dateDelivered,
      "State:     " + data.state,
      "Trainer:   " + data.trainer,
      "Location:  " + (data.location || "—"),
      "Audience:  " + ((STREAMS[data.stream] || {}).label || data.stream || "—"),
      "Format:    " + (data.format || "—"),
      "Attendees: " + data.attendeeCount,
      "Duration:  " + (data.durationHours ? data.durationHours + " hours" : "—"),
      "",
      "Who attended:",
      data.attendees || "—",
      "",
      "Notes:",
      data.notes || "—",
    ];
    return lines.join("\n");
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
    const mailto = "mailto:" + encodeURIComponent(WORKSHOP_LOG.fallbackEmail) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    window.location.href = mailto;

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
    const items = filtered();

    $("#kpis").innerHTML = renderKpis();
    $("#filters").innerHTML = renderFilters();
    $("#filters").style.display = state.view === "pandc" ? "none" : "";
    $("#kpis").style.display = state.view === "pandc" ? "none" : "";

    document.querySelectorAll(".tab").forEach((t) => {
      t.setAttribute("aria-selected", String(t.dataset.view === state.view));
    });

    let html;
    if (state.view === "pandc") html = renderPandC();
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
    state.openItem = null;
    paint(null);
  }

  document.addEventListener("click", (e) => {
    // Modal close — a click on the backdrop itself, or any close button.
    if (e.target.classList.contains("overlay")) { closeModal(); return; }
    if (e.target.closest("button[data-close]")) { closeModal(); return; }

    const tab = e.target.closest(".tab");
    if (tab) { state.view = tab.dataset.view; render(); return; }

    const chip = e.target.closest(".chip");
    if (chip) { toggle(chip.dataset.dim, chip.dataset.value); return; }

    const action = e.target.closest("[data-action]");
    if (action) {
      const a = action.dataset.action;
      if (a === "reset") {
        state.streams.clear(); state.types.clear(); state.areas.clear(); state.search = "";
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

    if (e.target.closest("#log-submit")) { submitLog(); return; }

    const card = e.target.closest(".item, .row");
    if (card) {
      const item = TRAINING.find((i) => i.id === card.dataset.id);
      if (item) { state.openItem = item; state.modal = "detail"; paint(renderDetail(item)); }
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "search") {
      state.search = e.target.value.trim().toLowerCase();
      const pos = e.target.selectionStart;
      render();
      const next = $("#search");
      if (next) { next.focus(); try { next.setSelectionRange(pos, pos); } catch (err) {} }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.modal) closeModal();
  });

  /* --- Boot --------------------------------------------------------------- */
  document.querySelectorAll("[data-fy]").forEach((el) => { el.textContent = FY.label; });
  render();
})();
