/**
 * Safe JSON parser for AI responses.
 * Handles common LLM quirks: markdown fences, extra text, trailing commas.
 */
export function parseAIJson<T>(raw: string): T | null {
  if (!raw || !raw.trim()) return null;

  let cleaned = raw.trim();

  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }

  // Try direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Attempt to extract JSON object or array from mixed text
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
