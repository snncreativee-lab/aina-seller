import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const phone = body.phone || "guest";
    const plan = body.plan || "free";
    const uploadCount = body.uploadCount || 0;
    const productMemory = body.productMemory || "";
    const businessMemory = body.businessMemory || "";
    const timelineMemory = body.timelineMemory || "";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          phone,
          plan,
          upload_count: uploadCount,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "phone",
        }
      )
      .select()
      .single();

    if (profileError) {
      console.error("PROFILE SAVE ERROR:", profileError);

      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    const { error: brainError } = await supabase
      .from("business_brain")
      .upsert(
        {
          profile_id: profile.id,
          product_memory: productMemory,
          business_memory: businessMemory,
          timeline_memory: timelineMemory,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "profile_id",
        }
      );

    if (brainError) {
      console.error("BRAIN SAVE ERROR:", brainError);

      return NextResponse.json(
        { error: brainError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profileId: profile.id,
    });
  } catch (error) {
    console.error("MEMORY API ERROR:", error);

    return NextResponse.json(
      { error: "Gagal simpan memory." },
      { status: 500 }
    );
  }
}