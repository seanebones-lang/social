import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset post usage for all users with active subscriptions
    const result = await db.user.updateMany({
      where: {
        stripeSubscriptionId: {
          not: null,
        },
      },
      data: {
        postsUsed: 0,
      },
    });

    console.log(`Monthly reset completed: ${result.count} users updated`);

    return NextResponse.json({
      success: true,
      usersUpdated: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Monthly reset error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

