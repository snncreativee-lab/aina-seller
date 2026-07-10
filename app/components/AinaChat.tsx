"use client";

import { useEffect, useRef, useState } from "react";

type Plan = "free" | "starter" | "partner";

type Message =
  | {
      id: string;
      from: "aina" | "user";
      type: "text" | "typing";
      text?: string;
    }
  | {
      id: string;
      from: "aina";
      type: "paywall";
      plan: "starter" | "partner";
    };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitReply(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getUploadLimit(plan: Plan) {
  if (plan === "free") return 3;
  if (plan === "starter") return 6;
  return Infinity;
}

const AINA_FLOW_VERSION = "free-3-then-starter-v1";
function getAnonymousUserId() {
  let userId = localStorage.getItem("aina_user_id");

  if (!userId) {
    userId = `user_${crypto.randomUUID()}`;
    localStorage.setItem("aina_user_id", userId);
  }

  return userId;
}
export default function AinaChat() {
  const [plan, setPlan] = useState<Plan>("free");
  const [uploadCount, setUploadCount] = useState(0);
  const [productMemory, setProductMemory] = useState("");
  const [businessMemory, setBusinessMemory] = useState("");
  const [timelineMemory, setTimelineMemory] = useState("");
  const [userId, setUserId] = useState("guest");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      from: "aina",
      type: "text",
      text: "😊 Assalamualaikum.\n\nSaya AINA, teman seller awak.\n\nHari ni kita nak fokus jual produk apa?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memoryLoaded, setMemoryLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const uploadLimit = getUploadLimit(plan);
  const isPartner = plan === "partner";
  console.log("PLAN:", plan, "LIMIT:", uploadLimit);

  useEffect(() => {
  const anonymousId = getAnonymousUserId();
setUserId(anonymousId);
loadChat(anonymousId);
  const savedMemory = localStorage.getItem("aina_product_memory");
  const savedBusinessMemory = localStorage.getItem("aina_business_memory");
  const savedTimelineMemory = localStorage.getItem("aina_timeline_memory");
  const savedPlan = localStorage.getItem("aina_plan");
  const savedUploadCount = localStorage.getItem("aina_upload_count");
  const paymentUnlocked = localStorage.getItem("aina_payment_unlocked");

  if (savedMemory) setProductMemory(savedMemory);
  if (savedBusinessMemory) setBusinessMemory(savedBusinessMemory);
  if (savedTimelineMemory) setTimelineMemory(savedTimelineMemory);

  if (savedPlan === "partner" && paymentUnlocked === "partner") {
    setPlan("partner");
  } else if (
    savedPlan === "starter" &&
    (paymentUnlocked === "starter" || paymentUnlocked === "partner")
  ) {
    setPlan("starter");
  } else {
    setPlan("free");
  }

  if (savedUploadCount) {
    setUploadCount(Number(savedUploadCount));
  } else {
    setUploadCount(0);
  }
  setMemoryLoaded(true);
}, []);

useEffect(() => {
  if (!memoryLoaded) return;

  localStorage.setItem("aina_plan", plan);
  localStorage.setItem("aina_upload_count", String(uploadCount));
}, [memoryLoaded, plan, uploadCount]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function showAinaReply(reply: string) {
    const parts = splitReply(reply);

    for (const part of parts) {
      const typingId = crypto.randomUUID();

      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          from: "aina",
          type: "typing",
        },
      ]);
      

      await wait(700);

      setMessages((prev) =>
        prev
          .filter((msg) => msg.id !== typingId)
          .concat({
            id: crypto.randomUUID(),
            from: "aina",
            type: "text",
            text: part,
          })
      );
      await saveChat("aina", part);

      await wait(250);
    }
  }

  async function readJsonResponse(response: Response) {
    const textResult = await response.text();

    try {
      return JSON.parse(textResult);
    } catch {
      console.error("API bukan JSON:", textResult);
      return null;
    }
  }

  function addPaywall(targetPlan: "starter" | "partner") {
    setMessages((prev) => {
      const alreadyHasPaywall = prev.some(
        (msg) => msg.type === "paywall" && msg.plan === targetPlan
      );

      if (alreadyHasPaywall) return prev;

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          from: "aina",
          type: "paywall",
          plan: targetPlan,
        },
      ];
    });
  }
  async function loadMemoryFromDatabase(phoneId: string) {
  try {
    const response = await fetch("/api/memory/load", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneId,
      }),
    });

    const data = await readJsonResponse(response);

    if (!data?.success || !data?.found) return;

    if (data.profile?.plan) {
      setPlan(data.profile.plan);
      localStorage.setItem("aina_plan", data.profile.plan);
    }

    if (typeof data.profile?.upload_count === "number") {
      setUploadCount(data.profile.upload_count);
      localStorage.setItem(
        "aina_upload_count",
        String(data.profile.upload_count)
      );
    }

    if (data.brain?.product_memory) {
      setProductMemory(data.brain.product_memory);
      localStorage.setItem("aina_product_memory", data.brain.product_memory);
    }

    if (data.brain?.business_memory) {
      setBusinessMemory(data.brain.business_memory);
      localStorage.setItem("aina_business_memory", data.brain.business_memory);
    }

    if (data.brain?.timeline_memory) {
      setTimelineMemory(data.brain.timeline_memory);
      localStorage.setItem("aina_timeline_memory", data.brain.timeline_memory);
    }
  } catch (error) {
    console.error("Load memory error:", error);
  }
}
async function saveMemoryToDatabase(
  nextUploadCount?: number,
  nextProductMemory?: string
) {
  try {
    await fetch("/api/memory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: userId,
        plan,
        uploadCount: nextUploadCount ?? uploadCount,
        productMemory: nextProductMemory ?? productMemory,
        businessMemory,
        timelineMemory,
      }),
    });
  } catch (error) {
    console.error("Save memory error:", error);
  }
}async function saveChat(
  role: "user" | "aina",
  message: string
) {
  try {
    await fetch("/api/chat/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: userId,
        role,
        message,
      }),
    });
  } catch (error) {
    console.error("Save chat error:", error);
  }
}
async function loadChat(phoneId: string) {
  try {
    const response = await fetch("/api/chat/load", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phoneId,
      }),
    });

    const data = await readJsonResponse(response);

    if (!data?.success || !Array.isArray(data.messages)) return;

    if (data.messages.length === 0) return;

    setMessages(
      data.messages.map((msg: any) => ({
        id: crypto.randomUUID(),
        from: msg.role === "user" ? "user" : "aina",
        type: "text",
        text: msg.message,
      }))
    );
  } catch (error) {
    console.error("Load chat error:", error);
  }
}
  async function sendMessage() {
  if (!input.trim() || loading) return;

  await saveMemoryToDatabase(uploadCount, productMemory);

  const text = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        from: "user",
        type: "text",
        text,
      },
    ]);
    await saveChat("user", text);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          productMemory,
          businessMemory,
          timelineMemory,
          plan,
        }),
      });

      const data = await readJsonResponse(response);

      if (data?.businessMemory) {
        setBusinessMemory(data.businessMemory);
        localStorage.setItem("aina_business_memory", data.businessMemory);
      }

      if (data?.timelineMemory) {
        setTimelineMemory(data.timelineMemory);
        localStorage.setItem("aina_timeline_memory", data.timelineMemory);
      }
