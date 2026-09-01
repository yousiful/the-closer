// =============================================================================
// THE CLOSER — Kenji AI Voice Agent Prompt Generator
// Generates ONE prompt structured for Kenji AI's Voice AI Advanced Mode, with
// the Batman "Burn the Boats" closing methodology embedded in objection
// handling. The prompt is direction-adaptive: it works on a call the agent
// placed (outbound) AND a call that came in to the same number (inbound),
// without asking the user to pick one at generation time.
//
// Why one prompt instead of two: GHL exposes a single Prompt field per agent,
// there is no separate inbound-prompt / outbound-prompt slot to fill in. An
// agent always knows, as basic situational context, whether it initiated the
// call or answered one that came in, the same way a human rep would. So the
// prompt itself branches on that at the top, and every section below carries
// both an IF OUTBOUND and an IF INBOUND path where the two genuinely differ
// (compliance requirements are NOT the same for a call you placed vs a call
// someone placed to you), and a single merged instruction where they don't.
//
// Kenji AI Prompt Structure:
//   ROLE → DIRECTION CHECK → COMPLIANCE OPENING → INFORMATION GATHERING
//        → PRODUCT KNOWLEDGE → TASK (Script Flow) → OBJECTIONS → PERSISTENCE
//        → GUIDELINES
// =============================================================================

export type CallDirection = "outbound" | "inbound";

export interface BusinessInfo {
  businessName: string;
  industry: string;
  productService: string;
  targetCustomer: string;
  mainBenefit: string;
  price: string;
  commonObjections: string;
  callPurpose: "book_appointment" | "qualify_lead" | "follow_up" | "close_sale" | "qualify_and_transfer";
  bookingCalendar: boolean;
  // Deep product knowledge the agent can answer from. Free text, one fact or
  // Q&A pair per line.
  productKnowledge?: string;
  trialLink?: string;
  websiteUrl?: string;
  guaranteePolicy?: string;
  // Only used when callPurpose is "qualify_and_transfer". The real bar a
  // contact must clear before the agent transfers them live, one criterion
  // per line (e.g. "Budget of $5k+/month", "Is the decision maker",
  // "Ready to start within 30 days"). Without this the agent has nothing
  // concrete to qualify against and would either transfer everyone or no one.
  qualifyingCriteria?: string;
}

export interface CloserPersonality {
  name: string;
  tone: "confident" | "consultative" | "direct" | "empathetic";
  specialties: string[];
  closingStyle: "batman";
}

