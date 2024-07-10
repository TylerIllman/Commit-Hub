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

const createStreakFormSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  descpription: z.string().optional(),
  emoji: z.string().emoji({ message: "This must contain a single emoji" }),
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
    .input(createStreakFormSchema)
    // .input(StreakSchema)
    .query(async ({ input, ctx }) => {
      const streakData = {
        userId: ctx.user.id,
        name: input.name,
        emoji: input.emoji,
        ...(input.descpription ? { description: input.descpription } : {}),
        ...(input.url ? { url: input.url } : {}), // Include URL only if provided
      };

      const res = await db.streak.create({
        data: streakData,
      });
      return res;
    }),
});
