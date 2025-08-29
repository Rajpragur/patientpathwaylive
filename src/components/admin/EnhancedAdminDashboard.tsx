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
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState<Set<string>>(new Set());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    doctors: '',
    leads: '',
    users: ''
  });

  useEffect(() => {
    fetchAdminData();
  }, [selectedTimeframe]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctors
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (doctorError) {
        console.error('Error fetching doctors:', doctorError);
      }

      // Fetch leads
      const { data: leadData, error: leadError } = await supabase
        .from('quiz_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadError) {
        console.error('Error fetching leads:', leadError);
      }

      // Fetch admin users
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) {
        console.error('Error fetching admin users:', userError);
      }

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

  // Function to create sample leads for testing (remove in production)




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
            
            <Button 
              onClick={() => setShowAddDoctor(true)} 
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
            
            <Button 
              onClick={() => setShowBulkActions(true)} 
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
            
            <Button 
              onClick={() => setShowNotifications(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            
            <Button 
              onClick={() => setShowQuickActions(true)}
              variant="outline"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Quick Actions
            </Button>
          </div>
        </div>



        {/* Search and Quick Stats */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search doctors, leads, or analytics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {stats.totalDoctors} Doctors
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {stats.totalLeads} Leads
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {stats.leadsThisWeek} This Week
            </Badge>
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
          <TabsList className="grid w-full grid-cols-7 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="doctors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Doctors ({filteredDoctors.length})
            </TabsTrigger>
            <TabsTrigger value="doctorAnalytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Doctor Analytics
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
            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setShowAddDoctor(true)}>
                <UserPlus className="w-8 h-8 text-green-600" />
                <span className="text-sm">Add Doctor</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={fetchAdminData}>
                <Database className="w-8 h-8 text-blue-600" />
                <span className="text-sm">Refresh Data</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => exportData('doctors')}>
                <Download className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Export Data</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setShowNotifications(true)}>
                <Bell className="w-8 h-8 text-red-600" />
                <span className="text-sm">Notifications</span>
              </Button>
            </div>

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
                    Lead Analytics (HIPAA Compliant)
                  </CardTitle>
                  <div className="text-sm text-slate-500">
                    No personal information displayed - only aggregated data
                  </div>
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
                        <TableHead>Leads by Quiz Type</TableHead>
                        <TableHead>Total Leads</TableHead>
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
                              {(() => {
                                const doctorLeads = leads.filter(l => l.doctor_id === doctor.id);
                                const leadsByQuiz: { [key: string]: number } = {};
                                
                                doctorLeads.forEach(lead => {
                                  leadsByQuiz[lead.quiz_type] = (leadsByQuiz[lead.quiz_type] || 0) + 1;
                                });
                                
                                return (
                                  <>
                                    {Object.entries(leadsByQuiz).map(([quizType, count]) => (
                                      <div key={quizType} className="flex items-center justify-between text-xs">
                                        <span className="text-slate-600">{quizType}:</span>
                                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                                      </div>
                                    ))}
                                    {Object.keys(leadsByQuiz).length === 0 && (
                                      <span className="text-xs text-slate-400">No leads yet</span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {leads.filter(l => l.doctor_id === doctor.id).length}
                              </div>
                              <div className="text-xs text-slate-500">Total</div>
                            </div>
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

          {/* Doctor Analytics Tab */}
          <TabsContent value="doctorAnalytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Comprehensive Doctor Analytics
                  </CardTitle>
                  <Button onClick={() => exportData('doctors')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Analytics
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Quiz Type Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Quiz Type Distribution Across All Doctors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      if (!leads || leads.length === 0) {
                        return (
                          <div className="col-span-2 md:col-span-4 text-center py-8">
                            <div className="text-lg text-slate-500">No leads found yet</div>
                            <div className="text-sm text-slate-400">Take quizzes or create sample leads to see data</div>
                          </div>
                        );
                      }
                      
                      const quizTypeTotals = leads.reduce((acc, lead) => {
                        acc[lead.quiz_type] = (acc[lead.quiz_type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      return Object.entries(quizTypeTotals).map(([quizType, count]) => (
                        <Card key={quizType} className="text-center">
                          <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-blue-600">{count}</div>
                            <div className="text-sm text-slate-600">{quizType}</div>
                            <div className="text-xs text-slate-400">Total Leads</div>
                          </CardContent>
                        </Card>
                      ));
                    })()}
                  </div>
                </div>

                {/* Detailed Doctor Analytics Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Clinic</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>NOSE</TableHead>
                        <TableHead>SNOT22</TableHead>
                        <TableHead>SNOT12</TableHead>
                        <TableHead>TNSS</TableHead>
                        <TableHead>Other</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doctor) => {
                        const doctorLeads = leads.filter(l => l.doctor_id === doctor.id);
                        const totalLeads = doctorLeads.length;
                        
                        // Count leads by quiz type
                        const noseLeads = doctorLeads.filter(l => l.quiz_type === 'NOSE').length;
                        const snot22Leads = doctorLeads.filter(l => l.quiz_type === 'SNOT22').length;
                        const snot12Leads = doctorLeads.filter(l => l.quiz_type === 'SNOT12').length;
                        const tnssLeads = doctorLeads.filter(l => l.quiz_type === 'TNSS').length;
                        const otherLeads = totalLeads - noseLeads - snot22Leads - snot12Leads - tnssLeads;
                        
                        return (
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
                                  <div className="text-sm text-slate-500">{doctor.clinic_name || 'N/A'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{doctor.clinic_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{doctor.specialty || 'General'}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{noseLeads}</div>
                                <div className="text-xs text-slate-500">NOSE</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{snot22Leads}</div>
                                <div className="text-xs text-slate-500">SNOT22</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{snot12Leads}</div>
                                <div className="text-xs text-slate-500">SNOT12</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">{tnssLeads}</div>
                                <div className="text-xs text-slate-500">TNSS</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="text-lg font-bold text-slate-600">{otherLeads}</div>
                                <div className="text-xs text-slate-500">Other</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-center">
                                <div className="text-xl font-bold text-red-600">{totalLeads}</div>
                                <div className="text-xs text-slate-500">Total</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => openDoctorLeads(doctor)}>
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">Top Performing Doctor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        if (!filteredDoctors || filteredDoctors.length === 0) {
                          return (
                            <div>
                              <div className="text-lg font-bold text-blue-600">N/A</div>
                              <div className="text-sm text-slate-500">0 leads</div>
                            </div>
                          );
                        }
                        
                        const topDoctor = filteredDoctors.reduce((top, current) => {
                          const topLeads = leads.filter(l => l.doctor_id === top.id).length;
                          const currentLeads = leads.filter(l => l.doctor_id === current.id).length;
                          return currentLeads > topLeads ? current : top;
                        }, filteredDoctors[0]);
                        
                        const topDoctorLeads = leads.filter(l => l.doctor_id === topDoctor?.id).length;
                        
                        return (
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {topDoctor ? `${topDoctor.first_name} ${topDoctor.last_name}` : 'N/A'}
                            </div>
                            <div className="text-sm text-slate-500">{topDoctorLeads} leads</div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">Most Popular Quiz</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        if (!leads || leads.length === 0) {
                          return (
                            <div>
                              <div className="text-lg font-bold text-green-600">N/A</div>
                              <div className="text-sm text-slate-500">0 leads</div>
                            </div>
                          );
                        }
                        
                        const quizTypeTotals = leads.reduce((acc, lead) => {
                          acc[lead.quiz_type] = (acc[lead.quiz_type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        
                        if (Object.keys(quizTypeTotals).length === 0) {
                          return (
                            <div>
                              <div className="text-lg font-bold text-green-600">N/A</div>
                              <div className="text-sm text-slate-500">0 leads</div>
                            </div>
                          );
                        }
                        
                        const mostPopular = Object.entries(quizTypeTotals).reduce((a, b) => 
                          quizTypeTotals[a[0]] > quizTypeTotals[b[0]] ? a : b
                        );
                        
                        return (
                          <div>
                            <div className="text-lg font-bold text-green-600">{mostPopular?.[0] || 'N/A'}</div>
                            <div className="text-sm text-slate-500">{mostPopular?.[1] || 0} leads</div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">Average Leads per Doctor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-purple-600">
                        {filteredDoctors.length > 0 ? Math.round(leads.length / filteredDoctors.length) : 0}
                      </div>
                      <div className="text-sm text-slate-500">Across all doctors</div>
                    </CardContent>
                  </Card>
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

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              System Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">New leads this week</div>
                  <div className="text-xs text-slate-600">{stats.leadsThisWeek} new patient assessments</div>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">System health</div>
                  <div className="text-xs text-slate-600">All systems operational</div>
                </div>
                <Badge variant="default">Good</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Data backup</div>
                  <div className="text-xs text-slate-600">Last backup: 2 hours ago</div>
                </div>
                <Badge variant="secondary">Info</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Mark All Read
              </Button>
              <Button variant="outline" onClick={() => setShowNotifications(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions Dialog */}
      <Dialog open={showQuickActions} onOpenChange={setShowQuickActions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                setShowQuickActions(false);
                setShowAddDoctor(true);
              }}
            >
              <UserPlus className="w-6 h-6" />
              <span>Add Doctor</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                setShowQuickActions(false);
                fetchAdminData();
              }}
            >
              <Database className="w-6 h-6" />
              <span>Refresh Data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => exportData('doctors')}
            >
              <Download className="w-6 h-6" />
              <span>Export Doctors</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => exportData('leads')}
            >
              <TrendingUp className="w-6 h-6" />
              <span>Export Analytics</span>
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowQuickActions(false)} className="flex-1">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Add Doctor Dialog */}
      <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div>
                <Label htmlFor="firstName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@clinic.com" />
            </div>
            <div>
              <Label htmlFor="clinic">Clinic Name</Label>
              <Input id="clinic" placeholder="City Medical Center" />
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENT">ENT</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Dermatology">Dermatology</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, State" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 123-4567" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
              <Button variant="outline" onClick={() => setShowAddDoctor(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium">Selected Doctors: {selectedDoctors.size}</div>
              <div className="text-xs text-slate-500">Choose an action to perform on all selected doctors</div>
            </div>
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="w-4 h-4 mr-2" />
                Activate All
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserX className="w-4 h-4 mr-2" />
                Deactivate All
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBulkActions(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
