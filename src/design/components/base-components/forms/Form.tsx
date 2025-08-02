'use client';

import React from 'react';
import styled from 'styled-components';

const StyledForm = styled.form`
  display: block;
  width: 100%;
`;

export interface FormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  method?: 'get' | 'post';
  action?: string;
  noValidate?: boolean;
  [key: string]: any;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  method = 'post',
  action,
  noValidate = false,
  ...rest
}) => {
  return (
    <StyledForm
      onSubmit={onSubmit}
      method={method}
      action={action}
      noValidate={noValidate}
      {...rest}
    >
      {children}
    </StyledForm>
  );
};