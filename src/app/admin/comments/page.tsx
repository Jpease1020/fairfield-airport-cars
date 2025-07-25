'use client';

import { useState, useEffect } from 'react';
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
      <div className="admin-dashboard">
        <div className="loading-spinner">
          <div className="loading-spinner-icon">🔄</div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Comments</h1>
        <p className="page-subtitle">Manage page comments and feedback</p>
      </div>

      <div className="standard-content">
        {comments.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <p>No comments found.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-1 gap-lg">
            {comments.map((comment) => (
              <div key={comment.id} className="card">
                <div className="card-body">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">{comment.createdBy}</h3>
                      <p className="card-description">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="card-description">
                        Page: {comment.pageTitle}
                      </p>
                    </div>
                    <button className="btn btn-outline btn-sm">
                      View Context
                    </button>
                  </div>
                  <div className="comment-content">
                    <p>{comment.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPage; 