import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find users with expired trials and no active subscription
    const expiredTrialUsers = await db.user.findMany({
      where: {
        trialEndsAt: {
          lte: now,
        },
        stripeSubscriptionId: null,
        plan: "free",
        postsUsed: {
          gt: 10, // Free limit
        },
      },
    });

    // Lock accounts that exceeded free limits
    const lockResult = await db.user.updateMany({
      where: {
        id: {
          in: expiredTrialUsers.map((u) => u.id),
        },
      },
      data: {
        isLocked: true,
      },
    });

    console.log(`Trial expiry check: ${lockResult.count} accounts locked`);

    // TODO: Send email notifications to locked users

    return NextResponse.json({
      success: true,
      accountsLocked: lockResult.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Trial expiry check error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

