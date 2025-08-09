// Main UI Export - For App Usage (No Circular Dependencies)

// Layer 1: Foundation
export * from './foundation/tokens/tokens';
export * from './foundation/tokens/cms-integrated-colors';
export * from './foundation/tokens/cms-integrated-spacing';
export * from './foundation/tokens/cms-integrated-typography';
export * from './foundation/utils';
export * from './foundation/constants';
export * from './foundation/styles';

// Layer 2: System Types (separate from foundation to avoid conflicts)
export * from './system/shared-types';

// Layer 2: Layout Types (layout-specific type definitions)
export type {
  ColSpan,
  ResponsiveColSpan,
  MaxWidth,
  GridGap,
  BaseGridProps,
  RowProps,
  ColProps,
  ContainerProps,
  GridProps,
  GridTheme
} from './layout/framing/types';

export type {
  BaseContentProps,
  StackProps,
  BoxProps
} from './layout/content/types';

// Layer 3: Base Components (depends on foundation)
// Core Components
export { Button } from './components/base-components/Button';
export type { ButtonProps } from './components/base-components/Button';
export { Badge } from './components/base-components/Badge';
export type { BadgeProps } from './components/base-components/Badge';
export { Modal } from './components/base-components/Modal';
export type { ModalProps } from './components/base-components/Modal';
export { Overlay } from './components/base-components/Overlay';
export { ProgressIndicator } from './components/base-components/ProgressIndicator';
export { StarRating } from './components/base-components/StarRating';
export { StatCard } from './components/base-components/StatCard';
export { ActionButtonGroup } from './components/base-components/ActionButtonGroup';

// Text Components
export { Text } from './components/base-components/text/Text';
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

// Layer 4: Composite Components (depends on base components)
export { DataTable } from './components/composite-components/DataTable';
export type { DataTableColumn, DataTableAction } from './components/composite-components/DataTable';
export { ActionGrid } from './components/composite-components/ActionGrid';
export { FeatureGrid } from './components/composite-components/FeatureGrid';
export { ContentCard } from './components/composite-components/ContentCard';
export { FloatingEditButton } from './components/composite-components/FloatingEditButton';
export { SettingToggle } from './components/composite-components/SettingToggle';

// Layer 5: Content Sections (depends on composite components)
export { StaticHeroSection } from './components/content-sections/StaticHeroSection';
export { HeroSection } from './components/content-sections/HeroSection';

// Layer 6: Page Sections (depends on all previous layers)
export { Footer } from './page-sections/Footer';
export { PageHeader } from './page-sections/PageHeader';
export { BaseNavigation } from './page-sections/nav/BaseNavigation';
export type { NavigationItem } from './page-sections/nav/BaseNavigation';

// Layer 7: App-Specific Components (depends on base components)
export { ErrorBoundary } from '../components/business/ErrorBoundary';
export { LiveTrackingMap } from '../components/business/LiveTrackingMap';
export { DriverTrackingInterface } from '../components/business/DriverTrackingInterface';

// Layer 7: Providers (depends on base components)
export { AccessibilityEnhancer } from './providers/AccessibilityEnhancer';
export { CMSDesignProvider } from './providers/CMSDesignProvider';
export { EditModeProvider } from './providers/EditModeProvider';
export { ThemeProvider } from './providers/ThemeProvider';
export { StyledComponentsRegistry } from './providers/StyledComponentsRegistry';

// Layer 8: Skeletons (depends on base components)
export { Skeleton } from './skeletons/Skeleton';

// Layer 9: Icons (foundational)
export { default as Icon } from './components/icons/Icon';

// System utilities
export {
  isValidColorVariant,
  isValidGridCols,
  isValidMaxWidth,
  isValidSpacing,
} from './system/shared-types';