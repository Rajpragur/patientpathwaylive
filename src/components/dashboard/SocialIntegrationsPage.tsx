import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  Settings,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  access_token?: string;
  refresh_token?: string;
}

const socialPlatforms = [
  { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  { name: 'YouTube', icon: Youtube, color: 'text-red-600' }
];

export function SocialIntegrationsPage() {
  const { user } = useAuth();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchSocialAccounts();
      fetchDoctorProfile();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setDoctorProfile(data);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const fetchSocialAccounts = async () => {
    if (!user || !doctorProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('doctor_id', doctorProfile.id);

      if (error) throw error;
      setSocialAccounts(data || []);
    } catch (error) {
      console.error('Error fetching social accounts:', error);
      toast.error('Failed to load social accounts');
    } finally {
      setLoading(false);
    }
  };

  const connectAccount = async (platform: string, username: string) => {
    if (!doctorProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .upsert([{
          doctor_id: doctorProfile.id,
          platform: platform.toLowerCase(),
          username,
          connected: true
        }])
        .select()
        .single();

      if (error) throw error;

      setSocialAccounts(prev => {
        const existing = prev.find(acc => acc.platform === platform.toLowerCase());
        if (existing) {
          return prev.map(acc => 
            acc.platform === platform.toLowerCase() 
              ? { ...acc, username, connected: true }
              : acc
          );
        } else {
          return [...prev, data];
        }
      });

      toast.success(`${platform} account connected successfully!`);
    } catch (error) {
      console.error('Error connecting account:', error);
      toast.error(`Failed to connect ${platform} account`);
    }
  };

  const disconnectAccount = async (platform: string) => {
    if (!doctorProfile?.id) return;

    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ connected: false })
        .eq('doctor_id', doctorProfile.id)
        .eq('platform', platform.toLowerCase());

      if (error) throw error;

      setSocialAccounts(prev => 
        prev.map(acc => 
          acc.platform === platform.toLowerCase() 
            ? { ...acc, connected: false }
            : acc
        )
      );

      toast.success(`${platform} account disconnected`);
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error(`Failed to disconnect ${platform} account`);
    }
  };

  const getAccountStatus = (platform: string) => {
    const account = socialAccounts.find(acc => acc.platform === platform.toLowerCase());
    return account?.connected || false;
  };

  const getAccountUsername = (platform: string) => {
    const account = socialAccounts.find(acc => acc.platform === platform.toLowerCase());
    return account?.username || '';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Social Media Integrations</h1>
      </div>

      <div className="grid gap-6">
        {socialPlatforms.map((platform) => {
          const PlatformIcon = platform.icon;
          const isConnected = getAccountStatus(platform.name);
          const username = getAccountUsername(platform.name);

          return (
            <Card key={platform.name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PlatformIcon className={`w-6 h-6 ${platform.color}`} />
                    <span>{platform.name}</span>
                    {isConnected ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={isConnected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const newUsername = prompt(`Enter your ${platform.name} username:`);
                        if (newUsername) {
                          connectAccount(platform.name, newUsername);
                        }
                      } else {
                        disconnectAccount(platform.name);
                      }
                    }}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <User className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder={`${platform.name} username`}
                      value={username}
                      onChange={(e) => {
                        // Update local state for immediate feedback
                        setSocialAccounts(prev => 
                          prev.map(acc => 
                            acc.platform === platform.name.toLowerCase()
                              ? { ...acc, username: e.target.value }
                              : acc
                          )
                        );
                      }}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value !== username) {
                          connectAccount(platform.name, e.target.value);
                        }
                      }}
                    />
                  </div>
                  
                  {isConnected && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        Your {platform.name} account is connected and ready for sharing quiz results and content.
                      </p>
                    </div>
                  )}
                  
                  {!isConnected && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Connect your {platform.name} account to automatically share quiz results and engage with patients.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Sharing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-share quiz completions</h4>
              <p className="text-sm text-gray-600">Automatically post when patients complete assessments</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share patient testimonials</h4>
              <p className="text-sm text-gray-600">Post positive feedback and success stories (with permission)</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Educational content sharing</h4>
              <p className="text-sm text-gray-600">Share health tips and educational content related to your specialty</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
