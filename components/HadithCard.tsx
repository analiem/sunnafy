"use client";
import { useState } from "react";
import { Share2, BookOpen, ChevronDown, ChevronUp, Sparkles, Bookmark, BookmarkCheck } from "lucide-react";
import type { HadithResult } from "@/app/page";
import { UI_TEXT, type LangCode } from "@/lib/languages";

interface Props { hadith: HadithResult; index: number; lang: LangCode; onBookmark: (h: HadithResult) => void; isBookmarked: boolean; }

const BOOK_BADGE: Record<string, { bg: string; text: string }> = {
  bukhari:  { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
  muslim:   { bg: "bg-blue-50 dark:bg-blue-950",       text: "text-blue-700 dark:text-blue-400" },
  abudawud: { bg: "bg-amber-50 dark:bg-amber-950",     text: "text-amber-700 dark:text-amber-400" },
  tirmidhi: { bg: "bg-purple-50 dark:bg-purple-950",   text: "text-purple-700 dark:text-purple-400" },
  nasai:    { bg: "bg-cyan-50 dark:bg-cyan-950",       text: "text-cyan-700 dark:text-cyan-400" },
  ibnmajah: { bg: "bg-rose-50 dark:bg-rose-950",      text: "text-rose-700 dark:text-rose-400" },
};

const PREVIEW_LENGTH = 120;

export default function HadithCard({ hadith, index, lang, onBookmark, isBookmarked }: Props) {
  const [showFull, setShowFull] = useState(false);
  const [showArabic, setShowArabic] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = UI_TEXT[lang];
  const badge = BOOK_BADGE[hadith.book] || BOOK_BADGE.bukhari;
  const isLong = hadith.indonesia.length > PREVIEW_LENGTH;
  const previewText = isLong && !showFull ? hadith.indonesia.slice(0, PREVIEW_LENGTH) + "..." : hadith.indonesia;

  const handleShare = async () => {
    const text = `📖 ${hadith.source} No. ${hadith.number}\n\n"${hadith.indonesia}"\n\n💡 ${hadith.lesson || ""}\n\n— Sunnafy (sunnafy.vercel.app)`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch {}
  };

  return (
    <div
      className="bg-card border border-default rounded-2xl overflow-hidden hover:border-default-2 transition-all duration-200 animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, opacity: 0, animationFillMode: "forwards" }}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text}`}>
              {hadith.source}
            </span>
            <span className="text-xs text-muted bg-page-2 px-2.5 py-1 rounded-lg">No. {hadith.number}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onBookmark(hadith)}
              title={isBookmarked ? t.bookmarkRemove : t.bookmarkAdd}
              className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? "text-amber-500 bg-amber-50 dark:bg-amber-950" : "text-muted hover:text-secondary hover:bg-page-2"}`}
            >
              {isBookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
            <button onClick={handleShare} className="text-muted hover:text-secondary transition-colors p-1.5 rounded-lg hover:bg-page-2">
              {copied ? <span className="text-xs text-green font-medium">{t.copied}</span> : <Share2 size={14} />}
            </button>
          </div>
        </div>

        {/* AI Explanation — shown first, prominently */}
        {hadith.explanation && (
          <div className="mb-4 p-4 bg-page-2 rounded-xl border border-default">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-green" />
              <span className="text-xs font-semibold text-green uppercase tracking-wider">{t.aiLabel}</span>
            </div>
            <p className="text-primary text-sm leading-relaxed">{hadith.explanation}</p>
          </div>
        )}

        {/* Lesson */}
        {hadith.lesson && (
          <div className="flex gap-3 p-3.5 bg-green-subtle rounded-xl mb-4">
            <BookOpen size={15} className="text-green shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green uppercase tracking-wider mb-1">{t.lessonLabel}</p>
              <p className="text-primary text-sm leading-relaxed">{hadith.lesson}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-default my-4" />

        {/* Hadith text — hidden by default, toggle to show */}
        <div>
          <p className="text-secondary text-sm leading-relaxed">{previewText}</p>
          {isLong && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors mt-2"
            >
              {showFull ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showFull ? t.hideFull : t.showFull}
            </button>
          )}
        </div>

        {/* Arabic text */}
        {showFull && hadith.arabic && (
          <>
            <button
              onClick={() => setShowArabic(!showArabic)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-secondary transition-colors mt-3"
            >
              {showArabic ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showArabic ? t.hideArabic : t.showArabic}
            </button>
            {showArabic && (
              <div className="mt-3 p-4 bg-gold-subtle rounded-xl border border-default">
                <p className="font-arabic text-gold text-xl text-right leading-loose" dir="rtl">{hadith.arabic}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
