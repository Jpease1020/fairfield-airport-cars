'use client';

import { useState, useEffect } from 'react';
import { confluenceCommentsService, ConfluenceComment } from '@/lib/business/confluence-comments';
import { 
  AdminPageWrapper,
  GridSection, 
  InfoCard,
  StatCard,
  DataTable,
  DataTableColumn,
  DataTableAction
} from '@/components/ui';


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
    let statusStyle = {
      backgroundColor: '#dcfce7',
      color: '#166534',
      border: '1px solid #4ade80'
    };

    switch (status) {
      case 'Long':
        statusStyle = {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #60a5fa'
        };
        break;
      case 'Question':
        statusStyle = {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fcd34d'
        };
        break;
      case 'Urgent':
        statusStyle = {
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #f87171'
        };
        break;
    }

    return (
      <span
        style={{
          ...statusStyle,
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--border-radius)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: '500'
        }}
      >
        {status}
      </span>
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
      label: 'Export Comments', 
      onClick: () => alert('Export functionality coming soon'), 
      variant: 'outline' as const 
    },
    { 
      label: 'Comment Settings', 
      href: '/admin/cms/communication', 
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
        <div>
          <div style={{ fontWeight: '500', marginBottom: 'var(--spacing-xs)' }}>
            {comment.createdBy}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            📄 {comment.pageTitle}
          </div>
        </div>
      )
    },
    {
      key: 'comment',
      label: 'Comment',
      sortable: false,
      render: (value) => (
        <div style={{ 
          maxWidth: '350px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {value}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => {
        const { date, time } = formatDate(value);
        return (
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>
              {date}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              {time}
            </div>
          </div>
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
      variant: 'destructive'
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
      title="Comments Management"
      subtitle="Manage page comments and visitor feedback"
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
          statChange="All time comments"
          changeType="neutral"
        />
        <StatCard
          title="Recent Comments"
          icon="📅"
          statNumber={recentComments.toString()}
          statChange="Past 7 days"
          changeType="positive"
        />
        <StatCard
          title="Active Pages"
          icon="📄"
          statNumber={uniquePages.toString()}
          statChange="Pages with comments"
          changeType="neutral"
        />
        <StatCard
          title="Contributors"
          icon="👥"
          statNumber={uniqueAuthors.toString()}
          statChange="Unique commenters"
          changeType="positive"
        />
      </GridSection>

      {/* Comments Table */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="💬 Page Comments"
          description="Search, sort, and manage visitor comments and feedback"
        >
          <DataTable
            data={comments}
            columns={columns}
            actions={actions}
            loading={loading}
            searchPlaceholder="Search by author, comment text, or page title..."
            emptyMessage="No page comments available yet. Comments will appear here when visitors leave feedback on your website."
            emptyIcon="💬"
            pageSize={15}
            rowClassName={(comment) => 
              getCommentStatus(comment) === 'Urgent' ? 'border-l-4 border-red-500' : 
              getCommentStatus(comment) === 'Question' ? 'border-l-4 border-yellow-500' : ''
            }
            onRowClick={(comment) => console.log('Clicked comment from:', comment.createdBy)}
          />
        </InfoCard>
      </GridSection>

      {/* Quick Insights */}
      <GridSection variant="content" columns={2}>
        <InfoCard
          title="📊 Top Pages"
          description="Pages with most comments"
        >
          {comments.length > 0 ? (
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              {Object.entries(
                comments.reduce((acc, comment) => {
                  acc[comment.pageTitle] = (acc[comment.pageTitle] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([page, count]) => (
                <div key={page} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 'var(--spacing-sm) 0',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{page}</span>
                  <span style={{ 
                    fontWeight: '500',
                    backgroundColor: 'var(--background-secondary)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    borderRadius: 'var(--border-radius)',
                    fontSize: 'var(--font-size-xs)'
                  }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ 
              textAlign: 'center', 
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-lg)'
            }}>
              No data available
            </p>
          )}
        </InfoCard>

        <InfoCard
          title="👥 Active Contributors"
          description="Most active commenters"
        >
          {comments.length > 0 ? (
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              {Object.entries(
                comments.reduce((acc, comment) => {
                  acc[comment.createdBy] = (acc[comment.createdBy] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([author, count]) => (
                <div key={author} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 'var(--spacing-sm) 0',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{author}</span>
                  <span style={{ 
                    fontWeight: '500',
                    backgroundColor: 'var(--background-secondary)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    borderRadius: 'var(--border-radius)',
                    fontSize: 'var(--font-size-xs)'
                  }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ 
              textAlign: 'center', 
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-lg)'
            }}>
              No data available
            </p>
          )}
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
