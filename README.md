# Cashies Training Calendar

One view of every piece of training running across the business — Stores, CCPF and Head Office — filterable by business area, delivery type and category, plus a People & Capability view of the feedback year and a **Log a Workshop** button for state trainers.

Built as a plain static site. No build step, no server, no backend, no dependencies. Open `index.html` and it works.

## What's on the page

- **Business area cards** — All / Stores / CCPF / Head Office. One click, whole calendar reframes.
- **Financial year ⇄ calendar year toggle**, with arrows to step between years. The counter tells you how many items fall outside the year you are looking at.
- **This month** filter, which also jumps the calendar to the right year if you are looking at a different one.
- **Delivery** and **Category** chips, with live counts that update as you narrow.
- **Resources link** on every card except online modules, where the module itself is the resource.

---

## Updating the calendar

**Everything you need to change lives in one file: `data/training-data.js`.**

Open it in any text editor. It is heavily commented and the format is deliberately repetitive — copy an existing block and change the words.

A training item looks like this:

```js
{
  id:        "stores-jewellery",    // unique, lowercase, no spaces
  title:     "Jewellery",           // shows on the card
  month:     "2026-11",             // YYYY-MM
  type:      "workshop",            // workshop | online | policy | webinar | activity
  areas:     ["stores"],            // stores | ccpf | head-office — can be several
  category:  "operations",          // whs | operations | leadership | compliance | ai | pandc
  status:    "draft",               // confirmed | draft | proposed
  owner:     "People & Capability",
  audience:  "Store team members",
  summary:   "Jewellery product knowledge, valuation and merchandising.",
  resources: ""                     // link to slides, guides, handouts
},
```

Only `id`, `title`, `month` and `type` are required.

Two fields are easy to mix up:

- **`areas`** is the *business area* — who it affects. Stores, CCPF, Head Office. These are the big cards at the top.
- **`category`** is the *subject* — WHS, Leadership, Compliance and so on. These are the smaller chips.

**Runs across several months?** Swap `month` for `months`:

```js
months: ["2026-08", "2026-09", "2026-10", "2026-11"],
```

The item then appears in every month listed and is badged **Recurring**.

**Rolling to a new financial year?** Change the `FY` block at the top of the same file. Note the app can already show any year via the toggle — `FY` only sets where it opens.

Save the file, refresh the browser. That is the whole update process.

### Resources links

Every item that is not an online module has a `resources` field. Paste a SharePoint folder link, a Teams file link, or anything else — it becomes a **Resources** button on the card and in the detail panel.

Leave it as `""` and the card shows a quiet *Resources to come*, so you can see at a glance which sessions still need their materials attached.

Online modules use `link` instead, pointing at the CCLearn course.

### Things worth knowing about the current data

- Everything currently in the calendar came from the **Draft Annual Planner (Jul 26 – Jun 27)** spreadsheet, so it is all marked `status: "draft"`. Move items to `"confirmed"` as dates lock in — confirmed items lose the DRAFT badge.
- Two items in the planner had question marks against them (Webshop, PF Workshops). They are marked `"proposed"`.
- **WHS training is currently tagged to all three business areas**, because health and safety applies right across the business. That makes Stores show 23 of 26 items. If some WHS modules are genuinely store-only or head-office-only, trim the `areas` list on those items and the filters will sharpen up considerably.
- The planner listed both "Bullying and Harrassment" (Aug 26) and "Harrasment" (Jun 27). Both are in the calendar, with a note on the June one — worth confirming whether both are intended.
- Head Office training and the entire People & Capability year are **placeholders**. They were not in the spreadsheet. Everything seeded is marked `source: "placeholder"` and flagged in the app so nobody mistakes it for a real plan. Replace them.
- **No `resources` links are set yet.** Every card currently reads *Resources to come*.

---

## The Log a Workshop button

State trainers use this to record a session they have delivered. Because there is no backend, the submission has to land somewhere in Microsoft 365. There are three modes, set at the top of `data/training-data.js` in the `WORKSHOP_LOG` block.

Current setting: **`"none"`** — the form works and falls back to clipboard + email so trainers are never blocked, but nothing is stored centrally yet. Pick one of the two below.

### Option A — Power Automate into a SharePoint list (recommended)

Trainers stay inside the app and submissions land straight in a list P&C can sort, filter and report on. Same pattern as the AI Capability Profile app.

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

2. **Create the flow.** Power Automate → new **Instant cloud flow** → trigger **When an HTTP request is received**.

3. **Set the request body schema.** Click *Use sample payload to generate schema* and paste:

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

4. **Add a *Create item* action** pointing at the `Workshop Log` list, and map each field to the matching value from the trigger body.

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

> **Note on the flow URL.** It contains a signature and sits in the page source, so treat it as semi-public. It is write-only — anyone with it can add a row, but cannot read the list. That is the standard trade-off for a no-backend form and is the same approach used elsewhere in the suite. If that is not acceptable for your risk appetite, use Option B. Adding a required `Condition` step in the flow that drops submissions with an empty `trainer` field filters out most casual noise.

### Option B — Microsoft Form

Simpler to set up, but takes the trainer out of the app into a new tab.

1. Build a Microsoft Form with the same fields as the list above.
2. Set the Form to save responses to Excel/SharePoint as usual.
3. Copy the Form's share link and set:

   ```js
   const WORKSHOP_LOG = {
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

**Anywhere else.** Copy the four files and two folders to any web host, SharePoint document library set to serve pages, or Azure Static Web Apps / storage static website (same as the AI Capability Profile app). There is nothing to install or compile.

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
- **Print.** The Print button produces a clean three-column year on paper with the filters and navigation stripped out. Filters apply, so you can print just the stores view.
- **Accessibility.** Keyboard navigable throughout, `Esc` closes any dialog, focus rings use the brand blue-green, and `prefers-reduced-motion` is respected.
- **Browsers.** Anything current. No IE support and no polyfills.
