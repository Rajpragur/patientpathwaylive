import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, 
  MessageSquare, 
  Mail, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  Play, 
  Pause,
  CheckCircle2,
  Settings,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Automation {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'webhook';
  trigger: 'new_lead' | 'assessment_completed' | 'scheduled' | 'manual';
  status: 'active' | 'paused' | 'draft';
  content: string;
  subject?: string;
  delay?: number;
  contactList?: string;
  lastRun?: string;
  stats?: {
    sent: number;
    opened?: number;
    clicked?: number;
  };
}

export function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'New Lead Welcome Email',
      type: 'email',
      trigger: 'new_lead',
      status: 'active',
      subject: 'Thank you for completing our assessment',
      content: 'Hi {{name}},\n\nThank you for completing our {{quiz_type}} assessment. Your score was {{score}}.\n\nWould you like to schedule a consultation to discuss your results?\n\nBest regards,\nDr. {{doctor_name}}',
      delay: 0,
      contactList: 'All Leads',
      lastRun: '2025-06-15',
      stats: {
        sent: 124,
        opened: 98,
        clicked: 45
      }
    },
    {
      id: '2',
      name: 'Follow-up SMS Reminder',
      type: 'sms',
      trigger: 'assessment_completed',
      status: 'active',
      content: 'Hi {{name}}, this is Dr. {{doctor_name}}. Just following up on your {{quiz_type}} assessment. Would you like to discuss your results? Reply YES to schedule a call.',
      delay: 24,
      lastRun: '2025-06-14',
      stats: {
        sent: 86,
        clicked: 32
      }
    },
    {
      id: '3',
      name: 'Appointment Reminder',
      type: 'email',
      trigger: 'scheduled',
      status: 'paused',
      subject: 'Your upcoming appointment',
      content: 'Hi {{name}},\n\nThis is a reminder about your appointment on {{appointment_date}} at {{appointment_time}}.\n\nPlease let us know if you need to reschedule.\n\nBest regards,\nDr. {{doctor_name}}',
      delay: 24,
      contactList: 'Scheduled Patients',
      lastRun: '2025-06-10',
      stats: {
        sent: 45,
        opened: 42,
        clicked: 12
      }
    }
  ]);
  
  const [showNewAutomation, setShowNewAutomation] = useState(false);
  const [newAutomation, setNewAutomation] = useState<Partial<Automation>>({
    name: '',
    type: 'email',
    trigger: 'new_lead',
    status: 'draft',
    content: '',
    subject: '',
    delay: 0
  });
  
  const [editingAutomation, setEditingAutomation] = useState<string | null>(null);
  
  const handleCreateAutomation = () => {
    if (!newAutomation.name || !newAutomation.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const automation: Automation = {
      id: Date.now().toString(),
      name: newAutomation.name || 'New Automation',
      type: newAutomation.type || 'email',
      trigger: newAutomation.trigger || 'new_lead',
      status: 'draft',
      content: newAutomation.content || '',
      subject: newAutomation.type === 'email' ? newAutomation.subject : undefined,
      delay: newAutomation.delay || 0,
      stats: {
        sent: 0
      }
    };
    
    setAutomations(prev => [...prev, automation]);
    setNewAutomation({
      name: '',
      type: 'email',
      trigger: 'new_lead',
      status: 'draft',
      content: '',
      subject: '',
      delay: 0
    });
    setShowNewAutomation(false);
    toast.success('Automation created successfully');
  };
  
  const handleUpdateAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(automation => 
        automation.id === id 
          ? { ...automation, ...newAutomation as Automation } 
          : automation
      )
    );
    setEditingAutomation(null);
    toast.success('Automation updated successfully');
  };
  
  const handleDeleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(automation => automation.id !== id));
    toast.success('Automation deleted');
  };
  
  const handleToggleStatus = (id: string) => {
    setAutomations(prev => 
      prev.map(automation => 
        automation.id === id 
          ? { 
              ...automation, 
              status: automation.status === 'active' ? 'paused' : 'active' 
            } 
          : automation
      )
    );
    
    const automation = automations.find(a => a.id === id);
    if (automation) {
      toast.success(`Automation ${automation.status === 'active' ? 'paused' : 'activated'}`);
    }
  };
  
  const handleEditAutomation = (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation) {
      setNewAutomation(automation);
      setEditingAutomation(id);
      setShowNewAutomation(true);
    }
  };
  
  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'new_lead': return 'New Lead';
      case 'assessment_completed': return 'Assessment Completed';
      case 'scheduled': return 'Appointment Scheduled';
      case 'manual': return 'Manual Trigger';
      default: return trigger;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'webhook': return <Zap className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'sms': return 'bg-green-50 text-green-600 border-green-200';
      case 'webhook': return 'bg-purple-50 text-purple-600 border-purple-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-600 border-green-200';
      case 'paused': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'draft': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation</h2>
          <p className="text-gray-600">Create and manage automated communications</p>
        </div>
        <Button 
          onClick={() => {
            setShowNewAutomation(true);
            setEditingAutomation(null);
            setNewAutomation({
              name: '',
              type: 'email',
              trigger: 'new_lead',
              status: 'draft',
              content: '',
              subject: '',
              delay: 0
            });
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Automation
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Automations</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {automations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Automations Yet</h3>
                <p className="text-gray-500 mb-4">Create your first automation to start engaging with your patients automatically.</p>
                <Button 
                  onClick={() => {
                    setShowNewAutomation(true);
                    setEditingAutomation(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {automations.map(automation => (
                <Card key={automation.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">{automation.name}</h3>
                          <Badge variant="outline" className={getStatusColor(automation.status)}>
                            {automation.status === 'active' ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : automation.status === 'paused' ? (
                              <Pause className="w-3 h-3 mr-1" />
                            ) : (
                              <Edit className="w-3 h-3 mr-1" />
                            )}
                            {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className={getTypeColor(automation.type)}>
                            {getTypeIcon(automation.type)}
                            <span className="ml-1 capitalize">{automation.type}</span>
                          </Badge>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>
                              {automation.delay === 0 
                                ? 'Immediate' 
                                : `After ${automation.delay} hour${automation.delay > 1 ? 's' : ''}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            <span>When: {getTriggerLabel(automation.trigger)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                          {automation.type === 'email' && automation.subject && (
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Subject: {automation.subject}
                            </div>
                          )}
                          <div className="text-sm text-gray-600 whitespace-pre-line">
                            {automation.content.length > 150 
                              ? `${automation.content.substring(0, 150)}...` 
                              : automation.content}
                          </div>
                        </div>
                        
                        {automation.stats && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">{automation.stats.sent}</span> sent
                            </div>
                            {automation.stats.opened !== undefined && (
                              <div className="text-gray-600">
                                <span className="font-medium">{automation.stats.opened}</span> opened
                              </div>
                            )}
                            {automation.stats.clicked !== undefined && (
                              <div className="text-gray-600">
                                <span className="font-medium">{automation.stats.clicked}</span> clicked
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(automation.id)}
                          className={automation.status === 'active' 
                            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                        >
                          {automation.status === 'active' ? (
                            <>
                              <Pause className="w-3.5 h-3.5 mr-1.5" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 mr-1.5" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAutomation(automation.id)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAutomation(automation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {automations
              .filter(automation => automation.type === 'email')
              .map(automation => (
                <Card key={automation.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">{automation.name}</h3>
                          <Badge variant="outline" className={getStatusColor(automation.status)}>
                            {automation.status === 'active' ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : automation.status === 'paused' ? (
                              <Pause className="w-3 h-3 mr-1" />
                            ) : (
                              <Edit className="w-3 h-3 mr-1" />
                            )}
                            {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                            <Mail className="w-4 h-4 mr-1" />
                            <span className="ml-1">Email</span>
                          </Badge>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>
                              {automation.delay === 0 
                                ? 'Immediate' 
                                : `After ${automation.delay} hour${automation.delay > 1 ? 's' : ''}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            <span>When: {getTriggerLabel(automation.trigger)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                          {automation.subject && (
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Subject: {automation.subject}
                            </div>
                          )}
                          <div className="text-sm text-gray-600 whitespace-pre-line">
                            {automation.content.length > 150 
                              ? `${automation.content.substring(0, 150)}...` 
                              : automation.content}
                          </div>
                        </div>
                        
                        {automation.stats && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">{automation.stats.sent}</span> sent
                            </div>
                            {automation.stats.opened !== undefined && (
                              <div className="text-gray-600">
                                <span className="font-medium">{automation.stats.opened}</span> opened
                              </div>
                            )}
                            {automation.stats.clicked !== undefined && (
                              <div className="text-gray-600">
                                <span className="font-medium">{automation.stats.clicked}</span> clicked
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(automation.id)}
                          className={automation.status === 'active' 
                            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                        >
                          {automation.status === 'active' ? (
                            <>
                              <Pause className="w-3.5 h-3.5 mr-1.5" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 mr-1.5" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAutomation(automation.id)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAutomation(automation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {automations
              .filter(automation => automation.type === 'sms')
              .map(automation => (
                <Card key={automation.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">{automation.name}</h3>
                          <Badge variant="outline" className={getStatusColor(automation.status)}>
                            {automation.status === 'active' ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : automation.status === 'paused' ? (
                              <Pause className="w-3 h-3 mr-1" />
                            ) : (
                              <Edit className="w-3 h-3 mr-1" />
                            )}
                            {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="ml-1">SMS</span>
                          </Badge>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            <span>
                              {automation.delay === 0 
                                ? 'Immediate' 
                                : `After ${automation.delay} hour${automation.delay > 1 ? 's' : ''}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            <span>When: {getTriggerLabel(automation.trigger)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                          <div className="text-sm text-gray-600 whitespace-pre-line">
                            {automation.content}
                          </div>
                        </div>
                        
                        {automation.stats && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">{automation.stats.sent}</span> sent
                            </div>
                            {automation.stats.clicked !== undefined && (
                              <div className="text-gray-600">
                                <span className="font-medium">{automation.stats.clicked}</span> clicked
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(automation.id)}
                          className={automation.status === 'active' 
                            ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50' 
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                        >
                          {automation.status === 'active' ? (
                            <>
                              <Pause className="w-3.5 h-3.5 mr-1.5" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 mr-1.5" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAutomation(automation.id)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAutomation(automation.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Webhook Automations</h3>
              <p className="text-gray-500 mb-4">Create your first webhook automation to integrate with external services.</p>
              <Button 
                onClick={() => {
                  setShowNewAutomation(true);
                  setEditingAutomation(null);
                  setNewAutomation({
                    name: '',
                    type: 'webhook',
                    trigger: 'new_lead',
                    status: 'draft',
                    content: '',
                    delay: 0
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook Automation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showNewAutomation && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {editingAutomation ? 'Edit Automation' : 'Create New Automation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="automation_name">Automation Name</Label>
                  <Input
                    id="automation_name"
                    placeholder="e.g., Welcome Email"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="automation_type">Type</Label>
                  <select
                    id="automation_type"
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                    value={newAutomation.type}
                    onChange={(e) => setNewAutomation(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'email' | 'sms' | 'webhook',
                      subject: e.target.value === 'email' ? prev.subject : undefined
                    }))}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="automation_trigger">Trigger</Label>
                  <select
                    id="automation_trigger"
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                    value={newAutomation.trigger}
                    onChange={(e) => setNewAutomation(prev => ({ 
                      ...prev, 
                      trigger: e.target.value as 'new_lead' | 'assessment_completed' | 'scheduled' | 'manual'
                    }))}
                  >
                    <option value="new_lead">New Lead Created</option>
                    <option value="assessment_completed">Assessment Completed</option>
                    <option value="scheduled">Appointment Scheduled</option>
                    <option value="manual">Manual Trigger</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="automation_delay">Delay (hours)</Label>
                  <Input
                    id="automation_delay"
                    type="number"
                    min="0"
                    placeholder="0 for immediate"
                    value={newAutomation.delay}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                
                {newAutomation.type === 'email' && (
                  <div>
                    <Label htmlFor="automation_subject">Email Subject</Label>
                    <Input
                      id="automation_subject"
                      placeholder="e.g., Your Assessment Results"
                      value={newAutomation.subject}
                      onChange={(e) => setNewAutomation(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="automation_active">Active</Label>
                  <Switch
                    id="automation_active"
                    checked={newAutomation.status === 'active'}
                    onCheckedChange={(checked) => setNewAutomation(prev => ({ 
                      ...prev, 
                      status: checked ? 'active' : 'draft'
                    }))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="automation_content">
                    {newAutomation.type === 'email' ? 'Email Body' : 
                     newAutomation.type === 'sms' ? 'SMS Message' : 
                     'Webhook Payload'}
                  </Label>
                  <Textarea
                    id="automation_content"
                    placeholder={
                      newAutomation.type === 'email' 
                        ? "Hi {{name}},\n\nThank you for completing our assessment..."
                        : newAutomation.type === 'sms'
                        ? "Hi {{name}}, thank you for completing our assessment..."
                        : '{"lead_id": "{{lead_id}}", "name": "{{name}}", "email": "{{email}}"}'
                    }
                    value={newAutomation.content}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, content: e.target.value }))}
                    className="h-40"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Available Variables:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                    <div>{{name}}: Patient Name</div>
                    <div>{{email}}: Patient Email</div>
                    <div>{{phone}}: Patient Phone</div>
                    <div>{{quiz_type}}: Assessment Type</div>
                    <div>{{score}}: Assessment Score</div>
                    <div>{{doctor_name}}: Your Name</div>
                    {newAutomation.trigger === 'scheduled' && (
                      <>
                        <div>{{appointment_date}}: Appt. Date</div>
                        <div>{{appointment_time}}: Appt. Time</div>
                      </>
                    )}
                  </div>
                </div>
                
                {newAutomation.type !== 'webhook' && (
                  <div>
                    <Label htmlFor="contact_list">Contact List (Optional)</Label>
                    <select
                      id="contact_list"
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                    >
                      <option value="">All Leads</option>
                      <option value="scheduled">Scheduled Patients</option>
                      <option value="newsletter">Newsletter Subscribers</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewAutomation(false);
                  setEditingAutomation(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => editingAutomation 
                  ? handleUpdateAutomation(editingAutomation)
                  : handleCreateAutomation()
                }
              >
                {editingAutomation ? 'Update Automation' : 'Create Automation'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Pause(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}