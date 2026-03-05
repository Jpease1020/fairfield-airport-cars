import type { ChatModelProvider } from '@/lib/chat/chat-types';
import { AnthropicProvider } from '@/lib/chat/providers/anthropic-provider';
import { GeminiProvider } from '@/lib/chat/providers/gemini-provider';

export function getLlmProvider(): ChatModelProvider {
  const requestedProvider = process.env.LLM_PROVIDER?.toLowerCase();

  if (requestedProvider === 'anthropic') {
    return new AnthropicProvider();
  }

  if (requestedProvider === 'gemini') {
    return new GeminiProvider();
  }

  if (process.env.GEMINI_API_KEY) {
    return new GeminiProvider();
  }

  return new AnthropicProvider();
}
