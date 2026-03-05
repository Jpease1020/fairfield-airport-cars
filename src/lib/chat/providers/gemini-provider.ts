import type {
  ChatModelProvider,
  GenerateModelInput,
  ProviderInputBlock,
  ProviderMessage,
  ProviderResponse,
  TextBlock,
  ToolDefinition,
  ToolResultBlock,
  ToolUseBlock,
} from '@/lib/chat/chat-types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash';

interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

interface GeminiFunctionCall {
  id?: string;
  name?: string;
  args?: Record<string, unknown>;
}

interface GeminiFunctionResponse {
  name: string;
  response: Record<string, unknown>;
}

interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: GeminiFunctionResponse;
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiPart[];
  };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
}

function requireApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return apiKey;
}

function getModel(): string {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

function toGeminiRole(role: ProviderMessage['role']): 'user' | 'model' {
  return role === 'assistant' ? 'model' : 'user';
}

function normalizeObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return { value };
}

function parseToolResult(content: string): Record<string, unknown> {
  try {
    return normalizeObject(JSON.parse(content));
  } catch {
    return { value: content };
  }
}

function mapMessage(
  message: ProviderMessage,
  toolNameById: Map<string, string>,
): GeminiContent {
  if (typeof message.content === 'string') {
    return {
      role: toGeminiRole(message.role),
      parts: [{ text: message.content }],
    };
  }

  const parts: GeminiPart[] = [];

  for (const block of message.content as ProviderInputBlock[]) {
    if (block.type === 'text') {
      parts.push({ text: (block as TextBlock).text });
      continue;
    }

    if (block.type === 'tool_use') {
      const toolUse = block as ToolUseBlock;
      toolNameById.set(toolUse.id, toolUse.name);
      parts.push({
        functionCall: {
          id: toolUse.id,
          name: toolUse.name,
          args: toolUse.input,
        },
      });
      continue;
    }

    const toolResult = block as ToolResultBlock;
    const toolName = toolNameById.get(toolResult.toolUseId) ?? 'unknown_tool';
    parts.push({
      functionResponse: {
        name: toolName,
        response: parseToolResult(toolResult.content),
      },
    });
  }

  if (parts.length === 0) {
    parts.push({ text: '' });
  }

  return {
    role: toGeminiRole(message.role),
    parts,
  };
}

function mapMessages(messages: ProviderMessage[]): GeminiContent[] {
  const toolNameById = new Map<string, string>();
  return messages.map((message) => mapMessage(message, toolNameById));
}

function mapTools(tools: ToolDefinition[]): GeminiFunctionDeclaration[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  }));
}

function mapStopReason(candidate: GeminiCandidate, usedTools: boolean): ProviderResponse['stopReason'] {
  if (usedTools) return 'tool_use';

  switch (candidate.finishReason) {
    case 'MAX_TOKENS':
      return 'max_tokens';
    case 'STOP':
      return 'end_turn';
    default:
      return 'stop_sequence';
  }
}

function mapResponse(payload: GeminiResponse): ProviderResponse {
  const candidate = payload.candidates?.[0];
  if (!candidate) {
    throw new Error(`Gemini response missing candidates (${payload.promptFeedback?.blockReason ?? 'unknown'})`);
  }

  const content: Array<TextBlock | ToolUseBlock> = [];
  const parts = candidate.content?.parts ?? [];

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (typeof part.text === 'string' && part.text.length > 0) {
      content.push({
        type: 'text',
        text: part.text,
      });
    }

    const functionCall = part.functionCall;
    if (functionCall?.name) {
      content.push({
        type: 'tool_use',
        id: functionCall.id || `tool_${i}_${functionCall.name}`,
        name: functionCall.name,
        input: normalizeObject(functionCall.args ?? {}),
      });
    }
  }

  const usedTools = content.some((block) => block.type === 'tool_use');
  return {
    stopReason: mapStopReason(candidate, usedTools),
    content,
  };
}

export class GeminiProvider implements ChatModelProvider {
  async generate(input: GenerateModelInput): Promise<ProviderResponse> {
    const apiKey = requireApiKey();
    const model = getModel();
    const url = `${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: input.systemPrompt }],
        },
        contents: mapMessages(input.messages),
        tools: input.tools.length
          ? [
              {
                functionDeclarations: mapTools(input.tools),
              },
            ]
          : undefined,
        generationConfig: {
          temperature: input.temperature ?? 0,
          maxOutputTokens: input.maxTokens ?? 900,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Gemini request failed (${response.status}): ${body || 'Unknown error'}`);
    }

    const payload = (await response.json()) as GeminiResponse;
    return mapResponse(payload);
  }
}
