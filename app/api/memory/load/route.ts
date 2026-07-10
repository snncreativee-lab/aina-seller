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

    if (profileError || !profile) {
      return NextResponse.json({
        success: true,
        found: false,
      });
    }

    const now = new Date();
    const expiresAt = profile.partner_expires_at
      ? new Date(profile.partner_expires_at)
      : null;

    const partnerExpired =
      profile.plan === "partner" &&
      expiresAt !== null &&
      expiresAt.getTime() <= now.getTime();

      console.log("PARTNER EXPIRY CHECK:", {
  phone,
  plan: profile.plan,
  expiresAt: profile.partner_expires_at,
  now: now.toISOString(),
  partnerExpired,
});

    if (partnerExpired) {
      const { data: updatedProfile, error: expiryUpdateError } = await supabase
        .from("profiles")
        .update({
          plan: "starter",
          upload_count: 6,
          updated_at: now.toISOString(),
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (expiryUpdateError) {
        console.error("PARTNER EXPIRY UPDATE ERROR:", expiryUpdateError);

        return NextResponse.json(
          { error: "Gagal kemas kini langganan." },
          { status: 500 }
        );
      }

      profile.plan = updatedProfile.plan;
      profile.upload_count = updatedProfile.upload_count;
      profile.updated_at = updatedProfile.updated_at;
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
        partnerExpired,
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      profile,
      brain,
      partnerExpired,
    });
  } catch (error) {
    console.error("MEMORY LOAD ERROR:", error);

    return NextResponse.json(
      { error: "Gagal load memory." },
      { status: 500 }
    );
  }
}