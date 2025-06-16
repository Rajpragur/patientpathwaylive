import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface DoctorProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  clinic_name?: string;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newLeadAlerts: true,
    weeklyReports: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          specialty: profile.specialty,
          clinic_name: profile.clinic_name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile?.first_name || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, first_name: e.target.value} : null)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile?.last_name || ''}
                onChange={(e) => setProfile(prev => prev ? {...prev, last_name: e.target.value} : null)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profile?.phone || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
            />
          </div>

          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={profile?.specialty || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, specialty: e.target.value} : null)}
            />
          </div>

          <div>
            <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
            <Input
              id="clinicName"
              value={profile?.clinic_name || ''}
              onChange={(e) => setProfile(prev => prev ? {...prev, clinic_name: e.target.value} : null)}
            />
          </div>

          <Button onClick={updateProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications(prev => ({...prev, emailNotifications: checked}))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-600">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={notifications.smsNotifications}
              onCheckedChange={(checked) => setNotifications(prev => ({...prev, smsNotifications: checked}))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>New Lead Alerts</Label>
              <p className="text-sm text-gray-600">Get notified when new leads are generated</p>
            </div>
            <Switch
              checked={notifications.newLeadAlerts}
              onCheckedChange={(checked) => setNotifications(prev => ({...prev, newLeadAlerts: checked}))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Reports</Label>
              <p className="text-sm text-gray-600">Receive weekly summary reports</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => setNotifications(prev => ({...prev, weeklyReports: checked}))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Change Password</Label>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Data Export</Label>
              <p className="text-sm text-gray-600">Download a copy of your data</p>
            </div>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}