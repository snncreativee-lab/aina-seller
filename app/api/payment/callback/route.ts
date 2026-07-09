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

    const { error } = await supabase
      .from("payments")
      .update({
        status: isPaid ? "paid" : "failed",
        bill_code: billCode,
        updated_at: new Date().toISOString(),
      })
      .eq("reference_no", ref);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paid: isPaid,
    });
  } catch (error) {
    console.error("TOYYIBPAY CALLBACK ERROR:", error);

    return NextResponse.json({ error: "Callback error" }, { status: 500 });
  }
}