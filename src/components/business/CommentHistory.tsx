'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import { type ConfluenceComment } from '@/lib/business/confluence-comments';
import { Container, H3, H4, Span } from '@/ui';
import StatusBadge from '@/components/business/StatusBadge';
import { Stack } from '@/ui';
import { Button } from '@/ui';
import { Select, Input } from '@/ui';
import { EditableText } from '@/ui';

interface CommentHistoryProps {
  comments: ConfluenceComment[];
  onCommentSelect?: (_comment: ConfluenceComment) => void;
  showFilters?: boolean;
  _maxHeight?: string;
}

export default function CommentHistory({
  comments,
  onCommentSelect,
  showFilters = true,
  _maxHeight = '600px'
}: CommentHistoryProps) {
  const [filteredComments, setFilteredComments] = useState<ConfluenceComment[]>(comments);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort comments
  useEffect(() => {
    let filtered = [...comments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(comment => 
        comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.elementText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(comment => new Date(comment.createdAt) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(comment => new Date(comment.createdAt) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter(comment => new Date(comment.createdAt) >= filterDate);
          break;
      }
    }

    // Sort comments
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'pageTitle':
          aValue = a.pageTitle.toLowerCase();
          bValue = b.pageTitle.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredComments(filtered);
  }, [comments, searchTerm, statusFilter, pageFilter, dateFilter, sortBy, sortOrder]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupCommentsByDate = (comments: ConfluenceComment[]) => {
    const groups: { [key: string]: ConfluenceComment[] } = {};
    
    comments.forEach(comment => {
      const date = new Date(comment.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(comment);
    });
    
    return groups;
  };

  const groupedComments = groupCommentsByDate(filteredComments);

  return (
    <Container variant="elevated" padding="lg">
      <Stack spacing="lg">
        {/* Header */}
        <Container variant="elevated" padding="md">
          <H3>
            <EditableText field="commentHistory.title" defaultValue="Comment History">
              Comment History
            </EditableText>
          </H3>
          <Span variant="default" size="sm" color="muted">
            {filteredComments.length} comments found
          </Span>
        </Container>

        {/* Filters */}
        {showFilters && (
          <Container variant="elevated" padding="md">
            <H4>
              <EditableText field="commentHistory.filters" defaultValue="Filters">
                Filters
              </EditableText>
            </H4>
            <Stack spacing="md">
              <Container variant="elevated" padding="sm">
                <Input
                  type="text"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Container>
              
              <Container variant="elevated" padding="sm">
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

              <Container variant="elevated" padding="sm">
                <Select
                  value={pageFilter}
                  onChange={(e) => setPageFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Pages' },
                    ...getUniquePages()
                  ]}
                />
              </Container>

              <Container variant="elevated" padding="sm">
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Time' },
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'Last 7 Days' },
                    { value: 'month', label: 'Last 30 Days' }
                  ]}
                />
              </Container>

              <Container variant="elevated" padding="sm">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Created Date' },
                    { value: 'updatedAt', label: 'Updated Date' },
                    { value: 'status', label: 'Status' },
                    { value: 'pageTitle', label: 'Page Title' }
                  ]}
                />
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="secondary"
                  size="sm"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </Container>
            </Stack>
          </Container>
        )}

        {/* Timeline View */}
        <Container 
          variant="elevated" 
          padding="md"
        >
          {Object.keys(groupedComments).length === 0 ? (
            <Container variant="elevated" padding="lg">
              <Span>
                <EditableText field="commentHistory.noComments" defaultValue="No comments found matching your filters.">
                  No comments found matching your filters.
                </EditableText>
              </Span>
            </Container>
          ) : (
            <Stack spacing="lg">
              {Object.entries(groupedComments).map(([date, dateComments]) => (
                <Container key={date} variant="elevated" padding="md">
                  <Container variant="elevated" padding="sm">
                    <Calendar size={16} />
                    <Span variant="default" size="sm" color="muted">
                      {new Date(date).toLocaleDateString()}
                    </Span>
                  </Container>
                  
                  <Stack spacing="md">
                    {dateComments.map((comment) => (
                      <Container
                        key={comment.id}
                        variant="elevated"
                        padding="md"
                      >
                        <Container variant="elevated" padding="sm">
                                                     <Container variant="elevated" padding="xs">
                             <StatusBadge status={comment.status} />
                             <Span variant="default" size="sm" color="muted">
                               {formatDate(comment.createdAt)}
                             </Span>
                           </Container>
                        </Container>

                        <Container variant="elevated" padding="sm">
                          <Container variant="elevated" padding="xs">
                            <FileText size={16} />
                            <Span variant="default" size="sm">
                              {comment.pageTitle}
                            </Span>
                          </Container>
                          <Container variant="elevated" padding="xs">
                            <Span variant="default" size="sm" color="muted">
                              Element: {comment.elementText}
                            </Span>
                          </Container>
                        </Container>

                        <Container variant="elevated" padding="sm">
                          <Span>{comment.comment}</Span>
                        </Container>

                        <Container variant="elevated" padding="sm">
                          <Container variant="elevated" padding="xs">
                            <User size={16} />
                            <Span variant="default" size="sm" color="muted">
                              {comment.createdBy}
                            </Span>
                          </Container>
                        </Container>
                      </Container>
                    ))}
                  </Stack>
                </Container>
              ))}
            </Stack>
          )}
        </Container>
      </Stack>
    </Container>
  );
} 