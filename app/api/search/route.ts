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

async function groqCall(prompt: string, system: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return "";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      temperature: 0.4,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return "";
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function getFullResponse(indonesianText: string, source: string, lang: string) {
  const targetLang = LANG_NAMES[lang] || "bahasa Indonesia";
  const isId = lang === "id";

  try {
    // For non-Indonesian: translate hadith text + explain + lesson in one call
    // For Indonesian: just explain + lesson
    const systemPrompt = `You are an Islamic scholar assistant. Always respond ONLY in ${targetLang}. Be concise and accurate.`;

    let userPrompt: string;
    if (isId) {
      userPrompt = `Jelaskan hadis berikut dari ${source} dalam 2-3 kalimat bahasa Indonesia yang mudah dipahami. Berikan 1 pelajaran praktis untuk kehidupan sehari-hari.

Hadis: "${indonesianText}"

Balas HANYA JSON valid, tanpa markdown:
{"explanation":"...","lesson":"...","translation":""}`;
    } else {
      userPrompt = `For this hadith from ${source}, do TWO things in ${targetLang}:
1. Translate the hadith text to ${targetLang}
2. Explain it in 2-3 sentences
3. Give 1 practical lesson for daily life

Hadith (in Indonesian): "${indonesianText}"

Reply ONLY with valid JSON, no markdown:
{"translation":"[hadith translated to ${targetLang}]","explanation":"[2-3 sentence explanation in ${targetLang}]","lesson":"[1 practical lesson in ${targetLang}]"}`;
    }

    const raw = await groqCall(userPrompt, systemPrompt);
    if (!raw) return { explanation: "", lesson: "", translation: "" };
    const clean = raw.replace(/```json|```/g, "").trim();
    // Extract JSON even if there's extra text
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return { explanation: "", lesson: "", translation: "" };
    const parsed = JSON.parse(match[0]);
    return {
      explanation: parsed.explanation || "",
      lesson: parsed.lesson || "",
      translation: parsed.translation || "",
    };
  } catch {
    return { explanation: "", lesson: "", translation: "" };
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
    const { explanation, lesson, translation } = await getFullResponse(m.text, source, lang);
    return {
      arabic: m.arabic || "",
      indonesia: translation && lang !== "id" ? translation : m.text,
      source,
      number: m.number,
      book: m.book,
      explanation,
      lesson,
    };
  }));

  return NextResponse.json({ results });
}
