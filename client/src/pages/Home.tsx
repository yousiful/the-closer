// =============================================================================
// THE CLOSER — Main Page (Kenji AI Native Outbound Caller Edition)
// Design: Premium SaaS / Dark Intelligence
// Generates TCPA-compliant Kenji AI Voice outbound caller prompts with the
// Batman "Burn the Boats" closing methodology.
// =============================================================================

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EmberField from "@/components/EmberField";
import StepIndicator from "@/components/StepIndicator";
import BatmanQuote from "@/components/BatmanQuote";
import { useTypewriter } from "@/hooks/useTypewriter";
import {
  generateKenjiAIPrompt,
  TONE_OPTIONS,
  CALL_PURPOSE_OPTIONS,
  SPECIALTY_OPTIONS,
  type BusinessInfo,
  type CloserPersonality,
  type KenjiAIPromptPackage,
} from "@/lib/generatePrompt";
import {
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Building2,
  Sliders,
  Zap,
  FileText,
  RotateCcw,
  ShieldCheck,
  Phone,
} from "lucide-react";

const WIZARD_STEPS = [
  { id: 1, label: "Business Info", sublabel: "Tell us about your offer" },
  { id: 2, label: "Edit & Refine", sublabel: "Dial in the details" },
  { id: 3, label: "Closer Skills", sublabel: "Customize your agent" },
  { id: 4, label: "Kenji Prompt", sublabel: "Ready to deploy" },
];

const DEFAULT_BUSINESS: BusinessInfo = {
  businessName: "",
  industry: "",
  productService: "",
  targetCustomer: "",
  mainBenefit: "",
  price: "",
  commonObjections: "",
  callPurpose: "book_appointment",
  bookingCalendar: true,
};

