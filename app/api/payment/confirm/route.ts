import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ref = body.ref;
    const plan = body.plan;
    const billCode = body.billCode;

    if (!ref || !plan) {
      return NextResponse.json(
        { error: "Missing ref or plan" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("payments")
      .update({
        status: "paid",
        bill_code: billCode || null,
        updated_at: new Date().toISOString(),
      })
      .eq("reference_no", ref);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PAYMENT CONFIRM ERROR:", error);

    return NextResponse.json({ error: "Confirm error" }, { status: 500 });
  }
}