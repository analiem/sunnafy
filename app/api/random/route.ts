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
    const systemPrompt = `You are an Islamic scholar assistant. Always respond ONLY in ${targetLang}. Be concise and accurate.`;
    const userPrompt = isId
      ? `Jelaskan hadis dari ${source} dalam 2-3 kalimat bahasa Indonesia. Berikan 1 pelajaran praktis.\n\nHadis: "${indonesianText}"\n\nBalas HANYA JSON:\n{"explanation":"...","lesson":"...","translation":""}`
      : `For this hadith from ${source}, translate to ${targetLang}, explain in 2-3 sentences, and give 1 practical lesson.\n\nHadith (Indonesian): "${indonesianText}"\n\nReply ONLY JSON:\n{"translation":"...","explanation":"...","lesson":"..."}`;

    const raw = await groqCall(userPrompt, systemPrompt);
    if (!raw) return { explanation: "", lesson: "", translation: "" };
    const match = raw.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
    if (!match) return { explanation: "", lesson: "", translation: "" };
    const parsed = JSON.parse(match[0]);
    return { explanation: parsed.explanation || "", lesson: parsed.lesson || "", translation: parsed.translation || "" };
  } catch {
    return { explanation: "", lesson: "", translation: "" };
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
    const shuffled = [...hadiths].sort(() => Math.random() - 0.5).slice(0, 3);
    const results = await Promise.all((shuffled as any[]).map(async (h) => {
      const text = h.text || h.translation || "";
      const { explanation, lesson, translation } = await getFullResponse(text, source, lang);
      return {
        arabic: h.arabic || h.arab || "",
        indonesia: translation && lang !== "id" ? translation : text,
        source, number: h.hadithnumber || h.number || 0, book, explanation, lesson,
      };
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
