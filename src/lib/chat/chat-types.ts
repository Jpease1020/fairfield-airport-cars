export type ChatRole = 'user' | 'assistant';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface DraftLocation {
  address: string;
  coordinates: Coordinates;
}

export type FareType = 'personal' | 'business';

export interface DraftCustomer {
  name: string;
  email: string;
  phone: string;
  smsOptIn?: boolean;
}

export interface DraftQuote {
  quoteId: string;
  fare: number;
  distanceMiles: number;
  durationMinutes: number;
  expiresAt: string;
  availabilityWarning?: string | null;
  suggestedTimes?: string[];
}

export interface BookingDraft {
  pickup?: DraftLocation;
  dropoff?: DraftLocation;
  pickupDateTime?: string;
  fareType?: FareType;
  customer?: DraftCustomer;
  quote?: DraftQuote;
}

export interface ConfirmationSummary {
  pickupAddress: string;
  dropoffAddress: string;
  pickupDateTime: string;
  fareType: FareType;
  fare: number;
  quoteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface ConfirmationContext {
  token: string;
  summaryHash: string;
  expiresAt: string;
  summary: ConfirmationSummary;
}

export interface ChatRequest {
  messages: ChatMessage[];
  draft?: BookingDraft;
  confirm?: {
    accepted: boolean;
    token?: string;
    summaryHash?: string;
  };
}

export interface ChatResponse {
  message: string;
  draft: BookingDraft;
  showConfirmation: boolean;
  confirmation?: ConfirmationContext;
  bookingId?: string;
  handoff?: {
    reason: string;
    phone: string;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  type: 'tool_result';
  toolUseId: string;
  content: string;
}

export type ProviderInputBlock = TextBlock | ToolUseBlock | ToolResultBlock;

export interface ProviderMessage {
  role: ChatRole;
  content: string | ProviderInputBlock[];
}

export interface ProviderResponse {
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
  content: Array<TextBlock | ToolUseBlock>;
}

export interface GenerateModelInput {
  systemPrompt: string;
  tools: ToolDefinition[];
  messages: ProviderMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface ChatModelProvider {
  generate(input: GenerateModelInput): Promise<ProviderResponse>;
}
