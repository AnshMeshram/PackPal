import { PackingItem } from '@/types';

// Default weights in kg per unit for common packing categories
const DEFAULT_WEIGHTS: Record<string, number> = {
  // Clothing
  't-shirt': 0.2,
  'shirt': 0.25,
  'pants': 0.4,
  'shorts': 0.25,
  'jacket': 0.6,
  'sweater': 0.4,
  'underwear': 0.05,
  'socks': 0.05,
  'dress': 0.3,
  'swimwear': 0.15,
  'formal': 0.4,
  // Toiletries
  'toothbrush': 0.05,
  'toothpaste': 0.1,
  'sunscreen': 0.15,
  'shampoo': 0.2,
  'deodorant': 0.1,
  'razor': 0.05,
  // Electronics
  'phone charger': 0.1,
  'charger': 0.1,
  'laptop': 1.5,
  'power bank': 0.25,
  'camera': 0.5,
  'earbuds': 0.05,
  'headphones': 0.25,
  // Documents
  'passport': 0.05,
  'id': 0.02,
  'wallet': 0.1,
  // Gear
  'water bottle': 0.15,
  'towel': 0.3,
  'backpack': 0.5,
  'hiking shoes': 0.8,
  'cap': 0.1,
  'sunglasses': 0.05,
  'umbrella': 0.3,
  'rain jacket': 0.3,
  // Health
  'first aid': 0.2,
  'medication': 0.1,
  'insect repellent': 0.1,
};

// Category-level fallback weights
const CATEGORY_WEIGHTS: Record<string, number> = {
  clothing: 0.25,
  toiletries: 0.1,
  electronics: 0.2,
  documents: 0.05,
  beach: 0.15,
  hiking: 0.3,
  health: 0.15,
  accessories: 0.1,
  gear: 0.25,
  miscellaneous: 0.15,
};

/**
 * Estimate the weight of a single packing item unit.
 */
export function estimateItemUnitWeight(item: PackingItem): number {
  if (item.weightEstimateKg > 0) return item.weightEstimateKg;

  const nameLower = item.name.toLowerCase();
  for (const [key, weight] of Object.entries(DEFAULT_WEIGHTS)) {
    if (nameLower.includes(key)) return weight;
  }

  return CATEGORY_WEIGHTS[item.category] || 0.15;
}

/**
 * Calculate total weight for a single item (unit weight × quantity).
 */
export function calculateItemWeight(item: PackingItem): number {
  return estimateItemUnitWeight(item) * item.quantity;
}

/**
 * Calculate total weight of all PACKED items.
 */
export function calculateTotalPackedWeight(items: PackingItem[]): number {
  return items
    .filter((i) => i.packed)
    .reduce((sum, item) => sum + calculateItemWeight(item), 0);
}

/**
 * Calculate total estimated weight of ALL items (packed + unpacked).
 */
export function calculateTotalEstimatedWeight(items: PackingItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemWeight(item), 0);
}

/**
 * Calculate remaining baggage capacity.
 */
export function calculateRemainingCapacity(items: PackingItem[], limitKg: number): number {
  return limitKg - calculateTotalPackedWeight(items);
}

/**
 * Check if bag is over the limit.
 */
export function isOverLimit(items: PackingItem[], limitKg: number): boolean {
  return calculateTotalPackedWeight(items) > limitKg;
}

/**
 * Format weight display.
 */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}
