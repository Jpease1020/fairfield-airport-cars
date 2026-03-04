import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { CHAT_SYSTEM_PROMPT } from '@/lib/chat/chat-system-prompt';
import {
  CHAT_TOOL_DEFINITIONS,
  checkAvailability,
  createBooking,
  getQuote,
  handoffToHuman,
  resolveAddress,
  validateContactInfo,
  validateTripDetails,
  type ToolExecutionContext,
} from '@/lib/chat/chat-tools';
import { getLlmProvider } from '@/lib/chat/llm-provider';
import {
  buildConfirmationSummary,
  hashConfirmationSummary,
  issueConfirmationToken,
  verifyConfirmationToken,
} from '@/lib/chat/confirmation-token';
import type {
  BookingDraft,
  ChatResponse,
  ProviderInputBlock,
  ProviderMessage,
  ToolResultBlock,
  ToolUseBlock,
} from '@/lib/chat/chat-types';

export const runtime = 'nodejs';

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const locationSchema = z.object({
  address: z.string().min(1),
  coordinates: coordinatesSchema,
});

const draftSchema = z.object({
  pickup: locationSchema.optional(),
  dropoff: locationSchema.optional(),
  pickupDateTime: z.string().optional(),
  fareType: z.enum(['personal', 'business']).optional(),
  customer: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      smsOptIn: z.boolean().optional(),
    })
    .optional(),
  quote: z
    .object({
      quoteId: z.string().optional(),
      fare: z.number().optional(),
      distanceMiles: z.number().optional(),
      durationMinutes: z.number().optional(),
      expiresAt: z.string().optional(),
      availabilityWarning: z.string().nullable().optional(),
      suggestedTimes: z.array(z.string()).optional(),
    })
    .optional(),
});

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1),
      })
    )
    .min(1)
    .max(40),
  draft: z.unknown().optional().default({}),
  confirm: z
    .object({
      accepted: z.boolean(),
      token: z.string().optional(),
      summaryHash: z.string().optional(),
    })
    .optional(),
});

function isChatEnabled(): boolean {
  return process.env.CHAT_BOOKING_ENABLED === 'true';
}

function asToolUseBlocks(blocks: ProviderInputBlock[]): ToolUseBlock[] {
  return blocks.filter((block): block is ToolUseBlock => block.type === 'tool_use');
}

function extractAssistantText(blocks: Array<{ type: 'text'; text: string } | ToolUseBlock>): string {
  const firstText = blocks.find((block) => block.type === 'text');
  return firstText?.text ?? '';
}

function buildContext(request: Request): ToolExecutionContext {
  const origin = new URL(request.url).origin;
  return { origin };
}

function coerceDraft(raw: unknown): BookingDraft {
  const parsed = draftSchema.safeParse(raw);
  if (!parsed.success) return {};

  const value = parsed.data;
  const draft: BookingDraft = {};

  if (value.pickup) draft.pickup = value.pickup;
  if (value.dropoff) draft.dropoff = value.dropoff;
  if (value.pickupDateTime) draft.pickupDateTime = value.pickupDateTime;
  if (value.fareType) draft.fareType = value.fareType;

  if (
    value.customer &&
    typeof value.customer.name === 'string' &&
    typeof value.customer.email === 'string' &&
    typeof value.customer.phone === 'string'
  ) {
    draft.customer = {
      name: value.customer.name,
      email: value.customer.email,
      phone: value.customer.phone,
      smsOptIn: value.customer.smsOptIn ?? false,
    };
  }

  if (
    value.quote &&
    typeof value.quote.quoteId === 'string' &&
    typeof value.quote.fare === 'number'
  ) {
    draft.quote = {
      quoteId: value.quote.quoteId,
      fare: value.quote.fare,
      distanceMiles: value.quote.distanceMiles ?? 0,
      durationMinutes: value.quote.durationMinutes ?? 0,
      expiresAt: value.quote.expiresAt ?? new Date(Date.now() + 15 * 60_000).toISOString(),
      availabilityWarning: value.quote.availabilityWarning ?? null,
      suggestedTimes: value.quote.suggestedTimes ?? [],
    };
  }

  return draft;
}

function draftIsReadyForValidation(draft: BookingDraft): boolean {
  return !!(
    draft.pickup?.address &&
    draft.pickup?.coordinates &&
    draft.dropoff?.address &&
    draft.dropoff?.coordinates &&
    draft.pickupDateTime &&
    draft.customer?.name &&
    draft.customer?.email &&
    draft.customer?.phone &&
    draft.quote?.quoteId &&
    typeof draft.quote?.fare === 'number'
  );
}

