
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Video,
  FileText,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export function SupportPage() {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const handleSubmitTicket = () => {
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Support ticket submitted successfully!');
    setTicketForm({ subject: '', message: '', priority: 'medium' });
  };

  const supportTickets = [
    {
      id: 'TICK-001',
      subject: 'Quiz sharing not working',
      status: 'open',
      priority: 'high',
      created: '2024-01-15',
      lastUpdate: '2024-01-16'
    },
    {
      id: 'TICK-002',
      subject: 'Lead export issue',
      status: 'resolved',
      priority: 'medium',
      created: '2024-01-10',
      lastUpdate: '2024-01-12'
    }
  ];

  const faqItems = [
    {
      question: 'How do I share quizzes with patients?',
      answer: 'Go to Quiz Management, select a quiz, and choose from various sharing options including direct link, embed code, or social media sharing.'
    },
    {
      question: 'Why are leads not showing up in my dashboard?',
      answer: 'Leads only appear after patients complete the quiz and submit their contact information. Simply opening the quiz link does not create a lead.'
    },
    {
      question: 'How do I export my lead data?',
      answer: 'In the Leads page, use the export button to download your lead data in CSV format for analysis.'
    },
    {
      question: 'Can I customize the quiz questions?',
      answer: 'Currently, quiz questions are standardized medical assessments. Contact support for custom quiz requirements.'
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#0E7C9D]">Support Center</h1>
          <p className="text-gray-600 mt-2 text-lg">Get help with your Patient Pathway portal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Options */}
        <div className="space-y-6">
          <Card className="hover-lift rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-[#0E7C9D] flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-xs text-gray-600">support@patientpathway.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Phone Support</p>
                  <p className="text-xs text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Support Hours</p>
                  <p className="text-xs text-gray-600">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Resources */}
          <Card className="hover-lift rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-[#0E7C9D]">Quick Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl">
                <BookOpen className="w-4 h-4" />
                User Guide
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl">
                <Video className="w-4 h-4" />
                Video Tutorials
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl">
                <FileText className="w-4 h-4" />
                API Documentation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Tickets & FAQ */}
        <div className="lg:col-span-2 space-y-8">
          {/* Create Ticket */}
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-[#0E7C9D]">Submit a Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7C9D]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  placeholder="Please describe your issue in detail..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  className="min-h-32 rounded-xl"
                />
              </div>
              
              <Button onClick={handleSubmitTicket} className="w-full bg-[#0E7C9D] hover:bg-[#0E7C9D]/90 rounded-xl">
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </Button>
            </CardContent>
          </Card>

          {/* Your Tickets */}
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-[#0E7C9D]">Your Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-600">{ticket.id}</span>
                        <Badge 
                          variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                          className="rounded-full"
                        >
                          {ticket.status === 'resolved' ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {ticket.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`rounded-full ${
                            ticket.priority === 'high' ? 'border-red-300 text-red-600' :
                            ticket.priority === 'medium' ? 'border-yellow-300 text-yellow-600' :
                            'border-green-300 text-green-600'
                          }`}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">Updated: {ticket.lastUpdate}</span>
                    </div>
                    <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                    <p className="text-xs text-gray-500 mt-1">Created: {ticket.created}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-[#0E7C9D]">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
