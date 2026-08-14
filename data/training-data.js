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

   RUNS FROM A DATE ONWARDS? Set a `month` and add `ongoing: true`. It sits
   in its starting month and reads "from Aug 26, ongoing".

   NO DATE YET? Leave the month off entirely. Items with no date are listed
   together in a "Parked" block underneath the calendar so they are not lost.

   -----------------------------------------------------------------------------
   THE FIXED LISTS — use these exact values
   -----------------------------------------------------------------------------
   TYPES           policy | online | blended | workshop | webinar | event | drill
                   (these mirror the Delivery column of the master sheet)
   BUSINESS AREAS  stores | ccpf | head-office        (the `areas` field)
   DEPARTMENTS     people-culture | it | marketing | operations |
                   whs | finance | risk-compliance | leadership

   The department drives the colour of the card, matching the colour coding in
   the policy resign calendar.

   -----------------------------------------------------------------------------
   THE `resources` LINK
   -----------------------------------------------------------------------------
   This is the sheet's Resource Link column. Every item has one — the place
   people go for the module, the facilitator guide, the slides or the
   handouts. Paste a SharePoint folder link, a Teams file link, a CCLearn
   course URL, or anything else.

   Leave it as "" and the item reads a quiet "Resources to come", so it is
   obvious at a glance what still needs its materials linked.

   -----------------------------------------------------------------------------
   WHERE THIS DATA CAME FROM
   -----------------------------------------------------------------------------
   Everything below comes from one place: the master training sheet. Its
   columns map to these fields as follows.

       Area          → `areas` (which business areas) and `audience`
       Delivery      → `type`
       Category      → `department`
       Title         → `title`
       When          → `month` / `months` / `ongoing`
       Overview      → `summary`
       Status        → used only to tell the policy resigns apart
       Resource Link → `resources`

   The `parked` items at the end are policies with no date agreed. They were
   in the earlier policy calendar and have no row in the master sheet, since
   that sheet is organised by month.
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
  policy:   { label: "Policy resigns",         short: "Resign" },
  online:   { label: "eLearning",              short: "eLearning" },
  blended:  { label: "eLearning and Workshop", short: "Blended" },
  workshop: { label: "Workshop",               short: "Workshop" },
  webinar:  { label: "Webinar",                short: "Webinar" },
  event:    { label: "Event",                  short: "Event" },
  drill:    { label: "Drill",                  short: "Drill" },
};

/* -----------------------------------------------------------------------------
   4. TRAINING
   The actual calendar. Add, edit and delete items here.
   -------------------------------------------------------------------------- */

/* Shorthand for the Area column, so the mapping is stated once. */
const ALL_AREAS = ["stores", "ccpf", "head-office"];

