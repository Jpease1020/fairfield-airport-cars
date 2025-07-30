import React from 'react';
import type { 
  ComponentRegistry, 
  TemplateCategories 
} from '@/types/page-templates';

// Import all UI components for the registry
import { Button } from '../components/core/layout/button';
import { Card } from '../components/core/layout/card';
import { Text } from '../components/core/layout/text';
import { EditableHeading, EditableText, EditableButton } from '../components/core/layout/EditableSystem';
import { Grid, GridSection } from '../components/core/layout/layout/grid';
import { Container, Stack, Box } from '../components/core/layout/layout/containers';
import { Input, Form, Select } from '../components/core/layout/FormSystem';
import { Label } from '../components/core/layout/label';
import { LoadingSpinner } from '../components/core/layout/LoadingSpinner';
import { Badge } from '../components/core/layout/badge';
import { Switch } from '../components/core/layout/switch';
import { SettingToggle } from '../components/core/layout/SettingToggle';
import { VoiceInput } from '../components/core/layout/voice-input';
import { VoiceOutput } from '../components/core/layout/voice-output';
import { AccessibilityEnhancer } from '../components/core/layout/AccessibilityEnhancer';

// Component Registry
// This maps component names to their actual components and default props
export const ComponentRegistryData: ComponentRegistry = {
  Button: {
    component: Button,
    defaultProps: { variant: 'primary', size: 'md' },
    category: 'form',
    description: 'Interactive button component with multiple variants',
    props: {
      variant: { type: 'string', required: false, default: 'primary', description: 'Button style variant' },
      size: { type: 'string', required: false, default: 'md', description: 'Button size' },
      disabled: { type: 'boolean', required: false, default: false, description: 'Whether button is disabled' },
      loading: { type: 'boolean', required: false, default: false, description: 'Show loading state' },
      fullWidth: { type: 'boolean', required: false, default: false, description: 'Full width button' },
      icon: { type: 'string', required: false, description: 'Icon to display' },
      iconPosition: { type: 'string', required: false, default: 'left', description: 'Icon position' }
    }
  },
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
  Text: {
    component: Text,
    defaultProps: { variant: 'body', size: 'md' },
    category: 'content',
    description: 'Text component with typography variants',
    props: {
      variant: { type: 'string', required: false, default: 'body', description: 'Text style variant' },
      size: { type: 'string', required: false, default: 'md', description: 'Text size' },
      color: { type: 'string', required: false, description: 'Text color' },
      align: { type: 'string', required: false, description: 'Text alignment' }
    }
  },
  Heading: {
    component: EditableHeading,
    defaultProps: { level: 2, size: 'lg' },
    category: 'content',
    description: 'Editable heading component',
    props: {
      level: { type: 'number', required: false, default: 2, description: 'Heading level (1-6)' },
      size: { type: 'string', required: false, default: 'lg', description: 'Heading size' },
      color: { type: 'string', required: false, description: 'Heading color' },
      align: { type: 'string', required: false, description: 'Text alignment' }
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
    defaultProps: { cols: 3, gap: 'md', padding: 'lg' },
    category: 'layout',
    description: 'Grid section with title and subtitle',
    props: {
      cols: { type: 'number', required: false, default: 3, description: 'Number of columns' },
      gap: { type: 'string', required: false, default: 'md', description: 'Grid gap' },
      padding: { type: 'string', required: false, default: 'lg', description: 'Section padding' },
      title: { type: 'string', required: false, description: 'Section title' },
      subtitle: { type: 'string', required: false, description: 'Section subtitle' }
    }
  },
  Container: {
    component: Container,
    defaultProps: { variant: 'default', maxWidth: 'xl', padding: 'md' },
    category: 'layout',
    description: 'Container component for page sections',
    props: {
      variant: { type: 'string', required: false, default: 'default', description: 'Container variant' },
      maxWidth: { type: 'string', required: false, default: 'xl', description: 'Maximum width' },
      padding: { type: 'string', required: false, default: 'md', description: 'Container padding' }
    }
  },
  Stack: {
    component: Stack,
    defaultProps: { direction: 'vertical', spacing: 'md' },
    category: 'layout',
    description: 'Flexible stack layout component',
    props: {
      direction: { type: 'string', required: false, default: 'vertical', description: 'Stack direction' },
      spacing: { type: 'string', required: false, default: 'md', description: 'Spacing between items' },
      align: { type: 'string', required: false, description: 'Alignment' },
      justify: { type: 'string', required: false, description: 'Justification' }
    }
  },
  Box: {
    component: Box,
    defaultProps: { variant: 'default', padding: 'md', rounded: 'md' },
    category: 'layout',
    description: 'Box container component',
    props: {
      variant: { type: 'string', required: false, default: 'default', description: 'Box variant' },
      padding: { type: 'string', required: false, default: 'md', description: 'Box padding' },
      rounded: { type: 'string', required: false, default: 'md', description: 'Border radius' }
    }
  },
  Input: {
    component: Input,
    defaultProps: { size: 'md', variant: 'default' },
    category: 'form',
    description: 'Form input component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Input size' },
      variant: { type: 'string', required: false, default: 'default', description: 'Input variant' },
      disabled: { type: 'boolean', required: false, default: false, description: 'Whether input is disabled' },
      placeholder: { type: 'string', required: false, description: 'Input placeholder' }
    }
  },
  Label: {
    component: Label,
    defaultProps: { size: 'md', variant: 'default' },
    category: 'form',
    description: 'Form label component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Label size' },
      variant: { type: 'string', required: false, default: 'default', description: 'Label variant' },
      required: { type: 'boolean', required: false, default: false, description: 'Show required indicator' }
    }
  },
  Form: {
    component: Form,
    defaultProps: { spacing: 'md' },
    category: 'form',
    description: 'Form container component',
    props: {
      spacing: { type: 'string', required: false, default: 'md', description: 'Form spacing' },
      onSubmit: { type: 'function', required: false, description: 'Form submit handler' }
    }
  },

  LoadingSpinner: {
    component: LoadingSpinner,
    defaultProps: { variant: 'dots', size: 'md', centered: true },
    category: 'feedback',
    description: 'Loading indicator component',
    props: {
      variant: { type: 'string', required: false, default: 'dots', description: 'Spinner variant' },
      size: { type: 'string', required: false, default: 'md', description: 'Spinner size' },
      text: { type: 'string', required: false, description: 'Loading text' },
      centered: { type: 'boolean', required: false, default: true, description: 'Center the spinner' }
    }
  },

  Badge: {
    component: Badge,
    defaultProps: { variant: 'default', size: 'md' },
    category: 'content',
    description: 'Badge component',
    props: {
      variant: { type: 'string', required: false, default: 'default', description: 'Badge variant' },
      size: { type: 'string', required: false, default: 'md', description: 'Badge size' }
    }
  },


  Select: {
    component: Select,
    defaultProps: { size: 'md' },
    category: 'form',
    description: 'Select dropdown component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Select size' },
      disabled: { type: 'boolean', required: false, default: false, description: 'Whether select is disabled' }
    }
  },
  Switch: {
    component: Switch,
    defaultProps: { size: 'md' },
    category: 'form',
    description: 'Toggle switch component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Switch size' },
      disabled: { type: 'boolean', required: false, default: false, description: 'Whether switch is disabled' }
    }
  },
  SettingToggle: {
    component: SettingToggle,
    defaultProps: { size: 'md' },
    category: 'form',
    description: 'Setting toggle component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Toggle size' },
      disabled: { type: 'boolean', required: false, default: false, description: 'Whether toggle is disabled' }
    }
  },

  EditableText: {
    component: EditableText,
    defaultProps: { variant: 'body', size: 'md' },
    category: 'content',
    description: 'Editable text component',
    props: {
      variant: { type: 'string', required: false, default: 'body', description: 'Text variant' },
      size: { type: 'string', required: false, default: 'md', description: 'Text size' },
      align: { type: 'string', required: false, description: 'Text alignment' },
      color: { type: 'string', required: false, description: 'Text color' }
    }
  },
  EditableButton: {
    component: EditableButton,
    defaultProps: { variant: 'primary', size: 'md' },
    category: 'form',
    description: 'Editable button component',
    props: {
      variant: { type: 'string', required: false, default: 'primary', description: 'Button variant' },
      size: { type: 'string', required: false, default: 'md', description: 'Button size' }
    }
  },

  VoiceInput: {
    component: VoiceInput,
    defaultProps: { size: 'md' },
    category: 'form',
    description: 'Voice input component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Component size' }
    }
  },
  VoiceOutput: {
    component: VoiceOutput,
    defaultProps: { size: 'md' },
    category: 'feedback',
    description: 'Voice output component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Component size' }
    }
  },
  AccessibilityEnhancer: {
    component: AccessibilityEnhancer,
    defaultProps: { size: 'md' },
    category: 'feedback',
    description: 'Accessibility enhancement component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Component size' }
    }
  }
};

