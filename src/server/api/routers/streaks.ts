import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import type { streakWithCompletion } from "~/server/api/routers/user";

// interface StreakType {
//   name: string;
//   url: string;
//   emoji: string;
//   description: string;
// }

//TODO: Centralise these schemas to a single "schema" file
const createStreakFormSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  emoji: z.string().emoji({ message: "This must contain a single emoji" }),
});

export const UpdateStreakDetailsSchema = z.object({
  streakId: z.number(),
  name: z.string(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  emoji: z.string().emoji({ message: "This must contain a single emoji" }),
});

const addStreakCompletionSchema = z.object({
  streakId: z.number(),
});

const DeleteStreakSchema = z.object({
  streakId: z.number(),
});

const GetStreakDetailsSchema = z.object({
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
        ...(input.description ? { description: input.description } : {}),
        ...(input.url ? { url: input.url } : {}),
      };

      console.log(streakData);

      const res = await db.streak.create({
        data: streakData,
      });

      if (res) {
        const streakWithComp: streakWithCompletion = {
          ...res,
          completions: [],
        };
        return { success: true, data: streakWithComp };
      }

      return { success: false, data: res };
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

  getStreakDetails: publicProcedure
    .input(GetStreakDetailsSchema)
    .query(async ({ input }) => {
      return await db.streak.findFirst({
        where: {
          id: input.streakId,
        },
      });
    }),

  updateStreakDetails: protectedProcedure
    .input(UpdateStreakDetailsSchema)
    .mutation(async ({ input, ctx }) => {
      console.log("input: ", input);
      const streakRes = await db.streak.update({
        where: {
          id: input.streakId,
          userId: ctx.user.id,
        },
        data: {
          name: input.name,
          emoji: input.emoji,
          url: input.url,
          description: input.description,
        },
      });

      return streakRes;
    }),

  //TODO: Need to add proper error handling and response objects
  deleteStreak: protectedProcedure
    .input(DeleteStreakSchema)
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      const deleteStreakRes = await db.streak.delete({
        where: {
          id: input.streakId,
          // userId: ctx.user.id,
        },
      });

      console.log(deleteStreakRes);

      return deleteStreakRes;
    }),
});
