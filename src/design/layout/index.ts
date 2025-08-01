// Layout Components
// High-level structural components for page layout

// Layer 1: Grid System Components (Foundation)
// Grid, Row, Col - CSS Grid and Flexbox primitives
export * from './grid';

// Layer 2: Content Layout Components (Content arrangement and styling)
// Box, Stack - Content grouping and spacing
export * from './content';

// Layer 3: Layout System Components (Containers)
// Container, Section - Page-level containers and sections
export * from './containers';

// Layer 4: Page Layout Components (Complete page layouts)
// PageLayout - Unified page layout with navigation, content, and footer
export * from './PageLayout';

// Temporary compatibility exports (will be removed after migration)
export { PageLayout as CustomerLayout } from './PageLayout';
export { PageLayout as StandardLayout } from './PageLayout';