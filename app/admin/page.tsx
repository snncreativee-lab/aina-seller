"use client";

import { useState } from "react";

type Stats = {
  totalUsers: number;
  freeUsers: number;
  starterUsers: number;
  partnerUsers: number;
  totalUploads: number;
  totalMessages: number;
  totalPaidTransactions: number;
  totalRevenue: number;
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadStats() {
    if (!adminKey.trim()) {
      setError("Masukkan kata laluan admin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminKey,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        setError(data?.error || "Gagal buka dashboard.");
        return;
      }

      setStats(data.stats);
    } catch (err) {
      console.error(err);
      setError("Dashboard tersangkut sekejap.");
    } finally {
      setLoading(false);
    }
  }

  const cards = stats
    ? [
        ["Jumlah Pengguna", stats.totalUsers],
        ["Free", stats.freeUsers],
        ["Starter", stats.starterUsers],
        ["Partner", stats.partnerUsers],
        ["Jumlah Upload", stats.totalUploads],
        ["Jumlah Mesej", stats.totalMessages],
        ["Transaksi Berbayar", stats.totalPaidTransactions],
        ["Jumlah Pendapatan", `RM${stats.totalRevenue.toFixed(2)}`],
      ]
    : [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F4F0FF 100%)",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <img
            src="/aina-logo.png"
            alt="AINA"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div>
            <h1 style={{ margin: 0, fontSize: 26, color: "#1F2937" }}>
              AINA Admin Dashboard
            </h1>

            <p style={{ margin: "4px 0 0", color: "#6B7280" }}>
              Pantau pengguna, pembayaran dan penggunaan AINA.
            </p>
          </div>
        </div>

        {!stats && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8DEFF",
              borderRadius: 20,
              padding: 20,
              maxWidth: 440,
              boxShadow: "0 8px 30px rgba(109, 61, 245, 0.1)",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Kata laluan admin
            </label>

            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") loadStats();
              }}
              placeholder="Masukkan kata laluan"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 14px",
                border: "1px solid #D8CCFF",
                borderRadius: 12,
                fontSize: 15,
                outline: "none",
              }}
            />

            {error && (
              <p
                style={{
                  color: "#DC2626",
                  fontSize: 14,
                  marginBottom: 0,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={loadStats}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: 14,
                border: "none",
                borderRadius: 999,
                padding: "13px 16px",
                background: "#6D3DF5",
                color: "#FFFFFF",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Sedang buka..." : "Buka Dashboard"}
            </button>
          </div>
        )}

        {stats && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 16,
              }}
            >
              {cards.map(([label, value]) => (
                <div
                  key={String(label)}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E8DEFF",
                    borderRadius: 18,
                    padding: 20,
                    boxShadow: "0 8px 24px rgba(109, 61, 245, 0.08)",
                  }}
                >
                  <div
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      color: "#6D3DF5",
                      fontSize: 28,
                      fontWeight: 800,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setStats(null);
                setAdminKey("");
              }}
              style={{
                marginTop: 20,
                border: "1px solid #D8CCFF",
                borderRadius: 999,
                padding: "10px 16px",
                background: "#FFFFFF",
                color: "#6D3DF5",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Keluar Dashboard
            </button>
          </>
        )}
      </div>
    </main>
  );
}