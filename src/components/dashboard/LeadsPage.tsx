
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Filter, Calendar, User, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface LeadsPageProps {
  filterStatus?: string;
}

export function LeadsPage({ filterStatus }: LeadsPageProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    quizType: 'all',
    status: filterStatus || 'all',
    dateRange: '30'
  });

  useEffect(() => {
    fetchLeads();
    
    // Set up real-time subscription for new leads
    const channel = supabase
      .channel('leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_leads'
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedLeads: Lead[] = (data || []).map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        quiz_type: lead.quiz_type,
        score: lead.score,
        answers: lead.answers,
        lead_source: lead.lead_source || 'website',
        lead_status: lead.lead_status as 'NEW' | 'CONTACTED' | 'SCHEDULED',
        submitted_at: lead.submitted_at,
        created_at: lead.created_at,
        doctor_id: lead.doctor_id
      }));
      
      setLeads(transformedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('quiz_leads')
        .update({ lead_status: status })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, lead_status: status as 'NEW' | 'CONTACTED' | 'SCHEDULED' } : lead
      ));
      toast.success('Lead status updated');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (score: number, quizType: string) => {
    if (score > 50) return 'text-red-600';
    if (score > 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredLeads = leads.filter(lead => {
    if (filters.search && !lead.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.quizType !== 'all' && lead.quiz_type !== filters.quizType) {
      return false;
    }
    if (filters.status !== 'all' && lead.lead_status !== filters.status) {
      return false;
    }
    return true;
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.lead_status === 'NEW').length;
  const contactedLeads = leads.filter(l => l.lead_status === 'CONTACTED').length;
  const scheduledLeads = leads.filter(l => l.lead_status === 'SCHEDULED').length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading leads...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalLeads}</div>
            <p className="text-xs text-blue-600 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{newLeads}</div>
            <p className="text-xs text-indigo-600 mt-1">Awaiting contact</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-100 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{contactedLeads}</div>
            <p className="text-xs text-orange-600 mt-1">In progress</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{scheduledLeads}</div>
            <p className="text-xs text-emerald-600 mt-1">Appointments booked</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 w-64 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select value={filters.quizType} onValueChange={(value) => setFilters(prev => ({ ...prev, quizType: value }))}>
                <SelectTrigger className="w-40 transition-all duration-200 hover:shadow-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quizzes</SelectItem>
                  <SelectItem value="SNOT22">SNOT-22</SelectItem>
                  <SelectItem value="NOSE">NOSE</SelectItem>
                  <SelectItem value="HHIA">HHIA</SelectItem>
                  <SelectItem value="EPWORTH">Epworth</SelectItem>
                  <SelectItem value="DHI">DHI</SelectItem>
                  <SelectItem value="STOP">STOP</SelectItem>
                  <SelectItem value="TNSS">TNSS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-40 transition-all duration-200 hover:shadow-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <tr>
                  <th className="text-left p-4">
                    <Checkbox 
                      checked={selectedLeads.length === filteredLeads.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLeads(filteredLeads.map(l => l.id));
                        } else {
                          setSelectedLeads([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">Lead Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Contact Info</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Source</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Assessment</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Score</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr 
                    key={lead.id} 
                    className="border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                  >
                    <td className="p-4">
                      <Checkbox 
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLeads([...selectedLeads, lead.id]);
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                          }
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-800">{lead.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {lead.email && <div className="text-sm text-gray-700">{lead.email}</div>}
                        {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {lead.lead_source}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Select 
                        value={lead.lead_status} 
                        onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={`border ${getStatusColor(lead.lead_status)}`}>
                            {lead.lead_status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="CONTACTED">Contacted</SelectItem>
                          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        {lead.quiz_type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-lg ${getSeverityColor(lead.score, lead.quiz_type)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="transition-all duration-200 hover:scale-105 hover:bg-blue-100"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLeads.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No leads found</h3>
                <p className="text-sm">Try adjusting your filters or check back later for new leads.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
