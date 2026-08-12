# Cashies Training Calendar

One view of every piece of training running across the business — Stores, CCPF and Head Office — filterable by business area, department and delivery type, with a **Log a Workshop** button for state trainers and a **Request Training** button for the business.

Built as a plain static site. No build step, no server, no backend, no dependencies. Open `index.html` and it works.

## What's on the page

**Calendar** is a twelve-cell grid, three across, so each row of the grid is a quarter of the financial year. Every cell is exactly the same height — a cell lists its first five items, then *+N more*. Clicking a month, or *+N more*, opens the whole month in a panel; clicking an item goes straight to its detail. Closing an item takes you back to the month you opened it from.

**List** is the same training as one flat run in date order, with the summaries showing, for when you want to read rather than navigate.

- **Business area cards** — All / Stores / CCPF / Head Office. One click, whole calendar reframes.
- **Financial year ⇄ calendar year toggle**, with a year dropdown and arrows. The counter tells you how many items fall outside the year you are looking at.
- **One dot of colour per item**, which is the department, keyed in the legend at the foot of the page. Nothing else in the calendar is coloured, so the colour means exactly one thing.
- **Blackout months** — July and December are greyed, dashed and badged, and are not clickable when empty. If something is scheduled into one anyway, the month opens and carries a warning.
- **Parked** — anything with no date agreed sits in its own list below the grid so it is not forgotten.
- **No status field.** Everything on the calendar is treated the same. Where a date or format is genuinely unsettled, that is said in the item's own summary rather than as a badge.
- **This month** filter, which also jumps the calendar to the right year if you are looking at a different one.
- **Resources link** on every item except online modules, where the module itself is the resource. Grid cells are titles only; the link is in the month panel and the detail panel.

---

## Updating the calendar

**Everything you need to change lives in one file: `data/training-data.js`.**

Open it in any text editor. It is heavily commented and the format is deliberately repetitive — copy an existing block and change the words.

A training item looks like this:

```js
{
  id:         "stores-jewellery",   // unique, lowercase, no spaces
  title:      "Jewellery",          // shows on the card
  month:      "2026-11",            // YYYY-MM
  type:       "workshop",           // workshop | online | policy | webinar | activity
  department: "operations",         // sets the card colour — see list below
  areas:      ["stores"],           // stores | ccpf | head-office — can be several
  audience:   "Store team members",
  summary:    "Jewellery product knowledge, valuation and merchandising.",
  resources:  ""                    // link to slides, guides, handouts
},
```

Only `id`, `title`, `month` and `type` are required.

Two fields are easy to mix up:

- **`areas`** is the *business area* — who it affects. Stores, CCPF, Head Office. These are the big cards at the top.
- **`department`** is *who owns it* — People & Culture, IT, Marketing, Operations, WHS, Finance, Risk & Compliance, Leadership. This sets the colour of the item's dot.

**Runs across several months?** Swap `month` for `months`:

```js
months: ["2026-08", "2026-09", "2026-10", "2026-11"],
```

The item then appears in every month listed and is badged **Recurring**.

**No date yet?** Just leave the month off. It appears in the Parked list below the grid.

**Rolling to a new year?** The app can already show any year via the toggle and dropdown — the `FY` block at the top of the data file only sets which year it opens on.

Save the file, refresh the browser. That is the whole update process.

### Departments and colours

Each item carries one small dot in its department colour, keyed in the legend at the foot of the page and named in full in the month and detail panels. Colours come from the colour coding in the policy resign calendar. Change one in the `DEPARTMENTS` block and it changes everywhere.

| Department | Key | Colour |
|---|---|---|
| People & Culture | `people-culture` | Peach `#ef9281` |
| IT | `it` | Blue `#0e93b4` |
| Marketing | `marketing` | Lilac `#b5a4d0` |
| Operations | `operations` | Yellow `#ecb21f` |
| WHS | `whs` | Green `#2f8f6b` |
| Finance | `finance` | Lime `#e3eb7b` |
| Risk & Compliance | `risk-compliance` | Red `#981a30` |
| Leadership | `leadership` | Indigo `#4b3b8f` |

Peach, lilac, yellow and red are the spreadsheet's own colours. Lime for Finance, green for WHS, blue for IT and indigo for Leadership were assigned to match the brief where the spreadsheet had no equivalent.

### Blackout months

```js
const BLACKOUT_MONTHS = [7, 12];   // July and December
```

Change that line to move them. Blackout months are greyed, dashed, badged and read *No training scheduled*. If an item is scheduled into one, the month becomes clickable and carries a warning, and the item's detail panel says so too.

### Resources links

