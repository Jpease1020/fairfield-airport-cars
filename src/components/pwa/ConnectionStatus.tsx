'use client';

import React, { useState, useEffect } from 'react';
import { Box, Text } from '@/design/ui';
import { isOnline, addConnectionListener } from '@/lib/pwa';
import { colors } from '@/design/system/tokens/tokens';
import styled from 'styled-components';

const StatusBanner = styled(Box)<{ isOnline: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0.5rem 1rem;
  background-color: ${({ isOnline }) => isOnline ? colors.success[500] : colors.danger[500]};
  color: ${colors.text.white};
  text-align: center;
  transform: translateY(${({ isOnline }) => isOnline ? '-100%' : '0'});
  transition: transform 0.3s ease;
`;

export const ConnectionStatus: React.FC = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(isOnline());
    addConnectionListener(setOnline);
  }, []);

  if (online) return null;

  return (
    <StatusBanner isOnline={online}>
      <Text size="sm" weight="medium">
        📡 You're offline. Booking requires an internet connection.
      </Text>
    </StatusBanner>
  );
};



