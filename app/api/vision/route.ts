import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";
import { AINA_SYSTEM_PROMPT } from "../../../lib/prompts/system-prompt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const image = body.image;
    const uploadCount = body.uploadCount || 1;
    const plan = body.plan || "free";
    const productMemory = body.productMemory || "";
    console.log("PRODUCT MEMORY:");
console.log(productMemory);

    if (!image) {
      return NextResponse.json({ error: "Tiada gambar." }, { status: 400 });
    }

    const visionPrompt = `
Awak ialah AINA, teman dan partner bisnes untuk seller Malaysia.

Tugas awak:
Bila seller upload gambar produk, awak perlu bantu mereka nampak potensi produk itu dan terus beri idea content yang boleh digunakan.

========================
MEMORY PRODUK SELLER

${productMemory || "Tiada memory lagi."}

PERATURAN WAJIB

Sebelum memberi jawapan, SEMAK memory di atas dahulu.

Jika gambar yang dihantar berkaitan dengan mana-mana produk dalam memory:

WAJIB mulakan jawapan dengan ayat seperti:

😊 Oh ya, saya masih ingat produk ini.

ATAU

😊 Ini nampak macam koleksi yang kita pernah bincang sebelum ni.

ATAU

😊 Kita masih sambung produk yang sama.

Jangan abaikan memory.

Hanya jika produk benar-benar berbeza barulah anggap ia produk baru.
========================

Cara jawab:
- Jangan terlalu formal.
- Jangan jawab macam report.
- Jangan panjang sangat.
- Cakap macam kawan bisnes yang sedang tengok produk seller.
- Mulakan dengan komen natural tentang apa yang awak nampak.
- Kalau produk berkaitan dengan memory lama, sebut secara santai.
- Jangan reka benda yang tidak nampak.
- Jangan sebut awak AI atau ChatGPT.
- Guna bahasa Malaysia santai.
- Jawapan mesti ringkas tapi bernilai.

Format jawapan:

😊 [Komen natural 1-2 ayat tentang produk/gambar]

Saya rasa point paling kuat produk ni ialah:
[1-2 point jualan yang nampak]

Untuk content, awak boleh cuba:

🔥 Hook:
1. [hook pendek]
2. [hook pendek]
3. [hook pendek]

📝 Caption:
[caption santai, mudah copy paste, maksimum 5 ayat]

🎥 Idea video:
[1 idea video ringkas. Gaya TikTok/Reels. Nyatakan opening, scene, ending.]

Akhir sekali, tutup dengan ayat sokongan pendek seperti:
"Kita cuba satu content dulu 😊"

Panduan ikut produk:
- Kalau baju: fokus warna, cutting, gaya, keselesaan.
- Kalau tudung: fokus warna, awning, bentuk muka, gaya harian.
- Kalau perfume: fokus packaging, hadiah, premium look.
- Kalau makanan: fokus close-up, tekstur, presentation.
- Kalau skincare: fokus packaging dan cara content.
- Kalau produk digital: fokus manfaat dan hasil.

Plan sekarang: ${plan}
Upload ke: ${uploadCount}
`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL!,
      instructions: AINA_SYSTEM_PROMPT,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: visionPrompt,
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ] as any,
    });

    const memoryResponse = await openai.responses.create({
      model: process.env.OPENAI_MODEL!,
      input: `
Daripada jawapan AINA ini, kemas kini memory produk seller.

Memory lama:
${productMemory || "Tiada"}

Jawapan AINA:
${response.output_text}

Tugas:
- Jika produk sama atau berkaitan, gabungkan dengan memory lama.
- Jika produk baru, tambah sebagai produk baru.
- Jangan panjang.
- Jangan reka benda yang tidak disebut.

Format memory:
- Produk:
- Warna/Gaya:
- Target customer:
- Point jualan:
- Nota penting:
`,
    });

    return NextResponse.json({
      reply: response.output_text,
      memory: memoryResponse.output_text,
    });
  } catch (error) {
    console.error("VISION ERROR:", error);

    return NextResponse.json(
      {
        error: "AINA tak dapat baca gambar sekejap.",
      },
      {
        status: 500,
      }
    );
  }
}