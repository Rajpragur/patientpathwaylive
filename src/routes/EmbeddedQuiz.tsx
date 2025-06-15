
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import EmbeddedChatBot from '@/components/quiz/EmbeddedChatBot';
import { QuizType } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { quizzes } from '@/data/quizzes';

export function EmbeddedQuiz() {
  const { quizType } = useParams<{ quizType: QuizType }>();
  const [searchParams] = useSearchParams();
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get source tracking parameters
  const source = searchParams.get('source') || searchParams.get('utm_source') || 'direct';
  const medium = searchParams.get('medium') || searchParams.get('utm_medium') || 'web';
  const campaign = searchParams.get('campaign') || searchParams.get('utm_campaign') || 'quiz_share';
  const doctorId = searchParams.get('doctor') || undefined;

  console.log('EmbeddedQuiz - quizType:', quizType);
  console.log('EmbeddedQuiz - tracking params:', { source, medium, campaign, doctorId });

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizType) {
        setError('No quiz type provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching quiz data for type:', quizType);
        
        // Check if it's a custom quiz
        if (quizType.startsWith('custom_')) {
          const customQuizId = quizType.replace('custom_', '');
          console.log('Fetching custom quiz with ID:', customQuizId);
          
          const { data, error } = await supabase
            .from('custom_quizzes')
            .select('*')
            .eq('id', customQuizId)
            .single();
          
          if (error) {
            console.error('Error fetching custom quiz:', error);
            setError('Custom quiz not found');
          } else if (data) {
            console.log('Custom quiz data:', data);
            setQuizData({
              id: data.id,
              title: data.title,
              description: data.description,
              questions: data.questions,
              maxScore: data.max_score,
              scoring: data.scoring,
              isCustom: true,
              source,
              medium,
              campaign,
              doctorId
            });
          }
        } else {
          // For standard quizzes, use the data from quizzes object
          console.log('Searching for standard quiz:', quizType);
          console.log('Available quizzes:', Object.keys(quizzes));
          
          const standardQuiz = Object.values(quizzes).find(
            quiz => quiz.id.toLowerCase() === quizType.toLowerCase()
          );
          
          if (standardQuiz) {
            console.log('Found standard quiz:', standardQuiz);
            setQuizData({
              id: standardQuiz.id,
              title: standardQuiz.title,
              description: standardQuiz.description,
              questions: standardQuiz.questions,
              maxScore: standardQuiz.maxScore,
              isCustom: false,
              source,
              medium,
              campaign,
              doctorId
            });
          } else {
            console.error('Standard quiz not found for type:', quizType);
            setError('Quiz not found');
          }
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizType, source, medium, campaign, doctorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested assessment could not be found.'}</p>
            <p className="text-sm text-gray-500">Quiz Type: {quizType}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
      <EmbeddedChatBot 
        quizType={quizType || 'default'} 
        quizData={quizData}
        doctorId={doctorId}
      />
    </div>
  );
}
