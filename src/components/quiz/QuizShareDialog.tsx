
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, QrCode, Mail, MessageSquare, Globe, Code, Printer, Share, Facebook, Linkedin } from 'lucide-react';
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
    : `${baseUrl}/quiz/${quizType.toLowerCase()}?key=${shareKey}&doctor=${doctorId}`;
  
  const shortUrl = `${baseUrl}/q/${shareKey}`;
  
  const embedUrl = isCustom
    ? `${baseUrl}/embed/quiz/custom/${quizType}?key=${shareKey}&doctor=${doctorId}`
    : `${baseUrl}/embed/quiz/${quizType.toLowerCase()}?key=${shareKey}&doctor=${doctorId}`;
  
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></iframe>`;

  const chatWidgetCode = `<!-- Chat Widget Code -->
<div id="quiz-chat-widget"></div>
<script>
  (function() {
    var widget = document.createElement('div');
    widget.innerHTML = '<button onclick="openQuizChat()" style="position: fixed; bottom: 20px; right: 20px; background: linear-gradient(45deg, #f97316, #22c55e); color: white; border: none; border-radius: 50px; padding: 15px 20px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000;">💬 Take Assessment</button>';
    document.body.appendChild(widget);
    
    window.openQuizChat = function() {
      var chatWindow = window.open('${fullPageUrl}', 'quiz_chat', 'width=400,height=600,scrollbars=yes,resizable=yes');
      chatWindow.focus();
    };
  })();
</script>`;

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
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullPageUrl)}`, '_blank');
        break;
      case 'email':
        const emailSubject = `${quizTitle} Assessment`;
        const emailBody = `Hi there,\n\nI'd like you to take this important medical assessment:\n\n${fullPageUrl}\n\nIt only takes 5-10 minutes and provides valuable health insights.\n\nBest regards`;
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
          <head>
            <title>${quizTitle} Assessment</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 40px; }
              .qr-section { text-align: center; margin: 30px 0; }
              .url-section { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${quizTitle} Assessment</h1>
              <p>Scan the QR code or visit the link below to take this assessment</p>
            </div>
            <div class="url-section">
              <h3>Assessment Link:</h3>
              <p style="word-break: break-all; font-size: 14px;">${fullPageUrl}</p>
            </div>
            <div class="qr-section">
              <h3>QR Code:</h3>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullPageUrl)}" alt="QR Code" />
            </div>
            <div style="margin-top: 40px; text-align: center; color: #666;">
              <p>This assessment takes 5-10 minutes to complete and provides valuable health insights.</p>
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Share Your Assessment
          </DialogTitle>
          <p className="text-gray-600 text-lg">Multiple sharing options for {quizTitle} {isCustom && '(Custom Quiz)'}</p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Full Page Sharing */}
          <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-3xl p-6 border-2 border-orange-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-orange-500" />
              Full Page
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Assessment URL</label>
                <div className="flex gap-2">
                  <Input
                    value={fullPageUrl}
                    readOnly
                    className="font-mono text-xs bg-white border-2 border-gray-200 rounded-xl"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(fullPageUrl, 'url')}
                    className="rounded-xl border-orange-200 hover:bg-orange-50"
                  >
                    {copied === 'url' ? '✓' : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(fullPageUrl, '_blank')}
                    className="rounded-xl border-green-200 hover:bg-green-50"
                  >
                    Open
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Short URL</label>
                <div className="flex gap-2">
                  <Input
                    value={shortUrl}
                    readOnly
                    className="font-mono text-xs bg-white border-2 border-gray-200 rounded-xl"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(shortUrl, 'short')}
                    className="rounded-xl border-orange-200 hover:bg-orange-50"
                  >
                    {copied === 'short' ? '✓' : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSocialShare('facebook')}
                  className="rounded-xl border-blue-200 hover:bg-blue-50"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSocialShare('linkedin')}
                  className="rounded-xl border-blue-200 hover:bg-blue-50"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSocialShare('email')}
                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleSocialShare('qr')}
                  className="rounded-xl border-purple-200 hover:bg-purple-50"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  className="rounded-xl border-gray-200 hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-500" />
              Embed Code in Pre-existing Website
            </h3>
            
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700">Embed Code</label>
              <div className="relative">
                <pre className="bg-white p-4 rounded-xl text-xs overflow-x-auto font-mono border-2 border-gray-200">
                  {embedCode}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 rounded-lg"
                  onClick={() => handleCopy(embedCode, 'embed')}
                >
                  {copied === 'embed' ? '✓' : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Widget */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-3xl p-6 border-2 border-green-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-green-500" />
              Chat Widget
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Add a floating chat button to your website that opens the assessment</p>
              <div className="relative">
                <pre className="bg-white p-4 rounded-xl text-xs overflow-x-auto font-mono border-2 border-gray-200">
                  {chatWidgetCode}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 rounded-lg"
                  onClick={() => handleCopy(chatWidgetCode, 'widget')}
                >
                  {copied === 'widget' ? '✓' : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Button */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-500" />
              Chat Button
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Simple button code to add anywhere on your website</p>
              <div className="relative">
                <pre className="bg-white p-4 rounded-xl text-xs overflow-x-auto font-mono border-2 border-gray-200">
{`<a href="${fullPageUrl}" target="_blank" style="display: inline-block; background: linear-gradient(45deg, #f97316, #22c55e); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  💬 Take Assessment
</a>`}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 rounded-lg"
                  onClick={() => handleCopy(`<a href="${fullPageUrl}" target="_blank" style="display: inline-block; background: linear-gradient(45deg, #f97316, #22c55e); color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">💬 Take Assessment</a>`, 'button')}
                >
                  {copied === 'button' ? '✓' : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
