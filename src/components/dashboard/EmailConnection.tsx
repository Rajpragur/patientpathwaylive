import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Settings,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EmailConnection {
  id: string;
  email_provider: string;
  email_address: string;
  display_name?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

export function EmailConnection() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSMTPForm, setShowSMTPForm] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    username: '',
    password: '',
    secure: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    console.log('EmailConnection: User state changed:', { user, loading });
    if (user) {
      fetchDoctorProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    if (!user) {
      console.log('No user found, skipping doctor profile fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching doctor profile for user:', user.id);
      
      // Check current session
      const { data: session } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      const { data: profiles, error } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      console.log('Doctor profile response:', { data: profiles, error });
        
      if (error) {
        console.error('Error fetching doctor profile:', error);
        toast.error(`Failed to load doctor profile: ${error.message}`);
        return;
      }

      if (profiles && profiles.length > 0) {
        // Use the most recent doctor profile
        const profile = profiles[0];
        setDoctorId(profile.id);
        fetchEmailConnections(profile.id);
      } else {
        // Try to create a doctor profile if none exists
        console.log('No doctor profile found, attempting to create one...');
        const { data: newProfile, error: createError } = await supabase
          .from('doctor_profiles')
          .insert([{
            user_id: user.id,
            first_name: 'Doctor',
            last_name: 'User',
            email: user.email,
            doctor_id: Math.floor(100000 + Math.random() * 900000).toString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating doctor profile:', createError);
          toast.error('Failed to create doctor profile. Please complete your profile setup first.');
        } else if (newProfile) {
          console.log('Created new doctor profile:', newProfile);
          setDoctorId(newProfile.id);
          fetchEmailConnections(newProfile.id);
        }
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailConnections = async (doctorId: string) => {
    try {
      setLoading(true);
      console.log('Fetching email connections for doctor:', doctorId);
      
      const { data, error } = await supabase
        .from('email_connections')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      console.log('Email connections response:', { data, error });

      if (error) {
        if (error.message.includes('relation "email_connections" does not exist')) {
          console.log('Email connections table does not exist yet. This is expected for new installations.');
          toast.info('Email connections table not found. Please run database migrations first.');
          setConnections([]);
        } else {
          throw error;
        }
      } else {
        setConnections(data || []);
      }
    } catch (error) {
      console.error('Error fetching email connections:', error);
      toast.error('Failed to load email connections');
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = async () => {
    if (!doctorId) return;
    
    try {
      // In a real implementation, this would redirect to Gmail OAuth
      // For now, we'll simulate the OAuth flow
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        toast.error('Google OAuth credentials not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file');
        return;
      }
      
      const redirectUri = `${window.location.origin}/auth/gmail/callback`;
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/gmail.send',
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
        state: 'gmail_auth'
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
      console.log('Redirecting to Gmail OAuth:', authUrl);
      
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      toast.error('Failed to connect Gmail');
    }
  };

  const connectOutlook = async () => {
    if (!doctorId) return;
    
    try {
      const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
      
      if (!clientId) {
        toast.error('Microsoft OAuth credentials not configured. Please add VITE_MICROSOFT_CLIENT_ID to your .env file');
        return;
      }
      
      // Use redirect approach for Outlook OAuth too
      const redirectUri = `${window.location.origin}/auth/outlook/callback`;
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=https://graph.microsoft.com/Mail.Send&response_type=code&state=outlook_auth`;
      
      console.log('Redirecting to Outlook OAuth:', authUrl);
      
      // Redirect in same window
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Outlook:', error);
      toast.error('Failed to connect Outlook');
    }
  };

  const connectSMTP = async () => {
    if (!doctorId) return;
    
    try {
      const { error } = await supabase
        .from('email_connections')
        .insert({
          doctor_id: doctorId,
          email_provider: 'smtp',
          email_address: smtpConfig.username,
          display_name: smtpConfig.username,
          smtp_config: smtpConfig,
          is_active: true
        });

      if (error) throw error;

      toast.success('SMTP connection added successfully');
      setShowSMTPForm(false);
      setSmtpConfig({
        host: '',
        port: 587,
        username: '',
        password: '',
        secure: false
      });
      fetchEmailConnections(doctorId);
    } catch (error) {
      console.error('Error adding SMTP connection:', error);
      toast.error('Failed to add SMTP connection');
    }
  };

  const disconnectEmail = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('email_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Email connection disconnected');
      fetchEmailConnections(doctorId!);
    } catch (error) {
      console.error('Error disconnecting email:', error);
      toast.error('Failed to disconnect email');
    }
  };

  const refreshToken = async (connectionId: string) => {
    try {
      // In a real implementation, this would refresh the OAuth token
      toast.info('Token refresh would be implemented here');
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error('Failed to refresh token');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return '📧';
      case 'outlook':
        return '📮';
      case 'smtp':
        return '⚙️';
      default:
        return '📧';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return 'Gmail';
      case 'outlook':
        return 'Outlook';
      case 'smtp':
        return 'SMTP';
      default:
        return provider;
    }
  };

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading email connections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Connections</h2>
          <p className="text-gray-600 mt-1">Connect your email accounts to send quiz invitations directly from the portal</p>
        </div>
        <Button
          onClick={() => setShowSMTPForm(!showSMTPForm)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Add SMTP
        </Button>
      </div>

      {/* SMTP Configuration Form */}
      {showSMTPForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add SMTP Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                  placeholder="587"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-username">Username/Email</Label>
                <Input
                  id="smtp-username"
                  value={smtpConfig.username}
                  onChange={(e) => setSmtpConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">Password</Label>
                <div className="relative">
                  <Input
                    id="smtp-password"
                    type={showPassword ? "text" : "password"}
                    value={smtpConfig.password}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Your email password or app password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="smtp-secure"
                checked={smtpConfig.secure}
                onChange={(e) => setSmtpConfig(prev => ({ ...prev, secure: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={connectSMTP} disabled={!smtpConfig.host || !smtpConfig.username}>
                Add Connection
              </Button>
              <Button variant="outline" onClick={() => setShowSMTPForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OAuth Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📧</div>
                <div>
                  <h3 className="font-semibold">Gmail</h3>
                  <p className="text-sm text-gray-600">Connect with Google OAuth</p>
                </div>
              </div>
              <Button onClick={connectGmail} variant="outline" size="sm">
                Connect
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Secure OAuth connection. No passwords stored.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📮</div>
                <div>
                  <h3 className="font-semibold">Outlook</h3>
                  <p className="text-sm text-gray-600">Connect with Microsoft OAuth</p>
                </div>
              </div>
              <Button onClick={connectOutlook} variant="outline" size="sm">
                Connect
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Secure OAuth connection. No passwords stored.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Connections */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getProviderIcon(connection.email_provider)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{connection.email_address}</span>
                        <Badge variant={connection.is_active ? "default" : "secondary"}>
                          {connection.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {isTokenExpired(connection.expires_at) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {getProviderName(connection.email_provider)} • 
                        Connected {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.email_provider !== 'smtp' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshToken(connection.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectEmail(connection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {connections.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No email connections found. Connect an email account to start sending quiz invitations directly from the portal.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
