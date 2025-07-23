'use client';

import { useState, useEffect } from 'react';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/data';
import { feedbackService, type PageComment, type CommentSummary } from '@/lib/feedback-service';
import { 
  MessageSquare, 
  AlertCircle, 
  Star, 
  CheckCircle, 
  Clock,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';

const FeedbackDashboard = () => {
  const [comments, setComments] = useState<PageComment[]>([]);
  const [summary, setSummary] = useState<CommentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<PageComment | null>(null);
  const [developerNotes, setDeveloperNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    pageUrl: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadComments();
  }, [filters]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const commentsData = await feedbackService.getComments(filters);
      const summaryData = await feedbackService.getCommentSummary();
      
      setComments(commentsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (commentId: string, status: PageComment['status']) => {
    try {
      await feedbackService.updateCommentStatus(commentId, status, developerNotes);
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
        await feedbackService.deleteComment(commentId);
        await loadComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.pageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'design': return <Star className="h-4 w-4 text-warning" />;
      case 'copy': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'feature': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-warning text-warning-dark';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading feedback..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Feedback Dashboard" 
        subtitle="Review and manage page comments from Gregg"
      />
      <PageContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Comments</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-warning rounded-lg">
                  <Clock className="h-6 w-6 text-warning-dark" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.open || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.inProgress || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{summary?.resolved || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="copy">Copy/Text</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Page</label>
                  <Select value={filters.pageUrl} onValueChange={(value) => setFilters({...filters, pageUrl: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Pages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Pages</SelectItem>
                      {Object.keys(summary?.byPage || {}).map(page => (
                        <SelectItem key={page} value={page}>{page}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search comments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(comment.category)}
                      <h3 className="font-semibold text-gray-900">{comment.pageTitle}</h3>
                      <Badge className={getPriorityColor(comment.priority)}>
                        {comment.priority}
                      </Badge>
                      <Badge className={getStatusColor(comment.status)}>
                        {comment.status}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-3">{comment.comment}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By: {comment.createdBy}</span>
                      <span>Created: {new Date(comment.createdAt).toLocaleDateString()}</span>
                      {comment.elementSelector && (
                        <span>Element: {comment.elementSelector}</span>
                      )}
                    </div>

                    {comment.developerNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Developer Notes:</p>
                        <p className="text-sm text-blue-700">{comment.developerNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(comment.pageUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedComment(comment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredComments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
                <p className="text-gray-500">No comments match your current filters.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Comment Detail Modal */}
        {selectedComment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Update Comment</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedComment(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedComment.pageTitle}</h3>
                    <p className="text-gray-700 mb-4">{selectedComment.comment}</p>
                    <div className="flex items-center gap-2 mb-4">
                      {getCategoryIcon(selectedComment.category)}
                      <Badge className={getPriorityColor(selectedComment.priority)}>
                        {selectedComment.priority}
                      </Badge>
                      <Badge className={getStatusColor(selectedComment.status)}>
                        {selectedComment.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Update Status
                    </label>
                    <Select 
                      value={selectedComment.status} 
                      onValueChange={(value: PageComment['status']) => 
                        setSelectedComment({...selectedComment, status: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Developer Notes
                    </label>
                    <Textarea
                      value={developerNotes}
                      onChange={(e) => setDeveloperNotes(e.target.value)}
                      placeholder="Add notes about your progress or resolution..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleStatusUpdate(selectedComment.id, selectedComment.status)}
                      className="flex-1"
                    >
                      Update Comment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedComment(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default FeedbackDashboard; 