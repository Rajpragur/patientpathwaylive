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
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Eye,
  Target,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  averageEngagement: number;
  topPerformingPost: any;
  platformBreakdown: Record<string, number>;
}

interface PostAnalyticsProps {
  analytics: AnalyticsData | null;
  onRefresh: () => void;
}

interface PostMetrics {
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
}

interface TimeSeriesData {
  date: string;
  posts: number;
  engagement: number;
  reach: number;
}

const platforms = {
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-600', bgColor: 'bg-pink-50' },
  twitter: { name: 'Twitter/X', icon: MessageSquare, color: 'text-blue-400', bgColor: 'bg-blue-50' },
  linkedin: { name: 'LinkedIn', icon: Users, color: 'text-blue-700', bgColor: 'bg-blue-50' },
  youtube: { name: 'YouTube', icon: Share2, color: 'text-red-600', bgColor: 'bg-red-50' }
};

export function PostAnalytics({ analytics, onRefresh }: PostAnalyticsProps) {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [platformMetrics, setPlatformMetrics] = useState<PostMetrics[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDetailedAnalytics();
    }
  }, [user, timeRange]);

  const fetchDetailedAnalytics = async () => {
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

      // Calculate date range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch published posts with engagement data
      const { data: posts, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('doctor_id', doctorProfile.id)
        .eq('status', 'published')
        .gte('published_at', startDate.toISOString())
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Calculate platform metrics
      const metrics: Record<string, PostMetrics> = {};
      posts?.forEach(post => {
        const stats = post.engagement_stats || {};
        const platform = post.platform;
        
        if (!metrics[platform]) {
          metrics[platform] = {
            platform,
            likes: 0,
            comments: 0,
            shares: 0,
            reach: 0,
            impressions: 0,
            engagement_rate: 0
          };
        }

        metrics[platform].likes += stats.likes || 0;
        metrics[platform].comments += stats.comments || 0;
        metrics[platform].shares += stats.shares || 0;
        metrics[platform].reach += stats.reach || 0;
        metrics[platform].impressions += stats.impressions || 0;
      });

      // Calculate engagement rates
      Object.values(metrics).forEach(metric => {
        const totalEngagement = metric.likes + metric.comments + metric.shares;
        metric.engagement_rate = metric.reach > 0 ? (totalEngagement / metric.reach) * 100 : 0;
      });

      setPlatformMetrics(Object.values(metrics));

      // Calculate time series data
      const timeSeries: Record<string, TimeSeriesData> = {};
      posts?.forEach(post => {
        const date = new Date(post.published_at).toISOString().split('T')[0];
        if (!timeSeries[date]) {
          timeSeries[date] = {
            date,
            posts: 0,
            engagement: 0,
            reach: 0
          };
        }
        
        timeSeries[date].posts += 1;
        const stats = post.engagement_stats || {};
        timeSeries[date].engagement += (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0);
        timeSeries[date].reach += stats.reach || 0;
      });

      setTimeSeriesData(Object.values(timeSeries).sort((a, b) => a.date.localeCompare(b.date)));

      // Get top performing posts
      const topPostsData = posts
        ?.map(post => {
          const stats = post.engagement_stats || {};
          return {
            ...post,
            totalEngagement: (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0)
          };
        })
        .sort((a, b) => b.totalEngagement - a.totalEngagement)
        .slice(0, 5) || [];

      setTopPosts(topPostsData);

    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      toast.error('Failed to load analytics data');
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const exportAnalytics = () => {
    const data = {
      timeRange,
      totalPosts: analytics?.totalPosts || 0,
      totalEngagement: analytics?.totalEngagement || 0,
      averageEngagement: analytics?.averageEngagement || 0,
      platformMetrics,
      timeSeriesData,
      topPosts,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social-media-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Post Analytics</h2>
          <p className="text-gray-600">Track your social media performance</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold">{analytics?.totalPosts || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Engagement</p>
                <p className="text-3xl font-bold">{formatNumber(analytics?.totalEngagement || 0)}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Engagement</p>
                <p className="text-3xl font-bold">{Math.round(analytics?.averageEngagement || 0)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platforms</p>
                <p className="text-3xl font-bold">{platformMetrics.length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {platformMetrics.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No data available for the selected time period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {platformMetrics.map((metric) => {
                const platformInfo = platforms[metric.platform as keyof typeof platforms];
                const PlatformIcon = platformInfo?.icon || MessageSquare;
                
                return (
                  <div key={metric.platform} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <PlatformIcon className={`w-6 h-6 ${platformInfo?.color || 'text-gray-600'}`} />
                        <h3 className="font-semibold">{platformInfo?.name || metric.platform}</h3>
                      </div>
                      <Badge variant="outline">
                        {metric.engagement_rate.toFixed(1)}% engagement rate
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{formatNumber(metric.likes)}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <Heart className="w-3 h-3" />
                          Likes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(metric.comments)}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Comments
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatNumber(metric.shares)}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <Share className="w-3 h-3" />
                          Shares
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatNumber(metric.reach)}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" />
                          Reach
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{formatNumber(metric.impressions)}</div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <Target className="w-3 h-3" />
                          Impressions
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {topPosts.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No published posts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">#{index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(post.platform)}
                        <span className="font-medium capitalize">{post.platform}</span>
                      </div>
                      {post.published_at && (
                        <span className="text-sm text-gray-600">
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {post.totalEngagement} engagement
                    </Badge>
                  </div>
                  
                  <p className="text-gray-900 mb-3">
                    {post.content.length > 150 
                      ? `${post.content.substring(0, 150)}...` 
                      : post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      {post.engagement_stats?.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      {post.engagement_stats?.comments || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share className="w-4 h-4 text-green-500" />
                      {post.engagement_stats?.shares || 0}
                    </span>
                    {post.engagement_stats?.reach && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-purple-500" />
                        {formatNumber(post.engagement_stats.reach)} reach
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Series Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would go here</p>
              <p className="text-sm text-gray-500">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