async function executeToolCall(params: {
  name: string;
  input: Record<string, unknown>;
  draft: BookingDraft;
  context: ToolExecutionContext;
}): Promise<{
  result: unknown;
  draft: BookingDraft;
  handoff?: { reason: string; phone: string };
}> {
  const { name, input, context } = params;
  const draft: BookingDraft = {
    ...params.draft,
  };

  switch (name) {
    case 'resolve_address': {
      const query = typeof input.query === 'string' ? input.query : '';
      const result = await resolveAddress(context, query);
      return { result, draft };
    }

    case 'check_availability': {
      const pickupDateTime = typeof input.pickupDateTime === 'string' ? input.pickupDateTime : '';
      if (pickupDateTime) draft.pickupDateTime = pickupDateTime;
      const result = await checkAvailability(context, pickupDateTime);
      return { result, draft };
    }

    case 'get_quote': {
      const fareType: 'personal' | 'business' = input.fareType === 'business' ? 'business' : 'personal';
      const quoteInput = {
        origin: typeof input.origin === 'string' ? input.origin : '',
        destination: typeof input.destination === 'string' ? input.destination : '',
        pickupCoords: (input.pickupCoords as { lat: number; lng: number }) ?? { lat: 0, lng: 0 },
        dropoffCoords: (input.dropoffCoords as { lat: number; lng: number }) ?? { lat: 0, lng: 0 },
        pickupTime: typeof input.pickupTime === 'string' ? input.pickupTime : '',
        fareType,
      };

      const result = await getQuote(context, quoteInput);
      if (result.success && result.quoteId && typeof result.fare === 'number') {
        draft.pickup = {
          address: quoteInput.origin,
          coordinates: quoteInput.pickupCoords,
        };
        draft.dropoff = {
          address: quoteInput.destination,
          coordinates: quoteInput.dropoffCoords,
        };
        draft.pickupDateTime = quoteInput.pickupTime;
        draft.fareType = quoteInput.fareType;
        draft.quote = {
          quoteId: result.quoteId,
          fare: result.fare,
          distanceMiles: result.distanceMiles ?? 0,
          durationMinutes: result.durationMinutes ?? 0,
          expiresAt: result.expiresAt ?? new Date(Date.now() + 15 * 60_000).toISOString(),
          availabilityWarning: result.availabilityWarning ?? null,
          suggestedTimes: result.suggestedTimes ?? [],
        };
      }

      return { result, draft };
    }

    case 'validate_trip_details': {
      const trip = input.trip as {
        pickup: { address: string; coordinates: { lat: number; lng: number } };
        dropoff: { address: string; coordinates: { lat: number; lng: number } };
        pickupDateTime: string;
        fareType?: 'personal' | 'business';
      };

      if (trip?.pickup?.address && trip?.dropoff?.address && trip?.pickupDateTime) {
        draft.pickup = trip.pickup;
        draft.dropoff = trip.dropoff;
        draft.pickupDateTime = trip.pickupDateTime;
        draft.fareType = trip.fareType ?? 'personal';
      }

      const result = await validateTripDetails(context, {
        trip: {
          pickup: trip.pickup,
          dropoff: trip.dropoff,
          pickupDateTime: trip.pickupDateTime,
          fareType: trip.fareType,
        },
      });
      return { result, draft };
    }

    case 'validate_contact_info': {
      const customer = input.customer as {
        name: string;
        email: string;
        phone: string;
      };
      if (customer?.name && customer?.email && customer?.phone) {
        draft.customer = {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          smsOptIn: draft.customer?.smsOptIn ?? false,
        };
      }

      const result = await validateContactInfo(context, {
        customer: {
          name: customer?.name ?? '',
          email: customer?.email ?? '',
          phone: customer?.phone ?? '',
          smsOptIn: false,
        },
      });
      return { result, draft };
    }

    case 'handoff_to_human': {
      const reason = typeof input.reason === 'string' ? input.reason : 'Needs manual review';
      const result = await handoffToHuman(context, reason);
      return {
        result,
        draft,
        handoff: {
          reason: result.reason,
          phone: result.phone,
        },
      };
    }

    default:
      return {
        result: {
          error: `Unknown tool: ${name}`,
        },
        draft,
      };
  }
}

