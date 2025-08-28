import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertTriangle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

const ADMIN_EMAIL = 'patientpathway@admin.com';

export function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email !== ADMIN_EMAIL) {
      setError('Access denied. This portal is restricted to authorized administrators only.');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('Invalid credentials. Please check your email and password.');
        return;
      }

      if (data.user) {
        // Verify this is actually the admin user
        if (data.user.email === ADMIN_EMAIL) {
          toast.success('Admin access granted');
          onAuthSuccess();
        } else {
          setError('Access denied. This portal is restricted to authorized administrators only.');
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Admin auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Admin Portal
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Restricted access - Management only
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patientpathway1@gmail.com"
                className="border-slate-300 focus:border-red-500 focus:ring-red-500"
                required
                disabled
              />
              <p className="text-xs text-slate-500">Email is pre-filled and locked</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-slate-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Access Admin Portal
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <Shield className="w-3 h-3" />
                <span>This portal is restricted to authorized personnel only</span>
              </div>
              <div className="text-xs text-slate-400">
                Admin: {ADMIN_EMAIL}
              </div>
              <div className="text-xs text-slate-400">
                Use your Supabase account password
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