const DEFAULT_PERSONALITY: CloserPersonality = {
  name: "Alex",
  tone: "confident",
  specialties: [],
  closingStyle: "batman",
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [business, setBusiness] = useState<BusinessInfo>(DEFAULT_BUSINESS);
  const [personality, setPersonality] = useState<CloserPersonality>(DEFAULT_PERSONALITY);
  const [inputMethod, setInputMethod] = useState<"manual" | "url" | "text">("manual");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<KenjiAIPromptPackage | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [promptStarted, setPromptStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "greeting" | "objections" | "closing" | "compliance">("greeting");

  const { displayed: typewriterText, done: typewriterDone } = useTypewriter(
    generatedPrompt?.mainPrompt ?? "",
    10,
    promptStarted && activeTab === "main"
  );

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, step])));
    setCurrentStep(step + 1);
  };

  const handleStep1Next = () => {
    if (!business.businessName.trim()) {
      toast.error("Please enter your business name.");
      return;
    }
    if (!business.productService.trim()) {
      toast.error("Please describe what you sell.");
      return;
    }
    completeStep(1);
  };

  const handleStep2Next = () => {
    if (!business.targetCustomer.trim()) {
      toast.error("Who is your ideal customer?");
      return;
    }
    if (!business.mainBenefit.trim()) {
      toast.error("What's the main transformation you deliver?");
      return;
    }
    completeStep(2);
  };

  const handleStep3Next = () => {
    if (!personality.name.trim()) {
      toast.error("Give your closer a name.");
      return;
    }
    completeStep(3);
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateKenjiAIPrompt(business, personality);
      setGeneratedPrompt(result);
      setIsGenerating(false);
      setTimeout(() => {
        setPromptStarted(true);
        setActiveTab("greeting");
      }, 300);
    }, 1800);
  };

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2500);
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  }, []);

  const handleReset = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setBusiness(DEFAULT_BUSINESS);
    setPersonality(DEFAULT_PERSONALITY);
    setGeneratedPrompt(null);
    setPromptStarted(false);
    setIsGenerating(false);
    setActiveTab("greeting");
  };

  const handleTextImport = () => {
    if (!textInput.trim()) {
      toast.error("Please paste your business description.");
      return;
    }
    const lines = textInput.split("\n").filter(Boolean);
    setBusiness((prev) => ({
      ...prev,
      businessName: prev.businessName || lines[0] || "",
      productService: prev.productService || lines.slice(1).join(" ").slice(0, 300) || "",
    }));
    setInputMethod("manual");
    toast.success("Text imported! Review and fill in any missing details.");
  };

  const updateBusiness = (field: keyof BusinessInfo, value: string | boolean) => {
    setBusiness((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSpecialty = (s: string) => {
    setPersonality((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter((x) => x !== s)
        : [...prev.specialties, s],
    }));
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "oklch(0.09 0.015 265)" }}>
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-hero-bg-h8WFDLSCw2Ru2GDUKLVrky.webp)` }}
      />
      <EmberField />

      {/* Header */}
      <header className="relative z-10 border-b border-white/8 backdrop-blur-sm bg-black/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-fire-logo-FpAzV6cKZvopBi3MjgPhGs.png"
              alt="The Closer"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                The <span className="text-gold-gradient">Closer</span>
              </h1>
              <p className="text-xs text-white/40 -mt-0.5">Kenji AI Caller Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">
              <Phone size={10} className="text-[#D4A017]" />
              Kenji AI Caller · TCPA Compliant
            </span>
            {completedSteps.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-full px-3 py-1 hover:border-white/20"
              >
                <RotateCcw size={12} />
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest mb-3">
            ✦ Kenji Native AI Outbound Caller ✦
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Build Your Kenji{" "}
            <span className="text-gold-gradient">AI Closer</span>
            <br />
            <span className="text-white/60 text-3xl sm:text-4xl italic">in 4 minutes</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
            Generate a TCPA-compliant, Kenji AI Caller–ready outbound caller prompt powered by the{" "}
            <span className="text-[#D4A017]/80">Burn the Boats</span> closing methodology.
            Drop it straight into Kenji AI Advanced Mode and go.
          </p>
        </div>

        {/* Wizard layout */}
        <div className="flex gap-8 items-start">
          {/* Step rail — desktop */}
          <div className="hidden lg:block w-52 flex-shrink-0 sticky top-8">
            <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} completedSteps={completedSteps} />
          </div>

          {/* Step content */}
          <div className="flex-1 min-w-0">
            {/* Mobile step pills */}
            <div className="flex lg:hidden items-center gap-2 mb-6 overflow-x-auto pb-2">
              {WIZARD_STEPS.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all",
                    currentStep === step.id
                      ? "bg-[#D4A017] text-[#0A0B14]"
                      : completedSteps.includes(step.id)
                      ? "bg-[#D4A017]/20 text-[#D4A017]"
                      : "bg-white/5 text-white/30"
                  )}
                >
                  {completedSteps.includes(step.id) ? <Check size={10} strokeWidth={3} /> : <span>{step.id}</span>}
                  {step.label}
                </div>
              ))}
            </div>

            {/* ================================================================
                STEP 1 — Business Info
                ================================================================ */}
            {currentStep === 1 && (
              <div className="step-enter">
                <StepHeader icon={<Building2 size={20} />} step={1} title="Tell us about your business" subtitle="Drop a URL, paste your pitch, or enter manually" />

                <div className="flex gap-2 mb-6">
                  {(["url", "text", "manual"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setInputMethod(method)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                        inputMethod === method
                          ? "bg-[#D4A017] text-[#0A0B14] border-[#D4A017]"
                          : "bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/70"
                      )}
                    >
                      {method === "url" ? "🔗 Scrape URL" : method === "text" ? "📋 Paste Text" : "✏️ Enter Manually"}
                    </button>
                  ))}
                </div>

                {inputMethod === "url" && (
                  <div className="step-card-inactive rounded-xl p-6 mb-6">
                    <label className="block text-sm text-white/60 mb-2">Your website URL</label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://your-business.com"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4A017]/50 transition-colors"
                      />
                      <button
                        onClick={() => toast.info("URL scraping coming soon — use Enter Manually for now.")}
                        className="px-5 py-3 bg-[#D4A017] text-[#0A0B14] rounded-lg text-sm font-semibold hover:bg-[#F59E0B] transition-colors"
                      >
                        Scrape
                      </button>
                    </div>
                    <button onClick={() => setInputMethod("manual")} className="mt-3 text-xs text-[#D4A017]/60 hover:text-[#D4A017] transition-colors">
                      Or enter manually →
                    </button>
                  </div>
                )}

                {inputMethod === "text" && (
                  <div className="step-card-inactive rounded-xl p-6 mb-6">
                    <label className="block text-sm text-white/60 mb-2">Paste your business description, pitch, or offer</label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste anything — your about page, pitch deck, offer description..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4A017]/50 transition-colors resize-none"
                    />
                    <button onClick={handleTextImport} className="mt-3 px-5 py-2.5 bg-[#D4A017] text-[#0A0B14] rounded-lg text-sm font-semibold hover:bg-[#F59E0B] transition-colors">
                      Import & Continue
                    </button>
                  </div>
                )}

                {inputMethod === "manual" && (
                  <div className="step-card-active rounded-xl p-6 mb-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField label="Business Name *" placeholder="e.g. Kenji CRM" value={business.businessName} onChange={(v) => updateBusiness("businessName", v)} />
                      <FormField label="Industry *" placeholder="e.g. CRM Software, Real Estate, Coaching" value={business.industry} onChange={(v) => updateBusiness("industry", v)} />
                    </div>
                    <FormField
                      label="What You Sell *"
                      placeholder="e.g. AI-powered CRM platform for agencies that automates follow-ups and closes more deals"
                      value={business.productService}
                      onChange={(v) => updateBusiness("productService", v)}
                      multiline
                    />
                    <FormField
                      label="Price / Investment"
                      placeholder="e.g. $497/month, $5,000 one-time, $997 setup + $297/mo"
                      value={business.price}
                      onChange={(v) => updateBusiness("price", v)}
                    />

                    {/* Call Purpose */}
                    <div>
                      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
                        What is the goal of this outbound call? *
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {CALL_PURPOSE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateBusiness("callPurpose", opt.value)}
                            className={cn(
                              "text-left p-4 rounded-lg border transition-all",
                              business.callPurpose === opt.value
                                ? "border-[#D4A017] bg-[#D4A017]/10"
                                : "border-white/10 bg-white/3 hover:border-white/20"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{opt.icon}</span>
                              <p className={cn("text-sm font-semibold", business.callPurpose === opt.value ? "text-[#D4A017]" : "text-white/70")}>
                                {opt.label}
                              </p>
                            </div>
                            <p className="text-xs text-white/35">{opt.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <NextButton onClick={handleStep1Next} label="Next: Refine Details" />
              </div>
            )}

            {/* ================================================================
                STEP 2 — Refine
                ================================================================ */}
            {currentStep === 2 && (
              <div className="step-enter">
                <StepHeader icon={<Sliders size={20} />} step={2} title="Dial in the details" subtitle="The sharper your inputs, the sharper your closer" />

                <div className="step-card-active rounded-xl p-6 mb-6 space-y-5">
                  <FormField
                    label="Ideal Customer *"
                    placeholder="e.g. Agency owners doing $10k-$50k/month who are losing leads due to slow follow-up"
                    value={business.targetCustomer}
                    onChange={(v) => updateBusiness("targetCustomer", v)}
                    multiline
                  />
                  <FormField
                    label="Core Transformation / Main Benefit *"
                    placeholder="e.g. Go from manually chasing leads to having an AI that closes deals while you sleep"
                    value={business.mainBenefit}
                    onChange={(v) => updateBusiness("mainBenefit", v)}
                    multiline
                  />
                  <FormField
                    label="Common Objections (comma-separated)"
                    placeholder="e.g. too expensive, need to think about it, already have a CRM, need to talk to my partner"
                    value={business.commonObjections}
                    onChange={(v) => updateBusiness("commonObjections", v)}
                    multiline
                  />
                </div>

                {/* Compliance notice */}
                <div className="border border-[#D4A017]/20 rounded-xl p-4 bg-[#D4A017]/5 mb-6">
                  <div className="flex gap-3">
                    <ShieldCheck size={18} className="text-[#D4A017] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#D4A017] mb-1">TCPA Compliance Built In</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Your generated prompt will include: business identification at call start, verbal opt-out mechanism, DNC handling, and Kenji AI's 10AM–6PM call window compliance language. All required by FCC/TCPA for AI outbound calls.
                      </p>
                    </div>
                  </div>
                </div>

                <BatmanQuote />

                <div className="flex gap-3 mt-6">
                  <BackButton onClick={() => setCurrentStep(1)} />
                  <NextButton onClick={handleStep2Next} label="Next: Closer Skills" />
                </div>
              </div>
            )}

            {/* ================================================================
                STEP 3 — Closer Skills
                ================================================================ */}
            {currentStep === 3 && (
              <div className="step-enter">
                <StepHeader icon={<Zap size={20} />} step={3} title="Give your closer its edge" subtitle="Customize the voice agent's personality and skills" />

                <div className="space-y-6 mb-6">
                  <div className="step-card-active rounded-xl p-6">
                    <FormField
                      label="Agent Name (what the AI calls itself)"
                      placeholder="e.g. Alex, Jordan, The Closer"
                      value={personality.name}
                      onChange={(v) => setPersonality((p) => ({ ...p, name: v }))}
                    />
                  </div>

                  <div className="step-card-inactive rounded-xl p-6">
                    <p className="text-sm font-semibold text-white/80 mb-4">Closing Tone</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {TONE_OPTIONS.map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() => setPersonality((p) => ({ ...p, tone: tone.value as CloserPersonality["tone"] }))}
                          className={cn(
                            "text-left p-4 rounded-lg border transition-all",
                            personality.tone === tone.value
                              ? "border-[#D4A017] bg-[#D4A017]/10"
                              : "border-white/10 bg-white/3 hover:border-white/20"
                          )}
                        >
                          <p className={cn("text-sm font-semibold", personality.tone === tone.value ? "text-[#D4A017]" : "text-white/70")}>
                            {tone.label}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">{tone.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="step-card-inactive rounded-xl p-6">
                    <p className="text-sm font-semibold text-white/80 mb-1">Closer Specialties</p>
                    <p className="text-xs text-white/40 mb-4">Select all that apply</p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTY_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleSpecialty(s)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            personality.specialties.includes(s)
                              ? "bg-[#D4A017] text-[#0A0B14] border-[#D4A017]"
                              : "bg-white/5 text-white/50 border-white/10 hover:border-white/25 hover:text-white/70"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <BatmanQuote compact />
                </div>

                <div className="flex gap-3">
                  <BackButton onClick={() => setCurrentStep(2)} />
                  <NextButton onClick={handleStep3Next} label="Generate Kenji AI Prompt" icon={<Sparkles size={16} />} highlight />
                </div>
              </div>
            )}

            {/* ================================================================
                STEP 4 — Generated Kenji AI Prompt
                ================================================================ */}
            {currentStep === 4 && (
              <div className="step-enter">
                <StepHeader icon={<FileText size={20} />} step={4} title="Your Kenji AI closer is ready" subtitle="Copy each section into the corresponding Kenji AI Caller field" />

                {isGenerating ? (
                  <div className="step-card-inactive rounded-xl p-12 flex flex-col items-center justify-center gap-4">
                    <img
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-fire-logo-FpAzV6cKZvopBi3MjgPhGs.png"
                      alt=""
                      className="w-16 h-16 object-contain animate-pulse"
                    />
                    <p className="text-[#D4A017] font-semibold">Forging your Kenji AI closer...</p>
                    <p className="text-white/40 text-sm text-center max-w-xs">
                      Embedding Burn the Boats + TCPA compliance into your Voice AI prompt
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[#D4A017] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                ) : generatedPrompt ? (
                  <div className="space-y-4">
                    {/* Tab navigation */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto">
                      {[
                        { key: "greeting", label: "Initial Greeting", icon: "👋" },
                        { key: "main", label: "Main Prompt", icon: "🧠" },
                        { key: "objections", label: "Objection Handlers", icon: "🔥" },
                        { key: "closing", label: "Closing Script", icon: "🎯" },
                        { key: "compliance", label: "Compliance", icon: "✅" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key as typeof activeTab)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                            activeTab === tab.key
                              ? "bg-[#D4A017] text-[#0A0B14]"
                              : "text-white/50 hover:text-white/70"
                          )}
                        >
                          <span>{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* GREETING TAB */}
                    {activeTab === "greeting" && (
                      <div className="step-enter">
                        <div className="step-card-inactive rounded-xl p-5 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Kenji Field</span>
                            <p className="text-sm font-semibold text-white/80">Agent Details → Initial Greeting Message</p>
                          </div>
                          <p className="text-xs text-white/40 mb-4">This is the FIRST thing the AI says when the call connects. Paste this into the "Initial Greeting Message" field — NOT the main prompt.</p>
                          <PromptBox
                            content={generatedPrompt.initialGreeting}
                            onCopy={() => handleCopy(generatedPrompt.initialGreeting, "greeting")}
                            copied={copied === "greeting"}
                          />
                        </div>
                        <div className="bg-[#D4A017]/8 border border-[#D4A017]/20 rounded-lg p-4">
                          <p className="text-xs text-[#D4A017] font-semibold mb-2">💡 Kenji AI Setup Tip</p>
                          <p className="text-xs text-white/50 leading-relaxed">
                            In Kenji AI: <strong className="text-white/70">AI Agents → Voice AI → Create Agent → Agent Details tab</strong> → paste into "Initial Greeting Message". This fires before your main prompt kicks in.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* MAIN PROMPT TAB */}
                    {activeTab === "main" && (
                      <div className="step-enter">
                        <div className="step-card-inactive rounded-xl p-5 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017]">Main Prompt</span>
                            <p className="text-sm font-semibold text-white/80">Agent Goals → Advanced Mode → Prompt</p>
                          </div>
                          <p className="text-xs text-white/40 mb-4">The full system prompt. Paste into Kenji AI's Advanced Mode prompt field. Contains: Role, Compliance Opening, Script Flow, Objection Handling, and Guardrails.</p>
                          <PromptBox
                            content={typewriterDone ? generatedPrompt.mainPrompt : typewriterText}
                            isStreaming={!typewriterDone}
                            onCopy={() => handleCopy(generatedPrompt.mainPrompt, "main")}
                            copied={copied === "main"}
                            tall
                          />
                        </div>
                        <div className="bg-[#D4A017]/8 border border-[#D4A017]/20 rounded-lg p-4">
                          <p className="text-xs text-[#D4A017] font-semibold mb-2">💡 Kenji AI Setup Tip</p>
                          <p className="text-xs text-white/50 leading-relaxed">
                            In Kenji AI: <strong className="text-white/70">Agent Goals tab → click "Switch to Advanced Mode" → paste into the Prompt field</strong>. Use the "Evaluate" button to test before going live.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* OBJECTIONS TAB */}
                    {activeTab === "objections" && (
                      <div className="step-enter">
                        <div className="step-card-inactive rounded-xl p-5 mb-3">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm font-semibold text-white/80">Objection Handler Reference Card</p>
                              <p className="text-xs text-white/40 mt-0.5">Already embedded in your main prompt. Use this as a training reference.</p>
                            </div>
                            <button
                              onClick={() => handleCopy(generatedPrompt.objectionHandlers.join("\n\n"), "objections")}
                              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 flex-shrink-0"
                            >
                              {copied === "objections" ? <Check size={12} /> : <Copy size={12} />}
                              Copy All
                            </button>
                          </div>
                          <div className="space-y-3">
                            {generatedPrompt.objectionHandlers.map((handler: string, i: number) => (
                              <div key={i} className="bg-white/3 rounded-lg p-3 border border-white/5">
                                <p className="text-xs text-white/60 font-mono leading-relaxed">{handler}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <BatmanQuote compact />
                      </div>
                    )}

                    {/* CLOSING SCRIPT TAB */}
                    {activeTab === "closing" && (
                      <div className="step-enter">
                        <div className="step-card-inactive rounded-xl p-5 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017]">The Close</span>
                            <p className="text-sm font-semibold text-white/80">The Burn the Boats Closing Sequence</p>
                          </div>
                          <p className="text-xs text-white/40 mb-4">Already embedded in the main prompt. This is the standalone reference for training your human team too.</p>
                          <PromptBox
                            content={generatedPrompt.closingScript}
                            onCopy={() => handleCopy(generatedPrompt.closingScript, "closing")}
                            copied={copied === "closing"}
                          />
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-[#D4A017]/25 bg-gradient-to-br from-[#D4A017]/8 to-transparent p-5">
                          <div
                            className="absolute inset-0 opacity-10 bg-cover bg-center"
                            style={{ backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-batman-well-96TPTZkZN7hDL6JEJUqWdS.webp)` }}
                          />
                          <div className="relative z-10">
                            <p className="text-xs font-bold text-[#D4A017] uppercase tracking-widest mb-2">🦇 The Golden Rule</p>
                            <p className="text-sm text-white/70 italic leading-relaxed">
                              "After asking the closing question — silence. The next person who speaks, loses. Train your AI to wait. Train yourself to wait."
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COMPLIANCE TAB */}
                    {activeTab === "compliance" && (
                      <div className="step-enter">
                        <div className="step-card-inactive rounded-xl p-5 mb-4">
                          <p className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-[#D4A017]" />
                            TCPA / FCC Compliance Checklist
                          </p>
                          <div className="space-y-2">
                            {generatedPrompt.complianceChecklist.map((item: string, i: number) => (
                              <div key={i} className="flex gap-3 p-3 bg-white/3 rounded-lg border border-white/5">
                                <p className="text-xs text-white/65 leading-relaxed">{item}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Setup notes */}
                        <div className="step-card-inactive rounded-xl p-5">
                          <p className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                            <Zap size={16} className="text-[#D4A017]" />
                            Kenji AI Setup Notes
                          </p>
                          <div className="space-y-2">
                            {generatedPrompt.setupNotes.map((note: string, i: number) => (
                              <div key={i} className="flex gap-3 p-3 bg-white/3 rounded-lg border border-white/5">
                                <span className="text-[#D4A017] text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                                <p className="text-xs text-white/55 leading-relaxed">{note}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Copy all button */}
                    <button
                      onClick={() =>
                        handleCopy(
                          [
                            "=== INITIAL GREETING (Agent Details → Initial Greeting Message) ===\n" + generatedPrompt.initialGreeting,
                            "\n\n=== MAIN PROMPT (Agent Goals → Advanced Mode → Prompt) ===\n" + generatedPrompt.mainPrompt,
                            "\n\n=== OBJECTION HANDLERS (Reference) ===\n" + generatedPrompt.objectionHandlers.join("\n\n"),
                            "\n\n=== CLOSING SCRIPT (Reference) ===\n" + generatedPrompt.closingScript,
                            "\n\n=== COMPLIANCE CHECKLIST ===\n" + generatedPrompt.complianceChecklist.join("\n"),
                            "\n\n=== KENJI AI SETUP NOTES ===\n" + generatedPrompt.setupNotes.join("\n"),
                          ].join("\n"),
                          "all"
                        )
                      }
                      className="w-full py-4 bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-[#0A0B14] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 gold-glow"
                    >
                      {copied === "all" ? (
                        <><Check size={16} strokeWidth={3} /> Copied Everything!</>
                      ) : (
                        <><Copy size={16} /> Copy Complete Kenji AI Closer Package</>
                      )}
                    </button>

                    <button onClick={handleReset} className="w-full py-3 text-white/30 hover:text-white/60 transition-colors text-sm flex items-center justify-center gap-2">
                      <RotateCcw size={14} />
                      Build a new closer
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/8 mt-16 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-fire-logo-FpAzV6cKZvopBi3MjgPhGs.png"
              alt=""
              className="w-6 h-6 object-contain opacity-60"
            />
            <span className="text-xs text-white/30">The Closer — Powered by Media Traffic LLC</span>
          </div>
          <p className="text-xs text-white/20">🦇 Burn the Boats. Drop the rope. Close the deal.</p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StepHeader({ icon, step, title, subtitle }: { icon: React.ReactNode; step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#D4A017]/15 text-[#D4A017]">{icon}</div>
        <span className="text-xs font-bold text-[#D4A017] uppercase tracking-widest">Step {step} of 4</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
      <p className="text-sm text-white/45">{subtitle}</p>
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, multiline = false }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const baseClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4A017]/50 transition-colors";
  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${baseClass} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={baseClass} />
      )}
    </div>
  );
}

function PromptBox({ content, isStreaming = false, onCopy, copied, tall = false }: { content: string; isStreaming?: boolean; onCopy: () => void; copied: boolean; tall?: boolean }) {
  return (
    <div className="relative">
      <button
        onClick={onCopy}
        className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 bg-black/40 z-10"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "Copied!" : "Copy"}
      </button>
      <div className={cn("bg-black/30 rounded-lg p-4 overflow-y-auto", tall ? "max-h-96" : "max-h-64", isStreaming && "typewriter-cursor")}>
        <pre className="text-xs text-white/65 whitespace-pre-wrap font-mono leading-relaxed pr-16">{content}</pre>
      </div>
    </div>
  );
}

function NextButton({ onClick, label, icon, highlight = false }: { onClick: () => void; label: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
        highlight
          ? "bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-[#0A0B14] hover:opacity-90 gold-glow"
          : "bg-[#D4A017] text-[#0A0B14] hover:bg-[#F59E0B]"
      )}
    >
      {icon}
      {label}
      <ArrowRight size={16} />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
    >
      <ChevronRight size={16} className="rotate-180" />
      Back
    </button>
  );
}
