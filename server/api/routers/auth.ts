import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/lib/trpc/server";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashedPassword = await hash(input.password, 10);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          plan: "free",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }),

  getSession: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        addons: true,
        postsUsed: true,
        isLocked: true,
        trialEndsAt: true,
        lateProfileId: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return user;
  }),
});