async function runConfirmedBooking(params: {
  context: ToolExecutionContext;
  draft: BookingDraft;
  token: string;
  summaryHash: string;
}): Promise<ChatResponse> {
  const summary = buildConfirmationSummary(params.draft);
  if (!summary) {
    return {
      message: 'I still need complete trip, quote, and contact details before booking.',
      draft: params.draft,
      showConfirmation: false,
    };
  }

  const computedHash = hashConfirmationSummary(summary);
  if (computedHash !== params.summaryHash) {
    return {
      message: 'Your booking details changed. Please review and confirm again.',
      draft: params.draft,
      showConfirmation: true,
    };
  }

  const tokenCheck = verifyConfirmationToken({
    token: params.token,
    summaryHash: computedHash,
  });

  if (!tokenCheck.ok) {
    return {
      message: 'Your confirmation expired. Please review details and confirm again.',
      draft: params.draft,
      showConfirmation: true,
    };
  }

  const bookingResult = await createBooking(params.context, {
    quoteId: summary.quoteId,
    fare: summary.fare,
    customer: {
      name: summary.customerName,
      email: summary.customerEmail,
      phone: summary.customerPhone,
      smsOptIn: params.draft.customer?.smsOptIn ?? false,
    },
    trip: {
      pickup: params.draft.pickup!,
      dropoff: params.draft.dropoff!,
      pickupDateTime: summary.pickupDateTime,
      fareType: summary.fareType,
    },
    quoteExpiresAt: params.draft.quote?.expiresAt,
  });

  if (!bookingResult.success || !bookingResult.bookingId) {
    return {
      message: bookingResult.errorMessage ?? 'Booking failed. Please try again.',
      draft: params.draft,
      showConfirmation: true,
    };
  }

  return {
    message: `You're booked. Your booking ID is ${bookingResult.bookingId}. A confirmation has been sent.`,
    draft: params.draft,
    showConfirmation: false,
    bookingId: bookingResult.bookingId,
  };
}

export async function POST(request: Request) {
  if (!isChatEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const limited = enforceRateLimit(request, {
    bucket: 'api:chat:booking-assistant',
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const raw = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Invalid request',
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const context = buildContext(request);
  const draft: BookingDraft = coerceDraft(parsed.data.draft);

  if (parsed.data.confirm?.accepted) {
    const token = parsed.data.confirm.token;
    const summaryHash = parsed.data.confirm.summaryHash;
    if (!token || !summaryHash) {
      return NextResponse.json(
        {
          message: 'Confirmation token is missing. Please confirm again.',
          draft,
          showConfirmation: true,
        },
        { status: 400 }
      );
    }

    const confirmed = await runConfirmedBooking({
      context,
      draft,
      token,
      summaryHash,
    });

    return NextResponse.json(confirmed);
  }

  const provider = getLlmProvider();
  const messageHistory: ProviderMessage[] = parsed.data.messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  let currentDraft = { ...draft };
  let assistantText = '';
  let handoff: { reason: string; phone: string } | undefined;

  for (let i = 0; i < 8; i++) {
    const modelResponse = await provider.generate({
      systemPrompt: CHAT_SYSTEM_PROMPT,
      tools: CHAT_TOOL_DEFINITIONS,
      messages: messageHistory,
      maxTokens: 900,
      temperature: 0.1,
    });

    if (modelResponse.stopReason === 'end_turn') {
      assistantText = extractAssistantText(modelResponse.content);
      break;
    }

    if (modelResponse.stopReason !== 'tool_use') {
      assistantText = extractAssistantText(modelResponse.content) || 'How would you like to proceed?';
      break;
    }

    const toolUseBlocks = asToolUseBlocks(modelResponse.content as ProviderInputBlock[]);
    if (toolUseBlocks.length === 0) {
      assistantText = extractAssistantText(modelResponse.content) || 'How would you like to proceed?';
      break;
    }

    const toolResults: ToolResultBlock[] = [];

    for (const block of toolUseBlocks) {
      const executed = await executeToolCall({
        name: block.name,
        input: block.input,
        draft: currentDraft,
        context,
      });

      currentDraft = executed.draft;
      if (executed.handoff) {
        handoff = executed.handoff;
      }

      toolResults.push({
        type: 'tool_result',
        toolUseId: block.id,
        content: JSON.stringify(executed.result),
      });
    }

    messageHistory.push({ role: 'assistant', content: modelResponse.content });
    messageHistory.push({ role: 'user', content: toolResults });
  }

  const response: ChatResponse = {
    message: assistantText || 'Tell me your pickup, dropoff, and preferred date/time to get started.',
    draft: currentDraft,
    showConfirmation: false,
  };

  if (handoff) {
    response.handoff = handoff;
  }

  if (draftIsReadyForValidation(currentDraft)) {
    const [tripValidation, contactValidation] = await Promise.all([
      validateTripDetails(context, {
        trip: {
          pickup: currentDraft.pickup!,
          dropoff: currentDraft.dropoff!,
          pickupDateTime: currentDraft.pickupDateTime!,
          fareType: currentDraft.fareType,
        },
      }),
      validateContactInfo(context, {
        customer: {
          name: currentDraft.customer!.name,
          email: currentDraft.customer!.email,
          phone: currentDraft.customer!.phone,
          smsOptIn: currentDraft.customer?.smsOptIn ?? false,
        },
      }),
    ]);

    if (tripValidation.valid && contactValidation.valid) {
      const summary = buildConfirmationSummary(currentDraft);
      if (summary) {
        const summaryHash = hashConfirmationSummary(summary);
        const { token, expiresAt } = issueConfirmationToken({ summaryHash });

        response.showConfirmation = true;
        response.confirmation = {
          token,
          summaryHash,
          expiresAt,
          summary,
        };
      }
    }
  }

  return NextResponse.json(response);
}
