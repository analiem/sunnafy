import { NextResponse } from "next/server";

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY;

  // Check 1: key exists?
  if (!groqKey) {
    return NextResponse.json({
      status: "❌ GAGAL",
      masalah: "GROQ_API_KEY tidak ditemukan di environment variables Vercel",
      solusi: "Buka Vercel → Settings → Environment Variables → tambah GROQ_API_KEY"
    });
  }

  // Check 2: key format valid?
  if (!groqKey.startsWith("gsk_")) {
    return NextResponse.json({
      status: "❌ GAGAL",
      masalah: "Format API key salah. Harus dimulai dengan gsk_",
      key_prefix: groqKey.substring(0, 8) + "...",
      solusi: "Pastikan copy API key dari console.groq.com dengan benar"
    });
  }

  // Check 3: actually call Groq
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 50,
        messages: [{ role: "user", content: "Balas hanya: OK" }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        status: "❌ GAGAL",
        masalah: "Groq API menolak request",
        http_status: res.status,
        groq_error: data?.error?.message || JSON.stringify(data),
        solusi: res.status === 401 ? "API key salah atau expired. Buat key baru di console.groq.com" : "Cek error di atas"
      });
    }

    return NextResponse.json({
      status: "✅ BERHASIL",
      pesan: "Groq API berjalan normal!",
      model: data.model,
      response: data.choices?.[0]?.message?.content,
      key_prefix: groqKey.substring(0, 8) + "...",
    });

  } catch (err: any) {
    return NextResponse.json({
      status: "❌ GAGAL",
      masalah: "Tidak bisa menghubungi Groq API",
      error: err?.message,
      solusi: "Kemungkinan masalah jaringan di Vercel atau URL Groq salah"
    });
  }
}
