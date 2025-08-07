import { type ConfluenceComment } from '@/lib/business/confluence-comments';

export interface CommentExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: {
    status?: string;
    pageUrl?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    createdBy?: string;
  };
  includeMetadata?: boolean;
}

export interface CommentExportData {
  comments: ConfluenceComment[];
  summary: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    averageResolutionTime?: number;
  };
  metadata: {
    exportDate: string;
    filters: CommentExportOptions['filters'];
    totalPages: number;
    dateRange?: string;
  };
}

class CommentExportService {
  /**
   * Export comments to CSV format
   */
  async exportToCSV(comments: ConfluenceComment[], _options: CommentExportOptions): Promise<string> {
    const headers = [
      'ID',
      'Element Text',
      'Page Title',
      'Page URL',
      'Comment',
      'Status',
      'Created By',
      'Created Date',
      'Updated Date',
      'Resolved Date',
      'Developer Notes'
    ];

    const rows = comments.map(comment => [
      comment.id,
      `"${comment.elementText.replace(/"/g, '""')}"`,
      `"${comment.pageTitle.replace(/"/g, '""')}"`,
      `"${comment.pageUrl.replace(/"/g, '""')}"`,
      `"${comment.comment.replace(/"/g, '""')}"`,
      comment.status,
      `"${comment.createdBy.replace(/"/g, '""')}"`,
      comment.createdAt,
      comment.updatedAt,
      comment.resolvedAt || '',
      comment.developerNotes ? `"${comment.developerNotes.replace(/"/g, '""')}"` : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  }

  /**
   * Export comments to JSON format
   */
  async exportToJSON(comments: ConfluenceComment[], options: CommentExportOptions): Promise<string> {
    const exportData: CommentExportData = {
      comments,
      summary: this.generateSummary(comments),
      metadata: {
        exportDate: new Date().toISOString(),
        filters: options.filters,
        totalPages: this.getUniquePages(comments).length,
        dateRange: options.filters?.dateRange 
          ? `${options.filters.dateRange.start.toISOString()} to ${options.filters.dateRange.end.toISOString()}`
          : undefined
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Generate summary statistics for comments
   */
  private generateSummary(comments: ConfluenceComment[]) {
    const total = comments.length;
    const open = comments.filter(c => c.status === 'open').length;
    const inProgress = comments.filter(c => c.status === 'in-progress').length;
    const resolved = comments.filter(c => c.status === 'resolved').length;

    // Calculate average resolution time for resolved comments
    let averageResolutionTime: number | undefined;
    const resolvedComments = comments.filter(c => c.status === 'resolved' && c.resolvedAt);
    if (resolvedComments.length > 0) {
      const totalTime = resolvedComments.reduce((sum, comment) => {
        const created = new Date(comment.createdAt).getTime();
        const resolved = new Date(comment.resolvedAt!).getTime();
        return sum + (resolved - created);
      }, 0);
      averageResolutionTime = totalTime / resolvedComments.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    return {
      total,
      open,
      inProgress,
      resolved,
      averageResolutionTime
    };
  }

  /**
   * Get unique pages from comments
   */
  private getUniquePages(comments: ConfluenceComment[]): string[] {
    return [...new Set(comments.map(c => c.pageUrl))];
  }

  /**
   * Filter comments based on export options
   */
  filterComments(comments: ConfluenceComment[], filters: CommentExportOptions['filters']): ConfluenceComment[] {
    let filtered = [...comments];

    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters?.pageUrl) {
      filtered = filtered.filter(c => c.pageUrl === filters.pageUrl);
    }

    if (filters?.createdBy) {
      filtered = filtered.filter(c => c.createdBy === filters.createdBy);
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(c => {
        const commentDate = new Date(c.createdAt);
        return commentDate >= filters.dateRange!.start && commentDate <= filters.dateRange!.end;
      });
    }

    return filtered;
  }

  /**
   * Download file with generated content
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    // @ts-ignore - Blob is available in browser environment
    const blob = new (globalThis as any).Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export comments with specified options
   */
  async exportComments(comments: ConfluenceComment[], options: CommentExportOptions): Promise<void> {
    // Apply filters
    const filteredComments = options.filters 
      ? this.filterComments(comments, options.filters)
      : comments;

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const statusFilter = options.filters?.status ? `-${options.filters.status}` : '';
    const pageFilter = options.filters?.pageUrl ? `-${options.filters.pageUrl.split('/').pop()}` : '';

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (options.format) {
      case 'csv':
        content = await this.exportToCSV(filteredComments, options);
        filename = `comments-${timestamp}${statusFilter}${pageFilter}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = await this.exportToJSON(filteredComments, options);
        filename = `comments-${timestamp}${statusFilter}${pageFilter}.json`;
        mimeType = 'application/json';
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    this.downloadFile(content, filename, mimeType);
  }

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport(comments: ConfluenceComment[]): Promise<string> {
    const summary = this.generateSummary(comments);
    const uniquePages = this.getUniquePages(comments);
    const uniqueAuthors = [...new Set(comments.map(c => c.createdBy))];

    // Group comments by page
    const commentsByPage = uniquePages.map(page => ({
      page,
      count: comments.filter(c => c.pageUrl === page).length,
      open: comments.filter(c => c.pageUrl === page && c.status === 'open').length,
      inProgress: comments.filter(c => c.pageUrl === page && c.status === 'in-progress').length,
      resolved: comments.filter(c => c.pageUrl === page && c.status === 'resolved').length
    }));

    // Group comments by author
    const commentsByAuthor = uniqueAuthors.map(author => ({
      author,
      count: comments.filter(c => c.createdBy === author).length,
      open: comments.filter(c => c.createdBy === author && c.status === 'open').length,
      inProgress: comments.filter(c => c.createdBy === author && c.status === 'in-progress').length,
      resolved: comments.filter(c => c.createdBy === author && c.status === 'resolved').length
    }));

    const report = {
      summary,
      pages: commentsByPage,
      authors: commentsByAuthor,
      generatedAt: new Date().toISOString()
    };

    return JSON.stringify(report, null, 2);
  }
}

export const commentExportService = new CommentExportService(); 