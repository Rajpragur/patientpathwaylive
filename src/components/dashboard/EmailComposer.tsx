import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Send, 
  Users, 
  Link2, 
  Eye, 
  EyeOff,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2
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
}

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type: string;
}

interface EmailComposerProps {
  quizId?: string;
  quizTitle?: string;
  quizUrl?: string;
  onClose?: () => void;
}

export function EmailComposer({ quizId, quizTitle, quizUrl, onClose }: EmailComposerProps) {
  const { user } = useAuth();
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      fetchEmailConnections();
      fetchEmailTemplates();
    }
  }, [doctorId]);

  useEffect(() => {
    if (quizTitle && quizUrl) {
      setSubject(`Take the ${quizTitle} Assessment`);
      setMessage(`Hi there,\n\nI'd like to invite you to take our ${quizTitle} assessment. This will help us better understand your symptoms and provide you with personalized recommendations.\n\nClick here to take the assessment: ${quizUrl}\n\nBest regards,\nDr. [Your Name]`);
    }
  }, [quizTitle, quizUrl]);

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
      toast.error('Failed to load doctor profile');
    }
  };

  const fetchEmailConnections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_connections')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
      
      if (data && data.length > 0) {
        setSelectedConnection(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching email connections:', error);
      toast.error('Failed to load email connections');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, '']);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setMessage(template.text_content || template.html_content.replace(/<[^>]*>/g, ''));
    }
  };

  const sendEmail = async () => {
    if (!selectedConnection) {
      toast.error('Please select an email connection');
      return;
    }

    const validRecipients = recipients.filter(email => email.trim() && email.includes('@'));
    if (validRecipients.length === 0) {
      toast.error('Please add at least one valid email address');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in the subject and message');
      return;
    }

    try {
      setSending(true);

      // Create email campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          doctor_id: doctorId,
          campaign_name: `Quiz Invitation - ${quizTitle || 'Assessment'}`,
          quiz_id: quizId,
          recipient_list: validRecipients,
          status: 'sending',
          total_count: validRecipients.length
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Send emails via edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          connection_id: selectedConnection,
          recipients: validRecipients,
          subject,
          message,
          html_content: message.replace(/\n/g, '<br>'),
          quiz_url: quizUrl,
          quiz_title: quizTitle
        }
      });

      if (error) throw error;

      // Update campaign status
      await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sent', 
          sent_count: validRecipients.length,
          sent_at: new Date().toISOString()
        })
        .eq('id', campaign.id);

      // Log email sends
      const emailLogs = validRecipients.map(email => ({
        doctor_id: doctorId,
        campaign_id: campaign.id,
        recipient_email: email,
        subject,
        status: 'sent'
      }));

      await supabase
        .from('email_logs')
        .insert(emailLogs);

      toast.success(`Email sent to ${validRecipients.length} recipient(s)`);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const getConnectionName = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    return connection ? connection.email_address : 'Select connection';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading email composer...</span>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active email connections found. Please connect an email account first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Send Email Invitation</h2>
          <p className="text-gray-600 mt-1">Send quiz invitations directly from your connected email account</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Composer */}
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Connection */}
            <div className="space-y-2">
              <Label htmlFor="connection">From</Label>
              <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email connection" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{connection.email_address}</span>
                        <Badge variant="outline" className="ml-2">
                          {connection.email_provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email Template */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="template">Template (Optional)</Label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  setSelectedTemplate(value);
                  loadTemplate(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Recipients */}
            <div className="space-y-2">
              <Label>Recipients</Label>
              {recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={recipient}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    placeholder="patient@example.com"
                    className="flex-1"
                  />
                  {recipients.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRecipient(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addRecipient}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Recipient
              </Button>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message here..."
                rows={8}
              />
            </div>

            {/* Quiz Link */}
            {quizUrl && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Link2 className="w-4 h-4" />
                  <span>Quiz Link: {quizUrl}</span>
                </div>
              </div>
            )}

            <Button
              onClick={sendEmail}
              disabled={sending || !selectedConnection}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-2 text-sm">
                  <div><strong>From:</strong> {getConnectionName(selectedConnection)}</div>
                  <div><strong>To:</strong> {recipients.filter(r => r.trim()).join(', ')}</div>
                  <div><strong>Subject:</strong> {subject}</div>
                </div>
                <div className="mt-4 p-3 bg-white border rounded">
                  <div className="whitespace-pre-wrap">{message}</div>
                  {quizUrl && (
                    <div className="mt-3 p-2 bg-blue-100 rounded">
                      <a href={quizUrl} className="text-blue-600 underline">
                        {quizUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
