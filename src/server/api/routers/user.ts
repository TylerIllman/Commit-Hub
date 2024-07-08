import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(z.object({ userName: z.string() }))
    .query(({ input }) => {
      return {
        res: `TEST: ${input.userName}`,
      };
    }),
});
