import { z } from "zod";

export const MovieSchema = z.object({
  name: z.string().min(2).max(50),
  id: z.number().optional(),
});

export type CreateMovieForm = z.infer<typeof MovieSchema>;
