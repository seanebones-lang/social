import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import { lateApi } from "@/lib/lateApi";
import { TRPCError } from "@trpc/server";

const PLATFORMS = [
  "instagram",
  "tiktok",
  "x",
  "facebook",
  "youtube",
  "linkedin",
  "threads",
  "pinterest",
  "reddit",
  "bluesky",
];

export const profilesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const profile = await lateApi.createProfile(input.name);

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { lateProfileId: profile.id },
      });

      return profile;
    }),

  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { lateProfileId: true },
    });

    if (!user?.lateProfileId) {
      return [];
    }

    const accounts = await lateApi.getAccounts(user.lateProfileId);
    return accounts;
  }),

  createPlatformInvites: protectedProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input }) => {
      const invites = await Promise.all(
        PLATFORMS.map((platform) =>
          lateApi.createPlatformInvite(input.profileId, platform)
        )
      );

      return invites;
    }),

  checkConnectionStatus: protectedProcedure
    .input(z.object({ profileId: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.profileId) {
        return PLATFORMS.map((platform) => ({
          platform,
          connected: false,
        }));
      }

      const accounts = await lateApi.getAccounts(input.profileId);

      const status = PLATFORMS.map((platform) => ({
        platform,
        connected: accounts.some(
          (acc) => acc.platform === platform && acc.isConnected
        ),
      }));

      return status;
    }),
});

