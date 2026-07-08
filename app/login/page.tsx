"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth() {
    if (!email || !password) {
      setMessage("Isi email dan password dulu ya 😊");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (mode === "register") {
        const { data, error } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data.user) {
          await fetch("/api/memory", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: data.user.id,
              plan: "free",
              uploadCount: 0,
              productMemory: "",
              businessMemory: `Nama Seller: ${name || "Belum diisi"}`,
              timelineMemory: "Seller mula daftar akaun AINA.",
            }),
          });
        }

        router.push("/");
        return;
      }

      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/");
    } catch (error) {
      console.error(error);
      setMessage("Login tersangkut sekejap. Cuba lagi ya.");
    } finally {
      setLoading(false);
    }
  }

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
          boxShadow: "0 10px 30px rgba(109, 61, 245, 0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#6D3DF5",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 30,
              margin: "0 auto 12px",
            }}
          >
            A
          </div>

          <h1 style={{ margin: 0, fontSize: 26, color: "#1F2937" }}>AINA</h1>

          <p style={{ marginTop: 6, color: "#6B7280", fontSize: 14 }}>
            Teman Seller Malaysia ❤️
          </p>
        </div>

        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama awak"
            style={inputStyle}
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={inputStyle}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={inputStyle}
        />

        {message && (
          <div
            style={{
              background: "#FFF7DD",
              border: "1px solid #F5C542",
              borderRadius: 14,
              padding: 12,
              fontSize: 13,
              marginBottom: 14,
              color: "#1F2937",
            }}
          >
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleAuth}
          disabled={loading}
          style={{
            width: "100%",
            border: "none",
            background: loading ? "#B8A8FF" : "#6D3DF5",
            color: "#FFFFFF",
            borderRadius: 16,
            padding: "14px",
            fontSize: 15,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sekejap ya..." : mode === "register" ? "Daftar" : "Log Masuk"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "register" ? "login" : "register");
            setMessage("");
          }}
          style={{
            width: "100%",
            marginTop: 14,
            border: "none",
            background: "transparent",
            color: "#6D3DF5",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {mode === "register"
            ? "Dah ada akaun? Log masuk"
            : "Belum ada akaun? Daftar"}
        </button>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #E8DEFF",
  borderRadius: 16,
  padding: "14px",
  fontSize: 14,
  outline: "none",
  marginBottom: 12,
  boxSizing: "border-box",
};