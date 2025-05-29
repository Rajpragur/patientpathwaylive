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
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { quizzes } from '@/data/quizzes';
import { supabase } from '@/integrations/supabase/client';

export function ShareQuizPage() {
  const { quizType, customQuizId } = useParams<{ quizType?: string; customQuizId?: string }>();
  const navigate = useNavigate();
  const [shareKey] = useState(`share_${Date.now()}`);
  const baseUrl = window.location.origin;
  const [customQuiz, setCustomQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(!!customQuizId);

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
    return (
      <div className="p-6 text-center text-lg">Loading quiz...</div>
    );
  }

  if (customQuizId && !customQuiz) {
    return (
      <div className="p-6 text-center text-lg">Custom quiz not found.</div>
    );
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
      id: 'landing',
      title: 'Standard',
      description: 'Present your assessment seamlessly as part of your website.',
      url: `${baseUrl}/quiz/${quiz.id.toLowerCase()}?key=${shareKey}`,
      icon: <Monitor className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'embed-fullpage',
      title: 'Full-page',
      description: 'Show users a full-page assessment when your site loads.',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&mode=fullpage`,
      icon: <Maximize className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'embed-popup',
      title: 'Pop-up',
      description: 'Your assessment pops up in the center of the screen.',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&mode=popup`,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-700'
    },
    {
      id: 'embed-side',
      title: 'Side Panel',
      description: 'Let your assessment slide in from the side in full size.',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&mode=side`,
      icon: <SidebarIcon className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'embed-chat',
      title: 'Chat Button',
      description: 'Your assessment opens as a chat when someone clicks the button.',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&mode=chat`,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-pink-100 text-pink-700'
    },
    {
      id: 'embed-tab',
      title: 'Side Tab',
      description: 'Let your assessment as a floating tab from the side with a clickable label.',
      url: `${baseUrl}/embed/quiz/${quiz.id}?key=${shareKey}&mode=tab`,
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-indigo-100 text-indigo-700'
    }
  ];

  const handleCopyUrl = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    toast.success(`${title} URL copied to clipboard!`);
  };

  const handleEmailShare = (url: string) => {
    const subject = encodeURIComponent(`${quiz.title} Medical Assessment`);
    const body = encodeURIComponent(`Please complete this medical assessment: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleSocialShare = (platform: string, url: string) => {
    const shareText = `Take the ${quiz.title} assessment: ${url}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
    }
  };

  const generateEmbedCode = (url: string, title: string) => {
    if (title.includes('Standard')) {
      return `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></iframe>`;
    } else if (title.includes('Full-page')) {
      return `<iframe src="${url}" width="100%" height="100vh" frameborder="0"></iframe>`;
    } else if (title.includes('Pop-up')) {
      return `<script>
function openAssessment() {
  window.open('${url}', 'assessment', 'width=800,height=600,scrollbars=yes,resizable=yes');
}
</script>
<button onclick="openAssessment()">Take Assessment</button>`;
    }
    return `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 16px;"></iframe>`;
  };

  const fullPageUrl = shareOptions[0].url;
  const shortUrl = `${baseUrl.replace('https://', '').replace('http://', '')}/q/${shareKey}`;

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
            <h1 className="text-4xl font-bold text-gray-900">Share your assessment</h1>
            <p className="text-lg text-gray-600 mt-2">Embedding options for {quiz.title}</p>
          </div>
        </div>
        <Badge className="bg-[#0E7C9D] text-white text-lg px-4 py-2">
          {quiz.title}
        </Badge>
      </div>

      <div className="space-y-10">
        {shareOptions.map(option => (
          <div key={option.id} className="p-8 rounded-2xl border shadow-md bg-gray-50 flex flex-col md:flex-row md:items-center md:gap-8 gap-4">
            <div className={`flex items-center justify-center w-16 h-16 rounded-full ${option.color} text-2xl`}>{option.icon}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1">{option.title}</h2>
              <p className="text-gray-600 mb-2">{option.description}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Input value={option.url} readOnly className="flex-1" />
                <Button onClick={() => handleCopyUrl(option.url, option.title)} variant="secondary" className="shrink-0">
                  <Copy className="w-4 h-4 mr-1" /> Copy URL
                </Button>
                <Button onClick={() => handleEmailShare(option.url)} variant="outline" className="shrink-0">
                  <Mail className="w-4 h-4 mr-1" /> Email
                </Button>
                <Button onClick={() => handleSocialShare('facebook', option.url)} variant="outline" className="shrink-0">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleSocialShare('twitter', option.url)} variant="outline" className="shrink-0">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleSocialShare('linkedin', option.url)} variant="outline" className="shrink-0">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">Embed Code</label>
                <Input value={generateEmbedCode(option.url, option.title)} readOnly className="font-mono text-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
