import type {
  ChatModelProvider,
  GenerateModelInput,
  ProviderInputBlock,
  ProviderMessage,
  ProviderResponse,
  TextBlock,
  ToolResultBlock,
  ToolUseBlock,
} from '@/lib/chat/chat-types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-5-haiku-latest';

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

interface AnthropicToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

interface AnthropicToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

type AnthropicBlock = AnthropicTextBlock | AnthropicToolUseBlock | AnthropicToolResultBlock;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicBlock[];
}

interface AnthropicResponse {
  stop_reason?: ProviderResponse['stopReason'];
  content?: Array<AnthropicTextBlock | AnthropicToolUseBlock | Record<string, unknown>>;
}

function mapBlockToAnthropic(block: ProviderInputBlock): AnthropicBlock {
  if (block.type === 'tool_result') {
    const toolResult = block as ToolResultBlock;
    return {
      type: 'tool_result',
      tool_use_id: toolResult.toolUseId,
      content: toolResult.content,
    };
  }

  if (block.type === 'tool_use') {
    const toolUse = block as ToolUseBlock;
    return {
      type: 'tool_use',
      id: toolUse.id,
      name: toolUse.name,
      input: toolUse.input,
    };
  }

  const text = block as TextBlock;
  return {
    type: 'text',
    text: text.text,
  };
}

function mapMessage(message: ProviderMessage): AnthropicMessage {
  if (typeof message.content === 'string') {
    return {
      role: message.role,
      content: message.content,
    };
  }

  return {
    role: message.role,
    content: message.content.map(mapBlockToAnthropic),
  };
}

function mapResponse(payload: AnthropicResponse): ProviderResponse {
  const normalizedContent: Array<TextBlock | ToolUseBlock> = [];

  for (const block of payload.content ?? []) {
    if (!block || typeof block !== 'object') continue;

    if (block.type === 'text' && typeof block.text === 'string') {
      normalizedContent.push({
        type: 'text',
        text: block.text,
      });
      continue;
    }

    if (
      block.type === 'tool_use' &&
      typeof block.id === 'string' &&
      typeof block.name === 'string' &&
      block.input &&
      typeof block.input === 'object'
    ) {
      normalizedContent.push({
        type: 'tool_use',
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      });
    }
  }

  return {
    stopReason: payload.stop_reason ?? 'end_turn',
    content: normalizedContent,
  };
}

function requireApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return apiKey;
}

export class AnthropicProvider implements ChatModelProvider {
  async generate(input: GenerateModelInput): Promise<ProviderResponse> {
    const apiKey = requireApiKey();

    const tools: AnthropicTool[] = input.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        system: input.systemPrompt,
        max_tokens: input.maxTokens ?? 900,
        temperature: input.temperature ?? 0,
        tools,
        messages: input.messages.map(mapMessage),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Anthropic request failed (${response.status}): ${body || 'Unknown error'}`);
    }

    const payload = (await response.json()) as AnthropicResponse;
    return mapResponse(payload);
  }
}
