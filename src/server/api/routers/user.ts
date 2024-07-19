import type { Record } from "@prisma/client/runtime/library";
import { z } from "zod";
import type { Streak } from "@prisma/client";
import { isNextDay, isSameDay } from "~/lib/utils";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { loadEnvFile } from "process";
import { Console } from "console";

const streakCompletionSchema = z.object({
  userId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export type CalendarValue = {
  date: Date;
  count: number;
};
type StreakCompletionsObject = Record<number, CalendarValue[]>;

type UserStreaksResponseObj = {
  hasStreaks: boolean;
  streaks: CalendarValue[];
  masterStreak: StreakCompletionsObject;
  longestStreak: number;
  streakContainingToday: number;
  totalNumCompletions: number;
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
        return {
          hasStreaks: false,
          streaks: [],
          masterStreak: [],
          longestStreak: 0,
          currentActiveStreak: 0,
        };
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
      let currentDate: null | Date = null;
      let currentNumCompletions = 0;
      let longestStreak = 0;
      let currStreak = 0;
      let streakContainingToday = 0;
      const todayDate = new Date();

      let initStreakContainsToday =
        completions[0] &&
        (isSameDay(completions[0]?.createdAt, todayDate) ||
          isNextDay(completions[0]?.createdAt, todayDate)); //WARNING: May need to swap these

      completions.forEach((completion, index) => {
        const newDate = new Date(completion.createdAt);

        if (!streakCompletions[completion.streakId]) {
          streakCompletions[completion.streakId] = [];
        }

        if (currentDate && isSameDay(currentDate, newDate)) {
          currentNumCompletions++;
        } else {
          if (currentDate !== null) {
            totalCompletionsByDate.push({
              date: currentDate,
              count: currentNumCompletions,
            });
          }
          const targetStreaks = streaks.reduce((acc, streak) => {
            if (currentDate && currentDate >= streak.startDate) {
              acc += 1;
            }
            return acc;
          }, 0);

          if (
            currentDate &&
            targetStreaks != 0 &&
            currentNumCompletions === targetStreaks &&
            isNextDay(newDate, currentDate)
          ) {
            currStreak += 1;
          } else {
            longestStreak = Math.max(currStreak, longestStreak);
            currStreak = 0;

            if (currentDate && initStreakContainsToday) {
              streakContainingToday = longestStreak;
              initStreakContainsToday = false;
            }
          }

          currentDate = newDate;
          currentNumCompletions = 1; // Reset for the new date
        }

        // Add completion details directly to the streak array HACK: Asset that the streak completion will exist
        streakCompletions[completion.streakId]!.push({
          date: completion.createdAt,
          count: 1, // Assuming each completion record counts as one completion
        });
      });

      if (currStreak > 0) {
        longestStreak = Math.max(currStreak, longestStreak);
      }

      // Ensure the last date's data is added HACK: checks to see if currentDate is not null
      if (completions.length > 0 && currentDate) {
        totalCompletionsByDate.push({
          //WARNING: Was previously a new Date(currentDate). Changed after making the new date a Date type
          date: currentDate,
          count: currentNumCompletions,
        });
      }

      const streaksWithCompletion: streakWithCompletion[] = streaks.map(
        (streak) => ({
          ...streak,
          completions: streakCompletions[streak.id] ?? [],
        }),
      );

      //HACK: THIS MUST BE CHANGED as longest streaks and currentActiveStreak are not calculating correctly
      //They have have an off by 1 error due to not correctly including the initial day of streaks
      return {
        hasStreaks: true,
        streaks: streaksWithCompletion,
        masterStreak: totalCompletionsByDate,
        longestStreak: longestStreak > 0 ? longestStreak + 1 : 0,
        currentActiveStreak:
          streakContainingToday > 0 ? streakContainingToday + 1 : 0,
        totalNumCompletions: completions.length,
      };
    }),
});
