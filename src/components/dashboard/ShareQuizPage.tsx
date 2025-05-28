
import { useState } from 'react';
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

export function ShareQuizPage() {
  const { quizType } = useParams<{ quizType: string }>();
  const navigate = useNavigate();
  const [shareKey] = useState(`share_${Date.now()}`);
  const baseUrl = window.location.origin;
  
  const quiz = Object.values(quizzes).find(q => q.id.toLowerCase() === quizType?.toLowerCase());
  
  if (!quiz) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h1>
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/portal')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Share your assessment</h1>
            <p className="text-gray-600 mt-2">Embedding options for {quiz.title}</p>
          </div>
        </div>
        <Badge className="bg-[#0E7C9D] text-white text-sm px-3 py-1">
          {quiz.title}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share as Landing Page */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Share as Landing Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Assessment URL</label>
              <div className="flex gap-2">
                <Input
                  value={fullPageUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(fullPageUrl, 'Assessment URL')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fullPageUrl, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Short URL</label>
              <div className="flex gap-2">
                <Input
                  value={shortUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(shortUrl, 'Short URL')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSocialShare('facebook', fullPageUrl)}
                className="flex items-center gap-1"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSocialShare('twitter', fullPageUrl)}
                className="flex items-center gap-1"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSocialShare('linkedin', fullPageUrl)}
                className="flex items-center gap-1"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEmailShare(fullPageUrl)}
                className="flex items-center gap-1"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invite by Email */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Invite by Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Send customized email invitations to specific segments of your contacts.
            </p>
            <Button 
              className="w-full bg-[#0E7C9D] hover:bg-[#0E7C9D]/90"
              onClick={() => handleEmailShare(fullPageUrl)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Compose email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Embed as Website Widget */}
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Embed as Website Widget
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">Use these options to embed the assessment in your own website.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {shareOptions.map((option) => (
              <div 
                key={option.id} 
                className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`w-8 h-8 rounded mb-2 mx-auto flex items-center justify-center ${option.color}`}>
                  {option.icon}
                </div>
                <h4 className="font-medium text-sm">{option.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {shareOptions.map((option) => (
              <div key={option.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${option.color}`}>
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{option.title}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      value={option.url} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(option.url, option.title)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Embed Code:</label>
                    <div className="flex gap-2">
                      <Input 
                        value={generateEmbedCode(option.url, option.title)}
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyUrl(generateEmbedCode(option.url, option.title), 'Embed code')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullPageUrl)}`, '_blank')}>
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
            <Button variant="outline" onClick={() => {
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head><title>${quiz.title} Assessment Link</title></head>
                    <body style="font-family: Arial, sans-serif; padding: 20px;">
                      <h1>${quiz.title} Assessment</h1>
                      <p>Visit the link below to take this assessment:</p>
                      <p style="font-size: 14px; word-break: break-all; background: #f5f5f5; padding: 10px;">${fullPageUrl}</p>
                      <div style="margin-top: 20px;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullPageUrl)}" alt="QR Code" />
                      </div>
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
              }
            }}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
