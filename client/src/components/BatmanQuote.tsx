// BatmanQuote — the "Burn the Boats" methodology pull-quote
// Design: Premium SaaS / Dark Intelligence theme

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const BATMAN_STORY = `Batman is at the bottom of a well. Bane has broken his back. He has to climb out. At the top, there's a jump that no one has ever made.

The first time he tries it with a rope — so if he falls, he's safe. He doesn't make it. He tries again. Doesn't make it. Weeks go by.

The third time? He climbs up without the rope. If he falls, he dies. And that's when he makes the jump.

The whole point: we hold ourselves back because we have a safety net. The rope is the problem.

So the question becomes — what puts you in the best position possible? Splitting up and keeping the safety net, or going all in and burning the boats?`;

export default function BatmanQuote({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="relative">
        <div
          className="border border-[#D4A017]/20 rounded-lg p-4 bg-[#D4A017]/5 cursor-pointer hover:bg-[#D4A017]/8 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="text-[#D4A017] text-xl flex-shrink-0 mt-0.5">🦇</span>
              <div>
                <p className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest mb-1">
                  The Burn the Boats Method
                </p>
                <p className="text-sm text-white/60 italic leading-relaxed">
                  "The rope is the problem. What puts you in the best position possible?"
                </p>
              </div>
            </div>
            <button className="text-white/30 hover:text-[#D4A017] transition-colors flex-shrink-0 mt-1">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-[#D4A017]/15">
              <p className="text-sm text-white/55 leading-relaxed whitespace-pre-line font-mono text-xs">
                {BATMAN_STORY}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#D4A017]/25 bg-gradient-to-br from-[#D4A017]/8 to-transparent p-6">
      {/* Background well image */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663145844820/D8d6P6JxN75EWVX5ZmECZm/closer-batman-well-96TPTZkZN7hDL6JEJUqWdS.webp)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🦇</span>
          <div>
            <p className="text-xs font-bold text-[#D4A017] uppercase tracking-widest">
              The Burn the Boats Method
            </p>
            <p className="text-xs text-white/40">Embedded in every objection handler</p>
          </div>
        </div>
        <blockquote className="text-sm text-white/70 leading-relaxed italic border-l-2 border-[#D4A017]/40 pl-4">
          "The rope is the problem. What puts you in the best position possible — keeping the safety net, or going all in?"
        </blockquote>
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-[#D4A017]/60 hover:text-[#D4A017] transition-colors flex items-center gap-1"
        >
          {expanded ? "Hide" : "Read"} the full Batman story
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 leading-relaxed whitespace-pre-line">
              {BATMAN_STORY}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
