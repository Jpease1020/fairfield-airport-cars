'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { useAdmin } from './AdminProvider';
import { confluenceCommentsService, type ConfluenceComment } from '@/lib/business/confluence-comments';

interface SimpleCommentSystemProps {
  children: ReactNode;
}

const SimpleCommentSystem = ({ children }: SimpleCommentSystemProps) => {
  const { isAdmin, commentMode } = useAdmin();
  const [comments, setComments] = useState<ConfluenceComment[]>([]);
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const commentBoxRef = useRef<HTMLDivElement>(null);

  // Load comments from Firebase
  useEffect(() => {
    if (isAdmin) {
      loadComments();
    }
  }, [isAdmin]);

  const loadComments = async () => {
    try {
      const commentsData = await confluenceCommentsService.getComments();
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Handle left-click on any element (Confluence-style)
  useEffect(() => {
    if (!isAdmin || !commentMode) return;

    const handleClick = (e: MouseEvent) => {
      // Prevent default behavior when comment mode is active
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      if (!target) return;

      // Comprehensive exclusion of comment-related elements
      const isCommentElement = 
        target.closest('.comment-box') ||
        target.closest('.comment-icon') ||
        target.closest('.simple-comment-icon') ||
        target.closest('.comment-highlight') ||
        target.closest('.commentable-section') ||
        target.closest('[data-comment-id]') ||
        target.closest('.comment-mode-active') ||
        target.closest('[class*="comment"]') || // Any class containing "comment"
        target.closest('button') || // Exclude all buttons
        target.closest('a') || // Exclude all links
        target.closest('input') || // Exclude all inputs
        target.closest('textarea') || // Exclude all textareas
        target.closest('select') || // Exclude all selects
        target.closest('form'); // Exclude all forms

      if (isCommentElement) {
        console.log('🔒 CommentSystem - Skipping comment element:', target.tagName, target.className);
        return;
      }

      // Generate unique ID for the element
      const elementId = generateElementId(target);
      const elementText = target.textContent?.trim() || target.tagName.toLowerCase();
      
      console.log('💬 CommentSystem - Adding comment to element:', elementText);
      
      setSelectedElement(target);
      setActiveCommentBox(elementId);
      setCommentText('');
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isAdmin, commentMode]);

  // Close comment box when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commentBoxRef.current && !commentBoxRef.current.contains(e.target as Node)) {
        setActiveCommentBox(null);
        setSelectedElement(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateElementId = (element: HTMLElement): string => {
    // Create a unique ID based on element properties
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const textContent = element.textContent?.slice(0, 20) || '';
    const hash = btoa(`${tagName}-${className}-${textContent}`).replace(/[^a-zA-Z0-9]/g, '');
    return `comment-${hash}`;
  };

  const generateElementSelector = (element: HTMLElement): string => {
    // Generate a CSS selector for the element
    if (element.id) {
      return `#${element.id}`;
    }
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c).join('.');
      return `.${classes}`;
    }
    return element.tagName.toLowerCase();
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedElement) return;

    const elementId = generateElementId(selectedElement);
    const elementText = selectedElement.textContent?.trim() || selectedElement.tagName.toLowerCase();
    const elementSelector = generateElementSelector(selectedElement);
    
    try {
      await confluenceCommentsService.addComment({
        elementId,
        elementText,
        elementSelector,
        pageUrl: window.location.pathname,
        pageTitle: document.title,
        comment: commentText.trim(),
        status: 'open',
        createdBy: 'admin@fairfieldairportcar.com'
      });

      await loadComments(); // Reload comments from Firebase
      setActiveCommentBox(null);
      setSelectedElement(null);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId: string, newText: string) => {
    try {
      await confluenceCommentsService.updateComment(commentId, { comment: newText });
      await loadComments(); // Reload comments from Firebase
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleStatusChange = async (commentId: string, newStatus: ConfluenceComment['status']) => {
    try {
      await confluenceCommentsService.updateComment(commentId, { status: newStatus });
      await loadComments(); // Reload comments from Firebase
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await confluenceCommentsService.deleteComment(commentId);
      await loadComments(); // Reload comments from Firebase
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getExistingComments = (elementId: string) => {
    return comments.filter(comment => comment.elementId === elementId);
  };

  const existingComments = selectedElement ? getExistingComments(generateElementId(selectedElement)) : [];

  const getStatusIcon = (status: ConfluenceComment['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="" />;
      case 'in-progress':
        return <Clock className="" />;
      case 'resolved':
        return <CheckCircle className="" />;
      default:
        return <Clock className="" />;
    }
  };

  const getStatusColor = (status: ConfluenceComment['status']) => {
    switch (status) {
      case 'open':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add comment icons to elements with comments
  useEffect(() => {
    if (!isAdmin) return;

    // Remove existing comment icons
    document.querySelectorAll('.simple-comment-icon').forEach(el => el.remove());

    // Add comment icons for elements with comments
    comments.forEach(comment => {
      // Try to find the element by various selectors
      let targetElement: HTMLElement | null = null;
      
      // First try to find by data attribute
      targetElement = document.querySelector(`[data-comment-id="${comment.elementId}"]`) as HTMLElement;
      
      // If not found, try to find by text content (approximate match)
      if (!targetElement) {
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
          if (element instanceof HTMLElement && 
              element.textContent?.trim() === comment.elementText) {
            targetElement = element;
            break;
          }
        }
      }
      
      // If still not found, try to find by partial text match
      if (!targetElement) {
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
          if (element instanceof HTMLElement && 
              element.textContent?.includes(comment.elementText.slice(0, 10))) {
            targetElement = element;
            break;
          }
        }
      }

      if (targetElement) {
        // Add data attribute for future reference
        targetElement.setAttribute('data-comment-id', comment.elementId);
        
        // Ensure the element has relative positioning
        if (getComputedStyle(targetElement).position === 'static') {
          targetElement.style.position = 'relative';
        }

        const icon = document.createElement('div');
        icon.className = 'simple-comment-icon absolute top-1 right-1 z-50 cursor-pointer';
        
        // Determine icon color based on comment status
        const commentStatuses = comments.filter(c => c.elementId === comment.elementId).map(c => c.status);
        const hasOpen = commentStatuses.includes('open');
        const hasInProgress = commentStatuses.includes('in-progress');
        const hasResolved = commentStatuses.includes('resolved');
        
        let iconColor = 'bg-blue-500 hover:bg-blue-600';
        if (hasOpen) {
          iconColor = 'bg-red-500 hover:bg-red-600';
        } else if (hasInProgress) {
          iconColor = 'bg-yellow-500 hover:bg-yellow-600';
        } else if (hasResolved) {
          iconColor = 'bg-green-500 hover:bg-green-600';
        }
        
        icon.innerHTML = `
          <div class="${iconColor} text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg transition-colors">
            💬
          </div>
        `;
        icon.onclick = (e) => {
          e.stopPropagation();
          setSelectedElement(targetElement);
          setActiveCommentBox(comment.elementId);
          setCommentText('');
        };
        
        // Remove any existing icon for this element
        targetElement.querySelectorAll('.simple-comment-icon').forEach(el => el.remove());
        targetElement.appendChild(icon);
      }
    });
  }, [comments, isAdmin]);

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Comment Box */}
      {activeCommentBox && selectedElement && (
        <div
          ref={commentBoxRef}
          className=""
          style={{
            top: selectedElement.getBoundingClientRect().top - 10,
            left: selectedElement.getBoundingClientRect().right + 10,
          }}
        >
          <div className="">
            <h4 className="">
              {existingComments.length > 0 ? `Comments (${existingComments.length})` : 'Add Comment'}
            </h4>
            <button
              onClick={() => {
                setActiveCommentBox(null);
                setSelectedElement(null);
              }}
              className=""
            >
              <X className="" />
            </button>
          </div>
          
          <div className="">
            <strong>Element:</strong> {selectedElement.textContent?.slice(0, 50) || selectedElement.tagName.toLowerCase()}
          </div>
          
          {/* Existing Comments */}
          {existingComments.length > 0 && (
            <div className="">
              {existingComments.map(comment => (
                <div key={comment.id} className="">
                  <div className="">
                    <div className="">
                      {getStatusIcon(comment.status)}
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(comment.status)}`}>
                        {comment.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className=""
                    >
                      <X className="" />
                    </button>
                  </div>
                  
                  <textarea
                    value={comment.comment}
                    onChange={(e) => handleEditComment(comment.id, e.target.value)}
                    className=""
                    rows={2}
                  />
                  
                  <div className="">
                    <select
                      value={comment.status}
                      onChange={(e) => handleStatusChange(comment.id, e.target.value as ConfluenceComment['status'])}
                      className=""
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* New Comment Input */}
          <div className="">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a new comment..."
              className=""
              rows={3}
              autoFocus
            />
            
            <div className="">
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className=""
              >
                Add Comment
              </button>
              <button
                onClick={() => {
                  setActiveCommentBox(null);
                  setSelectedElement(null);
                }}
                className=""
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        .simple-comment-icon {
          transition: all 0.2s ease;
        }
        
        .simple-comment-icon:hover {
          transform: scale(1.1);
        }
        
        .comment-mode-active * {
          cursor: pointer !important;
        }
        
        .comment-mode-active *:hover {
          outline: 2px dashed #3b82f6 !important;
          outline-offset: 1px !important;
          background-color: rgba(59, 130, 246, 0.05) !important;
        }
        
        .comment-mode-active *:hover::after {
          content: "💬";
          position: absolute;
          top: 2px;
          right: 2px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          z-index: 50;
        }
      `}</style>
    </>
  );
};

export default SimpleCommentSystem; 