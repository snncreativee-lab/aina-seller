import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const ref = searchParams.get("ref");

    const formData = await req.formData();

    const status = String(formData.get("status_id") || "");
    const billCode = String(formData.get("billcode") || "");
    const transactionId = String(formData.get("transaction_id") || "");

    console.log("TOYYIBPAY CALLBACK:", {
      ref,
      status,
      billCode,
      transactionId,
    });

    if (!ref) {
      return NextResponse.json({ error: "Missing ref" }, { status: 400 });
    }

    const isPaid = status === "1";

    const { data: payment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("phone, plan")
      .eq("reference_no", ref)
      .single();

    if (paymentFetchError || !payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      );
    }

    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: isPaid ? "paid" : "failed",
        bill_code: billCode,
        updated_at: new Date().toISOString(),
      })
      .eq("reference_no", ref);

    if (paymentUpdateError) {
      return NextResponse.json(
        { error: paymentUpdateError.message },
        { status: 500 }
      );
    }

    if (isPaid && payment.phone && payment.plan) {
  const now = new Date();

  const profileData: {
    phone: string;
    plan: string;
    upload_count: number;
    updated_at: string;
    partner_started_at?: string | null;
    partner_expires_at?: string | null;
  } = {
    phone: payment.phone,
    plan: payment.plan,
    upload_count: 0,
    updated_at: now.toISOString(),
  };

  if (payment.plan === "partner") {
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    profileData.partner_started_at = now.toISOString();
    profileData.partner_expires_at = expiresAt.toISOString();
  }

  if (payment.plan === "starter") {
    profileData.partner_started_at = null;
    profileData.partner_expires_at = null;
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .upsert(profileData, {
      onConflict: "phone",
    });

  if (profileUpdateError) {
    return NextResponse.json(
      { error: profileUpdateError.message },
      { status: 500 }
    );
  }
}

    return NextResponse.json({
      success: true,
      paid: isPaid,
      plan: payment.plan,
      phone: payment.phone,
    });
  } catch (error) {
    console.error("TOYYIBPAY CALLBACK ERROR:", error);

    return NextResponse.json({ error: "Callback error" }, { status: 500 });
  }
}