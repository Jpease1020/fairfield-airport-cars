'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { type ConfluenceComment } from '@/lib/business/confluence-comments';
import { Container, H4, Span } from '@/ui';
import StatusBadge from '@/components/business/StatusBadge';
import { Stack } from '@/ui';
import { Button } from '@/ui';
import { Select } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider'; 

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
  const { cmsData } = useCMSData();
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
            {getCMSField(cmsData, 'commentStatusManager.statusHeader', 'Comment Status')}
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
              {getCMSField(cmsData, 'commentStatusManager.changeStatus', 'Change Status:')}
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
            {getCMSField(cmsData, 'commentStatusManager.quickActions', 'Quick Actions')}
          </H4>
          <Container variant="elevated" padding="sm">
            <Button
              onClick={() => onEdit(comment.id)}
              variant="secondary"
              size="sm"
              disabled={isEditing}
            >
              <Edit size={16} />
              {getCMSField(cmsData, 'commentStatusManager.editButton', 'Edit')}
            </Button>
            <Button 
              onClick={handleDelete}
              variant="danger"
              size="sm"
            >
              <Trash2 size={16} />
              {getCMSField(cmsData, 'commentStatusManager.deleteButton', 'Delete')}
            </Button>
          </Container>
        </Container>

        {/* Status History */}
        <Container variant="elevated" padding="sm">
          <H4>
            {getCMSField(cmsData, 'commentStatusManager.history', 'Status History')}
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
            {getCMSField(cmsData, 'commentStatusManager.elementInfo', 'Element Information')}
          </H4>
          <Container variant="elevated" padding="xs">
            <Span variant="default" size="sm">
              {getCMSField(cmsData, 'commentStatusManager.element', 'Element:')}
              {comment.elementText}
            </Span>
            <Span variant="default" size="sm">
              {getCMSField(cmsData, 'commentStatusManager.page', 'Page:')}
              {comment.pageTitle}
            </Span>
            <Span variant="default" size="sm">
              {getCMSField(cmsData, 'commentStatusManager.author', 'Author:')}
              {comment.createdBy}
            </Span>
          </Container>
        </Container>
      </Stack>
    </Container>
  );
} 