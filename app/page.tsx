"use client";
import { useState, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import HadithCard from "@/components/HadithCard";
import LangSelector from "@/components/LangSelector";
import ThemeToggle from "@/components/ThemeToggle";
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

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setError(""); setResults([]); setQuery(q);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, lang }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results || []);
    } catch { setError("Terjadi kesalahan. Silakan coba lagi."); }
    finally { setLoading(false); }
  }, [lang]);

  const handleRandom = useCallback(async () => {
    setLoading(true); setSearched(true); setError(""); setResults([]); setQuery("—");
    try {
      const res = await fetch(`/api/random?lang=${lang}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results || []);
    } catch { setError("Terjadi kesalahan. Silakan coba lagi."); }
    finally { setLoading(false); }
  }, [lang]);

  return (
    <div className="min-h-screen bg-page">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-page border-b border-default backdrop-blur-sm bg-opacity-90">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">☽</span>
            <span className="font-bold text-primary tracking-tight">Sunnahfy</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LangSelector current={lang} onChange={setLang} />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green bg-green-subtle px-3 py-1.5 rounded-full mb-5">
            ✦ {t.tagline}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 tracking-tight">
            Sunnah<span className="text-green">fy</span>
          </h1>
          <p className="text-secondary text-base max-w-sm mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Search */}
        <SearchBar onSearch={handleSearch} onRandom={handleRandom} loading={loading} lang={lang} />

        {/* Suggested topics */}
        {!searched && (
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-muted text-xs mb-3 uppercase tracking-widest">{t.suggestedTopics}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {t.topics.map(topic => (
                <button
                  key={topic}
                  onClick={() => handleSearch(topic)}
                  className="px-3.5 py-1.5 rounded-full border border-default text-secondary text-sm hover:bg-page-2 hover:border-default-2 transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-default border-t-green animate-spin" />
            <p className="text-muted text-sm">{t.loading}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* No results */}
        {searched && !loading && !error && results.length === 0 && (
          <div className="mt-16 text-center">
            <BookOpen size={32} className="text-muted mx-auto mb-3" />
            <p className="text-secondary text-sm">{t.noResult}</p>
            <p className="text-muted text-xs mt-1">{t.noResultSub}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !loading && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-border" style={{background:"var(--border)"}} />
              <p className="text-muted text-xs shrink-0">{t.foundLabel(results.length, query)}</p>
              <div className="h-px flex-1 bg-border" style={{background:"var(--border)"}} />
            </div>
            <div className="space-y-4">
              {results.map((hadith, i) => (
                <HadithCard key={i} hadith={hadith} index={i} lang={lang} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-default text-center">
          <p className="text-xs font-semibold text-muted mb-1">Sunnahfy</p>
          <p className="text-xs text-muted">{t.footer}</p>
        </footer>
      </main>
    </div>
  );
}
