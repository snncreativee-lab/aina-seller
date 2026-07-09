import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
import { AINA_SYSTEM_PROMPT } from "../../../lib/prompts/system-prompt";
import { BUSINESS_MEMORY_PROMPT } from "../../../lib/prompts/business-memory";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message || "";
    const productMemory = body.productMemory || "";
    const businessMemory = body.businessMemory || "";
    const plan = body.plan || "free";

    if (!message) {
      return NextResponse.json(
        { error: "Mesej kosong." },
        { status: 400 }
      );
    }

    const memoryContext = `
Memory produk seller:
${productMemory || "Belum ada memory produk."}

Memory bisnes seller:
${businessMemory || "Belum ada memory bisnes."}

Plan user sekarang: ${plan}

Arahan penting:
- Kalau memory sudah ada produk seller, JANGAN tanya semula "awak jual produk apa?"
- Kalau seller tanya idea content, terus kaitkan dengan produk dalam memory.
- Kalau seller cerita target customer, platform, harga, masalah atau matlamat, ingat maklumat itu.
- Kalau seller tanya masalah jualan, bantu sebagai partner bisnes.
- Jawapan mesti santai, ringkas, mesra dan macam kawan seller Malaysia.
- Jangan jawab panjang sangat.
- Jangan sebut awak AI atau ChatGPT.

Discovery Mode AINA:

AINA perlu kenal bisnes seller sedikit demi sedikit.

Maklumat penting yang AINA perlu kumpul:
1. Produk seller
2. Platform jualan
3. Target customer
4. Masalah utama seller
5. Matlamat seller

Peraturan Discovery:
- Tanya SATU soalan sahaja dalam satu masa.
- Jangan bagi borang.
- Jangan tanya banyak soalan sekali gus.
- Kalau memory sudah ada jawapan, jangan tanya semula.
- Kalau seller tanya sesuatu, jawab dulu secara ringkas, kemudian tanya satu soalan discovery jika sesuai.
- Soalan mesti santai macam kawan.
- Jangan paksa.
- Jangan panjang.

Contoh soalan:
“Awak banyak jual dekat TikTok ke WhatsApp sekarang? 😊”

“Customer awak biasanya siapa? Guru, student, mak-mak, atau team sukan?”

“Sekarang cabaran paling besar awak apa? View, closing, content, atau modal?”
`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL!,
      instructions: AINA_SYSTEM_PROMPT,
      input: `
${memoryContext}

Mesej seller:
${message}
      `.trim(),
    });

    const memoryResponse = await openai.responses.create({
      model: process.env.OPENAI_MODEL!,
      input: `
${BUSINESS_MEMORY_PROMPT}

Memory lama:
${businessMemory || "Tiada"}

Memory produk:
${productMemory || "Tiada"}

Mesej seller:
${message}

Jawapan AINA:
${response.output_text}

Kemas kini memory bisnes seller.
      `.trim(),
    });

    return NextResponse.json({
      reply: response.output_text,
      businessMemory: memoryResponse.output_text,
    });
  } catch (error) {
    console.error("GENERATE ERROR:", error);

    return NextResponse.json(
      {
        error: "AINA tersangkut sekejap.",
      },
      {
        status: 500,
      }
    );
  }
}