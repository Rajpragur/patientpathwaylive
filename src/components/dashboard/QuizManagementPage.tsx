
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Share, BarChart3, Globe, Code, MessageCircle, Printer, Mail, MessageSquare, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { quizzes } from '@/data/quizzes';

interface SharedQuiz {
  id: string;
  quiz_type: string;
  share_key: string;
  created_at: string;
  total_responses: number;
}

export function QuizManagementPage() {
  const { user } = useAuth();
  const [sharedQuizzes, setSharedQuizzes] = useState<SharedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSharedQuizzes();
    }
  }, [user]);

  const fetchSharedQuizzes = async () => {
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (doctorProfile) {
        const { data: leads } = await supabase
          .from('quiz_leads')
          .select('quiz_type, share_key, created_at')
          .eq('doctor_id', doctorProfile.id)
          .not('share_key', 'is', null);

        const quizStats = leads?.reduce((acc: any, lead) => {
          const key = `${lead.quiz_type}-${lead.share_key}`;
          if (!acc[key]) {
            acc[key] = {
              id: lead.share_key,
              quiz_type: lead.quiz_type,
              share_key: lead.share_key,
              created_at: lead.created_at,
              total_responses: 0
            };
          }
          acc[key].total_responses++;
          return acc;
        }, {});

        setSharedQuizzes(Object.values(quizStats || {}));
      }
    } catch (error) {
      console.error('Error fetching shared quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareKey = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateShareLink = (quizType: string, option: string) => {
    const shareKey = generateShareKey();
    const baseUrl = window.location.origin;
    
    switch (option) {
      case 'new-page':
        return `${baseUrl}/quiz?type=${quizType}&key=${shareKey}&mode=single`;
      case 'embed':
        return `<iframe src="${baseUrl}/quiz?type=${quizType}&key=${shareKey}&mode=embed" width="100%" height="600" frameborder="0"></iframe>`;
      case 'chat-embed':
        return `<script src="${baseUrl}/chat-widget.js" data-quiz="${quizType}" data-key="${shareKey}"></script>`;
      default:
        return `${baseUrl}/quiz?type=${quizType}&key=${shareKey}&mode=single`;
    }
  };

  const handleShareOption = async (quizType: string, option: string) => {
    const shareLink = generateShareLink(quizType, option);
    
    if (option === 'qr-code') {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateShareLink(quizType, 'new-page'))}`;
      window.open(qrUrl, '_blank');
      return;
    }

    if (option === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generateShareLink(quizType, 'new-page'))}`;
      window.open(facebookUrl, '_blank');
      return;
    }

    if (option === 'email') {
      const emailSubject = `Take the ${quizzes[quizType as keyof typeof quizzes]?.title} Assessment`;
      const emailBody = `Please take this medical assessment: ${generateShareLink(quizType, 'new-page')}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      return;
    }

    if (option === 'sms') {
      const smsBody = `Please take this medical assessment: ${generateShareLink(quizType, 'new-page')}`;
      window.location.href = `sms:?body=${encodeURIComponent(smsBody)}`;
      return;
    }

    if (option === 'print') {
      const printContent = `
        <h1>${quizzes[quizType as keyof typeof quizzes]?.title} Assessment</h1>
        <p>Access the assessment at: ${generateShareLink(quizType, 'new-page')}</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateShareLink(quizType, 'new-page'))}" />
      `;
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(printContent);
      printWindow?.print();
      return;
    }

    await navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
    setSelectedQuiz(null);
  };

  const ShareOptionsDialog = ({ quizType }: { quizType: string }) => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Share {quizzes[quizType as keyof typeof quizzes]?.title}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'new-page')}
        >
          <Globe className="w-6 h-6" />
          <span className="text-xs">New Page</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'embed')}
        >
          <Code className="w-6 h-6" />
          <span className="text-xs">Embed Code</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'chat-embed')}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chat Widget</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'print')}
        >
          <Printer className="w-6 h-6" />
          <span className="text-xs">Print</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'facebook')}
        >
          <Share className="w-6 h-6" />
          <span className="text-xs">Facebook</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'qr-code')}
        >
          <QrCode className="w-6 h-6" />
          <span className="text-xs">QR Code</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'email')}
        >
          <Mail className="w-6 h-6" />
          <span className="text-xs">Email</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col gap-2 transition-all duration-200 hover:scale-105"
          onClick={() => handleShareOption(quizType, 'sms')}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-xs">Text/SMS</span>
        </Button>
      </div>
    </DialogContent>
  );

  if (loading) {
    return <div className="p-6">Loading quiz management...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quiz Management
          </h1>
          <p className="text-gray-600 mt-2">Create and share medical assessments with patients</p>
        </div>
      </div>

      {/* Available Quizzes */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-700">Available Medical Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(quizzes).map((quiz) => (
              <Dialog key={quiz.id}>
                <DialogTrigger asChild>
                  <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-blue-600">{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                      <p className="text-xs text-gray-500 mb-4">{quiz.questions.length} questions</p>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                        size="sm"
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share Assessment
                      </Button>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <ShareOptionsDialog quizType={quiz.id} />
              </Dialog>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shared Quizzes */}
      {sharedQuizzes.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-green-700">Your Shared Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sharedQuizzes.map((sharedQuiz) => {
                const quiz = Object.values(quizzes).find(q => q.id === sharedQuiz.quiz_type);
                return (
                  <div key={sharedQuiz.id} className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{quiz?.title}</h3>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(sharedQuiz.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          {sharedQuiz.total_responses} responses
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-all duration-200 hover:scale-105"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/quiz?type=${sharedQuiz.quiz_type}&key=${sharedQuiz.share_key}&mode=single`);
                          toast.success('Link copied to clipboard!');
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
