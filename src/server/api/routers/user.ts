import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

// interface StreakType {
//   name: string;
//   url: string;
//   emoji: string;
//   description: string;
// }

export const StreakSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  emoji: z.string(),
  description: z.string(),
});

export const userRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ userName: z.string() }))
    .query(async ({ input }) => {
      const res = await db.user.findFirst({
        where: {
          userName: input.userName,
        },
      });

      if (!res) {
        return { isUser: false };
      }

      return { isUser: true, user: res };
    }),

  createNewStreak: protectedProcedure
    .input(StreakSchema)
    .query(async ({ input, ctx }) => {
      const res = await db.streak.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          url: input.url,
          emoji: input.emoji,
          description: input.description,
        },
      });

      console.log("RES: ", res);

      return res;
    }),
});
