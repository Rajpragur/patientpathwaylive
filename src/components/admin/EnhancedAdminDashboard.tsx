import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Building,
  UserCheck,
  UserX,
  Clock,
  Target,
  PieChart,
  Lock,
  Key,
  Trash2,
  Edit,
  MoreHorizontal,
  Ban,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Settings2,
  ActivitySquare,
  Database as DatabaseIcon,
  Shield as ShieldIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface DoctorProfile {
  id: string;
  clinic_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  location: string | null;
  specialty: string | null;
  created_at: string;
  user_id: string;
  doctor_id?: string | null;
  is_active?: boolean;
  access_level?: string;
  phone?: string;
}

interface QuizLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  quiz_type: string;
  score: number;
  lead_status: string | null;
  lead_source: string | null;
  created_at: string;
  doctor_id: string;
  scheduled_date: string | null;
  answers?: any;
}

interface AdminStats {
  totalDoctors: number;
  totalLeads: number;
  activeQuizzes: number;
  conversionRate: number;
  leadsThisMonth: number;
  leadsThisWeek: number;
  averageScore: number;
  topSpecialties: string[];
  activeUsers: number;
  suspendedUsers: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export function EnhancedAdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalDoctors: 0,
    totalLeads: 0,
    activeQuizzes: 7,
    conversionRate: 0,
    leadsThisMonth: 0,
    leadsThisWeek: 0,
    averageScore: 0,
    topSpecialties: [],
    activeUsers: 0,
    suspendedUsers: 0
  });
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [leads, setLeads] = useState<QuizLead[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuizType, setSelectedQuizType] = useState('all');
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Admin management states
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState<QuizLead | null>(null);
  // Doctor analytics & access control
  const [showDoctorLeads, setShowDoctorLeads] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [locallySuspendedDoctorIds, setLocallySuspendedDoctorIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAdminData();
  }, [selectedTimeframe]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors (using the working approach from AdminDashboard.tsx)
      const { data: doctorData } = await supabase
        .from('doctor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch leads (using the working approach from AdminDashboard.tsx)
      const { data: leadData } = await supabase
        .from('quiz_leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch admin users (you might need to create this table)
      const { data: userData } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      setDoctors(doctorData || []);
      setLeads(leadData || []);
      setAdminUsers(userData || []);
      
      // Calculate comprehensive stats
      const totalDoctors = doctorData?.length || 0;
      const totalLeads = leadData?.length || 0;
      const conversionRate = totalDoctors > 0 ? (totalLeads / totalDoctors) * 100 : 0;
      
      // Calculate time-based stats
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const leadsThisMonth = leadData?.filter(lead => 
        new Date(lead.created_at) >= monthAgo
      ).length || 0;
      
      const leadsThisWeek = leadData?.filter(lead => 
        new Date(lead.created_at) >= weekAgo
      ).length || 0;
      
      // Calculate average score
      const totalScore = leadData?.reduce((sum, lead) => sum + lead.score, 0) || 0;
      const averageScore = leadData?.length > 0 ? totalScore / leadData.length : 0;
      
      // Get top specialties
      const specialtyCounts: { [key: string]: number } = {};
      doctorData?.forEach(doctor => {
        if (doctor.specialty) {
          specialtyCounts[doctor.specialty] = (specialtyCounts[doctor.specialty] || 0) + 1;
        }
      });
      
      const topSpecialties = Object.entries(specialtyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([specialty]) => specialty);
      
      setStats({
        totalDoctors,
        totalLeads,
        activeQuizzes: 7,
        conversionRate: Math.round(conversionRate),
        leadsThisMonth,
        leadsThisWeek,
        averageScore: Math.round(averageScore * 100) / 100,
        topSpecialties,
        activeUsers: userData?.filter(u => u.is_active).length || 0,
        suspendedUsers: userData?.filter(u => !u.is_active).length || 0
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const timeframeStart = useMemo(() => {
    const days = Number(selectedTimeframe || '30');
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return start;
  }, [selectedTimeframe]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchTerm));
      
      const matchesSpecialty = selectedSpecialty === 'all' || 
        doctors.find(d => d.id === lead.doctor_id)?.specialty === selectedSpecialty;
      
      const matchesStatus = selectedStatus === 'all' || lead.lead_status === selectedStatus;
      const matchesQuizType = selectedQuizType === 'all' || lead.quiz_type === selectedQuizType;

      const createdAt = new Date(lead.created_at);
      const matchesTimeframe = createdAt >= timeframeStart;
      
      return matchesSearch && matchesSpecialty && matchesStatus && matchesQuizType && matchesTimeframe;
    });
  }, [leads, searchTerm, selectedSpecialty, selectedStatus, selectedQuizType, doctors, timeframeStart]);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      (doctor.clinic_name && doctor.clinic_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.first_name && doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.last_name && doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const getUniqueValues = (field: keyof QuizLead | keyof DoctorProfile) => {
    const values = new Set();
    if (field === 'specialty') {
      doctors.forEach(doctor => {
        if (doctor.specialty) values.add(doctor.specialty);
      });
    } else if (field === 'lead_status') {
      leads.forEach(lead => {
        if (lead.lead_status) values.add(lead.lead_status);
      });
    } else if (field === 'quiz_type') {
      leads.forEach(lead => {
        values.add(lead.quiz_type);
      });
    }
    return Array.from(values);
  };

  // Doctor access control with safe fallback if the column doesn't exist yet
  const revokeDoctorAccess = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({ is_active: false })
        .eq('id', doctorId);

      if (error) {
        // Fallback to local-only toggle if the column doesn't exist
        setLocallySuspendedDoctorIds(prev => new Set(prev).add(doctorId));
        toast.info('Doctor marked suspended locally (add is_active column to persist).');
        return;
      }

      setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, is_active: false } : d));
      toast.success('Doctor access revoked');
    } catch (e) {
      toast.error('Failed to revoke access');
    }
  };

  const restoreDoctorAccess = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .update({ is_active: true })
        .eq('id', doctorId);

      if (error) {
        // Fallback to local-only toggle
        setLocallySuspendedDoctorIds(prev => {
          const next = new Set(prev);
          next.delete(doctorId);
          return next;
        });
        toast.info('Doctor marked active locally (add is_active column to persist).');
        return;
      }

      setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, is_active: true } : d));
      toast.success('Doctor access restored');
    } catch (e) {
      toast.error('Failed to restore access');
    }
  };

  const openDoctorLeads = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setShowDoctorLeads(true);
  };

  const getDoctorLeadBreakdown = (doctorId: string) => {
    // Get ALL leads for this doctor, regardless of current filters
    const doctorLeads = leads.filter(l => l.doctor_id === doctorId);
    const total = doctorLeads.length;
    const byQuiz: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    doctorLeads.forEach(l => {
      byQuiz[l.quiz_type] = (byQuiz[l.quiz_type] || 0) + 1;
      const statusKey = l.lead_status || 'New';
      byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;
    });
    return { total, byQuiz, byStatus };
  };

  const exportData = (type: 'leads' | 'doctors') => {
    const data = type === 'leads' ? filteredLeads : filteredDoctors;
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`${type} data exported successfully`);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  // Admin management functions
  const handleUserAccessToggle = async (userId: string, isActive: boolean) => {
    try {
      // Update user access in Supabase
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        toast.error('Failed to update user access');
        return;
      }

      // Update local state
      setAdminUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));

      toast.success(`User access ${isActive ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      toast.error('Failed to update user access');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast.error('Failed to update password');
        return;
      }

      toast.success('Password updated successfully');
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const viewLeadDetails = (lead: QuizLead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const revokeUserAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        toast.error('Failed to revoke access');
        return;
      }

      setAdminUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: false } : user
      ));

      toast.success('User access revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke access');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
              <Shield className="w-10 h-10 text-red-600" />
              Admin Dashboard
            </h1>
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
            
            {/* Admin Actions */}
            <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Admin Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={handlePasswordChange} className="w-full">
                    Update Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={fetchAdminData} 
              variant="outline"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Database className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            
            <Button className="bg-red-600 hover:bg-red-700">
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
                <Target className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.leadsThisMonth}</div>
              <p className="text-xs text-slate-500 mt-1">New leads generated</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Avg Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.averageScore}</div>
              <p className="text-xs text-slate-500 mt-1">Patient assessment scores</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats.leadsThisWeek}</div>
              <p className="text-xs text-slate-500 mt-1">New leads this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats.conversionRate}%</div>
              <p className="text-xs text-slate-500 mt-1">Lead generation efficiency</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats.activeUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Active admin users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <UserX className="w-4 h-4" />
                Suspended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats.suspendedUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Suspended users</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Leads ({filteredLeads.length})
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Doctors ({filteredDoctors.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Top Specialties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topSpecialties.map((specialty, index) => (
                      <div key={specialty} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{specialty}</span>
                        <Badge variant="secondary">{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{stats.leadsThisWeek} new leads this week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{stats.totalDoctors} active doctors</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>7 active quiz types</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Patient Leads
                  </CardTitle>
                  <Button onClick={() => exportData('leads')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {getUniqueValues('specialty').map((specialty: string) => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {getUniqueValues('lead_status').map((status: string) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedQuizType} onValueChange={setSelectedQuizType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Quiz Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quiz Types</SelectItem>
                      {getUniqueValues('quiz_type').map((type: string) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Leads Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Quiz Type</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => {
                        const doctor = doctors.find(d => d.id === lead.doctor_id);
                        return (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {lead.email && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Mail className="w-3 h-3" />
                                    {lead.email}
                                  </div>
                                )}
                                {lead.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="w-3 h-3" />
                                    {lead.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.quiz_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={lead.score >= 7 ? "default" : lead.score >= 4 ? "secondary" : "destructive"}>
                                {lead.score}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={lead.lead_status === 'scheduled' ? "default" : "secondary"}>
                                {lead.lead_status || 'New'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">{doctor?.clinic_name || 'Unknown'}</div>
                                <div className="text-slate-500">{doctor?.specialty}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-500">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewLeadDetails(lead)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Doctor Profiles
                  </CardTitle>
                  <Button onClick={() => exportData('doctors')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {getUniqueValues('specialty').map((specialty: string) => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Active
                    </Button>
                    <Button variant="outline" size="sm">
                      <UserX className="w-4 h-4 mr-2" />
                      Inactive
                    </Button>
                  </div>
                </div>

                {/* Doctors Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Clinic</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-slate-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {doctor.first_name} {doctor.last_name}
                                </div>
                                <div className="text-sm text-slate-500">{doctor.doctor_id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{doctor.clinic_name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doctor.specialty || 'General'}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {doctor.email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="w-3 h-3" />
                                  {doctor.email}
                                </div>
                              )}
                              {doctor.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="w-3 h-3" />
                                  {doctor.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {doctor.location || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(doctor.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openDoctorLeads(doctor)}>
                                View Leads
                              </Button>
                              {(doctor.is_active === false || locallySuspendedDoctorIds.has(doctor.id)) ? (
                                <Button variant="ghost" size="sm" onClick={() => restoreDoctorAccess(doctor.id)}>
                                  Restore
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm" onClick={() => revokeDoctorAccess(doctor.id)}>
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Admin User Management
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Admin User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                <Shield className="w-4 h-4 text-slate-600" />
                              </div>
                              <div>
                                <div className="font-medium">{user.email}</div>
                                <div className="text-sm text-slate-500">ID: {user.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.is_active}
                                onCheckedChange={(checked) => handleUserAccessToggle(user.id, checked)}
                              />
                              <Badge variant={user.is_active ? "default" : "destructive"}>
                                {user.is_active ? "Active" : "Suspended"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => revokeUserAccess(user.id)}
                                disabled={!user.is_active}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Lead Generation Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    Chart visualization would go here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Quiz Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    Pie chart would go here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-slate-500">Add an extra layer of security</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Session Timeout</div>
                      <div className="text-sm text-slate-500">Auto-logout after inactivity</div>
                    </div>
                    <Select defaultValue="30">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Database Backup
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Old Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={showLeadDetails} onOpenChange={setShowLeadDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <div className="text-sm">{selectedLead.name}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="text-sm">{selectedLead.email || 'N/A'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="text-sm">{selectedLead.phone || 'N/A'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quiz Type</Label>
                  <div className="text-sm">{selectedLead.quiz_type}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Score</Label>
                  <div className="text-sm">{selectedLead.score}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="text-sm">{selectedLead.lead_status || 'New'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="text-sm">{new Date(selectedLead.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Scheduled Date</Label>
                  <div className="text-sm">{selectedLead.scheduled_date ? new Date(selectedLead.scheduled_date).toLocaleDateString() : 'Not scheduled'}</div>
                </div>
              </div>
              
              {selectedLead.answers && (
                <div>
                  <Label className="text-sm font-medium">Quiz Answers</Label>
                  <Textarea 
                    value={JSON.stringify(selectedLead.answers, null, 2)} 
                    readOnly 
                    className="mt-2"
                    rows={6}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Doctor Leads Analytics Dialog */}
      <Dialog open={showDoctorLeads} onOpenChange={setShowDoctorLeads}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Doctor Lead Analytics</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Doctor</Label>
                  <div className="text-sm font-medium">
                    {selectedDoctor.first_name} {selectedDoctor.last_name}
                  </div>
                  <div className="text-xs text-slate-500">{selectedDoctor.clinic_name || 'N/A'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Specialty</Label>
                  <div className="text-sm">{selectedDoctor.specialty || 'General'}</div>
                </div>
              </div>

              {(() => {
                const breakdown = getDoctorLeadBreakdown(selectedDoctor.id);
                const quizEntries = Object.entries(breakdown.byQuiz);
                const statusEntries = Object.entries(breakdown.byStatus);
                return (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Totals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{breakdown.total} leads</div>
                        <div className="text-xs text-slate-500 mt-1">All time leads for this doctor</div>
                        <div className="text-xs text-slate-400 mt-1">Debug: Doctor ID: {selectedDoctor.id}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">By Quiz Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {quizEntries.length === 0 && (
                            <div className="text-sm text-slate-500">No leads yet</div>
                          )}
                          {quizEntries.map(([quiz, count]) => (
                            <div key={quiz} className="flex items-center justify-between">
                              <span className="text-sm">{quiz}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">By Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {statusEntries.length === 0 && (
                            <div className="text-sm text-slate-500">No leads yet</div>
                          )}
                          {statusEntries.map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                              <span className="text-sm">{status}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Debug Information */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Debug Info</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs space-y-1">
                          <div>Total leads in system: {leads.length}</div>
                          <div>Leads for this doctor: {leads.filter(l => l.doctor_id === selectedDoctor.id).length}</div>
                          <div>Doctor ID: {selectedDoctor.id}</div>
                          <div>Sample lead doctor_id: {leads[0]?.doctor_id}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
