
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share, BarChart3, Copy, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { quizzes } from '@/data/quizzes';

interface SharedQuiz {
  id: string;
  quiz_type: string;
  share_key: string;
  created_at: string;
  total_responses: number;
}

interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  questions: any[];
  created_at: string;
  max_score: number;
}

export function QuizManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sharedQuizzes, setSharedQuizzes] = useState<SharedQuiz[]>([]);
  const [customQuizzes, setCustomQuizzes] = useState<CustomQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
      fetchSharedQuizzes();
      fetchCustomQuizzes();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (doctorProfile) {
        setDoctorId(doctorProfile.id);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

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
          .not('share_key', 'is', null)
          .not('name', 'eq', 'Shared Quiz Placeholder');

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

  const fetchCustomQuizzes = async () => {
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (doctorProfile) {
        const { data: customQuizData } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('doctor_id', doctorProfile.id)
          .order('created_at', { ascending: false });

        setCustomQuizzes(customQuizData || []);
      }
    } catch (error) {
      console.error('Error fetching custom quizzes:', error);
    }
  };

  const handleShareQuiz = (quizType: string) => {
    navigate(`/portal/share/${quizType.toLowerCase()}`);
  };

  const handleShareCustomQuiz = (customQuizId: string) => {
    navigate(`/portal/share/custom/${customQuizId}`);
  };

  if (loading) {
    return <div className="p-6">Loading quiz management...</div>;
  }

  // Add null check for quizzes object
  if (!quizzes || typeof quizzes !== 'object') {
    return <div className="p-6">Error loading quizzes. Please refresh the page.</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] bg-clip-text text-transparent">
            Quiz Management
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Create and share medical assessments with patients</p>
        </div>
        <Button 
          onClick={() => navigate('/portal/create-quiz')}
          className="bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Quiz
        </Button>
      </div>

      {/* Custom Quizzes */}
      {customQuizzes.length > 0 && (
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-purple-50 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-700">Your Custom Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customQuizzes.map((quiz) => (
                <Card key={quiz.id} className="border-2 border-purple-200 hover:border-purple-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl bg-white rounded-3xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-purple-700">{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{quiz.description}</p>
                    <p className="text-xs text-gray-500 mb-6">{quiz.questions?.length || 0} questions • Max Score: {quiz.max_score}</p>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 py-3 rounded-2xl"
                        size="sm"
                        onClick={() => handleShareCustomQuiz(quiz.id)}
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/portal/edit-quiz/${quiz.id}`)}
                        className="rounded-2xl"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Standard Quizzes */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl text-[#0E7C9D]">Standard Medical Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.values(quizzes).filter(quiz => quiz && quiz.title).map((quiz) => (
              <Card key={quiz.id} className="border-2 border-blue-200 hover:border-[#0E7C9D] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl bg-white rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-[#0E7C9D]">{quiz.title || 'Untitled Quiz'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{quiz.description || 'No description available'}</p>
                  <p className="text-xs text-gray-500 mb-6">{quiz.questions?.length || 0} questions • 5-10 minutes</p>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 transition-all duration-200 py-3 rounded-2xl"
                    size="sm"
                    onClick={() => handleShareQuiz(quiz.id)}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shared Quizzes */}
      {sharedQuizzes.length > 0 && (
        <Card className="shadow-xl border-0 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700">Your Shared Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sharedQuizzes.map((sharedQuiz) => {
                const quiz = Object.values(quizzes).find(q => q && q.id === sharedQuiz.quiz_type);
                return (
                  <div key={sharedQuiz.id} className="flex items-center justify-between p-6 border rounded-2xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-800">{quiz?.title || 'Unknown Quiz'}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Created: {new Date(sharedQuiz.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1 rounded-xl">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          {sharedQuiz.total_responses} responses
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-all duration-200 hover:scale-105 px-4 py-2 rounded-2xl"
                        onClick={() => {
                          if (doctorId) {
                            const shareUrl = `${window.location.origin}/quiz/${sharedQuiz.quiz_type.toLowerCase()}?key=${sharedQuiz.share_key}&doctor=${doctorId}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success('Link copied to clipboard!');
                          }
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
