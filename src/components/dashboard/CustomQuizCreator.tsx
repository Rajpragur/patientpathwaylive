import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Save, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface QuizOption {
  text: string;
  value: number;
}

interface CustomQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'likert_scale' | 'yes_no';
  options: QuizOption[];
  required: boolean;
}

interface CustomQuiz {
  id?: string;
  title: string;
  description: string;
  instructions: string;
  questions: CustomQuestion[];
  scoring: {
    mild_threshold: number;
    moderate_threshold: number;
    severe_threshold: number;
  };
  category: string;
  doctor_id?: string;
}

export function CustomQuizCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [quiz, setQuiz] = useState<CustomQuiz>({
    title: '',
    description: '',
    instructions: '',
    questions: [],
    scoring: {
      mild_threshold: 25,
      moderate_threshold: 50,
      severe_threshold: 75
    },
    category: 'custom'
  });

  const [currentQuestion, setCurrentQuestion] = useState<Partial<CustomQuestion>>({
    text: '',
    type: 'multiple_choice',
    options: [{ text: '', value: 0 }],
    required: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (id && doctorId) {
      setIsEditing(true);
      fetchQuiz();
    }
  }, [id, doctorId]);

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

  const fetchQuiz = async () => {
    try {
      const { data: quizData, error } = await supabase
        .from('custom_quizzes')
        .select('*')
        .eq('id', id)
        .eq('doctor_id', doctorId)
        .single();

      if (error) throw error;

      if (quizData) {
        setQuiz({
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          instructions: quizData.instructions || '',
          questions: Array.isArray(quizData.questions) ? quizData.questions as CustomQuestion[] : [],
          scoring: typeof quizData.scoring === 'object' ? quizData.scoring as any : {
            mild_threshold: 25,
            moderate_threshold: 50,
            severe_threshold: 75
          },
          category: quizData.category || 'custom',
          doctor_id: quizData.doctor_id
        });
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    }
  };

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'likert_scale', label: 'Likert Scale (0-4)' },
    { value: 'yes_no', label: 'Yes/No' }
  ];

  const addOption = () => {
    if (currentQuestion.options && currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...(prev.options || []), { text: '', value: 0 }]
      }));
    } else {
      toast.error('Maximum 6 options allowed');
    }
  };

  const updateOption = (index: number, field: 'text' | 'value', value: string | number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options && currentQuestion.options.length > 1) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: prev.options?.filter((_, i) => i !== index)
      }));
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.text?.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (quiz.questions.length >= 50) {
      toast.error('Maximum 50 questions allowed');
      return;
    }

    if (currentQuestion.type === 'multiple_choice' && 
        (!currentQuestion.options || currentQuestion.options.some(opt => !opt.text.trim()))) {
      toast.error('Please fill all option fields');
      return;
    }

    let finalOptions: QuizOption[] = [];

    if (currentQuestion.type === 'likert_scale') {
      finalOptions = [
        { text: 'Never (0)', value: 0 },
        { text: 'Rarely (1)', value: 1 },
        { text: 'Sometimes (2)', value: 2 },
        { text: 'Often (3)', value: 3 },
        { text: 'Always (4)', value: 4 }
      ];
    } else if (currentQuestion.type === 'yes_no') {
      finalOptions = [
        { text: 'No', value: 0 },
        { text: 'Yes', value: 1 }
      ];
    } else {
      finalOptions = currentQuestion.options?.filter(opt => opt.text.trim()) || [];
    }

    const newQuestion: CustomQuestion = {
      id: `q_${Date.now()}`,
      text: currentQuestion.text,
      type: currentQuestion.type as CustomQuestion['type'],
      required: currentQuestion.required || true,
      options: finalOptions
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset current question
    setCurrentQuestion({
      text: '',
      type: 'multiple_choice',
      options: [{ text: '', value: 0 }],
      required: true
    });

    toast.success('Question added successfully');
  };

  const removeQuestion = (questionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
    toast.success('Question removed');
  };

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = quiz.questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= quiz.questions.length) return;

    const newQuestions = [...quiz.questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];

    setQuiz(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const calculateMaxScore = () => {
    return quiz.questions.reduce((total, question) => {
      const maxValue = Math.max(...question.options.map(opt => opt.value));
      return total + maxValue;
    }, 0);
  };

  const saveQuiz = async () => {
    if (!quiz.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (!quiz.description.trim()) {
      toast.error('Please enter a quiz description');
      return;
    }

    if (quiz.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    if (!doctorId) {
      toast.error('Doctor profile not found');
      return;
    }

    setLoading(true);

    try {
      const maxScore = calculateMaxScore();
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        instructions: quiz.instructions,
        questions: quiz.questions as any,
        scoring: quiz.scoring as any,
        category: quiz.category,
        doctor_id: doctorId,
        max_score: maxScore
      };

      if (isEditing && quiz.id) {
        const { error } = await supabase
          .from('custom_quizzes')
          .update(quizData)
          .eq('id', quiz.id)
          .eq('doctor_id', doctorId);

        if (error) throw error;
        toast.success('Custom quiz updated successfully!');
      } else {
        const { error } = await supabase
          .from('custom_quizzes')
          .insert([quizData]);

        if (error) throw error;
        toast.success('Custom quiz saved successfully!');
      }

      navigate('/portal');
      
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const previewQuiz = () => {
    if (quiz.questions.length === 0) {
      toast.error('Add some questions to preview the quiz');
      return;
    }

    const maxScore = calculateMaxScore();
    const previewData = {
      ...quiz,
      maxScore,
      scoring: quiz.scoring
    };

    console.log('Quiz Preview:', previewData);
    toast.success(`Quiz Preview: Max Score ${maxScore}, Thresholds: Mild(${quiz.scoring.mild_threshold}%), Moderate(${quiz.scoring.moderate_threshold}%), Severe(${quiz.scoring.severe_threshold}%)`);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/portal')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Custom Assessment' : 'Create Custom Assessment'}
            </h1>
            <p className="text-gray-600 mt-2">Build your own medical assessment questionnaire</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={previewQuiz}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveQuiz} disabled={loading} className="bg-[#0E7C9D] hover:bg-[#0E7C9D]/90">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : isEditing ? 'Update Quiz' : 'Save Quiz'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Settings */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Quiz Title *</label>
              <Input
                placeholder="e.g., Custom Sleep Assessment"
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
              <Textarea
                placeholder="Brief description of what this assessment measures..."
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                className="w-full"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Instructions</label>
              <Textarea
                placeholder="Instructions for patients taking this assessment..."
                value={quiz.instructions}
                onChange={(e) => setQuiz(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Scoring Thresholds (% of max score)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Mild %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.scoring.mild_threshold}
                    onChange={(e) => setQuiz(prev => ({
                      ...prev,
                      scoring: { ...prev.scoring, mild_threshold: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Moderate %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.scoring.moderate_threshold}
                    onChange={(e) => setQuiz(prev => ({
                      ...prev,
                      scoring: { ...prev.scoring, moderate_threshold: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Severe %</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.scoring.severe_threshold}
                    onChange={(e) => setQuiz(prev => ({
                      ...prev,
                      scoring: { ...prev.scoring, severe_threshold: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">Questions Added:</span>
              <Badge variant={quiz.questions.length > 0 ? "default" : "secondary"}>
                {quiz.questions.length} / 50
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Max Score:</span>
              <Badge variant="outline">
                {calculateMaxScore()} points
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Add Question */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Add Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Question Text *</label>
              <Textarea
                placeholder="Enter your question..."
                value={currentQuestion.text || ''}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                className="w-full"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Question Type</label>
              <Select 
                value={currentQuestion.type} 
                onValueChange={(value) => setCurrentQuestion(prev => ({ 
                  ...prev, 
                  type: value as CustomQuestion['type'],
                  options: value === 'multiple_choice' ? [{ text: '', value: 0 }] : []
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentQuestion.type === 'multiple_choice' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Answer Options</label>
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      {currentQuestion.options && currentQuestion.options.length > 1 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {currentQuestion.options && currentQuestion.options.length < 6 && (
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
              </div>
            )}

            {currentQuestion.type === 'likert_scale' && (
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                <p className="font-medium mb-2">Likert Scale Options (Auto-generated):</p>
                <ul className="space-y-1">
                  <li>• Never (0 points)</li>
                  <li>• Rarely (1 point)</li>
                  <li>• Sometimes (2 points)</li>
                  <li>• Often (3 points)</li>
                  <li>• Always (4 points)</li>
                </ul>
              </div>
            )}

            {currentQuestion.type === 'yes_no' && (
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                <p className="font-medium mb-2">Yes/No Options (Auto-generated):</p>
                <ul className="space-y-1">
                  <li>• No (0 points)</li>
                  <li>• Yes (1 point)</li>
                </ul>
              </div>
            )}

            <Button onClick={addQuestion} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      {quiz.questions.length > 0 && (
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Questions ({quiz.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                        <Badge variant="outline" className="text-xs">
                          {questionTypes.find(t => t.value === question.type)?.label}
                        </Badge>
                        {question.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{question.text}</p>
                      
                      <div className="flex gap-2 flex-wrap">
                        {question.options.map((option, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {option.text} ({option.value}pts)
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveQuestion(question.id, 'up')}
                        disabled={index === 0}
                      >
                        <GripVertical className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