Every item that is not an online module has a `resources` field. Paste a SharePoint folder link, a Teams file link, or anything else — it becomes a **Resources** button on the card and in the detail panel.

Leave it as `""` and the row shows a quiet *Resources to come*, so you can see at a glance which sessions still need their materials attached. **None are set yet** — every row currently reads *Resources to come*.

Online modules use `link` instead, pointing at the CCLearn course.

---

## Where the data came from

Two spreadsheets, merged. Every item carries a `source` field so you can tell them apart.

| `source` | Document |
|---|---|
| `policy-calendar` | The policy resign calendar — titles, business areas, departments, dates and overview text taken from it directly, plus its Online Modules and Campaigns_Workshops tabs |
| `planner` | Draft Annual Planner (Jul 26 – Jun 27) — the WHS / Stores / CCPF tabs |
| `placeholder` | Seeded examples so the Head Office view is not empty. Flagged in the app. Replace them. |

The 24 policy resigns run **August 2026 through May 2027** — they are aligned to the financial year, not the calendar year. Their summaries are the spreadsheet's own Overview wording.

All of them are delivered as **eLearning**, which shows as *Delivered via: eLearning* in the detail panel. They stay under the **Policy resigns** delivery filter rather than being folded in with Online modules, so the filter you asked for keeps working — the `format` field carries the eLearning fact separately.

### Where the two documents disagree

Both versions are in the calendar rather than one being silently dropped. Worth a decision on each:

| Topic | Policy Resign Calendar | Draft Annual Planner |
|---|---|---|
| Theft by Force | Campaign March 2026, workshop April 2026 | Online module October 2026 |
| Violence and Aggression | Resign October 2026 (Safety Month) | Online module March 2027 |
| Test and Tag | Refresher campaign August 2026 | Training workshop October 2026 |

Two other things to look at:

- **Bullying and Harassment** appears in both documents for August 2026. It is entered **once**, as a People & Culture policy resign.
- The planner also has a separate **Harassment** refresher in June 2027, which overlaps with the August resign. Worth confirming whether both are needed.
- The three October safety policies (Corporate Store Operations WHS Policy, Fires/Evacuation, Fitness for Work) sit under **Operations**, which the updated calendar's Category column confirms — earlier there was a question over whether they belonged to WHS.

### What was not imported

- **Intro to the Privacy Act**, which the earlier calendar had flagged to merge with the Privacy Policy. The updated calendar has only Privacy Policy, so that is all that is here.
- Anything in the policy calendar dated **Jul–Dec 2025** — before this calendar starts.
- The **December induction modules** (Privacy Induction, Induction: Leave Policy, WHS Induction). December is a blackout month and these read as always-on induction rather than scheduled training. Add them if you want them visible.
- The **Survey Schedule** tab. The People & Capability view that would have used it has been removed.
- The placeholder **New Financial Year Compliance Refresh** was dropped, because the real AML/CTF and conduct resigns now cover it.
- Policy **owners** (Kan, Julie, Sascha and so on) are in the spreadsheet but are not displayed — owner was removed from the app.

### Other things worth knowing

- **WHS training is tagged to all three business areas**, because health and safety applies right across the business. That makes Stores show most of the calendar. If some modules are genuinely store-only, trim the `areas` list on those items and the filters will sharpen up.
- Because the resigns moved to the financial year, only three items now fall outside FY26/27 — the March and April 2026 Theft by Force campaign and workshop, and Collections: Selling the Benefits in May 2026. Switch to **Calendar year 2026** to see them.

---

## The two buttons

Neither has a backend. Both work the same way and are configured in `data/training-data.js` — `WORKSHOP_LOG` and `TRAINING_REQUEST`. Each has three modes.

Current setting for both: **`"none"`** — the form works and falls back to clipboard + email so nobody is blocked, but nothing is stored centrally yet. Pick one of the two below for each.

### Option A — Power Automate into a SharePoint list (recommended)

People stay inside the app and submissions land straight in a list P&C can sort, filter and report on. Same pattern as the AI Capability Profile app.

1. **Create the SharePoint list.** In your P&C SharePoint site, create a list called `Workshop Log` with these columns (all single line of text unless noted):

   | Column | Type |
   |---|---|
   | `Title` | Single line of text (this is the workshop name) |
   | `DateDelivered` | Date |
   | `State` | Choice — WA, NSW, VIC, QLD, SA, TAS, NT, ACT, National |
   | `Trainer` | Single line of text |
   | `Location` | Single line of text |
   | `BusinessArea` | Choice — stores, ccpf, head-office |
   | `Format` | Choice — Face to face, Virtual, Blended |
   | `AttendeeCount` | Number |
   | `DurationHours` | Number |
   | `Attendees` | Multiple lines of text |
   | `Notes` | Multiple lines of text |

   For training requests, create a second list called `Training Requests` with: `Title` (the training), `Reason`, `BusinessArea`, `State`, `Audience`, `Headcount` (number), `NeededBy`, `Urgency`, `RequestedBy`, `RequestedByEmail`.

