
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { EmailVerificationNotice } from './EmailVerificationNotice';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [invitationInfo, setInvitationInfo] = useState<any>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);

  // Check for invitation token in URL
  useEffect(() => {
    const token = searchParams.get('invitation');
    if (token) {
      setInvitationToken(token);
      checkInvitationToken(token);
    }
  }, [searchParams]);

  const checkInvitationToken = async (token: string) => {
    setLoadingInvitation(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          doctor_profiles!inner(
            first_name,
            last_name,
            clinic_name,
            email
          )
        `)
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        toast.error('Invalid or expired invitation link');
        setInvitationToken(null);
        return;
      }

      if (new Date(data.token_expires_at) < new Date()) {
        toast.error('Invitation link has expired');
        setInvitationToken(null);
        return;
      }

      setInvitationInfo(data);
      toast.success(`You've been invited to join ${data.doctor_profiles.clinic_name || 'the clinic'}`);
    } catch (error) {
      console.error('Error checking invitation:', error);
      toast.error('Failed to verify invitation');
      setInvitationToken(null);
    } finally {
      setLoadingInvitation(false);
    }
  };

  const handleSignUpSuccess = async (email: string) => {
    setUserEmail(email);
    
    // If there's an invitation token, link the team member after signup
    if (invitationToken && invitationInfo) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.functions.invoke('link-team-member', {
            body: {
              invitationToken: invitationToken,
              userId: user.id
            }
          });

          if (error) {
            console.error('Error linking team member:', error);
            toast.error('Failed to link to team. Please contact support.');
          } else {
            toast.success('Successfully joined the team!');
          }
        }
      } catch (error) {
        console.error('Error in team linking:', error);
      }
    }
    
    setShowVerificationNotice(true);
  };

  if (showVerificationNotice) {
    return <EmailVerificationNotice email={userEmail} onBack={() => setShowVerificationNotice(false)} />;
  }

  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-green-50 to-teal-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-green-50 to-teal-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent mb-2">
            Patient Pathway
          </h1>
          <p className="text-gray-600">ENT Medical Assessment Platform</p>
        </div>

        {/* Show invitation info if available */}
        {invitationInfo && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Team Invitation</h3>
            <p className="text-sm text-blue-700">
              You've been invited to join <strong>{invitationInfo.doctor_profiles.clinic_name || 'the clinic'}</strong> by Dr. {invitationInfo.doctor_profiles.first_name} {invitationInfo.doctor_profiles.last_name}.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Sign up or log in to accept this invitation.
            </p>
          </div>
        )}

        {isLogin ? (
          <LoginForm 
            onToggleMode={() => setIsLogin(false)} 
            invitationToken={invitationToken} 
          />
        ) : (
          <SignUpForm 
            onToggleMode={() => setIsLogin(true)} 
            onSignUpSuccess={handleSignUpSuccess}
            invitationToken={invitationToken}
            invitationInfo={invitationInfo}
          />
        )}
      </div>
    </div>
  );
}
