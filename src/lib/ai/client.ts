/**
 * Low-level Ollama HTTP client.
 * All AI calls go through here so model/URL configuration is centralized.
 */
export async function callOllama(prompt: string): Promise<{ response: string; ok: boolean }> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'gemma2:latest';

  try {
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: 'json',
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return { response: '', ok: false };
    }

    const data = await res.json();
    return { response: data.response || '', ok: true };
  } catch {
    return { response: '', ok: false };
  }
}

/**
 * Check if Ollama is reachable.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
