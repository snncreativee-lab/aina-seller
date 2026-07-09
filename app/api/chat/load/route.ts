import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = body.phone;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone/userId diperlukan." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("role,message,created_at")
      .eq("phone", phone)
      .order("created_at", { ascending: true })
      .limit(80);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messages: data || [],
    });
  } catch (error) {
    console.error("LOAD CHAT ERROR:", error);
    return NextResponse.json({ error: "Gagal load chat." }, { status: 500 });
  }
}