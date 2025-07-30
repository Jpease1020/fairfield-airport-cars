// Layout Components (Moved)
export { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
// Layout Components


// Data Display Components  
export { ActivityItem } from './ActivityItem';
export { ActivityList } from './ActivityList';
export { ActionGrid } from '../../business/admin/ActionGrid';

// New Reusable Admin Components (Phase 1 & 2)

export { DataTable } from './DataTable';
export type { DataTableColumn, DataTableAction } from './DataTable';

// Settings Components (Phase 3)
export { SettingToggle } from './SettingToggle';
export type { SettingToggleProps } from './SettingToggle';

// Utility Components (Phase 4)
export { StatusMessage } from './StatusMessage';
export type { StatusMessageProps } from './StatusMessage';
export { ActionButtonGroup } from './ActionButtonGroup';
export type { ActionButtonGroupProps, ActionButton } from './ActionButtonGroup';

// Toast System (Phase 5)
export { ToastProvider, useToast } from './ToastProvider';
export type { Toast } from './ToastProvider';

// Chat System (Phase 6)
export { ChatMessage } from './ChatMessage';
export type { ChatMessage as ChatMessageType, ChatMessageProps } from './ChatMessage';
export { ChatInput } from './ChatInput';
export type { ChatInputProps } from './ChatInput';
export { ChatContainer } from './ChatContainer';
export type { ChatContainerProps } from './ChatContainer';

// CMS Components (Phase 7)
export { 
  GenericPageEditor,
  HomePageEditor,
  BookingPageEditor,
  HelpPageEditor
} from '../../business/cms/PageEditors';
export type { 
  GenericPageEditorProps,
  HomePageEditorProps,
  BookingPageEditorProps,
  HelpPageEditorProps
} from '../../business/cms/PageEditors';

// Base UI Components (Card exported from containers - bulletproof!)  
export { Card } from './card';
export type { CardProps } from './card';
export { LoadingSpinner } from './LoadingSpinner';
export { Badge } from './badge';
export { Button } from './button';
export { GridItem } from './layout/grid';
export type { GridItemProps } from './layout/grid';


// Form Components
export { 
  Form
} from './FormSystem';

// Text Components ONLY (Layout components from containers!)
export { 
  H1, H2, H3, H4, H5, H6,
  Text, 
  Paragraph, 
  Span,
  Link
} from './text';

// Editable Components
export { EditableTextarea } from './EditableTextarea';

// BULLETPROOF Layout Components (NEVER from text.tsx!)
export { Container, Box, Section, Stack, MarginEnforcer } from './layout/containers';
export { Layout, Spacer } from './layout/containers';
export { Grid, GridSection } from './layout/grid';
export { IconContainer, ContentContainer, HeaderContainer, ActionsContainer, EditContainer } from './layout/components';

// Accessibility
export { AccessibilityEnhancer } from './AccessibilityEnhancer';

// Error Handling
export { ErrorBoundary } from './ErrorBoundary';

// Moved Components (Now Properly Located in UI!)
export { FormField } from './FormSystem';
export { StatusBadge } from './StatusBadge';
export { StarRating } from './StarRating';
export { Alert } from './Alert';
export { Modal } from './Modal';

export { LocationAutocomplete } from './LocationAutocomplete';

// Reusable Patterns
export { FeatureGrid } from '../../business/marketing/FeatureGrid'; 

// Icons
export * from '../../icons';
export { default as Logo } from './Logo';
export type { LogoProps } from './Logo'; 