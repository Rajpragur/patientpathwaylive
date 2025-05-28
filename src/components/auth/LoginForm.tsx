
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome to Patient Pathway!');
    }
    
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-center bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] bg-clip-text text-transparent">
          Login to Patient Pathway
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-full border-gray-200 focus:border-[#0E7C9D] focus:ring-[#0E7C9D]/20"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-full border-gray-200 focus:border-[#0E7C9D] focus:ring-[#0E7C9D]/20"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#0E7C9D] hover:from-[#FF6B35]/90 hover:to-[#0E7C9D]/90 text-white font-medium py-2.5"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-[#0E7C9D] hover:underline font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
