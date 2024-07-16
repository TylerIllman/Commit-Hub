import type { Record } from "@prisma/client/runtime/library";
import { z } from "zod";
import type { Streak } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

const streakCompletionSchema = z.object({
  userId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

type CalendarValue = {
  date: Date;
  count: number;
};
type StreakCompletionsObject = Record<number, CalendarValue[]>;

type UserStreaksResponseObj = {
  hasStreaks: boolean;
  streaks: CalendarValue[];
  masterStreak: StreakCompletionsObject;
};

//HACK: May need to move this to "TYPES" folder in the future
export type streakWithCompletion = Streak & {
  completions: CalendarValue[];
};

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
    .input(streakCompletionSchema)
    .query(async ({ input }) => {
      const streaks = await db.streak.findMany({
        where: {
          userId: input.userId,
        },
      });

      if (!streaks) {
        return { hasStreaks: false };
      }

      const completions = await db.streakCompletion.findMany({
        where: {
          streak: {
            userId: input.userId,
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
      const totalCompletionsByDate: CalendarValue[] = [];
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
              count: currentNumCompletions,
            });
          }
          currentDate = newDate;
          currentNumCompletions = 1; // Reset for the new date
        }

        // Add completion details directly to the streak array
        streakCompletions[completion.streakId].push({
          date: completion.createdAt,
          count: 1, // Assuming each completion record counts as one completion
        });
      });

      // Ensure the last date's data is added
      if (completions.length > 0) {
        totalCompletionsByDate.push({
          date: new Date(currentDate),
          count: currentNumCompletions,
        });
      }

      // console.log("Streak-specific completions:", streakCompletions);
      // console.log("Total completions by date:", totalCompletionsByDate);
      // console.log("streaks: ", streaks);

      const streaksWithCompletion: streakWithCompletion = streaks.map(
        (streak) => ({
          ...streak,
          completions: streakCompletions[streak.id] ?? [],
        }),
      );

      console.log("streaksWithCompletion:", streaksWithCompletion);

      return {
        hasStreaks: true,
        streaks: streaksWithCompletion,
        masterStreak: totalCompletionsByDate,
      };
    }),
});
