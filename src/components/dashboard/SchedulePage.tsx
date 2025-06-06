import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface ScheduledLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  quiz_type: string;
  score: number;
  created_at: string;
  scheduled_date?: string;
}

export function SchedulePage() {
  const { user } = useAuth();
  const [scheduledLeads, setScheduledLeads] = useState<ScheduledLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [newAppointment, setNewAppointment] = useState({ name: '', email: '', phone: '', quiz_type: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchScheduledLeads();
    }
  }, [user]);

  const fetchScheduledLeads = async () => {
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (doctorProfile) {
        const { data: leads } = await supabase
          .from('quiz_leads')
          .select('*')
          .eq('doctor_id', doctorProfile.id)
          .eq('lead_status', 'SCHEDULED')
          .order('created_at', { ascending: false });

        setScheduledLeads(leads || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async () => {
    if (!selectedDate || !newAppointment.name) return;
    setSaving(true);
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      if (doctorProfile) {
        await supabase.from('quiz_leads').insert({
          doctor_id: doctorProfile.id,
          name: newAppointment.name,
          email: newAppointment.email,
          phone: newAppointment.phone,
          quiz_type: newAppointment.quiz_type || 'Manual',
          lead_status: 'SCHEDULED',
          created_at: selectedDate.toISOString(),
          score: 0,
        });
        setNewAppointment({ name: '', email: '', phone: '', quiz_type: '' });
        setSelectedDate(undefined);
        fetchScheduledLeads();
      }
    } catch (error) {
      console.error('Error adding appointment:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading schedule...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Schedule</h1>
          <p className="text-slate-600 mt-1">View your scheduled appointments and patient meetings</p>
        </div>
        {/* New Appointment Section */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3 border border-slate-200 min-w-[320px]">
          <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-500" />
            Add Appointment
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date as Date)}
            className="mb-2"
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Patient Name"
            value={newAppointment.name}
            onChange={e => setNewAppointment({ ...newAppointment, name: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Email (optional)"
            value={newAppointment.email}
            onChange={e => setNewAppointment({ ...newAppointment, email: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Phone (optional)"
            value={newAppointment.phone}
            onChange={e => setNewAppointment({ ...newAppointment, phone: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Type (optional, e.g. Manual, Call)"
            value={newAppointment.quiz_type}
            onChange={e => setNewAppointment({ ...newAppointment, quiz_type: e.target.value })}
          />
          <Button
            className="mt-2"
            disabled={!selectedDate || !newAppointment.name || saving}
            onClick={handleAddAppointment}
          >
            {saving ? 'Saving...' : 'Add Appointment'}
          </Button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledLeads.filter(lead => new Date(lead.created_at) >= new Date()).length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledLeads
                .filter(lead => new Date(lead.created_at) >= new Date())
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{lead.name}</h3>
                        <p className="text-sm text-slate-600">{lead.quiz_type} Assessment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Score: {lead.score}
                      </Badge>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{new Date(lead.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">Past Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledLeads.filter(lead => new Date(lead.created_at) < new Date()).length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No past appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledLeads
                .filter(lead => new Date(lead.created_at) < new Date())
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((lead) => (
                  <div key={lead.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{lead.name}</h3>
                          <p className="text-sm text-slate-600">{lead.quiz_type} Assessment</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Past
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Assessment Score:</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {lead.score}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
