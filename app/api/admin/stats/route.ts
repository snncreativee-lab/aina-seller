import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const adminKey = body.adminKey;

    if (
      !adminKey ||
      adminKey !== process.env.ADMIN_DASHBOARD_KEY
    ) {
      return NextResponse.json(
        { error: "Akses tidak dibenarkan." },
        { status: 401 }
      );
    }

    const [
      profilesResult,
      paymentsResult,
      chatsResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("plan, upload_count, created_at"),

      supabase
        .from("payments")
        .select("plan, amount, status, created_at"),

      supabase
        .from("chat_messages")
        .select("id, created_at"),
    ]);

    if (profilesResult.error) {
      throw profilesResult.error;
    }

    if (paymentsResult.error) {
      throw paymentsResult.error;
    }

    if (chatsResult.error) {
      throw chatsResult.error;
    }

    const profiles = profilesResult.data || [];
    const payments = paymentsResult.data || [];
    const chats = chatsResult.data || [];

    const paidPayments = payments.filter(
      (payment) => payment.status === "paid"
    );

    const totalRevenueSen = paidPayments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0
    );

    const stats = {
      totalUsers: profiles.length,

      freeUsers: profiles.filter(
        (profile) => profile.plan === "free"
      ).length,

      starterUsers: profiles.filter(
        (profile) => profile.plan === "starter"
      ).length,

      partnerUsers: profiles.filter(
        (profile) => profile.plan === "partner"
      ).length,

      totalUploads: profiles.reduce(
        (total, profile) =>
          total + Number(profile.upload_count || 0),
        0
      ),

      totalMessages: chats.length,

      totalPaidTransactions: paidPayments.length,

      totalRevenue: totalRevenueSen / 100,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);

    return NextResponse.json(
      { error: "Gagal ambil data dashboard." },
      { status: 500 }
    );
  }
}