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
       id:         "unique-id-here",       // any unique text, lowercase, no spaces
       title:      "Assessing Essentials",  // what shows on the card
       month:      "2026-08",               // YYYY-MM
       type:       "workshop",              // see TYPES list below
       department: "operations",            // see DEPARTMENTS list below
       areas:      ["stores"],              // see BUSINESS AREAS below — can be many
       status:     "confirmed",             // see STATUS list below
       audience:   "Store Managers",        // who attends (free text)
       summary:    "One or two lines.",     // shows when the card is opened
       resources:  "https://…"              // link to the resources for this session
     },

   Only `id`, `title`, `month` and `type` are strictly required. Everything
   else is optional and will simply be left out of the display if missing.

   RUNS OVER SEVERAL MONTHS? Use `months` instead of `month`:
       months: ["2026-08", "2026-09", "2026-10"]
   The item will appear in every month listed and be badged as recurring.

   NO DATE YET? Set status: "parked" and leave the month off entirely. Parked
   items are listed together underneath the calendar so they are not forgotten.

   -----------------------------------------------------------------------------
   THE FIXED LISTS — use these exact values
   -----------------------------------------------------------------------------
   TYPES           workshop | online | policy | webinar | activity
   BUSINESS AREAS  stores | ccpf | head-office        (the `areas` field)
   DEPARTMENTS     people-culture | it | marketing | operations |
                   whs | finance | risk-compliance | leadership
   STATUS          confirmed | draft | proposed | parked

   Anything other than `confirmed` gets a visible badge so nobody mistakes an
   idea for a locked-in date. Use `confirmed` only when the date is real.

   The department drives the colour of the card, matching the colour coding in
   the Policy Resign Calendar spreadsheet.

   -----------------------------------------------------------------------------
   THE `resources` LINK
   -----------------------------------------------------------------------------
   Every item that is NOT an online module has a `resources` field — the place
   trainers go for the facilitator guide, slides, handouts and activities.
   Paste a SharePoint folder link, a Teams file link, or anything else.

   Leave it as "" and the card shows a quiet "Resources to come", so it is
   obvious at a glance which sessions still need their materials linked.

   Online modules do not have one — the module itself is the resource, so use
   the `link` field to point at the CCLearn course instead.

   -----------------------------------------------------------------------------
   WHERE THIS DATA CAME FROM
   -----------------------------------------------------------------------------
   source: "planner"          Draft Annual Planner (Jul 26 – Jun 27) —
                              the WHS / Stores / CCPF tabs.
   source: "policy-calendar"  2026 Policy Resign Calendar — the colour-coded
                              "2026" tab, plus its Online Modules and
                              Campaigns_Workshops tabs.
   source: "placeholder"      Seeded by way of example so the Head Office view
                              has something in it. Flagged in the app.
                              Replace with real dates.

   The two source documents overlap in three places. Both versions are in the
   calendar so nothing is silently dropped — see README.md for the list.
   ============================================================================= */

/* -----------------------------------------------------------------------------
   1. THE YEAR
   The calendar can show either a financial year or a calendar year — there is
   a toggle in the app, and the year itself is a dropdown. These settings only
   control which year it opens on.
   -------------------------------------------------------------------------- */
const FY = {
  startYear: 2026,     // financial year starting July 2026 (i.e. FY26/27)
  startMonth: 7,       // 7 = July. Change if the financial year ever moves.
  pickerRange: 4,      // how many years either side to offer in the dropdown
};

/* Months where we do not schedule training, shown greyed out on the calendar.
   1 = January … 12 = December. Currently July and December. */
const BLACKOUT_MONTHS = [7, 12];

/* -----------------------------------------------------------------------------
   2. THE TWO BUTTONS — "LOG A WORKSHOP" AND "REQUEST TRAINING"
   -------------------------------------------------------------------------- */
