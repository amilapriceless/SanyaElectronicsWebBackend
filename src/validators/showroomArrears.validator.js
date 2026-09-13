import { z } from "zod";

const amount = z.preprocess(
  (value) => (typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : value),
  z.number().finite().nonnegative()
);

export const showroomArrearsSchema = z.object({
  year: z.number().int().min(2026),
  outstanding: amount,
  overdueAccounts: z.number().int().nonnegative().default(0),
  nextReview: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Review date must be YYYY-MM-DD").default(""),
  notes: z.string().trim().max(2000).default(""),
});
