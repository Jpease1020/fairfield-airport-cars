'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, X, Plus } from 'lucide-react';
import { Button } from '@/ui';
import { Textarea } from '@/ui';
import { Container, Text, H3 } from '@/ui';
import { EditableText } from '@/ui';
import { useEditMode } from '@/design/providers/EditModeProvider';

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
  const [dragOffset] = useState({ x: 0, y: 0 });

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
      <Container>
        <Button
          onClick={() => setIsAddingComment(true)}
        >
          <Plus />
        </Button>
        {comments.length > 0 && (
          <Container>
            {comments.length}
          </Container>
        )}
      </Container>

      {/* Add Comment Modal */}
      {isAddingComment && (
        <Container>
          <MessageCircle />
          <H3>
            <EditableText field="draggableComment.addCommentTitle" defaultValue="Add Comment">
              Add Comment
            </EditableText>
          </H3>
          <Text>
            <EditableText field="draggableComment.instructions" defaultValue="Type your feedback below. After adding, you can drag the comment icon to any element on the page.">
              Type your feedback below. After adding, you can drag the comment icon to any element on the page.
            </EditableText>
          </Text>
          <Textarea
            value={newCommentText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewCommentText(e.target.value)}
            placeholder="Type your comment here... (e.g., 'This text is too small', 'Change this color', 'Add more spacing here')"
            rows={4}
            autoFocus
          />
          <Button
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
          >
            <EditableText field="draggableComment.addCommentButton" defaultValue="Add Comment">
              Add Comment
            </EditableText>
          </Button>
          <Button
            onClick={() => {
              setIsAddingComment(false);
              setNewCommentText('');
            }}
            variant="outline"
          >
            <EditableText field="draggableComment.cancelButton" defaultValue="Cancel">
              Cancel
            </EditableText>
          </Button>
        </Container>
      )}

      {/* Draggable Comments */}
      {comments.map((comment) => (
        <Container key={comment.id}>
          <MessageCircle />
          <Text>
            <EditableText field="draggableComment.commentText" defaultValue={comment.text}>
              {comment.text}
            </EditableText>
          </Text>
          <Text>
            <EditableText field="draggableComment.commentTimestamp" defaultValue={`${comment.createdAt.toLocaleDateString()} at ${comment.createdAt.toLocaleTimeString()}`}>
              {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
            </EditableText>
          </Text>
          <Text>▼</Text>
          <Button
            onClick={() => handleDeleteComment(comment.id)}
            variant="ghost"
            size="sm"
          >
            <X />
          </Button>
        </Container>
      ))}
    </>
  );
};

export default DraggableCommentSystem; 