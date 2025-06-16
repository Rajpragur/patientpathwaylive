import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  leadsByStatus: { name: string; value: number; color: string }[];
  leadsByQuizType: { name: string; value: number }[];
  dailyLeads: { date: string; count: number }[];
  totalStats: {
    totalLeads: number;
    newLeads: number;
    contacted: number;
    scheduled: number;
    conversionRate: number;
  };
}

export function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDoctorProfile();
    }
  }, [user]);

  useEffect(() => {
    if (doctorId) {
      fetchAnalytics();
    }
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      // Get all doctor profiles for this user
      const { data: doctorProfiles, error } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching doctor profiles:', error);
        setError('Could not fetch doctor profile');
        setLoading(false);
        return;
      }

      if (doctorProfiles && doctorProfiles.length > 0) {
        // Use the first doctor profile
        console.log('Found doctor profile:', doctorProfiles[0].id);
        setDoctorId(doctorProfiles[0].id);
      } else {
        console.log('No doctor profile found, creating one...');
        
        // Create a doctor profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('doctor_profiles')
          .insert([{ 
            user_id: user?.id,
            first_name: 'Doctor',
            last_name: 'User',
            email: user?.email,
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
        } else {
          setError('Failed to create doctor profile');
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error in fetchDoctorProfile:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!doctorId) return;

    try {
      console.log('Fetching analytics for doctor ID:', doctorId);
      
      const { data: leads, error } = await supabase
        .from('quiz_leads')
        .select('lead_status, quiz_type, created_at')
        .eq('doctor_id', doctorId);

      if (error) {
        console.error('Error fetching leads for analytics:', error);
        setError('Could not fetch analytics data');
        setLoading(false);
        return;
      }

      console.log('Fetched leads for analytics:', leads?.length || 0);

      if (leads) {
        // Leads by status
        const statusCounts = leads.reduce((acc: any, lead) => {
          acc[lead.lead_status || 'NEW'] = (acc[lead.lead_status || 'NEW'] || 0) + 1;
          return acc;
        }, {});

        const leadsByStatus = [
          { name: 'New', value: statusCounts.NEW || 0, color: '#3b82f6' },
          { name: 'Contacted', value: statusCounts.CONTACTED || 0, color: '#eab308' },
          { name: 'Scheduled', value: statusCounts.SCHEDULED || 0, color: '#22c55e' }
        ];

        // Leads by quiz type
        const quizCounts = leads.reduce((acc: any, lead) => {
          acc[lead.quiz_type] = (acc[lead.quiz_type] || 0) + 1;
          return acc;
        }, {});

        const leadsByQuizType = Object.entries(quizCounts).map(([name, value]) => ({
          name,
          value: value as number
        }));

        // Daily leads for last 30 days
        const dailyLeads = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const count = leads.filter(lead => 
            lead.created_at && lead.created_at.split('T')[0] === dateStr
          ).length;

          dailyLeads.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count
          });
        }

        // Total stats
        const totalLeads = leads.length;
        const newLeads = statusCounts.NEW || 0;
        const contacted = statusCounts.CONTACTED || 0;
        const scheduled = statusCounts.SCHEDULED || 0;
        const conversionRate = totalLeads > 0 ? (scheduled / totalLeads) * 100 : 0;

        setAnalytics({
          leadsByStatus,
          leadsByQuizType,
          dailyLeads,
          totalStats: {
            totalLeads,
            newLeads,
            contacted,
            scheduled,
            conversionRate
          }
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h3>
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

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-blue-800 mb-2">No Analytics Data</h3>
            <p className="text-blue-700">
              There's no data available yet. Start collecting leads to see analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartConfig = {
    NEW: { label: "New", color: "#3b82f6" },
    CONTACTED: { label: "Contacted", color: "#eab308" },
    SCHEDULED: { label: "Scheduled", color: "#22c55e" },
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into your lead generation performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStats.totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.totalStats.newLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.totalStats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.totalStats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.totalStats.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Lead Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={analytics.leadsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quiz Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Leads by Quiz Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={analytics.leadsByQuizType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Daily Leads Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Daily Leads (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={analytics.dailyLeads}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}