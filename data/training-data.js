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
       audience:   "Store Managers",        // who attends (free text)
       format:     "eLearning",             // optional: how it is delivered
       summary:    "One or two lines.",     // shows when the card is opened
       resources:  "https://…"              // link to the resources for this session
     },

   Only `id`, `title`, `month` and `type` are strictly required. Everything
   else is optional and will simply be left out of the display if missing.

   RUNS OVER SEVERAL MONTHS? Use `months` instead of `month`:
       months: ["2026-08", "2026-09", "2026-10"]
   The item will appear in every month listed and be badged as recurring.

   NO DATE YET? Leave the month off entirely. Items with no date are listed
   together in a "Parked" block underneath the calendar so they are not lost.

   -----------------------------------------------------------------------------
   THE FIXED LISTS — use these exact values
   -----------------------------------------------------------------------------
   TYPES           workshop | online | policy | webinar | activity
   BUSINESS AREAS  stores | ccpf | head-office        (the `areas` field)
   DEPARTMENTS     people-culture | it | marketing | operations |
                   whs | finance | risk-compliance | leadership

   The department drives the colour of the card, matching the colour coding in
   the policy resign calendar.

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
   source: "policy-calendar"  The policy resign calendar. Titles, areas,
                              departments, dates and overviews are taken
                              straight from it.
   source: "planner"          Draft Annual Planner (Jul 26 – Jun 27) —
                              the WHS / Stores / CCPF tabs.
   source: "placeholder"      Seeded by way of example so the Head Office view
                              has something in it. Flagged in the app.
                              Replace with real dates.

   The two source documents disagree in three places. Both versions are in the
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

/* Colours come from the colour coding in the policy resign calendar.
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

/* -----------------------------------------------------------------------------
   4. TRAINING
   The actual calendar. Add, edit and delete items here.
   -------------------------------------------------------------------------- */
