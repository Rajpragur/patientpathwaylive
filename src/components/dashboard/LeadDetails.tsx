
import { Lead } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, User, Mail, Phone, Calendar, FileText } from 'lucide-react';

interface LeadDetailsProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetails({ lead, onClose }: LeadDetailsProps) {
  const getSeverityColor = (score: number) => {
    if (score > 50) return 'text-red-600 bg-red-50 border-red-200';
    if (score > 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">{lead.name}</CardTitle>
              <p className="text-slate-600">{lead.quiz_type} Assessment</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Submitted: {new Date(lead.submitted_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Assessment Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Quiz Type:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {lead.quiz_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Score:</span>
                  <Badge className={`${getSeverityColor(lead.score)} border`}>
                    {lead.score}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge className={`${getStatusColor(lead.lead_status)}`}>
                    {lead.lead_status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Source:</span>
                  <Badge variant="outline">
                    {lead.lead_source}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quiz Answers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiz Responses</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.answers && Array.isArray(lead.answers) ? (
                <div className="space-y-4">
                  {lead.answers.map((answer: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-slate-50">
                      <div className="font-medium text-slate-800 mb-2">
                        Question {index + 1}: {answer.questionId}
                      </div>
                      <div className="text-slate-600">
                        Answer: <span className="font-medium">{answer.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No detailed answers available</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={() => window.print()}
            >
              Print Report
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
