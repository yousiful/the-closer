'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Copy, FileText, Loader2, Maximize2, PhoneCall } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import BatmanQuote from "@/components/BatmanQuote";
import EmberField from "@/components/EmberField";
import StepIndicator from "@/components/StepIndicator";
import PromptModal from "@/components/PromptModal";
import { generateKenjiAIPrompt, TONE_OPTIONS, CALL_PURPOSE_OPTIONS, CALL_DIRECTION_OPTIONS, SPECIALTY_OPTIONS, type BusinessInfo, type CallDirection, type CloserPersonality, type KenjiAIPromptPackage } from "@/lib/generatePrompt";
import { scrapeWebsite } from "@/lib/scrapeWebsite";

const TOTAL_STEPS = 5;

const DEFAULT_BUSINESS: BusinessInfo = {
  businessName: "",
  industry: "",
  productService: "",
  targetCustomer: "",
  mainBenefit: "",
  price: "",
  commonObjections: "",
  callDirection: "outbound",
  callPurpose: "book_appointment",
  bookingCalendar: false,
  productKnowledge: "",
  trialLink: "",
  websiteUrl: "",
  guaranteePolicy: "",
};

const DEFAULT_PERSONALITY: CloserPersonality = {
  name: "",
  tone: "confident",
  specialties: [],
  closingStyle: "batman",
};

type StepHeaderProps = {
  icon: React.ReactNode;
  step: number;
  title: string;
  subtitle: string;
};

function StepHeader({ icon, step, title, subtitle }: StepHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#D4A017]/20 flex items-center justify-center text-[#D4A017]">
          {icon}
        </div>
        <div>
          <p className="text-xs text-[#D4A017] font-bold uppercase tracking-wider">STEP {step} OF {TOTAL_STEPS}</p>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
      </div>
      <p className="text-sm text-white/50 ml-13">{subtitle}</p>
    </div>
  );
}

interface PromptBoxProps {
  content: string;
  isStreaming?: boolean;
  onCopy: () => void;
  copied: boolean;
  tall?: boolean;
  onExpand?: () => void;
}

