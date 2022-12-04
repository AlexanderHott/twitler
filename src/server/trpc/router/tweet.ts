import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const tweetRouter = router({
  create: protectedProcedure.input(z.object({text:z.string({required_error:"Tweet text is required"})})).mutation(async ({ ctx, input }) => {
    return ctx.prisma.tweet.create({
      data: {
        text: input.text,
        author: {
            connect: {
                id: ctx.session.user.id
            }
        }
        
      },
    });
  }
});
