import { z } from "zod";

export const createTweetSchema = z.object({
  text: z.string().min(10).max(280),
});

export type CreateTweetSchema = z.infer<typeof createTweetSchema>;
