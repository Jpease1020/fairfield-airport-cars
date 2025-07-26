import React, { useState, useMemo } from 'react';

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
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
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
  className?: string;
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
  className = '',
  rowClassName,
  onRowClick
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search
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
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
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
      <div className={`data-table-container ${className}`}>
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`data-table-container ${className}`}>
        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>{emptyIcon}</div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '500', marginBottom: 'var(--spacing-sm)' }}>No Data</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      {/* Search and Controls */}
      {searchable && (
        <div style={{ 
          marginBottom: 'var(--spacing-md)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ flex: 1, maxWidth: '300px' }}>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--text-secondary)', 
            marginLeft: 'var(--spacing-md)' 
          }}>
            {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      )}

      {/* Table */}
      <table className="">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={column.className || ''}
                style={{ width: column.width }}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(String(column.key))}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: 'inherit'
                    }}
                  >
                    <span>{column.label}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)' }}>
                      {getSortIcon(String(column.key))}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {actions.length > 0 && (
              <th>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr
              key={index}
              style={{
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              className={rowClassName ? rowClassName(row, index) : ''}
              onClick={() => onRowClick?.(row, index)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={column.className || ''}
                >
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : String(row[column.key] || '-')}
                </td>
              ))}
              {actions.length > 0 && (
                <td>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                    {actions
                      .filter(action => !action.condition || action.condition(row))
                      .map((action, actionIndex) => (
                        action.href ? (
                          <a
                            key={actionIndex}
                            href={action.href}
                            className={`btn btn-${action.variant === 'destructive' ? 'outline' : action.variant || 'outline'}`}
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 'var(--spacing-xs)',
                              ...(action.variant === 'destructive' && {
                                color: '#dc3545',
                                borderColor: '#dc3545'
                              })
                            }}
                          >
                            {action.icon && <span>{action.icon}</span>}
                            {action.label}
                          </a>
                        ) : (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`btn btn-${action.variant === 'destructive' ? 'outline' : action.variant || 'outline'}`}
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 'var(--spacing-xs)',
                              ...(action.variant === 'destructive' && {
                                color: '#dc3545',
                                borderColor: '#dc3545'
                              })
                            }}
                          >
                            {action.icon && <span>{action.icon}</span>}
                            {action.label}
                          </button>
                        )
                      ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div style={{
          marginTop: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <button
              className="btn btn-outline"
              style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 
                ? i + 1 
                : currentPage >= totalPages - 2
                ? totalPages - 4 + i
                : currentPage - 2 + i;
                
              if (pageNum < 1 || pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  className={`btn btn-${currentPage === pageNum ? "primary" : "outline"}`}
                  style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              className="btn btn-outline"
              style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 