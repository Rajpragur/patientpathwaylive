
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { MoreHorizontal, Mail, MessageSquare, Phone, Calendar as CalendarIcon, User, Eye, CalendarDays, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/quiz';
import { useNavigate } from 'react-router-dom';
import { quizzes } from '@/data/quizzes';
import { TimeSelector } from './TimeSelector';

interface EnhancedLeadsTableProps {
  leads: Lead[];
  onLeadUpdate?: () => void;
}

export function EnhancedLeadsTable({ leads, onLeadUpdate }: EnhancedLeadsTableProps) {
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleSendCommunication = async () => {
    if (!selectedLead || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/functions/v1/send-communication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          leadId: selectedLead.id,
          type: communicationType,
          message: communicationType === 'email' ? `Subject: ${subject}\n\n${message}` : message
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(`${communicationType === 'email' ? 'Email' : 'SMS'} sent successfully!`);
      setShowCommunicationDialog(false);
      setMessage('');
      setSubject('');
      onLeadUpdate?.();
    } catch (error: any) {
      console.error('Error sending communication:', error);
      toast.error(`Failed to send ${communicationType}: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const updateData: any = { lead_status: status };
      
      // If changing to NEW status, clear the scheduled_date
      if (status === 'NEW') {
        updateData.scheduled_date = null;
      }

      const { error } = await supabase
        .from('quiz_leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;
      
      toast.success('Lead status updated');
      onLeadUpdate?.();
      
      // If status is changed to SCHEDULED, navigate to schedule page
      if (status === 'SCHEDULED') {
        navigate('/portal?tab=schedule');
      }
    } catch (error: any) {
      console.error('Error updating lead status:', error);
      toast.error('Failed to update lead status');
    }
  };

  const handleScheduleLead = async () => {
    if (!selectedDate || !selectedTime || !selectedLead) {
      toast.error('Please select both date and time');
      return;
    }

    setIsScheduling(true);
    try {
      // Combine date and time
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from('quiz_leads')
        .update({ 
          scheduled_date: scheduledDateTime.toISOString(),
          lead_status: 'SCHEDULED'
        })
        .eq('id', selectedLead.id);

      if (error) throw error;
      
      toast.success('Lead scheduled successfully!');
      setShowScheduleDialog(false);
      setSelectedDate(undefined);
      setSelectedTime('09:00');
      setSelectedLead(null);
      onLeadUpdate?.();
      
      // Navigate to schedule page to see the scheduled lead
      navigate('/portal?tab=schedule');
    } catch (error: any) {
      console.error('Error scheduling lead:', error);
      toast.error('Failed to schedule lead');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('quiz_leads')
        .delete()
        .eq('id', leadId);
      if (error) throw error;
      toast.success('Lead deleted successfully');
      onLeadUpdate?.();
    } catch (err) {
      toast.error('Failed to delete lead');
      console.error(err);
    }
  };

  const getSeverityColor = (score: number, maxScore: number = 110) => {
    const percentage = (score / maxScore) * 100;
    if (percentage <= 25) return 'bg-green-100 text-green-800';
    if (percentage <= 50) return 'bg-yellow-100 text-yellow-800';
    if (percentage <= 75) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getSeverityLabel = (score: number, maxScore: number = 110) => {
    const percentage = (score / maxScore) * 100;
    if (percentage <= 25) return 'Mild';
    if (percentage <= 50) return 'Moderate';
    if (percentage <= 75) return 'Severe';
    return 'Critical';
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Contact Information</TableHead>
            <TableHead>Quiz Type</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{lead.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-1000">
                  {lead.email && <div>{lead.email}</div>}
                  {lead.phone && <div>{lead.phone}</div>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {lead.quiz_title}
                  {lead.quiz_type && lead.quiz_type !== lead.quiz_title && (
                    <span className="ml-1 text-gray-500 text-xs">{lead.quiz_type}</span>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getSeverityColor(lead.score)}>
                  {lead.score} - {getSeverityLabel(lead.score)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{lead.lead_source}</div>
                  {lead.incident_source && lead.incident_source !== 'default' && (
                    <div className="text-gray-500">via {lead.incident_source}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {lead.lead_status || 'NEW'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'NEW')}>
                      New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'CONTACTED')}>
                      Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'SCHEDULED')}>
                      Scheduled
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>
                <div>
                  {formatDistanceToNow(new Date(lead.submitted_at), { addSuffix: true })}
                  {lead.scheduled_date && lead.lead_status === 'SCHEDULED' && (
                    <div className="text-xs text-gray-500">
                      Scheduled: {format(new Date(lead.scheduled_date), 'MMM dd, HH:mm')}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        const emailSubject = `Regarding your ${lead.quiz_type} Assessment`;
                        const emailBody = `Hello, ${lead.name}!\n\nI hope this message finds you well. I wanted to follow up regarding your recent ${lead.quiz_type} assessment.\n\n`;
                        window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank', '');
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const messageBody = `Hello, ${lead.name}!\n\nI hope this message finds you well. I wanted to follow up regarding your recent ${lead.quiz_type} assessment.\n\n`;
                        window.open(`sms:?body=${encodeURIComponent(messageBody)}`, '_blank', '');
                      }}
                      disabled={!lead.phone}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send SMS
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedLead(lead);
                        // If lead already has a scheduled date, pre-populate the form
                        if (lead.scheduled_date) {
                          const existingDate = new Date(lead.scheduled_date);
                          setSelectedDate(existingDate);
                          setSelectedTime(format(existingDate, 'HH:mm'));
                        } else {
                          setSelectedDate(undefined);
                          setSelectedTime('09:00');
                        }
                        setShowScheduleDialog(true);
                      }}
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Schedule Date
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        window.open(`tel:${lead.phone}`, '_blank');
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteLead(lead.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Lead
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Communication Dialog */}
      <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Send {communicationType === 'email' ? 'Email' : 'SMS'} to {selectedLead?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {communicationType === 'email' && (
              <Input
                placeholder="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            )}
            <Textarea
              placeholder={`Enter your ${communicationType === 'email' ? 'email' : 'SMS'} message...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
            <div className="flex gap-2">
              <Button onClick={handleSendCommunication} disabled={isSending}>
                {isSending ? 'Sending...' : `Send ${communicationType === 'email' ? 'Email' : 'SMS'}`}
              </Button>
              <Button variant="outline" onClick={() => setShowCommunicationDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Schedule appointment for {selectedLead?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date as Date)}
                className="rounded-md border p-3 pointer-events-auto"
                disabled={(date) => date < new Date()}
              />
            </div>
            <TimeSelector
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
            />
            <div className="flex gap-2">
              <Button onClick={handleScheduleLead} disabled={!selectedDate || !selectedTime || isScheduling}>
                {isScheduling ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowScheduleDialog(false);
                setSelectedDate(undefined);
                setSelectedTime('09:00');
                setSelectedLead(null);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
