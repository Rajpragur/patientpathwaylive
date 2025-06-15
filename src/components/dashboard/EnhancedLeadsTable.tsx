
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar,
  User,
  Clock,
  Download,
  Send,
  MessageSquare,
  ChevronDown,
  FileText,
  Database,
  FileImage
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  quiz_type: string;
  score: number;
  submitted_at: string;
  lead_status: string;
  custom_quiz_id?: string;
  custom_quiz_title?: string;
}

interface EnhancedLeadsTableProps {
  onScheduleLead?: (lead: Lead) => void;
}

export function EnhancedLeadsTable({ onScheduleLead }: EnhancedLeadsTableProps) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.phone?.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || lead.lead_status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort leads
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'quiz_type':
          aValue = a.custom_quiz_title || a.quiz_type;
          bValue = b.custom_quiz_title || b.quiz_type;
          break;
        default:
          aValue = new Date(a.submitted_at).getTime();
          bValue = new Date(b.submitted_at).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchLeads = async () => {
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (doctorProfile) {
        const { data: leadsData } = await supabase
          .from('quiz_leads')
          .select(`
            *,
            custom_quizzes(title)
          `)
          .eq('doctor_id', doctorProfile.id)
          .order('submitted_at', { ascending: false });

        if (leadsData) {
          const processedLeads = leadsData.map(lead => ({
            ...lead,
            custom_quiz_title: lead.custom_quizzes?.title
          }));
          setLeads(processedLeads);
        }
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const exportData = filteredLeads.map(lead => ({
        Name: lead.name,
        Email: lead.email || '',
        Phone: lead.phone || '',
        'Quiz Type': lead.custom_quiz_title || lead.quiz_type,
        Score: lead.score,
        Status: lead.lead_status,
        'Submitted At': format(new Date(lead.submitted_at), 'yyyy-MM-dd HH:mm:ss')
      }));

      if (format === 'csv') {
        const csvHeaders = Object.keys(exportData[0]).join(',');
        const csvRows = exportData.map(row => Object.values(row).join(','));
        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // For PDF, we'll create a simple HTML table and print it
        const htmlContent = `
          <html>
            <head>
              <title>Leads Export</title>
              <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h2>Leads Export - ${new Date().toLocaleDateString()}</h2>
              <table>
                <thead>
                  <tr>
                    ${Object.keys(exportData[0]).map(key => `<th>${key}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${exportData.map(row => `
                    <tr>
                      ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(htmlContent);
        printWindow?.document.close();
        printWindow?.print();
      }

      toast.success(`Leads exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export leads');
    }
  };

  const handleSendCommunication = async () => {
    if (!selectedLead || !message.trim()) return;

    try {
      const { error } = await supabase.functions.invoke('send-communication', {
        body: {
          leadId: selectedLead.id,
          type: communicationType,
          message: message.trim(),
          email: selectedLead.email,
          phone: selectedLead.phone
        }
      });

      if (error) throw error;

      toast.success(`${communicationType === 'email' ? 'Email' : 'SMS'} sent successfully`);
      setShowCommunicationDialog(false);
      setMessage('');
      setSelectedLead(null);
    } catch (error) {
      console.error('Communication error:', error);
      toast.error(`Failed to send ${communicationType}`);
    }
  };

  const getQuizDisplayName = (lead: Lead) => {
    return lead.custom_quiz_title || lead.quiz_type;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading leads...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600">Manage and track your patient leads</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select onValueChange={(value) => handleExport(value as 'csv' | 'json' | 'pdf')}>
            <SelectTrigger className="w-[140px]">
              <Download className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CSV
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  JSON
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  PDF
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted_at">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="quiz_type">Quiz Type</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Patient</th>
                  <th className="text-left p-4 font-medium text-gray-700">Assessment</th>
                  <th className="text-left p-4 font-medium text-gray-700">Score</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Date</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <div className="text-sm text-gray-500 space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-gray-900">
                        {getQuizDisplayName(lead)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {lead.score}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(lead.lead_status)}>
                        {lead.lead_status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {format(new Date(lead.submitted_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowCommunicationDialog(true);
                          }}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Contact
                        </Button>
                        {onScheduleLead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onScheduleLead(lead)}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Schedule
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leads found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          <Tabs value={communicationType} onValueChange={(value) => setCommunicationType(value as 'email' | 'sms')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4">
              <Textarea
                placeholder="Enter your email message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </TabsContent>
            <TabsContent value="sms" className="space-y-4">
              <Textarea
                placeholder="Enter your SMS message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </TabsContent>
          </Tabs>
          <div className="flex gap-2">
            <Button onClick={handleSendCommunication} disabled={!message.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send {communicationType === 'email' ? 'Email' : 'SMS'}
            </Button>
            <Button variant="outline" onClick={() => setShowCommunicationDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
