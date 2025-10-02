import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db } from '../utils/firebase';

export type CommentScope = 'page' | 'app';

export interface CommentRecord {
  id: string;
  elementId: string; // local element click id at time of creation
  elementText: string;
  elementSelector: string; // CSS-ish selector for re-finding element
  pageUrl: string; // pathname for page scope
  pageTitle: string;
  comment: string;
  status: 'open' | 'in-progress' | 'resolved';
  scope: CommentScope; // 'page' (default) or 'app'
  createdBy: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

class CommentsService {
  private readonly collectionName = 'comments';

  async addComment(commentData: Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    
    try {
      // Add timestamps automatically
      const commentWithTimestamps = {
        ...commentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), commentWithTimestamps);
      return docRef.id;
    } catch (error) {
      console.error('❌ Firebase addComment failed:', error);
      throw error;
    }
  }

  async getComments(filters: {
    status?: CommentRecord['status'];
    pageUrl?: string;
    elementId?: string;
    scope?: CommentScope;
  } = {}): Promise<CommentRecord[]> {
    try {
      const base = collection(db, this.collectionName);
      
      // Simplified query to avoid index requirement
      // We'll filter in JavaScript instead of using complex Firestore queries
      let q = query(base, orderBy('createdAt', 'desc'));
      
      const snap = await getDocs(q);
      
      // Filter in JavaScript to avoid index requirements
      let comments = snap.docs.map(d => {
        const data = d.data() as CommentRecord;
        return data;
      });
      
      if (filters.status) {
        comments = comments.filter(c => c.status === filters.status);
      }
      if (filters.pageUrl) {
        comments = comments.filter(c => {
          const matches = c.pageUrl === filters.pageUrl;
          return matches;
        });
      }
      if (filters.elementId) {
        comments = comments.filter(c => c.elementId === filters.elementId);
      }
      if (filters.scope) {
        comments = comments.filter(c => c.scope === filters.scope);
      }
      
      return comments;
      
    } catch (error) {
      console.error('❌ Firebase getComments failed:', error);
      
      // Don't fall back to localStorage - let the error bubble up
      throw new Error(`Failed to get comments from Firebase: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async updateComment(commentId: string, updates: Partial<CommentRecord>): Promise<void> {
    try {
      const ref = doc(db, this.collectionName, commentId);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Firebase updateComment failed:', error);
      throw new Error(`Failed to update comment in Firebase: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    
    try {
      const ref = doc(db, this.collectionName, commentId);      
      await deleteDoc(ref);
    } catch (error) {
      console.error('❌ Firestore delete failed:', error);
      
      // Don't fall back to localStorage - let the error bubble up
      throw new Error(`Failed to delete comment from Firebase: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async getCommentSummary(): Promise<{ total: number; open: number; inProgress: number; resolved: number }>{
    const comments = await this.getComments();
    return {
      total: comments.length,
      open: comments.filter(c => c.status === 'open').length,
      inProgress: comments.filter(c => c.status === 'in-progress').length,
      resolved: comments.filter(c => c.status === 'resolved').length,
    };
  }
}

export const commentsService = new CommentsService();


