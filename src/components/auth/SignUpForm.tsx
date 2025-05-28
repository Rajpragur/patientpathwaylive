
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface SignUpFormProps {
  onToggleMode: () => void;
  onSignUpSuccess: (email: string) => void;
}

export function SignUpForm({ onToggleMode, onSignUpSuccess }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName
    });
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      onSignUpSuccess(formData.email);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Join Patient Pathway
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-200"
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
              className="rounded-full border-gray-200 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