await saveMemoryToDatabase();
      await showAinaReply(
  data?.reply ||
  data?.error ||
  "AINA tersangkut sekejap 😊"
);
    } catch (error) {
      console.error(error);

      await showAinaReply(
`🙏 Maaf ya.

AINA sedang menerima sambutan yang sangat tinggi sekarang.

Kami sedang menyediakan semula kapasiti untuk semua pengguna.

Sila cuba lagi dalam beberapa minit.

Terima kasih atas kesabaran awak. 💜`
);
    } finally {
      setLoading(false);
    }
  }

  async function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  function handleCameraClick() {
    if (loading) return;

    if (!isPartner && uploadCount >= uploadLimit) {
      addPaywall(plan === "free" ? "starter" : "partner");
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleImageUpload(file: File) {
    if (loading) return;

    if (!isPartner && uploadCount >= uploadLimit) {
      addPaywall(plan === "free" ? "starter" : "partner");
      return;
    }

    const nextUploadCount = uploadCount + 1;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        from: "user",
        type: "text",
        text: "📷 Upload gambar produk",
      },
    ]);

    setUploadCount(nextUploadCount);
    setLoading(true);

    try {
      await showAinaReply(
        "😊 Gambar dah sampai.\n\nBagi saya tengok sekejap ya..."
      );

      const imageBase64 = await fileToBase64(file);

      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imageBase64,
          plan,
          uploadCount: nextUploadCount,
          productMemory,
        }),
      });
