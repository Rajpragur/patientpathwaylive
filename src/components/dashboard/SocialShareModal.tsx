
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageSquare,
  Mail,
  Copy,
  Send
} from 'lucide-react';
import { Lead } from '@/types/quiz';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export function SocialShareModal({ isOpen, onClose, lead }: SocialShareModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const platforms = [
    { name: 'SMS', icon: MessageSquare, color: '#10B981' },
    { name: 'Email', icon: Mail, color: '#3B82F6' },
    { name: 'Facebook', icon: Facebook, color: '#1877F2' },
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5' }
  ];

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const shareToSocial = async () => {
    if (!selectedPlatforms.length) {
      toast.error('Please select at least one platform');
      return;
    }

    setLoading(true);
    try {
      // Call edge function to handle social sharing
      const { data, error } = await supabase.functions.invoke('share-lead', {
        body: {
          lead_id: lead.id,
          platforms: selectedPlatforms,
          message,
          lead_data: {
            name: lead.name,
            quiz_type: lead.quiz_type,
            score: lead.score,
            email: lead.email,
            phone: lead.phone
          }
        }
      });

      if (error) throw error;

      toast.success('Lead shared successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to share lead');
    } finally {
      setLoading(false);
    }
  };

  const copyLeadInfo = () => {
    const leadInfo = `
Lead Information:
Name: ${lead.name}
Assessment: ${lead.quiz_type}
Score: ${lead.score}
Email: ${lead.email || 'Not provided'}
Phone: ${lead.phone || 'Not provided'}
Date: ${new Date(lead.created_at).toLocaleDateString()}
    `.trim();

    navigator.clipboard.writeText(leadInfo);
    toast.success('Lead information copied to clipboard');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{lead.name}</h4>
                  <p className="text-sm text-gray-600">{lead.quiz_type} Assessment</p>
                  <p className="text-sm text-gray-600">Score: {lead.score}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyLeadInfo}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.name);
                
                return (
                  <button
                    key={platform.name}
                    onClick={() => togglePlatform(platform.name)}
                    className={`p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: platform.color }} />
                      <span className="text-sm">{platform.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
            <Textarea
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={shareToSocial} disabled={loading} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
