import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ShortLinkRedirect() {
  const { shortId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndRedirect = async () => {
      const { data, error } = await supabase
        .from('link_mappings')
        .select('doctor_id, quiz_type')
        .eq('short_id', shortId)
        .single();

      if (error || !data) {
        navigate('/404');
        return;
      }
      
      // Determine the correct quiz route based on quiz_type
      const quizType = data.quiz_type || 'nose';
      navigate(`/share/${quizType}/${data.doctor_id}`);
    };

    fetchAndRedirect();
  }, [shortId, navigate]);

  return <p>Redirecting…</p>;
}