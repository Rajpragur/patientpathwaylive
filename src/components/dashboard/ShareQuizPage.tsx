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
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';

// Quiz descriptions and messages
const quizMessages = {
  snot22: {
    title: "SNOT-22 Assessment",
    description: "A comprehensive evaluation tool for chronic rhinosinusitis symptoms",
    shareMessage: "Take this comprehensive assessment to evaluate your sinus symptoms and quality of life. The SNOT-22 is the gold standard for measuring chronic rhinosinusitis impact.",
    linkedinMessage: "Share this validated assessment tool with your patients to better understand their sinus symptoms and quality of life. The SNOT-22 is widely used by ENT specialists worldwide."
  },
  snot12: {
    title: "SNOT-12 Assessment",
    description: "A streamlined version of the SNOT-22 for quick symptom evaluation",
    shareMessage: "Take this quick assessment to evaluate your sinus symptoms. The SNOT-12 provides a rapid yet accurate evaluation of nasal and sinus symptoms.",
    linkedinMessage: "Share this efficient assessment tool with your patients. The SNOT-12 offers a quick yet accurate evaluation of nasal and sinus symptoms, perfect for routine check-ups."
  },
  nose: {
    title: "NOSE Scale Assessment",
    description: "Evaluate nasal breathing difficulties and their impact",
    shareMessage: "Take this assessment to evaluate your nasal breathing difficulties. The NOSE scale helps quantify the severity of nasal obstruction and its impact on daily activities.",
    linkedinMessage: "Share this validated tool with your patients to assess nasal breathing difficulties. The NOSE scale is essential for evaluating treatment effectiveness and surgical outcomes."
  },
  hhia: {
    title: "Hearing Handicap Inventory for Adults",
    description: "Evaluate the psychosocial impact of hearing loss",
    shareMessage: "Take this assessment to understand how hearing loss affects your daily life. The HHIA helps evaluate the emotional and social impact of hearing difficulties.",
    linkedinMessage: "Share this comprehensive assessment with your patients to understand the psychosocial impact of hearing loss. The HHIA is essential for developing targeted treatment plans."
  },
  epworth: {
    title: "Epworth Sleepiness Scale",
    description: "Measure daytime sleepiness and identify potential sleep disorders",
    shareMessage: "Take this assessment to evaluate your daytime sleepiness. The Epworth Sleepiness Scale helps identify potential sleep disorders and their impact on daily life.",
    linkedinMessage: "Share this widely-used assessment with your patients to evaluate daytime sleepiness. The Epworth Scale is crucial for diagnosing sleep disorders and monitoring treatment progress."
  },
  dhi: {
    title: "Dizziness Handicap Inventory",
    description: "Evaluate the impact of dizziness and balance problems",
    shareMessage: "Take this assessment to understand how dizziness affects your daily life. The DHI helps evaluate the physical, emotional, and functional impact of balance problems.",
    linkedinMessage: "Share this validated assessment with your patients to evaluate dizziness and balance problems. The DHI is essential for developing comprehensive treatment plans."
  },
  stopbang: {
    title: "STOP-Bang Assessment",
    description: "Screen for obstructive sleep apnea risk factors",
    shareMessage: "Take this assessment to evaluate your risk for sleep apnea. The STOP-Bang questionnaire helps identify key risk factors for obstructive sleep apnea.",
    linkedinMessage: "Share this screening tool with your patients to assess sleep apnea risk. The STOP-Bang questionnaire is essential for early detection of sleep-related breathing disorders."
  },
  tnss: {
    title: "Total Nasal Symptom Score",
    description: "Evaluate the severity of nasal symptoms",
    shareMessage: "Take this assessment to evaluate your nasal symptoms. The TNSS helps track the severity of congestion, rhinorrhea, sneezing, and nasal itching.",
    linkedinMessage: "Share this focused assessment with your patients to evaluate nasal symptoms. The TNSS is perfect for tracking symptom changes and treatment effectiveness."
  }
};

export function ShareQuizPage() {
  const { quizType, customQuizId } = useParams<{ quizType?: string; customQuizId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('full-page');
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;
  const source = searchParams.get('source') || 'direct';
  const campaign = searchParams.get('campaign') || 'default';
  const medium = searchParams.get('medium') || 'none';

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
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
        toast.error('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [customQuizId]);

  // Generate the appropriate URL with tracking parameters
  const getQuizUrl = () => {
    const baseQuizUrl = customQuizId 
      ? `${baseUrl}/quiz/custom/${customQuizId}`
      : `${baseUrl}/quiz/${quizType?.toLowerCase()}`;
    
    const trackingParams = new URLSearchParams({
      source,
      campaign,
      medium,
      utm_source: source,
      utm_campaign: campaign,
      utm_medium: medium,
      shared_at: new Date().toISOString()
    });

    return `${baseQuizUrl}?${trackingParams.toString()}`;
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
        shareMessage: quizMessages[quizType?.toLowerCase() as keyof typeof quizMessages]?.shareMessage || 
          `Take this ${standardQuiz.title} assessment to evaluate your symptoms.`,
        linkedinMessage: quizMessages[quizType?.toLowerCase() as keyof typeof quizMessages]?.linkedinMessage || 
          `Share this ${standardQuiz.title} assessment with your patients to evaluate their symptoms.`
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
    const shareUrl = encodeURIComponent(quizUrl);
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
        const emailBody = `${quizInfo.shareMessage}\n\nTake the assessment here: ${quizUrl}`;
        shareLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        windowFeatures = '';
        break;
      case 'text':
        const messageBody = `${quizInfo.shareMessage}\n\nTake the assessment here: ${quizUrl}`;
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
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(quizUrl)}`;
    window.open(qrCodeUrl, '_blank', 'width=400,height=400');
  };

  const downloadPDF = () => {
    const { jsPDF } = window as any;
    const doc = new jsPDF();
    const quizInfo = getQuizInfo();
    
    doc.setFontSize(20);
    doc.text(quizInfo.title, 20, 20);
    
    doc.setFontSize(12);
    doc.text(quizInfo.description, 20, 40);
    doc.text(`URL: ${quizUrl}`, 20, 60);
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(quizUrl)}`;
    doc.addImage(qrCodeUrl, 'PNG', 20, 80, 50, 50);
    
    doc.save(`${quizInfo.title}-assessment.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7904f] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Check if quiz exists
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
      {/* Header */}
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
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-[#f7904f] to-[#04748f] text-white px-4 py-2">
              {customQuiz ? 'Custom Quiz' : 'Standard Quiz'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
                <CardTitle>Full Page Link</CardTitle>
                <CardDescription>
                  Share this link to allow patients to take the assessment on a dedicated page
                </CardDescription>
          </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Share Options</CardTitle>
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
                          Text
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
                          onClick={downloadPDF}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
            <Button 
                          variant="outline" 
                          onClick={() => window.print()}
                          className="hover:bg-blue-50 hover:text-blue-600"
            >
                          <Printer className="w-4 h-4 mr-2" />
                          Print
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
                  Add this assessment directly to your website using the embed code below
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
                        <h4 className="font-medium">3. Customize (Optional)</h4>
                        <p className="text-sm text-gray-600">Adjust the width and height attributes to fit your website's layout.</p>
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
