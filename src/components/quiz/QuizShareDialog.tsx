
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, QrCode, Mail, MessageSquare, Globe, Code, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface QuizShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizType: string;
  quizTitle: string;
  shareKey: string;
  doctorId: string;
  isCustom?: boolean;
}

export function QuizShareDialog({ 
  isOpen, 
  onClose, 
  quizType, 
  quizTitle, 
  shareKey, 
  doctorId,
  isCustom = false
}: QuizShareDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = window.location.origin;
  
  // Generate URLs based on whether it's a custom quiz or standard quiz
  const fullPageUrl = isCustom 
    ? `${baseUrl}/quiz/custom/${quizType}?key=${shareKey}&doctor=${doctorId}`
    : `${baseUrl}/quiz/${quizType}?key=${shareKey}&doctor=${doctorId}`;
  
  const shortUrl = `${baseUrl}/q/${shareKey}`;
  
  const embedUrl = isCustom
    ? `${baseUrl}/embed/quiz/custom/${quizType}?key=${shareKey}&doctor=${doctorId}`
    : `${baseUrl}/embed/quiz/${quizType}?key=${shareKey}&doctor=${doctorId}`;
  
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></iframe>`;

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleSocialShare = (platform: string) => {
    const shareText = `Take the ${quizTitle} assessment: ${fullPageUrl}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullPageUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullPageUrl)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'email':
        const emailSubject = `${quizTitle} Assessment`;
        const emailBody = `Please take this important medical assessment: ${fullPageUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        break;
      case 'qr':
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullPageUrl)}`;
        window.open(qrUrl, '_blank');
        break;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${quizTitle} Assessment Link</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>${quizTitle} Assessment</h1>
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share your assessment</DialogTitle>
          <p className="text-gray-600">Embedding options for {quizTitle} {isCustom && '(Custom Quiz)'}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Share as Landing Page */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Share as Landing Page</h3>
            
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
                  onClick={() => handleCopy(fullPageUrl, 'url')}
                >
                  {copied === 'url' ? '✓' : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fullPageUrl, '_blank')}
                >
                  Open
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
                  onClick={() => handleCopy(shortUrl, 'short')}
                >
                  {copied === 'short' ? '✓' : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => handleSocialShare('facebook')}>
                Facebook
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSocialShare('twitter')}>
                Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSocialShare('linkedin')}>
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSocialShare('whatsapp')}>
                WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSocialShare('email')}>
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
            </div>
          </div>

          {/* Invite by Email */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invite by Email</h3>
            <p className="text-sm text-gray-600">
              Send customized email invitations to specific segments of your contacts.
            </p>
            <Button 
              className="w-full"
              onClick={() => handleSocialShare('email')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Compose email
            </Button>
          </div>
        </div>

        {/* Embed as Website Widget */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold">Embed as Website Widget</h3>
          <p className="text-sm text-gray-600">Use these options to embed the assessment in your own website.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Standard */}
            <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 bg-gray-100 rounded mb-2 mx-auto flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="font-medium text-sm">Standard</h4>
              <p className="text-xs text-gray-500 mt-1">Present your assessment seamlessly as part of your website.</p>
            </div>

            {/* Full-page */}
            <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 bg-gray-100 rounded mb-2 mx-auto flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h4 className="font-medium text-sm">Full-page</h4>
              <p className="text-xs text-gray-500 mt-1">Show users a full-page assessment when your site loads.</p>
            </div>

            {/* Pop-up */}
            <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 bg-gray-100 rounded mb-2 mx-auto flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="font-medium text-sm">Pop-up</h4>
              <p className="text-xs text-gray-500 mt-1">Your assessment pops up in the center of the screen.</p>
            </div>

            {/* Chat Button */}
            <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer">
              <div className="w-8 h-8 bg-gray-100 rounded mb-2 mx-auto flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="font-medium text-sm">Chat Button</h4>
              <p className="text-xs text-gray-500 mt-1">Your assessment opens as a chat when someone clicks the button.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Embed Code</label>
            <div className="relative">
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto font-mono">
                {embedCode}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(embedCode, 'embed')}
              >
                {copied === 'embed' ? '✓' : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSocialShare('qr')}>
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
