import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Mail,
  Smartphone,
} from 'lucide-react';

interface QuizShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quizType: string;
  customQuizId?: string;
}

export function QuizShareDialog({ isOpen, onClose, quizType, customQuizId }: QuizShareDialogProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
        return;
      }

      setProfile(data);
      generateShareUrl(data);
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      toast.error('Unexpected error loading profile');
    }
  };

  const generateShareUrl = async (profileData: any) => {
    if (!profileData) return;

    let baseUrl = window.location.origin;
    let path = `/quiz/${quizType}`;

    if (customQuizId) {
      path = `/custom-quiz/${customQuizId}`;
    }

    const params = new URLSearchParams();
    params.append('clinic_name', profileData.clinic_name || '');
    params.append('doctor_id', profileData.doctor_id || '');

    const fullUrl = `${baseUrl}${path}?${params.toString()}`;
    setShareUrl(fullUrl);

    // Generate short URL for sharing
    const short = await generateShortUrl(fullUrl);
    setShortUrl(short);

    // Generate QR code
    generateQrCode(fullUrl);
  };

  const generateQrCode = (url: string) => {
    const urlWithUtm = new URL(url);
    urlWithUtm.searchParams.set('utm_source', 'qr');
    setQrCodeUrl(urlWithUtm.toString());
  };

  const generateShortUrl = async (longUrl: string) => {
    try {
      // Try multiple URL shortening services directly from client
      let shortUrl = null;
      
      // Try TinyURL first (most reliable)
      try {
        const tinyUrlResponse = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (tinyUrlResponse.ok) {
          const tinyUrl = await tinyUrlResponse.text();
          if (tinyUrl && tinyUrl.startsWith('http')) {
            shortUrl = tinyUrl.trim();
          }
        }
      } catch (error) {
        console.log('TinyURL failed, trying next service...');
      }
      
      // Try is.gd if TinyURL failed
      if (!shortUrl) {
        try {
          const isGdResponse = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
          if (isGdResponse.ok) {
            const isGdData = await isGdResponse.json();
            if (isGdData && isGdData.shorturl) {
              shortUrl = isGdData.shorturl;
            }
          }
        } catch (error) {
          console.log('is.gd failed, trying next service...');
        }
      }
      
      // Try v.gd if previous services failed
      if (!shortUrl) {
        try {
          const vGdResponse = await fetch(`https://v.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
          if (vGdResponse.ok) {
            const vGdData = await vGdResponse.json();
            if (vGdData && vGdData.shorturl) {
              shortUrl = vGdData.shorturl;
            }
          }
        } catch (error) {
          console.log('v.gd failed, using original URL...');
        }
      }
      
      // If all services fail, use original URL
      return shortUrl || longUrl;
    } catch (error) {
      console.error('Error generating short URL:', error);
      return longUrl;
    }
  };

  const handleSocialShare = async (platform: string) => {
    if (!shareUrl) return;

    // Add source parameter to the URL for tracking
    const urlWithSource = new URL(shareUrl);
    urlWithSource.searchParams.set('source', platform);
    urlWithSource.searchParams.set('utm_source', platform);
    urlWithSource.searchParams.set('utm_medium', platform);
    urlWithSource.searchParams.set('utm_campaign', 'quiz_share');
    const finalUrl = urlWithSource.toString();

    // Generate short URL for sharing (Facebook can't access localhost)
    const urlToShare = await generateShortUrl(finalUrl);

    let socialUrl = '';
    const message = `Take this ${quizType} assessment to evaluate your health.`;
    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(urlToShare);

    switch (platform) {
      case 'facebook':
        try {
          socialUrl = `https://www.facebook.com/sharer.php?u=${encodedUrl}`;
        } catch (error) {
          console.error('Error generating Facebook URL:', error);
          socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        }
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}&hashtags=health,assessment`;
        break;
      case 'linkedin':
        socialUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodeURIComponent(`${quizType} Health Assessment`)}&summary=${encodedMessage}`;
        break;
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
      case 'telegram':
        socialUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`;
        break;
      case 'email':
        socialUrl = `mailto:?subject=${encodeURIComponent(`${quizType} Health Assessment`)}&body=${encodedMessage}%0A%0A${encodedUrl}`;
        break;
      case 'sms':
        socialUrl = `sms:?&body=${encodedMessage}%0A%0A${encodedUrl}`;
        break;
      default:
        console.warn(`Unsupported platform: ${platform}`);
        return;
    }

    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    }
  };

  const copyToClipboard = async () => {
    try {
      const urlToCopy = shortUrl || shareUrl;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy text: ", err);
      toast.error('Failed to copy link to clipboard.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share {quizType} Assessment
          </DialogTitle>
          <DialogDescription>
            Share this assessment with your patients or on social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Direct Link */}
          <div className="space-y-2">
            <Label>Direct Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
                placeholder="Generating link..."
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                className="flex items-center gap-2 text-sky-500 hover:bg-sky-50"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                onClick={() => handleSocialShare('linkedin')}
                variant="outline"
                className="flex items-center gap-2 text-blue-700 hover:bg-blue-50"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                variant="outline"
                className="flex items-center gap-2 text-green-600 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleSocialShare('telegram')}
                variant="outline"
                className="flex items-center gap-2 text-blue-500 hover:bg-blue-50"
              >
                <Send className="w-4 h-4" />
                Telegram
              </Button>
              <Button
                onClick={() => handleSocialShare('email')}
                variant="outline"
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-50"
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              <Button
                onClick={() => handleSocialShare('sms')}
                variant="outline"
                className="flex items-center gap-2 text-green-700 hover:bg-green-50"
              >
                <Smartphone className="w-4 h-4" />
                SMS
              </Button>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="space-y-2">
              <Label>QR Code</Label>
              <div className="flex justify-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Patients can scan this QR code to access the assessment
              </p>
            </div>
          )}

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <Textarea
              value={`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`}
              readOnly
              rows={3}
              className="text-xs font-mono"
            />
            <p className="text-xs text-gray-500">
              Copy this code to embed the assessment on your website
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
