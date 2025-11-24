import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import { lateApi } from "@/lib/lateApi";
import { TRPCError } from "@trpc/server";

const PLAN_LIMITS = {
  free: 10,
  essentials: 100,
  pro: 500,
  business: 999999,
};

export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        platforms: z.array(z.string()),
        scheduledAt: z.string().optional(),
        useQueue: z.boolean().default(false),
        mediaUrls: z.array(z.string()).optional(),
        platformSpecificData: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check if user is locked
      if (user.isLocked) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Account locked. Please upgrade your plan.",
        });
      }

      // Check post limits
      const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] || 10;
      const platformCount = input.platforms.length;

      if (user.postsUsed + platformCount > limit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Post limit exceeded. You have ${user.postsUsed}/${limit} posts used this month.`,
        });
      }

      // Check addon requirements
      if (input.platforms.includes("reddit") && !user.addons.includes("reddit")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Reddit posting requires the Reddit Virality Pack addon.",
        });
      }

      if (input.platforms.includes("linkedin") && !user.addons.includes("linkedin")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "LinkedIn posting requires the LinkedIn Pro Suite addon.",
        });
      }

      if (!user.lateProfileId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No Late profile found. Please complete onboarding.",
        });
      }

      // Get queue slot if requested
      let scheduledAt = input.scheduledAt;
      if (input.useQueue) {
        const queueSlot = await lateApi.getNextQueueSlot(user.lateProfileId);
        scheduledAt = queueSlot.nextSlot;
      }

      // Create post via Late API
      const latePost = await lateApi.createPost({
        profileId: user.lateProfileId,
        content: input.content,
        platforms: input.platforms,
        scheduledAt,
        mediaItems: input.mediaUrls?.map((url) => ({
          url,
          type: url.match(/\.(mp4|mov|avi)$/i) ? "video" : "image",
        })),
        platformSpecificData: input.platformSpecificData,
        queuedFromProfile: input.useQueue ? user.lateProfileId : undefined,
      });

      // Log post in database
      const postLog = await ctx.db.postLog.create({
        data: {
          userId: user.id,
          latePostId: latePost.id,
          content: input.content,
          platforms: input.platforms,
          status: latePost.status,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          mediaUrls: input.mediaUrls || [],
        },
      });

      // Update user's post count
      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          postsUsed: {
            increment: platformCount,
          },
        },
      });

      return {
        postLog,
        latePost,
      };
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.postLog.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        skip: input.offset,
      });

      return posts;
    }),

  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        plan: true,
        postsUsed: true,
        trialEndsAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] || 10;

    return {
      postsUsed: user.postsUsed,
      postsLimit: limit,
      percentageUsed: Math.round((user.postsUsed / limit) * 100),
      trialEndsAt: user.trialEndsAt,
    };
  }),
});

