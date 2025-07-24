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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Download, TrendingUp, Users, Star, Calendar } from 'lucide-react';

interface LeadData {
  created_at: string;
}

interface QuizLead {
  id: string;
  quiz_type: string;
  score: number;
  created_at: string;
}

interface DailyLeads {
  date: string;
  count: number;
}

interface QuizTypeData {
  quiz_type: string;
  count: number;
}

interface MonthlyScores {
  month: string;
  average_score: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function AnalyticsPage() {
  const { user } = useAuth();
  const [totalLeads, setTotalLeads] = useState(0);
  const [dailyLeads, setDailyLeads] = useState<DailyLeads[]>([]);
  const [quizTypeData, setQuizTypeData] = useState<QuizTypeData[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScores[]>([]);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const doctorId = user?.id || 'demo';

      // Fetch total leads
      const { count: leadsCount, error: leadsError } = await supabase
        .from('quiz_leads')
        .select('*', { count: 'exact' })
        .eq('doctor_id', doctorId);

      if (leadsError) throw leadsError;
      setTotalLeads(leadsCount || 0);

      // Fetch daily leads
      const { data: dailyData, error: dailyError } = await supabase
        .from('quiz_leads')
        .select('created_at')
        .eq('doctor_id', doctorId);

      if (dailyError) throw dailyError;

      const dailyCounts = dailyData?.reduce((acc: { [key: string]: number }, lead: LeadData) => {
        const date = lead.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const dailyLeadsArray: DailyLeads[] = Object.entries(dailyCounts || {}).map(([date, count]) => ({
        date,
        count,
      }));

      setDailyLeads(dailyLeadsArray);

      // Fetch quiz type data
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_leads')
        .select('quiz_type')
        .eq('doctor_id', doctorId);

      if (quizError) throw quizError;

      const quizTypeCounts = quizData?.reduce((acc: { [key: string]: number }, lead: { quiz_type: string }) => {
        acc[lead.quiz_type] = (acc[lead.quiz_type] || 0) + 1;
        return acc;
      }, {});

      const quizTypeArray: QuizTypeData[] = Object.entries(quizTypeCounts || {}).map(([quiz_type, count]) => ({
        quiz_type,
        count,
      }));

      setQuizTypeData(quizTypeArray);

      // Fetch monthly scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('quiz_leads')
        .select('score, created_at')
        .eq('doctor_id', doctorId);

      if (scoresError) throw scoresError;

      const monthlyScoresMap = scoresData?.reduce((acc: { [key: string]: { sum: number; count: number } }, lead: { score: number; created_at: string }) => {
        const month = lead.created_at.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { sum: 0, count: 0 };
        }
        acc[month].sum += lead.score;
        acc[month].count += 1;
        return acc;
      }, {});

      const monthlyScoresArray: MonthlyScores[] = Object.entries(monthlyScoresMap || {}).map(([month, data]) => ({
        month,
        average_score: data.sum / data.count,
      }));

      setMonthlyScores(monthlyScoresArray);

      // Calculate average score
      const { data: allScores, error: allScoresError } = await supabase
        .from('quiz_leads')
        .select('score')
        .eq('doctor_id', doctorId);

      if (allScoresError) throw allScoresError;

      const totalScore = allScores?.reduce((sum, lead) => sum + lead.score, 0) || 0;
      const avgScore = allScores && allScores.length > 0 ? totalScore / allScores.length : 0;
      setAverageScore(avgScore);

    } catch (error: any) {
      console.error('Error fetching analytics data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const doctorId = user?.id || 'demo';
      const { data: allLeads, error: allLeadsError } = await supabase
        .from('quiz_leads')
        .select('*')
        .eq('doctor_id', doctorId);

      if (allLeadsError) throw allLeadsError;

      if (allLeads && allLeads.length > 0) {
        const csvContent = "data:text/csv;charset=utf-8," +
          [
            Object.keys(allLeads[0]).join(","),
            ...allLeads.map(item => Object.values(item).join(","))
          ].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "quiz_leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log('No leads to export');
      }
    } catch (error: any) {
      console.error('Error exporting data:', error.message);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Badge variant="secondary">Updated Daily</Badge>
      </div>

      {loading ? (
        <div className="text-center">Loading analytics data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalLeads}</div>
                <p className="text-sm text-gray-500">All time leads generated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{averageScore.toFixed(2)}</div>
                <p className="text-sm text-gray-500">Average quiz score</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Daily Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dailyLeads.length > 0 ? dailyLeads[dailyLeads.length - 1].count : 0}
                </div>
                <p className="text-sm text-gray-500">Leads generated today</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={refreshData}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyLeads} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiz Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={quizTypeData}
                      dataKey="count"
                      nameKey="quiz_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Average Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyScores} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average_score" fill="#82ca9d" />
                </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}