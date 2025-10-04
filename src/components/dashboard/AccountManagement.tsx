import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Facebook, 
  Instagram, 
  MessageSquare,
  Users,
  Share2,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Link,
  Unlink,
  Shield,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  page_id?: string;
  connected: boolean;
  permissions: any;
  expires_at?: string;
  last_sync_at?: string;
  created_at: string;
}

interface AccountManagementProps {
  connectedAccounts: SocialAccount[];
  onAccountsUpdated: () => void;
}

const platforms = {
  facebook: { 
    name: 'Facebook', 
    icon: Facebook, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    description: 'Connect your Facebook Page to post content and manage your social presence',
    requiredPermissions: ['pages_manage_posts', 'pages_read_engagement'],
    setupUrl: 'https://developers.facebook.com/apps/'
  },
  instagram: { 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50',
    description: 'Connect your Instagram Business account to share visual content',
    requiredPermissions: ['instagram_basic', 'instagram_content_publish'],
    setupUrl: 'https://developers.facebook.com/apps/'
  },
  twitter: { 
    name: 'Twitter/X', 
    icon: MessageSquare, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-50',
    description: 'Connect your Twitter account for real-time updates and engagement',
    requiredPermissions: ['tweet.read', 'tweet.write'],
    setupUrl: 'https://developer.twitter.com/en/portal/dashboard'
  },
  linkedin: { 
    name: 'LinkedIn', 
    icon: Users, 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-50',
    description: 'Connect your LinkedIn Page for professional networking and content sharing',
    requiredPermissions: ['w_member_social'],
    setupUrl: 'https://www.linkedin.com/developers/'
  },
  youtube: { 
    name: 'YouTube', 
    icon: Share2, 
    color: 'text-red-600', 
    bgColor: 'bg-red-50',
    description: 'Connect your YouTube channel for video content sharing',
    requiredPermissions: ['youtube.upload'],
    setupUrl: 'https://console.developers.google.com/'
  }
};

export function AccountManagement({ connectedAccounts, onAccountsUpdated }: AccountManagementProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  useEffect(() => {
    setAccounts(connectedAccounts);
  }, [connectedAccounts]);

  const fetchAccounts = async () => {
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

      const { data: accountsData, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('doctor_id', doctorProfile.id)
        .order('platform');

      if (error) throw error;
      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load social accounts');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformInfo = (platform: string) => {
    return platforms[platform as keyof typeof platforms] || {
      name: platform,
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'Connect your social media account',
      requiredPermissions: [],
      setupUrl: '#'
    };
  };

  const getAccountStatus = (account: SocialAccount) => {
    if (!account.connected) return { status: 'disconnected', color: 'text-gray-500' };
    
    if (account.expires_at && new Date(account.expires_at) < new Date()) {
      return { status: 'expired', color: 'text-red-500' };
    }
    
    if (account.expires_at && new Date(account.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return { status: 'expiring_soon', color: 'text-yellow-500' };
    }
    
    return { status: 'active', color: 'text-green-500' };
  };

  const initiateOAuth = async (platform: string) => {
    try {
      setConnecting(platform);
      
      // Get doctor profile first
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!doctorProfile) {
        toast.error('Doctor profile not found');
        return;
      }

      // Call the OAuth initiation function
      const { data, error } = await supabase.functions.invoke('initiate-oauth', {
        body: {
          platform,
          doctorId: doctorProfile.id,
          redirectUrl: `${window.location.origin}/portal?tab=accounts&oauth=callback`
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authentication URL received');
      }
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      toast.error(`Failed to connect ${platform}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  };

  const disconnectAccount = async (accountId: string, platform: string) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account? This will remove all posting capabilities.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ 
          connected: false,
          access_token: null,
          refresh_token: null,
          expires_at: null
        })
        .eq('id', accountId);

      if (error) throw error;

      toast.success(`${platform} account disconnected successfully`);
      fetchAccounts();
      onAccountsUpdated();
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const refreshToken = async (accountId: string, platform: string) => {
    try {
      const { error } = await supabase.functions.invoke('refresh-token', {
        body: {
          accountId,
          platform
        }
      });

      if (error) throw error;

      toast.success(`${platform} token refreshed successfully`);
      fetchAccounts();
      onAccountsUpdated();
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error('Failed to refresh token');
    }
  };

  const toggleTokenVisibility = (accountId: string) => {
    setShowTokens(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Account Management</h2>
          <p className="text-gray-600">Connect and manage your social media accounts</p>
        </div>
        
        <Button onClick={fetchAccounts} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Connected Accounts ({accounts.filter(acc => acc.connected).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.filter(acc => acc.connected).length === 0 ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No connected accounts</h3>
              <p className="text-gray-600">Connect your social media accounts to start posting</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts
                .filter(acc => acc.connected)
                .map((account) => {
                  const platformInfo = getPlatformInfo(account.platform);
                  const PlatformIcon = platformInfo.icon;
                  const status = getAccountStatus(account);
                  
                  return (
                    <div key={account.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${platformInfo.bgColor}`}>
                            <PlatformIcon className={`w-6 h-6 ${platformInfo.color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{platformInfo.name}</h3>
                              <Badge variant="outline" className={status.color}>
                                {status.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>@{account.username}</span>
                              </div>
                              
                              {account.page_id && (
                                <div className="flex items-center gap-2">
                                  <Link className="w-4 h-4" />
                                  <span>Page ID: {account.page_id}</span>
                                </div>
                              )}
                              
                              {account.expires_at && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>Expires: {formatDate(account.expires_at)}</span>
                                </div>
                              )}
                              
                              {account.last_sync_at && (
                                <div className="flex items-center gap-2">
                                  <RefreshCw className="w-4 h-4" />
                                  <span>Last sync: {formatDate(account.last_sync_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {status.status === 'expired' && (
                            <Button
                              size="sm"
                              onClick={() => refreshToken(account.id, account.platform)}
                              className="flex items-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Refresh Token
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => disconnectAccount(account.id, account.platform)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700"
                          >
                            <Unlink className="w-4 h-4" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Available Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(platforms).map(([key, platform]) => {
              const PlatformIcon = platform.icon;
              const isConnected = accounts.some(acc => acc.platform === key && acc.connected);
              const isConnecting = connecting === key;
              
              return (
                <div
                  key={key}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isConnected 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                      <PlatformIcon className={`w-5 h-5 ${platform.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      {isConnected && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {platform.description}
                  </p>
                  
                  <div className="space-y-2">
                    {platform.requiredPermissions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Required Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {platform.requiredPermissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {!isConnected ? (
                        <Button
                          size="sm"
                          onClick={() => initiateOAuth(key)}
                          disabled={isConnecting}
                          className="flex-1"
                        >
                          {isConnecting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Link className="w-4 h-4 mr-2" />
                          )}
                          {isConnecting ? 'Connecting...' : 'Connect'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateOAuth(key)}
                          disabled={isConnecting}
                          className="flex-1"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reconnect
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(platform.setupUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Shield className="w-5 h-5" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>• Your access tokens are encrypted and stored securely</p>
            <p>• Tokens are automatically refreshed when possible</p>
            <p>• You can disconnect accounts at any time</p>
            <p>• We only request the minimum permissions needed for posting</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
