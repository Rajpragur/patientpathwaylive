
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Link, Code, MessageSquare, Facebook, Linkedin, Mail, QrCode, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface QuizShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizType: string;
  isCustom?: boolean;
  customQuizId?: string;
}

export function QuizShareDialog({ isOpen, onClose, quizType, isCustom = false, customQuizId }: QuizShareDialogProps) {
  const [activeTab, setActiveTab] = useState('full-page');
  const baseUrl = window.location.origin;
  
  // Generate the appropriate URL based on quiz type
  const getQuizUrl = () => {
    const baseQuizUrl = isCustom && customQuizId 
      ? `${baseUrl}/embed/quiz/custom/${customQuizId}` 
      : `${baseUrl}/embed/quiz/${quizType.toLowerCase()}`;
    
    // Add mode parameter to specify embed type and prevent reloading
    const url = new URL(baseQuizUrl);
    url.searchParams.set('mode', 'embed');
    return url.toString();
  };

  // Memoize the quiz URL to prevent regeneration
  const quizUrl = React.useMemo(getQuizUrl, [baseUrl, isCustom, customQuizId, quizType]);

  // Create a stable embed code with fixed dimensions and style
  const embedCode = React.useMemo(() => 
    `<iframe 
      src="${quizUrl}" 
      width="100%" 
      height="600" 
      style="border: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
      title="${quizType} Assessment"
    ></iframe>`,
    [quizUrl, quizType]
  );
  const chatWidgetCode = `<script src="${baseUrl}/widget.js" data-quiz="${quizType.toLowerCase()}" async></script>`;

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handleShare = (platform: string) => {
    const shareUrl = encodeURIComponent(quizUrl);
    const shareTitle = encodeURIComponent(`Take the ${quizType} Assessment`);
    
    let shareLink = '';
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${shareTitle}&body=Take this assessment: ${quizUrl}`;
        break;
    }
    
    window.open(shareLink, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Assessment</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="full-page">
              <Link className="w-4 h-4 mr-2" />
              Full Page
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Code className="w-4 h-4 mr-2" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="widget">
              <MessageSquare className="w-4 h-4 mr-2" />
              Widget
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="full-page">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={quizUrl} readOnly />
                    <Button onClick={() => handleCopy(quizUrl, 'Link copied!')}>
                      Copy
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <QRCodeSVG value={quizUrl} size={200} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Embed this code in your website:</p>
                  <div className="flex gap-2">
                    <Input value={embedCode} readOnly />
                    <Button onClick={() => handleCopy(embedCode, 'Embed code copied!')}>
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="widget">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Add this code to your website for a chat widget:</p>
                  <div className="flex gap-2">
                    <Input value={chatWidgetCode} readOnly />
                    <Button onClick={() => handleCopy(chatWidgetCode, 'Widget code copied!')}>
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleShare('facebook')} className="w-full">
                    <Facebook className="w-4 h-4 mr-2" />
                    Share on Facebook
                  </Button>
                  <Button onClick={() => handleShare('linkedin')} className="w-full">
                    <Linkedin className="w-4 h-4 mr-2" />
                    Share on LinkedIn
                  </Button>
                  <Button onClick={() => handleShare('email')} className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Share via Email
                  </Button>
                  <Button onClick={() => window.print()} className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Save as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
