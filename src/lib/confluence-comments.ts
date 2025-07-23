import { collection, doc, getDoc, setDoc, updateDoc, query, where, orderBy, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface ConfluenceComment {
  id: string;
  elementId: string;
  elementText: string;
  elementSelector: string;
  pageUrl: string;
  pageTitle: string;
  comment: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  developerNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

class ConfluenceCommentsService {
  private readonly commentsCollection = 'confluence-comments';

  // Add a new comment
  async addComment(comment: Omit<ConfluenceComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const commentRef = doc(collection(db, this.commentsCollection));
      const now = new Date().toISOString();
      
      await setDoc(commentRef, {
        ...comment,
        id: commentRef.id,
        createdAt: now,
        updatedAt: now
      });
      
      return commentRef.id;
    } catch (error) {
      console.error('Error adding confluence comment:', error);
      
      // Fallback to localStorage if Firebase fails
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.log('Falling back to localStorage for comment storage');
        return this.addCommentToLocalStorage(comment);
      }
      
      throw error;
    }
  }

  // Fallback method using localStorage
  private addCommentToLocalStorage(comment: Omit<ConfluenceComment, 'id' | 'createdAt' | 'updatedAt'>): string {
    const now = new Date().toISOString();
    const id = `local_${Date.now()}`;
    
    const fullComment: ConfluenceComment = {
      ...comment,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    const existingComments = this.getCommentsFromLocalStorage();
    existingComments.push(fullComment);
    localStorage.setItem('confluence-comments', JSON.stringify(existingComments));
    
    return id;
  }

  private getCommentsFromLocalStorage(): ConfluenceComment[] {
    try {
      const stored = localStorage.getItem('confluence-comments');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Get all comments
  async getComments(filters: {
    status?: string;
    pageUrl?: string;
    elementId?: string;
  } = {}): Promise<ConfluenceComment[]> {
    try {
      const baseQuery = collection(db, this.commentsCollection);
      
      // Build query with filters
      const constraints = [];
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.pageUrl) {
        constraints.push(where('pageUrl', '==', filters.pageUrl));
      }
      if (filters.elementId) {
        constraints.push(where('elementId', '==', filters.elementId));
      }
      constraints.push(orderBy('createdAt', 'desc'));
      
      const finalQuery = query(baseQuery, ...constraints);
      const querySnapshot = await getDocs(finalQuery);
      return querySnapshot.docs.map(doc => doc.data() as ConfluenceComment);
    } catch (error) {
      console.error('Error getting confluence comments:', error);
      
      // Fallback to localStorage if Firebase fails
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.log('Falling back to localStorage for comment retrieval');
        return this.getCommentsFromLocalStorage();
      }
      
      throw error;
    }
  }

  // Update comment
  async updateComment(commentId: string, updates: Partial<ConfluenceComment>): Promise<void> {
    try {
      const commentRef = doc(db, this.commentsCollection, commentId);
      await updateDoc(commentRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating confluence comment:', error);
      
      // Fallback to localStorage if Firebase fails
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.log('Falling back to localStorage for comment update');
        this.updateCommentInLocalStorage(commentId, updates);
        return;
      }
      
      throw error;
    }
  }

  private updateCommentInLocalStorage(commentId: string, updates: Partial<ConfluenceComment>): void {
    const comments = this.getCommentsFromLocalStorage();
    const index = comments.findIndex(c => c.id === commentId);
    
    if (index !== -1) {
      comments[index] = { ...comments[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('confluence-comments', JSON.stringify(comments));
    }
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<void> {
    try {
      const commentRef = doc(db, this.commentsCollection, commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error('Error deleting confluence comment:', error);
      
      // Fallback to localStorage if Firebase fails
      if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
        console.log('Falling back to localStorage for comment deletion');
        this.deleteCommentFromLocalStorage(commentId);
        return;
      }
      
      throw error;
    }
  }

  private deleteCommentFromLocalStorage(commentId: string): void {
    const comments = this.getCommentsFromLocalStorage();
    const filteredComments = comments.filter(c => c.id !== commentId);
    localStorage.setItem('confluence-comments', JSON.stringify(filteredComments));
  }

  // Get comment summary
  async getCommentSummary(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  }> {
    try {
      const comments = await this.getComments();
      
      return {
        total: comments.length,
        open: comments.filter(c => c.status === 'open').length,
        inProgress: comments.filter(c => c.status === 'in-progress').length,
        resolved: comments.filter(c => c.status === 'resolved').length,
      };
    } catch (error) {
      console.error('Error getting comment summary:', error);
      throw error;
    }
  }
}

export const confluenceCommentsService = new ConfluenceCommentsService(); 