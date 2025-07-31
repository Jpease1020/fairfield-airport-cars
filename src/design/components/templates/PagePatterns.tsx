'use client';

import React from 'react';
import { Container } from '../layout/containers/Container';
import { Section } from '../layout/containers/Section';
import { Card } from '../layout/containers/Card';
import { Stack } from '../layout/grid/Stack';
import { Grid } from '../layout/grid/Grid';
import { Col } from '../layout/grid/Col';
import { Text, H2, H3 } from '../ui-components/Text';
import { Button } from '../ui-components/Button';
import { AdminPageTemplate } from './PageTemplates';

// ============================================================================
// LAYER 6: PAGE PATTERNS
// Reusable page structures built on top of templates
// ============================================================================

/**
 * Form Page Pattern
 * Standard form page with title, description, and form content
 */
export interface FormPagePatternProps {
  title: string;
  subtitle?: string;
  description?: string;
  formContent: React.ReactNode;
  actions?: React.ReactNode[];
  loading?: boolean;
  error?: string | null;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const FormPagePattern: React.FC<FormPagePatternProps> = ({
  title,
  subtitle,
  description,
  formContent,
  actions = [],
  loading = false,
  error = null,
  maxWidth = 'lg'
}) => {
  return (
    <AdminPageTemplate
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
      error={error}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          {description && (
            <Text variant="lead">{description}</Text>
          )}
          
          <Card>
            {formContent}
          </Card>
        </Stack>
      </Container>
    </AdminPageTemplate>
  );
};

/**
 * List Page Pattern
 * Standard list page with title, filters, and list content
 */
export interface ListPagePatternProps {
  title: string;
  subtitle?: string;
  filters?: React.ReactNode;
  listContent: React.ReactNode;
  actions?: React.ReactNode[];
  loading?: boolean;
  error?: string | null;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ListPagePattern: React.FC<ListPagePatternProps> = ({
  title,
  subtitle,
  filters,
  listContent,
  actions = [],
  loading = false,
  error = null,
  maxWidth = 'full'
}) => {
  return (
    <AdminPageTemplate
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
      error={error}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          {filters && (
            <Card>
              <H3>Filters</H3>
              {filters}
            </Card>
          )}
          
          {listContent}
        </Stack>
      </Container>
    </AdminPageTemplate>
  );
};

/**
 * Detail Page Pattern
 * Standard detail page with title, metadata, and detail content
 */
export interface DetailPagePatternProps {
  title: string;
  subtitle?: string;
  metadata?: React.ReactNode;
  detailContent: React.ReactNode;
  actions?: React.ReactNode[];
  loading?: boolean;
  error?: string | null;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const DetailPagePattern: React.FC<DetailPagePatternProps> = ({
  title,
  subtitle,
  metadata,
  detailContent,
  actions = [],
  loading = false,
  error = null,
  maxWidth = 'xl'
}) => {
  return (
    <AdminPageTemplate
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
      error={error}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          {metadata && (
            <Card>
              <H3>Details</H3>
              {metadata}
            </Card>
          )}
          
          {detailContent}
        </Stack>
      </Container>
    </AdminPageTemplate>
  );
};

/**
 * Dashboard Page Pattern
 * Standard dashboard with stats, charts, and quick actions
 */
export interface DashboardPagePatternProps {
  title: string;
  subtitle?: string;
  stats?: React.ReactNode;
  charts?: React.ReactNode;
  quickActions?: React.ReactNode[];
  recentActivity?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const DashboardPagePattern: React.FC<DashboardPagePatternProps> = ({
  title,
  subtitle,
  stats,
  charts,
  quickActions = [],
  recentActivity,
  loading = false,
  error = null,
  maxWidth = 'full'
}) => {
  return (
    <AdminPageTemplate
      title={title}
      subtitle={subtitle}
      loading={loading}
      error={error}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          {/* Stats Row */}
          {stats && (
            <Grid cols={12} gap="md">
              {stats}
            </Grid>
          )}
          
          {/* Charts and Quick Actions */}
          <Grid cols={12} gap="xl">
            {charts && (
              <Col span={{ xs: 12, lg: 8 }}>
                {charts}
              </Col>
            )}
            
            {quickActions.length > 0 && (
              <Col span={{ xs: 12, lg: 4 }}>
                <Card>
                  <H3>Quick Actions</H3>
                  <Stack spacing="md">
                    {quickActions.map((action, index) => (
                      <div key={index}>{action}</div>
                    ))}
                  </Stack>
                </Card>
              </Col>
            )}
          </Grid>
          
          {/* Recent Activity */}
          {recentActivity && (
            <Card>
              <H3>Recent Activity</H3>
              {recentActivity}
            </Card>
          )}
        </Stack>
      </Container>
    </AdminPageTemplate>
  );
};

/**
 * Settings Page Pattern
 * Standard settings page with sections and save actions
 */
export interface SettingsPagePatternProps {
  title: string;
  subtitle?: string;
  sections: Array<{
    title: string;
    content: React.ReactNode;
    description?: string;
  }>;
  onSave?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const SettingsPagePattern: React.FC<SettingsPagePatternProps> = ({
  title,
  subtitle,
  sections,
  onSave,
  onCancel,
  loading = false,
  error = null,
  maxWidth = 'xl'
}) => {
  const actions = [
    onCancel && (
      <Button key="cancel" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    ),
    onSave && (
      <Button key="save" variant="primary" onClick={onSave}>
        Save Changes
      </Button>
    )
  ].filter(Boolean) as React.ReactNode[];

  return (
    <AdminPageTemplate
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
      error={error}
      maxWidth={maxWidth}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing="xl">
          {sections.map((section, index) => (
            <Card key={index}>
              <Stack spacing="md">
                <H3>{section.title}</H3>
                {section.description && (
                  <Text variant="muted">{section.description}</Text>
                )}
                {section.content}
              </Stack>
            </Card>
          ))}
        </Stack>
      </Container>
    </AdminPageTemplate>
  );
}; 