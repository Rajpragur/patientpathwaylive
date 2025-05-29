
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormProps {
  onToggleMode: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/portal`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        toast.error('Google sign-in is not configured. Please use email/password login or contact support.');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Google sign-in temporarily unavailable. Please use email/password login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#0E7C9D] hover:bg-[#0E7C9D]/90" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            onClick={onToggleMode}
            className="text-[#0E7C9D] hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
