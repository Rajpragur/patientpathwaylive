import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  QrCode, 
  Mail, 
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Edit,
  Eye,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface QuizShareData {
  id: string;
  name: string;
  description: string;
  shareUrl: string;
  embedCode: string;
  category: string;
}

export function ShareAssessmentsPage() {
  const { user } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<QuizShareData[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizShareData | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    fetchDoctorProfile();
    loadQuizzes();
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

  const loadQuizzes = () => {
    const baseUrl = window.location.origin;
    const doctorId = doctorProfile?.id || 'demo';
    
    const quizData: QuizShareData[] = [
      {
        id: 'nose',
        name: 'NOSE Assessment',
        description: 'Nasal Obstruction Symptom Evaluation',
        shareUrl: `${baseUrl}/quiz/nose?doctor=${doctorId}`,
        embedCode: `<iframe src="${baseUrl}/embed/quiz?type=NOSE&doctor=${doctorId}" width="100%" height="600px" frameborder="0"></iframe>`,
        category: 'ENT'
      },
      {
        id: 'dhi',
        name: 'DHI Assessment',
        description: 'Dizziness Handicap Inventory',
        shareUrl: `${baseUrl}/quiz/dhi?doctor=${doctorId}`,
        embedCode: `<iframe src="${baseUrl}/embed/quiz?type=DHI&doctor=${doctorId}" width="100%" height="600px" frameborder="0"></iframe>`,
        category: 'ENT'
      },
      {
        id: 'epworth',
        name: 'Epworth Sleepiness Scale',
        description: 'Assess daytime sleepiness',
        shareUrl: `${baseUrl}/quiz/epworth?doctor=${doctorId}`,
        embedCode: `<iframe src="${baseUrl}/embed/quiz?type=EPWORTH&doctor=${doctorId}" width="100%" height="600px" frameborder="0"></iframe>`,
        category: 'Sleep'
      },
      {
        id: 'hhia',
        name: 'HHIA Assessment',
        description: 'Hearing Handicap Inventory for Adults',
        shareUrl: `${baseUrl}/quiz/hhia?doctor=${doctorId}`,
        embedCode: `<iframe src="${baseUrl}/embed/quiz?type=HHIA&doctor=${doctorId}" width="100%" height="600px" frameborder="0"></iframe>`,
        category: 'Audiology'
      },
      {
        id: 'snot22',
        name: 'SNOT-22 Assessment',
        description: 'Sino-Nasal Outcome Test',
        shareUrl: `${baseUrl}/quiz/snot22?doctor=${doctorId}`,
        embedCode: `<iframe src="${baseUrl}/embed/quiz?type=SNOT22&doctor=${doctorId}" width="100%" height="600px" frameborder="0"></iframe>`,
        category: 'ENT'
      },
      {
        id: 'stop',
        name: 'STOP Assessment',
        description: 'Sleep Apnea Screening',
        shareUrl: `${baseUrl}/quiz/stop?doctor=${doctorId}`,
        embedCode: `<iframe src="${baseUrl}/embed/quiz?type=STOP&doctor=${doctorId}" width="100%" height="600px" frameborder="0"></iframe>`,
        category: 'Sleep'
      },
      {
        id: 'tnss',
        name: 'TNSS Assessment',
        description: 'Total Nasal Symptom Score',
        shareUrl: `${baseUrl}/quiz/tnss?doctor=${doctorId}`,
        embedCode: `<iframe src="${baseUrl}/embed/quiz?type=TNSS&doctor=${doctorId}" width="100%" height="600px" frameborder="0"></iframe>`,
        category: 'ENT'
      }
    ];
    
    setQuizzes(quizData);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const shareViaEmail = (quiz: QuizShareData) => {
    const subject = encodeURIComponent(`${quiz.name} - Health Assessment`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like you to complete this health assessment: ${quiz.name}\n\n${customMessage}\n\nClick here to start: ${quiz.shareUrl}\n\nBest regards`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = (quiz: QuizShareData) => {
    const message = encodeURIComponent(
      `Please complete this health assessment: ${quiz.name}. ${customMessage} ${quiz.shareUrl}`
    );
    window.open(`sms:?body=${message}`);
  };

  const shareViaSocial = (platform: string, quiz: QuizShareData) => {
    const text = encodeURIComponent(`Complete this health assessment: ${quiz.name}`);
    const url = encodeURIComponent(quiz.shareUrl);
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const doctorId = doctorProfile?.id || 'demo';
  const noseLandingUrl = `${window.location.origin}/share/nose/${doctorId}`;
  const noseEditorUrl = `${window.location.origin}/nose-editor/${doctorId}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Share Assessments</h1>
      </div>

      {/* NOSE Landing Page Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            NOSE Landing Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Share your personalized NOSE assessment landing page with patients. 
            The page includes your practice information, treatment options, and an embedded quiz.
          </p>
          
          <div className="flex gap-2">
            <Input
              value={noseLandingUrl}
              readOnly
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(noseLandingUrl, 'Landing page URL')}
              title="Copy URL"
            >
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.open(noseLandingUrl, '_blank')}
              title="View Landing Page"
            >
              <Eye className="w-4 h-4 mr-1" /> View
            </Button>
            <Button
              variant="default"
              onClick={() => window.open(noseEditorUrl, '_blank')}
              title="Edit Landing Page"
            >
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• AI-generated content personalized to your practice</li>
              <li>• Embedded NOSE assessment quiz</li>
              <li>• Chatbot that appears after 30 seconds</li>
              <li>• Customizable testimonials and treatment information</li>
              <li>• Mobile-responsive design</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Add a personal message to include when sharing (optional)"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{quiz.name}</CardTitle>
                <Badge variant="outline">{quiz.category}</Badge>
              </div>
              <p className="text-sm text-gray-600">{quiz.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Share URL */}
              <div>
                <label className="text-sm font-medium">Share Link:</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={quiz.shareUrl}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(quiz.shareUrl, 'Link')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <label className="text-sm font-medium">Embed Code:</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={quiz.embedCode}
                    readOnly
                    className="text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(quiz.embedCode, 'Embed code')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    setShowQRCode(true);
                  }}
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  QR Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareViaEmail(quiz)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareViaSMS(quiz)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  SMS
                </Button>
              </div>

              {/* Social Media Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareViaSocial('facebook', quiz)}
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareViaSocial('twitter', quiz)}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareViaSocial('linkedin', quiz)}
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>

              {/* Preview Button */}
              <Button
                className="w-full"
                onClick={() => window.open(quiz.shareUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Modal */}
      {showQRCode && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>QR Code - {selectedQuiz.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG value={selectedQuiz.shareUrl} size={200} />
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code to access the assessment
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // Download QR code as image
                    const svg = document.querySelector('svg');
                    if (svg) {
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx?.drawImage(img, 0, 0);
                        const pngFile = canvas.toDataURL('image/png');
                        const downloadLink = document.createElement('a');
                        downloadLink.download = `${selectedQuiz.name}-QR.png`;
                        downloadLink.href = pngFile;
                        downloadLink.click();
                      };
                      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                    }
                  }}
                  className="flex-1"
                >
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}