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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ShareQuizPage() {
  const { quizType, customQuizId } = useParams<{ quizType?: string; customQuizId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('full-page');
  const [copied, setCopied] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [webSource, setWebSource] = useState('website');
  const [error, setError] = useState<string | null>(null);
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
          if (data) setCustomQuiz(data);
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

  const quizUrl = getQuizUrl();
  const embedCode = `<iframe 
    src="${quizUrl}" 
    width="100%" 
    height="600px" 
    frameborder="0" 
    style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);"
    title="${customQuiz?.title || quizType} Assessment"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  ></iframe>`;

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(message);
    setTimeout(() => setCopied(false), 2000);
  };

  const getQuizInfo = () => {
    if (customQuiz) {
      return {
        title: customQuiz.title,
        description: customQuiz.description,
        shareMessage: customQuiz.share_message || `Take this ${customQuiz.title} assessment to evaluate your symptoms.`,
        linkedinMessage: customQuiz.linkedin_message || `Share this ${customQuiz.title} assessment with your patients to evaluate their symptoms.`
      };
    }

    const standardQuiz = Object.values(quizzes).find(
      quiz => quiz.id.toLowerCase() === quizType?.toLowerCase()
    );

    if (standardQuiz) {
      return {
        title: standardQuiz.title,
        description: standardQuiz.description,
        shareMessage: `Take this ${standardQuiz.title} assessment to evaluate your symptoms.`,
        linkedinMessage: `Share this ${standardQuiz.title} assessment with your patients to evaluate their symptoms.`
      };
    }

    return {
      title: quizType || 'Assessment',
      description: "Medical assessment tool",
      shareMessage: `Take this ${quizType || 'assessment'} to evaluate your symptoms.`,
      linkedinMessage: `Share this ${quizType || 'assessment'} with your patients to evaluate their symptoms.`
    };
  };

  const handleShare = (platform: string) => {
    const quizInfo = getQuizInfo();
    const shareUrl = encodeURIComponent(getQuizUrl(platform));
    const shareTitle = encodeURIComponent(quizInfo.title);
    const shareText = encodeURIComponent(quizInfo.shareMessage);
    const linkedinText = encodeURIComponent(quizInfo.linkedinMessage);
    
    let shareLink = '';
    let windowFeatures = 'width=600,height=400,resizable=yes,scrollbars=yes,status=yes';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}&title=${shareTitle}&summary=${linkedinText}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        break;
      case 'email':
        const emailSubject = `Take the ${quizInfo.title}`;
        const emailBody = `${quizInfo.shareMessage}\n\nTake the assessment here: ${getQuizUrl('email')}`;
        shareLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        windowFeatures = '';
        break;
      case 'text':
        const messageBody = `${quizInfo.shareMessage}\n\nTake the assessment here: ${getQuizUrl('text')}`;
        shareLink = `sms:?body=${encodeURIComponent(messageBody)}`;
        windowFeatures = '';
        break;
    }
    
    if (windowFeatures) {
      window.open(shareLink, '_blank', windowFeatures);
    } else {
      window.location.href = shareLink;
    }
  };

  const generateQRCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getQuizUrl('qr_code'))}`;
    window.open(qrCodeUrl, '_blank', 'width=400,height=400');
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

  const quizInfo = getQuizInfo();

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="full-page" className="flex items-center gap-2">
              <Maximize className="w-4 h-4" />
              Full Page
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Embed
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
                      value={quizUrl} 
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      onClick={() => handleCopy(quizUrl, 'Link copied to clipboard!')}
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
                      onClick={() => window.open(quizUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
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
                          onClick={() => handleShare('facebook')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Facebook className="w-4 h-4 mr-2" />
                          Facebook
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleShare('linkedin')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleShare('twitter')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleShare('email')}
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
                      <CardTitle className="text-lg">Additional Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleShare('text')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Smartphone className="w-4 h-4 mr-2" />
                          Text/SMS
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={generateQRCode}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          QR Code
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
                          onClick={() => handleCopy(getQuizUrl('manual_share'), 'Manual share link copied!')}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy Link
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
        </Tabs>
      </div>
    </div>
  );
}