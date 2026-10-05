import { z } from 'zod';

// ─── Packing Generation Schema ──────────────────────────
export const PackingItemSchema = z.object({
  name: z.string(),
  category: z.string(),
  quantity: z.number().int().positive().default(1),
  essential: z.boolean().default(false),
  priority: z.enum(['essential', 'recommended', 'optional']).optional().default('recommended'),
  weightEstimateKg: z.number().nonnegative().optional().default(0.15),
  notes: z.string().optional().default(''),
  reason: z.string().optional().default(''),
});

export const PackingGenerationSchema = z.object({
  items: z.array(PackingItemSchema),
});

// Allow raw array as well (Gemma sometimes outputs bare arrays)
export const PackingArraySchema = z.array(PackingItemSchema);

// ─── Expense Extraction Schema ──────────────────────────
export const ExpenseExtractionSchema = z.object({
  description: z.string(),
  amount: z.number().positive(),
  paidBy: z.string(),
  participants: z.array(z.string()).min(1),
  splitMethod: z.enum(['equal', 'custom']).default('equal'),
  missingInfo: z.array(z.string()).optional(),
});

// ─── Trip Change Schema ─────────────────────────────────
export const TripChangeSchema = z.object({
  action: z.enum([
    'extend_trip',
    'shorten_trip',
    'add_activity',
    'remove_activity',
    'modify_activity',
  ]),
  days: z.number().int().positive().optional(),
  activity: z.string().optional(),
  date: z.string().optional(),
  details: z.string().optional(),
});

// ─── Optimize Schema ────────────────────────────────────
export const OptimizeRecommendationSchema = z.object({
  itemId: z.string(),
  decision: z.enum(['keep', 'remove', 'optional', 'replace']),
  reason: z.string(),
  replacementSuggestion: z.string().optional(),
});

export const PackingOptimizationSchema = z.object({
  recommendations: z.array(OptimizeRecommendationSchema),
});
