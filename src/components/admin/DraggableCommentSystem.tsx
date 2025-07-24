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
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsAddingComment(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Add Comment (Drag to position)"
        >
          <Plus className="h-6 w-6" />
        </Button>
        {comments.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {comments.length}
          </div>
        )}
      </div>

      {/* Add Comment Modal */}
      {isAddingComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Add Comment</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
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
            <div className="flex gap-2">
              <Button
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
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
          className="fixed z-40 cursor-move"
          style={{
            left: comment.x,
            top: comment.y,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={(e) => handleMouseDown(e, comment.id)}
        >
          <div className="relative group">
            {/* Comment Icon */}
            <div className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 border-2 border-white">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            
            {/* Comment Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl max-w-xs">
                <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {comment.text}
                </div>
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                  {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
                </div>
              </div>
              {/* Arrow pointing down */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteComment(comment.id);
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              title="Delete comment"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default DraggableCommentSystem; 