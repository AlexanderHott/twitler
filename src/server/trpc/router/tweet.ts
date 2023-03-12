import { z } from "zod";
import { createTweetSchema } from "../../schemas/tweet";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const tweetRouter = router({
  create: protectedProcedure
    .input(createTweetSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.tweet.create({
        data: {
          text: input.text,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  timeline: publicProcedure
    .input(
      z.object({
        where: z
          .object({
            author: z.object({ name: z.string().optional() }).optional(),
          })
          .optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const { where, limit, cursor } = input;
      const tweets = await ctx.prisma.tweet.findMany({
        where,
        take: limit + 1, // for cursor calculation
        orderBy: [{ createdAt: "desc" }],
        include: {
          author: { select: { image: true, name: true, id: true } },
          likes: { where: { userId }, select: { id: true } },
          _count: { select: { likes: true } },
        },
        cursor: cursor ? { id: cursor } : undefined,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (tweets.length > input.limit) {
        const nextItem = tweets.pop() as typeof tweets[number];
        nextCursor = nextItem.id;
      }
      return { tweets, nextCursor };
    }),
  like: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.prisma.like.create({
        data: {
          tweet: { connect: { id: input.tweetId } },
          user: { connect: { id: userId } },
        },
      });
    }),
  unlike: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.prisma.like.delete({
        where: { tweetId_userId: { tweetId: input.tweetId, userId } },
      });
    }),
});
