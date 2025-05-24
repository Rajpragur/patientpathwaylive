
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Users, Calendar } from 'lucide-react';

interface TrendData {
  period: string;
  newLeads: number;
  contacted: number;
  scheduled: number;
  total: number;
}

export function TrendsPage() {
  const { user } = useAuth();
  const [trendsData, setTrendsData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrendsData();
    }
  }, [user]);

  const fetchTrendsData = async () => {
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (doctorProfile) {
        const { data: leads } = await supabase
          .from('quiz_leads')
          .select('lead_status, created_at')
          .eq('doctor_id', doctorProfile.id)
          .order('created_at', { ascending: false });

        // Process data for last 6 weeks
        const weeklyData: TrendData[] = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const weekLeads = leads?.filter(lead => {
            const leadDate = new Date(lead.created_at);
            return leadDate >= weekStart && leadDate <= weekEnd;
          }) || [];

          const newLeads = weekLeads.filter(l => l.lead_status === 'NEW').length;
          const contacted = weekLeads.filter(l => l.lead_status === 'CONTACTED').length;
          const scheduled = weekLeads.filter(l => l.lead_status === 'SCHEDULED').length;

          weeklyData.push({
            period: `Week of ${weekStart.toLocaleDateString()}`,
            newLeads,
            contacted,
            scheduled,
            total: weekLeads.length
          });
        }

        setTrendsData(weeklyData);
      }
    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getCurrentWeekData = () => trendsData[trendsData.length - 1] || { newLeads: 0, contacted: 0, scheduled: 0, total: 0 };
  const getPreviousWeekData = () => trendsData[trendsData.length - 2] || { newLeads: 0, contacted: 0, scheduled: 0, total: 0 };

  const currentWeek = getCurrentWeekData();
  const previousWeek = getPreviousWeekData();

  const trends = {
    newLeads: calculateTrend(currentWeek.newLeads, previousWeek.newLeads),
    contacted: calculateTrend(currentWeek.contacted, previousWeek.contacted),
    scheduled: calculateTrend(currentWeek.scheduled, previousWeek.scheduled),
    total: calculateTrend(currentWeek.total, previousWeek.total)
  };

  if (loading) {
    return <div className="p-6">Loading trends...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lead Trends</h1>
        <p className="text-gray-600">Track your lead generation performance over time</p>
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentWeek.total}</div>
              <div className={`flex items-center gap-1 ${trends.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.total >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(trends.total).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{currentWeek.newLeads}</div>
              <div className={`flex items-center gap-1 ${trends.newLeads >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.newLeads >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(trends.newLeads).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Contacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-600">{currentWeek.contacted}</div>
              <div className={`flex items-center gap-1 ${trends.contacted >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.contacted >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(trends.contacted).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{currentWeek.scheduled}</div>
              <div className={`flex items-center gap-1 ${trends.scheduled >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trends.scheduled >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(trends.scheduled).toFixed(1)}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendsData.map((week, index) => (
              <div key={week.period} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{week.period}</h3>
                  <div className="flex gap-4 mt-2">
                    <Badge variant="outline" className="text-blue-600">
                      New: {week.newLeads}
                    </Badge>
                    <Badge variant="outline" className="text-yellow-600">
                      Contacted: {week.contacted}
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      Scheduled: {week.scheduled}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{week.total}</div>
                  <div className="text-sm text-gray-500">total leads</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
