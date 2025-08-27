'use client';

import React from 'react';
import { type CommentRecord } from '@/lib/business/comments-service';
import { colors } from '@/design/foundation/tokens/tokens';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import styled from 'styled-components';

interface StatusBadgeProps {
  status: CommentRecord['status'];
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const BadgeContainer = styled.div<{ status: CommentRecord['status'] }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid;
  
  ${({ status }) => {
    switch (status) {
      case 'open':
        return `
          background-color: ${colors.danger[100]};
          color: ${colors.danger[600]};
          border-color: ${colors.danger[200]};
        `;
      case 'in-progress':
        return `
          background-color: ${colors.warning[100]};
          color: ${colors.warning[600]};
          border-color: ${colors.warning[200]};
        `;
      case 'resolved':
        return `
          background-color: ${colors.success[100]};
          color: ${colors.success[600]};
          border-color: ${colors.success[200]};
        `;
      default:
        return `
          background-color: ${colors.gray[100]};
          color: ${colors.gray[600]};
          border-color: ${colors.gray[200]};
        `;
    }
  }}
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
`;

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <BadgeContainer status={status}>
      <StatusIcon>
        {getStatusIcon()}
      </StatusIcon>
      {children || status}
    </BadgeContainer>
  );
} 