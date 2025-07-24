'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
      case 'bug': return <AlertCircle className="h-4 w-4" />;
      case 'design': return <Star className="h-4 w-4" />;
      case 'copy': return <MessageSquare className="h-4 w-4" />;
      case 'feature': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 shadow-lg bg-brand-primary hover:bg-brand-primary-hover"
          aria-label="Add page comment"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* Comment Widget */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div ref={widgetRef} className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">Add Page Comment</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Page: {pageTitle}
                  </label>
                </div>

                {/* Element Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Element (Optional)
                  </label>
                  <div className="flex gap-2">
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
                        className="text-red-600"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  {selectedElement && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedElement}
                    </p>
                  )}
                  {isElementSelectMode && (
                    <p className="text-xs text-blue-600 mt-1">
                      Click on any element to select it
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <Select value={category} onValueChange={(value: PageComment['category']) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          General
                        </div>
                      </SelectItem>
                      <SelectItem value="bug">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Bug
                        </div>
                      </SelectItem>
                      <SelectItem value="design">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Design
                        </div>
                      </SelectItem>
                      <SelectItem value="copy">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Copy/Text
                        </div>
                      </SelectItem>
                      <SelectItem value="feature">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Feature Request
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Comment
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe what you'd like to change or improve..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Preview */}
                {comment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(category)}
                      <Badge className={getPriorityColor(priority)}>
                        {priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{comment}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-2 pt-2">
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
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Comment submitted successfully!
            </div>
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