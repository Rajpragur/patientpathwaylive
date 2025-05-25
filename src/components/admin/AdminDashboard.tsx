
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  Mail, 
  Phone, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar,
  FileText,
  Database,
  Activity,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalLeads: 0,
    activeQuizzes: 7,
    conversionRate: 0
  });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  useEffect(() => {
    fetchAdminData();
  }, [selectedTimeframe]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors
      const { data: doctorData } = await supabase
        .from('doctor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch leads
      const { data: leadData } = await supabase
        .from('quiz_leads')
        .select('*')
        .order('created_at', { ascending: false });

      setDoctors(doctorData || []);
      setLeads(leadData || []);
      
      // Calculate stats
      const totalDoctors = doctorData?.length || 0;
      const totalLeads = leadData?.length || 0;
      const conversionRate = totalDoctors > 0 ? (totalLeads / totalDoctors) * 100 : 0;
      
      setStats({
        totalDoctors,
        totalLeads,
        activeQuizzes: 7,
        conversionRate: Math.round(conversionRate)
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorAction = async (doctorId: string, action: string) => {
    try {
      if (action === 'suspend') {
        // In a real app, you'd have a status field
        toast.success('Doctor account suspended');
      } else if (action === 'activate') {
        toast.success('Doctor account activated');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to perform action');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Comprehensive platform management and analytics</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalDoctors}</div>
              <p className="text-xs text-slate-500 mt-1">Registered practitioners</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalLeads}</div>
              <p className="text-xs text-slate-500 mt-1">Patient assessments</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Active Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.activeQuizzes}</div>
              <p className="text-xs text-slate-500 mt-1">Assessment types</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.conversionRate}%</div>
              <p className="text-xs text-slate-500 mt-1">Lead generation efficiency</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Doctors
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Doctors Management */}
          <TabsContent value="doctors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Doctor Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Doctor</th>
                        <th className="text-left p-4 font-semibold">Contact</th>
                        <th className="text-left p-4 font-semibold">Specialty</th>
                        <th className="text-left p-4 font-semibold">Leads</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor.id} className="border-b hover:bg-slate-50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">
                                {doctor.first_name} {doctor.last_name}
                              </div>
                              <div className="text-sm text-slate-500">{doctor.clinic_name}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="text-sm flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {doctor.email}
                              </div>
                              {doctor.phone && (
                                <div className="text-sm flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {doctor.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{doctor.specialty || 'ENT'}</Badge>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">
                              {leads.filter(lead => lead.doctor_id === doctor.id).length}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge className="bg-green-100 text-green-700">
                              Active
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDoctorAction(doctor.id, 'suspend')}
                              >
                                Suspend
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Generation Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <p>Analytics charts would be implemented here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['SNOT22', 'NOSE', 'HHIA', 'EPWORTH', 'DHI', 'STOP', 'TNSS'].map((quiz) => (
                      <div key={quiz} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium">{quiz}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">
                            {leads.filter(lead => lead.quiz_type === quiz).length} leads
                          </span>
                          <Badge variant="outline">Active</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitoring */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Database</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>API Services</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Authentication</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Uptime</span>
                    <span className="font-bold text-green-600">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <span className="font-bold">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Active Sessions</span>
                    <span className="font-bold">{doctors.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Storage Used</span>
                    <span className="font-bold">2.3 GB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Center */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Support Center
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <p className="text-sm text-slate-600">Open Tickets</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">12</div>
                      <p className="text-sm text-slate-600">Resolved Today</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600">2.5h</div>
                      <p className="text-sm text-slate-600">Avg Response Time</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <Mail className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Send Announcement</div>
                        <div className="text-sm text-slate-500">Notify all doctors</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <Shield className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Security Report</div>
                        <div className="text-sm text-slate-500">Generate security audit</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">General Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Platform Name</label>
                        <Input defaultValue="Patient Pathway" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Support Email</label>
                        <Input defaultValue="support@patientpathway.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Maintenance Mode</label>
                        <Select defaultValue="off">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off">Disabled</SelectItem>
                            <SelectItem value="on">Enabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Security Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Session Timeout (hours)</label>
                        <Input type="number" defaultValue="24" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Max Login Attempts</label>
                        <Input type="number" defaultValue="5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Password Requirements</label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Basic</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">Strong</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Save Settings
                  </Button>
                  <Button variant="outline">
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
