import { NextRequest, NextResponse } from "next/server";

const BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"];
const BOOK_LABELS: Record<string, string> = {
  bukhari: "Shahih Bukhari", muslim: "Shahih Muslim", abudawud: "Sunan Abu Dawud",
  tirmidhi: "Sunan Tirmidzi", nasai: "Sunan An-Nasa'i", ibnmajah: "Sunan Ibnu Majah",
};

const LANG_NAMES: Record<string, string> = {
  id: "bahasa Indonesia", en: "English", ms: "bahasa Melayu", fil: "Filipino",
  ja: "Japanese", zh: "Chinese (Simplified)", ko: "Korean", th: "Thai",
  es: "Spanish", de: "German", fr: "French",
};

async function fetchBookData(book: string) {
  const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ind-${book}.json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

function scoreRelevance(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const words = query.toLowerCase().split(/\s+/);
  let score = 0;
  for (const word of words) {
    if (word.length < 2) continue;
    const count = (lowerText.match(new RegExp(word, "g")) || []).length;
    score += count * (lowerText.startsWith(word) ? 2 : 1);
  }
  return score;
}

async function getExplanation(indonesianText: string, source: string, lang: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { explanation: "", lesson: "" };
  const targetLang = LANG_NAMES[lang] || "bahasa Indonesia";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Sunnafy",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        max_tokens: 350,
        messages: [{
          role: "user",
          content: `Give a brief explanation of this hadith from ${source} in 2-3 sentences in ${targetLang}, easy to understand. Then give 1 practical lesson for daily life.

Hadith: "${indonesianText}"

Reply ONLY in this JSON format (no markdown, no extra text):
{"explanation": "2-3 sentence explanation here in ${targetLang}", "lesson": "1 practical lesson here in ${targetLang}"}`
        }],
      }),
    });
    if (!res.ok) return { explanation: "", lesson: "" };
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
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
      for (const hadith of hadiths as any[]) {
        const text: string = hadith.text || hadith.translation || "";
        const score = scoreRelevance(text, query);
        if (score > 0) allMatches.push({ text, arabic: hadith.arabic || hadith.arab || "", number: hadith.hadithnumber || hadith.number || 0, book, score });
      }
    } catch {}
  }));

  allMatches.sort((a, b) => b.score - a.score);
  const top = allMatches.slice(0, 4);

  const results = await Promise.all(top.map(async (match) => {
    const source = BOOK_LABELS[match.book] || match.book;
    const { explanation, lesson } = await getExplanation(match.text, source, lang);
    return { arabic: match.arabic || "", indonesia: match.text, source, number: match.number, book: match.book, explanation, lesson };
  }));

  return NextResponse.json({ results });
}
