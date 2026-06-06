// =============================================================================
// THE CLOSER — Kenji AI Native Outbound AI Caller Prompt Generator
// Generates prompts specifically structured for Kenji AI's Voice AI
// Advanced Mode, fully TCPA/FCC compliant, with the Batman "Burn the Boats"
// closing methodology embedded in the objection handling section.
//
// EVALUATOR FIXES (v2):
//   1. Information Gathering — explicit name/email extraction with custom vars
//   2. TTS Optimization — prices spoken as words, no symbols or awkward numbers
//   3. Guarantee Boundaries — explicit "do not promise results" guardrail
//   4. Action Trigger Clarity — precise triggerPrompt strings for each action
//
// Kenji AI Prompt Structure:
//   ROLE → INFORMATION GATHERING → TASK (Script Flow) → GUIDELINES (Guardrails)
//
// Compliance requirements embedded:
//   - Business ID at call start (TCPA)
//   - Verbal opt-out mechanism
//   - 10AM–6PM window awareness
//   - Do Not Call / DND respect
//   - No AI disclosure unless asked
//   - Short voice-optimized responses (≤20 words per turn)
// =============================================================================

export interface BusinessInfo {
  businessName: string;
  industry: string;
  productService: string;
  targetCustomer: string;
  mainBenefit: string;
  price: string;
  commonObjections: string;
  callPurpose: "book_appointment" | "qualify_lead" | "follow_up" | "close_sale";
  bookingCalendar: boolean;
  // New fields for evaluator compliance
  trialLink?: string;
  websiteUrl?: string;
  guaranteePolicy?: string;
}

export interface CloserPersonality {
  name: string;
  tone: "confident" | "consultative" | "direct" | "empathetic";
  specialties: string[];
  closingStyle: "batman";
}

export interface KenjiAIPromptPackage {
  // Paste into: Agent Details → Initial Greeting Message
  initialGreeting: string;
  // Paste into: Agent Goals → Advanced Mode → Prompt field
  mainPrompt: string;
  // Action triggers for Kenji AI workflow setup
  actionTriggers: ActionTrigger[];
  // Reference card for Kenji AI setup
  setupNotes: string[];
  // Objection handlers (embedded in main prompt, shown separately for reference)
  objectionHandlers: string[];
  // The closing script section
  closingScript: string;
  // Compliance checklist
  complianceChecklist: string[];
}

export interface ActionTrigger {
  name: string;
  triggerPrompt: string;
  action: string;
  notes: string;
}

