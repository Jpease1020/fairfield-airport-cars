// Master Design System Components Export
// Single import point for all components: import { Button, Box, Grid } from '@/design/components'

// Layer 1: Grid System Components (Foundation)
export * from '../layout';

// Layer 2: Layout System Components (Containers)
export * from '../layout';

// Layer 3: UI Components (Interactive Elements)
export * from './base-components';

// Layer 3: Business Components (Domain-specific components)
export * from './business-components';

// Layer 3: Content Sections (Reusable content patterns)
export * from './content-sections';

// Layer 5: Page Sections (Page-level components)
export * from '../page-sections';

// Layer 5 & 6: Template Components (Page Templates & Patterns)
// Templates removed - using clean components directly

// Icons
export * from './icons';

// Providers
export * from '../providers'; 