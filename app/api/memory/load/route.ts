import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = body.phone || "guest";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("phone", phone)
      .single();

    if (profileError) {
      return NextResponse.json({
        success: true,
        found: false,
      });
    }

    const { data: brain, error: brainError } = await supabase
      .from("business_brain")
      .select("*")
      .eq("profile_id", profile.id)
      .single();

    if (brainError) {
      return NextResponse.json({
        success: true,
        found: true,
        profile,
        brain: null,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      profile,
      brain,
    });
  } catch (error) {
    console.error("MEMORY LOAD ERROR:", error);

    return NextResponse.json(
      { error: "Gagal load memory." },
      { status: 500 }
    );
  }
}