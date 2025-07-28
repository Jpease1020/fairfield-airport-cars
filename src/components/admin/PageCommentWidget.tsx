'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui';
import { Container, Text, Span, EditableText } from '@/components/ui';
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
        <Container variant="card" padding="lg">
          {/* Header */}
                      <Container spacing="sm">
              <Text>
                <EditableText field="pageCommentWidget.addPageComment" defaultValue="Add Page Comment">
                  Add Page Comment
                </EditableText>
              </Text>
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X />
            </Button>
          </Container>
          
          {/* Content */}
          <Container spacing="md">
                              <Text size="sm">
                  <Text>
                    <EditableText field="pageCommentWidget.pageLabel" defaultValue="Page:">
                      Page:
                    </EditableText>
                    {pageTitle}
                  </Text>
                </Text>

                {/* Element Selection */}
                <Text size="sm">
                  <Text>
                    <EditableText field="pageCommentWidget.elementLabel" defaultValue="Element (Optional)">
                      Element (Optional)
                    </EditableText>
                  </Text>
                </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={handleElementSelect}
                disabled={isElementSelectMode}
              >
                <Text >
                  <EditableText field="pageCommentWidget.elementButton" defaultValue={selectedElement ? 'Change Element' : 'Select Element'}>
                    {selectedElement ? 'Change Element' : 'Select Element'}
                  </EditableText>
                </Text>
              </Button>
              {selectedElement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedElement('')}
                >
                  <Text >
                    <EditableText field="pageCommentWidget.clearButton" defaultValue="Clear">
                      Clear
                    </EditableText>
                  </Text>
                </Button>
              )}
              {selectedElement && (
                <Text size="sm">
                  <Text >
                    <EditableText field="pageCommentWidget.selectedLabel" defaultValue="Selected:">
                      Selected:
                    </EditableText>
                    {selectedElement}
                  </Text>
                </Text>
              )}
              {isElementSelectMode && (
                <Text size="sm">
                  <Text >
                    <EditableText field="pageCommentWidget.clickToSelect" defaultValue="Click on any element to select it">
                      Click on any element to select it
                    </EditableText>
                  </Text>
                </Text>
              )}

              {/* Category */}
              <Text size="sm">
                <Text >
                  <EditableText field="pageCommentWidget.categoryLabel" defaultValue="Category">
                    Category
                  </EditableText>
                </Text>
              </Text>
              <Select value={category} onValueChange={(value: PageComment['category']) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <MessageSquare />
                    <Text>
                      <Text >
                        <EditableText field="pageCommentWidget.categoryGeneral" defaultValue="General">
                          General
                        </EditableText>
                      </Text>
                    </Text>
                  </SelectItem>
                  <SelectItem value="bug">
                    <AlertCircle />
                    <Text>
                      <Text >
                        <EditableText field="pageCommentWidget.categoryBug" defaultValue="Bug">
                          Bug
                        </EditableText>
                      </Text>
                    </Text>
                  </SelectItem>
                  <SelectItem value="design">
                    <Star />
                    <Text>
                      <Text >
                        <EditableText field="pageCommentWidget.categoryDesign" defaultValue="Design">
                          Design
                        </EditableText>
                      </Text>
                    </Text>
                  </SelectItem>
                  <SelectItem value="copy">
                    <MessageSquare />
                    <Text>
                      <Text >
                        <EditableText field="pageCommentWidget.categoryCopy" defaultValue="Copy/Text">
                          Copy/Text
                        </EditableText>
                      </Text>
                    </Text>
                  </SelectItem>
                  <SelectItem value="feature">
                    <CheckCircle />
                    <Text>
                      <Text >
                        <EditableText field="pageCommentWidget.categoryFeature" defaultValue="Feature Request">
                          Feature Request
                        </EditableText>
                      </Text>
                    </Text>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Priority */}
              <Text size="sm">
                <Text >
                  <EditableText field="pageCommentWidget.priorityLabel" defaultValue="Priority">
                    Priority
                  </EditableText>
                </Text>
              </Text>
              <Select value={priority} onValueChange={(value: PageComment['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <Text >
                      <EditableText field="pageCommentWidget.priorityLow" defaultValue="Low">
                        Low
                      </EditableText>
                    </Text>
                  </SelectItem>
                  <SelectItem value="medium">
                    <Text >
                      <EditableText field="pageCommentWidget.priorityMedium" defaultValue="Medium">
                        Medium
                      </EditableText>
                    </Text>
                  </SelectItem>
                  <SelectItem value="high">
                    <Text >
                      <EditableText field="pageCommentWidget.priorityHigh" defaultValue="High">
                        High
                      </EditableText>
                    </Text>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <Text >
                      <EditableText field="pageCommentWidget.priorityUrgent" defaultValue="Urgent">
                        Urgent
                      </EditableText>
                    </Text>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Comment */}
              <Text size="sm">
                <Text >
                  <EditableText field="pageCommentWidget.commentLabel" defaultValue="Comment">
                    Comment
                  </EditableText>
                </Text>
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
                  <Text >
                    <EditableText field="pageCommentWidget.submitButton" defaultValue={isSubmitting ? 'Submitting...' : 'Submit Comment'}>
                      {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                    </EditableText>
                  </Text>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  <Text >
                    <EditableText field="pageCommentWidget.cancelButton" defaultValue="Cancel">
                      Cancel
                    </EditableText>
                  </Text>
                </Button>
              </Container>
          </Container>
        </Container>
      )}

      {/* Success Message */}
      {showSuccess && (
        <Container variant="card" padding="md">
          <CheckCircle />
          <Span color="success">
            <EditableText field="pageCommentWidget.successMessage" defaultValue="Comment submitted successfully!">
              Comment submitted successfully!
            </EditableText>
          </Span>
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