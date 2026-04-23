"use client";

import { useState } from "react";
import { Share2, BookMarked, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { HadithResult } from "@/app/page";
import { UI_TEXT, type LangCode } from "@/lib/languages";

interface HadithCardProps {
  hadith: HadithResult;
  index: number;
  lang: LangCode;
}

const BOOK_COLORS: Record<string, string> = {
  bukhari: "#1a6b3c",
  muslim: "#1a4f6b",
  abudawud: "#4a3a1a",
  tirmidhi: "#3a1a4a",
  nasai: "#1a3a4a",
  ibnmajah: "#4a1a2a",
};

export default function HadithCard({ hadith, index, lang }: HadithCardProps) {
  const [showArabic, setShowArabic] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = UI_TEXT[lang];
  const bookColor = BOOK_COLORS[hadith.book] || "#1a6b3c";

  const handleShare = async () => {
    const text = `📖 ${hadith.source} No. ${hadith.number}\n\n${hadith.indonesia}\n\n💡 ${hadith.lesson || ""}\n\n— Sunnafy`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <div
      className="rounded-2xl border border-[#1a6b3c]/20 bg-[#0c1610] overflow-hidden hover:border-[#1a6b3c]/40 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: "forwards" }}
    >
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${bookColor}, transparent)` }} />

      <div className="p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-medium px-3 py-1 rounded-full border"
              style={{ color: "#4ade80", borderColor: `${bookColor}60`, backgroundColor: `${bookColor}20` }}
            >
              {hadith.source}
            </span>
            <span className="text-xs text-[#2d5c40] border border-[#1a6b3c]/20 px-2.5 py-1 rounded-full">
              No. {hadith.number}
            </span>
          </div>
          <button
            onClick={handleShare}
            className="text-[#2d5c40] hover:text-[#4ade80] transition-colors p-1.5 rounded-lg hover:bg-[#1a6b3c]/10 shrink-0"
          >
            {copied ? <span className="text-xs text-[#4ade80]">{t.copied}</span> : <Share2 size={15} />}
          </button>
        </div>

        <p className="text-[#b8d4c0] leading-relaxed text-[15px] mb-4">
          &ldquo;{hadith.indonesia}&rdquo;
        </p>

        {hadith.arabic && (
          <button
            onClick={() => setShowArabic(!showArabic)}
            className="flex items-center gap-1.5 text-xs text-[#2d5c40] hover:text-[#4ade80] transition-colors mb-4"
          >
            {showArabic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showArabic ? t.hideArabic : t.showArabic}
          </button>
        )}

        {showArabic && hadith.arabic && (
          <div className="mb-5 p-4 bg-[#0a0f0d] rounded-xl border border-[#1a6b3c]/10">
            <p className="font-arabic text-[#c9a84c]/90 text-xl leading-loose text-right" dir="rtl">
              {hadith.arabic}
            </p>
          </div>
        )}

        <div className="h-px bg-[#1a6b3c]/15 mb-4" />

        {hadith.explanation && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-xs text-[#c9a84c]/60 mb-2 uppercase tracking-widest">
              <Sparkles size={11} />
              {t.aiLabel}
            </div>
            <p className="text-[#7a9e88] text-sm leading-relaxed">{hadith.explanation}</p>
          </div>
        )}

        {hadith.lesson && (
          <div className="flex gap-3 p-3.5 bg-[#1a6b3c]/10 rounded-xl border border-[#1a6b3c]/20">
            <BookMarked size={16} className="text-[#4ade80]/60 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[#4ade80]/50 uppercase tracking-widest mb-1">{t.lessonLabel}</p>
              <p className="text-[#9dd4a8] text-sm leading-relaxed">{hadith.lesson}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
