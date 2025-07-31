import React from 'react';
import type { ComponentRegistry } from '@/types/page-templates';

// Import layout components
import { Card } from '../components/ui-components';
import { Grid, GridSection } from '../components/grid';
import { Container, Stack, Box } from '../components/grid';

// Layout Component Registry
export const LayoutComponents: ComponentRegistry = {
  Card: {
    component: Card,
    defaultProps: { variant: 'default', padding: 'md' },
    category: 'layout',
    description: 'Container component for content sections',
    props: {
      variant: { type: 'string', required: false, default: 'default', description: 'Card style variant' },
      padding: { type: 'string', required: false, default: 'md', description: 'Card padding' },
      hover: { type: 'boolean', required: false, default: false, description: 'Enable hover effects' }
    }
  },
  Grid: {
    component: Grid,
    defaultProps: { cols: 3, gap: 'md', responsive: true },
    category: 'layout',
    description: 'Responsive grid layout component',
    props: {
      cols: { type: 'number', required: false, default: 3, description: 'Number of columns' },
      gap: { type: 'string', required: false, default: 'md', description: 'Grid gap' },
      responsive: { type: 'boolean', required: false, default: true, description: 'Enable responsive behavior' }
    }
  },
  GridSection: {
    component: GridSection,
    defaultProps: { span: 1 },
    category: 'layout',
    description: 'Grid section component',
    props: {
      span: { type: 'number', required: false, default: 1, description: 'Number of columns to span' },
      start: { type: 'number', required: false, description: 'Starting column position' }
    }
  },
  Container: {
    component: Container,
    defaultProps: { maxWidth: 'lg', padding: 'md' },
    category: 'layout',
    description: 'Container component for content width control',
    props: {
      maxWidth: { type: 'string', required: false, default: 'lg', description: 'Maximum width' },
      padding: { type: 'string', required: false, default: 'md', description: 'Container padding' },
      center: { type: 'boolean', required: false, default: true, description: 'Center content' }
    }
  },
  Stack: {
    component: Stack,
    defaultProps: { direction: 'vertical', spacing: 'md' },
    category: 'layout',
    description: 'Stack layout component',
    props: {
      direction: { type: 'string', required: false, default: 'vertical', description: 'Stack direction' },
      spacing: { type: 'string', required: false, default: 'md', description: 'Stack spacing' },
      align: { type: 'string', required: false, description: 'Alignment' }
    }
  },
  Box: {
    component: Box,
    defaultProps: { padding: 'none' },
    category: 'layout',
    description: 'Box container component',
    props: {
      padding: { type: 'string', required: false, default: 'none', description: 'Box padding' },
      margin: { type: 'string', required: false, description: 'Box margin' }
    }
  }
};

// Helper functions
export const getLayoutComponent = (name: string) => {
  return LayoutComponents[name]?.component;
};

export const getLayoutComponentDefaults = (name: string) => {
  return LayoutComponents[name]?.defaultProps || {};
};

export const getLayoutComponentMetadata = (name: string) => {
  return LayoutComponents[name];
}; 