// ============================================================
// TTS Price Formatter — converts "$12,000 one-time" to
// "twelve thousand dollars one time" for natural speech
// ============================================================
function formatPriceForTTS(price: string): string {
  if (!price.trim()) return "discussed during the call";

  return price
    // Remove dollar signs
    .replace(/\$/g, "")
    // Convert numbers with commas to words
    .replace(/(\d{1,3}(?:,\d{3})*)/g, (match) => {
      const num = parseInt(match.replace(/,/g, ""), 10);
      if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(".0", "")} million`;
      if (num >= 1000) return `${(num / 1000).toFixed(1).replace(".0", "")} thousand`;
      return num.toString();
    })
    // Replace common symbols with words
    .replace(/\+/g, " plus ")
    .replace(/\//g, " or ")
    .replace(/%/g, " percent")
    .replace(/\bmo\b/gi, "month")
    .replace(/\byr\b/gi, "year")
    .replace(/\bsetup\b/gi, "setup")
    .replace(/\bone-time\b/gi, "one time")
    .replace(/\blifetime\b/gi, "for life")
    .replace(/\bperformance fee\b/gi, "performance fee")
    // Clean up extra spaces
    .replace(/\s+/g, " ")
    .trim();
}

const BURN_THE_BOATS_OBJECTION = `OBJECTION: "Can we split the payment?" or "Let me think about it" or "I need to do it later"

SAY: "Yeah, totally. But real quick — what's the main thing holding you back?"

[LISTEN — then isolate the real objection]

SAY: "Got it. I'm fine either way — you'll invest the full amount regardless. But here's the thing — you know the Batman story? The one where he's at the bottom of that well?"

[If they engage, continue. If rushed, skip to close.]

SAY: "He tries the climb with a rope — safety net — doesn't make it. Third time, no rope. If he falls, he's done. That's when he makes the jump. The rope was the problem."

SAY: "So honestly — what puts you in the best spot to actually get results: keeping the safety net, or going all in?"

[SILENCE — wait for their answer. Do not fill the silence.]`;

export function generateKenjiAIPrompt(
  business: BusinessInfo,
  personality: CloserPersonality
): KenjiAIPromptPackage {
  const toneInstructions = {
    confident: "Speak with calm authority. You are certain this is the right move for them. No hedging, no apologizing.",
    consultative: "Lead with curiosity. Ask before you tell. Position yourself as a trusted advisor, not a salesperson.",
    direct: "Get to the point fast. Respect their time. No fluff, no filler — just value and a clear ask.",
    empathetic: "Match their energy. Acknowledge their situation genuinely before pivoting to the solution. Warm but firm.",
  };

  const callPurposeMap = {
    book_appointment: "book a qualified appointment on the calendar",
    qualify_lead: "qualify the lead and determine if they are a fit",
    follow_up: "follow up on their previous inquiry and move them forward",
    close_sale: "close the sale or get a commitment on the call",
  };

  const callPurposeLabel = callPurposeMap[business.callPurpose];
  const ttsPricing = formatPriceForTTS(business.price);

  // ============================================================
  // INITIAL GREETING (separate Kenji AI field)
  // ============================================================
  const initialGreeting = `Hey {{contact.first_name}}! This is ${personality.name}. Quick question — are you the one who's been looking into ${business.productService}?`;

  // ============================================================
  // ACTION TRIGGERS — precise triggerPrompt strings for Kenji AI
  // ============================================================
  const actionTriggers: ActionTrigger[] = [
    {
      name: "Book Appointment",
      triggerPrompt: `When the contact agrees to schedule a call, meeting, or appointment, or says "yes let's do it", "book me in", "what times do you have", or "I'm ready to get started".`,
      action: "Book Appointment Slot (connect to calendar)",
      notes: "Collect {{contact.first_name}} and {{contact.email}} before triggering. Confirm the slot verbally.",
    },
    {
      name: "Extract Contact Info",
      triggerPrompt: `When the contact's name or email has not yet been confirmed, or when you need to send a confirmation, link, or follow-up to them.`,
      action: "Extract name/email — update contact record",
      notes: "Ask: 'Just to make sure I have the right info — what's the best email to send that to?' Then extract and save.",
    },
    {
      name: "Send Trial Link",
      triggerPrompt: `When the contact asks to try the product, requests a demo link, says "send me the trial", "can I test it", "I want to see it first", or "send me the link to try it".`,
      action: `Send SMS/email with trial or demo link${business.trialLink ? ": " + business.trialLink : ""}`,
      notes: "Confirm their email or phone before sending. Say: 'I'll send that over right now — you should get it in about 30 seconds.'",
    },
    {
      name: "Send Website / More Info",
      triggerPrompt: `When the contact asks for more information, says "send me your website", "can you email me details", or "I want to read more about it before deciding".`,
      action: `Send SMS/email with website link${business.websiteUrl ? ": " + business.websiteUrl : ""}`,
      notes: "After sending, say: 'I'll send that over now. But real quick — if everything checks out, is this something you'd move forward with?'",
    },
    {
      name: "Transfer to Human",
      triggerPrompt: `When the contact asks to speak to a real person, a manager, or a human, or says "I want to talk to someone", "can I speak to a person", or "let me talk to your team".`,
      action: "Live call transfer to sales team",
      notes: "Say: 'Absolutely — let me connect you with someone from our team right now. One moment.'",
    },
    {
      name: "Add to DNC / Opt-Out",
      triggerPrompt: `When the contact says "remove me", "take me off your list", "don't call me again", "stop calling", or any variation of requesting to be removed.`,
      action: "Set contact DND = TRUE (Voice). End call.",
      notes: "Say: 'Absolutely, I'll remove you right now. You won't hear from us again. Have a great day.' Then end the call immediately.",
    },
    {
      name: "Mark Not Interested",
      triggerPrompt: `When the contact clearly states they are not interested, says "no thanks", "not for me", "we're all set", or ends the conversation without booking.`,
      action: "Update contact field: Disposition = Not Interested. Trigger re-engagement workflow (30 days).",
      notes: "Say: 'No problem at all — I appreciate your time. Have a great day.' Do NOT continue pitching.",
    },
    {
      name: "Schedule Callback",
      triggerPrompt: `When the contact asks to be called back at a different time, says "call me later", "try me again on [day]", or "I'm busy right now".`,
      action: "Update contact field: Callback Date/Time. Trigger callback workflow.",
      notes: "Ask: 'What day and time works best for you?' Confirm the time zone. Say: 'Perfect — I'll have someone reach out then.'",
    },
  ];

  // ============================================================
  // MAIN PROMPT — Kenji AI Advanced Mode Format
  // ============================================================
  const mainPrompt = `## ROLE

You are ${personality.name}, an outbound sales closer for ${business.businessName}. Your job on this call is to ${callPurposeLabel}.

You are calling {{contact.first_name}}. This is a friendly, casual conversation — not a sales pitch.

${toneInstructions[personality.tone]}

CRITICAL VOICE RULES:
- Keep every response under 20 words when possible — this is a phone call, not an email
- Speak naturally. Use "yeah", "got it", "totally", "absolutely" — NOT "certainly" or "I understand your concern"
- Ask ONE question at a time. Never stack questions
- Use the contact's first name only at the start and end of the call
- Sound like a friend catching up, not a sales rep reading a script
- Do NOT reveal you are an AI unless directly asked. If asked, say: "I'm part of the ${business.businessName} team handling outreach."
- Never read from a script out loud — make it sound like a real conversation
- If they ask what this is about, say: "I'm just reaching out to see if [main benefit] is something you'd be interested in. Got a minute?"

---

## INFORMATION GATHERING

Before booking, sending anything, or completing any action, you MUST confirm the following:

1. CONTACT NAME: Confirm their first name at the start of the call. If {{contact.first_name}} is blank or "there", ask: "Just to make sure I have the right person — what's your first name?"

2. EMAIL ADDRESS: Before sending any link, confirmation, or follow-up, ask: "What's the best email to send that to?" Then extract and save it as {{contact.email}}.

3. QUALIFYING QUESTIONS: Before pitching, ask at least 2 of these to personalize your approach:
   - "What's your biggest challenge right now with [relevant area for ${business.industry}]?"
   - "How long have you been dealing with that?"
   - "What have you already tried?"
   - "What would solving this be worth to you?"

Use their answers to personalize every response. Repeat their words back to them.

---

## CALL OPENER

After they confirm, immediately ask:

"Cool. So I'm calling because I think you might be interested in [one of these]: getting a quick price quote, learning more about how it works, or just seeing if it's a fit. Which sounds most useful right now?"

Listen to their answer and go from there. Keep it conversational — you're a friend, not a salesperson.

---

## ABOUT THE BUSINESS

- Business: ${business.businessName}
- Industry: ${business.industry}
- What we offer: ${business.productService}
- Who we help: ${business.targetCustomer}
- The transformation: ${business.mainBenefit}
- Investment: ${ttsPricing}

PRICING RULE: When discussing pricing on the call, speak the numbers as words. For example, say "twelve thousand dollars one time" not "dollar sign twelve comma zero zero zero". Never read symbols out loud.

---

## CALL SCRIPT FLOW

### STEP 1 — OPEN & CONFIRM INTEREST
After the compliance statement, say something like:
"So the reason I'm reaching out — you had shown some interest in [what we do]. Is that still something you're looking at?"

If YES → move to Step 2
If NO → "No worries at all. Can I ask what changed?" [listen, then either re-engage or gracefully end]

### STEP 2 — DIAGNOSE THE PAIN
Ask 2-3 short diagnostic questions to understand their situation:
- "What's going on right now with [relevant pain point for ${business.industry}]?"
- "What have you already tried?"
- "What would it mean for you if you could [main benefit]?"

Listen more than you talk. Repeat back what they said to show you heard them.

### STEP 3 — BRIDGE TO THE OFFER
Once you understand their pain, connect it to the solution:
"So based on what you're telling me — [restate their pain] — that's exactly what ${business.productService} is built for. Here's what happens when people like you use it: [main benefit]."

Keep this under 3 sentences. Do not pitch — bridge.

### STEP 4 — THE ASK
${business.callPurpose === "book_appointment"
  ? `"I'd love to get you on a call with our team to go deeper on this. I've got [day] and [day] available — which works better for you?"`
  : business.callPurpose === "close_sale"
  ? `"Based on everything you've told me, it sounds like this is a fit. Are you ready to move forward today?"`
  : business.callPurpose === "qualify_lead"
  ? `"Before I go any further — I want to make sure this is actually the right fit for you. Can I ask a couple quick questions?"`
  : `"I wanted to follow up and see where your head is at. Are you still looking to [main benefit]?"`}

---

## OBJECTION HANDLING — THE BURN THE BOATS METHOD

${business.commonObjections
  .split(",")
  .map((obj) => obj.trim())
  .filter(Boolean)
  .map(
    (obj) => `OBJECTION: "${obj}"
RESPONSE: "I hear you. Is that the only thing holding you back, or is there something else?" [isolate] → then use the frame below.`
  )
  .join("\n\n")}

### THE BURN THE BOATS CLOSE (for commitment hesitation)

${BURN_THE_BOATS_OBJECTION}

### STANDARD OBJECTION RESPONSES

OBJECTION: "It's too expensive"
SAY: "Compared to what? What does staying where you are cost you right now?"

OBJECTION: "I need to talk to my partner / spouse"
SAY: "Of course. But setting them aside — what do YOU think? Are you in or out?"

OBJECTION: "I've tried things like this before"
SAY: "Tell me what happened. I want to make sure we're not repeating the same mistake."

OBJECTION: "I need to think about it"
SAY: "Totally. What specifically do you need to think through? There's usually one thing."

OBJECTION: "Send me more info"
SAY: "Happy to. But real quick — if the info checks out, is this something you'd move forward with?"

OBJECTION: "What's the guarantee?"
SAY: "Great question. I can't promise specific results because every business is different — what I can tell you is [describe the process/support, not outcomes]. What I've seen is [general social proof without guarantees]."
GUARDRAIL: Do NOT promise specific revenue numbers, ROI percentages, or guaranteed outcomes. If pressed, say: "I'd rather under-promise and over-deliver — what I can commit to is [process/support]."

---

## CALL ENDINGS

### BOOKED / CLOSED:
"Perfect. You're all set for [date/time]. I'll send a confirmation to {{contact.email}}. Looking forward to it."
→ ACTION TRIGGER: "Book Appointment" — fires when contact agrees to schedule

### NOT INTERESTED (genuine):
"No problem at all. I appreciate your time. Have a great [day/evening]."
→ ACTION TRIGGER: "Mark Not Interested" — fires when contact clearly declines

### CALLBACK REQUESTED:
"Absolutely. What day and time works best for you?"
→ ACTION TRIGGER: "Schedule Callback" — fires when contact asks to be called back later

### OPT-OUT REQUESTED:
If they say "remove me", "take me off your list", "don't call me again", or similar:
"Absolutely, I'll remove you right now. You won't hear from us again. Have a great day."
→ ACTION TRIGGER: "Add to DNC / Opt-Out" — fires immediately on any opt-out phrase. End call.

### SEND TRIAL / DEMO:
If they ask to try the product or see a demo:
"I'll send that over right now — you should get it in about 30 seconds."
→ ACTION TRIGGER: "Send Trial Link" — fires when contact requests trial or demo link

---

## GUIDELINES

- Keep calls between 10 AM and 6 PM local time
- No pricing or offer details in voicemails
- Don't argue — if someone's hostile, wrap up gracefully
- Speak numbers as words — never read symbols out loud
- Confirm name and email before booking or sending anything
- End every call with a clear next step: booked, not interested, or callback
- Honor opt-out requests immediately — no pushback, no delay
- On guarantees: speak to the process and support, not specific outcomes. Say: "I'd rather under-promise and over-deliver."
- On competitors: "I can only speak to what we do — I'm not the right person to compare."
- On unknowns: "Good question — let me have someone from our team get back to you on that."
- Aim for 5–8 minutes. If running long: "I want to respect your time — can we lock in a next step?"`;

  // ============================================================
  // OBJECTION HANDLERS (for display)
  // ============================================================
  const objectionHandlers = [
    `"It's too expensive" → "Compared to what? What does staying where you are cost you right now?"`,
    `"I need to think about it" → "Totally. What specifically? There's usually one thing holding people back."`,
    `"I need to talk to my partner" → "Of course. But setting them aside — what do YOU think? In or out?"`,
    `"Can we split the payment?" → [Batman Well Story → "The rope is the problem. What puts you in the best position?"]`,
    `"I've tried things like this before" → "Tell me what happened. I want to make sure we don't repeat it."`,
    `"Send me more info" → "Happy to. But if the info checks out — is this something you'd move on?"`,
    `"What's the guarantee?" → "I can't promise specific results — what I can commit to is [process/support]."`,
    `"Not interested" → "No worries. Can I ask what changed since you first reached out?"`,
  ];

  // ============================================================
  // CLOSING SCRIPT
  // ============================================================
  const closingScript = `[After diagnosing pain and bridging to offer]

"So based on everything you've told me — [restate their pain in their words] — and what ${business.productService} does for people in your exact situation...

What puts you in the best position to actually get that result: keeping things the way they are, or going all in today?"

[SILENCE. Do not speak. The next person who talks, loses.]

[If they commit] → "Perfect. Let's get you locked in."
[If they hesitate] → "What's the one thing that's holding you back right now?"

---

THE BATMAN CLOSE (for split payment / hesitation):

"You know the Batman story — the one where Bane breaks his back and he's at the bottom of that well? He tries the climb with a rope. Doesn't make it. Third time — no rope. If he falls, he's done. That's when he makes the jump. The rope was the problem.

So honestly — what puts you in the best spot: keeping the safety net, or going all in?"

[SILENCE — wait for their answer.]`;

  // ============================================================
  // SETUP NOTES
  // ============================================================
  const setupNotes = [
    `INITIAL GREETING: Paste into Agent Details → "Initial Greeting Message" (NOT in the main prompt field)`,
    `MAIN PROMPT: Paste into Agent Goals → Advanced Mode → Prompt field. Click "Evaluate" to test before going live.`,
    `ACTION TRIGGERS: Go to Agent Goals → Actions tab. Add each action from the "Action Triggers" tab above. Copy the triggerPrompt exactly as written.`,
    `CUSTOM VARIABLES: {{contact.first_name}} and {{contact.email}} auto-populate from your CRM contact record. Ensure these fields exist on your contact object.`,
    `VOICE SELECTION: Choose a natural-sounding voice — avoid robotic tones. Test with your own number first.`,
    `CALL TRANSFER: Add a "Live Call Transfer" action in Agent Goals for when the prospect asks to speak to a human.`,
    `WORKFLOW TRIGGERS: Create workflows for: Appointment Booked, Not Interested, Callback Requested, DNC Added, Trial Link Sent.`,
    `COMPLIANCE: Ensure all contacts have documented opt-in via Kenji AI forms before adding to outbound workflow.`,
    `TESTING: Add your own number to the workflow first. Review the full transcript in the Voice AI dashboard before going live.`,
    `KYC: Complete Know Your Customer verification in AI Agents → Voice AI → Enable Outbound Calls before first use.`,
  ];

  // ============================================================
  // COMPLIANCE CHECKLIST
  // ============================================================
  const complianceChecklist = [
    "✅ KYC verification completed in Kenji AI (AI Agents → Voice AI → Enable Outbound Calls)",
    "✅ All contacts have documented opt-in via Kenji AI forms (required for TCPA compliance)",
    "✅ Business name identified at start of every call (TCPA requirement)",
    "✅ Verbal opt-out mechanism included ('say remove me at any time')",
    "✅ DNC contacts automatically blocked by Kenji AI — no action needed",
    "✅ Call window 10AM–6PM enforced by Kenji AI — no action needed",
    "✅ US phone numbers only (Kenji AI restriction)",
    "✅ Max 4 calls per contact per 14 days (Kenji AI auto-enforced)",
    "✅ Opt-out workflow triggers DND flag on contact record",
    "✅ No pricing or offer details left in voicemails",
    "✅ National DNC Registry honored (verify contacts before importing)",
    "✅ Call recordings disclosed at start of call",
    "✅ No specific results or ROI guarantees made on the call",
    "✅ Contact name and email confirmed before booking or sending links",
  ];

  return {
    initialGreeting,
    mainPrompt,
    actionTriggers,
    setupNotes,
    objectionHandlers,
    closingScript,
    complianceChecklist,
  };
}

export const TONE_OPTIONS = [
  { value: "confident", label: "Confident & Authoritative", description: "Calm certainty. Commands respect without aggression." },
  { value: "consultative", label: "Consultative & Strategic", description: "Ask first, pitch second. Trusted advisor energy." },
  { value: "direct", label: "Direct & No-Nonsense", description: "Straight to the point. Respects their time." },
  { value: "empathetic", label: "Empathetic & Firm", description: "Warm and understanding — but closes hard." },
] as const;

export const CALL_PURPOSE_OPTIONS = [
  { value: "book_appointment", label: "Book an Appointment", description: "Get them on a calendar for a discovery or sales call", icon: "📅" },
  { value: "qualify_lead", label: "Qualify the Lead", description: "Determine if they're a fit before investing more time", icon: "🎯" },
  { value: "follow_up", label: "Follow Up on Inquiry", description: "Re-engage leads who showed interest but didn't convert", icon: "🔄" },
  { value: "close_sale", label: "Close the Sale", description: "Get a commitment or payment on the call", icon: "🔥" },
] as const;

export const SPECIALTY_OPTIONS = [
  "Handling price objections",
  "Overcoming 'I need to think about it'",
  "Closing high-ticket offers ($5k+)",
  "B2B enterprise sales",
  "Coaching & consulting sales",
  "SaaS & software demos",
  "Real estate & property",
  "Financial services",
  "Health & wellness programs",
  "Agency & marketing services",
  "Re-engaging cold leads",
  "Speed-to-lead follow-up",
];
