import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Eye,
  MousePointer,
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EmailStats {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

interface CampaignStats {
  id: string;
  campaign_name: string;
  total_count: number;
  sent_count: number;
  status: string;
  created_at: string;
  sent_at?: string;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
}

export function EmailAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [recentEmails, setRecentEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      fetchAnalytics();
    }
  }, [doctorId, timeRange]);

  const fetchDoctorProfile = async () => {
    try {
      const { data: profiles } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (profiles && profiles.length > 0) {
        setDoctorId(profiles[0].id);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const now = new Date();
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

      // Fetch email logs
      const { data: logs, error: logsError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('sent_at', startDate.toISOString())
        .order('sent_at', { ascending: false });

      if (logsError) throw logsError;

      // Calculate stats
      const totalSent = logs?.length || 0;
      const totalDelivered = logs?.filter(log => ['delivered', 'opened', 'clicked'].includes(log.status)).length || 0;
      const totalOpened = logs?.filter(log => ['opened', 'clicked'].includes(log.status)).length || 0;
      const totalClicked = logs?.filter(log => log.status === 'clicked').length || 0;
      const totalBounced = logs?.filter(log => log.status === 'bounced').length || 0;
      const totalFailed = logs?.filter(log => log.status === 'failed').length || 0;

      const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
      const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

      setStats({
        total_sent: totalSent,
        total_delivered: totalDelivered,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        total_bounced: totalBounced,
        total_failed: totalFailed,
        open_rate: Math.round(openRate * 100) / 100,
        click_rate: Math.round(clickRate * 100) / 100,
        bounce_rate: Math.round(bounceRate * 100) / 100
      });

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('doctor_id', doctorId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      // Set recent emails
      setRecentEmails(logs?.slice(0, 10) || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'opened':
        return <Eye className="w-4 h-4 text-purple-500" />;
      case 'clicked':
        return <MousePointer className="w-4 h-4 text-orange-500" />;
      case 'bounced':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'opened':
        return 'bg-purple-100 text-purple-800';
      case 'clicked':
        return 'bg-orange-100 text-orange-800';
      case 'bounced':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    // In a real implementation, this would export the data to CSV
    console.log('Export functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <BarChart3 className="w-6 h-6 animate-pulse" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Analytics</h2>
          <p className="text-gray-600 mt-1">Track your email performance and engagement metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_sent}</p>
                </div>
                <Send className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_delivered}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.open_rate}%</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Click Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.click_rate}%</p>
                </div>
                <MousePointer className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{campaign.campaign_name}</h4>
                      <p className="text-sm text-gray-600">
                        {campaign.sent_count} / {campaign.total_count} sent
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No campaigns found</p>
                <p className="text-sm">Start by sending your first email</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Email Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Email Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmails.length > 0 ? (
              <div className="space-y-3">
                {recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(email.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {email.recipient_email}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{email.subject}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(email.sent_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(email.status)}>
                      {email.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No email activity found</p>
                <p className="text-sm">Send your first email to see activity here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {stats && stats.total_sent > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.open_rate}%
                </div>
                <div className="text-sm text-gray-600">Open Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.total_opened} of {stats.total_delivered} delivered emails
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.click_rate}%
                </div>
                <div className="text-sm text-gray-600">Click Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.total_clicked} of {stats.total_delivered} delivered emails
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {stats.bounce_rate}%
                </div>
                <div className="text-sm text-gray-600">Bounce Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.total_bounced} of {stats.total_sent} sent emails
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats && stats.total_sent === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No email data found for the selected time range. Start sending emails to see analytics here.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
