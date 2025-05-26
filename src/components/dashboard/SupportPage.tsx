
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  CheckCircle,
  HelpCircle,
  Book,
  Video,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export function SupportPage() {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
    setTicketForm({
      subject: '',
      category: 'general',
      priority: 'medium',
      description: ''
    });
  };

  const faqItems = [
    {
      question: 'How do I share a quiz with my patients?',
      answer: 'Go to Quiz Management, select the quiz you want to share, and choose from various sharing options including direct links, embed codes, or social media sharing.'
    },
    {
      question: 'Can I customize the quiz questions?',
      answer: 'The quiz questions are medically validated and cannot be modified to ensure clinical accuracy. However, you can choose which quizzes to share with your patients.'
    },
    {
      question: 'How are quiz scores calculated?',
      answer: 'Each quiz uses clinically validated scoring algorithms. The scores help categorize symptom severity and provide standardized assessments for medical evaluation.'
    },
    {
      question: 'Is patient data secure?',
      answer: 'Yes, all patient data is encrypted and stored securely. We comply with HIPAA regulations and use industry-standard security measures to protect sensitive information.'
    },
    {
      question: 'How do I track my quiz performance?',
      answer: 'Use the Analytics and Trends pages to view detailed statistics about quiz completions, lead generation, and patient engagement metrics.'
    }
  ];

  const resourceLinks = [
    { title: 'Getting Started Guide', icon: Book, description: 'Learn the basics of using the Patient Pathway Portal' },
    { title: 'Video Tutorials', icon: Video, description: 'Watch step-by-step tutorials for common tasks' },
    { title: 'API Documentation', icon: FileText, description: 'Technical documentation for developers' },
    { title: 'Best Practices', icon: CheckCircle, description: 'Tips for maximizing patient engagement' }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] bg-clip-text text-transparent mb-4">
          Support Center
        </h1>
        <p className="text-gray-600 text-lg">
          We're here to help you make the most of Patient Pathway Portal
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Options */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#0E7C9D] flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 rounded-2xl"
              onClick={() => window.open('mailto:support@patientpathway.com')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Support
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start rounded-2xl border-[#0E7C9D] text-[#0E7C9D] hover:bg-[#0E7C9D] hover:text-white"
              onClick={() => window.open('tel:+1-800-PATHWAY')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Us: 1-800-PATHWAY
            </Button>
            <div className="text-xs text-gray-500 text-center mt-4">
              Monday - Friday, 9 AM - 6 PM EST
            </div>
          </CardContent>
        </Card>

        {/* Submit Ticket */}
        <Card className="lg:col-span-2 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#0E7C9D]">Submit a Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Subject"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="rounded-2xl"
                />
                <select
                  className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>
              <select
                className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={ticketForm.priority}
                onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <Textarea
                placeholder="Please describe your issue or question in detail..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                className="rounded-2xl"
              />
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 rounded-2xl"
              >
                Submit Ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-[#0E7C9D] flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-[#0E7C9D]">Helpful Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resourceLinks.map((resource, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
                <resource.icon className="w-8 h-8 text-[#0E7C9D] mb-3" />
                <h4 className="font-semibold text-gray-800 mb-2">{resource.title}</h4>
                <p className="text-xs text-gray-600">{resource.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-2xl">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">All systems operational</span>
        </div>
      </div>
    </div>
  );
}