/*
   There is no backend in this app, so submissions have to go somewhere in
   Microsoft 365. Both buttons work the same way. Pick ONE mode for each:

   mode: "flow"   → The form opens inside this app and posts straight into a
                    SharePoint list via a Power Automate flow. Best experience;
                    same pattern as the AI Capability Profile app. Paste your
                    flow's HTTP POST URL into `flowUrl`.
                    Full set-up steps are in README.md.

   mode: "form"   → The button opens a Microsoft Form in a new tab. Simplest to
                    set up, but takes the person out of the app. Paste the
                    Form's share link into `formUrl`.

   mode: "none"   → Nothing is wired up yet (the current setting). The form
                    still works: on submit it copies a tidy summary to the
                    clipboard and opens an email to `fallbackEmail` so nobody
                    is ever blocked.
*/
const WORKSHOP_LOG = {
  mode: "none",
  flowUrl: "",
  formUrl: "",
  fallbackEmail: "peopleandcapability@cashconverters.com",
  successNote: "Thanks — People & Capability will pick this up.",
};

const TRAINING_REQUEST = {
  mode: "none",
  flowUrl: "",
  formUrl: "",
  fallbackEmail: "peopleandcapability@cashconverters.com",
  successNote: "Thanks — People & Capability will be in touch about this request.",
};

/* -----------------------------------------------------------------------------
   3. LABELS
   Change the wording here if you want different names on the filters.
   -------------------------------------------------------------------------- */

/* The big cards at the top of the page. */
const BUSINESS_AREAS = {
  "stores":      { label: "Stores",      short: "Stores",      blurb: "Store teams and managers" },
  "ccpf":        { label: "CCPF",        short: "CCPF",        blurb: "Personal Finance" },
  "head-office": { label: "Head Office", short: "Head Office", blurb: "Support and corporate" },
};

/* Colours come straight from the colour coding in the Policy Resign Calendar.
   Change a colour here and it changes everywhere it is used. */
const DEPARTMENTS = {
  "people-culture":  { label: "People & Culture",  short: "P&C",        colour: "#ef9281" },
  "it":              { label: "IT",                short: "IT",         colour: "#0e93b4" },
  "marketing":       { label: "Marketing",         short: "Marketing",  colour: "#b5a4d0" },
  "operations":      { label: "Operations",        short: "Ops",        colour: "#ecb21f" },
  "whs":             { label: "WHS",               short: "WHS",        colour: "#2f8f6b" },
  "finance":         { label: "Finance",           short: "Finance",    colour: "#e3eb7b" },
  "risk-compliance": { label: "Risk & Compliance", short: "Risk",       colour: "#981a30" },
  "leadership":      { label: "Leadership",        short: "Leadership", colour: "#4b3b8f" },
};

const TYPES = {
  workshop: { label: "Workshop",            short: "Workshop" },
  online:   { label: "Online module",       short: "Online" },
  policy:   { label: "Policy resigns",      short: "Resign" },
  webinar:  { label: "Webinar",             short: "Webinar" },
  activity: { label: "Campaign & activity", short: "Campaign" },
};

const STATUSES = {
  confirmed: { label: "Confirmed" },
  draft:     { label: "Draft" },
  proposed:  { label: "Proposed" },
  parked:    { label: "Parked" },
};

/* -----------------------------------------------------------------------------
   4. TRAINING
   The actual calendar. Add, edit and delete items here.
   -------------------------------------------------------------------------- */
