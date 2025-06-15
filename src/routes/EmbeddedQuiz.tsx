
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

  // Get source tracking parameters
  const source = searchParams.get('source') || searchParams.get('utm_source') || 'direct';
  const medium = searchParams.get('medium') || searchParams.get('utm_medium') || 'web';
  const campaign = searchParams.get('campaign') || searchParams.get('utm_campaign') || 'quiz_share';
  const doctorId = searchParams.get('doctor') || undefined;

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizType) {
        setLoading(false);
        return;
      }

      try {
        // Check if it's a custom quiz
        if (quizType.startsWith('custom_')) {
          const customQuizId = quizType.replace('custom_', '');
          const { data, error } = await supabase
            .from('custom_quizzes')
            .select('*')
            .eq('id', customQuizId)
            .single();
          
          if (!error && data) {
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
          const standardQuiz = Object.values(quizzes).find(
            quiz => quiz.id.toLowerCase() === quizType.toLowerCase()
          );
          
          if (standardQuiz) {
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
          }
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
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

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-teal-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Not Found</h2>
            <p className="text-gray-600 mb-6">The requested assessment could not be found.</p>
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
