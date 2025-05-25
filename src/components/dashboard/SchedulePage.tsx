
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Mail } from 'lucide-react';

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

  if (loading) {
    return <div className="p-6">Loading schedule...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Schedule</h1>
          <p className="text-slate-600 mt-1">View your scheduled appointments and patient meetings</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Calendar className="w-5 h-5 text-blue-500" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledLeads.filter(lead => 
            new Date(lead.created_at).toDateString() === new Date().toDateString()
          ).length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledLeads
                .filter(lead => new Date(lead.created_at).toDateString() === new Date().toDateString())
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
                        <span className="text-sm">Today</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Scheduled Appointments */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">All Scheduled Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledLeads.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No scheduled appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledLeads.map((lead) => (
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
                      Scheduled
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
                      <Calendar className="w-4 h-4" />
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
