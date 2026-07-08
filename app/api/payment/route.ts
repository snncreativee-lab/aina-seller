import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

type Plan = "starter" | "partner";

const PLAN_CONFIG: Record<
  Plan,
  {
    name: string;
    amount: number;
    description: string;
  }
> = {
  starter: {
    name: "AINA RM4_90",
    amount: 490,
    description: "Sambung 6 upload gambar produk",
  },
  partner: {
    name: "AINA Partner",
    amount: 1990,
    description: "Partner AINA sebulan unlimited upload",
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = body.plan as Plan;

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: "Plan tidak sah." }, { status: 400 });
    }

    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!secretKey || !categoryCode) {
      return NextResponse.json(
        { error: "ToyyibPay env belum lengkap." },
        { status: 500 }
      );
    }

    const selectedPlan = PLAN_CONFIG[plan];
    const referenceNo = `AINA-${plan}-${Date.now()}`;

    const params = new URLSearchParams();
    params.append("userSecretKey", secretKey);
    params.append("categoryCode", categoryCode);
    params.append("billName", selectedPlan.name);
    params.append("billDescription", selectedPlan.description);
    params.append("billPriceSetting", "1");
    params.append("billPayorInfo", "0");
    params.append("billAmount", String(selectedPlan.amount));
    params.append(
      "billReturnUrl",
      `${appUrl}/success?plan=${plan}&ref=${referenceNo}`
    );
    params.append(
      "billCallbackUrl",
      `${appUrl}/api/payment/callback?plan=${plan}&ref=${referenceNo}`
    );
    params.append("billExternalReferenceNo", referenceNo);
    params.append("billTo", "AINA Seller");
    params.append("billEmail", "seller@example.com");
    params.append("billPhone", "01111111111");

    const response = await fetch(
      "https://toyyibpay.com/index.php/api/createBill",
      {
        method: "POST",
        body: params,
      }
    );

    const result = await response.json();
    const billCode = result?.[0]?.BillCode;
    console.log("BILLCODE:", billCode);

    if (!billCode) {
      console.error("ToyyibPay createBill error:", result);

      return NextResponse.json(
        { error: "Gagal cipta bill ToyyibPay.", detail: result },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
  .from("payments")
  .upsert(
    {
      reference_no: referenceNo,
      bill_code: billCode,
      plan,
      amount: selectedPlan.amount,
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "reference_no",
    }
  )
  .select();

console.log("SUPABASE INSERT:", data, error);

    return NextResponse.json({
      success: true,
      paymentUrl: `https://toyyibpay.com/${billCode}`,
      billCode,
      plan,
      referenceNo,
    });
  } catch (error) {
    console.error("PAYMENT ERROR:", error);

    return NextResponse.json(
      { error: "Payment tersangkut sekejap." },
      { status: 500 }
    );
  }
}