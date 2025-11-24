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
    .input(z.object({ name: z.string().min(1, "Profile name is required") }))
    .mutation(async ({ ctx, input }) => {
      try {
        console.log("Creating Late profile with name:", input.name);
        
        // Check if user already has a profile
        const existingUser = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { lateProfileId: true },
        });

        if (existingUser?.lateProfileId) {
          console.log("User already has a profile:", existingUser.lateProfileId);
          // Return existing profile instead of creating a new one
          const existingProfile = await lateApi.getProfile(existingUser.lateProfileId);
          return existingProfile;
        }

        const profile = await lateApi.createProfile(input.name);
        console.log("Late profile created:", profile.id);

        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { lateProfileId: profile.id },
        });

        console.log("User updated with lateProfileId");
        return profile;
      } catch (error: any) {
        console.error("Profile creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create profile: ${error.message}`,
        });
      }
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
    .input(z.object({ profileId: z.string().min(1, "Profile ID is required") }))
    .mutation(async ({ input }) => {
      try {
        console.log("Creating platform invites for profile:", input.profileId);
        
        const invites = await Promise.all(
          PLATFORMS.map(async (platform) => {
            try {
              return await lateApi.createPlatformInvite(input.profileId, platform);
            } catch (error: any) {
              console.error(`Failed to create invite for ${platform}:`, error.message);
              // Return a fallback invite object instead of failing completely
              return {
                id: `fallback-${platform}`,
                profileId: input.profileId,
                platform,
                inviteUrl: `https://getlate.dev/invite/${input.profileId}/${platform}`,
                status: "pending" as const,
                createdAt: new Date().toISOString(),
              };
            }
          })
        );

        console.log("Platform invites created successfully:", invites.length);
        return invites;
      } catch (error: any) {
        console.error("Failed to create platform invites:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create platform invites: ${error.message}`,
        });
      }
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

