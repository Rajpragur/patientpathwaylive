import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Mail, CheckCircle, AlertCircle, Settings, TestTube } from 'lucide-react';
import { testResendConfiguration } from '@/lib/resendService';

interface DoctorProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  email_prefix: string | null;
  clinic_name: string | null;
}

export function EmailConfigurationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [emailPrefix, setEmailPrefix] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  useEffect(() => {
    loadDoctorProfile();
    testResendConnection();
  }, [user]);

  const loadDoctorProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('id, first_name, last_name, email, email_prefix, clinic_name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setDoctorProfile(data);
      setEmailPrefix(data?.email_prefix || '');
    } catch (error) {
      console.error('Error loading doctor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load doctor profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testResendConnection = async () => {
    try {
      const result = await testResendConfiguration();
      setResendStatus(result.success ? 'connected' : 'error');
    } catch (error) {
      setResendStatus('error');
    }
  };

  const generateEmailPrefix = () => {
    if (doctorProfile?.first_name && doctorProfile?.last_name) {
      const prefix = `${doctorProfile.first_name.toLowerCase()}.${doctorProfile.last_name.toLowerCase()}`;
      setEmailPrefix(prefix);
    }
  };

  const saveEmailConfiguration = async () => {
    if (!doctorProfile || !emailPrefix.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email prefix',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({ 
          email_prefix: emailPrefix.trim().toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', doctorProfile.id);

      if (error) throw error;

      setDoctorProfile(prev => prev ? { ...prev, email_prefix: emailPrefix.trim().toLowerCase() } : null);
      
      toast({
        title: 'Success',
        description: 'Email configuration saved successfully',
      });
    } catch (error) {
      console.error('Error saving email configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save email configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive',
      });
      return;
    }

    if (!emailPrefix.trim()) {
      toast({
        title: 'Error',
        description: 'Please configure your email prefix first',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-resend-email', {
        body: {
          to: testEmail,
          subject: 'Test Email from PatientPathway AI',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Test Email Configuration</h2>
              <p>Hello!</p>
              <p>This is a test email from <strong>Dr. ${doctorProfile?.first_name} ${doctorProfile?.last_name}</strong> via PatientPathway AI.</p>
              <p>Your email configuration is working correctly!</p>
              <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Your Email Address:</strong> dr.${emailPrefix}@patientpathway.ai</p>
                <p><strong>Clinic:</strong> ${doctorProfile?.clinic_name || 'Not specified'}</p>
              </div>
              <p>Best regards,<br>PatientPathway AI Team</p>
            </div>
          `,
          text: `Test Email from PatientPathway AI\n\nHello!\n\nThis is a test email from Dr. ${doctorProfile?.first_name} ${doctorProfile?.last_name} via PatientPathway AI.\n\nYour email configuration is working correctly!\n\nYour Email Address: dr.${emailPrefix}@patientpathway.ai\nClinic: ${doctorProfile?.clinic_name || 'Not specified'}\n\nBest regards,\nPatientPathway AI Team`,
          doctorId: doctorProfile?.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Success',
          description: `Test email sent to ${testEmail}`,
        });
        setTestEmail('');
      } else {
        throw new Error(data?.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading email configuration...</p>
        </div>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Doctor profile not found. Please complete your profile setup first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Configuration</h1>
        <p className="text-gray-600 mt-2">
          Configure your email settings for sending patient assessments and communications.
        </p>
      </div>

      {/* Resend Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Resend Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {resendStatus === 'connected' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
                <span className="text-sm text-gray-600">
                  Resend is properly configured and ready to send emails
                </span>
              </>
            )}
            {resendStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <Badge variant="destructive">
                  Error
                </Badge>
                <span className="text-sm text-gray-600">
                  Resend configuration issue. Please check your API key.
                </span>
              </>
            )}
            {resendStatus === 'unknown' && (
              <>
                <div className="h-4 w-4 rounded-full bg-gray-300 animate-pulse" />
                <Badge variant="secondary">
                  Checking...
                </Badge>
                <span className="text-sm text-gray-600">
                  Verifying Resend connection...
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email Prefix Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Doctor Email Configuration
          </CardTitle>
          <CardDescription>
            Set up your personalized email address for sending patient communications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email-prefix">Email Prefix</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="email-prefix"
                  value={emailPrefix}
                  onChange={(e) => setEmailPrefix(e.target.value)}
                  placeholder="john.smith"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateEmailPrefix}
                  disabled={!doctorProfile.first_name || !doctorProfile.last_name}
                >
                  Auto-generate
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This will create your email address: dr.{emailPrefix || 'yourname'}@patientpathway.ai
              </p>
            </div>
            
            <div>
              <Label>Your Email Address</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                <code className="text-sm">
                  dr.{emailPrefix || 'yourname'}@patientpathway.ai
                </code>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">How it works:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Patients will receive emails from your personalized address</li>
              <li>• Replies will be forwarded to your real email: {doctorProfile.email}</li>
              <li>• All emails are sent through our secure Resend integration</li>
              <li>• You can change this prefix anytime</li>
            </ul>
          </div>

          <Button 
            onClick={saveEmailConfiguration} 
            disabled={saving || !emailPrefix.trim()}
            className="w-full md:w-auto"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Email Configuration
          </CardTitle>
          <CardDescription>
            Send a test email to verify your configuration is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-email">Test Email Address</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1"
              />
              <Button
                onClick={sendTestEmail}
                disabled={testing || !testEmail.trim() || !emailPrefix.trim()}
                variant="outline"
              >
                {testing ? 'Sending...' : 'Send Test'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Summary */}
      {doctorProfile.email_prefix && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Doctor Name:</span>
                <p>{doctorProfile.first_name} {doctorProfile.last_name}</p>
              </div>
              <div>
                <span className="font-medium">Email Prefix:</span>
                <p>{doctorProfile.email_prefix}</p>
              </div>
              <div>
                <span className="font-medium">Sending Address:</span>
                <p>dr.{doctorProfile.email_prefix}@patientpathway.ai</p>
              </div>
              <div>
                <span className="font-medium">Reply Address:</span>
                <p>{doctorProfile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
