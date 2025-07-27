'use client';

import React, { useState, useEffect } from 'react';
import { confluenceCommentsService, ConfluenceComment } from '@/lib/business/confluence-comments';
import { Container, Text, Span } from '@/components/ui';
import { AdminPageWrapper } from '@/components/ui/AdminPageWrapper';
import { GridSection, StatCard, InfoCard } from '@/components/ui';
import { DataTable, DataTableColumn, DataTableAction } from '@/components/ui/DataTable';
import { Stack } from '@/components/ui/containers';
import { useAdmin } from '@/components/admin/AdminProvider';

function CommentsPageContent() {
  const [comments, setComments] = useState<ConfluenceComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('💬 Loading page comments...');
      
      const commentsData = await confluenceCommentsService.getComments();
      console.log('✅ Comments loaded:', commentsData.length, 'comments');
      setComments(commentsData);
    } catch (err) {
      console.error('❌ Error loading comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getCommentStatus = (comment: ConfluenceComment) => {
    // Basic status logic - can be enhanced with real moderation status
    if (comment.comment.length > 500) return 'Long';
    if (comment.comment.includes('?')) return 'Question';
    if (comment.comment.includes('!')) return 'Urgent';
    return 'Normal';
  };

  const renderStatus = (comment: ConfluenceComment) => {
    const status = getCommentStatus(comment);

    return (
      <Span >
        {status}
      </Span>
    );
  };

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: loadComments, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Export Report', 
      onClick: () => alert('Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Moderation', 
      onClick: () => alert('Comment moderation dashboard coming soon'), 
      variant: 'primary' as const 
    }
  ];

  // Table columns
  const columns: DataTableColumn<ConfluenceComment>[] = [
    {
      key: 'createdBy',
      label: 'Author',
      sortable: true,
      render: (_, comment) => (
        <Container>
          <Stack>
            <Span>
              {comment.createdBy}
            </Span>
            <Span>
              📄 {comment.pageTitle}
            </Span>
          </Stack>
        </Container>
      )
    },
    {
      key: 'comment',
      label: 'Comment',
      sortable: false,
      render: (value) => (
        <Container>
          <Text>{value}</Text>
        </Container>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => {
        const { date, time } = formatDate(value);
        return (
          <Container>
            <Stack>
              <Span>
                {date}
              </Span>
              <Span>
                {time}
              </Span>
            </Stack>
          </Container>
        );
      }
    },
    {
      key: 'actions',
      label: 'Status',
      sortable: false,
      render: (_, comment) => renderStatus(comment)
    }
  ];

  // Table actions
  const actions: DataTableAction<ConfluenceComment>[] = [
    {
      label: 'View Full',
      icon: '👁️',
      onClick: (comment) => alert(`Full comment from ${comment.createdBy}:\n\n"${comment.comment}"\n\nPage: ${comment.pageTitle}`),
      variant: 'outline'
    },
    {
      label: 'Reply',
      icon: '💬',
      onClick: (comment) => alert(`Opening reply to comment from ${comment.createdBy} on page: ${comment.pageTitle}`),
      variant: 'primary'
    },
    {
      label: 'View Page',
      icon: '📄',
      onClick: (comment) => alert(`Viewing page: ${comment.pageTitle}`),
      variant: 'outline'
    },
    {
      label: 'Moderate',
      icon: '🛡️',
      onClick: (comment) => alert(`Moderating comment from ${comment.createdBy}`),
      variant: 'outline'
    }
  ];

  // Calculate stats
  const totalComments = comments.length;
  const recentComments = comments.filter(c => {
    const commentDate = new Date(c.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return commentDate > weekAgo;
  }).length;

  const uniquePages = new Set(comments.map(c => c.pageTitle)).size;
  const uniqueAuthors = new Set(comments.map(c => c.createdBy)).size;

  return (
    <AdminPageWrapper
      title="Page Comments"
      subtitle="Monitor and manage comments across all pages"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading page comments..."
      errorTitle="Comments Load Error"
    >
      {/* Comment Statistics */}
      <GridSection variant="stats" columns={4}>
        <StatCard
          title="Total Comments"
          icon="💬"
          statNumber={totalComments.toString()}
          statChange="All comments"
          changeType="neutral"
        />
        <StatCard
          title="Recent Comments"
          icon="🆕"
          statNumber={recentComments.toString()}
          statChange="Last 7 days"
          changeType="positive"
        />
        <StatCard
          title="Pages with Comments"
          icon="📄"
          statNumber={uniquePages.toString()}
          statChange="Active pages"
          changeType="neutral"
        />
        <StatCard
          title="Unique Authors"
          icon="👥"
          statNumber={uniqueAuthors.toString()}
          statChange="Comment contributors"
          changeType="positive"
        />
      </GridSection>

      {/* Comments Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="💬 All Comments"
          description="Search, sort, and manage comments across all pages"
        >
          <DataTable
            data={comments}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by author, page, or comment text..."
            emptyMessage="No comments found. Comments will appear here once users start commenting on pages."
            emptyIcon="💬"
            pageSize={10}
            rowClassName={(comment) => 
              getCommentStatus(comment) === 'Urgent' ? 'border-l-4 border-red-500' : 
              getCommentStatus(comment) === 'Question' ? 'border-l-4 border-yellow-500' : ''
            }
            onRowClick={(comment) => console.log('Clicked comment from:', comment.createdBy)}
          />
        </InfoCard>
      </GridSection>

      {/* Comment Analytics */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📊 Comment Analytics"
          description="Insights into comment activity and engagement"
        >
          <Stack direction="vertical" spacing="lg">
            <Container>
              <Span>Most Active Pages:</Span>
              <Stack direction="vertical" spacing="sm">
                {Array.from(new Set(comments.map(c => c.pageTitle)))
                  .map(page => ({
                    page,
                    count: comments.filter(c => c.pageTitle === page).length
                  }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map(({ page, count }) => (
                    <Stack key={page} direction="horizontal" justify="between">
                      <Span>{page}</Span>
                      <Span>{count} comments</Span>
                    </Stack>
                  ))}
              </Stack>
            </Container>
            
            <Container>
              <Span>Top Commenters:</Span>
              <Stack direction="vertical" spacing="sm">
                {Array.from(new Set(comments.map(c => c.createdBy)))
                  .map(author => ({
                    author,
                    count: comments.filter(c => c.createdBy === author).length
                  }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map(({ author, count }) => (
                    <Stack key={author} direction="horizontal" justify="between">
                      <Span>{author}</Span>
                      <Span>{count} comments</Span>
                    </Stack>
                  ))}
              </Stack>
            </Container>
          </Stack>
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
}

const CommentsPage = () => {
  return (
    <CommentsPageContent />
  );
};

export default CommentsPage;
