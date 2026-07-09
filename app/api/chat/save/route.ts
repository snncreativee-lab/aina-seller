import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const phone = body.phone;
    const role = body.role;
    const message = body.message;

    if (!phone || !role || !message) {
      return NextResponse.json(
        { error: "Data chat tak lengkap." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("chat_messages").insert({
      phone,
      role,
      message,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SAVE CHAT ERROR:", error);
    return NextResponse.json({ error: "Gagal simpan chat." }, { status: 500 });
  }
}