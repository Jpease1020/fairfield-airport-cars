import React from 'react';
import { LoadingSpinner } from '../ui-components/notifications';
import { Button } from '@/ui';
import { Stack } from '../layout/grid/Stack';
import { H3, Text } from './Text';
import { EditableText } from '@/ui';
import { PositionedContainer } from '../layout/containers/Container';

export interface StateProps {
  type: 'loading' | 'empty' | 'error';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  retry?: () => void;
  retryLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
  showSpinner?: boolean;
  variant?: 'centered' | 'inline' | 'overlay';
  spacing?: 'compact' | 'normal' | 'relaxed';
  [key: string]: any;
}

export const State: React.FC<StateProps> = ({
  type,
  title,
  description,
  icon,
  action,
  retry,
  retryLabel = 'Try Again',
  size = 'md',
  centered = false,
  showSpinner = true,
  variant = 'centered',
  spacing: spacingValue = 'normal',
  ...rest
}) => {
  const spacingMap = {
    compact: 'sm',
    normal: 'md',
    relaxed: 'lg'
  } as const;



  const renderIcon = () => {
    if (type === 'loading' && showSpinner) {
      return <LoadingSpinner size={size} />;
    }
    
    if (icon) {
      return (
        <Stack 
          direction="vertical" 
          align="center" 
          justify="center"
          spacing="md"
        >
          {icon}
        </Stack>
      );
    }

    // Default icons
    const defaultIcons = {
      loading: '⏳',
      empty: '📭',
      error: '❌'
    };

    return (
      <Stack 
        direction="vertical" 
        align="center" 
        justify="center"
        spacing="md"
      >
        {defaultIcons[type]}
      </Stack>
    );
  };

  const renderTitle = () => {
    const defaultTitles = {
      loading: 'Loading...',
      empty: 'No data found',
      error: 'Error occurred'
    };

    const finalTitle = title || defaultTitles[type];
    const titleSize = size === 'sm' ? 'lg' : size === 'lg' ? '2xl' : 'xl';

    return (
      <Stack direction="vertical" align="center" spacing="sm">
        {typeof finalTitle === 'string' ? (
          <EditableText field={`state.${type}.title`} defaultValue={finalTitle}>
            <H3 size={titleSize} weight="semibold" align="center">
              {finalTitle}
            </H3>
          </EditableText>
        ) : (
          <H3 size={titleSize} weight="semibold" align="center">
            {finalTitle}
          </H3>
        )}
      </Stack>
    );
  };

  const renderDescription = () => {
    if (!description) return null;

    const textSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

    return (
      <Stack direction="vertical" align="center" spacing="lg">
        {typeof description === 'string' ? (
          <EditableText field={`state.${type}.description`} defaultValue={description}>
            <Text 
              variant="body" 
              size={textSize} 
              color="secondary" 
              align="center"
            >
              {description}
            </Text>
          </EditableText>
        ) : (
          <Text 
            variant="body" 
            size={textSize} 
            color="secondary" 
            align="center"
          >
            {description}
          </Text>
        )}
      </Stack>
    );
  };

  const renderAction = () => {
    if (type === 'error' && retry) {
      return (
        <Stack direction="vertical" align="center" spacing="md">
          <Button onClick={retry} variant="outline" size={size}>
            🔄 {retryLabel}
          </Button>
        </Stack>
      );
    }

    if (action) {
      return (
        <Stack direction="vertical" align="center" spacing="md">
          {action}
        </Stack>
      );
    }

    return null;
  };

  const content = (
    <Stack 
      direction="vertical" 
      align="center" 
      justify="center" 
      spacing={spacingMap[spacingValue]}
    >
      {renderIcon()}
      {renderTitle()}
      {renderDescription()}
      {renderAction()}
    </Stack>
  );

  if (variant === 'overlay') {
    return (
      <PositionedContainer
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={1000}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        {...rest}
      >
        {content}
      </PositionedContainer>
    );
  }

  return (
    <div role="status" aria-live="polite" {...rest}>
      {content}
    </div>
  );
}; 