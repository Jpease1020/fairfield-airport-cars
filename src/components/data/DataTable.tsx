import * as React from 'react';
import { cn } from '@/lib/utils/utils';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Container, Text, H3 } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

/**
 * Column configuration for the data table
 */
interface Column<T> {
  /** Unique key for the column */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Custom render function for the column content */
  render?: (item: T) => React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** CSS width for the column */
  width?: string;
  /** Whether the column should be hidden on mobile */
  hideOnMobile?: boolean;
}

/**
 * A flexible data table component with sorting, loading states, and error handling
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <DataTable
 *   data={users}
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Role' }
 *   ]}
 * />
 * 
 * // With custom rendering
 * <DataTable
 *   data={bookings}
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { 
 *       key: 'status', 
 *       label: 'Status',
 *       render: (booking) => <StatusBadge status={booking.status} />
 *     },
 *     { key: 'amount', label: 'Amount' }
 *   ]}
 *   onRowClick={(booking) => navigate(`/booking/${booking.id}`)}
 * />
 * 
 * // With loading state
 * <DataTable
 *   data={data}
 *   columns={columns}
 *   loading={isLoading}
 *   emptyMessage="No bookings found"
 * />
 * ```
 */
interface DataTableProps<T> {
  /** Array of data items to display */
  data: T[];
  /** Column configuration */
  columns: Column<T>[];
  /** Callback when a row is clicked */
  onRowClick?: (item: T) => void;
  /** Whether the table is in a loading state */
  loading?: boolean;
  /** Custom message to display when no data is available */
  emptyMessage?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom error boundary fallback */
  errorFallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  /** Whether to show row hover effects */
  hoverable?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
}

/**
 * Default loading skeleton component
 */
const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
      <Container>
      <Stack spacing="md">
        <Container>
          <span>Loading...</span>
        </Container>
        {[...Array(5)].map((_, i) => (
          <Container key={i}>
            <span>Loading row {i + 1}...</span>
          </Container>
        ))}
      </Stack>
    </Container>
);

/**
 * Default empty state component
 */
const EmptyState: React.FC<{ message: React.ReactNode; className?: string }> = ({ 
  message, 
  className 
}) => (
  <Container>
    <Text>{message}</Text>
  </Container>
);

function DataTableComponent<T extends { id?: string }>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className,
  hoverable = true,
  loadingComponent,
}: DataTableProps<T>) {
  // Memoize the filtered columns to prevent unnecessary re-renders
  const visibleColumns = React.useMemo(() => {
    return columns.filter(column => !column.hideOnMobile || window.innerWidth >= 768);
  }, [columns]);

  if (loading) {
    return loadingComponent || <LoadingSkeleton className={className} />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} className={className} />;
  }

  return (
    <Container className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.id || index}
              onClick={() => onRowClick?.(item)}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRowClick(item);
                }
              }}
            >
              {visibleColumns.map((column) => (
                <TableCell 
                  key={column.key}
                >
                  {column.render
                    ? column.render(item)
                    : String((item as Record<string, unknown>)[column.key] || '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

// Memoize the component for better performance
const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent;

// Wrap with error boundary
const DataTableWithErrorBoundary = <T extends { id?: string }>(
  props: DataTableProps<T>
) => (
  <ErrorBoundary fallback={props.errorFallback}>
    <DataTable {...props} />
  </ErrorBoundary>
);

export { DataTableWithErrorBoundary as DataTable }; 