import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OutlookCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  console.log('OutlookCallback component loaded');
  console.log('Search params:', Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      console.log('Handling Outlook OAuth callback:', { code, error });

      if (error) {
        console.error('OAuth error:', error);
        toast.error('Failed to connect Outlook account');
        navigate('/portal?tab=email');
        return;
      }

      if (code) {
        try {
          // In a real implementation, you would exchange the code for tokens
          // For now, we'll just show a success message
          console.log('OAuth code received:', code);
          toast.success('Outlook account connected successfully!');
          
          // Redirect back to the portal email tab
          navigate('/portal?tab=email');
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          toast.error('Failed to process Outlook connection');
          navigate('/portal?tab=email');
        }
      } else {
        console.log('No code or error found in URL');
        // Redirect back to portal even if no code
        navigate('/portal?tab=email');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Connecting your Outlook account...</p>
      </div>
    </div>
  );
}
