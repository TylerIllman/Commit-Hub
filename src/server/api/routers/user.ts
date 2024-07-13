import { Prisma } from "@prisma/client";
import { Record } from "@prisma/client/runtime/library";
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

const streakCompletionSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

interface CompletionDetails {
  date: Date;
  numCompletions: number;
}
// Using Record utility type to define StreakCompletions
type DailyStreakCompletions = Record<string, CompletionDetails>;
type StreakCompletionsObject = Record<number, DailyStreakCompletions>;

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
  getUserStreaks: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const res = await db.streak.findMany({
        where: {
          userId: input.id,
        },
      });

      if (!res) {
        return { hasStreaks: false };
      }

      return { hasStreaks: true, streaks: res };
    }),

  getStreakCompletions: publicProcedure
    .input(streakCompletionSchema)
    .query(async ({ input, ctx }) => {
      const completions = await db.streakCompletion.findMany({
        where: {
          streak: {
            userId: ctx.user?.id,
          },
          createdAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const streakCompletions: StreakCompletionsObject = {};
      const totalCompletionsByDate: CompletionDetails[] = [];
      let currentDate: null | string = null;
      let currentNumCompletions = 0;

      completions.forEach((completion) => {
        const newDate = completion.createdAt.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format

        if (!streakCompletions[completion.streakId]) {
          streakCompletions[completion.streakId] = [];
        }

        if (currentDate === newDate) {
          currentNumCompletions++;
        } else {
          if (currentDate !== null) {
            totalCompletionsByDate.push({
              date: new Date(currentDate),
              numCompletions: currentNumCompletions,
            });
          }
          currentDate = newDate;
          currentNumCompletions = 1; // Reset for the new date
        }

        // Add completion details directly to the streak array
        streakCompletions[completion.streakId].push({
          date: completion.createdAt,
          numCompletions: 1, // Assuming each completion record counts as one completion
        });
      });

      // Ensure the last date's data is added
      if (completions.length > 0) {
        totalCompletionsByDate.push({
          date: new Date(currentDate),
          numCompletions: currentNumCompletions,
        });
      }

      console.log("Streak-specific completions:", streakCompletions);
      console.log("Total completions by date:", totalCompletionsByDate);

      return { streakCompletions, totalCompletionsByDate };
    }),
});