2. **Create the flow.** Power Automate → new **Instant cloud flow** → trigger **When an HTTP request is received**.

3. **Set the request body schema.** Click *Use sample payload to generate schema* and paste the matching sample:

   ```json
   {
     "workshop": "Jewellery",
     "dateDelivered": "2026-11-14",
     "state": "WA",
     "trainer": "Jo Smith",
     "location": "Cannington",
     "businessArea": "stores",
     "format": "Face to face",
     "attendeeCount": "12",
     "durationHours": "3.5",
     "attendees": "Store 101\nStore 102",
     "notes": "Went well.",
     "submittedAt": "2026-11-14T04:12:00.000Z"
   }
   ```

   ```json
   {
     "training": "Pawnbroking refresher",
     "reason": "Three new starters and a compliance finding.",
     "businessArea": "stores",
     "state": "WA",
     "audience": "Store Managers, WA",
     "headcount": "25",
     "neededBy": "2027-03",
     "urgency": "Needed this quarter",
     "requestedBy": "Jo Smith",
     "requestedByEmail": "jo.smith@cashconverters.com",
     "submittedAt": "2026-11-14T04:12:00.000Z"
   }
   ```

4. **Add a *Create item* action** pointing at the right list, and map each field to the matching value from the trigger body.

5. **Save the flow**, then copy the generated **HTTP POST URL** from the trigger card.

6. **Paste it into `data/training-data.js`:**

   ```js
   const WORKSHOP_LOG = {
     mode: "flow",
     flowUrl: "https://prod-xx.australiasoutheast.logic.azure.com:443/workflows/...",
     ...
   };
   ```

Optionally add a *Send an email* action after *Create item* so P&C gets notified on each submission.

> **Note on the flow URL.** It contains a signature and sits in the page source, so treat it as semi-public. It is write-only — anyone with it can add a row, but cannot read the list. That is the standard trade-off for a no-backend form and is the same approach used elsewhere in the suite. If that is not acceptable for your risk appetite, use Option B. Adding a required `Condition` step in the flow that drops submissions with an empty name field filters out most casual noise.

### Option B — Microsoft Form

Simpler to set up, but takes the person out of the app into a new tab.

1. Build a Microsoft Form with the same fields as the list above.
2. Set the Form to save responses to Excel/SharePoint as usual.
3. Copy the Form's share link and set:

   ```js
   const TRAINING_REQUEST = {
     mode: "form",
     formUrl: "https://forms.office.com/r/xxxxxxxx",
     ...
   };
   ```

The button then opens the Form directly and the in-app modal is skipped.

---

## Running and hosting it

**Locally.** Double-click `index.html`. That's it.

**GitHub Pages.** Repository *Settings* → *Pages* → source *Deploy from a branch* → pick this branch, folder `/ (root)`. The site appears at `https://<org>.github.io/training-calendar/` within a minute or two.

**Anywhere else.** Copy the files to any web host, SharePoint document library set to serve pages, or Azure Static Web Apps / storage static website (same as the AI Capability Profile app). There is nothing to install or compile.

**Embedding in Teams.** Add a *Website* tab pointing at the hosted URL.

---

## Files

```
index.html                 Page shell. Rarely needs touching.
data/training-data.js      ← ALL CONTENT LIVES HERE. This is the file you edit.
assets/styles.css          All For: 1 brand system.
assets/app.js              Filtering and rendering. No content in here.
```

---

## Notes

- **Fonts.** Archivo loads from Google Fonts. If the network blocks that, the page falls back to Helvetica/Arial and still looks fine — but if you are hosting somewhere without outbound internet, download Archivo and self-host it in `assets/`.
- **Print.** The Print button prints every month in full, including the items behind *+N more* — the overflow stays in the page and is only hidden with CSS, so find-in-page reaches it too. Filters apply, so you can print just the Stores view.
- **Accessibility.** Keyboard navigable throughout, `Esc` closes any dialog, and `prefers-reduced-motion` is respected. Month headers and items are real buttons. Department colour is never the only signal — the department is named in the legend, the month panel and the detail panel, and every grid dot carries the title as a tooltip.
- **Browsers.** Anything current. No IE support and no polyfills.
