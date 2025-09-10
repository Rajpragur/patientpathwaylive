import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Settings, 
  Send, 
  FileText,
  BarChart3,
  Plus,
  ExternalLink
} from 'lucide-react';
import { EmailConnection } from './EmailConnection';
import { EmailComposer } from './EmailComposer';
import { EmailTemplates } from './EmailTemplates';
import { EmailAnalytics } from './EmailAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function EmailSettingsPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('connections');
  const [showComposer, setShowComposer] = useState(false);
  const [composerProps, setComposerProps] = useState<{
    quizId?: string;
    quizTitle?: string;
    quizUrl?: string;
  }>({});

  const openComposer = (quizId?: string, quizTitle?: string, quizUrl?: string) => {
    setComposerProps({ quizId, quizTitle, quizUrl });
    setShowComposer(true);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setComposerProps({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading email settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access email automation features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showComposer) {
    return (
      <div className="p-6">
        <EmailComposer
          {...composerProps}
          onClose={closeComposer}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Automation</h1>
          <p className="text-gray-600 mt-2">Manage your email connections, templates, and send quiz invitations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => openComposer()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Email
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <EmailConnection />
        </TabsContent>

        <TabsContent value="compose">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => openComposer()}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Send className="w-6 h-6" />
                    <span>Send Custom Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openComposer('nose', 'NOSE Assessment', 'https://example.com/nose')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Mail className="w-6 h-6" />
                    <span>Send NOSE Quiz</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openComposer('snot12', 'SNOT-12 Assessment', 'https://example.com/snot12')}
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <Mail className="w-6 h-6" />
                    <span>Send SNOT-12 Quiz</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent campaigns found</p>
                  <p className="text-sm">Start by sending your first email invitation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
