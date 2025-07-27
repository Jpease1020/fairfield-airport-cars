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
      case 'bug': return <AlertCircle className="" />;
      case 'design': return <Star className="" />;
      case 'copy': return <MessageSquare className="" />;
      case 'feature': return <CheckCircle className="" />;
      default: return <MessageSquare className="" />;
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
      <Container className="">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className=""
          aria-label="Add page comment"
        >
          <MessageSquare className="" />
        </Button>
      </Container>

      {/* Comment Widget */}
      {isOpen && (
        <Container className="">
          <Container className="">
            <Card>
              <CardHeader className="">
                <CardTitle className="">Add Page Comment</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className=""
                >
                  <X className="" />
                </Button>
              </CardHeader>
              <CardBody className="">
                <div>
                  <label className="">
                    Page: {pageTitle}
                  </label>
                </div>

                {/* Element Selection */}
                <div>
                  <label className="">
                    Element (Optional)
                  </label>
                  <div className="">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleElementSelect}
                      disabled={isElementSelectMode}
                      className=""
                    >
                      {selectedElement ? 'Change Element' : 'Select Element'}
                    </Button>
                    {selectedElement && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedElement('')}
                        className=""
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {selectedElement && (
                    <p className="">
                      Selected: {selectedElement}
                    </p>
                  )}
                  {isElementSelectMode && (
                    <p className="">
                      Click on any element to select it
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="">
                    Category
                  </label>
                  <Select value={category} onValueChange={(value: PageComment['category']) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="">
                          <MessageSquare className="" />
                          General
                        </div>
                      </SelectItem>
                      <SelectItem value="bug">
                        <div className="">
                          <AlertCircle className="" />
                          Bug
                        </div>
                      </SelectItem>
                      <SelectItem value="design">
                        <div className="">
                          <Star className="h-4 w-4" />
                          Design
                        </div>
                      </SelectItem>
                      <SelectItem value="copy">
                        <div className="">
                          <MessageSquare className="" />
                          Copy/Text
                        </div>
                      </SelectItem>
                      <SelectItem value="feature">
                        <div className="">
                          <CheckCircle className="" />
                          Feature Request
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <label className="">
                    Priority
                  </label>
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
                </div>

                {/* Comment */}
                <div>
                  <label className="">
                    Comment
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe what you'd like to change or improve..."
                    rows={4}
                    className=""
                  />
                </div>

                {/* Preview */}
                {comment && (
                  <div className="">
                    <div className="">
                      {getCategoryIcon(category)}
                      <Badge className={getPriorityColor(priority)}>
                        {priority}
                      </Badge>
                    </div>
                    <p className="">{comment}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="">
                  <Button
                    onClick={handleSubmit}
                    disabled={!comment.trim() || isSubmitting}
                    className=""
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
                              </CardBody>
            </Card>
          </Container>
        </Container>
      )}

      {/* Success Message */}
      {showSuccess && (
        <Container className="">
          <Container className="">
            <Container className="">
              <CheckCircle className="" />
              Comment submitted successfully!
            </Container>
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