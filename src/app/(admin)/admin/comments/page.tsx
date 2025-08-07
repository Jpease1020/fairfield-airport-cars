'use client';

import { useState, useEffect } from 'react';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { confluenceCommentsService, type ConfluenceComment } from '@/lib/business/confluence-comments';
import { commentExportService, type CommentExportOptions } from '@/lib/services/comment-export-service';
import { Container, H2, H3, H4, Span } from '@/ui';
import { Stack } from '@/ui';
import { Button } from '@/ui';
import { Textarea, Select, Input } from '@/ui';
import { EditableText } from '@/ui';
import { CheckCircle, Clock, AlertCircle, Search, Download, Eye, Edit, Trash2, BarChart3, FileText } from 'lucide-react';
import StatusBadge from '@/components/business/StatusBadge';

export default function AdminCommentsPage() {
  const { isAdmin } = useAdminStatus();
  const [comments, setComments] = useState<ConfluenceComment[]>([]);
  const [filteredComments, setFilteredComments] = useState<ConfluenceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

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
      const commentsData = await confluenceCommentsService.getComments();
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId: string, newStatus: ConfluenceComment['status']) => {
    try {
      await confluenceCommentsService.updateComment(commentId, { status: newStatus });
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
      await confluenceCommentsService.updateComment(commentId, { comment: editText });
      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await confluenceCommentsService.deleteComment(commentId);
        await loadComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleNavigateToElement = (comment: ConfluenceComment) => {
    // Navigate to the page and highlight the element
    window.open(comment.pageUrl, '_blank');
  };

  const _getStatusIcon = (status: ConfluenceComment['status']) => {
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
        <H2>Access Denied</H2>
        <Span>You must be an admin to view this page.</Span>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container variant="elevated" padding="lg">
        <H2>Loading Comments...</H2>
      </Container>
    );
  }

  return (
    <Container variant="elevated" padding="lg">
      <Stack spacing="lg">
        {/* Header */}
        <Container variant="elevated" padding="md">
          <H2>
            <EditableText field="adminComments.title" defaultValue="Comment Management">
              Comment Management
            </EditableText>
          </H2>
          <Span variant="default" size="sm" color="muted">
            Manage all comments across the site
          </Span>
        </Container>

        {/* Filters and Search */}
        <Container variant="elevated" padding="md">
          <Stack spacing="md">
            <Container variant="elevated" padding="sm">
              <H4>Filters</H4>
              <Stack spacing="sm">
                <Container variant="elevated" padding="xs">
                  <Span variant="default" size="sm">Search:</Span>
                  <Input
                    type="text"
                    placeholder="Search comments, elements, or pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </Container>
                
                <Container variant="elevated" padding="xs">
                  <Span variant="default" size="sm">Status:</Span>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'open', label: 'Open' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'resolved', label: 'Resolved' }
                    ]}
                  />
                </Container>

                <Container variant="elevated" padding="xs">
                  <Span variant="default" size="sm">Page:</Span>
                  <Select
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Pages' },
                      ...getUniquePages()
                    ]}
                  />
                </Container>
              </Stack>
            </Container>

            <Container variant="elevated" padding="sm">
              <Container variant="elevated" padding="xs">
                <Span variant="default" size="sm">Export Format:</Span>
                <Select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                  options={[
                    { value: 'csv', label: 'CSV' },
                    { value: 'json', label: 'JSON' }
                  ]}
                />
              </Container>
              <Container variant="elevated" padding="xs">
                <Button onClick={exportComments} variant="secondary">
                  <Download size={16} />
                  Export Comments
                </Button>
                <Button onClick={generateAnalytics} variant="secondary">
                  <BarChart3 size={16} />
                  Generate Analytics
                </Button>
              </Container>
            </Container>
          </Stack>
        </Container>

        {/* Comments List */}
        <Container variant="elevated" padding="md">
          <H3>
            Comments ({filteredComments.length})
          </H3>
          
          {filteredComments.length === 0 ? (
            <Container variant="elevated" padding="lg">
              <Span>No comments found matching your filters.</Span>
            </Container>
          ) : (
            <Stack spacing="md">
              {filteredComments.map((comment) => (
                <Container
                  key={comment.id}
                  variant="elevated"
                  padding="md"
                >
                  <Container variant="elevated" padding="sm">
                    <Container variant="elevated" padding="xs">
                      <Span variant="default" size="sm" color="muted">
                        {comment.pageTitle}
                      </Span>
                      <Span variant="default" size="sm" color="muted">
                        • {new Date(comment.createdAt).toLocaleDateString()}
                      </Span>
                    </Container>
                    
                    <Container variant="elevated" padding="xs">
                      <Span variant="default" size="sm" color="muted">
                        Element: {comment.elementText}
                      </Span>
                    </Container>
                  </Container>

                  <Container variant="elevated" padding="sm">
                    <Container variant="elevated" padding="xs">
                      <StatusBadge status={comment.status} />
                    </Container>
                  </Container>

                  <Container variant="elevated" padding="sm">
                    {editingComment === comment.id ? (
                      <Container variant="elevated" padding="sm">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                        />
                        <Container variant="elevated" padding="sm">
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
                        </Container>
                      </Container>
                    ) : (
                      <Container variant="elevated" padding="sm">
                        <Span>{comment.comment}</Span>
                      </Container>
                    )}
                  </Container>

                  <Container variant="elevated" padding="sm">
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
                      onChange={(e) => handleStatusChange(comment.id, e.target.value as ConfluenceComment['status'])}
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
                  </Container>
                </Container>
              ))}
            </Stack>
          )}
        </Container>

        {/* Analytics Section */}
        {showAnalytics && analyticsData && (
          <Container variant="elevated" padding="md">
            <H3>
              <EditableText field="adminComments.analyticsTitle" defaultValue="Comment Analytics">
                Comment Analytics
              </EditableText>
            </H3>
            
            <Stack spacing="md">
              {/* Summary Stats */}
              <Container variant="elevated" padding="sm">
                <H4>Summary</H4>
                <Container variant="elevated" padding="xs">
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
                </Container>
              </Container>

              {/* Comments by Page */}
              <Container variant="elevated" padding="sm">
                <H4>Comments by Page</H4>
                <Stack spacing="sm">
                  {analyticsData.pages.map((page: any) => (
                    <Container key={page.page} variant="elevated" padding="xs">
                      <Span variant="default" size="sm">
                        <FileText size={16} />
                        {page.page.split('/').pop() || page.page}
                      </Span>
                      <Span variant="default" size="sm" color="muted">
                        Total: {page.count} | Open: {page.open} | In Progress: {page.inProgress} | Resolved: {page.resolved}
                      </Span>
                    </Container>
                  ))}
                </Stack>
              </Container>

              {/* Comments by Author */}
              <Container variant="elevated" padding="sm">
                <H4>Comments by Author</H4>
                <Stack spacing="sm">
                  {analyticsData.authors.map((author: any) => (
                    <Container key={author.author} variant="elevated" padding="xs">
                      <Span variant="default" size="sm">
                        {author.author}
                      </Span>
                      <Span variant="default" size="sm" color="muted">
                        Total: {author.count} | Open: {author.open} | In Progress: {author.inProgress} | Resolved: {author.resolved}
                      </Span>
                    </Container>
                  ))}
                </Stack>
              </Container>
            </Stack>
          </Container>
        )}
      </Stack>
    </Container>
  );
}
