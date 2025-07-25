'use client';

import { useState, useEffect } from 'react';
import { confluenceCommentsService, ConfluenceComment } from '@/lib/business/confluence-comments';
import { 
  PageHeader, 
  GridSection, 
  InfoCard
} from '@/components/ui';
import { EmptyState } from '@/components/data';
import { Button } from '@/components/ui/button';

const CommentsPage = () => {
  const [comments, setComments] = useState<ConfluenceComment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    try {
      const commentsData = await confluenceCommentsService.getComments();
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const headerActions = [
    { 
      label: 'Refresh', 
      onClick: loadComments, 
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'Comment Settings', 
      href: '/admin/cms/communication', 
      variant: 'primary' as const 
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <PageHeader
          title="Comments"
          subtitle="Loading comments..."
        />
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <PageHeader
        title="Comments"
        subtitle="Manage page comments and feedback"
        actions={headerActions}
      />

      <GridSection variant="content" columns={1}>
        <InfoCard
          title="Page Comments"
          description={`Showing ${comments.length} comments from your website`}
        >
          {comments.length === 0 ? (
            <EmptyState
              icon="💬"
              title="No comments found"
              description="Page comments will appear here when visitors leave feedback"
            />
          ) : (
            <div className="comments-list space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item border-b pb-4 last:border-b-0">
                  <div className="comment-header flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{comment.createdBy}</h3>
                      <div className="text-sm text-gray-600">
                        <p>{new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}</p>
                        <p className="font-medium">Page: {comment.pageTitle}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Context
                    </Button>
                  </div>
                  <div className="comment-content">
                    <p className="text-gray-800">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </GridSection>
    </div>
  );
};

export default CommentsPage; 