import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  QrCode, 
  Mail, 
  Share2, 
  Globe, 
  MessageSquare, 
  Maximize, 
  Eye,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Monitor,
  FileText,
  Printer,
  Facebook,
  Linkedin,
  Twitter,
  Link2,
  Loader2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

export function ShareQuizPage() {
  const { quizType, customQuizId } = useParams<{ quizType?: string; customQuizId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('full-page');
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [webSource, setWebSource] = useState('website');
  const [error, setError] = useState<string | null>(null);
  const [contactLists, setContactLists] = useState<any[]>([
    { id: '1', name: 'All Patients', count: 245 },
    { id: '2', name: 'New Patients', count: 78 },
    { id: '3', name: 'Follow-up Patients', count: 124 }
  ]);
  const [selectedList, setSelectedList] = useState('');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false);
  const [ctaText, setCtaText] = useState('For more info about non-invasive in office procedure to give you relief, Schedule a 5min screening phone call.');
  const baseUrl = window.location.origin;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user) {
          // Get all doctor profiles for this user
          const { data: profiles, error: profileError } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('user_id', user.id);
          
          if (profileError) {
            console.error('Error fetching doctor profile:', profileError);
            setError('Could not fetch doctor profile');
          } else if (profiles && profiles.length > 0) {
            // Use the first profile if multiple exist
            setDoctorProfile(profiles[0]);
          } else {
            // Create a new profile if none exists
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
            } else if (newProfile && newProfile.length > 0) {
              setDoctorProfile(newProfile[0]);
            }
          }
        }

        if (customQuizId) {
          const { data, error } = await supabase
            .from('custom_quizzes')
            .select('*')
            .eq('id', customQuizId)
            .single();
          
          if (error) throw error;
          if (data) {
            setCustomQuiz(data);
            if (data.cta_text) {
              setCtaText(data.cta_text);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customQuizId, user]);

  const getQuizUrl = (source?: string) => {
    const baseQuizUrl = customQuizId 
      ? `${baseUrl}/custom-quiz/${customQuizId}`
      : `${baseUrl}/quiz/${quizType?.toLowerCase()}`;
    
    const trackingParams = new URLSearchParams();
    
    // Add doctor ID if available
    if (doctorProfile?.id) {
      trackingParams.set('doctor', doctorProfile.id);
    }

    // Add source tracking
    const sourceParam = source || webSource;
    trackingParams.set('source', sourceParam);
    trackingParams.set('utm_source', sourceParam);
    trackingParams.set('utm_medium', getSourceMedium(sourceParam));
    trackingParams.set('utm_campaign', 'quiz_share');

    return `${baseQuizUrl}?${trackingParams.toString()}`;
  };

  const getSourceMedium = (source: string) => {
    switch (source) {
      case 'facebook':
      case 'linkedin':
      case 'twitter':
        return 'social';
      case 'email':
        return 'email';
      case 'text':
        return 'sms';
      case 'website':
        return 'web';
      default:
        return 'referral';
    }
  };

  const generateShortUrl = async () => {
    setIsGeneratingShortUrl(true);
    try {
      const longUrl = getQuizUrl();
      
      // Call the ulvis.net API to shorten the URL
      const response = await fetch(`https://ulvis.net/api.php?url=${encodeURIComponent(longUrl)}`);
      const data = await response.json();
      
      if (data && data.success && data.data && data.data.url) {
        setShortUrl(data.data.url);
        toast.success('Short URL generated successfully!');
      } else {
        throw new Error('Failed to generate short URL');
      }
    } catch (error) {
      console.error('Error generating short URL:', error);
      toast.error('Failed to generate short URL. Please try again.');
    } finally {
      setIsGeneratingShortUrl(false);
    }
  };

  const handleSocialShare = (platform: string) => {
    if (!shareUrl) return;

    // Add source parameter to the URL for tracking
    const urlWithSource = new URL(shareUrl);
    urlWithSource.searchParams.set('source', platform);
    const finalUrl = urlWithSource.toString();

    let socialUrl = '';
    const message = encodeURIComponent(`Take this ${quizType} assessment to evaluate your health.`);

    switch (platform) {
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`;
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(finalUrl)}`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(finalUrl)}`;
        break;
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${message}%20${encodeURIComponent(finalUrl)}`;
        break;
      case 'telegram':
        socialUrl = `https://t.me/share/url?url=${encodeURIComponent(finalUrl)}&text=${message}`;
        break;
      default:
        return;
    }

    window.open(socialUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast.error('Failed to copy link to clipboard.');
      });
  };

  const generateQrCode = () => {
    setShowQrCode(true);
  };

  const shareUrl = getQuizUrl();

  const handleShareWithContactList = () => {
    if (!selectedList) {
      toast.error('Please select a contact list');
      return;
    }

    // Simulate sharing with contact list
    toast.success(`Assessment shared with "${contactLists.find(list => list.id === selectedList)?.name}" contact list`);
  };

  const handleCopyShortUrl = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      toast.success('Short URL copied to clipboard!');
    } else {
      toast.error('No short URL available. Please generate one first.');
    }
  };

  const handleUpdateCta = () => {
    if (!customQuizId) {
      toast.error('CTA can only be updated for custom quizzes');
      return;
    }

    // Update the CTA text in the database
    supabase
      .from('custom_quizzes')
      .update({ cta_text: ctaText })
      .eq('id', customQuizId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating CTA:', error);
          toast.error('Failed to update CTA text');
        } else {
          toast.success('CTA text updated successfully');
        }
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <Button onClick={() => navigate('/portal')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const quizExists = customQuizId ? customQuiz : Object.values(quizzes).find(
    quiz => quiz.id.toLowerCase() === quizType?.toLowerCase()
  );
  
  if (!quizExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h2>
            <p className="text-gray-600 mb-6">The requested assessment could not be found.</p>
          <Button onClick={() => navigate('/portal')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          </div>
        </div>
      </div>
    );
  }

  const quizInfo = customQuiz ? {
    title: customQuiz.title,
    description: customQuiz.description,
    shareMessage: customQuiz.share_message || `Take this ${customQuiz.title} assessment to evaluate your symptoms.`,
    linkedinMessage: customQuiz.linkedin_message || `Share this ${customQuiz.title} assessment with your patients to evaluate their symptoms.`
  } : {
    title: quizType || 'Assessment',
    description: quizExists.description || "Medical assessment tool",
    shareMessage: `Take this ${quizType || 'assessment'} to evaluate your symptoms.`,
    linkedinMessage: `Share this ${quizType || 'assessment'} with your patients to evaluate their symptoms.`
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/portal')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Share Assessment</h1>
                <p className="text-gray-600">{quizInfo.title}</p>
                {doctorProfile && (
                  <p className="text-sm text-gray-500">
                    Doctor ID: {doctorProfile.id} | {doctorProfile.first_name} {doctorProfile.last_name}
                  </p>
                )}
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-[#f7904f] to-[#04748f] text-white px-4 py-2">
              {customQuiz ? 'Custom Quiz' : 'Standard Quiz'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="full-page" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="full-page" className="flex items-center gap-2">
              <Maximize className="w-4 h-4" />
              Full Page
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="contact-lists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contact Lists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="full-page" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share Assessment with Source Tracking</CardTitle>
                <CardDescription>
                  Share this link to track where your leads come from
                  {doctorProfile && (
                    <span className="block text-sm text-green-600 mt-1">
                      ✓ Doctor ID ({doctorProfile.id}) is included in all URLs
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Web Source (for direct links)
                    </label>
                    <select 
                      value={webSource} 
                      onChange={(e) => setWebSource(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="website">Website</option>
                      <option value="blog">Blog</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="print">Print Materials</option>
                      <option value="direct">Direct Link</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl} 
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard()}
                      className="min-w-[100px]"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(shareUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>

                  {/* Short URL Generator */}
                  <div className="flex gap-2">
                    <Input
                      value={shortUrl || "Generate a short URL for easier sharing"}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    {shortUrl ? (
                      <Button
                        onClick={handleCopyShortUrl}
                        className="min-w-[100px]"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    ) : (
                      <Button
                        onClick={generateShortUrl}
                        disabled={isGeneratingShortUrl}
                        className="min-w-[140px]"
                      >
                        {isGeneratingShortUrl ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 mr-2" />
                            Generate Short URL
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Social Media Sharing</CardTitle>
                      <CardDescription>Each platform gets tracked separately</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleSocialShare('facebook')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Facebook className="w-4 h-4 mr-2" />
                          Facebook
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('linkedin')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('twitter')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('email')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      {showQrCode ? (
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <QRCodeSVG value={shareUrl} size={200} />
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={generateQrCode}
                          className="w-full"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR Code
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleSocialShare('text')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Text/SMS
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(shareUrl, '_blank')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Monitor className="w-4 h-4 mr-2" />
                          Open
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => window.print()}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print Page
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleCopyShortUrl()}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Customize CTA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input 
                          placeholder="For more info about non-invasive in office procedure..."
                          value={ctaText}
                          onChange={(e) => setCtaText(e.target.value)}
                        />
                        <Button 
                          className="w-full"
                          onClick={handleUpdateCta}
                          disabled={!customQuizId}
                        >
                          Update Call-to-Action
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>
                  Add this assessment directly to your website
                  {doctorProfile && (
                    <span className="block text-sm text-green-600 mt-1">
                      ✓ Doctor ID ({doctorProfile.id}) is included in the embed URL
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input 
                    value={embedCode} 
                    readOnly 
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={() => handleCopy(embedCode, 'Embed code copied to clipboard!')}
                    className="min-w-[100px]"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-white border rounded-lg flex items-center justify-center">
                        <iframe 
                          src={quizUrl}
                          className="w-full h-full rounded-lg"
                          title={`${quizInfo.title} Preview`}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Implementation Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">1. Copy the embed code</h4>
                        <p className="text-sm text-gray-600">Click the copy button above to copy the embed code to your clipboard.</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">2. Paste into your website</h4>
                        <p className="text-sm text-gray-600">Paste the code into your website's HTML where you want the assessment to appear.</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">3. Source tracking included</h4>
                        <p className="text-sm text-gray-600">All leads will be tracked with "website" as the source automatically.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact-lists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share with Contact Lists</CardTitle>
                <CardDescription>
                  Send this assessment to your existing patient lists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Contact List
                    </label>
                    <select 
                      value={selectedList} 
                      onChange={(e) => setSelectedList(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">-- Select a list --</option>
                      {contactLists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.name} ({list.count} contacts)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Communication Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        SMS
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Template
                    </label>
                    <textarea 
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                      defaultValue={`Hello,\n\nI'd like to invite you to take our ${quizInfo.title}. This assessment will help us better understand your symptoms.\n\n${shareUrl}\n\nThank you,\nDr. ${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`}
                    ></textarea>
                  </div>
                  
                  <Button 
                    onClick={handleShareWithContactList}
                    className="w-full"
                    disabled={!selectedList}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Selected List
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Contact List Management</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    You can manage your contact lists in the Integrations section. Import contacts from your existing patient database or create new lists.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-700 border-blue-200 hover:bg-blue-100"
                    onClick={() => navigate('/portal?tab=integrations')}
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Manage Contact Lists
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}