// Template Categories
export const TemplateCategoriesData: TemplateCategories = {
  marketing: {
    hero: 'Landing page with hero section',
    features: 'Feature showcase page',
    pricing: 'Pricing comparison page',
    contact: 'Contact form page',
    about: 'About us page'
  },
  admin: {
    dashboard: 'Admin dashboard',
    list: 'Data list page',
    form: 'Form page',
    detail: 'Detail view page'
  },
  booking: {
    search: 'Booking search page',
    form: 'Booking form page',
    confirmation: 'Booking confirmation page',
    status: 'Booking status page'
  },
  content: {
    article: 'Article/blog post page',
    gallery: 'Image gallery page',
    faq: 'FAQ page',
    terms: 'Legal page'
  }
};

// Helper function to get component by name
export const getComponent = (name: string) => {
  return ComponentRegistryData[name]?.component;
};

// Helper function to get component default props
export const getComponentDefaults = (name: string) => {
  return ComponentRegistryData[name]?.defaultProps || {};
};

// Helper function to get component metadata
export const getComponentMetadata = (name: string) => {
  return ComponentRegistryData[name];
};

// Helper function to get all components by category
export const getComponentsByCategory = (category: string) => {
  return Object.entries(ComponentRegistryData)
    .filter(([_, metadata]) => metadata.category === category)
    .reduce((acc, [name, metadata]) => {
      acc[name] = metadata;
      return acc;
    }, {} as Record<string, any>);
}; 