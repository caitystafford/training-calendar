/* =============================================================================
   CASHIES TRAINING CALENDAR — DATA FILE
   =============================================================================

   THIS IS THE ONLY FILE YOU NEED TO EDIT TO UPDATE THE CALENDAR.

   Everything the app displays comes from this file. You do not need to touch
   any other file to add, change or remove training. Edit it, save it, refresh
   the page — the calendar updates.

   -----------------------------------------------------------------------------
   HOW TO ADD A NEW PIECE OF TRAINING
   -----------------------------------------------------------------------------
   Scroll down to TRAINING and copy an existing block. Every item looks like:

     {
       id:      "unique-id-here",       // any unique text, lowercase, no spaces
       title:   "Assessing Essentials",  // what shows on the card
       month:   "2026-08",               // YYYY-MM. Must be inside the FY below.
       type:    "workshop",              // see TYPES list below
       area:    "operations",            // see AREAS list below
       streams: ["stores"],              // see STREAMS list below — can be many
       status:  "confirmed",             // see STATUS list below
       owner:   "P&C",                   // who runs it (free text)
       audience:"Store Managers",        // who attends (free text)
       summary: "One or two lines.",     // shows when the card is opened
       link:    ""                       // optional URL, e.g. a CCLearn course
     },

   Only `id`, `title`, `month` and `type` are strictly required. Everything
   else is optional and will simply be left out of the display if missing.

   RUNS OVER SEVERAL MONTHS? Use `months` instead of `month`:
       months: ["2026-08", "2026-09", "2026-10"]
   The item will appear in every month listed and be badged as recurring.

   -----------------------------------------------------------------------------
   THE FIXED LISTS — use these exact values
   -----------------------------------------------------------------------------
   TYPES    workshop | online | policy | webinar | activity
   AREAS    whs | operations | leadership | compliance | ai | pandc
   STREAMS  stores | ccpf | head-office
   STATUS   confirmed | draft | proposed

   `draft` and `proposed` items get a visible badge so nobody mistakes an idea
   for a locked-in date. Use `confirmed` only when the date is real.

   -----------------------------------------------------------------------------
   WHERE THIS DATA CAME FROM
   -----------------------------------------------------------------------------
   Items marked  source: "planner"      came from the Draft Annual Planner
                                        spreadsheet (WHS / Stores / CCPF tabs).
   Items marked  source: "placeholder"  were seeded by way of example so the
                                        Head Office and People & Capability
                                        views have something in them. They are
                                        ALL marked as draft and are flagged in
                                        the app. Replace them with real dates.
   ============================================================================= */

/* -----------------------------------------------------------------------------
   1. FINANCIAL YEAR
   Change these two lines once a year to roll the calendar forward.
   -------------------------------------------------------------------------- */
const FY = {
  label: "FY26/27",
  startMonth: "2026-07", // first month shown (July 2026)
  months: 12,            // how many months to show
};

/* -----------------------------------------------------------------------------
   2. "LOG A WORKSHOP" BUTTON
   -------------------------------------------------------------------------- */
/*
   How the Log a Workshop button behaves. There is no backend in this app, so
   submissions go somewhere in Microsoft 365. Pick ONE mode:

   mode: "flow"   → Trainers fill the form inside this app and it posts straight
                    into a SharePoint list via a Power Automate flow. Best
                    experience; same pattern as the AI Capability Profile app.
                    Paste your flow's HTTP POST URL into `flowUrl` below.
                    Full set-up steps are in README.md.

   mode: "form"   → The button opens a Microsoft Form in a new tab. Simplest to
                    set up, but takes the trainer out of the app.
                    Paste the Form's share link into `formUrl` below.

   mode: "none"   → Nothing is wired up yet (this is the current setting). The
                    form still works: on submit it copies a tidy summary to the
                    clipboard and opens an email to the address in `fallbackEmail`
                    so trainers are never blocked.
*/
const WORKSHOP_LOG = {
  mode: "none",

  // Used when mode is "flow" — the "When an HTTP request is received" URL.
  flowUrl: "",

  // Used when mode is "form" — the Microsoft Forms share link.
  formUrl: "",

  // Used when mode is "none" — where the fallback email is addressed.
  fallbackEmail: "peopleandcapability@cashconverters.com",

  // Shown on the confirmation screen after a successful submit.
  successNote: "Thanks — People & Capability will pick this up.",
};

