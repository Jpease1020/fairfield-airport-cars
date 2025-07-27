import React, { useState, useMemo } from 'react';
import { Button } from './button';
import { Container, Span, Text, Input } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

export interface DataTableColumn<T> {
  key: keyof T | 'actions';
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface DataTableAction<T> {
  label: string;
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  href?: string;
  condition?: (row: T) => boolean;
}

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
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
}

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
  rowClassName,
  onRowClick
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <Container>
        <Stack align="center" spacing="md">
          <Container>
            <Span>⏳</Span>
          </Container>
          <Text>Loading...</Text>
        </Stack>
      </Container>
    );
  }

  if (data.length === 0) {
    return (
      <Container>
        <Stack align="center" spacing="md">
          <Container>
            <Span>{emptyIcon}</Span>
          </Container>
          <Text>No Data</Text>
          <Text>{emptyMessage}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      {/* Search and Controls */}
      {searchable && (
        <Stack direction="horizontal" spacing="md" justify="between">
          <Container>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Container>
          <Container>
            <Text>{filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}</Text>
          </Container>
        </Stack>
      )}

      {/* Table */}
      <Container>
        <Stack direction="vertical" spacing="md">
          {paginatedData.map((row, index) => (
            <Container key={index}>
              <Stack direction="horizontal" spacing="md">
                {columns.map((column) => (
                  <Container key={String(column.key)}>
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : String(row[column.key] || '-')}
                  </Container>
                ))}
                {actions.length > 0 && (
                  <Container>
                    <Stack direction="horizontal" spacing="sm">
                      {actions
                        .filter(action => !action.condition || action.condition(row))
                        .map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'secondary'}
                            size="sm"
                            onClick={() => action.onClick(row)}
                          >
                            {action.icon && <Span>{action.icon}</Span>}
                            {action.label}
                          </Button>
                        ))}
                    </Stack>
                  </Container>
                )}
              </Stack>
            </Container>
          ))}
        </Stack>
      </Container>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <Stack direction="horizontal" spacing="md" align="center" justify="between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <Container>
            <Text>Page {currentPage} of {totalPages}</Text>
          </Container>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Stack>
      )}
    </Container>
  );
} 