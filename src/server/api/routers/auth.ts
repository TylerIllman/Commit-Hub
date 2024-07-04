import { TRPCError } from "@trpc/server";
// import { z } from "zod";
import { db } from "~/server/db";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  authCallback: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id || !ctx.user.emailAddresses[0]?.emailAddress) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const dbUser = await ctx.db.user.findFirst({
      where: {
        id: ctx.user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: ctx.user.id,
          email: ctx.user.emailAddresses[0]?.emailAddress,
        },
      });
    }

    return { success: true };
  }),
});
