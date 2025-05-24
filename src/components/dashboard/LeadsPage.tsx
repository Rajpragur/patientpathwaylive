
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

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    quizType: 'all',
    status: 'all',
    dateRange: '30'
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
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
        lead.id === leadId ? { ...lead, lead_status: status as any } : lead
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
    // Add severity logic based on quiz type and score
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
    return <div className="p-6">Loading leads...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{newLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{contactedLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{scheduledLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filters.quizType} onValueChange={(value) => setFilters(prev => ({ ...prev, quizType: value }))}>
            <SelectTrigger className="w-40">
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
            <SelectTrigger className="w-40">
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
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
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
                  <th className="text-left p-4 font-medium">Lead Name</th>
                  <th className="text-left p-4 font-medium">Contact</th>
                  <th className="text-left p-4 font-medium">Lead Source</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Quiz</th>
                  <th className="text-left p-4 font-medium">Score</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
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
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        {lead.email && <div className="text-sm">{lead.email}</div>}
                        {lead.phone && <div className="text-sm text-gray-500">{lead.phone}</div>}
                      </div>
                    </td>
                    <td className="p-4 text-sm">{lead.lead_source}</td>
                    <td className="p-4">
                      <Select 
                        value={lead.lead_status} 
                        onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={getStatusColor(lead.lead_status)}>
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
                    <td className="p-4 text-sm">{lead.quiz_type}</td>
                    <td className="p-4">
                      <span className={`font-medium ${getSeverityColor(lead.score, lead.quiz_type)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLeads.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No leads found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
