import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building, MapPin, Mail, Phone, Users, Upload } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export function ConfigurationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    clinic_name: '',
    location: '',
    email: '',
    phone: '',
    mobile: '',
    logo_url: '',
    providers: ''
  });
  const [contacts, setContacts] = useState<string[]>([]);
  const [isContactListOpen, setIsContactListOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all doctor profiles for this user
      const { data: profiles, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching doctor profiles:', error);
        setError('Could not fetch doctor profile');
        setLoading(false);
        return;
      }
      
      // Use the first profile if multiple exist
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        console.log('Found doctor profile:', profile.id);
        setDoctorId(profile.id);
        setProfile({
          clinic_name: profile.clinic_name || '',
          location: profile.location || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          mobile: profile.mobile || '',
          logo_url: profile.logo_url || '',
          providers: profile.providers || ''
        });
      } else {
        console.log('No doctor profile found, creating one...');
        
        // Create a doctor profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('doctor_profiles')
          .insert([{ 
            user_id: user.id,
            first_name: 'Doctor',
            last_name: 'User',
            email: user.email,
            doctor_id: Math.floor(100000 + Math.random() * 900000).toString()
          }])
          .select();

        if (createError) {
          console.error('Error creating doctor profile:', createError);
          setError('Failed to create doctor profile');
          setLoading(false);
          return;
        }

        if (newProfile && newProfile.length > 0) {
          console.log('Created new doctor profile:', newProfile[0].id);
          setDoctorId(newProfile[0].id);
          setProfile({
            clinic_name: '',
            location: '',
            email: newProfile[0].email || user.email || '',
            phone: '',
            mobile: '',
            logo_url: '',
            providers: ''
          });
        } else {
          setError('Failed to create doctor profile');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load clinic configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !doctorId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({
          clinic_name: profile.clinic_name,
          location: profile.location,
          email: profile.email,
          phone: profile.phone,
          mobile: profile.mobile,
          logo_url: profile.logo_url,
          providers: profile.providers,
          updated_at: new Date().toISOString()
        })
        .eq('id', doctorId);

      if (error) throw error;
      
      toast.success('Clinic configuration saved successfully');
      
      // Refresh the profile data to ensure we have the latest
      fetchDoctorProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save clinic configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !doctorId) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting logo upload process');
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Delete old logo if exists
      if (profile.logo_url) {
        try {
          const urlParts = profile.logo_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          if (oldFileName && oldFileName.includes('logo-')) {
            console.log('Attempting to delete old file:', `logos/${oldFileName}`);
            await supabase.storage
              .from('profiles')
              .remove([`logos/${oldFileName}`]);
          }
        } catch (error) {
          console.log('Could not delete old logo:', error);
        }
      }

      console.log('Uploading new logo to path:', filePath);
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      // Update the profile with the new URL
      setProfile(prev => ({ ...prev, logo_url: urlData.publicUrl }));
      
      // Update the doctor profile directly
      const { error: updateError } = await supabase
        .from('doctor_profiles')
        .update({ 
          logo_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', doctorId);
        
      if (updateError) {
        console.error('Error updating logo URL:', updateError);
        throw updateError;
      }
      
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setUploading(false);
    }
  };
const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newContacts = lines.map(line => line.trim()).filter(line => line !== '');
      setContacts(prev => [...prev, ...newContacts]);
      toast.success('Contacts imported successfully!');
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Configuration</h2>
          <p className="text-gray-600">Manage your clinic information and settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clinic_name">Clinic Name</Label>
              <Input
                id="clinic_name"
                value={profile.clinic_name}
                onChange={(e) => handleInputChange('clinic_name', e.target.value)}
                placeholder="Enter clinic name"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter clinic address/location"
              />
            </div>

            <div>
              <Label htmlFor="providers">Providers (Doctors)</Label>
              <Textarea
                id="providers"
                value={profile.providers}
                onChange={(e) => handleInputChange('providers', e.target.value)}
                placeholder="List all doctors/providers (one per line)"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="clinic@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                type="tel"
                value={profile.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                placeholder="(555) 987-6543"
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={profile.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  placeholder="https://your-domain.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL or upload your logo below
                </p>
              </div>
              
              <div>
                <Label htmlFor="logo_upload">Upload Logo</Label>
                <div className="mt-2">
                  <input
                    id="logo_upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('logo_upload')?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Choose Logo File
                  </Button>
                </div>
              </div>
            </div>

            {profile.logo_url && (
              <div className="mt-4">
                <Label>Logo Preview</Label>
                <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <img
                    src={profile.logo_url}
                    alt="Clinic Logo"
                    className="max-h-20 max-w-40 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                      target.onerror = null;
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
{/* Contact List Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Contact List Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv_upload">Import Contacts from CSV</Label>
              <input
                id="csv_upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('csv_upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV File
              </Button>
            </div>
            <div>
              <Label>Manually Add Contacts</Label>
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Manage Contacts
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Contact List</h4>
                      <div className="h-40 overflow-y-auto border rounded-md p-2">
                        {contacts.map((contact, index) => (
                          <div key={index} className="text-sm">{contact}</div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button (Mobile) */}
      <div className="md:hidden">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}