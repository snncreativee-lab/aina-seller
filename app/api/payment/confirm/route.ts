import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ref = body.ref;

    if (!ref) {
      return NextResponse.json(
        { error: "Missing ref" },
        { status: 400 }
      );
    }

    const { data: payment, error } = await supabase
      .from("payments")
      .select("reference_no, plan, status, bill_code")
      .eq("reference_no", ref)
      .single();

    if (error || !payment) {
      return NextResponse.json({
        success: true,
        paid: false,
      });
    }

    if (payment.status !== "paid") {
      return NextResponse.json({
        success: true,
        paid: false,
        status: payment.status,
      });
    }

    return NextResponse.json({
      success: true,
      paid: true,
      plan: payment.plan,
      billCode: payment.bill_code,
    });
  } catch (error) {
    console.error("PAYMENT CONFIRM ERROR:", error);

    return NextResponse.json(
      { error: "Confirm error" },
      { status: 500 }
    );
  }
}