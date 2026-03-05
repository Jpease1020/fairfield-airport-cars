import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/chat/providers/anthropic-provider', () => ({
  AnthropicProvider: class {
    kind = 'anthropic';

    async generate() {
      return { stopReason: 'end_turn' as const, content: [] };
    }
  },
}));

vi.mock('@/lib/chat/providers/gemini-provider', () => ({
  GeminiProvider: class {
    kind = 'gemini';

    async generate() {
      return { stopReason: 'end_turn' as const, content: [] };
    }
  },
}));

const originalEnv = process.env;

describe('getLlmProvider', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.LLM_PROVIDER;
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses Gemini when LLM_PROVIDER=gemini', async () => {
    process.env.LLM_PROVIDER = 'gemini';
    const { getLlmProvider } = await import('@/lib/chat/llm-provider');

    const provider = getLlmProvider() as { kind?: string };
    expect(provider.kind).toBe('gemini');
  });

  it('uses Anthropic when LLM_PROVIDER=anthropic', async () => {
    process.env.LLM_PROVIDER = 'anthropic';
    process.env.GEMINI_API_KEY = 'gemini-key';
    const { getLlmProvider } = await import('@/lib/chat/llm-provider');

    const provider = getLlmProvider() as { kind?: string };
    expect(provider.kind).toBe('anthropic');
  });

  it('defaults to Gemini when GEMINI_API_KEY exists', async () => {
    process.env.GEMINI_API_KEY = 'gemini-key';
    const { getLlmProvider } = await import('@/lib/chat/llm-provider');

    const provider = getLlmProvider() as { kind?: string };
    expect(provider.kind).toBe('gemini');
  });

  it('falls back to Anthropic when Gemini is not configured', async () => {
    const { getLlmProvider } = await import('@/lib/chat/llm-provider');

    const provider = getLlmProvider() as { kind?: string };
    expect(provider.kind).toBe('anthropic');
  });
});
