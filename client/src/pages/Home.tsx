// =============================================================================
// THE CLOSER — Main Page
// Design: Premium SaaS / Dark Intelligence
// Gotham night sky + burning boats gold. 4-step wizard that builds
// psychological commitment toward the close.
// =============================================================================

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EmberField from "@/components/EmberField";
import StepIndicator from "@/components/StepIndicator";
import BatmanQuote from "@/components/BatmanQuote";
import { useTypewriter } from "@/hooks/useTypewriter";
import {
  generateCloserPrompt,
  TONE_OPTIONS,
  SPECIALTY_OPTIONS,
  type BusinessInfo,
  type CloserPersonality,
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
} from "lucide-react";

const WIZARD_STEPS = [
  { id: 1, label: "Business Info", sublabel: "Tell us about your offer" },
  { id: 2, label: "Edit & Refine", sublabel: "Fill in missing details" },
  { id: 3, label: "Closer Skills", sublabel: "Customize your agent" },
  { id: 4, label: "Your Prompt", sublabel: "Ready to deploy" },
];

const DEFAULT_BUSINESS: BusinessInfo = {
  businessName: "",
  industry: "",
  productService: "",
  targetCustomer: "",
  mainBenefit: "",
  price: "",
  commonObjections: "",
};

const DEFAULT_PERSONALITY: CloserPersonality = {
  name: "The Closer",
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
  const [generatedPrompt, setGeneratedPrompt] = useState<ReturnType<typeof generateCloserPrompt> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [promptStarted, setPromptStarted] = useState(false);

  const { displayed: typewriterText, done: typewriterDone } = useTypewriter(
    generatedPrompt?.systemPrompt ?? "",
    12,
    promptStarted
  );

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, step])));
    setCurrentStep(step + 1);
  };

  const handleStep1Next = () => {
    if (!business.businessName.trim()) {
      toast.error("Please enter your business name to continue.");
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
    // Generate the prompt
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateCloserPrompt(business, personality);
      setGeneratedPrompt(result);
      setIsGenerating(false);
      setTimeout(() => setPromptStarted(true), 300);
    }, 1800);
  };

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
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
  };

  const handleUrlScrape = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL first.");
      return;
    }
    toast.info("URL scraping coming soon — use Enter Manually for now.");
  };

  const handleTextImport = () => {
    if (!textInput.trim()) {
      toast.error("Please paste your business description.");
      return;
    }
    // Parse text into fields (simple heuristic)
    const lines = textInput.split("\n").filter(Boolean);
    setBusiness((prev) => ({
      ...prev,
      businessName: prev.businessName || lines[0] || "",
      productService: prev.productService || lines.slice(1).join(" ").slice(0, 200) || "",
    }));
    setInputMethod("manual");
    toast.success("Text imported! Review and fill in any missing details.");
  };

  const updateBusiness = (field: keyof BusinessInfo, value: string) => {
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
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "oklch(0.09 0.015 265)" }}
    >
      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-hero-bg-h8WFDLSCw2Ru2GDUKLVrky.webp)`,
        }}
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
              <p className="text-xs text-white/40 -mt-0.5">AI Sales Agent Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/30 border border-white/10 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] animate-pulse" />
              Burn the Boats Method
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

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Hero text */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest mb-3">
            ✦ No-Prompt Closer Creator ✦
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Build Your AI{" "}
            <span className="text-gold-gradient">Sales Closer</span>
            <br />
            <span className="text-white/60 text-3xl sm:text-4xl italic">in 4 minutes</span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
            Drop your business info. Get a battle-tested AI closer powered by the{" "}
            <span className="text-[#D4A017]/80">Burn the Boats</span> closing methodology.
            No rope. No safety net. Just closes.
          </p>
        </div>

        {/* Wizard layout */}
        <div className="flex gap-8 items-start">
          {/* Step rail — desktop only */}
          <div className="hidden lg:block w-52 flex-shrink-0 sticky top-8">
            <StepIndicator
              steps={WIZARD_STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Step content */}
          <div className="flex-1 min-w-0">
            {/* Mobile step indicator */}
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
                  {completedSteps.includes(step.id) ? (
                    <Check size={10} strokeWidth={3} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                  {step.label}
                </div>
              ))}
            </div>

            {/* ================================================================
                STEP 1 — Business Info Input
                ================================================================ */}
            {currentStep === 1 && (
              <div className="step-enter">
                <StepHeader
                  icon={<Building2 size={20} />}
                  step={1}
                  title="Tell us about your business"
                  subtitle="Drop a URL, paste your pitch, or enter manually"
                />

                {/* Input method selector */}
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
                      {method === "url" ? "🔗 Scrape a URL" : method === "text" ? "📋 Paste Text" : "✏️ Enter Manually"}
                    </button>
                  ))}
                </div>

                {/* URL input */}
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
                        onClick={handleUrlScrape}
                        className="px-5 py-3 bg-[#D4A017] text-[#0A0B14] rounded-lg text-sm font-semibold hover:bg-[#F59E0B] transition-colors"
                      >
                        Scrape
                      </button>
                    </div>
                    <p className="text-xs text-white/30 mt-2">
                      Note: May not work with sites that block scraping.
                    </p>
                    <button
                      onClick={() => setInputMethod("manual")}
                      className="mt-3 text-xs text-[#D4A017]/60 hover:text-[#D4A017] transition-colors"
                    >
                      Or enter manually instead →
                    </button>
                  </div>
                )}

                {/* Text paste */}
                {inputMethod === "text" && (
                  <div className="step-card-inactive rounded-xl p-6 mb-6">
                    <label className="block text-sm text-white/60 mb-2">
                      Paste your business description, sales script, or pitch deck
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste anything — your about page, pitch, offer description..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4A017]/50 transition-colors resize-none"
                    />
                    <button
                      onClick={handleTextImport}
                      className="mt-3 px-5 py-2.5 bg-[#D4A017] text-[#0A0B14] rounded-lg text-sm font-semibold hover:bg-[#F59E0B] transition-colors"
                    >
                      Import & Continue
                    </button>
                  </div>
                )}

                {/* Manual entry */}
                {inputMethod === "manual" && (
                  <div className="step-card-active rounded-xl p-6 mb-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField
                        label="Business Name *"
                        placeholder="e.g. Kenji CRM"
                        value={business.businessName}
                        onChange={(v) => updateBusiness("businessName", v)}
                      />
                      <FormField
                        label="Industry *"
                        placeholder="e.g. CRM Software, Real Estate, Coaching"
                        value={business.industry}
                        onChange={(v) => updateBusiness("industry", v)}
                      />
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
                  </div>
                )}

                <NextButton onClick={handleStep1Next} label="Next: Refine Details" />
              </div>
            )}

            {/* ================================================================
                STEP 2 — Edit & Refine
                ================================================================ */}
            {currentStep === 2 && (
              <div className="step-enter">
                <StepHeader
                  icon={<Sliders size={20} />}
                  step={2}
                  title="Refine your offer details"
                  subtitle="The more specific you are, the sharper your closer"
                />

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

                {/* Batman methodology teaser */}
                <div className="mb-6">
                  <BatmanQuote />
                </div>

                <div className="flex gap-3">
                  <BackButton onClick={() => setCurrentStep(1)} />
                  <NextButton onClick={handleStep2Next} label="Next: Closer Skills" />
                </div>
              </div>
            )}

            {/* ================================================================
                STEP 3 — Closer Personality & Skills
                ================================================================ */}
            {currentStep === 3 && (
              <div className="step-enter">
                <StepHeader
                  icon={<Zap size={20} />}
                  step={3}
                  title="Give your closer its edge"
                  subtitle="Customize the personality and skills of your AI agent"
                />

                <div className="space-y-6 mb-6">
                  {/* Name */}
                  <div className="step-card-active rounded-xl p-6">
                    <FormField
                      label="Closer Name"
                      placeholder="e.g. Alex, The Closer, Max"
                      value={personality.name}
                      onChange={(v) => setPersonality((p) => ({ ...p, name: v }))}
                    />
                  </div>

                  {/* Tone */}
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

                  {/* Specialties */}
                  <div className="step-card-inactive rounded-xl p-6">
                    <p className="text-sm font-semibold text-white/80 mb-1">Closer Specialties</p>
                    <p className="text-xs text-white/40 mb-4">Select all that apply to your sales process</p>
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

                  {/* Batman quote compact */}
                  <BatmanQuote compact />
                </div>

                <div className="flex gap-3">
                  <BackButton onClick={() => setCurrentStep(2)} />
                  <NextButton
                    onClick={handleStep3Next}
                    label="Generate My Closer"
                    icon={<Sparkles size={16} />}
                    highlight
                  />
                </div>
              </div>
            )}

            {/* ================================================================
                STEP 4 — Generated Prompt
                ================================================================ */}
            {currentStep === 4 && (
              <div className="step-enter">
                <StepHeader
                  icon={<FileText size={20} />}
                  step={4}
                  title="Your closer is ready"
                  subtitle="Copy and deploy into any AI platform — GHL, ChatGPT, Claude, Voiceflow"
                />

                {isGenerating ? (
                  <div className="step-card-inactive rounded-xl p-12 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <img
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-fire-logo-FpAzV6cKZvopBi3MjgPhGs.png"
                        alt=""
                        className="w-16 h-16 object-contain animate-pulse"
                      />
                    </div>
                    <p className="text-[#D4A017] font-semibold">Forging your closer...</p>
                    <p className="text-white/40 text-sm text-center max-w-xs">
                      Embedding the Burn the Boats methodology into your AI agent
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-[#D4A017] animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : generatedPrompt ? (
                  <div className="space-y-4">
                    {/* System Prompt */}
                    <PromptSection
                      title="System Prompt"
                      subtitle="Paste this into your AI platform's system/instructions field"
                      badge="Main Prompt"
                      badgeColor="gold"
                      content={typewriterDone ? generatedPrompt.systemPrompt : typewriterText}
                      isStreaming={!typewriterDone}
                      onCopy={() => handleCopy(generatedPrompt.systemPrompt, "system")}
                      copied={copied === "system"}
                    />

                    {/* Sample Opener */}
                    <PromptSection
                      title="Sample Opening Line"
                      subtitle="How your closer starts the conversation"
                      badge="Opener"
                      badgeColor="blue"
                      content={generatedPrompt.sampleOpener}
                      onCopy={() => handleCopy(generatedPrompt.sampleOpener, "opener")}
                      copied={copied === "opener"}
                    />

                    {/* Objection Handlers */}
                    <div className="step-card-inactive rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                              Objection Handlers
                            </span>
                          </div>
                          <p className="text-sm text-white/40">5 battle-tested responses using the Burn the Boats method</p>
                        </div>
                        <button
                          onClick={() => handleCopy(generatedPrompt.objectionHandlers.join("\n\n"), "objections")}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20"
                        >
                          {copied === "objections" ? <Check size={12} /> : <Copy size={12} />}
                          Copy All
                        </button>
                      </div>
                      <div className="space-y-3">
                        {generatedPrompt.objectionHandlers.map((handler, i) => (
                          <div key={i} className="bg-white/3 rounded-lg p-3 border border-white/5">
                            <p className="text-xs text-white/60 font-mono leading-relaxed">{handler}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Closing Script */}
                    <PromptSection
                      title="Closing Script"
                      subtitle="The final push — the leap without the rope"
                      badge="The Close"
                      badgeColor="gold"
                      content={generatedPrompt.closingScript}
                      onCopy={() => handleCopy(generatedPrompt.closingScript, "closing")}
                      copied={copied === "closing"}
                    />

                    {/* Copy All button */}
                    <button
                      onClick={() =>
                        handleCopy(
                          [
                            "=== SYSTEM PROMPT ===\n" + generatedPrompt.systemPrompt,
                            "\n=== SAMPLE OPENER ===\n" + generatedPrompt.sampleOpener,
                            "\n=== OBJECTION HANDLERS ===\n" + generatedPrompt.objectionHandlers.join("\n\n"),
                            "\n=== CLOSING SCRIPT ===\n" + generatedPrompt.closingScript,
                          ].join("\n"),
                          "all"
                        )
                      }
                      className="w-full py-4 bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-[#0A0B14] rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 gold-glow"
                    >
                      {copied === "all" ? (
                        <>
                          <Check size={16} strokeWidth={3} />
                          Copied Everything!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy Complete Closer Package
                        </>
                      )}
                    </button>

                    {/* Deployment guide */}
                    <div className="step-card-inactive rounded-xl p-6">
                      <p className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-[#D4A017]" />
                        Where to Deploy Your Closer
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { name: "GoHighLevel", desc: "Paste into Conversation AI → Custom Instructions", icon: "🚀" },
                          { name: "ChatGPT / GPT-4", desc: "Create a Custom GPT → System Prompt", icon: "🤖" },
                          { name: "Claude", desc: "System prompt in API or Claude.ai Projects", icon: "🧠" },
                          { name: "Voiceflow", desc: "AI Step → System Prompt field", icon: "🎙️" },
                          { name: "Bland AI", desc: "Task prompt in your phone agent", icon: "📞" },
                          { name: "Any AI Platform", desc: "Works anywhere that accepts a system prompt", icon: "⚡" },
                        ].map((platform) => (
                          <div key={platform.name} className="flex gap-3 p-3 bg-white/3 rounded-lg border border-white/5">
                            <span className="text-lg flex-shrink-0">{platform.icon}</span>
                            <div>
                              <p className="text-xs font-semibold text-white/70">{platform.name}</p>
                              <p className="text-xs text-white/35 mt-0.5">{platform.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Start over */}
                    <button
                      onClick={handleReset}
                      className="w-full py-3 text-white/30 hover:text-white/60 transition-colors text-sm flex items-center justify-center gap-2"
                    >
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
          <p className="text-xs text-white/20">
            🦇 Burn the Boats. Drop the rope. Close the deal.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StepHeader({
  icon,
  step,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  step: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#D4A017]/15 text-[#D4A017]">
          {icon}
        </div>
        <span className="text-xs font-bold text-[#D4A017] uppercase tracking-widest">
          Step {step} of 4
        </span>
      </div>
      <h3
        className="text-2xl font-bold text-white mb-1"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-white/45">{subtitle}</p>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const baseClass =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4A017]/50 transition-colors";

  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  );
}

function NextButton({
  onClick,
  label,
  icon,
  highlight = false,
}: {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
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

function PromptSection({
  title,
  subtitle,
  badge,
  badgeColor,
  content,
  isStreaming = false,
  onCopy,
  copied,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: "gold" | "blue";
  content: string;
  isStreaming?: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="step-card-inactive rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-full",
                badgeColor === "gold"
                  ? "bg-[#D4A017]/20 text-[#D4A017]"
                  : "bg-blue-500/20 text-blue-400"
              )}
            >
              {badge}
            </span>
            <h4 className="text-sm font-semibold text-white/80">{title}</h4>
          </div>
          <p className="text-xs text-white/40">{subtitle}</p>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 flex-shrink-0"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div
        className={cn(
          "bg-black/30 rounded-lg p-4 max-h-72 overflow-y-auto",
          isStreaming && "typewriter-cursor"
        )}
      >
        <pre className="text-xs text-white/65 whitespace-pre-wrap font-mono leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}
