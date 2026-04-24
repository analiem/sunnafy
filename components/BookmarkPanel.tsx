"use client";
import { X, BookmarkCheck, Trash2 } from "lucide-react";
import type { HadithResult } from "@/app/page";
import { UI_TEXT, type LangCode } from "@/lib/languages";

const BOOK_BADGE: Record<string, { bg: string; text: string }> = {
  bukhari:  { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
  muslim:   { bg: "bg-blue-50 dark:bg-blue-950",       text: "text-blue-700 dark:text-blue-400" },
  abudawud: { bg: "bg-amber-50 dark:bg-amber-950",     text: "text-amber-700 dark:text-amber-400" },
  tirmidhi: { bg: "bg-purple-50 dark:bg-purple-950",   text: "text-purple-700 dark:text-purple-400" },
  nasai:    { bg: "bg-cyan-50 dark:bg-cyan-950",       text: "text-cyan-700 dark:text-cyan-400" },
  ibnmajah: { bg: "bg-rose-50 dark:bg-rose-950",      text: "text-rose-700 dark:text-rose-400" },
};

interface Props {
  bookmarks: HadithResult[];
  lang: LangCode;
  onClose: () => void;
  onRemove: (key: string) => void;
}

export default function BookmarkPanel({ bookmarks, lang, onClose, onRemove }: Props) {
  const t = UI_TEXT[lang];
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="w-full max-w-sm bg-card border-l border-default flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-default">
          <div className="flex items-center gap-2">
            <BookmarkCheck size={18} className="text-amber-500" />
            <h2 className="font-semibold text-primary">{t.bookmarksTitle}</h2>
            <span className="text-xs bg-page-2 text-muted px-2 py-0.5 rounded-full">{bookmarks.length}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-page-2 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarks.length === 0 ? (
            <p className="text-center text-muted text-sm mt-8">{t.bookmarksEmpty}</p>
          ) : (
            bookmarks.map((h, i) => {
              const key = `${h.book}-${h.number}`;
              const badge = BOOK_BADGE[h.book] || BOOK_BADGE.bukhari;
              return (
                <div key={i} className="p-4 bg-page-2 rounded-xl border border-default">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>{h.source}</span>
                      <span className="text-xs text-muted">No. {h.number}</span>
                    </div>
                    <button onClick={() => onRemove(key)} className="text-muted hover:text-red-500 transition-colors p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {h.lesson && <p className="text-xs text-primary leading-relaxed">{h.lesson}</p>}
                  <p className="text-xs text-muted mt-1 line-clamp-2">{h.indonesia.slice(0, 100)}...</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
