import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Ambil API key dari environment variable secara aman di server-side
const apiKey = process.env.GEMINI_API_KEY || "";

let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Gagal menginisialisasi GoogleGenAI SDK:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { judul, isi, kategori } = await req.json();

    if (!isi || isi.trim().length < 10) {
      return NextResponse.json(
        { error: "Isi tulisan terlalu pendek untuk dievaluasi oleh AI." },
        { status: 400 }
      );
    }

    if (!ai) {
      // Fallback jika API key belum dikonfigurasi oleh user di secret panel AI Studio
      return NextResponse.json({
        text: `### 🌟 Apresiasi AI (Fallback Mode - Tanpa API Key)
Hebat sekali! Tulisanmu yang berjudul **"${judul || "Tanpa Judul"}"** menunjukkan usaha kreatif yang luar biasa. 

**Analisis Struktur:**
- Judul menarik dan sudah mencerminkan isi tulisan.
- Pembuka paragraf mengalir secara natural dan enak dibaca.
- Panjang tulisan sekitar **${isi.trim().split(/\s+/).length} kata** — ini adalah ukuran yang sangat ideal untuk kategori **${kategori || "Literasi"}**.

**Saran Pengembangan:**
- Tambahkan beberapa kalimat pelengkap di bagian klimaks cerita atau data pendukung jika berupa esai/laporan untuk memperkuat tulisanmu.
- Gunakan tanda baca secara lebih konsisten, terutama tanda titik (.) dan koma (,) sebelum tanda petik penutup.

*Catatan: Segera setelah kunci API Gemini dikonfigurasi, evaluasi mendalam yang didukung oleh Gemini AI akan diaktifkan secara otomatis.*`
      });
    }

    const prompt = `Anda adalah seorang "Asisten Literasi AI" yang ramah, memotivasi, dan profesional untuk siswa-siswi tingkat Aliyah di MA NU 01 Banyuputih Batang. 
Tugas Anda adalah memberikan evaluasi yang konstruktif dan penuh semangat terhadap tulisan siswa berikut:

Judul Karya: "${judul || "Tanpa Judul"}"
Kategori Karya: "${kategori || "Umum"}"
Isi Karya:
"""
${isi}
"""

Berikan respons terstruktur dalam format Markdown dengan bahasa Indonesia yang santun, bersahabat, dan memotivasi siswa. Respons Anda harus mencakup:
1. **🌟 Apresiasi Hangat**: Berikan pujian yang tulus atas usaha siswa dalam menulis karya ini. Sebutkan bagian yang paling Anda sukai (misal diksi, suasana, atau argumennya).
2. **📝 Analisis Struktur & Gaya Bahasa**: Berikan ulasan singkat mengenai tata bahasa, alur, penggunaan tanda baca, dan efektivitas paragraf siswa (sesuai kategori karyanya).
3. **💡 Saran Perbaikan Kreatif**: Berikan 2 atau 3 saran spesifik dan praktis untuk membuat karya tersebut jauh lebih hidup, dramatis, atau kuat (misal: "tambahkan deskripsi sensorik di paragraf 2", atau "ganti kata berulang ini dengan sinonimnya").
4. **🔥 Kalimat Penyemangat**: Kalimat penutup yang membakar semangat literasi siswa agar terus menulis karya-karya hebat lainnya.

Jangan terlalu keras dalam menilai, fokuslah pada pengembangan bakat menulis siswa! Gunakan sapaan yang akrab seperti "anak cerdas" atau "sahabat literasi".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Menggunakan model standar yang cepat dan andal
      contents: prompt,
    });

    const resultText = response.text || "Tidak ada respons dari AI.";

    return NextResponse.json({ text: resultText });
  } catch (error: any) {
    console.error("Error pada API route evaluasi AI:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memproses evaluasi AI: " + error.message },
      { status: 500 }
    );
  }
}
