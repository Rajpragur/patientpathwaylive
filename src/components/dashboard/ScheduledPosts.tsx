import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Instagram, 
  MessageSquare,
  Users,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Play,
  Pause,
  Calendar,
  Filter,
  Search,
  Image,
  Hash
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  image_url?: string;
  hashtags: string[];
  scheduled_at: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';
  created_at: string;
  platforms?: Array<{
    platform: string;
    status: string;
    published_at?: string;
    error_message?: string;
  }>;
}

interface ScheduledPostsProps {
  onPostsUpdated: () => void;
}

const platforms = {
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  twitter: { name: 'Twitter/X', icon: MessageSquare, color: 'text-blue-400' },
  linkedin: { name: 'LinkedIn', icon: Users, color: 'text-blue-700' },
  youtube: { name: 'YouTube', icon: Share2, color: 'text-red-600' }
};

export function ScheduledPosts({ onPostsUpdated }: ScheduledPostsProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'draft' | 'published' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchScheduledPosts();
    }
  }, [user, filter]);

  const fetchScheduledPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get doctor profile first
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorProfile) return;

      let query = supabase
        .from('social_posts')
        .select(`
          *,
          platforms:social_post_platforms(platform, status, published_at, error_message)
        `)
        .eq('doctor_id', doctorProfile.id)
        .order('scheduled_at', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformInfo = platforms[platform as keyof typeof platforms];
    if (!platformInfo) return <MessageSquare className="w-4 h-4 text-gray-600" />;
    
    const PlatformIcon = platformInfo.icon;
    return <PlatformIcon className={`w-4 h-4 ${platformInfo.color}`} />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><Pause className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString()
    };
  };

  const publishNow = async (postId: string) => {
    try {
      // Update post to publish immediately
      const { error } = await supabase
        .from('social_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          scheduled_at: null
        })
        .eq('id', postId);

      if (error) throw error;

      // Call the publish function
      const { data, error: publishError } = await supabase.functions.invoke('publish-to-social', {
        body: {
          postId,
          platforms: ['facebook', 'instagram'] // Get from post platforms
        }
      });

      if (publishError) throw publishError;

      toast.success('Post published successfully!');
      fetchScheduledPosts();
      onPostsUpdated();
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Failed to publish post');
    }
  };

  const cancelPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post cancelled');
      fetchScheduledPosts();
      onPostsUpdated();
    } catch (error) {
      console.error('Error cancelling post:', error);
      toast.error('Failed to cancel post');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete platform-specific records first
      await supabase
        .from('social_post_platforms')
        .delete()
        .eq('post_id', postId);

      // Delete the main post
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post deleted successfully');
      fetchScheduledPosts();
      onPostsUpdated();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduled Posts
            </CardTitle>
            
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Posts</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Drafts</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Create your first post to get started' 
                  : `No ${filter} posts found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const dateTime = post.scheduled_at ? formatDateTime(post.scheduled_at) : null;
            
            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Post Content */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(post.platform)}
                          <span className="font-medium capitalize">{post.platform}</span>
                        </div>
                        {getStatusBadge(post.status)}
                        {dateTime && (
                          <div className="text-sm text-gray-600">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {dateTime.full}
                          </div>
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="space-y-2">
                        <p className="text-gray-900">
                          {post.content.length > 200 
                            ? `${post.content.substring(0, 200)}...` 
                            : post.content}
                        </p>
                        
                        {/* Image */}
                        {post.image_url && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Image className="w-4 h-4" />
                            <span>Image attached</span>
                          </div>
                        )}
                        
                        {/* Hashtags */}
                        {post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.slice(0, 5).map((tag, index) => (
                              <span key={index} className="text-blue-600 text-sm">#{tag}</span>
                            ))}
                            {post.hashtags.length > 5 && (
                              <span className="text-gray-500 text-sm">+{post.hashtags.length - 5} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Platform Status */}
                      {post.platforms && post.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.platforms.map((platform, index) => (
                            <div key={index} className="flex items-center gap-1">
                              {getPlatformIcon(platform.platform)}
                              <span className="text-xs text-gray-600">{platform.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                      {post.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => publishNow(post.id)}
                            className="flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Publish Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelPost(post.id)}
                            className="flex items-center gap-2"
                          >
                            <Pause className="w-4 h-4" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {post.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => publishNow(post.id)}
                          className="flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Publish
                        </Button>
                      )}
                      
                      {post.status === 'failed' && (
                        <Button
                          size="sm"
                          onClick={() => publishNow(post.id)}
                          className="flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePost(post.id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {posts.filter(p => p.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {posts.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {posts.filter(p => p.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
