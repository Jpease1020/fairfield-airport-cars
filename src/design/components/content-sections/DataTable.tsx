'use client';

import React, { useState, useMemo } from 'react';
import { Button, Container, ContentBox, Stack, Text, H4, Input } from '@/design/ui';

// DataTableColumn - BULLETPROOF TYPE SAFETY!
export interface DataTableColumn<T> {
  key: keyof T | 'actions';
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'numeric' | 'action';
}

export interface DataTableAction<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  href?: string;
  condition?: (row: T) => boolean;
}

// DataTable - BULLETPROOF TYPE SAFETY!
interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  loading?: boolean;
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  rowVariant?: (row: T, index: number) => 'default' | 'highlighted' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'compact' | 'normal' | 'relaxed';
  showCards?: boolean;
}

/**
 * DataTable - A table layout for data display
 * Built on Layer 1 (Stack) + Layer 2 (Containers)
 * 
 * @example
 * ```tsx
 * const columns = [
 *   { key: 'name', label: 'Name' },
 *   { key: 'email', label: 'Email' }
 * ];
 * 
 * <DataTable data={users} columns={columns} />
 * ```
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  pagination = true,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  emptyIcon = '📊',
  size = 'md',
  spacing = 'normal',
  showCards = true
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    return filteredData;
  }, [filteredData]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  if (loading) {
    return (
      <Container>
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="muted">{emptyIcon}</Text>
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  if (data.length === 0) {
    return (
      <Container>
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="muted">{emptyIcon}</Text>
          <Text variant="muted">{emptyMessage}</Text>
        </Stack>
      </Container>
    );
  }

  const tableContent = (
    <Stack direction="vertical" spacing={spacing === 'compact' ? 'sm' : spacing === 'relaxed' ? 'lg' : 'md'}>
      {/* Search */}
      {searchable && (
        <Container>
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </Container>
      )}

      {/* Table */}
      <Container>
        <Stack direction="vertical" spacing="sm">
          {/* Header */}
          <Container>
            <Stack direction="horizontal" spacing="md">
              {columns.map((column) => (
                <Container key={String(column.key)}>
                  <H4>{column.label}</H4>
                </Container>
              ))}
            </Stack>
          </Container>

          {/* Rows */}
          {paginatedData.map((row, rowIndex) => (
            <Container key={rowIndex}>
              <Stack direction="horizontal" spacing="md">
                {columns.map((column) => (
                  <Container key={String(column.key)}>
                    {column.render ? (
                      column.render(row[column.key as keyof T], row, rowIndex)
                    ) : (
                      <Text>{String(row[column.key as keyof T])}</Text>
                    )}
                  </Container>
                ))}
              </Stack>
            </Container>
          ))}
        </Stack>
      </Container>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <Container>
          <Stack direction="horizontal" spacing="sm" justify="center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text>{currentPage} of {totalPages}</Text>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Stack>
        </Container>
      )}
    </Stack>
  );

  return showCards ? (
    <ContentBox variant="default" padding="lg">
      {tableContent}
    </ContentBox>
  ) : (
    <Container>
      {tableContent}
    </Container>
  );
} 