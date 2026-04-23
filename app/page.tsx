"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import HadithCard from "@/components/HadithCard";
import LangSelector from "@/components/LangSelector";
import { UI_TEXT, type LangCode } from "@/lib/languages";
import { BookOpen } from "lucide-react";

export interface HadithResult {
  arabic: string;
  indonesia: string;
  source: string;
  number: number;
  book: string;
  explanation?: string;
  lesson?: string;
}

export default function Home() {
  const [lang, setLang] = useState<LangCode>("id");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HadithResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const t = UI_TEXT[lang];

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setError("");
    setResults([]);
    setQuery(searchQuery);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, lang }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  const handleRandom = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    setError("");
    setResults([]);
    setQuery("—");
    try {
      const res = await fetch(`/api/random?lang=${lang}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  return (
    <main className="min-h-screen bg-[#0a0f0d]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1a6b3c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c9a84c]/8 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a84c' fill-opacity='1'%3E%3Cpath d='M30 0l8.66 5v10L30 20l-8.66-5V5L30 0zm0 40l8.66 5v10L30 60l-8.66-5V45L30 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>

      <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-[#c9a84c] text-xl">☽</span>
          <span className="text-white font-bold text-lg tracking-tight">Sunnafy</span>
        </div>
        <LangSelector current={lang} onChange={setLang} />
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-[#1a6b3c]/20 border border-[#1a6b3c]/40 text-[#4ade80] text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            ✦ {t.tagline}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="text-white">Sunnah</span>
            <span className="text-transparent bg-clip-text ml-1" style={{ backgroundImage: "linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%)" }}>fy</span>
          </h1>
          <p className="text-[#6b8f7a] text-lg max-w-lg mx-auto leading-relaxed">{t.subtitle}</p>
          <div className="mt-5 text-[#c9a84c]/25 text-4xl">﷽</div>
        </div>

        <SearchBar onSearch={handleSearch} onRandom={handleRandom} loading={loading} lang={lang} />

        {!searched && (
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-[#4a6b58] text-sm mb-3 tracking-wide">{t.suggestedTopics}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {t.topics.map((topic) => (
                <button key={topic} onClick={() => handleSearch(topic)} className="px-4 py-1.5 rounded-full border border-[#1a6b3c]/40 text-[#4ade80]/70 text-sm hover:bg-[#1a6b3c]/20 hover:text-[#4ade80] transition-all duration-200">
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-16 flex flex-col items-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#1a6b3c]/20" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-t-2 border-[#4ade80] animate-spin" />
            </div>
            <p className="text-[#4a6b58] text-sm">{t.loading}</p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-900/20 border border-red-800/40 rounded-xl text-red-400 text-center text-sm">{error}</div>
        )}

        {searched && !loading && !error && results.length === 0 && (
          <div className="mt-16 text-center">
            <BookOpen size={40} className="text-[#1a6b3c]/40 mx-auto mb-3" />
            <p className="text-[#4a6b58]">{t.noResult}</p>
            <p className="text-[#4a6b58] text-sm mt-1">{t.noResultSub}</p>
          </div>
        )}

        {results.length > 0 && !loading && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-[#1a6b3c]/20" />
              <p className="text-[#4a6b58] text-sm px-3">{t.foundLabel(results.length, query)}</p>
              <div className="h-px flex-1 bg-[#1a6b3c]/20" />
            </div>
            <div className="space-y-6">
              {results.map((hadith, i) => (
                <HadithCard key={i} hadith={hadith} index={i} lang={lang} />
              ))}
            </div>
          </div>
        )}

        <footer className="mt-20 text-center text-[#2d4a3a] text-xs leading-relaxed">
          <p className="text-[#3a5a48] font-medium mb-1">Sunnafy</p>
          <p>{t.footer}</p>
        </footer>
      </div>
    </main>
  );
}
