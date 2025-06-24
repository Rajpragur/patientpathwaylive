import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Mail, MessageSquare, Upload, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Contact {
  id: string;
  doctor_id: string;
  type: 'email' | 'sms';
  name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'email' | 'sms'>('email');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Contact>>({ type: 'email' });
  const [importing, setImporting] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profiles, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching doctor profile:', error);
        toast.error('Could not fetch doctor profile');
        return;
      }
      
      if (profiles && profiles.length > 0) {
        const profile = profiles[0];
        setDoctorId(profile.id);
        fetchContacts(profile.id);
      } else {
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
          toast.error('Failed to create doctor profile');
          return;
        }

        if (newProfile && newProfile.length > 0) {
          setDoctorId(newProfile[0].id);
          fetchContacts(newProfile[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load doctor profile');
    }
  };

  const fetchContacts = async (profileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('doctor_id', profileId);
      
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return;
    }
    
    if (!form.name || (tab === 'email' && !form.email) || (tab === 'sms' && !form.phone)) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (showEdit) {
        // Update
        const { error } = await supabase
          .from('contacts')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', showEdit)
          .eq('doctor_id', doctorId);
        
        if (error) throw error;
        toast.success('Contact updated');
      } else {
        // Add
        const { error } = await supabase
          .from('contacts')
          .insert({
            doctor_id: doctorId,
            type: tab,
            name: form.name,
            email: form.email,
            phone: form.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) throw error;
        toast.success('Contact added');
      }
      
      setShowAdd(false);
      setShowEdit(null);
      setForm({ type: tab });
      fetchContacts(doctorId);
    } catch (error) {
      console.error('Error managing contact:', error);
      toast.error(showEdit ? 'Failed to update contact' : 'Failed to add contact');
    }
  };

  const handleDelete = async (id: string) => {
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return;
    }

    if (!window.confirm('Delete this contact?')) return;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
        .eq('doctor_id', doctorId);
      
      if (error) throw error;
      toast.success('Contact deleted');
      fetchContacts(doctorId);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!doctorId) {
      toast.error('Doctor profile not found');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const newContacts = lines.map(line => {
          const [name, emailOrPhone] = line.split(',');
          return {
            doctor_id: doctorId,
            type: tab,
            name: name?.trim(),
            email: tab === 'email' ? emailOrPhone?.trim() : undefined,
            phone: tab === 'sms' ? emailOrPhone?.trim() : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }).filter(c => c.name && (c.email || c.phone));

        if (newContacts.length) {
          const { error } = await supabase.from('contacts').insert(newContacts);
          if (error) throw error;
          toast.success('Contacts imported');
          fetchContacts(doctorId);
        } else {
          toast.error('No valid contacts found in CSV');
        }
      } catch (error) {
        console.error('Error importing contacts:', error);
        toast.error('Failed to import contacts');
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  const filteredContacts = contacts.filter(c => c.type === tab);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-7 h-7 text-blue-600" />
        <h2 className="text-2xl font-bold">Contacts</h2>
      </div>
      <Tabs value={tab} onValueChange={v => setTab(v as 'email' | 'sms')} className="mb-6">
        <TabsList>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1" /> Email Contacts</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="w-4 h-4 mr-1" /> SMS Contacts</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {tab === 'email' ? <Mail className="w-5 h-5 text-blue-500" /> : <MessageSquare className="w-5 h-5 text-green-500" />}
            {tab === 'email' ? 'Email Contacts' : 'SMS Contacts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={() => setShowAdd(true)} disabled={!doctorId}>
              <Plus className="w-4 h-4 mr-1" /> Add Contact
            </Button>
            <Button variant="outline" asChild disabled={importing || !doctorId}>
              <label className="flex items-center cursor-pointer">
                {importing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                Import CSV
                <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" disabled={importing || !doctorId} />
              </label>
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : !doctorId ? (
            <div className="text-gray-500">Loading doctor profile...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-gray-500">No contacts found.</div>
          ) : (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left">Name</th>
                  {tab === 'email' && <th className="p-2 text-left">Email</th>}
                  {tab === 'sms' && <th className="p-2 text-left">Phone</th>}
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="border-t">
                    <td className="p-2">{contact.name}</td>
                    {tab === 'email' && <td className="p-2">{contact.email}</td>}
                    {tab === 'sms' && <td className="p-2">{contact.phone}</td>}
                    <td className="p-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setShowEdit(contact.id); setForm(contact); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {/* Add/Edit Dialog */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{showEdit ? 'Edit Contact' : 'Add Contact'}</h3>
            <form onSubmit={handleAddOrEdit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              {tab === 'email' && (
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
              )}
              {tab === 'sms' && (
                <div>
                  <Label>Phone</Label>
                  <Input type="tel" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setShowEdit(null); setForm({ type: tab }); }}>
                  Cancel
                </Button>
                <Button type="submit">{showEdit ? 'Save' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 