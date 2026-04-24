"use client";
import { useState, KeyboardEvent } from "react";
import { Search, Shuffle } from "lucide-react";
import { UI_TEXT, type LangCode } from "@/lib/languages";

interface Props { onSearch: (q: string) => void; onRandom: () => void; loading: boolean; lang: LangCode; }

export default function SearchBar({ onSearch, onRandom, loading, lang }: Props) {
  const [value, setValue] = useState("");
  const t = UI_TEXT[lang];

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 p-1.5 bg-card border border-default rounded-2xl shadow-sm focus-within:border-default-2 focus-within:shadow-md transition-all">
        <Search size={16} className="ml-2 shrink-0 text-muted" />
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && value.trim() && onSearch(value.trim())}
          placeholder={t.placeholder}
          disabled={loading}
          className="flex-1 bg-transparent py-2.5 text-primary placeholder-muted text-[15px] outline-none disabled:opacity-50 min-w-0"
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRandom}
            disabled={loading}
            title={t.randomBtn}
            className="p-2.5 rounded-xl text-muted hover:text-secondary hover:bg-page-2 transition-colors disabled:opacity-40"
          >
            <Shuffle size={15} />
          </button>
          <button
            onClick={() => value.trim() && onSearch(value.trim())}
            disabled={loading || !value.trim()}
            className="px-4 py-2.5 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.searchBtn}
          </button>
        </div>
      </div>
      <p className="text-center text-muted text-xs mt-2.5">{t.randomTip}</p>
    </div>
  );
}
