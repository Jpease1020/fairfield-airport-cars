export * from './components';
export * from './layout';
export * from './page-sections';
export * from './providers';
export * from './skeletons';
export * from './system';

// Legacy aliases for backward compatibility
export { PageLayout as CustomerLayout } from './layout/PageLayout';

// System - explicit re-exports to avoid naming conflicts
export type {
  // Types (excluding conflicts with layout)
  SpacingScale,
  ColorVariant,
  TextVariant,
  TextSize,
  TextAlign,
  ButtonVariant,
  ButtonSize,
  ContainerVariant,
  CardVariant,
  SectionVariant,
  GridCols,
  GridSpan,
  StackDirection,
  StackAlign,
  StackJustify,
  StackWrap,
  BorderRadius,
  HTMLElement,
  BaseComponentProps,
  BoxProps,
  LayoutSectionProps,
  TextProps,
  ButtonProps,
  ThemeToken
} from './system/types';

export {
  isValidColorVariant,
  isValidGridCols,
  isValidMaxWidth,
  isValidSpacing,
} from './system/types';

export {
  generateCSSVariables,
} from './system/tokens';