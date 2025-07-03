
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Share2, 
  Copy, 
  QrCode, 
  Mail, 
  MessageSquare,
  ExternalLink,
  Edit3,
  Eye,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';

export function ShareAssessmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [baseUrl] = useState(window.location.origin);

  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setDoctorProfile(data);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const shareLinks = [
    {
      id: 'nose',
      title: 'NOSE Assessment Landing Page',
      description: 'Comprehensive landing page for Nasal Airway Obstruction assessment',
      url: `${baseUrl}/share/nose/${doctorProfile?.id || 'demo'}`,
      editUrl: `${baseUrl}/nose-editor/${doctorProfile?.id || 'demo'}`,
      color: 'bg-blue-500'
    },
    {
      id: 'dhi',
      title: 'DHI Assessment',
      description: 'Dizziness Handicap Inventory assessment',
      url: `${baseUrl}/quiz/dhi?doctor=${doctorProfile?.id || 'demo'}`,
      color: 'bg-green-500'
    },
    {
      id: 'epworth',
      title: 'Epworth Sleepiness Scale',
      description: 'Sleep disorder assessment tool',
      url: `${baseUrl}/quiz/epworth?doctor=${doctorProfile?.id || 'demo'}`,
      color: 'bg-purple-500'
    },
    {
      id: 'hhia',
      title: 'HHIA Assessment',
      description: 'Hearing Handicap Inventory for Adults',
      url: `${baseUrl}/quiz/hhia?doctor=${doctorProfile?.id || 'demo'}`,
      color: 'bg-orange-500'
    },
    {
      id: 'snot22',
      title: 'SNOT-22 Assessment',
      description: 'Sino-Nasal Outcome Test',
      url: `${baseUrl}/quiz/snot22?doctor=${doctorProfile?.id || 'demo'}`,
      color: 'bg-red-500'
    },
    {
      id: 'stop',
      title: 'STOP-BANG Assessment',
      description: 'Sleep apnea screening tool',
      url: `${baseUrl}/quiz/stop?doctor=${doctorProfile?.id || 'demo'}`,
      color: 'bg-indigo-500'
    },
    {
      id: 'tnss',
      title: 'TNSS Assessment',
      description: 'Total Nasal Symptom Score',
      url: `${baseUrl}/quiz/tnss?doctor=${doctorProfile?.id || 'demo'}`,
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Share Assessments</h1>
          <p className="text-gray-600 mt-2">Share your medical assessments with patients and track engagement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {shareLinks.map((link) => (
          <Card key={link.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`w-3 h-3 rounded-full ${link.color} mt-1`} />
                <Badge variant="secondary">
                  {link.id.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-lg">{link.title}</CardTitle>
              <p className="text-sm text-gray-600">{link.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={link.url}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(link.url)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(link.url, '_blank')}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                
                {link.editUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(link.editUrl.replace(baseUrl, ''))}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              
              <div className="text-center">
                <QRCode value={link.url} size={80} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special NOSE Landing Page Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle>NOSE Landing Page Editor</CardTitle>
              <p className="text-sm text-gray-600">Customize your NOSE assessment landing page with AI-generated content</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(`/nose-editor/${doctorProfile?.id || 'demo'}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Landing Page
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(`/share/nose/${doctorProfile?.id || 'demo'}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Live Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
