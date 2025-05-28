
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { EmailVerificationNotice } from './EmailVerificationNotice';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSignUpSuccess = (email: string) => {
    setUserEmail(email);
    setShowVerificationNotice(true);
  };

  if (showVerificationNotice) {
    return <EmailVerificationNotice email={userEmail} onBack={() => setShowVerificationNotice(false)} />;
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
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignUpForm onToggleMode={() => setIsLogin(true)} onSignUpSuccess={handleSignUpSuccess} />
        )}
      </div>
    </div>
  );
}
