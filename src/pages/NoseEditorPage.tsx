import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { generatePageContent, DoctorProfile } from '../lib/openrouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const sectionFields = [
  'headline', 'intro', 'whatIsNAO', 'symptoms', 'treatments', 'treatmentOptions', 'comparisonTable', 'vivAerOverview', 'lateraOverview', 'surgicalProcedures', 'whyChoose', 'testimonials', 'cta'
];

const defaultContent = {
  headline: '',
  intro: '',
  whatIsNAO: '',
  symptoms: [],
  treatments: '',
  treatmentOptions: [],
  comparisonTable: [],
  vivAerOverview: '',
  lateraOverview: '',
  surgicalProcedures: '',
  whyChoose: [],
  testimonials: [],
  cta: '',
};

const NoseEditorPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [content, setContent] = useState<any>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!doctorId || !user) return;
      setLoading(true);
      setError(null);
      // Fetch doctor
      const { data: docData } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('id', doctorId)
        .single();
      setDoctor(docData || null);
      // Fetch AI content
      const { data, error } = await supabase
        .from('ai_landing_pages')
        .select('content')
        .eq('user_id', user.id)
        .eq('doctor_id', doctorId)
        .single();
      if (data && data.content) setContent(data.content);
      else setContent(defaultContent);
      if (error && error.code !== 'PGRST116') setError(error.message);
      setLoading(false);
    };
    fetchData();
  }, [doctorId, user]);

  const handleChange = (field: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || !doctorId) return;
    setSaving(true);
    setError(null);
    // Upsert content
    const { error } = await supabase.from('ai_landing_pages').upsert([
      {
        user_id: user.id,
        doctor_id: doctorId,
        content,
      },
    ], { onConflict: 'user_id,doctor_id' });
    if (error) setError(error.message);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!user || !doctorId) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('ai_landing_pages')
      .delete()
      .eq('user_id', user.id)
      .eq('doctor_id', doctorId);
    if (error) setError(error.message);
    else navigate('/dashboard/share-assessments');
    setSaving(false);
  };

  const handleRegenerate = async () => {
    if (!doctor) return;
    setAiLoading(true);
    setError(null);
    try {
      const generated = await generatePageContent(doctor);
      setContent(generated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Edit NOSE Landing Page</h1>
      {sectionFields.map((field) => (
        <div key={field} className="mb-4">
          <label className="block font-semibold mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
          {Array.isArray(content[field]) ? (
            <Textarea
              value={content[field].join('\n')}
              onChange={e => handleChange(field, e.target.value.split('\n'))}
              rows={field === 'comparisonTable' ? 6 : 3}
              className="w-full"
              placeholder={field === 'comparisonTable' ? 'Enter rows as tab-separated values' : ''}
            />
          ) : (
            <Textarea
              value={content[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              rows={field === 'treatments' || field === 'cta' ? 3 : 2}
              className="w-full"
            />
          )}
        </div>
      ))}
      <div className="flex gap-4 mt-8">
        <Button onClick={handleSave} disabled={saving || aiLoading}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={saving || aiLoading}>
          Delete
        </Button>
        <Button variant="secondary" onClick={handleRegenerate} disabled={aiLoading || saving}>
          {aiLoading ? 'Regenerating...' : 'Regenerate with AI'}
        </Button>
      </div>
    </div>
  );
};

export default NoseEditorPage; 