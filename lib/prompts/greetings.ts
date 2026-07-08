export const morningGreetings = [
  "😊 Assalamualaikum.\n\nApa cerita bisnes hari ni?",
  "😊 Assalamualaikum.\n\nJom kita cari rezeki hari ni.",
  "😊 Selamat pagi.\n\nHari ni nak fokus produk apa?",
  "😊 Pagi awak.\n\nDah ready nak buat content hari ni?",
  "😊 Assalamualaikum.\n\nApa target kecil kita hari ni?",
  "😊 Jom mula hari ni perlahan-lahan.\n\nProduk apa kita nak push dulu?",
  "😊 Hari baru, peluang baru.\n\nJom kita susun plan jualan.",
  "😊 Assalamualaikum.\n\nSaya ada dengan awak hari ni.",
  "😊 Dah sarapan?\n\nLepas ni jom fikir content.",
  "😊 Jom kita buat satu benda kecil yang boleh tarik customer hari ni.",
];

export const afternoonGreetings = [
  "😊 Assalamualaikum.\n\nMacam mana jualan setakat ni?",
  "😊 Dah sempat post content hari ni?",
  "😊 Tengah hari ni nak push produk apa?",
  "😊 Ada customer masuk hari ni?",
  "😊 Jom semak sekejap.\n\nApa yang boleh kita improve hari ni?",
  "😊 Kalau tengah buntu, cerita je.\n\nKita fikir sama-sama.",
  "😊 Hari ni content dah jalan belum?",
  "😊 Nak saya bantu fikir ayat promosi?",
  "😊 Ada produk yang perlukan idea baru?",
  "😊 Jom tengok apa peluang jualan petang ni.",
];

export const nightGreetings = [
  "😊 Assalamualaikum.\n\nPenat hari ni?",
  "😊 Macam mana bisnes hari ni?",
  "😊 Sebelum rehat, nak susun plan esok?",
  "😊 Hari ni ada progress apa-apa?",
  "😊 Tak apa kalau hari ni perlahan.\n\nEsok kita cuba lagi.",
  "😊 Nak saya bantu fikir content untuk esok?",
  "😊 Jom review sikit jualan hari ni.",
  "😊 Ada customer yang belum follow up?",
  "😊 Malam ni kita susun strategi sikit?",
  "😊 Rehat pun penting.\n\nTapi kalau nak fikir bisnes, saya ada.",
];

export function getGreeting() {
  const hour = new Date().getHours();

  let list: string[];

  if (hour >= 5 && hour < 12) {
    list = morningGreetings;
  } else if (hour >= 12 && hour < 18) {
    list = afternoonGreetings;
  } else {
    list = nightGreetings;
  }

  return list[Math.floor(Math.random() * list.length)];
}