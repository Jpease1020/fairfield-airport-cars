'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEditMode } from './EditModeProvider';

interface Comment {
  id: string;
  text: string;
  x: number;
  y: number;
  createdAt: Date;
}

interface DraggableCommentSystemProps {
  comments: Comment[];
  onCommentsChange: (comments: Comment[]) => void;
}

export const DraggableCommentSystem: React.FC<DraggableCommentSystemProps> = ({
  comments,
  onCommentsChange
}) => {
  const { isAdmin } = useEditMode();
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [draggedComment, setDraggedComment] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleAddComment = () => {
    if (newCommentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        text: newCommentText.trim(),
        x: 100, // Default position
        y: 100,
        createdAt: new Date()
      };
      
      onCommentsChange([...comments, newComment]);
      setNewCommentText('');
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    onCommentsChange(comments.filter(c => c.id !== commentId));
  };

  const handleMouseDown = (e: React.MouseEvent, commentId: string) => {
    e.preventDefault();
    setDraggedComment(commentId);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedComment) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      onCommentsChange(comments.map(c => 
        c.id === draggedComment 
          ? { ...c, x: newX, y: newY }
          : c
      ));
    }
  }, [draggedComment, dragOffset, comments, onCommentsChange]);

  const handleMouseUp = () => {
    setDraggedComment(null);
  };

  useEffect(() => {
    if (draggedComment) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedComment, dragOffset, comments, handleMouseMove]);

  // Don't render if not admin
  if (!isAdmin) return null;

  return (
    <>
      {/* Add Comment Button */}
      <div className="">
        <Button
          onClick={() => setIsAddingComment(true)}
          className=""
          title="Add Comment (Drag to position)"
        >
          <Plus className="" />
        </Button>
        {comments.length > 0 && (
          <div className="">
            {comments.length}
          </div>
        )}
      </div>

      {/* Add Comment Modal */}
      {isAddingComment && (
        <div className="">
          <div className="">
            <div className="">
              <MessageCircle className="" />
              <h3 className="">Add Comment</h3>
            </div>
            <p className="">
              Type your feedback below. After adding, you can drag the comment icon to any element on the page.
            </p>
            <Textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Type your comment here... (e.g., 'This text is too small', 'Change this color', 'Add more spacing here')"
              rows={4}
              className="mb-4"
              autoFocus
            />
            <div className="">
              <Button
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className=""
              >
                Add Comment
              </Button>
              <Button
                onClick={() => {
                  setIsAddingComment(false);
                  setNewCommentText('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Comments */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className=""
          style={{
            left: comment.x,
            top: comment.y,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, comment.id)}
        >
          <div className="">
            {/* Comment Icon */}
            <div className="">
              <MessageCircle className="" />
            </div>
            
            {/* Comment Tooltip */}
            <div className="">
              <div className="">
                <div className="">
                  {comment.text}
                </div>
                <div className="">
                  {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
                </div>
              </div>
              {/* Arrow pointing down */}
              <div className=""></div>
            </div>
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteComment(comment.id);
              }}
              className=""
              title="Delete comment"
            >
              <X className="" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default DraggableCommentSystem; 