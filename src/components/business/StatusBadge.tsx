'use client';

import styled from 'styled-components';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { type ConfluenceComment } from '@/lib/business/confluence-comments';
import { defaultColors } from '@/design/system/tokens/cms-integrated-colors';

interface StatusBadgeProps {
  status: ConfluenceComment['status'];
  children?: React.ReactNode;
}

const BadgeContainer = styled.div<{ status: ConfluenceComment['status'] }>`
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
          background-color: ${defaultColors.background.error};
          color: ${defaultColors.text.error};
          border-color: ${defaultColors.border.error};
        `;
      case 'in-progress':
        return `
          background-color: ${defaultColors.background.warning};
          color: ${defaultColors.text.warning};
          border-color: ${defaultColors.border.warning};
        `;
      case 'resolved':
        return `
          background-color: ${defaultColors.background.success};
          color: ${defaultColors.text.success};
          border-color: ${defaultColors.border.success};
        `;
      default:
        return `
          background-color: ${defaultColors.background.muted};
          color: ${defaultColors.text.primary};
          border-color: ${defaultColors.border.secondary};
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