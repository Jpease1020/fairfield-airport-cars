import { collection, doc, setDoc, updateDoc, query, where, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
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

  async addComment(comment: Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const commentRef = doc(collection(db, this.collectionName));
    const now = new Date().toISOString();
    try {
      await setDoc(commentRef, {
        ...comment,
        id: commentRef.id,
        createdAt: now,
        updatedAt: now,
      });
      return commentRef.id;
    } catch (error) {
      // Fallback for permission or offline
      return this.addToLocalStorage(comment);
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
      const constraints: any[] = [];
      if (filters.status) constraints.push(where('status', '==', filters.status));
      if (filters.pageUrl) constraints.push(where('pageUrl', '==', filters.pageUrl));
      if (filters.elementId) constraints.push(where('elementId', '==', filters.elementId));
      if (filters.scope) constraints.push(where('scope', '==', filters.scope));
      constraints.push(orderBy('createdAt', 'desc'));
      const q = query(base, ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as CommentRecord);
    } catch (error) {
      return this.getFromLocalStorage();
    }
  }

  async updateComment(commentId: string, updates: Partial<CommentRecord>): Promise<void> {
    try {
      const ref = doc(db, this.collectionName, commentId);
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    } catch (error) {
      this.updateInLocalStorage(commentId, updates);
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      const ref = doc(db, this.collectionName, commentId);
      await deleteDoc(ref);
    } catch (error) {
      this.deleteFromLocalStorage(commentId);
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

  // Local storage fallbacks
  private storageKey = 'comments-storage';

  private getFromLocalStorage(): CommentRecord[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToLocalStorage(list: CommentRecord[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {}
  }

  private addToLocalStorage(comment: Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'>): string {
    const now = new Date().toISOString();
    const id = `local_${Date.now()}`;
    const full: CommentRecord = { ...comment, id, createdAt: now, updatedAt: now };
    const list = this.getFromLocalStorage();
    list.push(full);
    this.saveToLocalStorage(list);
    return id;
  }

  private updateInLocalStorage(id: string, updates: Partial<CommentRecord>) {
    const list = this.getFromLocalStorage();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() } as CommentRecord;
      this.saveToLocalStorage(list);
    }
  }

  private deleteFromLocalStorage(id: string) {
    const list = this.getFromLocalStorage();
    const filtered = list.filter(c => c.id !== id);
    this.saveToLocalStorage(filtered);
  }
}

export const commentsService = new CommentsService();


