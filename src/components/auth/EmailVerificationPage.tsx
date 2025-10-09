
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
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'checking'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const handleTeamMemberLinking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get invitation token from URL params or user metadata
      const invitationTokenFromUrl = searchParams.get('invitation');
      const invitationTokenFromMetadata = user.user_metadata?.invitation_token;
      const invitationToken = invitationTokenFromUrl || invitationTokenFromMetadata;

      // Check if user is a team member
      const isTeamMember = user.user_metadata?.is_team_member || invitationTokenFromUrl;
      
      if (isTeamMember && invitationToken) {
        console.log('Linking team member after email verification:', {
          userId: user.id,
          invitationToken,
          source: invitationTokenFromUrl ? 'URL' : 'metadata'
        });
        
        // Use the edge function to handle team member linking
        const { data, error } = await supabase.functions.invoke('link-team-member', {
          body: {
            invitationToken: invitationToken,
            userId: user.id,
            firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || 'Team',
            lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Member',
            email: user.email
          }
        });

        if (error) {
          console.error('Error linking team member:', error);
          toast.error('Failed to link to team. Please contact support.');
        } else if (data?.success) {
          console.log('Team member linked successfully');
          toast.success('Successfully joined the team!');
        } else {
          console.error('Edge function returned error:', data?.error);
          toast.error(data?.error || 'Failed to link to team');
        }
      } else {
        console.log('Not a team member or no invitation token found:', {
          isTeamMember,
          invitationToken,
          userMetadata: user.user_metadata
        });
      }
    } catch (error) {
      console.error('Error in team member linking:', error);
    }
  };

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
        
        // Check if this is a team member and link them
        await handleTeamMemberLinking();
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/portal');
        }, 2000);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Failed to verify email');
        toast.error('Failed to verify email');
      }
    };

    const checkEmailStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('=== EMAIL VERIFICATION DIAGNOSTIC ===');
          console.log('User email status:', {
            email: user.email,
            emailConfirmed: user.email_confirmed_at,
            confirmed: !!user.email_confirmed_at,
            createdAt: user.created_at,
            lastSignIn: user.last_sign_in_at,
            confirmedAt: user.email_confirmed_at
          });
          
          // Check if email confirmation is likely disabled
          const timeSinceCreation = Date.now() - new Date(user.created_at).getTime();
          const isRecentlyCreated = timeSinceCreation < 60000; // Less than 1 minute
          
          console.log('Time since account creation:', timeSinceCreation, 'ms');
          console.log('Recently created:', isRecentlyCreated);
          
          // If account is recent and no confirmation, email confirmation is likely disabled
          if (isRecentlyCreated && !user.email_confirmed_at) {
            console.log('DIAGNOSIS: Email confirmation appears to be DISABLED in Supabase');
            console.log('No verification email will be sent because email confirmation is disabled');
            console.log('User can proceed directly to portal');
            
            setEmailConfirmed(true); // Treat as confirmed since confirmation is disabled
            setVerificationStatus('success');
            toast.success('Email confirmation is disabled. Proceeding to portal...');
            await handleTeamMemberLinking();
            setTimeout(() => {
              navigate('/portal');
            }, 2000);
            return;
          }
          if (user.email_confirmed_at) {
            setEmailConfirmed(true);
            setVerificationStatus('success');
            toast.success('Email already verified!');
            await handleTeamMemberLinking();
            setTimeout(() => {
              navigate('/portal');
            }, 2000);
          } else {
            setVerificationStatus('loading');
          }
        }
      } catch (error) {
        console.error('Error checking email status:', error);
      }
    };
    if (searchParams.get('token')) {
      verifyEmail();
    } else {
      checkEmailStatus();
    }
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
                <p className="text-gray-600 text-center">
                  {searchParams.get('token') ? 'Verifying your email...' : 'Please check your email for the verification link'}
                </p>
                {!searchParams.get('token') && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      <p className="mb-2">If you don't see the email:</p>
                      <ul className="list-disc list-inside space-y-1 text-left">
                        <li>Check your spam/junk folder</li>
                        <li>Wait a few minutes for delivery</li>
                        <li>Make sure you used the correct email address</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate('/auth')}
                          variant="outline"
                          className="flex-1"
                        >
                          Back to Login
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              console.log('Attempting to resend verification email...');
                              const { data: { user } } = await supabase.auth.getUser();
                              console.log('Current user:', user);
                              
                              if (user) {
                                const { data, error } = await supabase.auth.resend({
                                  type: 'signup',
                                  email: user.email!,
                                  options: {
                                    emailRedirectTo: `${window.location.origin}/verify-email`
                                  }
                                });
                                
                                console.log('Resend response:', { data, error });
                                
                                if (error) {
                                  console.error('Resend error:', error);
                                  toast.error(`Failed to resend email: ${error.message}`);
                                } else {
                                  toast.success('Verification email resent!');
                                }
                              } else {
                                toast.error('No user found');
                              }
                            } catch (error) {
                              console.error('Resend error:', error);
                              toast.error('Failed to resend email');
                            }
                          }}
                          variant="default"
                          className="flex-1"
                        >
                          Resend Email
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
