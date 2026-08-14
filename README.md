# Cashies Training Calendar

One view of every piece of training running across the business — Stores, CCPF and Head Office — filterable by business area, department and delivery type, with a **Log a Workshop** button for state trainers and a **Request Training** button for the business.

Built as a plain static site. No build step, no server, no backend, no dependencies. Open `index.html` and it works.

## What's on the page

**Calendar** is a twelve-cell grid, three across, so each row of the grid is a quarter of the financial year. Every cell is exactly the same height — a cell lists its first five items, then *+N more*. Clicking a month, or *+N more*, opens the whole month in a panel; clicking an item goes straight to its detail. Closing an item takes you back to the month you opened it from.

**List** is the same training as one flat run in date order, with the summaries showing, for when you want to read rather than navigate.

- **Business area cards** — All / Stores / CCPF / Head Office. One click, whole calendar reframes.
- **Financial year ⇄ calendar year toggle**, with a year dropdown and arrows. The counter tells you how many items fall outside the year you are looking at.
- **One dot of colour per item**, which is the department, keyed in the legend at the foot of the page. Nothing else in the calendar is coloured, so the colour means exactly one thing.
- **Delivery types mirror the sheet** — Policy resigns, eLearning, eLearning and Workshop, Workshop, Webinar, Event, Drill.
- **Blackout months** — July and December are greyed, dashed and badged, and are not clickable when empty. If something is scheduled into one anyway, the month opens and carries a warning.
- **Parked** — anything with no date agreed sits in its own list below the grid so it is not forgotten.
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
  type:       "workshop",           // policy | online | blended | workshop | webinar | event | drill
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

**Runs from a date onwards?** Set a `month` and add `ongoing: true`. It sits in its starting month, is badged **Ongoing**, and its detail panel reads "August 2026 onwards".

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

This is the sheet's **Resource Link** column. Every item has a `resources` field — paste a SharePoint folder link, a Teams file link, a CCLearn course URL, anything. It becomes a button in the month panel and the detail panel. eLearning items label it *Module*; everything else labels it *Resources*.

Leave it as `""` and the item reads a quiet *Resources to come*, so you can see at a glance what still needs materials attached. **None are set yet** — the Resource Link column is empty throughout the sheet.

---

## Where the data came from

One place: the master training sheet. Its columns map straight onto the data file.

| Sheet column | Field |
|---|---|
| Area | `areas` (which business areas it reaches) and `audience` (the sheet's own wording) |
| Delivery | `type` |
| Category | `department` |
| Title | `title` |
| When | `month` / `months` / `ongoing` |
| Overview | `summary` |
| Status | used only to tell the policy resigns apart |
| Resource Link | `resources` |

**Area** maps to business areas like this:

| Sheet says | Shows under |
|---|---|
| Whole Organisation, Office and Store Managers | Stores, CCPF and Head Office |
| Corporate Stores, Stores | Stores |
| Contact and Lending Centre, Collections and Hardship | CCPF |
| Finance | Head Office |

### The leadership programme

The **Rotating Competency Focus** — one competency a month, owned by **People & Culture**, **Stores only** to start. Add `"ccpf"` and `"head-office"` to those items' `areas` when it widens out.

The cycle runs September through to the following August, so within FY26/27:

| | | | |
|---|---|---|---|
| Sep 26 · Potential | Oct 26 · Risk, Safety & Protection | Nov 26 · Community | Dec 26 · — |
| Jan 27 · Performance | Feb 27 · Perseverance | Mar 27 · Systems and Execution | Apr 27 · Responsibility |
| May 27 · People | Jun 27 · Equity | Jul 27 · — | Aug 27 · Customer Trust |

December and July carry no competency, which lines up exactly with the blackout months.

**Customer Trust lands in August 2027**, the last month of the Sep-to-Aug cycle, so it falls just outside FY26/27 — the counter says *1 outside FY26/27* and it appears when you step the year forward. Change its `month` to `2026-08` if the rotation should sit wholly inside this financial year.

A **Leadership Summit** sits alongside it: a one-day Event in October 2026 for the whole business, so unlike the monthly competencies it shows under all three business areas.

### AI

Split in two, both under the **IT** department:

- **AI Training** — eLearning, August and September 2026
- **AI Community Workshops** — Workshop, November 2026

### Other judgement calls worth checking

- **Bomb Threats and Lockdown have a blank Delivery cell** in the sheet. Both are set to eLearning, matching the rest of the WHS block.
- **AI Training has a blank Area cell.** It is treated as whole-organisation.
- **The Leadership department has no items**, since the leadership programme sits under People & Culture. It is kept in the list in case you want it later; the chip just reads zero. **Marketing** only holds the two parked policies.
- **Safety Month** is no longer a calendar item of its own; the sheet records it as a note against Test and Tag Training, so it is mentioned in that item's summary.

### Parked

Five policies carry no date: Social Media, Customer Marketing, Recruitment, Unconscious Bias and Leave Policy. They came from the earlier policy resign calendar and have no row in the master sheet, because that sheet is organised by month. They are kept in a Parked list below the grid rather than dropped. Delete any that are no longer wanted.

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
