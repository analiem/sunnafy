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

async function getExplanation(text: string, source: string, lang: string) {
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

Hadith: "${text}"

Reply ONLY in this JSON format (no markdown):
{"explanation": "2-3 sentence explanation here in ${targetLang}", "lesson": "1 practical lesson here in ${targetLang}"}`
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

export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get("lang") || "id";
  const book = BOOKS[Math.floor(Math.random() * BOOKS.length)];
  const source = BOOK_LABELS[book];
  try {
    const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ind-${book}.json`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const hadiths = Array.isArray(data.hadiths) ? data.hadiths : Object.values(data.hadiths);
    if (!hadiths.length) throw new Error();
    const shuffled = [...hadiths].sort(() => Math.random() - 0.5).slice(0, 3);
    const results = await Promise.all((shuffled as any[]).map(async (h) => {
      const text = h.text || h.translation || "";
      const { explanation, lesson } = await getExplanation(text, source, lang);
      return { arabic: h.arabic || h.arab || "", indonesia: text, source, number: h.hadithnumber || h.number || 0, book, explanation, lesson };
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
