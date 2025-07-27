'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui';
import { Container, Text, H3, H4 } from '@/components/ui';
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
      case 'bug': return <AlertCircle className="w-4 h-4" />;
      case 'design': return <Star className="w-4 h-4" />;
      case 'copy': return <MessageSquare className="w-4 h-4" />;
      case 'feature': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-warning text-warning-dark';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating Comment Button */}
      <Container className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full p-3 shadow-lg"
          aria-label="Add page comment"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      </Container>

      {/* Comment Widget */}
      {isOpen && (
        <Container className="fixed inset-0 z-50 overflow-y-auto">
          <Container className="flex min-h-full items-center justify-center p-4">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Add Page Comment</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-text-light hover:text-text-secondary"
                >
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardBody className="space-y-4">
                <Container className="mb-4">
                  <Text className="text-sm font-medium">
                    Page: {pageTitle}
                  </Text>
                </Container>

                {/* Element Selection */}
                <Container className="mb-4">
                  <Text className="text-sm font-medium mb-2">
                    Element (Optional)
                  </Text>
                  <Container className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleElementSelect}
                      disabled={isElementSelectMode}
                      className="flex-1"
                    >
                      {selectedElement ? 'Change Element' : 'Select Element'}
                    </Button>
                    {selectedElement && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedElement('')}
                        className="text-error-color hover:text-error-color"
                      >
                        Clear
                      </Button>
                    )}
                  </Container>
                  {selectedElement && (
                    <Text className="text-sm text-text-secondary mt-2">
                      Selected: {selectedElement}
                    </Text>
                  )}
                  {isElementSelectMode && (
                    <Text className="text-sm text-info-color mt-2">
                      Click on any element to select it
                    </Text>
                  )}
                </Container>

                {/* Category */}
                <Container className="mb-4">
                  <Text className="text-sm font-medium mb-2">
                    Category
                  </Text>
                  <Select value={category} onValueChange={(value: PageComment['category']) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <Container className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <Text>General</Text>
                        </Container>
                      </SelectItem>
                      <SelectItem value="bug">
                        <Container className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <Text>Bug</Text>
                        </Container>
                      </SelectItem>
                      <SelectItem value="design">
                        <Container className="flex items-center space-x-2">
                          <Star className="w-4 h-4" />
                          <Text>Design</Text>
                        </Container>
                      </SelectItem>
                      <SelectItem value="copy">
                        <Container className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <Text>Copy/Text</Text>
                        </Container>
                      </SelectItem>
                      <SelectItem value="feature">
                        <Container className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <Text>Feature Request</Text>
                        </Container>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Container>

                {/* Priority */}
                <Container className="mb-4">
                  <Text className="text-sm font-medium mb-2">
                    Priority
                  </Text>
                  <Select value={priority} onValueChange={(value: PageComment['priority']) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </Container>

                {/* Comment */}
                <Container className="mb-4">
                  <Text className="text-sm font-medium text-text-primary mb-2">
                    Comment
                  </Text>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe what you'd like to change or improve..."
                    rows={4}
                    className="w-full"
                  />
                </Container>

                {/* Preview */}
                {comment && (
                  <Container className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <Container className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(category)}
                      <Badge className={getPriorityColor(priority)}>
                        {priority}
                      </Badge>
                    </Container>
                    <Text>{comment}</Text>
                  </Container>
                )}

                {/* Submit Button */}
                <Container className="flex space-x-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!comment.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </Container>
                              </CardBody>
            </Card>
          </Container>
        </Container>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-success-color border border-success-color text-white px-4 py-3 rounded">
          <div className="flex items-center">
            <CheckCircle className="mr-2" />
            <span>Comment submitted successfully!</span>
          </div>
        </div>
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