/* -----------------------------------------------------------------------------
   3. LABELS
   Change the wording here if you want different names on the filters.
   -------------------------------------------------------------------------- */
const TYPES = {
  workshop: { label: "Workshop",        short: "Workshop",  colour: "#ecb21f", desc: "Face-to-face, delivered by a trainer" },
  online:   { label: "Online module",   short: "Online",    colour: "#85e3f4", desc: "Self-paced on CCLearn" },
  policy:   { label: "Policy & compliance", short: "Policy", colour: "#b5a4d0", desc: "Policy sign-off or mandatory compliance" },
  webinar:  { label: "Webinar",         short: "Webinar",   colour: "#e3eb7b", desc: "Live, delivered virtually" },
  activity: { label: "Campaign & activity", short: "Activity", colour: "#ef9281", desc: "Drills, audits, awareness campaigns" },
};

const AREAS = {
  whs:        { label: "Work Health & Safety" },
  operations: { label: "Product & Operations" },
  leadership: { label: "Leadership" },
  compliance: { label: "Compliance & Risk" },
  ai:         { label: "AI Enablement" },
  pandc:      { label: "People & Capability" },
};

const STREAMS = {
  "stores":      { label: "Stores",      short: "Stores" },
  "ccpf":        { label: "CCPF",        short: "CCPF" },
  "head-office": { label: "Head Office", short: "Head Office" },
};

const STATUSES = {
  confirmed: { label: "Confirmed" },
  draft:     { label: "Draft" },
  proposed:  { label: "Proposed" },
};

/* -----------------------------------------------------------------------------
   4. TRAINING
   The actual calendar. Add, edit and delete items here.
   -------------------------------------------------------------------------- */
