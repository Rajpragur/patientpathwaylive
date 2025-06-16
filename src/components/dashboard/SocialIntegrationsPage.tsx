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
  Zap,
  Loader2,
  Upload,
  FileUp,
  FileText
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

interface ContactList {
  id: string;
  name: string;
  count: number;
  type: 'email' | 'sms';
  last_updated: string;
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [uploadingList, setUploadingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [listType, setListType] = useState<'email' | 'sms'>('email');
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      loadConfigurations();
    }
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    try {
      // Get all doctor profiles for this user
      const { data: profiles, error } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching doctor profiles:', error);
        setError('Could not fetch doctor profile');
        setInitialLoading(false);
        return;
      }
      
      // Use the first profile if multiple exist
      if (profiles && profiles.length > 0) {
        console.log('Found doctor profile:', profiles[0].id);
        setDoctorId(profiles[0].id);
      } else {
        console.log('No doctor profile found, creating one...');
        
        // Create a doctor profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('doctor_profiles')
          .insert([{ 
            user_id: user.id,
            first_name: 'Doctor',
            last_name: 'User',
            email: user.email,
            doctor_id: Math.floor(100000 + Math.random() * 900000).toString()
          }])
          .select();

        if (createError) {
          console.error('Error creating doctor profile:', createError);
          setError('Failed to create doctor profile');
          setInitialLoading(false);
          return;
        }

        if (newProfile && newProfile.length > 0) {
          console.log('Created new doctor profile:', newProfile[0].id);
          setDoctorId(newProfile[0].id);
        } else {
          setError('Failed to create doctor profile');
          setInitialLoading(false);
        }
      }
    } catch (error) {
      console.error('Error in fetchDoctorProfile:', error);
      setError('An unexpected error occurred');
      setInitialLoading(false);
    }
  };

  const loadConfigurations = async () => {
    if (!user || !doctorId) return;
    
    try {
      setInitialLoading(true);
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

      // Load social accounts
      try {
        const { data: accounts } = await supabase
          .from('social_accounts')
          .select('*')
          .eq('doctor_id', user.id);

        if (accounts) {
          setSocialAccounts(accounts);
        }
      } catch (error) {
        console.log('Social accounts table not ready yet');
      }

      // Load email domains
      try {
        const { data: domains } = await supabase
          .from('email_domains')
          .select('*')
          .eq('doctor_id', user.id)
          .limit(1);

        if (domains && domains.length > 0) {
          setEmailConfig({
            domain: domains[0].domain || '',
            verified: domains[0].verified || false,
            landing_page_url: domains[0].landing_page_url || ''
          });
        }
      } catch (error) {
        console.log('Email domains table not ready yet');
      }

      // Load automation webhooks
      try {
        const { data: webhooks } = await supabase
          .from('automation_webhooks')
          .select('*')
          .eq('doctor_id', user.id)
          .limit(1);

        if (webhooks && webhooks.length > 0) {
          setZapierWebhook(webhooks[0].webhook_url || '');
        }
      } catch (error) {
        console.log('Automation webhooks table not ready yet');
      }

      // Load contact lists (mock data for now)
      setContactLists([
        {
          id: '1',
          name: 'Newsletter Subscribers',
          count: 245,
          type: 'email',
          last_updated: '2025-06-15'
        },
        {
          id: '2',
          name: 'SMS Appointment Reminders',
          count: 128,
          type: 'sms',
          last_updated: '2025-06-10'
        }
      ]);
    } catch (error) {
      console.error('Error loading configurations:', error);
      setError('Failed to load configurations');
    } finally {
      setInitialLoading(false);
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
          .eq('id', profiles[0].id);

        if (error) throw error;
      }
      
      toast.success('Twilio configuration updated successfully');
    } catch (error: any) {
      toast.error('Failed to update Twilio configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateEmailConfig = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if domain already exists
      const { data: existingDomains } = await supabase
        .from('email_domains')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('domain', emailConfig.domain);
      
      if (existingDomains && existingDomains.length > 0) {
        // Update existing domain
        const { error } = await supabase
          .from('email_domains')
          .update({
            landing_page_url: emailConfig.landing_page_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDomains[0].id);
          
        if (error) throw error;
      } else {
        // Create new domain
        const { error } = await supabase
          .from('email_domains')
          .insert({
            doctor_id: user.id,
            domain: emailConfig.domain,
            landing_page_url: emailConfig.landing_page_url,
            verification_token: `verify-${Math.random().toString(36).substring(2, 15)}`,
            verified: false
          });
          
        if (error) throw error;
      }
      
      toast.success('Email domain configuration updated');
      loadConfigurations();
    } catch (error) {
      console.error('Error updating email config:', error);
      toast.error('Failed to update email configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateZapierWebhook = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if webhook already exists
      const { data: existingWebhooks } = await supabase
        .from('automation_webhooks')
        .select('*')
        .eq('doctor_id', user.id);
      
      if (existingWebhooks && existingWebhooks.length > 0) {
        // Update existing webhook
        const { error } = await supabase
          .from('automation_webhooks')
          .update({
            webhook_url: zapierWebhook,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWebhooks[0].id);
          
        if (error) throw error;
      } else {
        // Create new webhook
        const { error } = await supabase
          .from('automation_webhooks')
          .insert({
            doctor_id: user.id,
            webhook_url: zapierWebhook,
            webhook_type: 'zapier'
          });
          
        if (error) throw error;
      }
      
      toast.success('Zapier webhook updated successfully');
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast.error('Failed to update Zapier webhook');
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
      const { error } = await supabase
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
      const { error } = await supabase
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileSelected(e.target.files[0]);
    }
  };

  const handleUploadContactList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileSelected || !newListName) {
      toast.error('Please select a file and enter a list name');
      return;
    }
    
    setUploadingList(true);
    
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to contact lists (mock implementation)
      const newList: ContactList = {
        id: Date.now().toString(),
        name: newListName,
        count: Math.floor(Math.random() * 100) + 50,
        type: listType,
        last_updated: new Date().toISOString().split('T')[0]
      };
      
      setContactLists(prev => [...prev, newList]);
      setNewListName('');
      setFileSelected(null);
      
      toast.success('Contact list uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload contact list');
    } finally {
      setUploadingList(false);
    }
  };

  const socialPlatforms = [
    { name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { name: 'YouTube', icon: Youtube, color: '#FF0000' }
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-600">Connect your accounts and communication tools</p>
        </div>
      </div>

      <Tabs defaultValue="social" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="twilio">SMS/Calling</TabsTrigger>
          <TabsTrigger value="email">Email Domain</TabsTrigger>
          <TabsTrigger value="contacts">Contact Lists</TabsTrigger>
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

              <Button onClick={updateEmailConfig} disabled={loading}>
                <Mail className="w-4 h-4 mr-2" />
                {emailConfig.domain ? 'Update Domain' : 'Add Domain'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Contact Lists
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Import Contact Lists</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Import your existing patient email and SMS lists to use for communications.
                </p>
                
                <form onSubmit={handleUploadContactList} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="list_name">List Name</Label>
                      <Input 
                        id="list_name" 
                        placeholder="e.g., Newsletter Subscribers"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="list_type">List Type</Label>
                      <select 
                        id="list_type"
                        className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                        value={listType}
                        onChange={(e) => setListType(e.target.value as 'email' | 'sms')}
                      >
                        <option value="email">Email List</option>
                        <option value="sms">SMS List</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="file_upload">Upload CSV or Excel File</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <Input
                        id="file_upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        disabled={uploadingList || !fileSelected || !newListName}
                      >
                        {uploadingList ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <FileUp className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      File should contain columns for name, email/phone, and optional tags
                    </p>
                  </div>
                </form>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-3">Your Contact Lists</h3>
                {contactLists.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No contact lists found</p>
                    <p className="text-sm text-gray-400">Upload your first list above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contactLists.map(list => (
                      <div key={list.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <div className="font-medium text-gray-800">{list.name}</div>
                          <div className="text-sm text-gray-500">
                            {list.count} contacts • Last updated: {list.last_updated}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={list.type === 'email' ? 'default' : 'secondary'}>
                            {list.type === 'email' ? 'Email' : 'SMS'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

              <Button onClick={updateZapierWebhook} disabled={loading}>
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