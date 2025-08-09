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
        .select('doctor_id')
        .eq('short_id', shortId)
        .single();

      if (error || !data) {
        navigate('/404');
        return;
      }
      navigate(`/share/nose/${data.doctor_id}`);
    };

    fetchAndRedirect();
  }, [shortId, navigate]);

  return <p>Redirecting…</p>;
}