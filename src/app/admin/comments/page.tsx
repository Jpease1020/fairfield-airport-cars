'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { confluenceCommentsService, type ConfluenceComment } from '@/lib/confluence-comments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, MessageSquare, ExternalLink, Trash2, Edit3 } from 'lucide-react';

interface CommentSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<ConfluenceComment[]>([]);
  const [summary, setSummary] = useState<CommentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<ConfluenceComment | null>(null);
  const [developerNotes, setDeveloperNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    pageUrl: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadComments();
  }, [filters]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const commentsData = await confluenceCommentsService.getComments({
        status: filters.status || undefined,
        pageUrl: filters.pageUrl || undefined
      });
      
      const summaryData = await confluenceCommentsService.getCommentSummary();
      
      setComments(commentsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (commentId: string, status: ConfluenceComment['status']) => {
    try {
      await confluenceCommentsService.updateComment(commentId, { 
        status, 
        developerNotes: developerNotes || undefined 
      });
      await loadComments();
      setSelectedComment(null);
      setDeveloperNotes('');
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await confluenceCommentsService.deleteComment(commentId);
        await loadComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.comment.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    comment.elementText.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    comment.pageTitle.toLowerCase().includes(filters.searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: ConfluenceComment['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  const navigateToPage = (pageUrl: string) => {
    router.push(pageUrl);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Comments</h1>
        <p className="text-gray-600">Review and manage all page comments</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Comments</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.open}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{summary.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Page URL</label>
              <Select value={filters.pageUrl} onValueChange={(value) => setFilters(prev => ({ ...prev, pageUrl: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All pages</SelectItem>
                  {Array.from(new Set(comments.map(c => c.pageUrl))).map(url => (
                    <SelectItem key={url} value={url}>{url}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <Input
                placeholder="Search comments..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No comments found</p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map(comment => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(comment.status)}
                      <Badge className={getStatusColor(comment.status)}>
                        {comment.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Element: {comment.elementText.slice(0, 50)}...
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Page: {comment.pageTitle} ({comment.pageUrl})
                      </p>
                      <p className="text-sm text-gray-800">{comment.comment}</p>
                    </div>
                    
                    {comment.developerNotes && (
                      <div className="mb-3 p-3 bg-blue-50 rounded">
                        <p className="text-xs font-medium text-blue-800 mb-1">Developer Notes:</p>
                        <p className="text-xs text-blue-700">{comment.developerNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToPage(comment.pageUrl)}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Page
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedComment(comment)}
                      className="flex items-center gap-1"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Comment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select 
                  value={selectedComment.status} 
                  onValueChange={(value) => setSelectedComment(prev => prev ? { ...prev, status: value as ConfluenceComment['status'] } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Developer Notes</label>
                <textarea
                  value={developerNotes}
                  onChange={(e) => setDeveloperNotes(e.target.value)}
                  placeholder="Add developer notes..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleStatusUpdate(selectedComment.id, selectedComment.status)}
                  className="flex-1"
                >
                  Update Comment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedComment(null);
                    setDeveloperNotes('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 