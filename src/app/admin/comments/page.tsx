'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/data';
import { confluenceCommentsService, ConfluenceComment } from '@/lib/business/confluence-comments';

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

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading comments..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Comments" />
      <PageContent>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">No comments found.</p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-6">
                                     <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="font-semibold text-lg">{comment.createdBy}</h3>
                       <p className="text-sm text-gray-500">
                         {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                       </p>
                       <p className="text-sm text-gray-600 mt-1">
                         Page: {comment.pageTitle}
                       </p>
                     </div>
                     <Button variant="outline" size="sm">
                       View Context
                     </Button>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                   </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default CommentsPage; 