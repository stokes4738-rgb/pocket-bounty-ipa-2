import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validateRequest(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        });
      } else {
        res.status(500).json({ message: "Internal validation error" });
      }
    }
  };
}

// Common validation schemas
export const amountSchema = z.object({
  amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
    .refine(val => parseFloat(val) > 0, "Amount must be positive")
    .refine(val => parseFloat(val) <= 10000, "Amount exceeds maximum limit")
});

export const bountyCreateSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20).max(5000),
  category: z.string().min(1).max(100),
  reward: z.string().regex(/^\d+(\.\d{1,2})?$/),
  duration: z.number().min(1).max(90),
  tags: z.array(z.string()).optional()
});

export const messageSchema = z.object({
  content: z.string().min(1).max(1000)
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc")
});