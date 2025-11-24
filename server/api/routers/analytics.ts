import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import { lateApi } from "@/lib/lateApi";
import { TRPCError } from "@trpc/server";

export const analyticsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        platform: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          addons: true,
          lateProfileId: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check if user has analytics addon
      if (!user.addons.includes("analytics")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics Pro addon required",
        });
      }

      if (!user.lateProfileId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No Late profile found",
        });
      }

      const analytics = await lateApi.getAnalytics(
        user.lateProfileId,
        input.platform,
        input.startDate,
        input.endDate
      );

      return analytics;
    }),

  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        addons: true,
        lateProfileId: true,
      },
    });

    if (!user?.addons.includes("analytics")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Analytics Pro addon required",
      });
    }

    if (!user.lateProfileId) {
      return {
        totalPosts: 0,
        totalEngagement: 0,
        totalReach: 0,
      };
    }

    // Get analytics for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const analytics = await lateApi.getAnalytics(
      user.lateProfileId,
      undefined,
      startDate.toISOString(),
      endDate.toISOString()
    );

    // Aggregate metrics
    const totalEngagement = analytics.reduce(
      (sum, a) => sum + a.metrics.engagement,
      0
    );
    const totalReach = analytics.reduce(
      (sum, a) => sum + a.metrics.impressions,
      0
    );

    return {
      totalPosts: analytics.length,
      totalEngagement,
      totalReach,
      byPlatform: analytics,
    };
  }),
});