const TRAINING = [

  /* ======================================================================
     POLICY RESIGNS
     Every row of the master sheet carrying "Policy Resign" in its Status
     column. All are delivered as eLearning.
     ====================================================================== */
  {
    id: "pol-dispute-resolution",
    title: "Dispute Resolution Policy",
    month: "2026-08",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains the process for raising, assessing and resolving workplace disputes fairly and consistently.",
    resources: "",
  },
  {
    id: "pol-right-to-disconnect",
    title: "Right to Disconnect",
    month: "2026-08",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains employees' right to decline unreasonable work contact outside their working hours.",
    resources: "",
  },
  {
    id: "pol-bullying-harassment",
    title: "Bullying and Harassment",
    month: "2026-08",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Defines bullying and harassment and explains prevention, reporting and response responsibilities.",
    resources: "",
  },
  {
    id: "pol-aml-ctf",
    title: "AML/CTF Module",
    month: "2026-09",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Covers how to identify, manage and report money laundering and terrorism financing risks.",
    resources: "",
  },
  {
    id: "pol-eeo",
    title: "Equal Employment and Discrimination Policy",
    month: "2026-09",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains equal employment obligations and how to prevent and address unlawful discrimination.",
    resources: "",
  },
  {
    id: "pol-ddo",
    title: "Design and Distribution Obligations",
    month: "2026-09",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Covers the controls required to design and distribute financial products to an appropriate target market.",
    resources: "",
  },
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
  },
  {
    id: "pol-ffw-injury",
    title: "Fitness for Work and Injury, Illness Management Policy",
    month: "2026-10",
    type: "policy",
    department: "operations",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains fitness for work expectations and the management of workplace injury and illness.",
    resources: "",
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
    summary: "Covers recognising, preventing, responding to and reporting workplace violence and aggression.",
    resources: "",
  },
  {
    id: "pol-employee-standards",
    title: "Employee Standards of Behaviour Policy",
    month: "2026-11",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Sets expectations for professional, ethical and respectful employee conduct.",
    resources: "",
  },
  {
    id: "pol-work-related-social",
    title: "Work Related Social Function",
    month: "2026-11",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains conduct, safety and organisational expectations at work related social events.",
    resources: "",
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
  },
  {
    id: "pol-dv-leave",
    title: "Family and Domestic Violence Leave",
    month: "2027-02",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Office and Store Managers",
    format: "eLearning",
    summary: "Explains eligibility, access, confidentiality and support relating to family and domestic violence leave.",
    resources: "",
  },
  {
    id: "pol-privacy-policy",
    title: "Privacy Policy",
    month: "2027-02",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains how personal information must be collected, used, stored, disclosed and protected.",
    resources: "",
  },
  {
    id: "pol-whistleblower",
    title: "Whistleblower Policy",
    month: "2027-03",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains how eligible concerns can be reported confidentially and the protections available to whistleblowers.",
    resources: "",
  },
  {
    id: "pol-conflict-of-interest",
    title: "Conflict of Interest Policy",
    month: "2027-03",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains how to identify, disclose and manage actual, potential and perceived conflicts of interest.",
    resources: "",
  },
  {
    id: "pol-anti-bribery",
    title: "Anti Bribery and Corruption Policy",
    month: "2027-03",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains prohibited bribery and corruption and the controls for preventing and reporting misconduct.",
    resources: "",
  },
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
  },
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
  },
  {
    id: "pol-gifts-benefits",
    title: "Gifts and Benefits Policy",
    month: "2027-05",
    type: "policy",
    department: "risk-compliance",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Explains when gifts and benefits may be offered or accepted and the required approval and disclosure process.",
    resources: "",
  },

  /* ======================================================================
     PROGRAMMES
     Longer-running training rather than a single scheduled month.
     ====================================================================== */
  {
    id: "ccpf-assessing-essential-skills",
    title: "CCPF: Assessing Essential Skills",
    months: ["2026-08", "2026-09", "2026-10", "2026-11"],
    type: "blended",
    department: "operations",
    areas: ["ccpf"],
    audience: "Contact and Lending Centre",
    summary: "Develops the skills required to assess customer needs and recommend appropriate financial solutions.",
    resources: "",
  },
  {
    id: "ccpf-collections-hardship",
    title: "Collections: Hardship and Vulnerability",
    month: "2026-10",
    type: "blended",
    department: "operations",
    areas: ["ccpf"],
    audience: "Collections and Hardship",
    summary: "Explains how to identify and support customers experiencing financial hardship or vulnerability.",
    resources: "",
  },
  {
    id: "ai-training-elearning",
    title: "AI Training",
    months: ["2026-08", "2026-09"],
    type: "online",
    department: "it",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    summary: "Builds practical skills for using AI responsibly, effectively and collaboratively in the workplace.",
    resources: "",
  },
  {
    id: "ai-community-workshops",
    title: "AI Community Workshops",
    month: "2026-11",
    type: "workshop",
    department: "it",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    summary: "Face-to-face sessions and the ongoing community of practice, following the AI eLearning.",
    resources: "",
  },

  /* ======================================================================
     LEADERSHIP PROGRAMME
     The Rotating Competency Focus — one competency a month, run by People &
     Culture. Stores only to start: add "ccpf" and "head-office" to `areas`
     when it widens out.

     The cycle runs September through to the following August. December and
     July have no competency, which lines up with the blackout months.
     ====================================================================== */
  {
    id: "lead-summit",
    title: "Leadership Summit",
    month: "2026-10",
    type: "event",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole business",
    summary: "One-day leadership summit for the whole business.",
    resources: "",
  },
  {
    id: "lead-potential",
    title: "Leadership: Potential",
    month: "2026-09",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Potential.",
    resources: "",
  },
  {
    id: "lead-risk-safety-protection",
    title: "Leadership: Risk, Safety & Protection",
    month: "2026-10",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Risk, Safety & Protection.",
    resources: "",
  },
  {
    id: "lead-community",
    title: "Leadership: Community",
    month: "2026-11",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Community.",
    resources: "",
  },
  {
    id: "lead-performance",
    title: "Leadership: Performance",
    month: "2027-01",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Performance.",
    resources: "",
  },
  {
    id: "lead-perseverance",
    title: "Leadership: Perseverance",
    month: "2027-02",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Perseverance.",
    resources: "",
  },
  {
    id: "lead-systems-execution",
    title: "Leadership: Systems and Execution",
    month: "2027-03",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Systems and Execution.",
    resources: "",
  },
  {
    id: "lead-responsibility",
    title: "Leadership: Responsibility",
    month: "2027-04",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Responsibility.",
    resources: "",
  },
  {
    id: "lead-people",
    title: "Leadership: People",
    month: "2027-05",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: People.",
    resources: "",
  },
  {
    id: "lead-equity",
    title: "Leadership: Equity",
    month: "2027-06",
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Equity.",
    resources: "",
  },
  {
    id: "lead-customer-trust",
    title: "Leadership: Customer Trust",
    month: "2027-08",
    // Last month of the Sep-to-Aug cycle, so it lands just outside FY26/27.
    // Change to 2026-08 if the rotation should sit inside this financial year.
    type: "webinar",
    department: "people-culture",
    areas: ["stores"],
    audience: "Store leaders",
    summary: "Rotating competency focus for the month: Customer Trust.",
    resources: "",
  },

  /* ======================================================================
     WORK HEALTH & SAFETY
     ====================================================================== */
  {
    id: "whs-test-and-tag",
    title: "Test and Tag Training",
    month: "2026-10",
    type: "online",
    department: "whs",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Covers the safe inspection, testing and tagging of electrical equipment in the workplace. Part of Safety Month.",
    resources: "",
  },
  {
    id: "whs-emergency-mgmt-managers",
    title: "Emergency Management Module – Managers",
    month: "2026-10",
    type: "online",
    department: "whs",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Prepares managers to coordinate emergency responses and protect employees, customers and property.",
    resources: "",
  },
  {
    id: "whs-theft-by-force",
    title: "Theft By Force",
    month: "2026-10",
    type: "blended",
    department: "whs",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Explains how to respond safely to theft involving force, threats or aggressive behaviour.",
    resources: "",
  },
  {
    id: "whs-evac-drill",
    title: "Evacuation Drill",
    month: "2026-10",
    type: "drill",
    department: "whs",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Practises the procedures for safely and efficiently evacuating the workplace during an emergency.",
    resources: "",
  },
  {
    id: "whs-bomb-threats",
    title: "Bomb Threats",
    month: "2026-11",
    type: "online",
    // The sheet leaves Delivery blank for this one and for Lockdown; both are
    // treated as eLearning to match the rest of the WHS block.
    department: "whs",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Explains how to recognise, report and respond safely to a bomb threat or suspicious item.",
    resources: "",
  },
  {
    id: "whs-lockdown",
    title: "Lockdown",
    month: "2027-02",
    type: "online",
    department: "whs",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Covers the actions required to secure the workplace and protect people during a serious external or internal threat.",
    resources: "",
  },
  {
    id: "whs-violence-aggression",
    title: "Violence and Aggression",
    month: "2027-03",
    type: "blended",
    department: "whs",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Explains how to prevent, de escalate, report and respond safely to violent or aggressive behaviour.",
    resources: "",
  },

  /* ======================================================================
     PRODUCT AND OPERATIONS
     ====================================================================== */
  {
    id: "ops-jewellery",
    title: "Jewellery",
    month: "2026-11",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Develops knowledge of jewellery identification, assessment, handling and valuation requirements.",
    resources: "",
  },
  {
    id: "ops-retail",
    title: "Retail",
    month: "2026-11",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Covers essential retail practices, including customer service, sales, merchandising and transaction processing.",
    resources: "",
  },
  {
    id: "ops-pawnbroking",
    title: "Pawnbroking",
    month: "2027-02",
    type: "online",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Explains the processes and compliance requirements for assessing, documenting and managing pawn transactions.",
    resources: "",
  },
  {
    id: "ops-webshop-best-practice",
    title: "Webshop - Best Practice",
    month: "2027-03",
    type: "webinar",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Covers best practice for accurately listing, managing, fulfilling and supporting online sales.",
    resources: "",
  },
  {
    id: "ops-lux",
    title: "Lux",
    month: "2027-04",
    type: "online",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Develops practical skills in identifying, assessing, valuing and handling luxury goods in accordance with operational requirements.",
    resources: "",
  },
  {
    id: "ops-personal-finance",
    title: "Personal Finance",
    month: "2027-06",
    type: "workshop",
    department: "operations",
    areas: ["stores"],
    audience: "Corporate Stores",
    summary: "Builds practical knowledge of budgeting, saving, borrowing and making informed financial decisions.",
    resources: "",
  },

  /* ======================================================================
     PARKED — no date agreed yet
     These carried over from the policy resign calendar's parked section.
     They have no row in the master sheet because that sheet is organised
     by month. Delete any that are no longer wanted.
     ====================================================================== */
  {
    id: "pol-social-media",
    title: "Social Media Policy",
    type: "policy",
    department: "marketing",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Parked in the policy calendar — no month agreed.",
    resources: "",
  },
  {
    id: "pol-customer-marketing",
    title: "Customer Marketing Policy",
    type: "policy",
    department: "marketing",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Parked — awaiting a policy update, then to be redone.",
    resources: "",
  },
  {
    id: "pol-recruitment",
    title: "Recruitment Policy",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Parked 4 March 2026 — policy still under review.",
    resources: "",
  },
  {
    id: "pol-unconscious-bias",
    title: "Unconscious Bias",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Parked in the policy calendar with no date.",
    resources: "",
  },
  {
    id: "pol-leave-policy",
    title: "Leave Policy",
    type: "policy",
    department: "people-culture",
    areas: ALL_AREAS,
    audience: "Whole Organisation",
    format: "eLearning",
    summary: "Pencilled in with a question mark in the parked section.",
    resources: "",
  },
];
