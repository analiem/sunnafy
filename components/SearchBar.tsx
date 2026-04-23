"use client";

import { useState, KeyboardEvent } from "react";
import { Search, Shuffle } from "lucide-react";
import type { LangCode } from "@/lib/languages";
import { UI_TEXT } from "@/lib/languages";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onRandom: () => void;
  loading: boolean;
  lang: LangCode;
}

export default function SearchBar({ onSearch, onRandom, loading, lang }: SearchBarProps) {
  const [value, setValue] = useState("");
  const t = UI_TEXT[lang];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) onSearch(value.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1a6b3c]/50 to-[#c9a84c]/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center bg-[#0f1a14] border border-[#1a6b3c]/30 rounded-2xl overflow-hidden focus-within:border-[#1a6b3c]/70 transition-colors duration-300">
          <Search size={18} className="absolute left-5 text-[#2d5c40] pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            disabled={loading}
            className="flex-1 bg-transparent py-5 text-[#c8dcd0] placeholder-[#2d5c40] text-base outline-none disabled:opacity-50"
            style={{ paddingLeft: "3.25rem", paddingRight: "0.5rem" }}
          />
          <div className="flex items-center gap-2 pr-3">
            <button
              onClick={onRandom}
              disabled={loading}
              title={t.randomBtn}
              className="p-2.5 rounded-xl text-[#2d5c40] hover:text-[#4ade80] hover:bg-[#1a6b3c]/20 transition-all duration-200 disabled:opacity-50"
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={() => value.trim() && onSearch(value.trim())}
              disabled={loading || !value.trim()}
              className="px-5 py-2.5 bg-[#1a6b3c] hover:bg-[#22854b] text-white text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {t.searchBtn}
            </button>
          </div>
        </div>
      </div>
      <p className="text-center text-[#2d4a3a] text-xs mt-3">{t.randomTip}</p>
    </div>
  );
}
