'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styled from 'styled-components';

// ===== STYLED COMPONENTS =====

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a1a1a;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ $isOutbound: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.4;
  align-self: ${({ $isOutbound }) => ($isOutbound ? 'flex-end' : 'flex-start')};
  background-color: ${({ $isOutbound }) => ($isOutbound ? '#007AFF' : '#E9E9EB')};
  color: ${({ $isOutbound }) => ($isOutbound ? '#fff' : '#1a1a1a')};
`;

const MessageTime = styled.span<{ $isOutbound: boolean }>`
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: ${({ $isOutbound }) => ($isOutbound ? 'right' : 'left')};
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 0;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 16px;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #007AFF;
  }

  &:disabled {
    background-color: #f5f5f5;
  }
`;

const SendButton = styled.button`
  padding: 0 20px;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  min-width: 70px;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div<{ $type: 'error' | 'success' | 'loading' }>`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  background-color: ${({ $type }) =>
    $type === 'error' ? '#fee2e2' : $type === 'success' ? '#dcfce7' : '#f3f4f6'};
  color: ${({ $type }) =>
    $type === 'error' ? '#dc2626' : $type === 'success' ? '#16a34a' : '#4b5563'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

// ===== TYPES =====

interface SmsMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: string;
}

interface ThreadData {
  id: string;
  customerPhone: string;
  customerName?: string;
  messages: SmsMessage[];
}

// ===== COMPONENT =====

export default function ReplyPage() {
  const params = useParams();
  const threadId = (params?.threadId as string) || '';

  const [thread, setThread] = useState<ThreadData | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load thread data
  useEffect(() => {
    async function loadThread() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/twilio/sms/thread/${threadId}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError('Conversation not found');
          } else {
            setError('Failed to load conversation');
          }
          return;
        }

        const data = await res.json();
        setThread(data);
      } catch (err) {
        setError('Failed to load conversation');
        console.error('Error loading thread:', err);
      } finally {
        setLoading(false);
      }
    }

    if (threadId) {
      loadThread();
    }
  }, [threadId]);

  // Send message
  async function handleSend() {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      const res = await fetch('/api/twilio/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          message: message.trim(),
          secret: process.env.NEXT_PUBLIC_SMS_REPLY_SECRET,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      // Add message to local state
      const newMessage: SmsMessage = {
        id: Date.now().toString(),
        direction: 'outbound',
        body: message.trim(),
        timestamp: new Date().toISOString(),
      };

      setThread(prev =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, newMessage],
            }
          : null
      );

      setMessage('');
      setSuccess('Message sent!');

      // Clear success after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  // Handle Enter key
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Format timestamp
  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // Format phone number for display
  function formatPhone(phone: string) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  }

  // Loading state
  if (loading) {
    return (
      <Container>
        <StatusMessage $type="loading">Loading conversation...</StatusMessage>
      </Container>
    );
  }

  // Error state
  if (error && !thread) {
    return (
      <Container>
        <StatusMessage $type="error">{error}</StatusMessage>
      </Container>
    );
  }

  // No thread found
  if (!thread) {
    return (
      <Container>
        <EmptyState>Conversation not found</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          {thread.customerName || formatPhone(thread.customerPhone)}
        </Title>
        <Subtitle>
          {thread.customerName ? formatPhone(thread.customerPhone) : 'Customer'}
        </Subtitle>
      </Header>

      {error && <StatusMessage $type="error">{error}</StatusMessage>}
      {success && <StatusMessage $type="success">{success}</StatusMessage>}

      <MessagesContainer>
        {thread.messages.length === 0 ? (
          <EmptyState>No messages yet</EmptyState>
        ) : (
          thread.messages.map(msg => (
            <div key={msg.id}>
              <MessageBubble $isOutbound={msg.direction === 'outbound'}>
                {msg.body}
              </MessageBubble>
              <MessageTime $isOutbound={msg.direction === 'outbound'}>
                {formatTime(msg.timestamp)}
              </MessageTime>
            </div>
          ))
        )}
      </MessagesContainer>

      <InputContainer>
        <TextArea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply..."
          disabled={sending}
          rows={1}
        />
        <SendButton onClick={handleSend} disabled={!message.trim() || sending}>
          {sending ? '...' : 'Send'}
        </SendButton>
      </InputContainer>
    </Container>
  );
}
