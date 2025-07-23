// Feedback service for page comments and developer communication
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, orderBy, getDocs, deleteDoc } from 'firebase/firestore';

export interface PageComment {
  id: string;
  pageUrl: string;
  pageTitle: string;
  elementSelector?: string; // CSS selector for specific element
  comment: string;
  category: 'bug' | 'design' | 'copy' | 'feature' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string; // Gregg's email
  createdAt: string;
  updatedAt: string;
  developerNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  screenshot?: string; // Base64 screenshot data
  userAgent?: string; // Browser/device info
}

export interface CommentSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byPage: Record<string, number>;
}

class FeedbackService {
  private db: any;
  private commentsCollection = 'page_comments';

  constructor() {
    // Use client-side Firebase initialization
    if (typeof window !== 'undefined') {
      try {
        const { db } = require('./firebase-client');
        this.db = db;
      } catch (error) {
        console.error('Error initializing Firebase for feedback service:', error);
      }
    }
  }

  // Add a new comment
  async addComment(comment: Omit<PageComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (this.db) {
        const commentRef = doc(this.db, this.commentsCollection);
        const now = new Date().toISOString();
        
        await setDoc(commentRef, {
          ...comment,
          id: commentRef.id,
          createdAt: now,
          updatedAt: now
        });
        
        return commentRef.id;
      }
      return '';
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get all comments
  async getComments(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    pageUrl?: string;
  }): Promise<PageComment[]> {
    try {
      if (!this.db) return [];

      let q = query(collection(this.db, this.commentsCollection), orderBy('createdAt', 'desc'));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters?.pageUrl) {
        q = query(q, where('pageUrl', '==', filters.pageUrl));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PageComment);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Get comment by ID
  async getComment(commentId: string): Promise<PageComment | null> {
    try {
      if (!this.db) return null;
      
      const commentRef = doc(this.db, this.commentsCollection, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        return commentDoc.data() as PageComment;
      }
      return null;
    } catch (error) {
      console.error('Error fetching comment:', error);
      return null;
    }
  }

  // Update comment status
  async updateCommentStatus(commentId: string, status: PageComment['status'], developerNotes?: string): Promise<void> {
    try {
      if (this.db) {
        const commentRef = doc(this.db, this.commentsCollection, commentId);
        const updates: any = {
          status,
          updatedAt: new Date().toISOString()
        };
        
        if (developerNotes) {
          updates.developerNotes = developerNotes;
        }
        
        if (status === 'resolved') {
          updates.resolvedAt = new Date().toISOString();
          updates.resolvedBy = 'developer'; // You can make this dynamic
        }
        
        await updateDoc(commentRef, updates);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<void> {
    try {
      if (this.db) {
        const commentRef = doc(this.db, this.commentsCollection, commentId);
        await deleteDoc(commentRef);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Get comment summary
  async getCommentSummary(): Promise<CommentSummary> {
    try {
      const comments = await this.getComments();
      
      const summary: CommentSummary = {
        total: comments.length,
        open: comments.filter(c => c.status === 'open').length,
        inProgress: comments.filter(c => c.status === 'in-progress').length,
        resolved: comments.filter(c => c.status === 'resolved').length,
        byCategory: {},
        byPriority: {},
        byPage: {}
      };

      comments.forEach(comment => {
        // Count by category
        summary.byCategory[comment.category] = (summary.byCategory[comment.category] || 0) + 1;
        
        // Count by priority
        summary.byPriority[comment.priority] = (summary.byPriority[comment.priority] || 0) + 1;
        
        // Count by page
        summary.byPage[comment.pageUrl] = (summary.byPage[comment.pageUrl] || 0) + 1;
      });

      return summary;
    } catch (error) {
      console.error('Error calculating comment summary:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        byCategory: {},
        byPriority: {},
        byPage: {}
      };
    }
  }

  // Get comments for a specific page
  async getPageComments(pageUrl: string): Promise<PageComment[]> {
    return this.getComments({ pageUrl });
  }

  // Get urgent comments
  async getUrgentComments(): Promise<PageComment[]> {
    return this.getComments({ priority: 'urgent' });
  }

  // Get open comments
  async getOpenComments(): Promise<PageComment[]> {
    return this.getComments({ status: 'open' });
  }
}

export const feedbackService = new FeedbackService();
