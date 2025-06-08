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
import { Plus, Trash2, GripVertical, Save, Eye, ArrowLeft, Bot, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { quizzes } from '@/data/quizzes';

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

interface CustomQuizCreatorProps {
  baseQuizId?: string;
  onQuizCreated?: (quiz: any) => void;
}

export function CustomQuizCreator({ baseQuizId, onQuizCreated }: CustomQuizCreatorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  useEffect(() => {
    if (baseQuizId && !id) {
      loadBaseQuiz();
    }
  }, [baseQuizId, id]);

  const loadBaseQuiz = () => {
    const baseQuiz = quizzes[baseQuizId as keyof typeof quizzes];
    if (baseQuiz) {
      setQuiz(prev => ({
        ...prev,
        title: `${baseQuiz.title} (Copy)`,
        description: baseQuiz.description,
        questions: baseQuiz.questions.map(q => ({
          id: `q_${Date.now()}_${Math.random()}`,
          text: q.text,
          type: 'multiple_choice' as const,
          options: q.options.map((opt, idx) => ({ text: opt, value: idx })),
          required: true
        })),
        scoring: {
          mild_threshold: 25,
          moderate_threshold: 50,
          severe_threshold: 75
        }
      }));
      toast.success(`Loaded ${baseQuiz.title} as base template`);
    }
  };

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
          questions: Array.isArray(quizData.questions) ? (quizData.questions as unknown as CustomQuestion[]) : [],
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

  const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) {
          toast.error('Please enter a prompt for AI generation');
          return;
        }
        setIsGenerating(true);
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Custom Quiz Creator'
            },
            body: JSON.stringify({
              model: 'meta-llama/llama-3.1-8b-instruct:free',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert medical quiz generator. You create high-quality, clinically relevant assessment questions for healthcare professionals. Always respond with valid JSON only, no additional text or explanations.

      Your response must follow this exact JSON structure:
      {
        "title": "Generated Quiz Title",
        "description": "Brief description of the quiz purpose",
        "questions": [
          {
            "text": "Question text here",
            "type": "multiple_choice",
            "options": [
              {"text": "Option 1", "value": 0},
              {"text": "Option 2", "value": 1},
              {"text": "Option 3", "value": 2},
              {"text": "Option 4", "value": 3}
            ]
          }
        ]
      }

      Guidelines:
      - Generate 5-10 relevant questions based on the user's request
      - Each question should have 3-5 answer options
      - Assign appropriate point values (0-4) based on severity/frequency
      - Questions should be clinically accurate and professionally worded
      - Avoid overly obvious answers
      - Ensure questions are unique and non-repetitive
      - Use intermediate difficulty level
      - For Likert scale requests, use type "likert_scale" instead of "multiple_choice"`
                },
                {
                  role: 'user',
                  content: `Generate a medical assessment quiz based on this request: "${aiPrompt}". 
                  
      Context: This is for a custom medical assessment tool used by healthcare professionals. 
      Base quiz context: ${baseQuizId ? `Building upon ${quizzes[baseQuizId as keyof typeof quizzes]?.title || 'selected quiz'}` : 'Creating from scratch'}
      Current quiz title: "${quiz.title || 'New Assessment'}"
      Current description: "${quiz.description || 'Custom medical assessment'}"

      Please generate questions that are:
      1. Medically accurate and relevant
      2. Appropriate for the specified condition/topic
      3. Suitable for scoring and assessment
      4. Professional in tone and language

      Return only the JSON object, no additional text. Also please sort the options by their score (Options which have more points are below and the ones which have least points is above or first)`
                }
              ],
              temperature: 0.7,
              max_tokens: 2000,
              top_p: 0.9
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content;

          if (!aiResponse) {
            throw new Error('No response content received from AI');
          }

          // Parse the JSON response
          let parsedResponse;
          try {
            // Clean the response in case there's any extra text
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : aiResponse;
            parsedResponse = JSON.parse(cleanJson);
          } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            console.error('Raw AI response:', aiResponse);
            throw new Error('Invalid JSON response from AI. Please try again.');
          }

          // Validate the response structure
          if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            throw new Error('Invalid response format: missing questions array');
          }

          // Convert AI response to your quiz format
          const newQuestions = parsedResponse.questions.map((q: any, index: number) => ({
            id: `ai_q_${Date.now()}_${index}`,
            text: q.text,
            type: q.type === 'likert_scale' ? 'likert_scale' : 'multiple_choice',
            options: q.type === 'likert_scale' ? [
              { text: 'Never (0)', value: 0 },
              { text: 'Rarely (1)', value: 1 },
              { text: 'Sometimes (2)', value: 2 },
              { text: 'Often (3)', value: 3 },
              { text: 'Always (4)', value: 4 }
            ] : (Array.isArray(q.options) ? q.options.map((opt: any) => ({
              text: opt.text || opt,
              value: typeof opt.value === 'number' ? opt.value : 0
            })) : []),
            required: true
          }));

          // Update the quiz state
          setQuiz(prev => ({
            ...prev,
            title: parsedResponse.title || prev.title || 'AI Generated Quiz',
            description: parsedResponse.description || prev.description || 'Generated with AI assistance',
            questions: [...prev.questions, ...newQuestions]
          }));

          toast.success(`Successfully generated ${newQuestions.length} questions!`);
          setAiPrompt('');
          setShowAIHelper(false);

        } catch (error) {
          console.error('Error generating with AI:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to generate questions with AI');
        } finally {
          setIsGenerating(false);
        }
      };


  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'likert_scale', label: 'Slider (Likert Scale 0-4)' }
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
        const { data, error } = await supabase
          .from('custom_quizzes')
          .insert([quizData])
          .select()
          .single();

        if (error) throw error;
        toast.success('Custom quiz saved successfully!');
        onQuizCreated?.(data);
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
    toast.success(`Quiz Preview: Max Score ${maxScore}, Thresholds: Mild(${quiz.scoring.mild_threshold}%), Moderate(${quiz.scoring.moderate_threshold}%), Severe(${quiz.scoring.severe_threshold}%)`);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Custom Assessment' : 'Create Custom Assessment'}
            </h1>
            <p className="text-gray-600 mt-2">
              {baseQuizId ? `Based on ${quizzes[baseQuizId as keyof typeof quizzes]?.title || 'selected quiz'}` : 'Build your own medical assessment questionnaire'}
            </p>
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

        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add Question
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAIHelper(!showAIHelper)}
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Helper
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAIHelper && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="text-sm font-medium text-gray-700 mb-2 block">AI Question Generator</label>
                <Textarea
                  placeholder="Describe the questions you want to add (e.g., 'Add 5 questions about sleep quality with severity levels')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full mb-2"
                  rows={2}
                />
                <Button 
                  onClick={handleAIGenerate} 
                  disabled={isGenerating}
                  size="sm"
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </Button>
              </div>
            )}

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

            <Button onClick={addQuestion} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      </div>

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
