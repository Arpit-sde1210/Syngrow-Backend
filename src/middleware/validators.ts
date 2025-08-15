
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().default("").optional(),
  status: z.enum(["PENDING", "COMPLETED", "IN_PROGRESS"]).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "IN_PROGRESS"]).optional(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["PENDING", "COMPLETED", "IN_PROGRESS"]).optional(),
  title: z.string().optional(),
});
