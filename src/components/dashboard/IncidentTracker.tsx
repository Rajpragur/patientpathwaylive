
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { QuizIncident } from '@/types/quiz';

interface IncidentTrackerProps {
  selectedIncident: string;
  onIncidentChange: (incident: string) => void;
}

export function IncidentTracker({ selectedIncident, onIncidentChange }: IncidentTrackerProps) {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<QuizIncident[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newIncident, setNewIncident] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    if (!user) return;

    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorProfile) return;

      const { data, error } = await supabase
        .from('quiz_incidents')
        .select('*')
        .eq('doctor_id', doctorProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const handleAddIncident = async () => {
    if (!newIncident.name.trim() || !user) {
      toast.error('Please enter an incident name');
      return;
    }

    setIsLoading(true);
    try {
      const { data: doctorProfile } = await supabase
        .from('doctor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorProfile) {
        toast.error('Doctor profile not found');
        return;
      }

      const { data, error } = await supabase
        .from('quiz_incidents')
        .insert({
          doctor_id: doctorProfile.id,
          name: newIncident.name,
          description: newIncident.description
        })
        .select()
        .single();

      if (error) throw error;

      setIncidents(prev => [data, ...prev]);
      setNewIncident({ name: '', description: '' });
      setShowAddDialog(false);
      toast.success('Incident source added successfully');
    } catch (error) {
      console.error('Error adding incident:', error);
      toast.error('Failed to add incident source');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_incidents')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;

      setIncidents(prev => prev.filter(inc => inc.id !== incidentId));
      if (selectedIncident === incidentId) {
        onIncidentChange('default');
      }
      toast.success('Incident source deleted');
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast.error('Failed to delete incident source');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Lead Source Tracking
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead Source</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Source name (e.g., Facebook Campaign, QR Code Flyer)"
                  value={newIncident.name}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddIncident} disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Source'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedIncident} onValueChange={onIncidentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select lead source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {incidents.map((incident) => (
                <SelectItem key={incident.id} value={incident.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{incident.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {incidents.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Your Lead Sources:</p>
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{incident.name}</span>
                    {incident.description && (
                      <span className="text-sm text-gray-600 ml-2">- {incident.description}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteIncident(incident.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
