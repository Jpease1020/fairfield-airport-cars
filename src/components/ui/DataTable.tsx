import React, { useState, useMemo } from 'react';
import { Button } from './button';

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
      <div className={`data-table-container data-table-loading ${className}`}>
        <div className="data-table-loading-content">
          <div className="data-table-loading-icon">⏳</div>
          <p className="data-table-loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`data-table-container ${className}`}>
        <div className="data-table-empty">
          <div className="data-table-empty-icon">{emptyIcon}</div>
          <h3 className="data-table-empty-title">No Data</h3>
          <p className="data-table-empty-message">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      {/* Search and Controls */}
      {searchable && (
        <div className="data-table-controls">
          <div className="data-table-search">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="data-table-count">
            {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      )}

      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`data-table-header ${column.className || ''}`}
                style={{ width: column.width }}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(String(column.key))}
                    className="data-table-sort-button"
                  >
                    <span className="data-table-sort-label">{column.label}</span>
                    <span className="data-table-sort-icon">
                      {getSortIcon(String(column.key))}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="data-table-header">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr
              key={index}
              className={`data-table-row ${onRowClick ? 'data-table-row-clickable' : ''} ${rowClassName ? rowClassName(row, index) : ''}`}
              onClick={() => onRowClick?.(row, index)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`data-table-cell ${column.className || ''}`}
                >
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : String(row[column.key] || '-')}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="data-table-cell data-table-actions">
                  <div className="data-table-action-buttons">
                    {actions
                      .filter(action => !action.condition || action.condition(row))
                      .map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action.variant || 'secondary'}
                          size="sm"
                          onClick={() => action.onClick(row)}
                          className="data-table-action-button"
                        >
                          {action.icon && <span className="data-table-action-icon">{action.icon}</span>}
                          {action.label}
                        </Button>
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
        <div className="data-table-pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="data-table-pagination-button"
          >
            Previous
          </Button>
          
          <div className="data-table-pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="data-table-pagination-button"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 