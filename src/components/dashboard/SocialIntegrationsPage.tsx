import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  MessageSquare,
  Phone,
  Mail,
  Settings,
  Check,
  X,
  Globe,
  Zap
} from 'lucide-react';

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  access_token?: string;
}

interface TwilioConfig {
  account_sid: string;
  auth_token: string;
  phone_number: string;
}

interface EmailConfig {
  domain: string;
  verified: boolean;
  landing_page_url: string;
}

export function SocialIntegrationsPage() {
  const { user } = useAuth();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({
    account_sid: '',
    auth_token: '',
    phone_number: ''
  });
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    domain: '',
    verified: false,
    landing_page_url: ''
  });
  const [zapierWebhook, setZapierWebhook] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, [user]);

  const loadConfigurations = async () => {
    if (!user) return;
    
    try {
      // Load doctor profile with integrations
      const { data: profiles } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        setTwilioConfig({
          account_sid: profile.twilio_account_sid || '',
          auth_token: profile.twilio_auth_token || '',
          phone_number: profile.twilio_phone_number || ''
        });
      }

      // Load social accounts - using any type temporarily until types are regenerated
      try {
        const { data: accounts } = await (supabase as any)
          .from('social_accounts')
          .select('*')
          .eq('doctor_id', user.id);

        if (accounts) {
          setSocialAccounts(accounts);
        }
      } catch (error) {
        console.log('Social accounts table not ready yet');
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  };

  const updateTwilioConfig = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First check if profile exists
      const { data: profiles } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id);
      
      if (!profiles || profiles.length === 0) {
        // Create a new profile if none exists
        const { error: insertError } = await supabase
          .from('doctor_profiles')
          .insert({
            user_id: user.id,
            twilio_account_sid: twilioConfig.account_sid,
            twilio_auth_token: twilioConfig.auth_token,
            twilio_phone_number: twilioConfig.phone_number
          });
          
        if (insertError) throw insertError;
      } else {
        // Update existing profile
        const { error } = await supabase
          .from('doctor_profiles')
          .update({
            twilio_account_sid: twilioConfig.account_sid,
            twilio_auth_token: twilioConfig.auth_token,
            twilio_phone_number: twilioConfig.phone_number
          })
          .eq('user_id', user.id);

        if (error) throw error;
      }
      
      toast.success('Twilio configuration updated successfully');
    } catch (error: any) {
      toast.error('Failed to update Twilio configuration');
    } finally {
      setLoading(false);
    }
  };

  const connectSocialAccount = async (platform: string) => {
    // This would typically redirect to OAuth flow
    // For now, we'll simulate the connection
    const newAccount: SocialAccount = {
      id: `${platform}_${Date.now()}`,
      platform,
      username: `user@${platform}`,
      connected: true
    };

    try {
      const { error } = await (supabase as any)
        .from('social_accounts')
        .insert({
          doctor_id: user?.id,
          platform,
          username: newAccount.username,
          connected: true
        });

      if (error) throw error;

      setSocialAccounts(prev => [...prev, newAccount]);
      toast.success(`${platform} account connected successfully`);
    } catch (error) {
      toast.error(`Failed to connect ${platform} account`);
    }
  };

  const disconnectSocialAccount = async (accountId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      setSocialAccounts(prev => prev.filter(acc => acc.id !== accountId));
      toast.success('Account disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect account');
    }
  };

  const testTwilioConnection = async () => {
    if (!twilioConfig.account_sid || !twilioConfig.auth_token) {
      toast.error('Please configure Twilio credentials first');
      return;
    }

    setLoading(true);
    try {
      // Call edge function to test Twilio connection
      const { data, error } = await supabase.functions.invoke('test-twilio', {
        body: {
          account_sid: twilioConfig.account_sid,
          auth_token: twilioConfig.auth_token,
          phone_number: twilioConfig.phone_number
        }
      });

      if (error) throw error;
      
      toast.success('Twilio connection successful');
    } catch (error) {
      toast.error('Twilio connection failed');
    } finally {
      setLoading(false);
    }
  };

  const socialPlatforms = [
    { name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Integrations</h2>
          <p className="text-gray-600">Connect your social accounts and communication tools</p>
        </div>
      </div>

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="twilio">SMS/Calling</TabsTrigger>
          <TabsTrigger value="email">Email Domain</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Social Media Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const connected = socialAccounts.find(acc => acc.platform === platform.name);
                  
                  return (
                    <Card key={platform.name} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" style={{ color: platform.color }} />
                            <span className="font-medium">{platform.name}</span>
                          </div>
                          {connected ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="w-3 h-3 mr-1" />
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        
                        {connected ? (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">@{connected.username}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => disconnectSocialAccount(connected.id)}
                              className="w-full"
                            >
                              Disconnect
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => connectSocialAccount(platform.name)}
                            className="w-full"
                            style={{ backgroundColor: platform.color }}
                          >
                            Connect {platform.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twilio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Twilio SMS/Calling Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="account_sid">Account SID</Label>
                  <Input
                    id="account_sid"
                    placeholder="Enter your Twilio Account SID"
                    value={twilioConfig.account_sid}
                    onChange={(e) => setTwilioConfig(prev => ({ ...prev, account_sid: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="auth_token">Auth Token</Label>
                  <Input
                    id="auth_token"
                    type="password"
                    placeholder="Enter your Twilio Auth Token"
                    value={twilioConfig.auth_token}
                    onChange={(e) => setTwilioConfig(prev => ({ ...prev, auth_token: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone_number">Twilio Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="+1234567890"
                  value={twilioConfig.phone_number}
                  onChange={(e) => setTwilioConfig(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={updateTwilioConfig} disabled={loading}>
                  <Phone className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={testTwilioConnection} disabled={loading}>
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Domain Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="yourdomain.com"
                  value={emailConfig.domain}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="landing_url">Landing Page URL</Label>
                <Input
                  id="landing_url"
                  placeholder="https://yourdomain.com/landing"
                  value={emailConfig.landing_page_url}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, landing_page_url: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Domain Status:</span>
                <Badge variant={emailConfig.verified ? "default" : "secondary"}>
                  {emailConfig.verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>

              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Verify Domain
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automation & Zapier Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="zapier_webhook">Zapier Webhook URL</Label>
                <Input
                  id="zapier_webhook"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={zapierWebhook}
                  onChange={(e) => setZapierWebhook(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Create a new Zap in Zapier</li>
                  <li>Choose "Webhooks by Zapier" as trigger</li>
                  <li>Copy the webhook URL and paste it above</li>
                  <li>Configure your desired actions (email, CRM, etc.)</li>
                </ol>
              </div>

              <Button>
                <Zap className="w-4 h-4 mr-2" />
                Save Webhook URL
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}