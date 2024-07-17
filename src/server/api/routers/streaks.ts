import { Prisma } from "@prisma/client";
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

const addStreakCompletionSchema = z.object({
  streakId: z.number(),
});

export const streaksRouter = createTRPCRouter({
  createNewStreak: protectedProcedure
    .input(createStreakFormSchema)
    // .input(StreakSchema)
    .mutation(async ({ input, ctx }) => {
      const streakData = {
        userId: ctx.user.id,
        name: input.name,
        emoji: input.emoji,
        ...(input.descpription ? { description: input.descpription } : {}),
        ...(input.url ? { url: input.url } : {}),
      };

      console.log(streakData);

      const res = await db.streak.create({
        data: streakData,
      });
      return res;
    }),

  addStreakCompletion: protectedProcedure
    .input(addStreakCompletionSchema)
    .mutation(async ({ input, ctx }) => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Start of today

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // End of today

      // Find if there's an existing completion for today linked to the current user
      const existingCompletion = await db.streakCompletion.findFirst({
        where: {
          streakId: input.streakId,
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
          streak: {
            userId: ctx.user.id, // Ensure the Streak belongs to the current user
          },
        },
        include: {
          streak: true, // Optionally include streak details if needed elsewhere
        },
      });

      if (existingCompletion) {
        //TODO: Instead of deleting streaks update DB to have a 'completed' flag to update
        return await db.streakCompletion.delete({
          where: {
            id: existingCompletion.id,
          },
        });
      } else {
        // If not exists, create new
        return await db.streakCompletion.create({
          data: {
            streakId: input.streakId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }),
});
