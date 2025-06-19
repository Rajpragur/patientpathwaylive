import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, QrCode, Mail, Share2, Globe, MessageSquare, Maximize, Eye, Link } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ShareAssessmentsPageProps {
  quizType?: string;
}

export function ShareAssessmentsPage({ quizType = 'SNOT22' }: ShareAssessmentsPageProps) {
  const [shareKey] = useState(`share_${Date.now()}`);
  const baseUrl = window.location.origin;
  const navigate = useNavigate();
  
  const shareOptions = [
    {
      id: 'landing',
      title: 'Landing Page',
      description: 'Full assessment page with branding',
      url: `${baseUrl}/quiz/${quizType.toLowerCase()}?key=${shareKey}`,
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'embed-standard',
      title: 'Standard Embed',
      description: 'Embed in your website (600x400)',
      url: `${baseUrl}/embed/quiz/${quizType}?key=${shareKey}`,
      icon: <Share2 className="w-5 h-5" />,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'embed-fullpage',
      title: 'Full-page Embed',
      description: 'Full browser window embed',
      url: `${baseUrl}/embed/quiz/${quizType}?key=${shareKey}&mode=fullpage`,
      icon: <Maximize className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'embed-popup',
      title: 'Pop-up Embed',
      description: 'Modal overlay assessment',
      url: `${baseUrl}/embed/quiz/${quizType}?key=${shareKey}&mode=popup`,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-700'
    }
  ];

  const [shortenedUrls, setShortenedUrls] = useState<{[key: string]: string}>({});

  const shortenUrl = async (longUrl: string): Promise<string> => {
    const ulvisApiUrl = `https://ulvis.net/api.php?url=${longUrl}`;
    try {
      const response = await fetch(ulvisApiUrl);
      const data = await response.json();
      if (data?.status === 'OK') {
        return data.url;
      } else {
        toast.error(`Failed to shorten URL: ${data?.message}`);
        return longUrl;
      }
    } catch (error: any) {
      console.error("Error shortening URL:", error);
      toast.error("Error shortening URL. Using original URL.");
      return longUrl;
    }
  };

  useEffect(() => {
    const shortenAllUrls = async () => {
      const newShortenedUrls: {[key: string]: string} = {};
      for (const option of shareOptions) {
        newShortenedUrls[option.id] = await shortenUrl(option.url);
      }
      setShortenedUrls(prev => ({ ...prev, ...newShortenedUrls }));
    };

    void shortenAllUrls();
  }, [shareOptions]);

  const handleCopyUrl = (url: string, title: string) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success(`${title} URL copied to clipboard!`);
    } else {
      toast.error("URL is still loading, please wait.");
    }
  };

  const handleEmailShare = (url: string) => {
    const subject = encodeURIComponent(`${quizType} Medical Assessment`);
    const body = encodeURIComponent(`Please complete this medical assessment: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const generateEmbedCode = (url: string, title: string) => {
    if (title.includes('Standard')) {
      return `<iframe src="${url}" width="600" height="400" frameborder="0"></iframe>`;
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
    return '';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Share Assessment</h1>
          <p className="text-gray-600 mt-2">Share your {quizType} assessment with patients</p>
        </div>
        <Badge className="bg-[#0E7C9D] text-white text-sm px-3 py-1">
          {quizType} Assessment
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {shareOptions.map((option) => (
          <Card key={option.id} className="shadow-sm border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${option.color}`}>
                  {option.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={shortenedUrls[option.id] || 'Loading...'}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(shortenedUrls[option.id], `Short ${option.title}`)}
                  className="flex-shrink-0"
                  disabled={!shortenedUrls[option.id]}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {option.id.includes('embed') && (
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
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEmailShare(option.url)}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(option.url, '_blank')}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card key="short-url" className="shadow-sm border hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-yellow-100 text-yellow-700`}>
                <Link className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Short URL</CardTitle>
                <p className="text-sm text-gray-600">Shortened URL for easy sharing</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={shortenedUrls['short-url'] || 'Loading...'}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyUrl(shortenedUrls['short-url'], 'Short URL')}
                className="flex-shrink-0"
                disabled={!shortenedUrls['short-url']}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEmailShare(shortenedUrls['short-url'])}
                className="flex-1"
                disabled={!shortenedUrls['short-url']}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(shortenedUrls['short-url'], '_blank')}
                className="flex-1"
                disabled={!shortenedUrls['short-url']}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">QR Code for quick access</p>
              <Button variant="outline" size="sm">
                Download QR Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
