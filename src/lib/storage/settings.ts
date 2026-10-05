import { z } from 'zod';

export const CustomSettingsSchema = z.object({
  defaultBaggageLimitKg: z.number().min(1).max(50).default(7),
  preferredUnit: z.enum(['kg', 'lbs']).default('kg'),
  currency: z.string().default('INR (₹)'),
  defaultTripType: z.string().default('vacation'),
  travelStyle: z.string().default('Relaxed Explorer'),
  dietaryPreferences: z.array(z.string()).default([]),
  packingRules: z.array(z.string()).default([
    'Always carry a universal adapter and 10,000mAh power bank',
    'Keep essential medications and documents in cabin bag',
  ]),
  favoriteActivities: z.array(z.string()).default(['Beach & Swimming', 'Sightseeing & Culture']),
  showWeatherGuidance: z.boolean().default(true),
  showAiSuggestions: z.boolean().default(true),
});

export type CustomSettings = z.infer<typeof CustomSettingsSchema>;

const SETTINGS_KEY = 'packpal_custom_settings';

export const DEFAULT_CUSTOM_SETTINGS: CustomSettings = {
  defaultBaggageLimitKg: 7,
  preferredUnit: 'kg',
  currency: 'INR (₹)',
  defaultTripType: 'vacation',
  travelStyle: 'Relaxed Explorer',
  dietaryPreferences: ['Vegetarian-friendly'],
  packingRules: [
    'Always carry a universal adapter and 10,000mAh power bank',
    'Keep essential medications and documents in cabin bag',
  ],
  favoriteActivities: ['Beach & Swimming', 'Sightseeing & Culture', 'Local Markets'],
  showWeatherGuidance: true,
  showAiSuggestions: true,
};

export function loadCustomSettings(): CustomSettings {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_CUSTOM_SETTINGS;
    const parsed = JSON.parse(raw);
    const validated = CustomSettingsSchema.safeParse(parsed);
    return validated.success ? validated.data : DEFAULT_CUSTOM_SETTINGS;
  } catch {
    return DEFAULT_CUSTOM_SETTINGS;
  }
}

export function saveCustomSettings(settings: CustomSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
