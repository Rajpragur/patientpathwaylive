
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle } from 'lucide-react';

interface EmailVerificationNoticeProps {
  email: string;
  onBack: () => void;
}

export function EmailVerificationNotice({ email, onBack }: EmailVerificationNoticeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Patient Pathway
          </h1>
          <p className="text-gray-600">ENT Medical Assessment Platform</p>
        </div>
        
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-center text-green-600">Account Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-800 font-medium">
                Please check your email to verify your account
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Verification email sent to: <strong>{email}</strong>
              </p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>✅ Your account has been created</p>
              <p>📧 A verification link has been sent to your email</p>
              <p>🔗 Click the link in the email to activate your account</p>
            </div>
            
            <div className="pt-4 space-y-2">
              <p className="text-xs text-gray-500">
                Don't see the email? Check your spam folder or contact support.
              </p>
              <Button 
                variant="outline" 
                onClick={onBack}
                className="w-full rounded-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
