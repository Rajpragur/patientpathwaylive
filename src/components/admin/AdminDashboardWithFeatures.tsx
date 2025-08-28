import { useState, useEffect } from 'react';
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
  TrendingUp,
  Calendar,
  FileText,
  Search,
  Download,
  Eye,
  MapPin,
  Building,
  UserCheck,
  UserX,
  Target,
  PieChart,
  Key,
  Trash2,
  Edit,
  Ban,
  UserPlus,
  Settings2,
  Lock,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface DoctorProfile {
  id: string;
  clinic_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  specialty: string | null;
  created_at: string;
  user_id: string;
  is_active?: boolean;
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

interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export function AdminDashboardWithFeatures() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalLeads: 0,
    activeQuizzes: 7,
    conversionRate: 0,
    leadsThisMonth: 0,
    leadsThisWeek: 0,
    averageScore: 0,
    topSpecialties: [] as string[],
    activeUsers: 0,
    suspendedUsers: 0
  });
  
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [leads, setLeads] = useState<QuizLead[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Admin management states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState<QuizLead | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const { data: doctorData } = await supabase
        .from('doctor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

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
      
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const leadsThisMonth = leadData?.filter(lead => 
        new Date(lead.created_at) >= monthAgo
      ).length || 0;
      
      const leadsThisWeek = leadData?.filter(lead => 
        new Date(lead.created_at) >= weekAgo
      ).length || 0;
      
      const totalScore = leadData?.reduce((sum, lead) => sum + lead.score, 0) || 0;
      const averageScore = leadData?.length > 0 ? totalScore / leadData.length : 0;
      
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
        activeUsers: 1, // You as admin
        suspendedUsers: 0
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm));
    
    const matchesSpecialty = selectedSpecialty === 'all' || 
      doctors.find(d => d.id === lead.doctor_id)?.specialty === selectedSpecialty;
    
    const matchesStatus = selectedStatus === 'all' || lead.lead_status === selectedStatus;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });

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
    }
    return Array.from(values);
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
      // This would update a user's access in your database
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
            {/* Password Change Dialog */}
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

            <Button className="bg-red-600 hover:bg-red-700">
              <Lock className="w-4 h-4 mr-2" />
              Admin Controls
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

        {/* Main Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
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
              User Management
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                                <div className="text-sm text-slate-500">{doctor.id}</div>
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
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
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

          {/* User Management Tab */}
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
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                              <Shield className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium">patientpathway@admin.com</div>
                              <div className="text-sm text-slate-500">Super Admin</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Super Admin</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={true} disabled />
                            <Badge variant="default">Active</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date().toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date().toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}

