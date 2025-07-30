import React from 'react';
import type { ComponentRegistry } from '@/types/page-templates';

// Import form components
import { Button } from '../components/core/layout/button';
import { Input, Select, Form } from '../components/core/layout/FormSystem';
import { Label } from '../components/core/layout/label';
import { Switch } from '../components/core/layout/switch';
import { EditableButton } from '../components/core/layout/EditableSystem';
import { VoiceInput } from '../components/core/layout/voice-input';

// Form Component Registry
export const FormComponents: ComponentRegistry = {
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
  Input: {
    component: Input,
    defaultProps: { type: 'text', size: 'md' },
    category: 'form',
    description: 'Text input component',
    props: {
      type: { type: 'string', required: false, default: 'text', description: 'Input type' },
      size: { type: 'string', required: false, default: 'md', description: 'Input size' },
      placeholder: { type: 'string', required: false, description: 'Placeholder text' },
      disabled: { type: 'boolean', required: false, default: false, description: 'Whether input is disabled' },
      required: { type: 'boolean', required: false, default: false, description: 'Whether input is required' }
    }
  },
  Label: {
    component: Label,
    defaultProps: { size: 'md' },
    category: 'form',
    description: 'Form label component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Label size' },
      required: { type: 'boolean', required: false, default: false, description: 'Show required indicator' }
    }
  },
  Form: {
    component: Form,
    defaultProps: { layout: 'vertical' },
    category: 'form',
    description: 'Form container component',
    props: {
      layout: { type: 'string', required: false, default: 'vertical', description: 'Form layout' },
      spacing: { type: 'string', required: false, default: 'md', description: 'Form spacing' }
    }
  },
  Select: {
    component: Select,
    defaultProps: { size: 'md' },
    category: 'form',
    description: 'Select dropdown component',
    props: {
      size: { type: 'string', required: false, default: 'md', description: 'Select size' },
      placeholder: { type: 'string', required: false, description: 'Placeholder text' },
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
  }
};

// Helper functions
export const getFormComponent = (name: string) => {
  return FormComponents[name]?.component;
};

export const getFormComponentDefaults = (name: string) => {
  return FormComponents[name]?.defaultProps || {};
};

export const getFormComponentMetadata = (name: string) => {
  return FormComponents[name];
}; 