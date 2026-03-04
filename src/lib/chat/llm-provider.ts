import type { ChatModelProvider } from '@/lib/chat/chat-types';
import { AnthropicProvider } from '@/lib/chat/providers/anthropic-provider';

export function getLlmProvider(): ChatModelProvider {
  return new AnthropicProvider();
}