const TRAINING = [

  /* ==== WORK HEALTH & SAFETY ==============================================
     From the WHS tab of the draft planner. WHS training applies right across
     the business, so these are tagged to all three streams. If something is
     genuinely stores-only, trim the `streams` list on that item.            */

  {
    id: "whs-bullying-harassment",
    title: "Bullying and Harassment",
    month: "2026-08",
    type: "policy",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All team members",
    summary: "Annual bullying and harassment refresher and policy sign-off.",
    source: "planner",
  },
  {
    id: "whs-safety-month",
    title: "Safety Month",
    month: "2026-10",
    type: "activity",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All team members",
    summary: "National Safe Work Month campaign. Anchors the October WHS block below.",
    source: "planner",
  },
  {
    id: "whs-test-and-tag",
    title: "Test and Tag Training",
    month: "2026-10",
    type: "workshop",
    area: "whs",
    streams: ["stores", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "Nominated site testers",
    summary: "Practical training for team members responsible for electrical test and tag.",
    source: "planner",
  },
  {
    id: "whs-emergency-mgmt-managers",
    title: "Emergency Management (Managers)",
    month: "2026-10",
    type: "online",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "Managers only",
    summary: "Manager-level emergency management module. Part of the Safety Month block.",
    source: "planner",
  },
  {
    id: "whs-theft-by-force",
    title: "Theft by Force",
    month: "2026-10",
    type: "online",
    area: "whs",
    streams: ["stores"],
    status: "draft",
    owner: "WHS",
    audience: "All store team members",
    summary: "How to stay safe during an armed or forceful theft, and what to do afterwards.",
    source: "planner",
  },
  {
    id: "whs-evac-drill",
    title: "Evacuation Drill",
    month: "2026-10",
    type: "activity",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "Every site",
    summary: "Site-by-site evacuation drill, recorded against each location.",
    source: "planner",
  },
  {
    id: "whs-sign-off-audit",
    title: "Sign Off Audit",
    month: "2026-10",
    type: "activity",
    area: "compliance",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All sites",
    summary: "Audit of WHS module completions and policy sign-offs for the year to date.",
    source: "planner",
  },
  {
    id: "whs-bomb-threats",
    title: "Bomb Threats",
    month: "2026-11",
    type: "online",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All team members",
    summary: "Recognising and responding to a bomb threat.",
    source: "planner",
  },
  {
    id: "whs-lockdown",
    title: "Lockdown",
    month: "2027-02",
    type: "online",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All team members",
    summary: "Lockdown procedure — when to call it and how to run it.",
    source: "planner",
  },
  {
    id: "whs-violence-aggression",
    title: "Violence and Aggression",
    month: "2027-03",
    type: "online",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All team members",
    summary: "De-escalating aggressive customer behaviour and reporting incidents.",
    source: "planner",
  },
  {
    id: "whs-injury",
    title: "Injury Management",
    month: "2027-04",
    type: "online",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All team members",
    summary: "Reporting an injury, and the return-to-work process.",
    source: "planner",
  },
  {
    id: "whs-harassment-refresh",
    title: "Harassment",
    month: "2027-06",
    type: "policy",
    area: "whs",
    streams: ["stores", "ccpf", "head-office"],
    status: "draft",
    owner: "WHS",
    audience: "All team members",
    summary: "End-of-year harassment refresher. Note: overlaps with the August Bullying and Harassment module — worth confirming whether both are needed.",
    source: "planner",
  },

  /* ==== STORES ==========================================================
     From the Stores tab of the draft planner.                            */

  {
    id: "stores-ai-training-community",
    title: "AI Training and Community",
    month: "2026-08",
    type: "workshop",
    area: "ai",
    streams: ["stores", "head-office"],
    status: "draft",
    owner: "People & Capability",
    audience: "All team members",
    summary: "All For: 1 AI enablement — capability profile, training and the ongoing community of practice.",
    source: "planner",
  },
  {
    id: "stores-leadership-starts",
    title: "Leadership Starts",
    month: "2026-09",
    type: "workshop",
    area: "leadership",
    streams: ["stores"],
    status: "draft",
    owner: "People & Capability",
    audience: "Store Managers and 2ICs",
    summary: "Leadership development programme kicks off.",
    source: "planner",
  },
  {
    id: "stores-jewellery",
    title: "Jewellery",
    month: "2026-11",
    type: "workshop",
    area: "operations",
    streams: ["stores"],
    status: "draft",
    owner: "People & Capability",
    audience: "Store team members",
    summary: "Jewellery product knowledge, valuation and merchandising.",
    source: "planner",
  },
  {
    id: "stores-retail",
    title: "Retail",
    month: "2026-11",
    type: "workshop",
    area: "operations",
    streams: ["stores"],
    status: "draft",
    owner: "People & Capability",
    audience: "Store team members",
    summary: "Core retail skills — floor standards, customer experience and selling.",
    source: "planner",
  },
  {
    id: "stores-pawnbroking",
    title: "Pawnbroking",
    month: "2027-02",
    type: "workshop",
    area: "operations",
    streams: ["stores"],
    status: "draft",
    owner: "People & Capability",
    audience: "Store team members",
    summary: "Pawnbroking fundamentals — loans, redemptions and compliance.",
    source: "planner",
  },
  {
    id: "stores-webshop",
    title: "Webshop — Best Practice",
    month: "2027-03",
    type: "webinar",
    area: "operations",
    streams: ["stores"],
    status: "proposed",
    owner: "People & Capability",
    audience: "Store team members",
    summary: "Webshop best practice. Planner has this pencilled in as an online webinar — format still to be confirmed.",
    source: "planner",
  },
  {
    id: "stores-lux",
    title: "Lux",
    month: "2027-04",
    type: "workshop",
    area: "operations",
    streams: ["stores"],
    status: "draft",
    owner: "People & Capability",
    audience: "Store team members",
    summary: "Luxury goods — identification, authentication and pricing.",
    source: "planner",
  },
  {
    id: "stores-pf-workshops",
    title: "Personal Finance Workshops",
    month: "2027-06",
    type: "workshop",
    area: "operations",
    streams: ["stores"],
    status: "proposed",
    owner: "People & Capability",
    audience: "Store team members",
    summary: "Personal finance workshops for store teams. Marked with a question mark in the planner — not yet committed.",
    source: "planner",
  },

  /* ==== CCPF ============================================================
     From the CCPF tab of the draft planner. Assessing Essential Skills is
     listed in four consecutive months, so it is entered once as a recurring
     item using `months` rather than four separate entries.                */

  {
    id: "ccpf-assessing-essential-skills",
    title: "CCPF: Assessing Essential Skills",
    months: ["2026-08", "2026-09", "2026-10", "2026-11"],
    type: "workshop",
    area: "operations",
    streams: ["ccpf"],
    status: "draft",
    owner: "CCPF",
    audience: "CCPF assessors",
    summary: "Rolling assessing capability programme, running monthly from August through November.",
    source: "planner",
  },
  {
    id: "ccpf-collections-hardship",
    title: "Collections: Hardship and Vulnerability",
    month: "2026-10",
    type: "workshop",
    area: "compliance",
    streams: ["ccpf"],
    status: "draft",
    owner: "CCPF",
    audience: "Collections team",
    summary: "Identifying and supporting customers in hardship or vulnerable circumstances.",
    source: "planner",
  },

  /* ==== HEAD OFFICE =====================================================
     PLACEHOLDERS — none of this came from the spreadsheet. Seeded so the
     Head Office filter has something in it and you can see the shape.
     Replace with real dates and delete anything that does not apply.      */

  {
    id: "ho-fy-compliance-refresh",
    title: "New Financial Year Compliance Refresh",
    month: "2026-07",
    type: "policy",
    area: "compliance",
    streams: ["head-office"],
    status: "draft",
    owner: "Risk & Compliance",
    audience: "All Head Office",
    summary: "Annual code of conduct, privacy and AML/CTF sign-off at the start of the financial year.",
    source: "placeholder",
  },
  {
    id: "ho-cyber-awareness",
    title: "Cyber Security Awareness",
    month: "2026-11",
    type: "online",
    area: "compliance",
    streams: ["head-office", "stores", "ccpf"],
    status: "draft",
    owner: "Technology",
    audience: "All team members",
    summary: "Annual cyber awareness module and phishing simulation.",
    source: "placeholder",
  },
  {
    id: "ho-performance-conversations",
    title: "Performance Conversations for Managers",
    month: "2027-01",
    type: "workshop",
    area: "leadership",
    streams: ["head-office", "stores", "ccpf"],
    status: "draft",
    owner: "People & Capability",
    audience: "People leaders",
    summary: "Practical skills for the mid-year performance conversation cycle.",
    source: "placeholder",
  },
  {
    id: "ho-psychosocial-hazards",
    title: "Psychosocial Hazards for Leaders",
    month: "2027-05",
    type: "webinar",
    area: "whs",
    streams: ["head-office", "stores", "ccpf"],
    status: "draft",
    owner: "WHS",
    audience: "People leaders",
    summary: "Leader obligations around psychosocial hazards and how to spot early warning signs.",
    source: "placeholder",
  },
];

/* -----------------------------------------------------------------------------
   5. PEOPLE & CAPABILITY YEAR
   The P&C rhythm — every point in the year where we ask the business for
   feedback, plus the things that run continuously in the background.

   PLACEHOLDERS — replace the dates and items with the real P&C calendar.

   kind:  "feedback"  → we are collecting feedback from the business
          "cycle"     → a P&C process milestone
   -------------------------------------------------------------------------- */
const PANDC_YEAR = [
  {
    id: "pc-fy-goals",
    title: "FY Goal Setting",
    month: "2026-07",
    kind: "cycle",
    owner: "People & Capability",
    summary: "New financial year goals set across the business, including individual development goals.",
    source: "placeholder",
  },
  {
    id: "pc-onboarding-survey",
    title: "Onboarding Experience Survey",
    month: "2026-08",
    kind: "feedback",
    owner: "People & Capability",
    summary: "30/60/90 day check-in survey for new starters. Runs continuously, reported quarterly.",
    source: "placeholder",
  },
  {
    id: "pc-engagement-survey",
    title: "Annual Engagement Survey",
    month: "2026-09",
    kind: "feedback",
    owner: "People & Capability",
    summary: "Whole-of-business engagement survey. The largest feedback moment in the year.",
    source: "placeholder",
  },
  {
    id: "pc-engagement-action",
    title: "Engagement Results & Action Planning",
    month: "2026-10",
    kind: "cycle",
    owner: "People & Capability",
    summary: "Results shared back to the business, with team-level action plans built off them.",
    source: "placeholder",
  },
  {
    id: "pc-pulse-1",
    title: "Pulse Check #1",
    month: "2026-11",
    kind: "feedback",
    owner: "People & Capability",
    summary: "Short pulse survey to test whether engagement actions are landing.",
    source: "placeholder",
  },
  {
    id: "pc-peak-debrief",
    title: "Peak Season Debrief",
    month: "2026-12",
    kind: "feedback",
    owner: "People & Capability",
    summary: "Post-peak feedback from stores on resourcing, training readiness and support.",
    source: "placeholder",
  },
  {
    id: "pc-mid-year-reviews",
    title: "Mid-Year Performance Conversations",
    month: "2027-01",
    kind: "cycle",
    owner: "People & Capability",
    summary: "Formal mid-year check-in against goals and development plans.",
    source: "placeholder",
  },
  {
    id: "pc-pulse-2",
    title: "Pulse Check #2",
    month: "2027-02",
    kind: "feedback",
    owner: "People & Capability",
    summary: "Second pulse survey of the year.",
    source: "placeholder",
  },
  {
    id: "pc-learning-effectiveness",
    title: "Learning Effectiveness Review",
    month: "2027-03",
    kind: "feedback",
    owner: "People & Capability",
    summary: "Review of post-workshop evaluation and CCLearn feedback across the year to date.",
    source: "placeholder",
  },
  {
    id: "pc-leadership-360",
    title: "Leadership 360 Feedback",
    month: "2027-04",
    kind: "feedback",
    owner: "People & Capability",
    summary: "360 feedback for people leaders, feeding into development planning.",
    source: "placeholder",
  },
  {
    id: "pc-pulse-3",
    title: "Pulse Check #3",
    month: "2027-05",
    kind: "feedback",
    owner: "People & Capability",
    summary: "Final pulse of the year ahead of the end-of-year cycle.",
    source: "placeholder",
  },
  {
    id: "pc-tna",
    title: "Training Needs Analysis",
    month: "2027-06",
    kind: "cycle",
    owner: "People & Capability",
    summary: "Business-wide training needs analysis that builds next year's calendar.",
    source: "placeholder",
  },
];

/* Feedback that runs all year rather than in a single month. */
const PANDC_CONTINUOUS = [
  { title: "Post-workshop evaluation", summary: "Sent after every face-to-face workshop." },
  { title: "CCLearn module feedback",  summary: "Star rating and comment at the end of each online module." },
  { title: "New starter check-ins",    summary: "Structured conversations at 30, 60 and 90 days." },
  { title: "Exit interviews",          summary: "Offered to every leaver, themed and reported quarterly." },
  { title: "Manager 1:1s",             summary: "Ongoing coaching conversations captured against development goals." },
];
