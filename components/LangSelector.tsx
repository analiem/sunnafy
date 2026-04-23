"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { LANGUAGES, type LangCode } from "@/lib/languages";

interface LangSelectorProps {
  current: LangCode;
  onChange: (lang: LangCode) => void;
}

export default function LangSelector({ current, onChange }: LangSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === current)!;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1a6b3c]/30 bg-[#0c1610] hover:border-[#1a6b3c]/60 transition-all text-sm text-[#7aab88]"
      >
        <Globe size={14} />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-[#0c1610] border border-[#1a6b3c]/30 rounded-xl overflow-hidden shadow-xl z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { onChange(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#1a6b3c]/20 ${
                lang.code === current
                  ? "text-[#4ade80] bg-[#1a6b3c]/10"
                  : "text-[#7aab88]"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
