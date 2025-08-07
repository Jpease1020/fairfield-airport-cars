'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { type ConfluenceComment } from '@/lib/business/confluence-comments';
import { Container, H4, Span } from '@/ui';
import StatusBadge from '@/components/business/StatusBadge';
import { Stack } from '@/ui';
import { Button } from '@/ui';
import { Select } from '@/ui';
import { EditableText } from '@/ui';

interface CommentStatusManagerProps {
  comment: ConfluenceComment;
  onStatusChange: (_commentId: string, _status: ConfluenceComment['status']) => Promise<void>;
  onEdit: (_commentId: string) => void;
  onDelete: (_commentId: string) => Promise<void>;
  isEditing?: boolean;
}

export default function CommentStatusManager({
  comment,
  onStatusChange,
  onEdit,
  onDelete,
  isEditing = false
}: CommentStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: ConfluenceComment['status']) => {
    setIsUpdating(true);
    try {
      await onStatusChange(comment.id, newStatus);
    } catch (error) {
      console.error('Error updating comment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

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

  const getStatusDescription = (status: ConfluenceComment['status']) => {
    switch (status) {
      case 'open':
        return 'Needs attention';
      case 'in-progress':
        return 'Being worked on';
      case 'resolved':
        return 'Completed';
      default:
        return 'Unknown status';
    }
  };

  return (
    <Container variant="elevated" padding="md">
      <Stack spacing="md">
        {/* Status Header */}
        <Container variant="elevated" padding="sm">
          <H4>
            <EditableText field="commentStatusManager.statusHeader" defaultValue="Comment Status">
              Comment Status
            </EditableText>
          </H4>
          <Container variant="elevated" padding="xs">
            <StatusBadge status={comment.status} />
            <Span variant="default" size="sm" color="muted">
              {getStatusDescription(comment.status)}
            </Span>
          </Container>
        </Container>

        {/* Status Controls */}
        <Container variant="elevated" padding="sm">
          <Container variant="elevated" padding="xs">
            <Span variant="default" size="sm">
              <EditableText field="commentStatusManager.changeStatus" defaultValue="Change Status:">
                Change Status:
              </EditableText>
            </Span>
            <Select
              value={comment.status}
              onChange={(e) => handleStatusChange(e.target.value as ConfluenceComment['status'])}
              disabled={isUpdating}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' }
              ]}
            />
          </Container>
        </Container>

        {/* Quick Actions */}
        <Container variant="elevated" padding="sm">
          <H4>
            <EditableText field="commentStatusManager.quickActions" defaultValue="Quick Actions">
              Quick Actions
            </EditableText>
          </H4>
          <Container variant="elevated" padding="sm">
            <Button
              onClick={() => onEdit(comment.id)}
              variant="secondary"
              size="sm"
              disabled={isEditing}
            >
              <Edit size={16} />
              <EditableText field="commentStatusManager.editButton" defaultValue="Edit">
                Edit
              </EditableText>
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              size="sm"
            >
              <Trash2 size={16} />
              <EditableText field="commentStatusManager.deleteButton" defaultValue="Delete">
                Delete
              </EditableText>
            </Button>
          </Container>
        </Container>

        {/* Status History */}
        <Container variant="elevated" padding="sm">
          <H4>
            <EditableText field="commentStatusManager.history" defaultValue="Status History">
              Status History
            </EditableText>
          </H4>
          <Container variant="elevated" padding="xs">
            <Span variant="default" size="sm" color="muted">
              Created: {new Date(comment.createdAt).toLocaleDateString()}
            </Span>
            <Span variant="default" size="sm" color="muted">
              Updated: {new Date(comment.updatedAt).toLocaleDateString()}
            </Span>
            {comment.resolvedAt && (
              <Span variant="default" size="sm" color="muted">
                Resolved: {new Date(comment.resolvedAt).toLocaleDateString()}
              </Span>
            )}
          </Container>
        </Container>

        {/* Element Information */}
        <Container variant="elevated" padding="sm">
          <H4>
            <EditableText field="commentStatusManager.elementInfo" defaultValue="Element Information">
              Element Information
            </EditableText>
          </H4>
          <Container variant="elevated" padding="xs">
            <Span variant="default" size="sm">
              <EditableText field="commentStatusManager.element" defaultValue="Element:">
                Element:
              </EditableText>
              {comment.elementText}
            </Span>
            <Span variant="default" size="sm">
              <EditableText field="commentStatusManager.page" defaultValue="Page:">
                Page:
              </EditableText>
              {comment.pageTitle}
            </Span>
            <Span variant="default" size="sm">
              <EditableText field="commentStatusManager.author" defaultValue="Author:">
                Author:
              </EditableText>
              {comment.createdBy}
            </Span>
          </Container>
        </Container>
      </Stack>
    </Container>
  );
} 