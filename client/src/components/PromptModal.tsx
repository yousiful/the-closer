// =============================================================================
// PromptModal — Full-screen popup for viewing and copying prompt sections
// Design: Premium SaaS / Dark Intelligence
// =============================================================================

import { useEffect, useCallback } from "react";
import { X, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  badge?: string;
  badgeColor?: string;
  subtitle?: string;
  content: string;
  onCopy: () => void;
  copied: boolean;
  tip?: string;
}

export default function PromptModal({
  isOpen,
  onClose,
  title,
  badge,
  badgeColor = "bg-[#D4A017]/20 text-[#D4A017]",
  subtitle,
  content,
  onCopy,
  copied,
  tip,
}: PromptModalProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 11, 20, 0.92)", backdropFilter: "blur(12px)" }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: "oklch(0.12 0.015 265)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/8 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {badge && (
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", badgeColor)}>
                  {badge}
                </span>
              )}
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {title}
              </h2>
            </div>
            {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onCopy}
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all",
                copied
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-[#D4A017] text-[#0A0B14] hover:bg-[#F59E0B]"
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy All"}
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all border border-white/10"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-black/30 rounded-xl p-5 border border-white/5">
            <pre className="text-sm text-white/75 whitespace-pre-wrap font-mono leading-relaxed">
              {content}
            </pre>
          </div>

          {tip && (
            <div className="mt-4 bg-[#D4A017]/8 border border-[#D4A017]/20 rounded-lg p-4">
              <p className="text-xs text-[#D4A017] font-semibold mb-1">💡 Setup Tip</p>
              <p
                className="text-xs text-white/50 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: tip }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/8 flex-shrink-0">
          <p className="text-xs text-white/25">Press Esc to close</p>
          <button
            onClick={onCopy}
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all",
              copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gradient-to-r from-[#D4A017] to-[#F59E0B] text-[#0A0B14] hover:opacity-90"
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied to Clipboard!" : "Copy & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
