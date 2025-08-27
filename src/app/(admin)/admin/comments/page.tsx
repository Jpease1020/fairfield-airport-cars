'use client';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Button, H2, H3, H4, Span, Input, Select } from '@/ui';
import { commentsService, type CommentRecord } from '@/lib/business/comments-service';
import { commentExportService, type CommentExportOptions } from '@/lib/business/comment-export-service';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import { CheckCircle, Clock, AlertCircle, Search, Download, Eye, Edit, Trash2, BarChart3, FileText } from 'lucide-react';
import StatusBadge from '@/components/business/StatusBadge';

export default function AdminCommentsPage() {
  const { isAdmin } = useAdminStatus();
  const { mode } = useInteractionMode();
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [filteredComments, setFilteredComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const { cmsData } = useCMSData();

  // Load comments on mount
  useEffect(() => {
    if (isAdmin) {
      loadComments();
    }
  }, [isAdmin]);

  // Filter comments based on search and filters
  useEffect(() => {
    let filtered = comments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(comment => 
        comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.elementText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.pageTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(comment => comment.status === statusFilter);
    }

    // Apply page filter
    if (pageFilter !== 'all') {
      filtered = filtered.filter(comment => comment.pageUrl === pageFilter);
    }

    setFilteredComments(filtered);
  }, [comments, searchTerm, statusFilter, pageFilter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await commentsService.getComments();
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId: string, newStatus: CommentRecord['status']) => {
    try {
      await commentsService.updateComment(commentId, { status: newStatus });
      await loadComments();
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setEditText(comment.comment);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      await commentsService.updateComment(commentId, { comment: editText });
      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm(getCMSField(cmsData, 'admin-comments-confirmations-deleteComment', 'Are you sure you want to delete this comment?'))) {
      try {
        await commentsService.deleteComment(commentId);
        await loadComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleNavigateToElement = (comment: CommentRecord) => {
    // Navigate to the page and highlight the element
    window.open(comment.pageUrl, '_blank');
  };

  const _getStatusIcon = (status: CommentRecord['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getUniquePages = () => {
    const pages = [...new Set(comments.map(c => c.pageUrl))];
    return pages.map(page => ({ value: page, label: page }));
  };

  const exportComments = async () => {
    try {
      const options: CommentExportOptions = {
        format: exportFormat,
        filters: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          pageUrl: pageFilter !== 'all' ? pageFilter : undefined
        }
      };
      
      await commentExportService.exportComments(filteredComments, options);
    } catch (error) {
      console.error('Error exporting comments:', error);
    }
  };

  const generateAnalytics = async () => {
    try {
      const report = await commentExportService.generateAnalyticsReport(comments);
      setAnalyticsData(JSON.parse(report));
      setShowAnalytics(true);
    } catch (error) {
      console.error('Error generating analytics:', error);
    }
  };

  if (!isAdmin) {
    return (
      <Container variant="elevated" padding="lg">
        <H2 data-cms-id="admin.comments.access.accessDenied" mode={mode}>
          {getCMSField(cmsData, 'admin-comments-access-accessDenied', 'Access Denied')}
        </H2>
        <Span data-cms-id="admin.comments.access.description" mode={mode}>
          {getCMSField(cmsData, 'admin-comments-access-description', 'You must be an admin to view this page.')}
        </Span>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container variant="elevated" padding="lg">
        <H2 data-cms-id="admin.comments.loading.title" mode={mode}>
          {getCMSField(cmsData, 'admin-comments-loading-title', 'Loading Comments...')}
        </H2>
      </Container>
    );
  }

  return (
    <Container variant="elevated" padding="lg">
      <Stack spacing="lg">
        {/* Header */}
        <Stack spacing="sm">
          <H2 data-cms-id="admin.comments.header.title" mode={mode}>
            {getCMSField(cmsData, 'admin-comments-header-title', 'Comment Management')}
          </H2>
          <Span variant="default" size="sm" color="muted" data-cms-id="admin.comments.header.description" mode={mode}>
            {getCMSField(cmsData, 'admin-comments-header-description', 'Manage all comments across the site')}
          </Span>
        </Stack>

        {/* Filters and Search */}
        <Container variant="elevated" padding="md">
          <Stack spacing="lg">
            {/* Search and Status Filters */}
            <Stack spacing="md">
              <H4 data-cms-id="admin.comments.filters.title" mode={mode}>
                {getCMSField(cmsData, 'admin-comments-filters-title', 'Filters')}
              </H4>
              
              <Stack spacing="md">
                <Stack spacing="xs">
                  <Span variant="default" size="sm" data-cms-id="admin.comments.filters.search.label" mode={mode}>
                    {getCMSField(cmsData, 'admin-comments-filters-search-label', 'Search:')}
                  </Span>
                  <Input
                    type="text"
                    placeholder={getCMSField(cmsData, 'admin-comments-filters-search-placeholder', 'Search comments, elements, or pages...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </Stack>
                
                <Stack spacing="xs">
                  <Span variant="default" size="sm" data-cms-id="admin.comments.filters.status.label" mode={mode}>
                    {getCMSField(cmsData, 'admin-comments-filters-status-label', 'Status:')}
                  </Span>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'all', label: getCMSField(cmsData, 'admin-comments-filters-status-allStatuses', 'All Statuses') },
                      { value: 'open', label: getCMSField(cmsData, 'admin-comments-filters-status-open', 'Open') },
                      { value: 'in-progress', label: getCMSField(cmsData, 'admin-comments-filters-status-inProgress', 'In Progress') },
                      { value: 'resolved', label: getCMSField(cmsData, 'admin-comments-filters-status-resolved', 'Resolved') }
                    ]}
                  />
                </Stack>

                <Stack spacing="xs">
                  <Span variant="default" size="sm" data-cms-id="admin.comments.filters.page.label" mode={mode}>
                    {getCMSField(cmsData, 'admin-comments-filters-page-label', 'Page:')}
                  </Span>
                  <Select
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    options={[
                      { value: 'all', label: getCMSField(cmsData, 'admin-comments-filters-page-allPages', 'All Pages') },
                      ...getUniquePages()
                    ]}
                  />
                </Stack>
              </Stack>
            </Stack>

            {/* Export Options */}
            <Stack spacing="md">
              <Stack spacing="xs">
                <Span variant="default" size="sm" data-cms-id="admin.comments.export.format.label" mode={mode}>
                  {getCMSField(cmsData, 'admin-comments-export-format-label', 'Export Format:')}
                </Span>
                <Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  options={[
                    { value: 'csv', label: getCMSField(cmsData, 'admin-comments-export-format-csv', 'CSV') },
                    { value: 'json', label: getCMSField(cmsData, 'admin-comments-export-format-json', 'JSON') }
                  ]}
                />
              </Stack>
              
              <Stack direction="horizontal" spacing="sm">
                <Button onClick={exportComments} variant="secondary" data-cms-id="admin.comments.export.exportButton" interactionMode={mode}>
                  <Download size={16} />
                  {getCMSField(cmsData, 'admin-comments-export-exportButton', 'Export Comments')}
                </Button>
                <Button onClick={generateAnalytics} variant="secondary" data-cms-id="admin.comments.export.generateAnalytics" interactionMode={mode}>
                  <BarChart3 size={16} />
                  {getCMSField(cmsData, 'admin-comments-export-generateAnalytics', 'Generate Analytics')}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>

        {/* Comments List */}
        <Container variant="elevated" padding="md">
          <H3 data-cms-id="admin.comments.list.title" mode={mode}>
            {getCMSField(cmsData, 'admin-comments-list-title', 'Comments')} ({filteredComments.length})
          </H3>
          
          {filteredComments.length === 0 ? (
            <Container variant="elevated" padding="lg">
              <Span data-cms-id="admin.comments.list.noComments" mode={mode}>
                {getCMSField(cmsData, 'admin-comments-list-noComments', 'No comments found matching your filters.')}
              </Span>
            </Container>
          ) : (
            <Stack spacing="md">
              {filteredComments.map((comment) => (
                <Container
                  key={comment.id}
                  variant="elevated"
                  padding="md"
                >
                  {/* Comment Header */}
                  <Stack spacing="sm">
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <Span variant="default" size="sm" color="muted" data-cms-id="admin.comments.list.comment.pageTitle" mode={mode}>
                        {comment.pageTitle}
                      </Span>
                      <Span variant="default" size="sm" color="muted">
                        • {new Date(comment.createdAt).toLocaleDateString()}
                      </Span>
                    </Stack>
                    
                    <Stack direction="horizontal" spacing="sm" align="center">
                      <Span variant="default" size="sm" color="muted" data-cms-id="admin.comments.list.comment.element" mode={mode}>
                        {getCMSField(cmsData, 'admin-comments-list-comment-elementLabel', 'Element:')} {comment.elementText}
                      </Span>
                      <StatusBadge status={comment.status} />
                    </Stack>
                  </Stack>

                  {/* Comment Content */}
                  <Stack spacing="sm">
                    {editingComment === comment.id ? (
                      <Stack spacing="sm">
                        <Input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                        />
                        <Stack direction="horizontal" spacing="sm">
                          <Button
                            onClick={() => handleSaveEdit(comment.id)}
                            variant="primary"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingComment(null)}
                            variant="secondary"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Span>{comment.comment}</Span>
                    )}
                  </Stack>

                  {/* Comment Actions */}
                  <Stack direction="horizontal" spacing="sm" align="center">
                    <Button
                      onClick={() => handleNavigateToElement(comment)}
                      variant="secondary"
                      size="sm"
                    >
                      <Eye size={16} />
                      View Element
                    </Button>
                    <Button
                      onClick={() => handleEditComment(comment.id)}
                      variant="secondary"
                      size="sm"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    <Select
                      value={comment.status}
                      onChange={(e) => handleStatusChange(comment.id, e.target.value as CommentRecord['status'])}
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'resolved', label: 'Resolved' }
                      ]}
                    />
                    <Button
                      onClick={() => handleDeleteComment(comment.id)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </Stack>
                </Container>
              ))}
            </Stack>
          )}
        </Container>

        {/* Analytics Section */}
        {showAnalytics && analyticsData && (
          <Container variant="elevated" padding="md">
            <H3>
              {getCMSField(cmsData, 'adminComments-analyticsTitle', 'Comment Analytics')}
            </H3>
            
            <Stack spacing="lg">
              {/* Summary Stats */}
              <Stack spacing="sm">
                <H4>Summary</H4>
                <Stack spacing="xs">
                  <Span variant="default" size="sm">
                    Total Comments: {analyticsData.summary.total}
                  </Span>
                  <Span variant="default" size="sm">
                    Open: {analyticsData.summary.open}
                  </Span>
                  <Span variant="default" size="sm">
                    In Progress: {analyticsData.summary.inProgress}
                  </Span>
                  <Span variant="default" size="sm">
                    Resolved: {analyticsData.summary.resolved}
                  </Span>
                  {analyticsData.summary.averageResolutionTime && (
                    <Span variant="default" size="sm">
                      Avg Resolution Time: {analyticsData.summary.averageResolutionTime.toFixed(1)} days
                    </Span>
                  )}
                </Stack>
              </Stack>

              {/* Comments by Page */}
              <Stack spacing="sm">
                <H4>Comments by Page</H4>
                <Stack spacing="sm">
                  {analyticsData.pages.map((page: any) => (
                    <Stack key={page.page} spacing="xs">
                      <Span variant="default" size="sm">
                        <FileText size={16} />
                        {page.page.split('/').pop() || page.page}
                      </Span>
                      <Span variant="default" size="sm" color="muted">
                        Total: {page.count} | Open: {page.open} | In Progress: {page.inProgress} | Resolved: {page.resolved}
                      </Span>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              {/* Comments by Author */}
              <Stack spacing="sm">
                <H4>Comments by Author</H4>
                <Stack spacing="sm">
                  {analyticsData.authors.map((author: any) => (
                    <Stack key={author.author} spacing="xs">
                      <Span variant="default" size="sm">
                        {author.author}
                      </Span>
                      <Span variant="default" size="sm" color="muted">
                        Total: {author.count} | Open: {author.open} | In Progress: {author.inProgress} | Resolved: {author.resolved}
                      </Span>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Container>
        )}
      </Stack>
    </Container>
  );
}
