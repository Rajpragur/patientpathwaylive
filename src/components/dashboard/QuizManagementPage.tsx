
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Share, Eye, BarChart3 } from 'lucide-react';
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

  const shareQuiz = async (quizType: string) => {
    try {
      const shareKey = generateShareKey();
      const shareUrl = `${window.location.origin}/quiz?type=${quizType}&key=${shareKey}`;
      
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Quiz link copied to clipboard!');
      
      // Add to shared quizzes list
      setSharedQuizzes(prev => [...prev, {
        id: shareKey,
        quiz_type: quizType,
        share_key: shareKey,
        created_at: new Date().toISOString(),
        total_responses: 0
      }]);
    } catch (error) {
      console.error('Error sharing quiz:', error);
      toast.error('Failed to generate share link');
    }
  };

  const copyShareLink = async (quizType: string, shareKey: string) => {
    try {
      const shareUrl = `${window.location.origin}/quiz?type=${quizType}&key=${shareKey}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return <div className="p-6">Loading quiz management...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quiz Management</h1>
          <p className="text-gray-600">Create shareable links for your medical assessments</p>
        </div>
      </div>

      {/* Available Quizzes */}
      <Card>
        <CardHeader>
          <CardTitle>Available Medical Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(quizzes).map((quiz) => (
              <Card key={quiz.id} className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                  <p className="text-xs text-gray-500 mb-3">{quiz.questions.length} questions</p>
                  <Button 
                    onClick={() => shareQuiz(quiz.id)}
                    className="w-full"
                    size="sm"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Generate Share Link
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shared Quizzes */}
      {sharedQuizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Shared Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sharedQuizzes.map((sharedQuiz) => {
                const quiz = Object.values(quizzes).find(q => q.id === sharedQuiz.quiz_type);
                return (
                  <div key={sharedQuiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{quiz?.title}</h3>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(sharedQuiz.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          {sharedQuiz.total_responses} responses
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareLink(sharedQuiz.quiz_type, sharedQuiz.share_key)}
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
