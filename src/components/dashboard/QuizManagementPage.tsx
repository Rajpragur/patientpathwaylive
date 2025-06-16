import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Edit, Copy, Bot, Wand2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizzes } from '@/data/quizzes';
import { CustomQuizCreator } from './CustomQuizCreator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function QuizManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('existing');
  const [selectedBaseQuiz, setSelectedBaseQuiz] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [customQuizzes, setCustomQuizzes] = useState<any[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDoctorProfileAndQuizzes();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchDoctorProfileAndQuizzes = async () => {
    try {
      setLoadingCustom(true);
      // Fetch doctor profile
      const { data: doctorProfiles } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id);
        
      if (doctorProfiles && doctorProfiles.length > 0) {
        const doctorProfile = doctorProfiles[0];
        setDoctorId(doctorProfile.id);
        
        // Fetch custom quizzes for this doctor
        const { data: quizzesData, error } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('doctor_id', doctorProfile.id)
          .order('created_at', { ascending: false });
          
        if (!error && quizzesData) {
          setCustomQuizzes(quizzesData);
        }
      }
    } catch (error) {
      console.error('Error fetching custom quizzes:', error);
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleShareQuiz = (quizId: string, isCustom = false) => {
    if (isCustom) {
      navigate(`/portal/share/custom/${quizId}`);
    } else {
      navigate(`/portal/share/${quizId}`);
    }
  };

  const handleCopyQuiz = (quizId: string) => {
    setSelectedBaseQuiz(quizId);
    setActiveTab('custom');
  };

  const handleEditCustomQuiz = (quizId: string) => {
    navigate(`/portal/edit-quiz/${quizId}`);
  };

  const handleDeleteCustomQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this custom quiz? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('custom_quizzes')
        .delete()
        .eq('id', quizId);
      if (error) throw error;
      // Refresh list
      fetchDoctorProfileAndQuizzes();
    } catch (err) {
      alert('Failed to delete quiz.');
      console.error(err);
    }
  };

  const predefinedQuizzes = Object.values(quizzes).filter(quiz => quiz && quiz.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600 mt-2">Create, edit, and share your medical assessments</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Quizzes</TabsTrigger>
          <TabsTrigger value="custom">
            <Bot className="w-4 h-4 mr-2" />
            Custom Creator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default quizzes */}
            {predefinedQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <Badge variant="secondary">{quiz.id}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{quiz.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{quiz.questions?.length || 0} Questions</span>
                    <span>•</span>
                    <span>Max Score: {quiz.maxScore || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleShareQuiz(quiz.id, false)}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyQuiz(quiz.id)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy & Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {/* Custom quizzes */}
            {loadingCustom ? (
              <div className="col-span-full text-center py-8">Loading your custom quizzes...</div>
            ) : customQuizzes.length === 0 ? null : customQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {quiz.title}
                      <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">Custom</Badge>
                    </CardTitle>
                    <Badge variant="secondary">{quiz.id}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{quiz.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{quiz.questions?.length || 0} Questions</span>
                    <span>•</span>
                    <span>Max Score: {quiz.max_score || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleShareQuiz(quiz.id, true)}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCustomQuiz(quiz.id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCustomQuiz(quiz.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <CustomQuizCreator baseQuizId={selectedBaseQuiz} onQuizCreated={() => { setActiveTab('existing'); fetchDoctorProfileAndQuizzes(); }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}