export interface KenjiAIPromptPackage {
  // Paste into: Agent Details → Initial Greeting Message
  // A single greeting that reads naturally whether the agent placed the call
  // or answered one, since this field is static text with no branching.
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
  // Literal GHL tag to add on this trigger (lowercase-hyphenated, GHL
  // convention). Tags are the lowest-friction GHL action, no custom field
  // setup required, and drive downstream automation directly via the native
  // "Contact Tag Added" workflow trigger.
  ghlTag?: string;
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

// ============================================================
// Short spoken topic — the greeting has to be sayable in one
// breath, so trim the full product description down to a clause
// instead of reading the whole paragraph out loud.
// ============================================================
const TRAILING_CONNECTORS = /\s+(that|which|who|where|with|and|or|for|to|the|a|an|in|on|of|by|from|at|is|are)$/i;

function shortTopic(productService: string): string {
  const first = productService.split(/[.\n]/)[0].trim();
  const cleaned = first.replace(/^(an?|the)\s+/i, "").trim();
  if (!cleaned) return "what we do";
  if (cleaned.length <= 60) return cleaned.replace(/[.,;:]+$/, "");

  // Truncate on a word boundary, then clean up the seam so the agent never
  // says a half-finished clause like "a caller that books".
  let cut = cleaned.slice(0, 60);
  cut = cut.slice(0, cut.lastIndexOf(" "));
  // Drop a dangling relative clause left over from the cut.
  cut = cut.replace(/\s+(that|which|who|where)\b.*$/i, "");
  // Drop trailing connectors so it doesn't end on a preposition.
  while (TRAILING_CONNECTORS.test(cut)) cut = cut.replace(TRAILING_CONNECTORS, "");
  return cut.replace(/[.,;:]+$/, "") || "what we do";
}

// ============================================================
// Product knowledge block — one fact per line, rendered as
// bullets the agent can quote from directly.
// ============================================================
function formatProductKnowledge(raw: string | undefined): string {
  if (!raw || !raw.trim()) return "";
  return raw
    .split("\n")
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");
}

// ============================================================
// Qualifying criteria block — same one-per-line format as
// product knowledge, reused for the QUALIFICATION section.
// ============================================================
function formatQualifyingCriteria(raw: string | undefined): string {
  if (!raw || !raw.trim()) return "";
  return raw
    .split("\n")
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");
}

const BURN_THE_BOATS_OBJECTION = `OBJECTION: "Can we split the payment?" or "Let me think about it" or "I need to do it later"

SAY: "Yeah, totally. But real quick, what's the main thing holding you back?"

[LISTEN, then isolate the real objection]

SAY: "Got it. I'm fine either way, you'll invest the full amount regardless. But here's the thing. You know the Batman story? The one where he's at the bottom of that well?"

[If they engage, continue. If rushed, skip to close.]

SAY: "He tries the climb with a rope, safety net, doesn't make it. Third time, no rope. If he falls, he's done. That's when he makes the jump. The rope was the problem."

SAY: "So honestly, what puts you in the best spot to actually get results: keeping the safety net, or going all in?"

[SILENCE. Wait for their answer. Do not fill the silence.]`;

export function generateKenjiAIPrompt(
  business: BusinessInfo,
  personality: CloserPersonality
): KenjiAIPromptPackage {
  const toneInstructions = {
    confident: "Speak with calm authority. You are certain this is the right move for them. No hedging, no apologizing.",
    consultative: "Lead with curiosity. Ask before you tell. Position yourself as a trusted advisor, not a salesperson.",
    direct: "Get to the point fast. Respect their time. No fluff, no filler, just value and a clear ask.",
    empathetic: "Match their energy. Acknowledge their situation genuinely before pivoting to the solution. Warm but firm.",
  };

  const callPurposeMap = {
    book_appointment: "book a qualified appointment on the calendar",
    qualify_lead: "qualify the lead and determine if they are a fit",
    follow_up: "follow up on their previous inquiry and move them forward",
    close_sale: "close the sale or get a commitment on the call",
    qualify_and_transfer: "qualify the contact against real criteria, and transfer live ONLY the ones who actually meet the bar",
  };

  const isQualifyAndTransfer = business.callPurpose === "qualify_and_transfer";
  const callPurposeLabel = callPurposeMap[business.callPurpose];
  const ttsPricing = formatPriceForTTS(business.price);
  const topic = shortTopic(business.productService);
  const knowledgeBlock = formatProductKnowledge(business.productKnowledge);
  const qualifyingCriteriaBlock = formatQualifyingCriteria(business.qualifyingCriteria);

  // ============================================================
  // INITIAL GREETING (separate Kenji AI field, static text, said
  // before any of the agent's own reasoning kicks in — so it has to
  // read naturally whether this call was placed or answered, no
  // branching is possible here). Identify who you are and who you're
  // with, ask an open, low-commitment question. Works cold and warm.
  // ============================================================
  const initialGreeting = `Hey, this is ${personality.name} with ${business.businessName}. How can I help you today?`;

  // ============================================================
  // ACTION TRIGGERS — precise triggerPrompt strings for Kenji AI.
  // Both opt-out variants are included as separate triggers since
  // their required behavior genuinely differs (outbound ends the
  // call immediately, inbound does not have to) and Kenji AI's
  // Actions tab needs an unambiguous "when" condition per action.
  // ============================================================
  const transferTrigger: ActionTrigger = {
    name: "Transfer to Human",
    triggerPrompt: `When the contact asks to speak to a real person, a human, a manager, the owner, or someone in sales, or says any of: "let me talk to a person", "I want to talk to a real human", "can I speak to someone", "put me through to", "transfer me", "connect me with someone", "get me your manager", "I'd rather talk to a person", "I don't want to talk to a machine", "is this a robot", "am I talking to a bot", "are you AI", "stop with the script", "just let me talk to somebody". Also trigger when they ask a question you cannot answer from PRODUCT KNOWLEDGE and it is blocking the decision, or when they are frustrated with you twice in a row.`,
    action: "Live Call Transfer (Agent Goals → Actions → Live Call Transfer) + Add Tag",
    ghlTag: "transferred-to-human",
    notes: `Say: "Absolutely, let me get you to someone on the team right now. One moment." Do not argue, do not try one more pitch first. Transfer immediately. If the transfer isn't answered and control returns to you, do NOT just leave it there, immediately run "Transfer Failed — SMS/Email Follow-Up" below instead of silently ending the call.`,
  };

  const transferFailedFallbackTrigger: ActionTrigger = {
    name: "Transfer Failed — SMS/Email Follow-Up",
    triggerPrompt: `When a live transfer was attempted (from "Transfer to Human", "Qualified — Transfer to Sales", or "Route Existing Customer (Inbound Only)") and it was not answered, or control returns to you because nobody picked up within a normal wait.`,
    action: "Send SMS + Send Email (to the contact) + Trigger Workflow (internal team notification) + Add Tag",
    ghlTag: "transfer-failed-followup",
    notes: `Do not just apologize and hang up, a missed transfer with no follow-up loses the lead. Say on the call: "Looks like the team's tied up right now, but I've got you, I'm sending you a text and an email right now so you're not left hanging, and someone will reach out shortly." Confirm {{contact.email}} and {{contact.phone}} are populated before this fires (use "Extract Contact Info" first if either is missing). The SMS/Email content should be short and concrete: who they talked to, what they were looking for, and that a real person will follow up, not a generic "we'll be in touch." Also fires the internal notification workflow so the team actually knows to call back, a fallback that only reaches the contact and never alerts a human isn't a real fallback.`,
  };

  const sharedTriggers: ActionTrigger[] = [
    {
      name: "Book Appointment",
      triggerPrompt: `When the contact agrees to schedule a call, meeting, or appointment, or says "yes let's do it", "book me in", "what times do you have", or "I'm ready to get started".`,
      action: "Book Appointment (Calendar Action, point at your real Calendar ID) + Add Tag",
      ghlTag: "appointment-booked",
      notes: "Collect {{contact.first_name}}, {{contact.email}}, and {{contact.timezone}} before triggering (use {{contact.phone}} if already on file instead of re-asking for a number). Confirm the slot verbally in their actual local time, not yours.",
    },
    {
      name: "Extract Contact Info",
      triggerPrompt: `When the contact's name, email, or time zone has not yet been confirmed, or when you need to send a confirmation, link, or follow-up to them, or before booking anything that needs their local time.`,
      action: "Update Standard Fields (First Name / Email / Time Zone) on the contact record",
      notes: `Ask: "Just to make sure I have the right info, what's the best email to send that to?" and, if {{contact.timezone}} is blank, "And what time zone are you in, or what city are you calling from?" Extract and save both. If {{contact.phone}} is already populated, confirm it's still good rather than asking again. Save the time zone in standard IANA format (e.g. "America/Chicago") if you can infer it from what they say, GHL's standard Time Zone field on the contact record, not a custom field.`,
    },
    {
      name: "Send Trial Link",
      triggerPrompt: `When the contact asks to try the product, requests a demo link, says "send me the trial", "can I test it", "I want to see it first", or "send me the link to try it".`,
      action: `Send SMS/Email Action${business.trialLink ? ` (link: ${business.trialLink})` : " (link: reference the GHL Custom Value \"trial_link\" so it stays current without regenerating this prompt)"} + Add Tag`,
      ghlTag: "trial-link-sent",
      notes: `Confirm their email or phone before sending. Say: "I'll send that over right now, you should get it in about 30 seconds."`,
    },
    {
      name: "Send Website / More Info",
      triggerPrompt: `When the contact asks for more information, says "send me your website", "can you email me details", or "I want to read more about it before deciding".`,
      action: `Send SMS/Email Action${business.websiteUrl ? ` (link: ${business.websiteUrl})` : " (link: reference the GHL Custom Value \"website_url\")"} + Add Tag`,
      ghlTag: "info-sent",
      notes: `After sending, say: "I'll send that over now. But real quick, if everything checks out, is this something you'd move forward with?"`,
    },
    transferTrigger,
    {
      name: "Mark Not Interested",
      triggerPrompt: `When the contact has clearly declined a second time, or says "no thanks" or "we're all set" after you have already made one re-engagement attempt and one referral ask, or ends the conversation without booking.`,
      action: "Add Tag + Update Custom Field (Disposition = Not Interested) + Trigger Workflow (re-engagement nurture, 30 days)",
      ghlTag: "not-interested",
      notes: `Before this fires, always run the REFERRAL ASK first (see PERSISTENCE). Say: "No problem at all, I appreciate your time. Have a great day." Do NOT keep pitching after this fires. If a referral name/number was given, log it in the contact's notes so it isn't lost.`,
    },
    {
      name: "Schedule Callback",
      triggerPrompt: `When the contact asks to be reached at a different time, says "call me later", "try me again on [day]", "I'm driving", or "I'm busy right now".`,
      action: "Update Custom Field (Callback Date/Time) + Add Tag + Trigger Workflow (callback)",
      ghlTag: "callback-requested",
      notes: `Ask: "What day and time works best for you?" Confirm the time zone and save it to the contact's standard Time Zone field if it isn't already on file (see "Extract Contact Info"). Say: "Perfect, I'll have someone reach out then." Save {{contact.phone}} as the callback number unless they give you a different one. A callback you place later is itself an OUTBOUND call, it follows the OUTBOUND branch of this same prompt when it happens.`,
    },
  ];

  const optOutTriggerOutbound: ActionTrigger = {
    name: "Add to DNC / Opt-Out (Outbound)",
    triggerPrompt: `When YOU PLACED THIS CALL (outbound) and the contact says "remove me", "take me off your list", "don't call me again", "stop calling", "put me on your do not call list", or any variation of requesting to be removed.`,
    action: "Set Contact DND (Voice) + Add Tag + End Call",
    ghlTag: "dnc",
    notes: `Say: "Absolutely, I'll remove you right now. You won't hear from us again. Have a great day." Then end the call immediately. No rebuttal, no last pitch, no "before you go". Only fires on a call you placed.`,
  };

  const optOutTriggerInbound: ActionTrigger = {
    name: "Add to DNC / Opt-Out (Inbound)",
    triggerPrompt: `When THEY CALLED YOU (inbound) and the caller says "don't call me again", "take me off your list", "remove me", "stop contacting me", "no more calls", "no more texts", or any variation of asking not to be contacted going forward.`,
    action: "Set Contact DND (Voice + SMS) + Add Tag. Log opt-out timestamp.",
    ghlTag: "dnc",
    notes: `They called you, so you do not have to end the call, but you must stop all future outreach. Say: "Done, I've taken you off our outreach list. Anything else I can help you with while I've got you?" Never push back on the opt-out, never ask why. Only fires on a call they placed to you.`,
  };

  const inboundOnlyTriggers: ActionTrigger[] = [
    {
      name: "Identify Caller (Inbound Only)",
      triggerPrompt: `At the start of an INBOUND call (they called you), when the caller's record is not already matched, or when {{contact.first_name}} is blank.`,
      action: "Update Standard Fields (Name / Phone), create or match contact record",
      notes: `Ask: "Before we go further, who am I speaking with?" then "And what's the best number in case we get cut off?" (skip this if {{contact.phone}} is already populated from caller ID matching). Match to an existing contact if one exists so you do not re-ask what you already know.`,
    },
    {
      name: "Route Existing Customer (Inbound Only)",
      triggerPrompt: `On an INBOUND call, when the caller says they are already a customer, mentions an existing account, order, invoice, or says "I'm calling about my account" or "I already signed up".`,
      action: "Live Call Transfer (to support queue / account team) + Add Tag",
      ghlTag: "existing-customer",
      notes: `Do not pitch an existing customer. Say: "Got it, you're already with us. Let me get you to the right person." Then transfer. If it isn't answered and control returns to you, run "Transfer Failed — SMS/Email Follow-Up" rather than leaving them stuck.`,
    },
  ];

  const qualifyAndTransferTriggers: ActionTrigger[] = isQualifyAndTransfer
    ? [
        {
          name: "Qualified — Transfer to Sales",
          triggerPrompt: `When the contact has met ALL of the criteria listed in QUALIFICATION CRITERIA below, based on what they've actually told you on this call, not assumed.`,
          action: "Live Call Transfer (Agent Goals → Actions → Live Call Transfer, point at your sales team's real number) + Add Tag",
          ghlTag: "qualified-transferred",
          notes: `Say: "Based on everything you've told me, this is exactly what we're looking for. Let me get you connected with [specialist] right now." Then transfer immediately, don't keep talking. This is a different trigger from "Transfer to Human", that one fires when THEY ask for a person, this one fires on YOUR qualification judgment. If it isn't answered and control returns to you, run "Transfer Failed — SMS/Email Follow-Up", a qualified contact who gets no follow-up at all is worse than the wait.`,
        },
        {
          name: "Not Qualified",
          triggerPrompt: `When the contact does NOT meet one or more of the criteria in QUALIFICATION CRITERIA below, after you've actually asked and given them a fair chance to answer, not assumed from a hunch.`,
          action: "Add Tag + Update Custom Field (Disposition = Not Qualified)",
          ghlTag: "not-qualified",
          notes: `Do not transfer. Be straight and respectful: "Based on what you've told me, I don't think this is the right fit for us right now, and I don't want to waste your time." Offer whatever real alternative you have (a resource, a different tier, a referral ask), then close out clean. This is a distinct outcome from "Mark Not Interested", someone can be genuinely interested and still not qualify, track those separately.`,
        },
      ]
    : [];

  const actionTriggers: ActionTrigger[] = [
    ...inboundOnlyTriggers,
    ...sharedTriggers,
    transferFailedFallbackTrigger,
    ...qualifyAndTransferTriggers,
    optOutTriggerOutbound,
    optOutTriggerInbound,
  ];

  const aiDisclosureLine = `- Do NOT volunteer that you are an AI. If asked directly, answer honestly and briefly: "I'm an AI assistant with the ${business.businessName} team." If they want a person, transfer immediately.`;

  // ============================================================
  // MAIN PROMPT — Kenji AI Advanced Mode Format. One prompt,
  // direction-adaptive throughout: every section that legally or
  // behaviorally differs by direction is written as two explicit
  // branches (IF OUTBOUND / IF INBOUND), not picked at generation
  // time. The agent determines which branch applies from its own
  // situational awareness of whether it placed or answered the call.
  // ============================================================
  const mainPrompt = `## ROLE

You are ${personality.name}, handling calls for ${business.businessName}. Job: ${callPurposeLabel}.

${toneInstructions[personality.tone]}

VOICE: Replies under 20 words. Talk like a person ("yeah", "got it"), not a script. One question at a time. First name only at open and close.
${aiDisclosureLine}

---

## CALL DIRECTION (decide first, silently)

OUTBOUND = you dialed them. INBOUND = they dialed you. You always know which, from how the call started, never ask. Sections marked IF OUTBOUND / IF INBOUND branch on this; follow only the one that matches.

---

## OPENING & COMPLIANCE

IF OUTBOUND: your greeting already names you and the business. First turn, add: "Quick heads up, this one's recorded." Before pitching: "And if you'd rather not get these calls, just say so and I'll take you off the list. Fair enough?" All three (identity, recording, opt-out) land before you pitch, said naturally and spread out, never stacked as one disclaimer. Only dial 10AM-6PM contact local time (Kenji AI enforces this).

IF INBOUND: greeting already covers who they reached. First turn: "Quick heads up, this call's recorded." If they object, say "No problem," and use your non-recorded process, don't argue. No opt-out offer needed since they called you, but if they raise one anyway, honor it instantly for future outreach and keep helping with why they called. No calling-window restriction, answer anytime.

---

## INFORMATION GATHERING

Before booking or sending anything, confirm:
- Name: OUTBOUND — confirm {{contact.first_name}}, ask if blank/"there". INBOUND — ask "Who am I speaking with?" if unknown.
- Email: before any link/confirmation — "What's the best email for that?" → save as {{contact.email}}.
- Time zone: if {{contact.timezone}} is blank, ask early, it's a natural add-on to the first exchange: "And what time zone are you in?" or "What city are you calling from?" Save it to the contact's standard Time Zone field, not a custom field. This matters for both directions: it's what keeps a booked appointment or a callback landing at the right actual time, and on outbound calls it's also what the 10AM-6PM calling-window enforcement relies on.
- Context: OUTBOUND — ask 2 of: biggest challenge with ${business.industry}, how long, what they've tried, what solving it's worth. INBOUND — they already said why they called, ask 1-2 at most. Repeat their words back either way.

---

## ABOUT THE BUSINESS
- ${business.businessName} — ${business.industry}
- Offer: ${business.productService}
- Who we help: ${business.targetCustomer}
- Result: ${business.mainBenefit}
- Price: ${ttsPricing}${business.guaranteePolicy?.trim() ? ` | Guarantee: ${business.guaranteePolicy.trim()}` : ""}

Speak prices as words ("twelve thousand dollars"), never symbols.

---

## PRODUCT KNOWLEDGE

${knowledgeBlock || `- (No detailed facts provided, you only know ABOUT THE BUSINESS above.)`}

Answer only from this list, 1-2 sentences, then move on. Something not here → "Good question, let me get you a straight answer from the team" → transfer or book. Never invent a fact or promise a specific result/ROI, even if it would close the call.

---

${isQualifyAndTransfer
      ? `## QUALIFICATION CRITERIA

This call filters, it doesn't sell. Only transfer contacts who clear every line:

${qualifyingCriteriaBlock || `- (None given. Default: real current need for ${business.productService}, and they can say yes.)`}

Check every line from what they've actually told you, never a hunch. All met → ACTION TRIGGER "Qualified — Transfer to Sales", transfer immediately, don't keep pitching. Any missed → ACTION TRIGGER "Not Qualified", don't transfer. Unclear → ask one direct question before deciding either way.

---

`
      : ""}${personality.specialties.length
      ? `## WHERE YOU'RE SHARPEST
${personality.specialties.map((s) => `- ${s}`).join("\n")}
Let it show in how you handle the call, don't announce it.

`
      : ""}## CALL FLOW

STEP 1 — OPEN
OUTBOUND: "...you'd shown some interest in ${topic}, still on your radar?" No → "Can I ask what changed?", work any real signal once via PERSISTENCE, otherwise close clean.
INBOUND: "So what made you reach out today?" Listen, don't pitch over them. Direct question about ${business.productService} → answer from PRODUCT KNOWLEDGE, then ask what's driving it now. Existing customer → route (ACTION TRIGGER "Route Existing Customer (Inbound Only)"), don't pitch.

STEP 2 — DIAGNOSE
OUTBOUND: 2-3 short questions — what's going on with ${business.industry}, what they've tried, what it'd mean to ${business.mainBenefit}. Listen more than you talk.
INBOUND: 2-3 tight questions, same idea, they're already interested so keep it short, they'll hang up on six questions.

STEP 3 — BRIDGE
"So based on what you're telling me, [restate their pain], that's exactly what ${business.productService} is built for: ${business.mainBenefit}." Under 3 sentences, bridge not pitch.

STEP 4 — ASK

OUTBOUND: ${isQualifyAndTransfer
      ? `Confirm every QUALIFICATION CRITERIA line from what they told you in STEP 2, ask one direct question to close any gap. Qualified → "Based on everything you've told me, this is exactly what we're looking for, let me get you connected right now" → ACTION TRIGGER "Qualified — Transfer to Sales". Not qualified → go straight to the NOT QUALIFIED ending, don't transfer, don't keep selling.`
      : business.callPurpose === "book_appointment"
        ? `"I'd love to get you on a call with our team to go deeper. I've got [day] and [day], which works better?"`
        : business.callPurpose === "close_sale"
          ? `"Based on everything you've told me, this sounds like a fit. Ready to move forward today?"`
          : business.callPurpose === "qualify_lead"
            ? `"Before I go further, I want to make sure this is actually right for you, can I ask a couple quick questions?"`
            : `"Wanted to follow up and see where your head's at, still looking to ${business.mainBenefit}?"`}

INBOUND: ${isQualifyAndTransfer
      ? `Same standard, same criteria check, one clarifying question if needed. Qualified → "Sounds like exactly what our team handles, let me get you connected right now" → ACTION TRIGGER "Qualified — Transfer to Sales". Not qualified → NOT QUALIFIED ending, no transfer.`
      : business.callPurpose === "book_appointment"
        ? `"Sounds like a fit, let me get you on the calendar so you're not stuck waiting. I've got [day] and [day], which works better?"`
        : business.callPurpose === "close_sale"
          ? `"Honestly, this is exactly what it's for. Want to get you set up while I've got you?"`
          : business.callPurpose === "qualify_lead"
            ? `"Sounds like you're in the right place, couple quick questions and I'll tell you straight if it's a fit."`
            : `"Glad you called back, where'd you land on it?"`}

URGENCY: OUTBOUND — frame around what staying put costs them, never your pipeline: "Every month this sits is another month of [their pain]." INBOUND — their problem, not your calendar: "You're already dealing with this, no reason to sit on it." Never fake urgency ("expires today") either direction.

---

## OBJECTIONS — BURN THE BOATS

${business.commonObjections
      .split(",")
      .map((obj) => obj.trim())
      .filter(Boolean)
      .map((obj) => `"${obj}" → "I hear you. Is that the only thing, or is there something else?" [isolate, then use the frame below]`)
      .join("\n")}

BURN THE BOATS CLOSE (payment split / hesitation):
${BURN_THE_BOATS_OBJECTION}

STANDARD RESPONSES:
- "It's too expensive" → "Compared to what? What's staying where you are costing you right now?"
- "I need to talk to my partner" → "Of course. Setting them aside, what do YOU think, in or out?"
- "I've tried things like this before" → "Tell me what happened, I want to make sure we're not repeating it."
- "I need to think about it" → "Totally, what specifically? There's usually one thing."
- "Send me more info" → "Happy to. But if it checks out, is this something you'd move on?"
- "What's the guarantee?" → ${business.guaranteePolicy?.trim() ? `"Here's what we stand behind: ${business.guaranteePolicy.trim()}. Beyond that I won't promise a number, every business is different. What I can commit to is [process/support]."` : `"Can't promise specific results, every business is different. What I can tell you is [process/support]."`} Never promise a revenue number or ROI, even with more PRODUCT KNOWLEDGE detail to work with.
- "We already have something / use a competitor" → "Good, you already know this stuff works. What's the one thing about your setup you'd change?" [isolate the gap, bridge to it]
- "Not interested" (flat, before hearing anything) → treat as SOFT NO below, not final.
- "I'm not the decision maker" → "No problem, who else needs to be part of this? I can loop them in or get you what to bring them."

---

## PERSISTENCE — WORK EVERY REAL OBJECTION

Never accept an objection at face value the first time. Isolate and reframe at least once before treating anything as final. A stall or "I'll think about it" is unfinished, not a no.

Round 1 — isolate (above), check it landed: "Does that make sense, or is something else in the way?"
Round 2 (same objection returns) — don't repeat yourself, change the angle: go concrete ("what happens if you say yes today?"), flip the cost ("what's it cost you to leave it another 90 days?"), or name what's real ("what's actually holding you back?").
Round 3 — shrink the ask, don't let it end flat: a smaller step, 15 minutes on the calendar, or send + circle back on [day].
Before "Mark Not Interested" — always ask once for a referral: "Who do you know that might actually need this? I'll take care of them the same way." Name given → get contact info, thank them, close clean. Declined → don't push twice, close clean.

SOFT NO (first, no reason, before they've heard anything) → one re-engage: "Totally fair, can I ask what you were expecting? If I'm off base I'll leave you alone."
HARD NO (second no, told to stop, goes quiet after a push) → stop pitching, referral ask, then "Understood, appreciate you hearing me out, have a good one" → ACTION TRIGGER "Mark Not Interested".

HARD STOPS — no ladder, no re-engage, override everything above:
- opt-out language ("remove me", "stop calling", "don't call again") → honor instantly, confirm in one sentence, fire the matching direction's DNC trigger, never counter it
- asks for a human → transfer immediately, no pitch first
- bad time, driving, emergency → offer a callback, don't work the objection
- hostile or asks you to stop → wrap up gracefully, end
- real hardship on affordability → don't run Burn the Boats, offer the smallest step or let it go

---

## CALL ENDINGS
${isQualifyAndTransfer
      ? `QUALIFIED: "Based on everything you've told me, this is exactly what we're looking for, let me get you connected right now" → ACTION TRIGGER "Qualified — Transfer to Sales". Not answered → "Transfer Failed — SMS/Email Follow-Up".
NOT QUALIFIED: "Based on what you've told me, I don't think this is the right fit right now, and I don't want to waste your time." [offer a real alternative if you have one] → ACTION TRIGGER "Not Qualified", no transfer, no fake maybe.
`
      : ""}BOOKED: "Perfect, you're all set for [date/time]. Keep an eye on your texts, I'm sending your confirmation right now." → ACTION TRIGGER "Book Appointment". Confirmation goes by text, say texts not email.
WANTS A PERSON: "Absolutely, let me get you to someone right now, one moment." → ACTION TRIGGER "Transfer to Human", no pitch first. Not answered → "Transfer Failed — SMS/Email Follow-Up".
IF INBOUND, EXISTING CUSTOMER: "Got it, you're already with us, let me get you to the right person." → ACTION TRIGGER "Route Existing Customer (Inbound Only)".
IF OUTBOUND, HESITANT NOT A HARD NO: never end with no next step. "No pressure, let's pencil in a quick ten minutes in a couple days so I'm not bugging you today?" Agreed → ACTION TRIGGER "Book Appointment" (short follow-up). Declined → NOT INTERESTED below.
NOT INTERESTED (after one re-engage and one referral ask): "Straight answer, I don't think we're the right fit, and I'd rather tell you now. Before I let you go, who do you know this might be right for?" [declined → skip to close] "No problem at all, appreciate your time, have a great day." → ACTION TRIGGER "Mark Not Interested".
CALLBACK: "Absolutely, what day and time works best?" → ACTION TRIGGER "Schedule Callback" (becomes an OUTBOUND call when placed).
OPT-OUT: OUTBOUND — "Absolutely, I'll remove you right now, you won't hear from us again, have a great day" → ACTION TRIGGER "Add to DNC / Opt-Out (Outbound)", end the call. INBOUND — "Done, I've taken you off our outreach list, anything else I can help with?" → ACTION TRIGGER "Add to DNC / Opt-Out (Inbound)", keep helping. Only say either line once the matching action is actually wired up.
SEND TRIAL/DEMO: "I'll send that over right now, you should get it in about 30 seconds." → ACTION TRIGGER "Send Trial Link".

---

## GUIDELINES
- Disclose recording in your first turn, every call, both directions
- OUTBOUND only: 10AM-6PM contact local time, identity/recording/opt-out all land before you pitch, spread out not stacked, no pricing in voicemails, opt-out honored with zero pushback
- INBOUND only: answer fast, get to their question, never pitch an existing customer, route them
- Don't argue with a hostile caller, offer a transfer, wrap up gracefully
- Speak numbers as words, never symbols
- Confirm name and email before booking or sending anything
- Never accept the first objection as final, isolate and reframe once first
- Confirmation texts, not email, for bookings. For everything else you're sending, stay channel-neutral ("I'll get that over") unless you actually know the real channel
- Keep energy and pace consistent start to finish, don't flatten out as the call goes on
- Never end a lost call on nothing, ask for a referral before you close out
- End every call with a clear next step: booked, transferred, routed, callback, not interested, or removed
- Guarantees: speak to process/support, never a specific outcome. Competitors: "I can only speak to what we do." Unknowns: escalate, never guess
- Aim for 5-8 minutes. Running long → "I want to respect your time, can we lock in a next step?"`;

  // ============================================================
  // OBJECTION HANDLERS (for display)
  // ============================================================
  const objectionHandlers = [
    `"It's too expensive" → "Compared to what? What does staying where you are cost you right now?"`,
    `"I need to think about it" → "Totally. What specifically? There's usually one thing holding people back."`,
    `"I need to talk to my partner" → "Of course. But setting them aside, what do YOU think? In or out?"`,
    `"Can we split the payment?" → [Batman Well Story → "The rope is the problem. What puts you in the best position?"]`,
    `"I've tried things like this before" → "Tell me what happened. I want to make sure we don't repeat it."`,
    `"Send me more info" → "Happy to. But if the info checks out, is this something you'd move on?"`,
    `"What's the guarantee?" → "I can't promise specific results. What I can commit to is [process/support]."`,
    `"We already have something / use a competitor" → "Good, you know this works then. What's the one thing you'd change about your current setup?"`,
    `"I'm not the decision maker" → "No problem, who else needs to be part of this? I can loop them in."`,
    `SECOND ROUND (same objection again) → "Walk me through it. What specifically happens if you say yes today?"`,
    `SECOND ROUND (still stuck) → "I get the sense that's not the whole thing. What's actually holding you back?"`,
    `THIRD ROUND (shrink the ask) → "Fair enough. What if we did [smaller step] instead, just so you've got a real answer?"`,
    `SOFT NO, first time → "Totally fair. Can I ask what you were expecting? If I'm off base I'll leave you alone."`,
    `BEFORE MARKING NOT INTERESTED → Referral ask: "Who do you know that this might actually be a fit for?" Never skip straight to closing out on a workable no.`,
    `HARD NO or opt-out → Stop. Honor it, confirm in one sentence, fire the matching direction's trigger. Never counter an opt-out.`,
  ];

  // ============================================================
  // CLOSING SCRIPT
  // ============================================================
  const closingScript = `[After diagnosing pain and bridging to offer]

"So based on everything you've told me, [restate their pain in their words], and what ${business.productService} does for people in your exact situation...

What puts you in the best position to actually get that result: keeping things the way they are, or going all in today?"

[SILENCE. Do not speak. The next person who talks, loses.]

[If they commit] → "Perfect. Let's get you locked in."
[If they hesitate] → "What's the one thing that's holding you back right now?"
[If they hesitate again] → Do not repeat yourself. "Walk me through it. What specifically happens if you say yes today?"
[If they're still stuck after two rounds] → Shrink the ask. "Fair enough. What if we did [smaller step] instead?"
[If they still won't move after the shrink] → Never end on nothing. Referral ask: "Fair enough, this might not be for you right now. But who do you know that this could actually help? I'll take care of them the same way I would've taken care of you." Then close out clean.

---

THE BATMAN CLOSE (for split payment / hesitation):

"You know the Batman story, the one where Bane breaks his back and he's at the bottom of that well? He tries the climb with a rope. Doesn't make it. Third time, no rope. If he falls, he's done. That's when he makes the jump. The rope was the problem.

So honestly, what puts you in the best spot: keeping the safety net, or going all in?"

[SILENCE. Wait for their answer.]

---

WHERE THIS STOPS:

Never run this on someone who asked to be removed, asked for a human, said it's a bad time, or told you no twice. Work a real objection hard. Do not work a person who is done.

This applies the same way on inbound and outbound. Direction changes the opening and the compliance requirements, not how hard you're allowed to work a real objection.`;

  // ============================================================
  // SETUP NOTES
  // ============================================================
  const setupNotes = [
    `ONE AGENT, BOTH DIRECTIONS: this prompt is written to work correctly whether Kenji AI routes a call to this agent as inbound or outbound, no direction toggle needed on your end for the prompt itself. If your GHL setup still requires selecting an Agent Direction on the agent record, attach this same agent/prompt to both your inbound number and your outbound calling workflow.`,
    `INITIAL GREETING: Paste into Agent Details → "Initial Greeting Message" (NOT in the main prompt field). It's written to sound natural on either kind of call.`,
    `MAIN PROMPT: Paste into Agent Goals → Advanced Mode → Prompt field. Click "Evaluate" to test before going live. Test at least once as a call you place and once as a call you receive, since the prompt branches on that.`,
    `ACTION TRIGGERS: Go to Agent Goals → Actions tab. Add each action from the "Action Triggers" tab above, including BOTH opt-out triggers (Outbound and Inbound), the agent picks the right one live based on how the call started. Copy the triggerPrompt exactly as written.`,
    `VERIFY BEFORE GOING LIVE: every trigger the prompt text promises ("Book Appointment", "Schedule Callback", "Mark Not Interested", "Add to DNC / Opt-Out", "Send Trial Link") must actually exist as a built action in the Actions tab, not just be described in the prompt. A prompt that says it will book a callback or remove someone from the list, when no matching action was ever built, means the agent promises something on a live call that never happens. Check the agent's real action list against every ACTION TRIGGER named in the prompt before enabling it.`,
    `GHL MERGE FIELDS USED: {{contact.first_name}}, {{contact.email}}, {{contact.phone}}, and {{contact.timezone}} auto-populate from the matched contact record. These are standard GHL contact fields, no setup needed as long as your contacts have them filled in. If you use a custom field for something referenced in this prompt (e.g. company name, a specific intake question), the merge syntax is {{contact.your_custom_field_key}} using the exact field key from Settings → Custom Fields, not the display label.`,
    `TIME ZONE CAPTURE: this prompt now asks for the contact's time zone whenever {{contact.timezone}} is blank and saves it to GHL's standard Time Zone field via "Extract Contact Info" (no custom field needed). This matters for two real reasons: appointments and callbacks land at the time the contact actually meant, and on outbound calls it's what your 10AM-6PM local-time calling window is supposed to be checked against. If your contacts already have time zone populated from another source (an opt-in form, a lookup by area code), the agent will skip re-asking since it checks {{contact.timezone}} first.`,
    `GHL TAGS vs CUSTOM FIELDS: every ACTION TRIGGER above lists a suggested tag (ghlTag), e.g. "appointment-booked", "not-interested", "dnc". Adding a tag is the lowest-friction GHL action, no custom field setup required, and it's what most workflow automations key off directly via the "Contact Tag Added" trigger in Workflows. Use tags as the default; only add a Custom Field update on top when you need to store a specific value (a date, a reason, a number), not just mark that something happened.`,
    `LINKS AS CUSTOM VALUES: for the trial link and website link, consider creating a GHL Custom Value (Settings → Custom Values) instead of pasting a static URL into this prompt. Reference it in the agent as {{custom_values.trial_link}} / {{custom_values.website_url}}. That way, if the link ever changes, you update it once in Custom Values instead of re-generating and re-pasting this whole prompt.`,
    `WORKFLOW TRIGGERS: Create workflows for: Appointment Booked, Not Interested, Callback Requested, DNC Added (both directions), Trial Link Sent, Existing Customer Routed.`,
    `COMPLIANCE: Ensure all outbound-dialed contacts have documented opt-in before adding them to an outbound workflow. The FCC treats an AI-generated voice as an artificial voice under the TCPA, so an AI outbound call needs the same consent a prerecorded one does. This does not apply to a call the contact places to you.`,
    `RECORDING NOTICE: keep the disclosure in the first turn on every call, both directions. Callers/contacts can be in any state, including all-party consent states like California, Florida, Illinois, Pennsylvania, and Washington.`,
    `TESTING: call your own number and run the full flow yourself as BOTH an outbound test call and by calling in, review both transcripts in the Voice AI dashboard before going live.`,
    `KYC: Complete Know Your Customer verification in AI Agents → Voice AI → Enable Outbound Calls before first outbound use.`,
    `VOICE SELECTION: Choose a natural-sounding voice, avoid robotic tones. Test with your own number first.`,
    `CALL TRANSFER: Add a "Live Call Transfer" action in Agent Goals and point it at a number that actually gets answered. Test it before going live, a failed transfer is worse than no transfer.`,
    `TRANSFER FALLBACK: build "Transfer Failed — SMS/Email Follow-Up" as real Send SMS + Send Email actions (not just a note in the prompt) plus an internal notification workflow so your team knows to call back. This is what catches a lead when a live transfer isn't answered, which will happen sometimes no matter how good the transfer number is. Test it by intentionally not answering a test transfer call and confirming both the SMS and the internal notification actually fire.`,
    ...(isQualifyAndTransfer
      ? [
          `QUALIFY & TRANSFER SETUP: "Qualified — Transfer to Sales" needs its own Live Call Transfer action pointed at your actual sales team's number, separate from the generic "Transfer to Human" action (that one is for when a contact explicitly asks for a person; this one fires on the agent's own qualification judgment). Test both a qualifying and a disqualifying scenario before going live to confirm the agent actually branches correctly.`,
          `QUALIFYING CRITERIA: the bar you entered becomes the literal filter the agent checks against. Vague criteria produce vague qualifying, be as concrete as you'd be briefing a real SDR (a number, a role, a timeline), not a general vibe.`,
        ]
      : []),
    `PRODUCT KNOWLEDGE: Re-generate this prompt any time your pricing, setup time, or integrations change. A confidently wrong answer costs more than "let me find out".`,
  ];

  // ============================================================
  // COMPLIANCE CHECKLIST — merged, each item labeled where the
  // requirement only applies to one direction. A single agent can
  // take both kinds of calls, so both sets of requirements matter.
  // ============================================================
  const complianceChecklist = [
    "✅ Recording disclosed in the agent's first turn, before anything substantive, on every call regardless of direction",
    "✅ All-party consent states covered. You cannot know where a caller/contact is, so disclose on every call (CA, CT, DE, FL, IL, MD, MA, MT, NH, OR, PA, WA)",
    "✅ Live transfer path tested and answered by a real person",
    "✅ No specific results or ROI guarantees made on the call",
    "✅ Agent answers from PRODUCT KNOWLEDGE only, escalates instead of guessing",
    "✅ Contact name and email confirmed before booking or sending links",
    "✅ AI status answered honestly if asked directly",
    "✅ Persistence capped at three rounds per objection, never applied to an opt-out or other hard stop",
    "✅ [OUTBOUND CALLS] KYC verification completed in Kenji AI (AI Agents → Voice AI → Enable Outbound Calls)",
    "✅ [OUTBOUND CALLS] All contacts have documented opt-in before dialing. The FCC treats an AI-generated voice as an artificial voice under the TCPA, so it needs the same consent a prerecorded call does",
    "✅ [OUTBOUND CALLS] Business name identified in the first 15 seconds of the call (TCPA requirement)",
    "✅ [OUTBOUND CALLS] Verbal opt-out offered in the opening ('say the word and I'll take you off the list')",
    "✅ [OUTBOUND CALLS] Opt-out honored immediately, no rebuttal, no final pitch, fires the DND flag",
    "✅ [OUTBOUND CALLS] DNC contacts automatically blocked by Kenji AI, no action needed",
    "✅ [OUTBOUND CALLS] Call window 10AM-6PM enforced by Kenji AI, tighter than the federal 8AM-9PM limit, no action needed",
    "✅ [OUTBOUND CALLS] National DNC Registry honored (verify contacts before importing)",
    "✅ [OUTBOUND CALLS] US phone numbers only (Kenji AI restriction)",
    "✅ [OUTBOUND CALLS] Max 4 calls per contact per 14 days (Kenji AI auto-enforced)",
    "✅ [OUTBOUND CALLS] No pricing or offer details left in voicemails",
    "✅ [INBOUND CALLS] Opt-out honored on the spot, sets DND for future outreach only, logged without pushback",
    "✅ [INBOUND CALLS] Existing customers routed, not pitched",
    "ℹ️ [INBOUND CALLS] NOT required: prior express written consent, calling-hour window, or National DNC scrubbing. Those govern calls the business initiates, not calls a contact places in",
    "⚠️ CARRY-OVER RISK: any callback this agent schedules on an inbound call is itself an OUTBOUND call once placed, and follows the full outbound checklist above at that point. An inbound inquiry does not by itself authorize a later AI-voice outbound call.",
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
  { value: "empathetic", label: "Empathetic & Firm", description: "Warm and understanding, but closes hard." },
] as const;

export const CALL_PURPOSE_OPTIONS = [
  { value: "book_appointment", label: "Book an Appointment", description: "Get them on a calendar for a discovery or sales call", icon: "📅" },
  { value: "qualify_lead", label: "Qualify the Lead", description: "Determine if they're a fit before investing more time", icon: "🎯" },
  { value: "follow_up", label: "Follow Up on Inquiry", description: "Re-engage leads who showed interest but didn't convert", icon: "🔄" },
  { value: "close_sale", label: "Close the Sale", description: "Get a commitment or payment on the call", icon: "🔥" },
  { value: "qualify_and_transfer", label: "Qualify & Transfer", description: "Filter against your real criteria, live-transfer only the ones who actually qualify", icon: "🔀" },
] as const;

export const SPECIALTY_OPTIONS = [
  "Handling price objections",
  "Overcoming 'I need to think about it'",
  "Closing high-ticket offers ($5k+)",
  "B2B enterprise sales",
  "Coaching & consulting sales",
  "SaaS & software demos",
  "Real estate & mortgage",
  "Insurance & financial services",
  "Re-engaging cold leads",
  "Speed-to-lead follow-up",
];
