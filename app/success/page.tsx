"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PaymentStatus = "checking" | "paid" | "pending";

export default function SuccessPage() {
  const [status, setStatus] = useState<PaymentStatus>("checking");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const ref = params.get("ref");
    const statusId = params.get("status_id");
    const billCode = params.get("billcode");

    async function confirmPayment() {
      if (!ref || statusId !== "1") {
        setStatus("pending");
        return;
      }

      try {
        const response = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ref,
            billCode,
          }),
        });

        const data = await response.json();

        if (data?.paid && data?.plan) {
          localStorage.setItem("aina_plan", data.plan);
          localStorage.setItem("aina_upload_count", "0");
          localStorage.setItem("aina_payment_unlocked", data.plan);
          setStatus("paid");
          return;
        }

        setStatus("pending");
      } catch (error) {
        console.error(error);
        setStatus("pending");
      }
    }

    confirmPayment();
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
        <div style={{ fontSize: 44, marginBottom: 12 }}>
          {status === "paid" ? "✅" : status === "checking" ? "⏳" : "⚠️"}
        </div>

        <h1 style={{ fontSize: 22, marginBottom: 10, color: "#1F2937" }}>
          {status === "paid"
            ? "Payment berjaya"
            : status === "checking"
            ? "AINA sedang semak bayaran"
            : "Bayaran belum disahkan"}
        </h1>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4B5563" }}>
          {status === "paid"
            ? "Alhamdulillah 😊 Pakej awak dah aktif. Sekarang boleh sambung bersama AINA."
            : status === "checking"
            ? "Sekejap ya. AINA sedang pastikan bayaran awak betul-betul berjaya."
            : "Kalau bayaran belum selesai, sila lengkapkan pembayaran dahulu. Kalau duit sudah ditolak, tunggu sekejap dan cuba refresh halaman ini."}
        </p>

        <Link
          href="/"
          style={{
            display: "block",
            marginTop: 20,
            background: status === "paid" ? "#6D3DF5" : "#9CA3AF",
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