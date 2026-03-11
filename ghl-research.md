# GHL Voice AI Outbound Caller — Research Notes

## GHL Prompt Structure (Advanced Mode)
GHL uses 3 core elements in prompts:
1. **ROLE** — Who the agent is, persona, interaction style, "do not reveal you are AI unless asked"
2. **TASK** — Specific script flow, objectives, what to collect, when to book
3. **GUIDELINES** — Guardrails: word limits, what NOT to say, fallback behaviors

## GHL-Specific Variables Available in Prompts
- `{{contact.name}}` — Contact's full name
- `{{contact.first_name}}` — First name only
- `{{contact.phone}}` — Phone number
- `{{contact.email}}` — Email
- `{{contact.company_name}}` — Company
- `{{ai.business_name}}` — Business name from agent settings
- Custom contact fields also supported

## GHL Voice AI Outbound Compliance Rules (MANDATORY)
1. **KYC Required** — Must complete Know Your Customer verification before enabling outbound
2. **Opt-in Required** — Contact must have documented opt-in to receive AI calls (via GHL forms)
3. **No DND contacts** — System auto-blocks contacts with DND enabled
4. **Call hours: 10 AM – 6 PM** contact's local timezone (stricter than FTC's 8AM-9PM)
5. **Rate: 1 call/minute/location**
6. **Daily limit: 100 calls/location**
7. **Per-contact: 1 call/day, max 4 calls in 14 days**
8. **US numbers only**
9. **Must identify business at start of call** (TCPA requirement)
10. **Must offer opt-out mechanism** — "Press 1 to be removed" or verbal opt-out

## TCPA Requirements for AI Outbound Calls (FCC 2024)
- AI-generated voices = "artificial voices" under TCPA
- Prior Express Written Consent required for marketing calls
- Must identify business at call start
- Must provide opt-out mechanism
- Honor National DNC Registry
- Penalties: $500/violation, $1,500 willful violation

## GHL Prompt Best Practices
- Keep responses SHORT — voice is different from text, 20-word limit per response
- Use natural speech patterns, NOT formal language
- Use colloquial affirmations: "Got it", "Great", "Absolutely" NOT "Certainly, I understand your concern"
- Do NOT reveal AI status unless directly asked
- Use contact name only at start and end (not repeatedly)
- Repetition in prompt = emphasis for the AI
- Include examples of how to handle specific scenarios

## GHL Voice AI Agent Setup Fields
- Agent Name
- Business Name  
- Voice (selectable)
- Agent Direction (Inbound/Outbound)
- Initial Greeting Message (separate from prompt — first thing said)
- Advanced Mode Prompt (the main system prompt)
- Actions: Book Appointment, Call Transfer, Trigger Workflow, Update Contact Fields, Send SMS

## Prompt Sections for GHL Outbound Closer
1. IDENTITY & ROLE
2. CALL PURPOSE (outbound context — why you're calling)
3. COMPLIANCE OPENING (identify business, offer opt-out)
4. CONVERSATION SCRIPT FLOW
5. OBJECTION HANDLING (Burn the Boats)
6. CLOSING SEQUENCE
7. GUIDELINES & GUARDRAILS
8. WHAT TO COLLECT (contact fields to update)
9. CALL ENDINGS (booked / not interested / callback / DNC)
