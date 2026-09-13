import { z } from "zod";

const amount = z.preprocess(
  (value) => (typeof value === "string" ? Number(value.replace(/[^0-9.-]/g, "")) : value),
  z.number().finite().nonnegative()
);

export const showroomTargetSchema = z.object({
  year: z.number().int().min(2026),
  target: amount,
  updateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Update date must be YYYY-MM-DD").default(""),
  achieved: amount,
  lastYearAchievement: amount,
  notes: z.string().trim().max(2000).default(""),
});
