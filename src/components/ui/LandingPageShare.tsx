import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  MessageSquare, 
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface LandingPageShareProps {
  url: string;
  title: string;
  description: string;
  doctorName: string;
  quizType: string;
}

export function LandingPageShare({ url, title, description, doctorName, quizType }: LandingPageShareProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSocialShare = (platform: string) => {
    try {
      const message = encodeURIComponent(`${title} - ${description}`);
      let socialUrl = '';

      switch (platform) {
        case 'facebook':
          socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${message}`;
          break;
        case 'twitter':
          socialUrl = `https://twitter.com/intent/tweet?text=${message}&url=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${message}`;
          break;
        case 'email':
          socialUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${message}%0A%0A${encodeURIComponent(url)}`;
          break;
        case 'sms':
          socialUrl = `sms:?&body=${message}%20${encodeURIComponent(url)}`;
          break;
        case 'tiktok':
          // TikTok doesn't have a direct share URL, so we copy the link and open TikTok
          handleTikTokShare();
          return;
        default:
          toast.error('Unsupported platform');
          return;
      }
      
      if (socialUrl) {
        window.open(socialUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error in handleSocialShare:', error);
      toast.error('Failed to share. Please try again.');
    }
  };

  const handleTikTokShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard! Please paste it in TikTok to share.');
      // Open TikTok in a new tab
      window.open('https://www.tiktok.com/', '_blank', 'width=600,height=400,noopener,noreferrer');
    } catch (clipboardError) {
      console.error("Could not copy text: ", clipboardError);
      toast.error('Could not copy link. Please copy it manually.');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Could not copy text: ", error);
      toast.error('Failed to copy link to clipboard.');
    }
  };

  const shareOptions = [
    { name: 'Facebook', icon: Facebook, color: '#1877F2', action: () => handleSocialShare('facebook') },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2', action: () => handleSocialShare('twitter') },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5', action: () => handleSocialShare('linkedin') },
    { name: 'TikTok', icon: Share2, color: '#000000', action: () => handleSocialShare('tiktok') },
    { name: 'Email', icon: Mail, color: '#EA4335', action: () => handleSocialShare('email') },
    { name: 'SMS', icon: MessageSquare, color: '#25D366', action: () => handleSocialShare('sms') },
  ];

  return (
    <div className="relative">
      <Button
        onClick={() => setShowShareOptions(!showShareOptions)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Share This Page
      </Button>

      {showShareOptions && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[280px] z-50">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-900 mb-1">Share {quizType} Assessment</h3>
            <p className="text-sm text-gray-600">Help others discover {doctorName}'s expertise</p>
          </div>
          
          {/* Social Media Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                title={`Share on ${option.name}`}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: option.color }}
                >
                  <option.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-700 font-medium">{option.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="min-w-[80px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Share this link with friends and family
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setShowShareOptions(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
