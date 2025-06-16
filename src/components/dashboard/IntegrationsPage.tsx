import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Globe, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Check, 
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('zapier');
  
  // Zapier state
  const [zapierWebhook, setZapierWebhook] = useState('');
  
  // Domain Authentication state
  const [domain, setDomain] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  
  // Google state
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [googleBusinessConnected, setGoogleBusinessConnected] = useState(false);
  
  // Social Media state
  const [connectedSocial, setConnectedSocial] = useState<Record<string, boolean>>({
    facebook: false,
    instagram: false,
    twitter: false,
    linkedin: false,
    youtube: false
  });
  
  const handleConnectZapier = () => {
    if (!zapierWebhook) {
      toast.error('Please enter a Zapier webhook URL');
      return;
    }
    
    toast.success('Zapier webhook connected successfully');
  };
  
  const handleVerifyDomain = () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }
    
    toast.success('Domain verification started. Please check your email for next steps.');
  };
  
  const handleConnectGoogle = () => {
    // Simulate Google OAuth flow
    setTimeout(() => {
      setGoogleConnected(true);
      toast.success('Google account connected successfully');
    }, 1000);
  };
  
  const handleConnectGoogleBusiness = () => {
    // Simulate Google Business Profile connection
    setTimeout(() => {
      setGoogleBusinessConnected(true);
      toast.success('Google Business Profile connected successfully');
    }, 1000);
  };
  
  const handleConnectSocial = (platform: string) => {
    // Simulate social media OAuth flow
    setTimeout(() => {
      setConnectedSocial(prev => ({
        ...prev,
        [platform]: true
      }));
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully`);
    }, 1000);
  };
  
  const handleDisconnectSocial = (platform: string) => {
    setConnectedSocial(prev => ({
      ...prev,
      [platform]: false
    }));
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-600">Connect your practice with other services and platforms</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="zapier" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Zapier
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Domain
          </TabsTrigger>
          <TabsTrigger value="email-sms" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email/SMS
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Facebook className="w-4 h-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Google
          </TabsTrigger>
        </TabsList>

        {/* Zapier Tab */}
        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Zapier Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-purple-800 mb-2">What is Zapier?</h3>
                <p className="text-purple-700 text-sm mb-3">
                  Zapier allows you to connect Patient Pathway with 3,000+ other apps without any code. 
                  Automatically send new leads to your CRM, email marketing tool, or other systems.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-purple-700 border-purple-200 hover:bg-purple-100"
                  onClick={() => window.open('https://zapier.com', '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Learn More
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zapier_webhook">Zapier Webhook URL</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="zapier_webhook"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={zapierWebhook}
                      onChange={(e) => setZapierWebhook(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleConnectZapier}>
                      Connect
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Find this URL in your Zapier account when setting up a Webhook trigger.
                  </p>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-800 mb-3">What can you do with Zapier?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-2 text-blue-600">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">Send leads to your CRM</h4>
                        <p className="text-xs text-gray-600">Automatically add new leads to Salesforce, HubSpot, etc.</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-2 text-green-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">Send SMS notifications</h4>
                        <p className="text-xs text-gray-600">Get notified via SMS when new leads come in.</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                      <div className="bg-purple-100 rounded-full p-2 text-purple-600">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">Track in Google Sheets</h4>
                        <p className="text-xs text-gray-600">Log all leads in a spreadsheet for easy tracking.</p>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                      <div className="bg-orange-100 rounded-full p-2 text-orange-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">Create calendar events</h4>
                        <p className="text-xs text-gray-600">Schedule follow-ups in Google Calendar or Outlook.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Authentication Tab */}
        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Domain Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">1. Custom URL</h3>
                  <div>
                    <Label htmlFor="domain">Your Domain</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        id="domain"
                        placeholder="yourdomain.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleVerifyDomain}>
                        Verify
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="custom_url">Custom URL Path</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-gray-500">https://</span>
                      <Input
                        id="custom_url"
                        placeholder="quiz"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-gray-500">.yourdomain.com</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      This will be the URL where your assessments are hosted.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">DNS Configuration</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      After verification, you'll need to add a CNAME record to your domain's DNS settings:
                    </p>
                    <div className="bg-white border border-blue-200 rounded p-2 font-mono text-xs">
                      <div>Type: <span className="text-blue-600">CNAME</span></div>
                      <div>Host: <span className="text-blue-600">{customUrl || 'quiz'}</span></div>
                      <div>Value: <span className="text-blue-600">patientpathway.com</span></div>
                      <div>TTL: <span className="text-blue-600">3600</span></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">2. Email Authentication</h3>
                  <div>
                    <Label htmlFor="email_domain">Email Domain</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        id="email_domain"
                        placeholder="yourdomain.com"
                        value={emailDomain}
                        onChange={(e) => setEmailDomain(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleVerifyDomain}>
                        Verify
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      This allows emails to be sent from your domain (e.g., assessments@yourdomain.com).
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Email DNS Records</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      After verification, you'll need to add these DNS records:
                    </p>
                    <div className="space-y-2">
                      <div className="bg-white border border-blue-200 rounded p-2 font-mono text-xs">
                        <div>Type: <span className="text-blue-600">TXT</span></div>
                        <div>Host: <span className="text-blue-600">patientpathway._domainkey</span></div>
                        <div>Value: <span className="text-blue-600">v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrLHiExVd55zd/IQ/J</span></div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded p-2 font-mono text-xs">
                        <div>Type: <span className="text-blue-600">TXT</span></div>
                        <div>Host: <span className="text-blue-600">@</span></div>
                        <div>Value: <span className="text-blue-600">v=spf1 include:_spf.patientpathway.com ~all</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email/SMS Tab */}
        <TabsContent value="email-sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Email & SMS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Email Configuration</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-800">Native Email</h4>
                      <p className="text-sm text-gray-600">Use our built-in email service</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-800">Mailchimp</h4>
                      <p className="text-sm text-gray-600">Connect your Mailchimp account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-800">SendGrid</h4>
                      <p className="text-sm text-gray-600">Connect your SendGrid account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">SMS Configuration</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-800">Twilio</h4>
                      <p className="text-sm text-gray-600">Connect your Twilio account</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <h4 className="font-medium text-gray-800">Native SMS</h4>
                      <p className="text-sm text-gray-600">Use our built-in SMS service</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">SMS Compliance</h4>
                    <p className="text-sm text-blue-700">
                      Remember that all SMS messages must comply with TCPA regulations. 
                      Always include opt-out instructions and only message patients who have given consent.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5 text-blue-600" />
                Social Media Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-6 h-6 text-[#1877F2]" />
                        <h3 className="font-medium text-gray-800">Facebook</h3>
                      </div>
                      {connectedSocial.facebook ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Share assessments directly to your Facebook page and track engagement.
                    </p>
                    {connectedSocial.facebook ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDisconnectSocial('facebook')}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90"
                        onClick={() => handleConnectSocial('facebook')}
                      >
                        Connect Facebook
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-pink-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-6 h-6 text-[#E4405F]" />
                        <h3 className="font-medium text-gray-800">Instagram</h3>
                      </div>
                      {connectedSocial.instagram ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Share assessments to Instagram and create engaging stories.
                    </p>
                    {connectedSocial.instagram ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDisconnectSocial('instagram')}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90"
                        onClick={() => handleConnectSocial('instagram')}
                      >
                        Connect Instagram
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                        <h3 className="font-medium text-gray-800">Twitter</h3>
                      </div>
                      {connectedSocial.twitter ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Share assessments and health tips directly to Twitter.
                    </p>
                    {connectedSocial.twitter ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDisconnectSocial('twitter')}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90"
                        onClick={() => handleConnectSocial('twitter')}
                      >
                        Connect Twitter
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                        <h3 className="font-medium text-gray-800">LinkedIn</h3>
                      </div>
                      {connectedSocial.linkedin ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Share professional content and assessments to LinkedIn.
                    </p>
                    {connectedSocial.linkedin ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDisconnectSocial('linkedin')}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90"
                        onClick={() => handleConnectSocial('linkedin')}
                      >
                        Connect LinkedIn
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-6 h-6 text-[#FF0000]" />
                        <h3 className="font-medium text-gray-800">YouTube</h3>
                      </div>
                      {connectedSocial.youtube ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Connect your YouTube channel to share educational videos.
                    </p>
                    {connectedSocial.youtube ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDisconnectSocial('youtube')}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-[#FF0000] hover:bg-[#FF0000]/90"
                        onClick={() => handleConnectSocial('youtube')}
                      >
                        Connect YouTube
                      </Button>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-teal-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TikTok className="w-6 h-6 text-black" />
                        <h3 className="font-medium text-gray-800">TikTok</h3>
                      </div>
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        <X className="w-3 h-3 mr-1" />
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      TikTok integration is coming soon. Share short educational videos.
                    </p>
                    <Button 
                      className="w-full"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Social Media Posting</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Once connected, you can share assessments directly to your social media accounts from the Share page.
                  You can also schedule posts and track engagement.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-700 border-blue-200 hover:bg-blue-100"
                  onClick={() => window.location.href = '/portal?tab=quizzes'}
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                  Go to Assessments
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Tab */}
        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Google Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <h3 className="font-medium text-gray-800">Google Analytics</h3>
                      </div>
                      {googleConnected ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    
                    {googleConnected ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="ga_id">Google Analytics ID</Label>
                          <Input
                            id="ga_id"
                            placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                            value={googleAnalyticsId}
                            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setGoogleConnected(false);
                            setGoogleAnalyticsId('');
                          }}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Track assessment views, completions, and conversions in Google Analytics.
                        </p>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={handleConnectGoogle}
                        >
                          Connect Google Analytics
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-red-600" />
                        <h3 className="font-medium text-gray-800">Google Business Profile</h3>
                      </div>
                      {googleBusinessConnected ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          <X className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    
                    {googleBusinessConnected ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Your Google Business Profile is connected. You can now manage reviews and update your business information.
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setGoogleBusinessConnected(false)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Connect your Google Business Profile to manage reviews and update your business information.
                        </p>
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700"
                          onClick={handleConnectGoogleBusiness}
                        >
                          Connect Business Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Benefits of Google Integration</h3>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Track assessment performance and user behavior</li>
                  <li>Measure conversion rates from different traffic sources</li>
                  <li>Manage and respond to Google reviews</li>
                  <li>Keep your business information up-to-date</li>
                  <li>Improve your local SEO and visibility</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function TikTok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.59-1.16-2.59-2.5 0-1.4 1.16-2.5 2.59-2.5.27 0 .53.04.77.13v-3.13c-.25-.02-.5-.04-.77-.04-3.09 0-5.59 2.57-5.59 5.67 0 3.1 2.5 5.67 5.59 5.67 3.09 0 5.59-2.57 5.59-5.67V9.14a8.54 8.54 0 0 0 4.59 1.35V7.4c-1.44.02-2.85-.43-4.08-1.28z" />
    </svg>
  )
}