const TRAINING = [

  /* ======================================================================
     POLICY RESIGN CALENDAR — 2026
     From the colour-coded "2026" tab. Departments follow the cell colours.
     ====================================================================== */

  /* --- February 2026 --- */
  {
    id: "pol-dv-leave",
    title: "Family and Domestic Violence Leave",
    month: "2026-02",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Office and Store Managers",
    summary: "Family and domestic violence leave entitlements and how to support someone using them.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-privacy-policy",
    title: "Privacy Policy",
    month: "2026-02",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Annual privacy policy resign. Flagged in the calendar to merge with Intro to the Privacy Act next year.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-intro-privacy-act",
    title: "Intro to the Privacy Act",
    month: "2026-02",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Introduction to the Privacy Act. Marked in the calendar as to be redone.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- March 2026 --- */
  {
    id: "pol-whistleblower",
    title: "Whistleblower Policy",
    month: "2026-03",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Whistleblower policy resign. Redone February 2026.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-conflict-of-interest",
    title: "Conflict of Interest Policy",
    month: "2026-03",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Conflict of interest policy resign. Redone February 2026.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-anti-bribery",
    title: "Anti-Bribery and Corruption Policy",
    month: "2026-03",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Anti-bribery and corruption policy resign. Redone February 2026.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "cmp-theft-by-force",
    title: "Theft by Force (campaign)",
    month: "2026-03",
    type: "activity",
    department: "whs",
    areas: ["stores"],
    status: "draft",
    audience: "Store team members",
    summary: "Theft by force awareness campaign, ahead of the April workshop.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- April 2026 --- */
  {
    id: "pol-webshop-policy",
    title: "Webshop Policy",
    month: "2026-04",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Stores",
    summary: "Webshop policy resign. Redone March 2026.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-luxury-goods",
    title: "Luxury Goods",
    month: "2026-04",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Stores",
    summary: "Luxury goods policy resign. Redone March 2026.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "ws-theft-by-force",
    title: "Theft by Force Workshop",
    month: "2026-04",
    type: "workshop",
    department: "whs",
    areas: ["stores"],
    status: "draft",
    audience: "Store team members",
    summary: "Face-to-face workshop following the March campaign.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- May 2026 --- */
  {
    id: "pol-gst-policy",
    title: "Goods and Services Tax Policy",
    month: "2026-05",
    type: "policy",
    department: "finance",
    areas: ["head-office"],
    status: "draft",
    audience: "Finance",
    summary: "GST policy resign. Good to go as is.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-gst-bas",
    title: "GST-BAS Procedure Manual",
    month: "2026-05",
    type: "policy",
    department: "finance",
    areas: ["head-office"],
    status: "draft",
    audience: "Finance",
    summary: "GST-BAS procedure manual resign. Good to go as is.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-gifts-benefits",
    title: "Gifts and Benefits Policy",
    month: "2026-05",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Gifts and benefits policy resign. Redone April 2026.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "om-collections-selling",
    title: "Collections: Selling the Benefits",
    month: "2026-05",
    type: "online",
    department: "operations",
    areas: ["ccpf"],
    status: "draft",
    audience: "Collections team",
    summary: "Third module in the Collections series.",
    link: "",
    source: "policy-calendar",
  },

  /* --- August 2026 --- */
  {
    id: "pol-dispute-resolution",
    title: "Dispute Resolution Policy",
    month: "2026-08",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Dispute resolution policy resign. Good to go as is.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-right-to-disconnect",
    title: "Right to Disconnect",
    month: "2026-08",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Right to disconnect policy resign. Good to go as is.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-bullying-harassment",
    title: "Bullying and Harassment",
    month: "2026-08",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Bullying and harassment policy resign. Appears in both source documents for August 2026 — entered once here.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "om-collections-asking",
    title: "Collections: Asking for Money",
    month: "2026-08",
    type: "online",
    department: "operations",
    areas: ["ccpf"],
    status: "draft",
    audience: "Collections team",
    summary: "Second module in the Collections series.",
    link: "",
    source: "policy-calendar",
  },
  {
    id: "cmp-test-and-tag-refresher",
    title: "Test and Tag Refresher (campaign)",
    month: "2026-08",
    type: "activity",
    department: "whs",
    areas: ["stores", "head-office"],
    status: "draft",
    audience: "Nominated site testers",
    summary: "Test and tag refresher campaign. Note the draft training planner also has Test and Tag Training in October — worth confirming which is right.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- September 2026 --- */
  {
    id: "pol-aml-ctf",
    title: "AML/CTF Module",
    month: "2026-09",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Anti-money laundering and counter-terrorism financing module.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-eeo",
    title: "Equal Employment and Discrimination Policy",
    month: "2026-09",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Equal employment opportunity and discrimination policy resign.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-ddo",
    title: "Design and Distribution Obligations",
    month: "2026-09",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Design and distribution obligations resign.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- October 2026 (Safety Month) --- */
  {
    id: "pol-whs-policy-corp",
    title: "Corporate Store Operations — WHS Policy",
    month: "2026-10",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Corporate stores",
    summary: "WHS policy resign for corporate stores. Part of Safety Month.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-fires-evac",
    title: "Fires, Fire Extinguishers and Evacuation Drills",
    month: "2026-10",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Corporate stores",
    summary: "Fire safety and evacuation drill policy resign. Part of Safety Month.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-ffw-injury",
    title: "Fitness for Work and Injury, Illness Management Policy",
    month: "2026-10",
    type: "policy",
    department: "operations",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Fitness for work and injury/illness management policy resign. Part of Safety Month.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "om-violence-aggression-resign",
    title: "Violence and Aggression (resign)",
    month: "2026-10",
    type: "online",
    department: "whs",
    areas: ["stores"],
    status: "draft",
    audience: "Store team members",
    summary: "Violence and aggression module resign, part of Safety Month. Note the draft training planner also has this in March 2027.",
    link: "",
    source: "policy-calendar",
  },

  /* --- November 2026 --- */
  {
    id: "pol-employee-standards",
    title: "Employee Standards of Behaviour Policy",
    month: "2026-11",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Employee standards of behaviour policy resign.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-work-related-social",
    title: "Work Related Social Function Policy",
    month: "2026-11",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Whole organisation",
    summary: "Work related social function policy resign.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-split-payments",
    title: "Split Payments (Square)",
    month: "2026-11",
    type: "policy",
    department: "finance",
    areas: ["stores"],
    status: "draft",
    audience: "Corporate staff",
    summary: "Split payments via Square policy resign.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "om-collections-maximising",
    title: "Collections: Maximising Payments",
    month: "2026-11",
    type: "online",
    department: "operations",
    areas: ["ccpf"],
    status: "draft",
    audience: "Collections team",
    summary: "Fourth module in the Collections series.",
    link: "",
    source: "policy-calendar",
  },

  /* --- Parked: no date agreed yet --- */
  {
    id: "pol-social-media",
    title: "Social Media Policy",
    type: "policy",
    department: "marketing",
    areas: ["stores", "ccpf", "head-office"],
    status: "parked",
    audience: "Whole organisation",
    summary: "Sitting in the parked section of the policy calendar — no month agreed.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-customer-marketing",
    title: "Customer Marketing Policy",
    type: "policy",
    department: "marketing",
    areas: ["stores", "ccpf", "head-office"],
    status: "parked",
    audience: "Whole organisation",
    summary: "Awaiting a policy update, then to be redone.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-recruitment",
    title: "Recruitment Policy",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "parked",
    audience: "Whole organisation",
    summary: "Parked 4 March 2026 — policy still under review.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-unconscious-bias",
    title: "Unconscious Bias",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "parked",
    audience: "Whole organisation",
    summary: "Listed in the parked section with no date.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-leave-policy",
    title: "Leave Policy",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "parked",
    audience: "Whole organisation",
    summary: "Pencilled in with a question mark in the parked section.",
    resources: "",
    source: "policy-calendar",
  },

  /* ======================================================================
     DRAFT ANNUAL PLANNER — FY26/27
     From the WHS / Stores / CCPF tabs of the training planner.
     ====================================================================== */

  /* --- Work Health & Safety ---
     WHS training applies right across the business, so these are tagged to
     all three areas. If something is genuinely stores-only, trim `areas`. */
  {
    id: "whs-safety-month",
    title: "Safety Month",
    month: "2026-10",
    type: "activity",
    department: "whs",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "All team members",
    summary: "National Safe Work Month campaign. Anchors the October block.",
    resources: "",
    source: "planner",
  },
  {
    id: "whs-test-and-tag",
    title: "Test and Tag Training",
    month: "2026-10",
    type: "workshop",
    department: "whs",
    areas: ["stores", "head-office"],
    status: "draft",
    audience: "Nominated site testers",
    summary: "Practical training for team members responsible for electrical test and tag.",
    resources: "",
    source: "planner",
  },
  {
    id: "whs-emergency-mgmt-managers",
    title: "Emergency Management (Managers)",
    month: "2026-10",
    type: "online",
    department: "whs",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Managers only",
    summary: "Manager-level emergency management module. Part of the Safety Month block.",
    link: "",
    source: "planner",
  },
  {
    id: "whs-theft-by-force",
    title: "Theft by Force",
    month: "2026-10",
    type: "online",
    department: "whs",
    areas: ["stores"],
    status: "draft",
    audience: "All store team members",
    summary: "How to stay safe during an armed or forceful theft, and what to do afterwards. Note the policy calendar runs theft by force in March and April.",
    link: "",
    source: "planner",
  },
  {
    id: "whs-evac-drill",
    title: "Evacuation Drill",
    month: "2026-10",
    type: "activity",
    department: "whs",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "Every site",
    summary: "Site-by-site evacuation drill, recorded against each location.",
    resources: "",
    source: "planner",
  },
  {
    id: "whs-sign-off-audit",
    title: "Sign Off Audit",
    month: "2026-10",
    type: "activity",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "All sites",
    summary: "Audit of module completions and policy sign-offs for the year to date.",
    resources: "",
    source: "planner",
  },
  {
    id: "whs-bomb-threats",
    title: "Bomb Threats",
    month: "2026-11",
    type: "online",
    department: "whs",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "All team members",
    summary: "Recognising and responding to a bomb threat.",
    link: "",
    source: "planner",
  },
  {
    id: "whs-lockdown",
    title: "Lockdown",
    month: "2027-02",
    type: "online",
    department: "whs",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "All team members",
    summary: "Lockdown procedure — when to call it and how to run it.",
    link: "",
    source: "planner",
  },
  {
    id: "whs-violence-aggression",
    title: "Violence and Aggression",
    month: "2027-03",
    type: "online",
    department: "whs",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "All team members",
    summary: "De-escalating aggressive customer behaviour and reporting incidents. Note the policy calendar has this resigning in October 2026.",
    link: "",
    source: "planner",
  },
  {
    id: "whs-injury",
    title: "Injury Management",
    month: "2027-04",
    type: "online",
    department: "whs",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "All team members",
    summary: "Reporting an injury, and the return-to-work process.",
    link: "",
    source: "planner",
  },
  {
    id: "whs-harassment-refresh",
    title: "Harassment",
    month: "2027-06",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    status: "draft",
    audience: "All team members",
    summary: "End-of-year harassment refresher. Overlaps with the August bullying and harassment resign — worth confirming whether both are needed.",
    resources: "",
    source: "planner",
  },

  /* --- Stores --- */
  {
    id: "stores-ai-training-community",
    title: "AI Training and Community",
    month: "2026-08",
    type: "workshop",
    department: "people-culture",
    areas: ["stores", "head-office"],
    status: "draft",
    audience: "All team members",
    summary: "All For: 1 AI enablement — capability profile, training and the ongoing community of practice.",
    resources: "",
    source: "planner",
  },
  {
    id: "stores-leadership-starts",
    title: "Leadership Starts",
    month: "2026-09",
    type: "workshop",
    department: "leadership",
    areas: ["stores"],
    status: "draft",
    audience: "Store Managers and 2ICs",
    summary: "Leadership development programme kicks off.",
    resources: "",
    source: "planner",
  },
  {
    id: "stores-jewellery",
    title: "Jewellery",
    month: "2026-11",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Store team members",
    summary: "Jewellery product knowledge, valuation and merchandising.",
    resources: "",
    source: "planner",
  },
  {
    id: "stores-retail",
    title: "Retail",
    month: "2026-11",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Store team members",
    summary: "Core retail skills — floor standards, customer experience and selling.",
    resources: "",
    source: "planner",
  },
  {
    id: "stores-pawnbroking",
    title: "Pawnbroking",
    month: "2027-02",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Store team members",
    summary: "Pawnbroking fundamentals — loans, redemptions and compliance.",
    resources: "",
    source: "planner",
  },
  {
    id: "stores-webshop",
    title: "Webshop — Best Practice",
    month: "2027-03",
    type: "webinar",
    department: "operations",
    areas: ["stores"],
    status: "proposed",
    audience: "Store team members",
    summary: "Webshop best practice. Pencilled in as an online webinar — format still to be confirmed.",
    resources: "",
    source: "planner",
  },
  {
    id: "stores-lux",
    title: "Lux",
    month: "2027-04",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    status: "draft",
    audience: "Store team members",
    summary: "Luxury goods — identification, authentication and pricing.",
    resources: "",
    source: "planner",
  },
  {
    id: "stores-pf-workshops",
    title: "Personal Finance Workshops",
    month: "2027-06",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    status: "proposed",
    audience: "Store team members",
    summary: "Personal finance workshops for store teams. Marked with a question mark in the planner — not yet committed.",
    resources: "",
    source: "planner",
  },

  /* --- CCPF ---
     Assessing Essential Skills runs in four consecutive months, so it is
     entered once as a recurring item rather than four separate entries. */
  {
    id: "ccpf-assessing-essential-skills",
    title: "CCPF: Assessing Essential Skills",
    months: ["2026-08", "2026-09", "2026-10", "2026-11"],
    type: "workshop",
    department: "operations",
    areas: ["ccpf"],
    status: "draft",
    audience: "CCPF assessors",
    summary: "Rolling assessing capability programme, running monthly from August through November.",
    resources: "",
    source: "planner",
  },
  {
    id: "ccpf-collections-hardship",
    title: "Collections: Hardship and Vulnerability",
    month: "2026-10",
    type: "workshop",
    department: "risk-compliance",
    areas: ["ccpf"],
    status: "draft",
    audience: "Collections team",
    summary: "Identifying and supporting customers in hardship or vulnerable circumstances.",
    resources: "",
    source: "planner",
  },

  /* ======================================================================
     HEAD OFFICE — PLACEHOLDERS
     None of this came from either spreadsheet. Seeded so the Head Office
     view has something in it. Replace with real dates, delete what does
     not apply.
     ====================================================================== */
  {
    id: "ho-fy-compliance-refresh",
    title: "New Financial Year Compliance Refresh",
    month: "2026-08",
    type: "policy",
    department: "risk-compliance",
    areas: ["head-office"],
    status: "draft",
    audience: "All Head Office",
    summary: "Code of conduct and AML/CTF sign-off at the start of the financial year.",
    resources: "",
    source: "placeholder",
  },
  {
    id: "ho-cyber-awareness",
    title: "Cyber Security Awareness",
    month: "2026-11",
    type: "online",
    department: "it",
    areas: ["head-office", "stores", "ccpf"],
    status: "draft",
    audience: "All team members",
    summary: "Annual cyber awareness module and phishing simulation.",
    link: "",
    source: "placeholder",
  },
  {
    id: "ho-performance-conversations",
    title: "Performance Conversations for Managers",
    month: "2027-01",
    type: "workshop",
    department: "leadership",
    areas: ["head-office", "stores", "ccpf"],
    status: "draft",
    audience: "People leaders",
    summary: "Practical skills for the mid-year performance conversation cycle.",
    resources: "",
    source: "placeholder",
  },
  {
    id: "ho-psychosocial-hazards",
    title: "Psychosocial Hazards for Leaders",
    month: "2027-05",
    type: "webinar",
    department: "whs",
    areas: ["head-office", "stores", "ccpf"],
    status: "draft",
    audience: "People leaders",
    summary: "Leader obligations around psychosocial hazards and how to spot early warning signs.",
    resources: "",
    source: "placeholder",
  },
];
