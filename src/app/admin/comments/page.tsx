'use client';

import React, { useState, useEffect } from 'react';
import { confluenceCommentsService, ConfluenceComment } from '@/lib/business/confluence-comments';
import { AdminPageWrapper, GridSection, Box, Container, Text } from '@/ui';
import { EditableText } from '@/ui';
import { Stack } from '@/ui';
import { DataTable, DataTableColumn, DataTableAction } from '@/design/components/ui-components/DataTable';
import withAuth from '../withAuth';

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
      <Container>
        <EditableText field="admin.comments.status" defaultValue={status}>
          {status}
        </EditableText>
      </Container>
    );
  };



  // Table columns
  const columns: DataTableColumn<ConfluenceComment>[] = [
    {
      key: 'createdBy',
      label: 'Author',
      sortable: true,
      render: (_, comment) => (
        <Container>
          <Stack>
            <EditableText field="admin.comments.author" defaultValue={comment.createdBy}>
              {comment.createdBy}
            </EditableText>
            <EditableText field="admin.comments.pageTitle" defaultValue={`📄 ${comment.pageTitle}`}>
              📄 {comment.pageTitle}
            </EditableText>
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
          <EditableText field="admin.comments.comment" defaultValue={value}>
            {value}
          </EditableText>
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
              <EditableText field="admin.comments.date" defaultValue={date}>
                {date}
              </EditableText>
              <EditableText field="admin.comments.time" defaultValue={time}>
                {time}
              </EditableText>
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
    >
      {/* Comment Statistics */}
      <GridSection variant="stats" columns={4}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Total Comments</Text>
            <Text size="xl" weight="bold">{totalComments.toString()}</Text>
            <Text variant="muted" size="sm">All comments</Text>
            <EditableText field="admin.comments.totalComments" defaultValue={`${totalComments} total comments`}>
              {totalComments} total comments
            </EditableText>
          </Stack>
        </Box>
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Recent Comments</Text>
            <Text size="xl" weight="bold">{recentComments.toString()}</Text>
            <Text variant="muted" size="sm">Last 7 days</Text>
            <EditableText field="admin.comments.recentComments" defaultValue={`${recentComments} recent comments`}>
              {recentComments} recent comments
            </EditableText>
          </Stack>
        </Box>
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Pages with Comments</Text>
            <Text size="xl" weight="bold">{uniquePages.toString()}</Text>
            <Text variant="muted" size="sm">Active pages</Text>
            <EditableText field="admin.comments.pagesWithComments" defaultValue={`${uniquePages} pages with comments`}>
              {uniquePages} pages with comments
            </EditableText>
          </Stack>
        </Box>
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <Text variant="lead" size="md" weight="semibold">Unique Authors</Text>
            <Text size="xl" weight="bold">{uniqueAuthors.toString()}</Text>
            <Text variant="muted" size="sm">Comment contributors</Text>
            <EditableText field="admin.comments.uniqueAuthors" defaultValue={`${uniqueAuthors} unique authors`}>
              {uniqueAuthors} unique authors
            </EditableText>
          </Stack>
        </Box>
      </GridSection>

      {/* Comments Table */}
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text variant="lead" size="md" weight="semibold">💬 All Comments</Text>
            <Text variant="muted" size="sm">Search, sort, and manage comments across all pages</Text>
                      <DataTable
              data={comments}
              columns={columns}
              actions={actions}
              loading={loading}
              searchPlaceholder="Search by author, page, or comment text..."
              emptyMessage="No comments found. Comments will appear here once users start commenting on pages."
              emptyIcon="💬"
              pageSize={10}
            />
          </Stack>
          </Box>
      </GridSection>

      {/* Comment Analytics */}
      <GridSection variant="content" columns={1}>
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text variant="lead" size="md" weight="semibold">📊 Comment Analytics</Text>
            <Text variant="muted" size="sm">Insights into comment activity and engagement</Text>
          </Stack>
          <Stack direction="vertical" spacing="lg">
            <Container>
              <EditableText field="admin.comments.mostActivePages" defaultValue="Most Active Pages:">
                Most Active Pages:
              </EditableText>
              <Stack direction="vertical" spacing="sm">
                {Array.from(new Set(comments.map(c => c.pageTitle)))
                  .map(page => ({
                    page,
                    count: comments.filter(c => c.pageTitle === page).length
                  }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map(({ page, count }) => (
                    <Stack key={page} direction="horizontal" justify="space-between">
                      <EditableText field="admin.comments.pageName" defaultValue={page}>
                        {page}
                      </EditableText>
                      <EditableText field="admin.comments.commentCount" defaultValue={`${count} comments`}>
                        {count} comments
                      </EditableText>
                    </Stack>
                  ))}
              </Stack>
            </Container>
            
            <Container>
              <EditableText field="admin.comments.topCommenters" defaultValue="Top Commenters:">
                Top Commenters:
              </EditableText>
              <Stack direction="vertical" spacing="sm">
                {Array.from(new Set(comments.map(c => c.createdBy)))
                  .map(author => ({
                    author,
                    count: comments.filter(c => c.createdBy === author).length
                  }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map(({ author, count }) => (
                    <Stack key={author} direction="horizontal" justify="space-between">
                      <EditableText field="admin.comments.authorName" defaultValue={author}>
                        {author}
                      </EditableText>
                      <EditableText field="admin.comments.authorCommentCount" defaultValue={`${count} comments`}>
                        {count} comments
                      </EditableText>
                    </Stack>
                  ))}
              </Stack>
            </Container>
          </Stack>
        </Box>
      </GridSection>
    </AdminPageWrapper>
  );
}

const CommentsPage = () => {
  return (
    <CommentsPageContent />
  );
};

export default withAuth(CommentsPage);