await saveMemoryToDatabase(nextUploadCount);
      const data = await readJsonResponse(response);

      if (data?.memory) {
  setProductMemory(data.memory);
  localStorage.setItem("aina_product_memory", data.memory);
  await saveMemoryToDatabase(nextUploadCount, data.memory);
} else {
  await saveMemoryToDatabase(nextUploadCount);
}

      await showAinaReply(
        data?.reply ||
          "👀 Saya nampak produk awak menarik.\n\n🔥 Hook:\n1. Produk ni nampak kemas dan mudah dijual.\n2. Sesuai untuk orang yang suka gaya simple.\n3. Nampak cantik untuk content harian.\n\n📝 Caption:\nProduk ni sesuai untuk awak yang nak sesuatu yang simple, kemas dan senang dijual 😊\n\n🎥 Idea video:\nBuat video close-up produk, tunjuk detail paling menarik, lepas tu letak ayat ringkas untuk ajak orang tanya."
      );

      if (plan === "free" && nextUploadCount >= 3) {
        return;
      }

      if (plan === "starter" && nextUploadCount === 7) {
  addPaywall("partner");
  return;
}
    } catch (error) {
      console.error(error);

      await showAinaReply(
        "Maaf 😊\n\nAINA tak dapat baca gambar tu sekejap.\n\nCuba upload sekali lagi ya."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openPayment(nextPlan: "starter" | "partner") {
    try {
      setLoading(true);

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  plan: nextPlan,
  phone: userId,
}),
      });

      const data = await readJsonResponse(response);

      if (!data?.success) {
        await showAinaReply(
          "😅 Maaf, link bayaran tersangkut sekejap.\n\nCuba tekan sekali lagi ya."
        );
        return;
      }

      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error(error);

      await showAinaReply(
        "😅 Maaf, link bayaran tersangkut sekejap.\n\nCuba tekan sekali lagi ya."
      );
    } finally {
      setLoading(false);
    }
  }

  function TypingBubble() {
    return (
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <span className="typing-dot"></span>
        <span className="typing-dot dot-2"></span>
        <span className="typing-dot dot-3"></span>

        <style jsx>{`
          .typing-dot {
            width: 7px;
            height: 7px;
            background: #6d3df5;
            border-radius: 50%;
            display: inline-block;
            animation: bounce 0.9s infinite ease-in-out;
          }

          .dot-2 {
            animation-delay: 0.15s;
          }

          .dot-3 {
            animation-delay: 0.3s;
          }

          @keyframes bounce {
            0%,
            80%,
            100% {
              transform: translateY(0);
              opacity: 0.35;
            }

            40% {
              transform: translateY(-5px);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  function PaywallCard({ targetPlan }: { targetPlan: "starter" | "partner" }) {
    const isStarter = targetPlan === "starter";

    return (
      <div
        style={{
          maxWidth: "92%",
          background: isStarter ? "#FFF7DD" : "#F4F0FF",
          border: isStarter ? "1px solid #F5C542" : "1px solid #C7B8FF",
          borderRadius: 18,
          padding: 14,
          boxShadow: "0 4px 14px rgba(109, 61, 245, 0.1)",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          {isStarter
            ? "😊 Seronok tengok produk awak."
            : "🤝 Jom jadi Partner AINA."}
        </div>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            whiteSpace: "pre-line",
            color: "#1F2937",
            marginBottom: 12,
          }}
        >
          {isStarter
            ? "Seronok dapat tengok produk awak hari ni 😊\n\nSaya rasa saya dah mula faham produk awak.\n\nSaya sebenarnya masih ada banyak lagi idea content yang saya nak kongsi.\n\nTapi dalam mode percuma, saya cuma boleh semak 3 gambar dulu.\n\nKalau awak nak saya terus teman awak cari idea content, jom sambung sama-sama."
            : "Sepanjang kita borak ni, saya dah mula kenal produk awak 😊\n\nKalau awak nak, saya boleh terus jadi partner bisnes awak.\n\nSaya bantu ingat produk, fikir content, cari hook, buat caption dan teman awak setiap hari.\n\nJom jadikan AINA partner awak."}
        </div>

        <button
          type="button"
          onClick={() => openPayment(targetPlan)}
          style={{
            width: "100%",
            border: "none",
            background: isStarter ? "#D99A00" : "#6D3DF5",
            color: "#FFFFFF",
            borderRadius: 14,
            padding: "12px",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {isStarter
            ? "❤️ Sambung Bersama AINA — RM4.90"
            : "🤝 Jadikan AINA Partner — RM19.90"}
        </button>
      </div>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F4F0FF 100%)",
        display: "flex",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100vh",
          background: "#FAFAFC",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 30px rgba(109, 61, 245, 0.15)",
        }}
      >
        <div
          style={{
            background: "#6D3DF5",
            color: "#FFFFFF",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#FFFFFF",
              color: "#6D3DF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            A
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>AINA</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              Teman Seller Malaysia • Online
            </div>
          </div>

          <div style={{ fontSize: 20 }}>💜</div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#6B7280",
            marginTop: 14,
            flexShrink: 0,
          }}
        >
          Hari ini
        </div>

        <div
          style={{
            flex: 1,
            padding: "14px 14px 16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {messages.map((msg) => {
            if (msg.type === "paywall") {
              return (
                <div
                  key={msg.id}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <PaywallCard targetPlan={msg.plan} />
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.from === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    background: msg.from === "user" ? "#EADFFF" : "#FFFFFF",
                    color: "#1F2937",
                    border: "1px solid #E8DEFF",
                    borderRadius:
                      msg.from === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    padding: "12px 14px",
                    fontSize: 14,
                    lineHeight: 1.55,
                    whiteSpace: "pre-line",
                    boxShadow: "0 2px 8px rgba(109, 61, 245, 0.08)",
                  }}
                >
                  {msg.type === "typing" ? <TypingBubble /> : msg.text}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) handleImageUpload(file);

            e.target.value = "";
          }}
        />

        <div
          style={{
            padding: 12,
            background: "#FFFFFF",
            borderTop: "1px solid #E8DEFF",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={loading}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "none",
              background: "#F4F0FF",
              color: "#6D3DF5",
              fontSize: 20,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            📷
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Nak borak apa dengan AINA hari ni? 😊"
            style={{
              flex: 1,
              border: "1px solid #E8DEFF",
              background: "#FFFFFF",
              borderRadius: 999,
              padding: "12px 14px",
              outline: "none",
              fontSize: 14,
              color: "#1F2937",
            }}
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "none",
              background: loading ? "#B8A8FF" : "#6D3DF5",
              color: "#FFFFFF",
              fontSize: 18,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </main>
  );
}