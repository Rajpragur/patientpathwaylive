import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MessageSquare,
  Download,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
  period: string;
}

interface SubmissionData {
  date: string;
  submissions: number;
}

interface QuizTypeData {
  name: string;
  value: number;
}

interface ConversionData {
  source: string;
  rate: number;
}

interface Activity {
  action: string;
  timestamp: string;
  type: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const mockSubmissionData: SubmissionData[] = [
  { date: '2024-01-01', submissions: 50 },
  { date: '2024-01-08', submissions: 80 },
  { date: '2024-01-15', submissions: 65 },
  { date: '2024-01-22', submissions: 90 },
  { date: '2024-01-29', submissions: 75 },
];

const mockQuizTypeData: QuizTypeData[] = [
  { name: 'NOSE', value: 400 },
  { name: 'DHI', value: 300 },
  { name: 'Epworth', value: 300 },
  { name: 'HHIA', value: 200 },
];

const mockConversionData: ConversionData[] = [
  { source: 'Google Ads', rate: 0.15 },
  { source: 'Facebook Ads', rate: 0.12 },
  { source: 'Organic', rate: 0.08 },
];

const mockRecentActivity: Activity[] = [
  { action: 'New quiz submission', timestamp: '5 minutes ago', type: 'NOSE' },
  { action: 'Lead converted to appointment', timestamp: '30 minutes ago', type: 'DHI' },
  { action: 'Shared assessment link', timestamp: '1 hour ago', type: 'Epworth' },
  { action: 'New user signup', timestamp: '2 hours ago', type: 'HHIA' },
];

export function AnalyticsPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [submissionData, setSubmissionData] = useState<SubmissionData[]>(mockSubmissionData);
  const [quizTypeData, setQuizTypeData] = useState<QuizTypeData[]>(mockQuizTypeData);
  const [conversionData, setConversionData] = useState<ConversionData[]>(mockConversionData);
  const [recentActivity, setRecentActivity] = useState<Activity[]>(mockRecentActivity);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, [user]);

  const fetchAnalyticsData = async () => {
    // Fetch total users
    try {
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (usersError) throw usersError;
      setTotalUsers(usersCount || 0);
    } catch (error) {
      console.error('Error fetching total users:', error);
    }

    // Fetch total quizzes
    try {
      const { count: quizzesCount, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact' });

      if (quizzesError) throw quizzesError;
      setTotalQuizzes(quizzesCount || 0);
    } catch (error) {
      console.error('Error fetching total quizzes:', error);
    }

    // Fetch total leads (example: profiles with a 'lead' role)
    try {
      const { count: leadsCount, error: leadsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'lead');

      if (leadsError) throw leadsError;
      setTotalLeads(leadsCount || 0);
    } catch (error) {
      console.error('Error fetching total leads:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter Results
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              +12% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Total Quizzes Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuizzes}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              +8% vs last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total Leads Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              +15% vs last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Submissions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Submissions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={quizTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {quizTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