const TRAINING = [

  /* ======================================================================
     POLICY RESIGNS — FY26/27
     Straight from the policy resign calendar. Every one is delivered as
     eLearning. Departments follow the Category column, business areas
     follow the Area column, and the summaries are its Overview text.
     ====================================================================== */

  /* --- August 2026 --- */
  {
    id: "pol-dispute-resolution",
    title: "Dispute Resolution Policy",
    month: "2026-08",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains the process for raising, assessing and resolving workplace disputes fairly and consistently.",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains employees' right to decline unreasonable work contact outside their working hours.",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Defines bullying and harassment, explains prevention, reporting and response responsibilities.",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Covers how to identify, manage and report money laundering and terrorism financing risks.",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains equal employment obligations and how to prevent and address unlawful discrimination.",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Covers the controls required to design and distribute financial products to an appropriate target market.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- October 2026 (Safety Month) --- */
  {
    id: "pol-whs-policy-corp",
    title: "Corporate Store Operations WHS Policy",
    month: "2026-10",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    format: "eLearning",
    summary: "Outlines workplace health and safety responsibilities and controls for corporate store operations.",
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
    audience: "Corporate Stores",
    format: "eLearning",
    summary: "Covers fire prevention, extinguisher awareness and safe emergency evacuation procedures.",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains fitness for work expectations and the management of workplace injury and illness.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-violence-aggression-resign",
    title: "Violence and Aggression Resign",
    month: "2026-10",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    format: "eLearning",
    summary: "Covers recognising, preventing, responding to and reporting workplace violence and aggression. Note the draft training planner also has Violence and Aggression in March 2027.",
    resources: "",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Sets expectations for professional, ethical and respectful employee conduct.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-work-related-social",
    title: "Work Related Social Function",
    month: "2026-11",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains conduct, safety and organisational expectations at work related social events.",
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
    audience: "Corporate Stores",
    format: "eLearning",
    summary: "Explains how to process split payment transactions accurately using Square.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- February 2027 --- */
  {
    id: "pol-dv-leave",
    title: "Family and Domestic Violence Leave",
    month: "2027-02",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Office and Store Managers",
    format: "eLearning",
    summary: "Explains eligibility, access, confidentiality and support relating to family and domestic violence leave.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-privacy-policy",
    title: "Privacy Policy",
    month: "2027-02",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains how personal information must be collected, used, stored, disclosed and protected.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- March 2027 --- */
  {
    id: "pol-whistleblower",
    title: "Whistleblower Policy",
    month: "2027-03",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains how eligible concerns can be reported confidentially and the protections available to whistleblowers.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-conflict-of-interest",
    title: "Conflict of Interest Policy",
    month: "2027-03",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Covers how to identify, disclose and manage actual, potential and perceived conflicts of interest.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-anti-bribery",
    title: "Anti Bribery and Corruption Policy",
    month: "2027-03",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains prohibited bribery and corruption and the controls for preventing and reporting misconduct.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- April 2027 --- */
  {
    id: "pol-webshop-policy",
    title: "Webshop Policy",
    month: "2027-04",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    audience: "Stores",
    format: "eLearning",
    summary: "Outlines the requirements for managing webshop sales, transactions, fulfilment and customer service.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-luxury-goods",
    title: "Luxury Goods",
    month: "2027-04",
    type: "policy",
    department: "operations",
    areas: ["stores"],
    audience: "Stores",
    format: "eLearning",
    summary: "Covers the handling, assessment and sale of luxury goods in line with operational and compliance requirements.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- May 2027 --- */
  {
    id: "pol-gst-policy",
    title: "Goods and Services Tax Policy",
    month: "2027-05",
    type: "policy",
    department: "finance",
    areas: ["head-office"],
    audience: "Finance",
    format: "eLearning",
    summary: "Explains how GST obligations apply to business transactions, records and reporting.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-gst-bas",
    title: "GST BAS Procedure Manual",
    month: "2027-05",
    type: "policy",
    department: "finance",
    areas: ["head-office"],
    audience: "Finance",
    format: "eLearning",
    summary: "Provides the steps for preparing, reviewing and lodging GST information through the Business Activity Statement.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-gifts-benefits",
    title: "Gifts and Benefits Policy",
    month: "2027-05",
    type: "policy",
    department: "risk-compliance",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Explains when gifts and benefits may be offered or accepted and the required approval and disclosure process.",
    resources: "",
    source: "policy-calendar",
  },

  /* --- Parked: no date agreed yet ---
     These sit in the parked section of the policy calendar. They have no
     month, so the app lists them under the calendar rather than losing them. */
  {
    id: "pol-social-media",
    title: "Social Media Policy",
    type: "policy",
    department: "marketing",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Parked in the policy calendar — no month agreed.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-customer-marketing",
    title: "Customer Marketing Policy",
    type: "policy",
    department: "marketing",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Parked — awaiting a policy update, then to be redone.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-recruitment",
    title: "Recruitment Policy",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
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
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Parked in the policy calendar with no date.",
    resources: "",
    source: "policy-calendar",
  },
  {
    id: "pol-leave-policy",
    title: "Leave Policy",
    type: "policy",
    department: "people-culture",
    areas: ["stores", "ccpf", "head-office"],
    audience: "Whole organisation",
    format: "eLearning",
    summary: "Pencilled in with a question mark in the parked section.",
    resources: "",
    source: "policy-calendar",
  },

  /* ======================================================================
     ONLINE MODULES AND CAMPAIGNS
     From the Online Modules and Campaigns_Workshops tabs of the policy
     calendar. These are not policy resigns.
     ====================================================================== */
  {
    id: "cmp-theft-by-force",
    title: "Theft by Force (campaign)",
    month: "2026-03",
    type: "activity",
    department: "whs",
    areas: ["stores"],
    audience: "Store team members",
    summary: "Theft by force awareness campaign, ahead of the April workshop.",
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
    audience: "Store team members",
    summary: "Face-to-face workshop following the March campaign.",
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
    audience: "Collections team",
    summary: "Third module in the Collections series.",
    link: "",
    source: "policy-calendar",
  },
  {
    id: "om-collections-asking",
    title: "Collections: Asking for Money",
    month: "2026-08",
    type: "online",
    department: "operations",
    areas: ["ccpf"],
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
    audience: "Nominated site testers",
    summary: "Test and tag refresher campaign. Note the draft training planner also has Test and Tag Training in October.",
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
    audience: "Collections team",
    summary: "Fourth module in the Collections series.",
    link: "",
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
    audience: "Store team members",
    summary: "Webshop best practice. Pencilled in as an online webinar with a question mark in the planner — format and commitment still to be confirmed.",
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
    id: "ho-cyber-awareness",
    title: "Cyber Security Awareness",
    month: "2026-11",
    type: "online",
    department: "it",
    areas: ["head-office", "stores", "ccpf"],
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
    audience: "People leaders",
    summary: "Leader obligations around psychosocial hazards and how to spot early warning signs.",
    resources: "",
    source: "placeholder",
  },
];
