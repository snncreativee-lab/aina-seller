"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Plan = "starter" | "partner";

export default function SuccessPage() {
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const paidPlan = params.get("plan") as Plan | null;
    const statusId = params.get("status_id");
    const ref = params.get("ref");
    const billCode = params.get("billcode");

    if (paidPlan !== "starter" && paidPlan !== "partner") return;

    localStorage.setItem("aina_plan", paidPlan);
    localStorage.setItem("aina_upload_count", "0");
    localStorage.setItem("aina_payment_unlocked", paidPlan);
    setPlan(paidPlan);

    if (statusId === "1" && ref) {
      fetch("/api/payment/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref,
          plan: paidPlan,
          billCode,
        }),
      });
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F4F0FF 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          border: "1px solid #E8DEFF",
          borderRadius: 24,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(109, 61, 245, 0.15)",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>

        <h1 style={{ fontSize: 22, marginBottom: 10, color: "#1F2937" }}>
          Payment berjaya
        </h1>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4B5563" }}>
          {plan === "partner"
            ? "Alhamdulillah 😊 AINA Partner dah aktif. Sekarang awak boleh upload gambar produk tanpa had untuk bulan ini."
            : "Alhamdulillah 😊 Mood RM4.90 dah aktif. Sekarang awak boleh sambung upload 6 gambar produk lagi."}
        </p>

        <Link
          href="/"
          style={{
            display: "block",
            marginTop: 20,
            background: "#6D3DF5",
            color: "#FFFFFF",
            textDecoration: "none",
            borderRadius: 999,
            padding: "13px 16px",
            fontWeight: 800,
          }}
        >
          Sambung chat dengan AINA
        </Link>
      </div>
    </main>
  );
}