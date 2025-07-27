'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui';
import { Container, Text, EditableText, Span } from '@/components/ui';
import { feedbackService, type PageComment } from '@/lib/services/feedback-service';
import { MessageSquare, X, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface PageCommentWidgetProps {
  pageUrl: string;
  pageTitle: string;
  isAdmin?: boolean;
}

const PageCommentWidget = ({ pageUrl, pageTitle, isAdmin = false }: PageCommentWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<PageComment['category']>('general');
  const [priority, setPriority] = useState<PageComment['priority']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string>('');
  const [isElementSelectMode, setIsElementSelectMode] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Handle element selection mode
  useEffect(() => {
    if (isElementSelectMode) {
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const target = e.target as HTMLElement;
        if (target && target !== widgetRef.current && !widgetRef.current?.contains(target)) {
          const selector = generateSelector(target);
          setSelectedElement(selector);
          setIsElementSelectMode(false);
          
          // Remove highlight
          document.querySelectorAll('.comment-highlight').forEach(el => {
            el.classList.remove('comment-highlight');
          });
        }
      };

      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isElementSelectMode]);

  const generateSelector = (element: HTMLElement): string => {
    if (element.id) {
      return `#${element.id}`;
    }
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).join('.');
      return `.${classes}`;
    }
    return element.tagName.toLowerCase();
  };

  const handleElementSelect = () => {
    setIsElementSelectMode(true);
    // Add highlight class to all clickable elements
    document.querySelectorAll('*').forEach(el => {
      if (el instanceof HTMLElement && el.offsetWidth > 0 && el.offsetHeight > 0) {
        el.classList.add('comment-highlight');
      }
    });
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await feedbackService.addComment({
        pageUrl,
        pageTitle,
        elementSelector: selectedElement,
        comment: comment.trim(),
        category,
        priority,
        status: 'open',
        createdBy: 'admin@fairfieldairportcars.com', // Gregg's email
        userAgent: navigator.userAgent
      });

      setComment('');
      setCategory('general');
      setPriority('medium');
      setSelectedElement('');
      setShowSuccess(true);
      setIsOpen(false);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'bug': return <AlertCircle  />;
      case 'design': return <Star  />;
      case 'copy': return <MessageSquare  />;
      case 'feature': return <CheckCircle  />;
      default: return <MessageSquare  />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-600';
      case 'closed':
        return 'text-gray-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <CheckCircle />;
      case 'closed': return <X />;
      case 'pending': return <MessageSquare />;
      default: return <MessageSquare />;
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating Comment Button */}
      <Container>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Add page comment"
        >
          <MessageSquare />
        </Button>
      </Container>

      {/* Comment Widget */}
      {isOpen && (
        <Container>
          <Card>
            <CardHeader>
              <CardTitle>
                <EditableText field="pageCommentWidget.title">Add Page Comment</EditableText>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X />
              </Button>
            </CardHeader>
            <CardBody>
              <Text size="sm">
                <EditableText field="pageCommentWidget.pageLabel">Page:</EditableText> {pageTitle}
              </Text>

              {/* Element Selection */}
              <Text size="sm">
                <EditableText field="pageCommentWidget.elementLabel">Element (Optional)</EditableText>
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={handleElementSelect}
                disabled={isElementSelectMode}
              >
                <EditableText field="pageCommentWidget.selectElementButton">
                  {selectedElement ? 'Change Element' : 'Select Element'}
                </EditableText>
              </Button>
              {selectedElement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedElement('')}
                >
                  <EditableText field="pageCommentWidget.clearButton">Clear</EditableText>
                </Button>
              )}
              {selectedElement && (
                <Text size="sm">
                  <EditableText field="pageCommentWidget.selectedLabel">Selected:</EditableText> {selectedElement}
                </Text>
              )}
              {isElementSelectMode && (
                <Text size="sm">
                  <EditableText field="pageCommentWidget.selectInstruction">Click on any element to select it</EditableText>
                </Text>
              )}

              {/* Category */}
              <Text size="sm">
                <EditableText field="pageCommentWidget.categoryLabel">Category</EditableText>
              </Text>
              <Select value={category} onValueChange={(value: PageComment['category']) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <MessageSquare />
                    <Text>
                      <EditableText field="pageCommentWidget.category.general">General</EditableText>
                    </Text>
                  </SelectItem>
                  <SelectItem value="bug">
                    <AlertCircle />
                    <Text>
                      <EditableText field="pageCommentWidget.category.bug">Bug</EditableText>
                    </Text>
                  </SelectItem>
                  <SelectItem value="design">
                    <Star />
                    <Text>
                      <EditableText field="pageCommentWidget.category.design">Design</EditableText>
                    </Text>
                  </SelectItem>
                  <SelectItem value="copy">
                    <MessageSquare />
                    <Text>
                      <EditableText field="pageCommentWidget.category.copy">Copy/Text</EditableText>
                    </Text>
                  </SelectItem>
                  <SelectItem value="feature">
                    <CheckCircle />
                    <Text>
                      <EditableText field="pageCommentWidget.category.feature">Feature Request</EditableText>
                    </Text>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Priority */}
              <Text size="sm">
                <EditableText field="pageCommentWidget.priorityLabel">Priority</EditableText>
              </Text>
              <Select value={priority} onValueChange={(value: PageComment['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <EditableText field="pageCommentWidget.priority.low">Low</EditableText>
                  </SelectItem>
                  <SelectItem value="medium">
                    <EditableText field="pageCommentWidget.priority.medium">Medium</EditableText>
                  </SelectItem>
                  <SelectItem value="high">
                    <EditableText field="pageCommentWidget.priority.high">High</EditableText>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <EditableText field="pageCommentWidget.priority.urgent">Urgent</EditableText>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Comment */}
              <Text size="sm">
                <EditableText field="pageCommentWidget.commentLabel">Comment</EditableText>
              </Text>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe what you'd like to change or improve..."
                rows={4}
              />

              {/* Preview */}
              {comment && (
                <Container>
                  {getCategoryIcon(category)}
                  <Badge>
                    {priority}
                  </Badge>
                  <Text>{comment}</Text>
                </Container>
              )}

              {/* Submit Button */}
              <Container>
                <Button
                  onClick={handleSubmit}
                  disabled={!comment.trim() || isSubmitting}
                >
                  <EditableText field="pageCommentWidget.submitButton">
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </EditableText>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  <EditableText field="pageCommentWidget.cancelButton">Cancel</EditableText>
                </Button>
              </Container>
            </CardBody>
          </Card>
        </Container>
      )}

      {/* Success Message */}
      {showSuccess && (
        <Container>
          <Container>
            <CheckCircle />
            <Span>Comment submitted successfully!</Span>
          </Container>
        </Container>
      )}
      

      {/* Element Selection Styles */}
      <style jsx global>{`
        .comment-highlight {
          cursor: pointer !important;
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          transition: outline 0.2s ease !important;
        }
        .comment-highlight:hover {
          outline: 2px solid #1d4ed8 !important;
          background-color: rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
    </>
  );
};

export default PageCommentWidget; 