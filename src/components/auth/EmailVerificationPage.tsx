import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'email') {
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link');
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (error) {
          throw error;
        }

        setVerificationStatus('success');
        toast.success('Email verified successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error: any) {
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Failed to verify email');
        toast.error('Failed to verify email');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-blue-600">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {verificationStatus === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-gray-600 text-center">Verifying your email...</p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="text-gray-600 text-center">Your email has been verified successfully!</p>
                <p className="text-sm text-gray-500 text-center">Redirecting you to the dashboard...</p>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <XCircle className="w-12 h-12 text-red-500" />
                <p className="text-gray-600 text-center">{errorMessage}</p>
                <Button
                  onClick={() => navigate('/auth')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Return to Login
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 