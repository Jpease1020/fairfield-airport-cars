// Layout Components
export { PageHeader } from './PageHeader';
export { GridSection } from './GridSection';
export { PageSection } from './PageSection';

// Data Display Components  
export { StatCard } from './StatCard';
export { InfoCard } from './InfoCard';
export { ActivityItem } from './ActivityItem';
export { ActivityList } from './ActivityList';
export { AlertItem } from './AlertItem';
export { AlertList } from './AlertList';
export { ActionCard } from './ActionCard';
export { ActionGrid } from './ActionGrid';

// New Reusable Admin Components (Phase 1 & 2)
export { AdminPageWrapper } from './AdminPageWrapper';
export { FormSection } from './FormSection';
export { LoadingState } from './LoadingState';
export { ErrorState } from './ErrorState';
export { DataTable } from './DataTable';
export type { DataTableColumn, DataTableAction } from './DataTable';

// Settings Components (Phase 3)
export { SettingToggle } from './SettingToggle';
export type { SettingToggleProps } from './SettingToggle';
export { SettingSection } from './SettingSection';
export type { SettingSectionProps } from './SettingSection';
export { SettingInput } from './SettingInput';
export type { SettingInputProps } from './SettingInput';

// Utility Components (Phase 4)
export { StatusMessage } from './StatusMessage';
export type { StatusMessageProps } from './StatusMessage';
export { HelpCard } from './HelpCard';
export type { HelpCardProps } from './HelpCard';
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
} from '../cms/PageEditors';
export type { 
  GenericPageEditorProps,
  HomePageEditorProps,
  BookingPageEditorProps,
  HelpPageEditorProps
} from '../cms/PageEditors';

// Base UI Components (Card exported from containers - bulletproof!)  
export { CardBody, CardHeader, CardTitle, CardDescription } from './card';
export { LoadingSpinner } from './LoadingSpinner';
export { Badge } from './badge';
export { Button } from './button';
export { Input } from './input';
export { Textarea } from './textarea';
export { Grid, GridItem } from './Grid';

// Form Components
export { 
  Form, 
  FormGroup, 
  Label, 
  Fieldset, 
  Legend, 
  Select, 
  Option, 
  OptGroup 
} from './form';

// Text Components ONLY (Layout components from containers!)
export { 
  H1, H2, H3, H4, H5, H6,
  Text, 
  Paragraph, 
  Span
} from './text';

// BULLETPROOF Layout Components (NEVER from text.tsx!)
export { Container, Section, Stack, Card, Box, Grid, Layout, Spacer } from './containers';

// Database-ready editable text component
export { EditableText } from './EditableText';

// Accessibility
export { AccessibilityEnhancer } from './AccessibilityEnhancer';

// Moved Components (Now Properly Located in UI!)
export { EditableInput } from './EditableInput';
export { EditableTextarea } from './EditableTextarea';
export { FormField } from './FormField';
export { SelectField } from './SelectField';
export { StatusBadge } from './StatusBadge';
export { EmptyState } from './EmptyState';
export { StarRating } from './StarRating';
export { Alert } from './Alert';
export { Modal } from './Modal';

// Reusable Patterns
export { FeatureGrid } from './FeatureGrid'; 