function PromptBox({ content, isStreaming, onCopy, copied, tall, onExpand }: PromptBoxProps) {
  return (
    <div className={cn("relative bg-white/3 border border-white/10 rounded-lg p-4 font-mono text-xs text-white/70 leading-relaxed overflow-hidden", tall ? "max-h-96" : "max-h-48")}>
      <div className={cn("overflow-y-auto", tall ? "max-h-80" : "max-h-40")}>
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {isStreaming && <span className="animate-pulse">▌</span>}
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        {onExpand && (
          <button onClick={onExpand} className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors" title="Expand">
            <Maximize2 size={12} />
          </button>
        )}
        <button onClick={onCopy} className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors" title="Copy">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}

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
  const [isScraping, setIsScraping] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; title: string; badge?: string; subtitle?: string; content: string; copyKey: string; tip?: string } | null>(null);

  const completeStep = (step: number) => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, step])));
    setCurrentStep(step + 1);
  };

  const handleDirectionNext = () => {
    completeStep(1);
  };

  const handleBusinessNext = () => {
    if (!business.businessName.trim()) {
      toast.error("Please enter your business name.");
      return;
    }
    if (!business.productService.trim()) {
      toast.error("Please describe what you sell.");
      return;
    }
    completeStep(2);
  };

  const handleRefineNext = () => {
    if (!business.targetCustomer.trim()) {
      toast.error("Who is your ideal customer?");
      return;
    }
    if (!business.mainBenefit.trim()) {
      toast.error("What's the main transformation you deliver?");
      return;
    }
    completeStep(3);
  };

  const handleGenerate = () => {
    if (!personality.name.trim()) {
      toast.error("Give your closer a name.");
      return;
    }
    completeStep(4);
    const result = generateKenjiAIPrompt(business, personality);
    setGeneratedPrompt(result);
  };

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  const handleScrapeUrl = async () => {
    if (!urlInput.trim()) {
      toast.error("Enter a URL to scrape");
      return;
    }
    setIsScraping(true);
    try {
      const data = await scrapeWebsite(urlInput);
      setBusiness((prev) => ({
        ...prev,
        businessName: data.businessName || prev.businessName,
        industry: data.industry || prev.industry,
        productService: data.productService || prev.productService,
        targetCustomer: data.targetCustomer || prev.targetCustomer,
        mainBenefit: data.mainBenefit || prev.mainBenefit,
        price: data.price || prev.price,
      }));
      setInputMethod("manual");
      toast.success("Website scraped! Review and edit the fields.");
    } catch {
      toast.error("Failed to scrape website. Try entering manually.");
    } finally {
      setIsScraping(false);
    }
  };

  const openModal = (title: string, content: string, copyKey: string, badge?: string, subtitle?: string, tip?: string) => {
    setModal({ open: true, title, content, copyKey, badge, subtitle, tip });
  };

  const closeModal = () => setModal(null);

  return (
    <div className="min-h-screen bg-[#0A0B14] text-white">
      <EmberField />

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block mb-4">
            <div className="text-4xl">🔥</div>
          </div>
          <h1 className="text-5xl font-bold mb-2">
            The <span className="text-[#D4A017]">Closer</span>
          </h1>
          <p className="text-white/50">Kenji AI Caller Builder</p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-1">
            <StepIndicator
              currentStep={currentStep}
              completedSteps={completedSteps}
              steps={[
                { id: 1, label: "Call Direction", sublabel: "Inbound or outbound" },
                { id: 2, label: "Business Info", sublabel: "Tell us about your offer" },
                { id: 3, label: "Edit & Refine", sublabel: "Dial in the details" },
                { id: 4, label: "Closer Skills", sublabel: "Customize your agent" },
                { id: 5, label: "Kenji Prompt", sublabel: "Ready to deploy" },
              ]}
            />
          </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* ================================================================
              STEP 1 — Call Direction
              ================================================================ */}
          {currentStep === 1 && (
            <div className="step-enter">
              <StepHeader icon={<PhoneCall size={20} />} step={1} title="How do these calls start?" subtitle="This changes the whole prompt, not just a label" />

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {CALL_DIRECTION_OPTIONS.map((opt) => {
                  const selected = business.callDirection === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setBusiness({ ...business, callDirection: opt.value as CallDirection })}
                      className={cn(
                        "text-left rounded-xl p-6 border transition-all",
                        selected
                          ? "border-[#D4A017] bg-[#D4A017]/10"
                          : "border-white/10 bg-white/3 hover:border-white/25"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{opt.icon}</span>
                        <span className={cn("text-lg font-bold", selected ? "text-[#D4A017]" : "text-white/80")}>
                          {opt.label}
                        </span>
                        {selected && <Check size={16} className="text-[#D4A017] ml-auto" />}
                      </div>
                      <p className="text-sm text-white/60 mb-3">{opt.description}</p>
                      <p className="text-xs text-white/35 leading-relaxed">{opt.detail}</p>
                    </button>
                  );
                })}
              </div>

              <div className="bg-white/3 border border-white/10 rounded-xl p-5 mb-8">
                <Label className="text-white/70 text-xs font-semibold mb-2 block">WHAT THIS CALL SHOULD ACCOMPLISH</Label>
                <Select value={business.callPurpose} onValueChange={(value: any) => setBusiness({ ...business, callPurpose: value })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1b2e] border-white/10">
                    {CALL_PURPOSE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-white">
                        {opt.icon} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-white/40 mt-2">
                  {CALL_PURPOSE_OPTIONS.find((p) => p.value === business.callPurpose)?.description}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleDirectionNext} className="flex-1 bg-[#D4A017] text-[#0A0B14] hover:bg-[#D4A017]/90 font-semibold py-3">
                  Next: Business Info
                </Button>
              </div>
            </div>
          )}

          {/* ================================================================
              STEP 2 — Business Info
              ================================================================ */}
          {currentStep === 2 && (
            <div className="step-enter">
              <StepHeader icon={<FileText size={20} />} step={2} title="Tell us about your business" subtitle="Drop a URL, paste your pitch, or enter manually" />

              <div className="space-y-4 mb-8">
                {/* Input Method Tabs */}
                <div className="flex gap-2">
                  {(["manual", "url", "text"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setInputMethod(method)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        inputMethod === method ? "bg-[#D4A017] text-[#0A0B14]" : "bg-white/5 text-white/50 hover:text-white/70"
                      )}
                    >
                      {method === "manual" && "📝 Enter Manually"}
                      {method === "url" && "🔗 Scrape URL"}
                      {method === "text" && "📄 Paste Text"}
                    </button>
                  ))}
                </div>

                {/* URL Input */}
                {inputMethod === "url" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://yourwebsite.com"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                      <Button
                        onClick={handleScrapeUrl}
                        disabled={isScraping}
                        className="bg-[#D4A017] text-[#0A0B14] hover:bg-[#D4A017]/90 flex-shrink-0"
                      >
                        {isScraping ? <Loader2 className="animate-spin" size={16} /> : "Scrape"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Text Input */}
                {inputMethod === "text" && (
                  <Textarea
                    placeholder="Paste your pitch, website copy, or any business info..."
                    value={textInput}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      // Simple extraction logic
                      const lines = e.target.value.split("\n");
                      setBusiness((prev) => ({
                        ...prev,
                        productService: lines[0] || prev.productService,
                      }));
                    }}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-24"
                  />
                )}

                {/* Manual Entry */}
                {inputMethod === "manual" && (
                  <div className="space-y-4 bg-white/3 border border-white/10 rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-xs font-semibold mb-2 block">BUSINESS NAME *</Label>
                        <Input
                          placeholder="e.g. Kenji CRM"
                          value={business.businessName}
                          onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs font-semibold mb-2 block">INDUSTRY *</Label>
                        <Input
                          placeholder="e.g. CRM Software, Real Estate, Coaching"
                          value={business.industry}
                          onChange={(e) => setBusiness({ ...business, industry: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs font-semibold mb-2 block">WHAT YOU SELL *</Label>
                      <Textarea
                        placeholder="Describe your product or service in 1-2 sentences"
                        value={business.productService}
                        onChange={(e) => setBusiness({ ...business, productService: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-20"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs font-semibold mb-2 block">TARGET CUSTOMER *</Label>
                      <Input
                        placeholder="e.g. Real estate agents, SaaS founders, coaches"
                        value={business.targetCustomer}
                        onChange={(e) => setBusiness({ ...business, targetCustomer: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs font-semibold mb-2 block">MAIN BENEFIT / TRANSFORMATION *</Label>
                      <Input
                        placeholder="e.g. Close more deals, save 10 hours/week, 3x ROI"
                        value={business.mainBenefit}
                        onChange={(e) => setBusiness({ ...business, mainBenefit: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70 text-xs font-semibold mb-2 block">PRICING</Label>
                        <Input
                          placeholder="e.g. $5,000 one-time + $500/mo"
                          value={business.price}
                          onChange={(e) => setBusiness({ ...business, price: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70 text-xs font-semibold mb-2 block">TRIAL LINK (optional)</Label>
                        <Input
                          placeholder="https://trial.yoursite.com"
                          value={business.trialLink}
                          onChange={(e) => setBusiness({ ...business, trialLink: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs font-semibold mb-2 block">COMMON OBJECTIONS</Label>
                      <Textarea
                        placeholder="e.g. It's too expensive, I need to think about it, We already have a solution"
                        value={business.commonObjections}
                        onChange={(e) => setBusiness({ ...business, commonObjections: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-16"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs font-semibold mb-2 block">GUARANTEE POLICY</Label>
                      <Input
                        placeholder="e.g. 30-day money-back guarantee"
                        value={business.guaranteePolicy}
                        onChange={(e) => setBusiness({ ...business, guaranteePolicy: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs font-semibold mb-2 block">PRODUCT KNOWLEDGE / FAQ</Label>
                      <Textarea
                        placeholder={"One fact per line. How it works, setup time, what's included, integrations, contract terms, anything prospects actually ask.\n\ne.g.\nSetup takes 3 to 5 business days\nMonth to month, cancel with 30 days notice\nWorks alongside your existing CRM, no migration needed\nIntegrates with Zapier, Google Calendar, QuickBooks"}
                        value={business.productKnowledge}
                        onChange={(e) => setBusiness({ ...business, productKnowledge: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-32"
                      />
                      <p className="text-xs text-white/40 mt-1.5">
                        This becomes the agent's PRODUCT KNOWLEDGE section. The more specific you are here, the less it deflects. It still won't promise results.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setCurrentStep(1)} className="flex-1 bg-white/10 text-white hover:bg-white/20 font-semibold py-3">
                  Back
                </Button>
                <Button onClick={handleBusinessNext} className="flex-1 bg-[#D4A017] text-[#0A0B14] hover:bg-[#D4A017]/90 font-semibold py-3">
                  Next: Edit & Refine
                </Button>
              </div>
            </div>
          )}

          {/* ================================================================
              STEP 3 — Edit & Refine
              ================================================================ */}
          {currentStep === 3 && (
            <div className="step-enter">
              <StepHeader icon={<FileText size={20} />} step={3} title="Edit & refine" subtitle="Dial in the details" />

              <div className="space-y-4 bg-white/3 border border-white/10 rounded-xl p-6 mb-8">
                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">BUSINESS NAME</Label>
                  <Input
                    value={business.businessName}
                    onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 text-xs font-semibold mb-2 block">INDUSTRY</Label>
                    <Input
                      value={business.industry}
                      onChange={(e) => setBusiness({ ...business, industry: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70 text-xs font-semibold mb-2 block">PRICING</Label>
                    <Input
                      value={business.price}
                      onChange={(e) => setBusiness({ ...business, price: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">WHAT YOU SELL</Label>
                  <Textarea
                    value={business.productService}
                    onChange={(e) => setBusiness({ ...business, productService: e.target.value })}
                    className="bg-white/5 border-white/10 text-white min-h-16"
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">TARGET CUSTOMER</Label>
                  <Input
                    value={business.targetCustomer}
                    onChange={(e) => setBusiness({ ...business, targetCustomer: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">MAIN BENEFIT / TRANSFORMATION</Label>
                  <Input
                    value={business.mainBenefit}
                    onChange={(e) => setBusiness({ ...business, mainBenefit: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">COMMON OBJECTIONS (comma-separated)</Label>
                  <Textarea
                    value={business.commonObjections}
                    onChange={(e) => setBusiness({ ...business, commonObjections: e.target.value })}
                    className="bg-white/5 border-white/10 text-white min-h-16"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70 text-xs font-semibold mb-2 block">TRIAL LINK</Label>
                    <Input
                      value={business.trialLink}
                      onChange={(e) => setBusiness({ ...business, trialLink: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70 text-xs font-semibold mb-2 block">GUARANTEE POLICY</Label>
                    <Input
                      value={business.guaranteePolicy}
                      onChange={(e) => setBusiness({ ...business, guaranteePolicy: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">PRODUCT KNOWLEDGE / FAQ (one fact per line)</Label>
                  <Textarea
                    value={business.productKnowledge}
                    onChange={(e) => setBusiness({ ...business, productKnowledge: e.target.value })}
                    className="bg-white/5 border-white/10 text-white min-h-32"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setCurrentStep(2)} className="flex-1 bg-white/10 text-white hover:bg-white/20 font-semibold py-3">
                  Back
                </Button>
                <Button onClick={handleRefineNext} className="flex-1 bg-[#D4A017] text-[#0A0B14] hover:bg-[#D4A017]/90 font-semibold py-3">
                  Next: Closer Skills
                </Button>
              </div>
            </div>
          )}

          {/* ================================================================
              STEP 4 — Closer Personality
              ================================================================ */}
          {currentStep === 4 && (
            <div className="step-enter">
              <StepHeader icon={<FileText size={20} />} step={4} title="Closer skills" subtitle="Customize your agent" />

              <div className="space-y-4 bg-white/3 border border-white/10 rounded-xl p-6 mb-8">
                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">CLOSER NAME *</Label>
                  <Input
                    placeholder="e.g. Alex, Jordan, The Closer"
                    value={personality.name}
                    onChange={(e) => setPersonality({ ...personality, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">TONE</Label>
                  <Select value={personality.tone} onValueChange={(value: any) => setPersonality({ ...personality, tone: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1b2e] border-white/10">
                      {TONE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-white">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/40 mt-1">
                    {TONE_OPTIONS.find((t) => t.value === personality.tone)?.description}
                  </p>
                </div>

                <div>
                  <Label className="text-white/70 text-xs font-semibold mb-2 block">SPECIALTIES (select all that apply)</Label>
                  <div className="space-y-2">
                    {SPECIALTY_OPTIONS.map((spec) => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={personality.specialties.includes(spec)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPersonality({ ...personality, specialties: [...personality.specialties, spec] });
                            } else {
                              setPersonality({
                                ...personality,
                                specialties: personality.specialties.filter((s) => s !== spec),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded bg-white/10 border-white/20 accent-[#D4A017]"
                        />
                        <span className="text-sm text-white/70">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setCurrentStep(3)} className="flex-1 bg-white/10 text-white hover:bg-white/20 font-semibold py-3">
                  Back
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1 bg-[#D4A017] text-[#0A0B14] hover:bg-[#D4A017]/90 font-semibold py-3">
                  {isGenerating ? <Loader2 className="animate-spin mr-2" size={16} /> : "Generate Your Kenji Prompt"}
                </Button>
              </div>
            </div>
          )}

          {/* ================================================================
              STEP 5 — Generated Kenji AI Prompt (ALL SECTIONS VISIBLE AT ONCE)
              ================================================================ */}
          {currentStep === 5 && (
            <div className="step-enter">
              <StepHeader
                icon={<FileText size={20} />}
                step={5}
                title={`Your Kenji AI ${business.callDirection} closer is ready`}
                subtitle="All sections visible below, copy what you need"
              />

              {isGenerating ? (
                <div className="step-card-inactive rounded-xl p-12 flex flex-col items-center justify-center gap-4">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-fire-logo-FpAzV6cKZvopBi3MjgPhGs.png"
                    alt=""
                    className="w-16 h-16 object-contain animate-pulse"
                  />
                  <p className="text-[#D4A017] font-semibold">Forging your Kenji AI closer...</p>
                  <p className="text-white/30 text-xs text-center max-w-xs mt-1">Fixing all evaluator issues automatically</p>
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
                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
                  {/* MAIN PROMPT FIRST */}
                  <div className="step-enter">
                    <div className="step-card-inactive rounded-xl p-5 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017]">Main Prompt</span>
                        <p className="text-sm font-semibold text-white/80">Agent Goals → Advanced Mode → Prompt</p>
                      </div>
                      <p className="text-xs text-white/40 mb-4">The full system prompt. Paste into Kenji AI's Advanced Mode prompt field. Contains: Role, Compliance Opening, Script Flow, Objection Handling, and Guardrails.</p>
                      <PromptBox
                        content={generatedPrompt.mainPrompt}
                        isStreaming={false}
                        onCopy={() => handleCopy(generatedPrompt.mainPrompt, "main")}
                        copied={copied === "main"}
                        tall
                        onExpand={() => openModal(
                          "Main Prompt",
                          generatedPrompt.mainPrompt,
                          "main-modal",
                          "Main Prompt",
                          "Agent Goals > Advanced Mode > Prompt",
                          "In Kenji AI: Agent Goals tab - click Switch to Advanced Mode - paste into the Prompt field. Use the Evaluate button to test before going live."
                        )}
                      />
                    </div>
                    <div className="bg-[#D4A017]/8 border border-[#D4A017]/20 rounded-lg p-4">
                      <p className="text-xs text-[#D4A017] font-semibold mb-2">💡 Kenji AI Setup Tip</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        In Kenji AI: <strong className="text-white/70">Agent Goals tab → click "Switch to Advanced Mode" → paste into the Prompt field</strong>. Use the "Evaluate" button to test before going live.
                      </p>
                    </div>
                  </div>

                  {/* GREETING SECTION */}
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
                        onExpand={() => openModal(
                          "Initial Greeting Message",
                          generatedPrompt.initialGreeting,
                          "greeting-modal",
                          "Kenji Field",
                          "Agent Details → Initial Greeting Message",
                          "In Kenji AI: AI Agents → Voice AI → Create Agent → Agent Details tab → paste into Initial Greeting Message. This fires before your main prompt kicks in."
                        )}
                      />
                    </div>
                    <div className="bg-blue-500/8 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-xs text-blue-400 font-semibold mb-2">💡 Kenji AI Setup Tip</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        In Kenji AI: <strong className="text-white/70">AI Agents → Voice AI → Create Agent → Agent Details tab</strong> → paste into "Initial Greeting Message". This fires before your main prompt kicks in.
                      </p>
                    </div>
                  </div>

                  {/* ACTION TRIGGERS SECTION */}
                  <div className="step-enter">
                    <div className="step-card-inactive rounded-xl p-5 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017]">Action Triggers</span>
                        <p className="text-sm font-semibold text-white/80">Agent Goals → Actions Tab</p>
                      </div>
                      <p className="text-xs text-white/40 mb-4">Copy each triggerPrompt exactly as written into Kenji AI's Actions tab. These fix the evaluator's "Trigger Clarity" and "Information Gathering" flags.</p>
                      <div className="space-y-3">
                        {generatedPrompt.actionTriggers.map((trigger, i: number) => (
                          <div key={i} className="bg-white/3 rounded-lg p-4 border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-[#D4A017]">{trigger.name}</p>
                                {trigger.ghlTag && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                    #{trigger.ghlTag}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleCopy(`Action: ${trigger.action}${trigger.ghlTag ? `\nGHL Tag: ${trigger.ghlTag}` : ""}\n\nTrigger Prompt:\n${trigger.triggerPrompt}\n\nNotes: ${trigger.notes}`, `trigger-${i}`)}
                                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 rounded px-2 py-1 hover:border-white/20"
                              >
                                {copied === `trigger-${i}` ? <Check size={10} /> : <Copy size={10} />}
                                Copy
                              </button>
                            </div>
                            <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Action</p>
                            <p className="text-xs text-white/60 mb-3 font-mono">{trigger.action}</p>
                            <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Trigger Prompt (paste exactly)</p>
                            <p className="text-xs text-white/60 leading-relaxed mb-3 italic">{trigger.triggerPrompt}</p>
                            <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Setup Note</p>
                            <p className="text-xs text-white/45 leading-relaxed">{trigger.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#D4A017]/8 border border-[#D4A017]/20 rounded-lg p-4">
                      <p className="text-xs text-[#D4A017] font-semibold mb-2">⚡ Kenji AI Setup Tip</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        In Kenji AI: <strong className="text-white/70">Agent Goals → Actions tab → Add Action</strong> → paste the Trigger Prompt into the "When" field and configure the corresponding action. Add all {generatedPrompt.actionTriggers.length} triggers for full coverage.
                      </p>
                    </div>
                  </div>

                  {/* OBJECTIONS SECTION */}
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

                  {/* CLOSING SCRIPT SECTION */}
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
                        onExpand={() => openModal(
                          "The Burn the Boats Closing Sequence",
                          generatedPrompt.closingScript,
                          "closing-modal",
                          "The Close",
                          "Batman Well Story — embed in training, not just the AI",
                          "After asking the closing question — silence. The next person who speaks, loses."
                        )}
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
                          "After asking the closing question — silence. The next person who speaks, loses."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SETUP NOTES SECTION */}
                  <div className="step-enter">
                    <div className="step-card-inactive rounded-xl p-5 mb-3">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold text-white/80">Kenji AI Setup Steps</p>
                          <p className="text-xs text-white/40 mt-0.5">Where each piece goes, in order</p>
                        </div>
                        <button
                          onClick={() => handleCopy(generatedPrompt.setupNotes.join("\n"), "setup")}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 flex-shrink-0"
                        >
                          {copied === "setup" ? <Check size={12} /> : <Copy size={12} />}
                          Copy All
                        </button>
                      </div>
                      <div className="space-y-2">
                        {generatedPrompt.setupNotes.map((note: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-white/60">
                            <span className="text-[#D4A017] font-bold font-mono flex-shrink-0">{i + 1}.</span>
                            <span className="leading-relaxed">{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COMPLIANCE SECTION */}
                  <div className="step-enter">
                    <div className="step-card-inactive rounded-xl p-5 mb-3">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold text-white/80">
                            Compliance Checklist ({business.callDirection})
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {business.callDirection === "inbound"
                              ? "Inbound rules, not a copy of the outbound list. Verify before going live."
                              : "Full TCPA/FCC posture. Verify before going live."}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(generatedPrompt.complianceChecklist.join("\n"), "compliance")}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 flex-shrink-0"
                        >
                          {copied === "compliance" ? <Check size={12} /> : <Copy size={12} />}
                          Copy All
                        </button>
                      </div>
                      <div className="space-y-2">
                        {generatedPrompt.complianceChecklist.map((item: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                            <span className="text-[#D4A017] font-bold flex-shrink-0">{item.split(" ")[0]}</span>
                            <span>{item.substring(item.indexOf(" ") + 1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
        </div>
        </div>
      </div>

      {/* Modal */}
      {modal && <PromptModal {...modal} isOpen={modal.open} onClose={closeModal} onCopy={() => handleCopy(modal.content, modal.copyKey)} copied={copied === modal.copyKey} />}
    </div>
  );
}
