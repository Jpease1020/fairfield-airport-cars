import React from 'react';
import type { ComponentRegistry } from '@/types/page-templates';

// Import layout components
import { Card } from '@/components/ui/card';
import { Grid, GridSection } from '@/components/ui/layout';
import { Container, Stack, Box } from '@/components/ui/layout/containers';
import { ActionCard } from '@/components/ui/ActionCard';
import { InfoCard } from '@/components/ui/InfoCard';
import { StatCard } from '@/components/ui/StatCard';
import { HelpCard } from '@/components/ui/HelpCard';
import { SettingSection } from '@/components/ui/SettingSection';
import { FormSection } from '@/components/ui/FormSection';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/Modal';

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
  },
  ActionCard: {
    component: ActionCard,
    defaultProps: { variant: 'default' },
    category: 'layout',
    description: 'Action card component',
    props: {
      variant: { type: 'string', required: false, default: 'default', description: 'Card variant' },
      hover: { type: 'boolean', required: false, default: true, description: 'Enable hover effects' }
    }
  },
  InfoCard: {
    component: InfoCard,
    defaultProps: { variant: 'info' },
    category: 'layout',
    description: 'Information card component',
    props: {
      variant: { type: 'string', required: false, default: 'info', description: 'Card variant' },
      icon: { type: 'string', required: false, description: 'Card icon' }
    }
  },
  StatCard: {
    component: StatCard,
    defaultProps: { variant: 'default' },
    category: 'layout',
    description: 'Statistics card component',
    props: {
      variant: { type: 'string', required: false, default: 'default', description: 'Card variant' },
      trend: { type: 'string', required: false, description: 'Trend indicator' }
    }
  },
  HelpCard: {
    component: HelpCard,
    defaultProps: { variant: 'help' },
    category: 'layout',
    description: 'Help card component',
    props: {
      variant: { type: 'string', required: false, default: 'help', description: 'Card variant' },
      collapsible: { type: 'boolean', required: false, default: false, description: 'Make card collapsible' }
    }
  },
  SettingSection: {
    component: SettingSection,
    defaultProps: { title: 'Settings' },
    category: 'layout',
    description: 'Settings section component',
    props: {
      title: { type: 'string', required: false, default: 'Settings', description: 'Section title' },
      description: { type: 'string', required: false, description: 'Section description' }
    }
  },
  FormSection: {
    component: FormSection,
    defaultProps: { title: 'Form' },
    category: 'layout',
    description: 'Form section component',
    props: {
      title: { type: 'string', required: false, default: 'Form', description: 'Section title' },
      description: { type: 'string', required: false, description: 'Section description' }
    }
  },
  EmptyState: {
    component: EmptyState,
    defaultProps: { variant: 'default' },
    category: 'layout',
    description: 'Empty state component',
    props: {
      variant: { type: 'string', required: false, default: 'default', description: 'Empty state variant' },
      icon: { type: 'string', required: false, description: 'Empty state icon' }
    }
  },
  Skeleton: {
    component: Skeleton,
    defaultProps: { variant: 'text' },
    category: 'layout',
    description: 'Skeleton loading component',
    props: {
      variant: { type: 'string', required: false, default: 'text', description: 'Skeleton variant' },
      width: { type: 'string', required: false, description: 'Skeleton width' },
      height: { type: 'string', required: false, description: 'Skeleton height' }
    }
  },
  Modal: {
    component: Modal,
    defaultProps: { size: 'md' },
    category: 'layout',
    description: 'Modal dialog component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Modal size' },
      closeOnOverlayClick: { type: 'boolean', required: false, default: true, description: 'Close on overlay click' }
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