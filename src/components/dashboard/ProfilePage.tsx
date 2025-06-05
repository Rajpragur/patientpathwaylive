import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Camera,
  Save,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialty: '',
    clinic_name: '',
    avatar_url: '',
    doctor_id: ''
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setDoctorProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          specialty: data.specialty || '',
          clinic_name: data.clinic_name || '',
          avatar_url: data.avatar_url || '',
          doctor_id: data.doctor_id || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update the form data with the new URL
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success('Profile picture updated! Remember to save your changes.');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        user_id: user?.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      if (doctorProfile) {
        const { error } = await supabase
          .from('doctor_profiles')
          .update(profileData)
          .eq('id', doctorProfile.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('doctor_profiles')
          .insert([{
            ...profileData,
            doctor_id: generateDoctorId()
          }])
          .select()
          .single();

        if (error) throw error;
        setDoctorProfile(data);
      }

      toast.success('Profile updated successfully!');
      fetchDoctorProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const generateDoctorId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const getInitials = () => {
    if (formData.first_name && formData.last_name) {
      return (formData.first_name.charAt(0) + formData.last_name.charAt(0)).toUpperCase();
    }
    if (formData.email) {
      return formData.email.substring(0, 2).toUpperCase();
    }
    return 'DR';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E7C9D]"></div>
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] bg-clip-text text-transparent mb-4">
          Doctor Profile
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your professional information and account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-8 text-center">
            <div className="relative inline-block mb-6">
              <Avatar className="w-32 h-32 ring-4 ring-[#0E7C9D]/20">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] text-white text-3xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-2 right-2 bg-[#0E7C9D] text-white p-2 rounded-full cursor-pointer hover:bg-[#0E7C9D]/90 transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Dr. {formData.first_name} {formData.last_name}
            </h2>
            <p className="text-gray-600 mb-4">{formData.specialty || 'Medical Professional'}</p>
            
            {formData.doctor_id && (
              <Badge className="bg-[#0E7C9D] text-white px-4 py-2 rounded-2xl mb-4">
                Doctor ID: {formData.doctor_id}
              </Badge>
            )}
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{formData.email}</span>
              </div>
              {formData.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{formData.phone}</span>
                </div>
              )}
              {formData.clinic_name && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Building className="w-4 h-4" />
                  <span className="text-sm">{formData.clinic_name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {new Date(doctorProfile?.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-[#0E7C9D] flex items-center gap-2">
                <User className="w-6 h-6" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="rounded-2xl"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="rounded-2xl"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-2xl"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="rounded-2xl"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty">Medical Specialty</Label>
                  <select
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="">Select Specialty</option>
                    <option value="ENT">ENT (Otolaryngology)</option>
                    <option value="Pulmonology">Pulmonology</option>
                    <option value="Sleep Medicine">Sleep Medicine</option>
                    <option value="Family Medicine">Family Medicine</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="clinic_name">Clinic/Hospital Name</Label>
                  <Input
                    id="clinic_name"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinic_name: e.target.value }))}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 rounded-2xl text-lg font-semibold shadow-lg"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
