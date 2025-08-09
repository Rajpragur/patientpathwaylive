import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Clock, Filter, Search, ArrowUpDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Lead } from '@/types/quiz';
import { EnhancedLeadsTable } from './EnhancedLeadsTable';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';


interface MarketingEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: string;
  doctor_id: string;
  created_at: string;
}

export function LeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quizTypeFilter, setQuizTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'contact' | 'score' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [marketingEvents, setMarketingEvents] = useState<MarketingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);


  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      fetchLeads();
    }
  }, [doctorId, currentWeek]);

  const fetchDoctorProfile = async () => {
    if (!user) return;
    
    try {
      
      // First try to get all doctor profiles for this user
      const { data: doctorProfiles, error: profileError } = await supabase
        .from('doctor_profiles')
        .select('id, first_name, last_name')
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setError('Could not fetch doctor profile');
        toast.error('Could not fetch doctor profile');
        setLoading(false);
        return;
      }

      if (!doctorProfiles || doctorProfiles.length === 0) {
        
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
          toast.error('Failed to create doctor profile');
          setLoading(false);
          return;
        }

        if (newProfile && newProfile.length > 0) {
          console.log('Created new doctor profile:', newProfile[0].id);
          setDoctorId(newProfile[0].id);
        } else {
          setError('Failed to create doctor profile');
          toast.error('Failed to create doctor profile');
          setLoading(false);
        }
      } else {
        // Use the first doctor profile
        setDoctorId(doctorProfiles[0].id);
      }
    } catch (error) {
      console.error('Unexpected error fetching doctor profile:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    if (!doctorId) return;

    try {
      
      // Fetch leads with explicit error handling
      const { data: leadsData, error: leadsError } = await supabase
        .from('quiz_leads')
        .select(`
          *,
          doctor:doctor_profiles(first_name, last_name)
        `)
        .eq('doctor_id', doctorId)
        .order('submitted_at', { ascending: false });

      if (leadsError) {
        console.error('Leads fetch error:', leadsError);
        setError('Could not fetch leads');
        toast.error('Could not fetch leads');
        setLoading(false);
        return;
      }

      // Transform and set leads data
      const transformedLeads = (leadsData || []).map(lead => ({
        ...lead,
        lead_status: lead.lead_status || 'NEW',
        submitted_at: new Date(lead.submitted_at).toISOString()
      }));
      setLeads(transformedLeads);
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };


  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 }); // Saturday
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  const getEventsForDay = (day: Date) => {
    return marketingEvents.filter(event => 
      isSameDay(parseISO(event.event_date), day)
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Leads</h3>
            <p className="text-red-700">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const weekDays = getWeekDays();

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

      {/* Marketing Calendar */}
      <Card className="shadow-lg border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Marketing Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-3">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">Loading events...</span>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg min-h-[80px] ${
                      isToday 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${
                      isToday ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {format(day, 'EEE')}
                    </div>
                    <div className={`text-lg font-bold mb-2 ${
                      isToday ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-xs bg-white px-2 py-1 rounded border shadow-sm truncate"
                          title={event.title}
                        >
                          <div className="font-medium text-gray-800 truncate">
                            {event.title}
                          </div>
                          <div className="text-gray-500 capitalize">
                            {event.event_type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Leads Found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You don't have any leads yet. Share your assessments with patients to start collecting leads.
              </p>
              <Button onClick={() => navigate('/portal/quizzes')}>
                Manage Assessments
              </Button>
            </div>
          ) : (
            <EnhancedLeadsTable leads={filteredAndSortedLeads} onLeadUpdate={fetchLeads} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}