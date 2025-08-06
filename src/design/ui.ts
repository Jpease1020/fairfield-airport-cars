// Main UI Export - For App Usage (No Circular Dependencies)
// Layer 1: Foundation
export * from './system/tokens/tokens';
export * from './system/types';

// Layer 2: Base Components (depends on foundation)
// Core Components
export { Button } from './components/base-components/Button';
export { Badge } from './components/base-components/Badge';
export { Modal } from './components/base-components/Modal';
export { Overlay } from './components/base-components/Overlay';
export { ProgressIndicator } from './components/base-components/ProgressIndicator';
export { StarRating } from './components/base-components/StarRating';
export { StatCard } from './components/base-components/StatCard';
export { ActionButtonGroup } from './components/base-components/ActionButtonGroup';

// Text Components
export { Text } from './components/base-components/text/Text';
export { EditableText } from './components/base-components/text/EditableText';
export { EditableHeading } from './components/base-components/text/EditableHeading';
export { Heading } from './components/base-components/text/Heading';
export { H1, H2, H3, H4, H5, H6 } from './components/base-components/text/Headings';
export { Link } from './components/base-components/text/Link';
export { Paragraph } from './components/base-components/text/Paragraph';
export { Span } from './components/base-components/text/Span';

// Form Components
export { Form } from './components/base-components/forms/Form';
export { FormField } from './components/base-components/forms/FormField';
export { Input } from './components/base-components/forms/Input';
export { Textarea } from './components/base-components/forms/Textarea';
export { Select } from './components/base-components/forms/Select';
export { Label } from './components/base-components/forms/Label';

// Notification Components
export { Alert } from './components/base-components/notifications/Alert';
export { LoadingSpinner } from './components/base-components/notifications/LoadingSpinner';
export { StatusBadge } from './components/base-components/notifications/StatusBadge';
export { StatusMessage } from './components/base-components/notifications/StatusMessage';
export { ToastProvider, useToast } from './components/base-components/notifications/Toast';

// Layout Components
export { Container } from './layout/containers/Container';
export { PositionedContainer } from './layout/containers/PositionedContainer';
export { Spacer } from './layout/containers/Spacer';
export { Card } from './layout/content/Card';
export { Box } from './layout/content/Box';
export { Stack } from './layout/framing/Stack';
export { Grid, GridItem, GridSection } from './layout/framing/Grid';
export { Col } from './layout/framing/Col';
export { Row } from './layout/framing/Row';

// Layer 3: Business Components (depends on base components)
export { BookingCard } from './components/business-components/BookingCard';
export { ChatContainer } from './components/business-components/ChatContainer';
export { ChatInput } from './components/business-components/ChatInput';
export { ChatMessage } from './components/business-components/ChatMessage';
export { Editable, EditableButton } from './components/business-components/EditableSystem';
export { EditableTextarea } from './components/business-components/EditableTextarea';
export { ErrorBoundary } from './components/business-components/ErrorBoundary';
export { VoiceInput } from './components/business-components/VoiceInput';
export { VoiceOutput } from './components/business-components/VoiceOutput';

// Layer 4: Content Sections (depends on base components)
export { DataTable } from './components/content-sections/DataTable';
export type { DataTableColumn, DataTableAction } from './components/content-sections/DataTable';
export { ActionGrid } from './components/content-sections/ActionGrid';
export { FeatureGrid } from './components/content-sections/FeatureGrid';
export { ContentCard } from './components/content-sections/ContentCard';
export { StaticHeroSection } from './components/content-sections/StaticHeroSection';
export { HeroSection } from './components/content-sections/HeroSection';

// Layer 5: Page Sections (depends on all previous layers)
export { Footer } from './page-sections/Footer';
export { AdminPageWrapper } from './page-sections/AdminPageWrapper';
export { PageHeader } from './page-sections/PageHeader';
export { BaseNavigation, type NavigationItem } from './page-sections/nav/BaseNavigation';
export { CustomerNavigation } from './page-sections/nav/CustomerNavigation';
export { AdminNavigation } from './page-sections/nav/AdminNavigation';

// Layer 6: Providers (depends on base components)
export { AccessibilityEnhancer } from './providers/AccessibilityEnhancer';
export { AdminProvider } from './providers/AdminProvider';
export { CMSDesignProvider } from './providers/CMSDesignProvider';
export { EditModeProvider, useEditMode } from './providers/EditModeProvider';
export { ThemeProvider } from './providers/ThemeProvider';
export { StyledComponentsRegistry } from './providers/StyledComponentsRegistry';

// Layer 7: Skeletons (depends on base components)
export { Skeleton } from './skeletons/Skeleton';

// Layer 8: Icons (foundational)
export { default as Icon } from './components/icons/Icon';

// Simplified layout system
export { SimpleLayout } from './layout/SimpleLayout';
export { UnifiedLayout } from './layout/UnifiedLayout';
export { AdminWrapper } from './layout/AdminWrapper';

// Legacy alias for backward compatibility (if needed)
export { SimpleLayout as CustomerLayout } from './layout/SimpleLayout';