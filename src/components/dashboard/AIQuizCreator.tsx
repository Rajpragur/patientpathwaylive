
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Copy, Wand2, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { quizzes } from '@/data/quizzes';

interface AIQuizCreatorProps {
  onQuizCreated?: (quiz: any) => void;
}

export function AIQuizCreator({ onQuizCreated }: AIQuizCreatorProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    baseQuizId: '',
    customPrompt: ''
  });
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  const handleGenerate = async () => {
    if (!formData.title || !formData.customPrompt) {
      toast.error('Please fill in title and description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/functions/v1/ai-quiz-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          baseQuizId: formData.baseQuizId || null,
          customPrompt: formData.customPrompt,
          quizTitle: formData.title,
          quizDescription: formData.description
        })
      });

      const result = await response.json();
      setGeneratedQuiz(result);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuiz || !user) return;

    setIsSaving(true);
    try {
      // Get doctor profile
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorProfile) {
        toast.error('Doctor profile not found');
        return;
      }

      const { data, error } = await supabase
        .from('custom_quizzes')
        .insert({
          title: formData.title,
          description: formData.description,
          questions: generatedQuiz.questions,
          max_score: generatedQuiz.maxScore,
          scoring: generatedQuiz.scoring,
          doctor_id: doctorProfile.id,
          category: 'custom'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Quiz saved successfully!');
      onQuizCreated?.(data);
      
      // Reset form
      setFormData({ title: '', description: '', baseQuizId: '', customPrompt: '' });
      setGeneratedQuiz(null);
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-500" />
            AI Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Quiz Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            <Select 
              value={formData.baseQuizId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, baseQuizId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Base Quiz (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None - Create from scratch</SelectItem>
                {Object.values(quizzes).map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    <div className="flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      {quiz.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Quiz Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <Textarea
            placeholder="Describe the type of quiz you want to create (e.g., 'Create a 15-question assessment for sleep disorders with mild, moderate, and severe scoring levels')"
            value={formData.customPrompt}
            onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
            rows={4}
          />

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="w-full"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </Button>
        </CardContent>
      </Card>

      {generatedQuiz && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Quiz Preview
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Quiz'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {generatedQuiz.questions?.length || 0} Questions
                </Badge>
                <Badge variant="secondary">
                  Max Score: {generatedQuiz.maxScore || 0}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedQuiz.questions?.map((question: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.text}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {question.options?.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
