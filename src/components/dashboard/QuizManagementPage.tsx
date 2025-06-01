
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Edit, Copy, Bot, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { quizzes } from '@/data/quizzes';
import { CustomQuizCreator } from './CustomQuizCreator';

export function QuizManagementPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('existing');
  const [selectedBaseQuiz, setSelectedBaseQuiz] = useState<string>('');

  const handleShareQuiz = (quizId: string) => {
    navigate(`/portal/share/${quizId}`);
  };

  const handleCopyQuiz = (quizId: string) => {
    setSelectedBaseQuiz(quizId);
    setActiveTab('custom');
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
                      onClick={() => handleShareQuiz(quiz.id)}
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
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <CustomQuizCreator baseQuizId={selectedBaseQuiz} onQuizCreated={() => setActiveTab('existing')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
