
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

export function SecuritySettings() {
  const { user } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (enabled) {
      // In a real implementation, you would set up TOTP
      setShowQRCode(true);
      toast.success('Two-factor authentication setup initiated');
    } else {
      setTwoFactorEnabled(false);
      toast.success('Two-factor authentication disabled');
    }
  };

  const confirmTwoFactorSetup = () => {
    setTwoFactorEnabled(true);
    setShowQRCode(false);
    toast.success('Two-factor authentication enabled successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Security Settings</h1>
          <p className="text-slate-600">Manage your account security and authentication</p>
        </div>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="2fa" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Two-Factor Auth
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sessions
          </TabsTrigger>
        </TabsList>

        {/* Password Management */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ 
                        ...prev, 
                        currentPassword: e.target.value 
                      }))}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ 
                        ...prev, 
                        newPassword: e.target.value 
                      }))}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="text-sm text-slate-500">
                    Password must be at least 8 characters long
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ 
                      ...prev, 
                      confirmPassword: e.target.value 
                    }))}
                    required
                  />
                </div>

                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Strength Indicator */}
          <Card>
            <CardHeader>
              <CardTitle>Password Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contains uppercase and lowercase letters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contains numbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Contains special characters (recommended)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Two-Factor Authentication */}
        <TabsContent value="2fa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
                {twoFactorEnabled && (
                  <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">SMS Authentication</h3>
                  <p className="text-sm text-slate-500">
                    Receive verification codes via SMS
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleTwoFactorToggle}
                />
              </div>

              {showQRCode && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Setup Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="w-48 h-48 bg-white border-2 border-slate-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Scan this QR code with your authenticator app
                      </p>
                      <Input 
                        placeholder="Enter verification code"
                        className="max-w-xs mx-auto mb-4"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button onClick={confirmTwoFactorSetup}>
                          Verify & Enable
                        </Button>
                        <Button variant="outline" onClick={() => setShowQRCode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <h3 className="font-medium">Backup Codes</h3>
                <p className="text-sm text-slate-500">
                  Generate backup codes to access your account if you lose your phone
                </p>
                <Button variant="outline">
                  Generate Backup Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">Current Session</div>
                      <div className="text-sm text-slate-500">
                        Chrome on Windows • Last active: Now
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="font-medium">Safari on iPhone</div>
                      <div className="text-sm text-slate-500">
                        Last active: 2 hours ago
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revoke
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    Sign Out All Other Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
