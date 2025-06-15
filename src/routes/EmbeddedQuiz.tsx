
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';
import { QuizType } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { quizzes } from '@/data/quizzes';

export function EmbeddedQuiz() {
  const { quizType } = useParams<{ quizType: QuizType }>();
  const [searchParams] = useSearchParams();
  const [quizData, setQuizData] = useState<any>(null);

  useEffect(() => {
    const fetchCustomQuiz = async () => {
      if (!quizType) return;

      // Only fetch for custom quizzes
      if (quizType.startsWith('custom_')) {
        const customQuizId = quizType.replace('custom_', '');
        const { data, error } = await supabase
          .from('custom_quizzes')
          .select('*')
          .eq('id', customQuizId)
          .single();
        
        if (!error && data) {
          // Transform custom quiz data to match expected format
          setQuizData({
            id: data.id,
            title: data.title,
            description: data.description,
            questions: data.questions,
            maxScore: data.max_score,
            scoring: data.scoring,
            isCustom: true
          });
        }
      } else {
        // For standard quizzes, use the data from quizzes object
        const standardQuiz = quizzes[quizType as keyof typeof quizzes];
        if (standardQuiz) {
          setQuizData({
            id: standardQuiz.id,
            title: standardQuiz.title,
            description: standardQuiz.description,
            questions: standardQuiz.questions,
            maxScore: standardQuiz.maxScore,
            isCustom: false
          });
        }
      }
    };

    fetchCustomQuiz();
  }, [quizType]);

  return (
    <>
      {quizData && (
        <EmbeddedChatBot quizType={quizType || 'default'} quizData={quizData} />
      )}
    </>
  );
}
