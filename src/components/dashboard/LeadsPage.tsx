import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  Eye,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  quiz_type: string;
  score: number;
  submitted_at: string;
  lead_source: string | null;
  lead_status: string | null;
}

export function LeadsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [user, filterType]);

  const fetchLeads = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('quiz_leads')
        .select('*')
        .eq('doctor_id', user.id)
        .order('submitted_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('quiz_type', filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchStr = `${lead.name} ${lead.email} ${lead.phone}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quiz_leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      toast.success('Lead deleted successfully!');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleViewDetails = (leadId: string) => {
    navigate(`/portal/leads/${leadId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <div className="flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search leads..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Quiz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quizzes</SelectItem>
              <SelectItem value="NOSE">NOSE Assessment</SelectItem>
              <SelectItem value="DHI">Dizziness Handicap Inventory</SelectItem>
              <SelectItem value="Epworth">Epworth Sleepiness Scale</SelectItem>
              <SelectItem value="HHIA">Hearing Handicap Inventory</SelectItem>
              <SelectItem value="SNOT22">SNOT-22</SelectItem>
              <SelectItem value="STOP">STOP-Bang Questionnaire</SelectItem>
              <SelectItem value="TNSS">TNSS</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading leads...</div>
      ) : (
        <div className="grid gap-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center">No leads found.</div>
          ) : (
            filteredLeads.map(lead => (
              <Card key={lead.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {lead.name}
                    <Badge variant="secondary">{lead.quiz_type}</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(lead.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Contact Information</p>
                    <p className="text-gray-600">
                      <Mail className="w-4 h-4 inline-block mr-1" />
                      {lead.email || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      <Phone className="w-4 h-4 inline-block mr-1" />
                      {lead.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Assessment Details</p>
                    <p className="text-gray-600">
                      <Calendar className="w-4 h-4 inline-block mr-1" />
                      Submitted:{' '}
                      {new Date(lead.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Score: {lead.score}
                    </p>
                    {lead.lead_source && (
                      <p className="text-gray-600">
                        Source: {lead.lead_source}
                      </p>
                    )}
                    {lead.lead_status && (
                      <p className="text-gray-600">
                        Status: {lead.lead_status}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
