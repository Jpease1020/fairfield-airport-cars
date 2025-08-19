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
    console.log('📝 Adding comment to Firebase:', commentData);
    console.log('📝 Collection name:', this.collectionName);
    
    try {
      // Add timestamps automatically
      const commentWithTimestamps = {
        ...commentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('📝 Comment with timestamps:', commentWithTimestamps);
      
      const docRef = await addDoc(collection(db, this.collectionName), commentWithTimestamps);
      console.log('✅ Comment added successfully to Firebase with ID:', docRef.id);
      console.log('✅ Document path:', docRef.path);
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
      console.log('🔥 Attempting to get comments from Firebase...');
      const base = collection(db, this.collectionName);
      
      // Simplified query to avoid index requirement
      // We'll filter in JavaScript instead of using complex Firestore queries
      let q = query(base, orderBy('createdAt', 'desc'));
      
      console.log('📡 Firebase query (simplified):', q);
      console.log('📡 Query path:', base.path);
      const snap = await getDocs(q);
      console.log('✅ Firebase query successful, got', snap.docs.length, 'comments');
      console.log('📡 All document IDs returned:', snap.docs.map(d => d.id));
      console.log('📡 All document paths returned:', snap.docs.map(d => d.ref.path));
      
      // Filter in JavaScript to avoid index requirements
      let comments = snap.docs.map(d => {
        const data = d.data() as CommentRecord;
        console.log(`📄 Document ${d.id} at ${d.ref.path}:`, data);
        console.log(`📄 Document ${d.id} createdAt:`, data.createdAt);
        return data;
      });
      
      console.log('🔍 Raw comments before filtering:', comments.map(c => ({ 
        id: c.id, 
        pageUrl: c.pageUrl, 
        scope: c.scope, 
        elementId: c.elementId 
      })));
      console.log('🔍 Applied filters:', filters);
      
      if (filters.status) {
        comments = comments.filter(c => c.status === filters.status);
        console.log('🔍 After status filter:', comments.length, 'comments');
      }
      if (filters.pageUrl) {
        console.log('🔍 Filtering by pageUrl:', filters.pageUrl);
        console.log('🔍 Comment pageUrls:', comments.map(c => c.pageUrl));
        comments = comments.filter(c => {
          const matches = c.pageUrl === filters.pageUrl;
          console.log(`🔍 Comment ${c.id}: ${c.pageUrl} === ${filters.pageUrl} = ${matches}`);
          return matches;
        });
        console.log('🔍 After pageUrl filter:', comments.length, 'comments');
      }
      if (filters.elementId) {
        comments = comments.filter(c => c.elementId === filters.elementId);
        console.log('🔍 After elementId filter:', comments.length, 'comments');
      }
      if (filters.scope) {
        comments = comments.filter(c => c.scope === filters.scope);
        console.log('🔍 After scope filter:', comments.length, 'comments');
      }
      
      console.log('🔍 After filtering:', comments.length, 'comments');
      return comments;
      
    } catch (error) {
      console.error('❌ Firebase getComments failed:', error);
      console.error('Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details
      });
      
      // Don't fall back to localStorage - let the error bubble up
      throw new Error(`Failed to get comments from Firebase: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async updateComment(commentId: string, updates: Partial<CommentRecord>): Promise<void> {
    try {
      const ref = doc(db, this.collectionName, commentId);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
      console.log('✅ Comment updated successfully in Firebase');
    } catch (error) {
      console.error('❌ Firebase updateComment failed:', error);
      throw new Error(`Failed to update comment in Firebase: ${(error as any)?.message || 'Unknown error'}`);
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    console.log('🗑️ CommentsService.deleteComment called with ID:', commentId);
    
    try {
      const ref = doc(db, this.collectionName, commentId);
      console.log('📡 Firestore document reference:', ref.path);
      
      await deleteDoc(ref);
      console.log('✅ Comment deleted successfully from Firestore');
    } catch (error) {
      console.error('❌ Firestore delete failed:', error);
      console.error('Error details:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details
      });
      
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


