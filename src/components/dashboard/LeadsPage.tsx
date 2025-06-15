
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Clock, Filter, Search, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Lead } from '@/types/quiz';
import { EnhancedLeadsTable } from './EnhancedLeadsTable';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quizTypeFilter, setQuizTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'contact' | 'score' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: doctorProfile, error: profileError } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data: leadsData, error: leadsError } = await supabase
        .from('quiz_leads')
        .select('*')
        .eq('doctor_id', doctorProfile.id)
        .order('submitted_at', { ascending: false });

      if (leadsError) throw leadsError;

      const transformedLeads = leadsData?.map(lead => ({
        ...lead,
        lead_status: lead.lead_status || 'NEW'
      })) || [];

      setLeads(transformedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || lead.lead_status === statusFilter;
    const matchesQuizType = quizTypeFilter === 'all' || lead.quiz_type === quizTypeFilter;

    return matchesSearch && matchesStatus && matchesQuizType;
  });

  const filteredAndSortedLeads = [...filteredLeads].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'contact':
        aValue = (a.email || a.phone || '').toLowerCase();
        bValue = (b.email || b.phone || '').toLowerCase();
        break;
      case 'score':
        aValue = a.score;
        bValue = b.score;
        break;
      case 'date':
        aValue = new Date(a.submitted_at).getTime();
        bValue = new Date(b.submitted_at).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.lead_status === 'NEW').length,
    contacted: leads.filter(l => l.lead_status === 'CONTACTED').length,
    scheduled: leads.filter(l => l.lead_status === 'SCHEDULED').length
  };

  const uniqueQuizTypes = [...new Set(leads.map(l => l.quiz_type))];

  const toggleSort = (field: 'name' | 'contact' | 'score' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and track your assessment leads with source attribution</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
            <p className="text-xs text-blue-600">All time leads</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">New Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.new}</div>
            <p className="text-xs text-green-600">Awaiting contact</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Contacted</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.contacted}</div>
            <p className="text-xs text-yellow-600">Follow up in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Scheduled</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.scheduled}</div>
            <p className="text-xs text-purple-600">Appointments booked</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter & Sort Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={quizTypeFilter} onValueChange={setQuizTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Quiz Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quiz Types</SelectItem>
                {uniqueQuizTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: 'name' | 'contact' | 'score' | 'date') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="contact">Contact Info</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => toggleSort(sortBy)}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedLeads.length} of {leads.length} leads
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setQuizTypeFilter('all');
                setSortBy('date');
                setSortOrder('desc');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader>
          <CardTitle>
            Leads ({filteredAndSortedLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedLeadsTable leads={filteredAndSortedLeads} onLeadUpdate={fetchLeads} />
        </CardContent>
      </Card>
    </div>
  );
}
