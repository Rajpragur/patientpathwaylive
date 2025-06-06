
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ScheduledLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  quiz_type: string;
  score: number;
  created_at: string;
  scheduled_date?: string;
  lead_status: string;
}

export function SchedulePage() {
  const { user } = useAuth();
  const [scheduledLeads, setScheduledLeads] = useState<ScheduledLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLead, setSelectedLead] = useState<ScheduledLead | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  const handleScheduleLead = async () => {
    if (!selectedDate || !selectedLead) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('quiz_leads')
        .update({ 
          scheduled_date: selectedDate.toISOString(),
          lead_status: 'SCHEDULED'
        })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      toast.success('Lead scheduled successfully!');
      setShowScheduleDialog(false);
      setSelectedDate(undefined);
      setSelectedLead(null);
      fetchScheduledLeads();
    } catch (error) {
      console.error('Error scheduling lead:', error);
      toast.error('Failed to schedule lead');
    } finally {
      setUpdating(false);
    }
  };

  const handleReschedule = (lead: ScheduledLead) => {
    setSelectedLead(lead);
    setSelectedDate(lead.scheduled_date ? new Date(lead.scheduled_date) : undefined);
    setShowScheduleDialog(true);
  };

  if (loading) {
    return <div className="p-6">Loading schedule...</div>;
  }

  const upcomingAppointments = scheduledLeads.filter(lead => 
    lead.scheduled_date && new Date(lead.scheduled_date) >= new Date()
  );
  
  const pastAppointments = scheduledLeads.filter(lead => 
    lead.scheduled_date && new Date(lead.scheduled_date) < new Date()
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Schedule</h1>
        <p className="text-slate-600 mt-1">View your scheduled appointments and patient meetings</p>
      </div>

      {/* Upcoming Appointments */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            Upcoming Appointments ({upcomingAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments
                .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())
                .map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{lead.name}</h3>
                        <p className="text-sm text-slate-600">{lead.quiz_type} Assessment</p>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Score: {lead.score}
                      </Badge>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {lead.scheduled_date ? format(new Date(lead.scheduled_date), 'MMM dd, yyyy HH:mm') : 'Not scheduled'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReschedule(lead)}
                        className="flex items-center gap-1"
                      >
                        <CalendarDays className="w-3 h-3" />
                        Reschedule
                      </Button>
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
          <CardTitle className="text-slate-800">Past Appointments ({pastAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pastAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No past appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastAppointments
                .sort((a, b) => new Date(b.scheduled_date!).getTime() - new Date(a.scheduled_date!).getTime())
                .map((lead) => (
                  <div key={lead.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{lead.name}</h3>
                          <p className="text-sm text-slate-600">{lead.quiz_type} Assessment</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Completed
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
                        <span>
                          {lead.scheduled_date ? format(new Date(lead.scheduled_date), 'MMM dd, yyyy HH:mm') : 'Date not set'}
                        </span>
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

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLead ? `Schedule appointment for ${selectedLead.name}` : 'Schedule Appointment'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date as Date)}
              className="rounded-md border p-3"
              disabled={(date) => date < new Date()}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleScheduleLead}
                disabled={!selectedDate || updating}
                className="flex-1"
              >
                {updating ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowScheduleDialog(false);
                  setSelectedDate(undefined);
                  setSelectedLead(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
