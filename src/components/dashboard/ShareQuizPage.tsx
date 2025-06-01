
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Facebook,
  Linkedin,
  Twitter,
  Monitor,
  Sidebar as SidebarIcon,
  FileText,
  Printer,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';
import { IncidentTracker } from './IncidentTracker';

export function ShareQuizPage() {
  const { quizType, customQuizId } = useParams<{ quizType?: string; customQuizId?: string }>();
  const navigate = useNavigate();
  const [shareKey] = useState(`share_${Date.now()}`);
  const baseUrl = window.location.origin;
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(!!customQuizId);
  const [selectedIncident, setSelectedIncident] = useState('default');

  useEffect(() => {
    const fetchCustomQuiz = async () => {
      if (customQuizId) {
        setLoading(true);
        const { data, error } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', customQuizId)
          .single();
        if (data) setCustomQuiz(data);
        setLoading(false);
      }
    };
    fetchCustomQuiz();
  }, [customQuizId]);

  if (loading) {
    return <div className="p-6 text-center text-lg">Loading quiz...</div>;
  }

  if (customQuizId && !customQuiz) {
    return <div className="p-6 text-center text-lg">Custom quiz not found.</div>;
  }

  let quiz: any = null;
  if (customQuizId && customQuiz) {
    quiz = {
      ...customQuiz,
      id: customQuiz.id,
      title: customQuiz.title,
      description: customQuiz.description,
    };
  } else {
    quiz = Object.values(quizzes).find(q => q && q.id && q.id.toLowerCase() === quizType?.toLowerCase());
  }

  if (!quiz || !quiz.title) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
          <p className="text-gray-600 mb-4">The requested quiz could not be found or is missing required data.</p>
          <Button onClick={() => navigate('/portal')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const shareOptions = [
    {
      id: 'full-page',
      title: 'Full Page',
      description: 'Complete assessment page with your branding',
      url: `${baseUrl}/quiz/${quiz.id.toLowerCase()}?key=${shareKey}&incident=${selectedIncident}`,
      icon: <Monitor className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'embed',
      title: 'Embed Code',
      description: 'Embed directly in your existing website',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&incident=${selectedIncident}`,
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'chat-widget',
      title: 'Chat Widget',
      description: 'Floating chat widget for your website',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&mode=chat&incident=${selectedIncident}`,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'chat-button',
      title: 'Chat Button',
      description: 'Simple button that opens assessment chat',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&mode=button&incident=${selectedIncident}`,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-700'
    }
  ];

  const handleCopyUrl = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${title} URL copied to clipboard!`);
  };

  const handleCopyEmbedCode = (url: string, type: string) => {
    let embedCode = '';
    switch (type) {
      case 'embed':
        embedCode = `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 16px;"></iframe>`;
        break;
      case 'chat-widget':
        embedCode = `<script src="${url.replace('/embed/', '/widget/')}.js"></script>`;
        break;
      case 'chat-button':
        embedCode = `<button onclick="window.open('${url}', 'assessment', 'width=800,height=600')">Take Assessment</button>`;
        break;
    }
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  const handleSocialShare = (platform: string, url: string) => {
    const shareText = `Take the ${quiz.title} assessment: ${url}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
    }
  };

  const handleEmailShare = (url: string) => {
    const subject = encodeURIComponent(`${quiz.title} Medical Assessment`);
    const body = encodeURIComponent(`Please complete this medical assessment: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleTextShare = (url: string) => {
    const message = encodeURIComponent(`Take the ${quiz.title} assessment: ${url}`);
    window.open(`sms:?body=${message}`);
  };

  const generateQRCode = (url: string) => {
    // In a real implementation, you'd generate an actual QR code
    toast.info('QR Code generation would be implemented here');
  };

  const generatePDF = () => {
    toast.info('PDF generation would be implemented here');
  };

  const fullPageUrl = shareOptions[0].url;

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/portal')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assessments
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Share Assessment</h1>
            <p className="text-lg text-gray-600 mt-2">{quiz.title}</p>
          </div>
        </div>
        <Badge className="bg-[#0E7C9D] text-white text-lg px-4 py-2">
          {quiz.title}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {shareOptions.map(option => (
            <Card key={option.id} className="shadow-sm border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${option.color}`}>
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{option.title}</h3>
                    <p className="text-gray-600 text-sm">{option.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={option.url} readOnly className="flex-1 font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(option.url, option.title)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {option.id !== 'full-page' && (
                  <div className="flex gap-2">
                    <Input 
                      value={`<!-- ${option.title} Embed Code -->`}
                      readOnly 
                      className="flex-1 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyEmbedCode(option.url, option.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare('facebook', option.url)}
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSocialShare('linkedin', option.url)}
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEmailShare(option.url)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTextShare(option.url)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateQRCode(option.url)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generatePDF}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(option.url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <IncidentTracker 
            selectedIncident={selectedIncident}
            onIncidentChange={setSelectedIncident}
          />
        </div>
      </div>
    </div>
  );
}
