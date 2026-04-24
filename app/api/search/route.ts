import { NextRequest, NextResponse } from "next/server";

const BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"];
const BOOK_LABELS: Record<string, string> = {
  bukhari: "Shahih Bukhari", muslim: "Shahih Muslim", abudawud: "Sunan Abu Dawud",
  tirmidhi: "Sunan Tirmidzi", nasai: "Sunan An-Nasa'i", ibnmajah: "Sunan Ibnu Majah",
};
const LANG_NAMES: Record<string, string> = {
  id: "bahasa Indonesia", en: "English", ms: "bahasa Melayu", fil: "Filipino",
  ja: "Japanese", zh: "Chinese Simplified", ko: "Korean", th: "Thai",
  es: "Spanish", de: "German", fr: "French",
};

async function fetchBookData(book: string) {
  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ind-${book}.json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

function scoreRelevance(text: string, query: string): number {
  const lower = text.toLowerCase();
  const words = query.toLowerCase().split(/\s+/);
  let score = 0;
  for (const w of words) {
    if (w.length < 2) continue;
    const hits = (lower.match(new RegExp(w, "g")) || []).length;
    score += hits * (lower.startsWith(w) ? 2 : 1);
  }
  return score;
}

async function getExplanation(text: string, source: string, lang: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { explanation: "", lesson: "" };
  const targetLang = LANG_NAMES[lang] || "bahasa Indonesia";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        temperature: 0.5,
        messages: [{
          role: "system",
          content: `You are an Islamic scholar assistant. Always respond in ${targetLang}. Be concise and clear.`,
        }, {
          role: "user",
          content: `Explain this hadith from ${source} in 2-3 sentences in ${targetLang}. Then give 1 short practical lesson for daily life.

Hadith: "${text}"

Respond ONLY with valid JSON, no markdown:
{"explanation":"...","lesson":"..."}`,
        }],
      }),
    });

    if (!res.ok) return { explanation: "", lesson: "" };
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return { explanation: parsed.explanation || "", lesson: parsed.lesson || "" };
  } catch {
    return { explanation: "", lesson: "" };
  }
}

export async function POST(req: NextRequest) {
  const { query, lang = "id" } = await req.json();
  if (!query?.trim()) return NextResponse.json({ results: [] });

  const allMatches: Array<{ text: string; arabic?: string; number: number; book: string; score: number }> = [];

  await Promise.allSettled(BOOKS.map(async (book) => {
    try {
      const data = await fetchBookData(book);
      if (!data?.hadiths) return;
      const hadiths = Array.isArray(data.hadiths) ? data.hadiths : Object.values(data.hadiths);
      for (const h of hadiths as any[]) {
        const text: string = h.text || h.translation || "";
        const score = scoreRelevance(text, query);
        if (score > 0) allMatches.push({ text, arabic: h.arabic || h.arab || "", number: h.hadithnumber || h.number || 0, book, score });
      }
    } catch {}
  }));

  allMatches.sort((a, b) => b.score - a.score);
  const top = allMatches.slice(0, 4);

  const results = await Promise.all(top.map(async (m) => {
    const source = BOOK_LABELS[m.book] || m.book;
    const { explanation, lesson } = await getExplanation(m.text, source, lang);
    return { arabic: m.arabic || "", indonesia: m.text, source, number: m.number, book: m.book, explanation, lesson };
  }));

  return NextResponse.json({ results });
}
