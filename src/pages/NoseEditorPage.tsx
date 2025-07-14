import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { generatePageContent, DoctorProfile } from '../lib/openrouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Pencil, Save, X } from 'lucide-react';
import { quizzes } from '@/data/quizzes';
import { EmbeddedChatBot } from '@/components/quiz/EmbeddedChatBot';

const sectionFields = [
  'headline', 'intro', 'whatIsNAO', 'symptoms', 'treatments', 'treatmentOptions', 'comparisonTable', 'vivAerOverview', 'lateraOverview', 'surgicalProcedures', 'whyChoose', 'testimonials', 'cta'
];

const defaultDoctor: DoctorProfile = {
  id: 'demo',
  name: 'Dr. Jane Smith',
  credentials: 'MD, Board-Certified ENT',
  locations: [
    { city: 'Fort Worth', address: '6801 Oakmont Blvd., Fort Worth, TX 76132', phone: '(817) 332-8848' },
    { city: 'Southlake', address: '1545 E. Southlake Blvd., Ste. 140, Southlake, TX 76092', phone: '(817) 420-9393' },
  ],
  testimonials: [
    { text: 'The VivAer procedure significantly improved my breathing. I returned to work the same day.', author: 'Patient', location: 'Fort Worth' },
    { text: 'The Latera implant helped reduce my chronic congestion without surgery.', author: 'Patient', location: 'Southlake' },
  ],
  website: 'https://www.exhalesinus.com/',
};

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

const EditableSection = ({
  label,
  value,
  isEditing,
  onEdit,
  editValue,
  onEditChange,
  onSave,
  onCancel,
  multiline = false,
  advancedTable = false,
  advancedTestimonials = false,
  advancedContact = false,
  children,
}: {
  label: string;
  value: any;
  isEditing: boolean;
  onEdit: () => void;
  editValue?: any;
  onEditChange?: (v: any) => void;
  onSave: () => void;
  onCancel: () => void;
  multiline?: boolean;
  advancedTable?: boolean;
  advancedTestimonials?: boolean;
  advancedContact?: boolean;
  children?: React.ReactNode;
}) => {
  // Advanced table editing UI for comparisonTable
  if (isEditing && advancedTable) {
    let rows: string[][] = Array.isArray(editValue) ? editValue : [];
    const updateCell = (rowIdx: number, colIdx: number, val: string) => {
      const newRows = rows.map((row, i) =>
        i === rowIdx ? row.map((cell, j) => (j === colIdx ? val : cell)) : row
      );
      onEditChange && onEditChange(newRows);
    };
    const addRow = () => {
      const cols = rows[0]?.length || 4;
      const newRows = [...rows, Array(cols).fill('')];
      onEditChange && onEditChange(newRows);
    };
    const removeRow = (rowIdx: number) => {
      const newRows = rows.filter((_, i) => i !== rowIdx);
      onEditChange && onEditChange(newRows);
    };
    return (
      <div className="bg-white border-2 border-blue-400 shadow-xl rounded-xl p-4 flex flex-col gap-2 animate-fade-in">
        <table className="min-w-full bg-white rounded-xl shadow text-sm mb-2">
          <thead>
            <tr className="bg-blue-100">
              <th className="py-2 px-4">Treatment</th>
              <th className="py-2 px-4">Pros</th>
              <th className="py-2 px-4">Cons</th>
              <th className="py-2 px-4">Invasiveness</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {Array(4).fill(0).map((_, j) => (
                  <td key={j} className="py-2 px-2">
                    <input
                      className="border rounded p-1 w-full text-sm"
                      value={row[j] || ''}
                      onChange={e => updateCell(i, j, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button onClick={() => removeRow(i)} className="text-red-500 hover:underline text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant="outline" onClick={addRow}>Add Row</Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={onSave} className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"><Save className="w-4 h-4" />Save</Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50"><X className="w-4 h-4" />Cancel</Button>
        </div>
      </div>
    );
  }
  // Advanced testimonials editing UI
  if (isEditing && advancedTestimonials) {
    let testimonials: { text: string; author: string; location: string }[] = Array.isArray(editValue) ? editValue : [];
    const updateTestimonial = (idx: number, field: string, val: string) => {
      const newTestimonials = testimonials.map((t, i) =>
        i === idx ? { ...t, [field]: val } : t
      );
      onEditChange && onEditChange(newTestimonials);
    };
    const addTestimonial = () => {
      const newTestimonials = [...testimonials, { text: '', author: '', location: '' }];
      onEditChange && onEditChange(newTestimonials);
    };
    const removeTestimonial = (idx: number) => {
      const newTestimonials = testimonials.filter((_, i) => i !== idx);
      onEditChange && onEditChange(newTestimonials);
    };
    return (
      <div className="bg-white border-2 border-blue-400 shadow-xl rounded-xl p-4 flex flex-col gap-4 animate-fade-in">
        {testimonials.map((t, i) => (
          <div key={i} className="border rounded-lg p-4 shadow flex flex-col gap-2 relative">
            <button onClick={() => removeTestimonial(i)} className="absolute top-2 right-2 text-red-500 hover:underline text-xs">Remove</button>
            <label className="font-semibold text-sm">Text</label>
            <textarea
              className="border rounded p-2 text-sm"
              value={t.text}
              onChange={e => updateTestimonial(i, 'text', e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="font-semibold text-sm">Author</label>
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={t.author}
                  onChange={e => updateTestimonial(i, 'author', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="font-semibold text-sm">Location</label>
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={t.location}
                  onChange={e => updateTestimonial(i, 'location', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addTestimonial}>Add Testimonial</Button>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={onSave} className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"><Save className="w-4 h-4" />Save</Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50"><X className="w-4 h-4" />Cancel</Button>
        </div>
      </div>
    );
  }
  // Advanced contact editing UI
  if (isEditing && advancedContact) {
    let locations: { city: string; phone: string; address: string }[] = Array.isArray(editValue) ? editValue : [];
    const updateLocation = (idx: number, field: string, val: string) => {
      const newLocations = locations.map((loc, i) =>
        i === idx ? { ...loc, [field]: val } : loc
      );
      onEditChange && onEditChange(newLocations);
    };
    const addLocation = () => {
      const newLocations = [...locations, { city: '', phone: '', address: '' }];
      onEditChange && onEditChange(newLocations);
    };
    const removeLocation = (idx: number) => {
      const newLocations = locations.filter((_, i) => i !== idx);
      onEditChange && onEditChange(newLocations);
    };
    return (
      <div className="bg-white border-2 border-blue-400 shadow-xl rounded-xl p-4 flex flex-col gap-4 animate-fade-in">
        {locations.map((loc, i) => (
          <div key={i} className="border rounded-lg p-4 shadow flex flex-col gap-2 relative">
            <button onClick={() => removeLocation(i)} className="absolute top-2 right-2 text-red-500 hover:underline text-xs">Remove</button>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="font-semibold text-sm">City</label>
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={loc.city}
                  onChange={e => updateLocation(i, 'city', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="font-semibold text-sm">Phone</label>
                <input
                  className="border rounded p-2 text-sm w-full"
                  value={loc.phone}
                  onChange={e => updateLocation(i, 'phone', e.target.value)}
                />
              </div>
            </div>
            <label className="font-semibold text-sm">Address</label>
            <input
              className="border rounded p-2 text-sm w-full"
              value={loc.address}
              onChange={e => updateLocation(i, 'address', e.target.value)}
            />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addLocation}>Add Location</Button>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={onSave} className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"><Save className="w-4 h-4" />Save</Button>
          <Button size="sm" variant="outline" onClick={onCancel} className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50"><X className="w-4 h-4" />Cancel</Button>
        </div>
      </div>
    );
  }
  // Default/other section editing
  return (
    <div className={`relative group mb-6 ${isEditing ? 'z-10' : ''}`}>  
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-2xl font-semibold text-[#0E7C9D]">{label}</h2>
        {!isEditing && (
          <button onClick={onEdit} className="ml-2 p-1 rounded hover:bg-gray-200" aria-label={`Edit ${label}`}>
            <Pencil className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="bg-white border-2 border-blue-400 shadow-xl rounded-xl p-4 flex flex-col gap-2 animate-fade-in">
          {multiline ? (
            <textarea
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
              rows={4}
              value={editValue}
              onChange={e => onEditChange && onEditChange(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-400"
              value={editValue}
              onChange={e => onEditChange && onEditChange(e.target.value)}
              autoFocus
            />
          )}
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={onSave} className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"><Save className="w-4 h-4" />Save</Button>
            <Button size="sm" variant="outline" onClick={onCancel} className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50"><X className="w-4 h-4" />Cancel</Button>
          </div>
        </div>
      ) : (
        <div className={isEditing ? 'opacity-50 pointer-events-none' : ''}>{children}</div>
      )}
    </div>
  );
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
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAboveFoldQuiz, setShowAboveFoldQuiz] = useState(false);
  const aboveFoldQuizRef = useRef<HTMLDivElement>(null);
  const footerQuizRef = useRef<HTMLDivElement>(null);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

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
      setDoctor(docData || defaultDoctor);
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

  useEffect(() => {
    const timer = setTimeout(() => setShowChatbot(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleEdit = (field: string) => {
    setEditingSection(field);
    if (field === 'comparisonTable') {
      setEditValue(Array.isArray(content.comparisonTable) ? content.comparisonTable.map(row => row.length === 4 ? row : [...row, '', '', '', ''].slice(0, 4)) : [['', '', '', '']]);
    } else if (field === 'testimonials') {
      setEditValue(Array.isArray(content.testimonials) ? content.testimonials : []);
    } else if (field === 'contact') {
      setEditValue(Array.isArray(content.locations) ? content.locations : (doctor?.locations || []));
    } else {
      setEditValue(Array.isArray(content[field]) ? content[field].join('\n') : content[field] || '');
    }
  };

  const handleChange = (v: string) => {
    setEditValue(v);
  };

  const handleSave = async () => {
    if (!editingSection || !user || !doctorId) return;
    setSaving(true);
    let newContent = { ...content };
    if (editingSection === 'comparisonTable') {
      newContent.comparisonTable = editValue;
    } else if (editingSection === 'testimonials') {
      newContent.testimonials = editValue;
    } else if (editingSection === 'contact') {
      newContent.locations = editValue;
    } else {
      newContent[editingSection] = Array.isArray(content[editingSection]) ? editValue.split('\n') : editValue;
    }
    setContent(newContent);
    await supabase.from('ai_landing_pages').upsert([
      {
        user_id: user.id,
        doctor_id: doctorId,
        content: newContent,
      },
    ], { onConflict: 'user_id,doctor_id' });
    setEditingSection(null);
    setEditValue('');
    setSaving(false);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditValue('');
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

  const handleShowQuiz = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowAboveFoldQuiz(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  // Helper to safely render lists
  const safeList = (arr: any, fallback: string) => Array.isArray(arr) && arr.length > 0 ? arr : [fallback];
  const doctorAvatarUrl = doctor?.avatar_url || '/lovable-uploads/6b38df79-5ad8-494b-83ed-7dba6c54d4b1.png';
  const quizIframeSrc = `${window.location.origin}/quiz/nose?source=website&utm_source=website&utm_medium=web&utm_campaign=quiz_share`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      {/* Above the Fold */}
      <section className="max-w-4xl mx-auto px-4 text-center mb-12">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <img src={doctorAvatarUrl} alt="Practice Logo" className="w-12 h-12 object-contain" />
        </div>
        <EditableSection
          label="Headline"
          value={content.headline}
          isEditing={editingSection === 'headline'}
          onEdit={() => handleEdit('headline')}
          editValue={editingSection === 'headline' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          <h1 className="text-5xl font-bold text-[#0E7C9D] mb-4">{content.headline || 'Struggling to Breathe Through Your Nose?'}</h1>
        </EditableSection>
        <EditableSection
          label="Intro"
          value={content.intro}
          isEditing={editingSection === 'intro'}
          onEdit={() => handleEdit('intro')}
          editValue={editingSection === 'intro' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
        >
          <p className="text-xl text-gray-700 mb-6">{content.intro || 'Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction'}</p>
        </EditableSection>
        <Button
          className="inline-block bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-lg mb-4"
          onClick={handleShowQuiz}
        >
          Take the Nose Test Now »
        </Button>
        {/* Embed NOSE Quiz Above the Fold (hidden until button click) */}
        <div id="nose-quiz" className="my-8" ref={aboveFoldQuizRef}>
          {showAboveFoldQuiz && (
            <iframe
              src={quizIframeSrc}
              width="100%"
              height="500px"
              frameBorder="0"
              style={{ borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              title="NOSE Assessment Quiz"
              allow="clipboard-write"
            />
          )}
        </div>
      </section>

      {/* What is NAO */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection
          label="What Is Nasal Airway Obstruction?"
          value={content.whatIsNAO}
          isEditing={editingSection === 'whatIsNAO'}
          onEdit={() => handleEdit('whatIsNAO')}
          editValue={editingSection === 'whatIsNAO' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <p className="text-lg text-gray-700 mb-4">{content.whatIsNAO || 'Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited.'}</p>
        </EditableSection>
      </section>

      {/* Symptoms & Impact */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection
          label="Symptoms & Impact"
          value={Array.isArray(content.symptoms) ? content.symptoms.join('\n') : content.symptoms}
          isEditing={editingSection === 'symptoms'}
          onEdit={() => handleEdit('symptoms')}
          editValue={editingSection === 'symptoms' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <ul className="list-disc list-inside text-gray-700 text-lg mb-4">
            {safeList(content.symptoms, 'Chronic nasal congestion or stuffiness').map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </EditableSection>
      </section>

      {/* Treatment Options */}
      <section className="max-w-4xl mx-auto mb-12">
        <EditableSection
          label="Comprehensive Treatment Options"
          value={content.treatments}
          isEditing={editingSection === 'treatments'}
          onEdit={() => handleEdit('treatments')}
          editValue={editingSection === 'treatments' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <p className="text-gray-700 mb-4">{content.treatments || ''}</p>
        </EditableSection>
        <EditableSection
          label="Treatment Options: From Gentle to Surgical"
          value={Array.isArray(content.treatmentOptions) ? content.treatmentOptions.join('\n') : content.treatmentOptions}
          isEditing={editingSection === 'treatmentOptions'}
          onEdit={() => handleEdit('treatmentOptions')}
          editValue={editingSection === 'treatmentOptions' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <ul className="list-disc list-inside text-gray-700 mb-2">
            {safeList(content.treatmentOptions, 'Medical Management').map((option: string, i: number) => (
              <li key={i}>{option}</li>
            ))}
          </ul>
        </EditableSection>
        {/* Comparison Table */}
        <EditableSection
          label="Comparison Table"
          value={Array.isArray(content.comparisonTable) ? content.comparisonTable : []}
          isEditing={editingSection === 'comparisonTable'}
          onEdit={() => handleEdit('comparisonTable')}
          editValue={editingSection === 'comparisonTable' ? editValue : []}
          onEditChange={setEditValue}
          onSave={handleSave}
          onCancel={handleCancel}
          advancedTable={true}
        >
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white rounded-xl shadow text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="py-2 px-4">Treatment</th>
                  <th className="py-2 px-4">Pros</th>
                  <th className="py-2 px-4">Cons</th>
                  <th className="py-2 px-4">Invasiveness</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(content.comparisonTable) ? content.comparisonTable : []).map((row: any, i: number) => {
                  let safeRow = Array.isArray(row) ? row : ['', '', '', ''];
                  // If row is a string, try to split by tab or comma
                  if (!Array.isArray(row) && typeof row === 'string') {
                    const split = row.split('\t');
                    safeRow = split.length === 4 ? split : ['', '', '', ''];
                  }
                  // Ensure always 4 columns
                  if (safeRow.length < 4) safeRow = [...safeRow, '', '', '', ''].slice(0, 4);
                  return (
                    <tr key={i}>
                      {safeRow.slice(0, 4).map((cell: string, j: number) => (
                        <td key={`${i}-${j}`} className="py-2 px-4">{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </EditableSection>
        
      </section>

      {/* VivAer & Latera Overviews */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection
          label="VivAer Overview"
          value={content.vivAerOverview}
          isEditing={editingSection === 'vivAerOverview'}
          onEdit={() => handleEdit('vivAerOverview')}
          editValue={editingSection === 'vivAerOverview' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <p className="text-gray-700 mb-4">{content.vivAerOverview || ''}</p>
        </EditableSection>
        <EditableSection
          label="Latera Overview"
          value={content.lateraOverview}
          isEditing={editingSection === 'lateraOverview'}
          onEdit={() => handleEdit('lateraOverview')}
          editValue={editingSection === 'lateraOverview' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <p className="text-gray-700 mb-4">{content.lateraOverview || ''}</p>
        </EditableSection>
      </section>

      {/* Surgical Procedures */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection
          label="Surgical Procedures"
          value={content.surgicalProcedures}
          isEditing={editingSection === 'surgicalProcedures'}
          onEdit={() => handleEdit('surgicalProcedures')}
          editValue={editingSection === 'surgicalProcedures' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <p className="text-gray-700 mb-4">{content.surgicalProcedures || ''}</p>
        </EditableSection>
      </section>

      {/* Call to Action */}
      <section className="max-w-3xl mx-auto mb-12 text-center">
        <EditableSection
          label="Call to Action"
          value={content.cta}
          isEditing={editingSection === 'cta'}
          onEdit={() => handleEdit('cta')}
          editValue={editingSection === 'cta' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <p className="text-gray-700 mb-4">{content.cta || ''}</p>
          <Button
            onClick={handleShowQuiz}
            className="inline-block bg-gradient-to-r from-[#0E7C9D] to-[#FD904B] hover:from-[#0E7C9D]/90 hover:to-[#FD904B]/90 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg text-lg"
          >
            Take the Nose Test »
          </Button>
        </EditableSection>
      </section>

      {/* Why Choose This Practice */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection
          label={`Why Choose ${doctor?.name?.split(' ')[0]}'s Practice`}
          value={Array.isArray(content.whyChoose) ? content.whyChoose.join('\n') : content.whyChoose}
          isEditing={editingSection === 'whyChoose'}
          onEdit={() => handleEdit('whyChoose')}
          editValue={editingSection === 'whyChoose' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
        >
          <ul className="list-disc list-inside text-gray-700 text-lg mb-4">
            {safeList(content.whyChoose, 'Board-Certified ENT Specialists').map((reason: string, i: number) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </EditableSection>
      </section>

      {/* Testimonials */}
      <section className="max-w-3xl mx-auto mb-12">
        <EditableSection
          label="Patient Testimonials"
          value={Array.isArray(content.testimonials) ? content.testimonials : []}
          isEditing={editingSection === 'testimonials'}
          onEdit={() => handleEdit('testimonials')}
          editValue={editingSection === 'testimonials' ? editValue : []}
          onEditChange={setEditValue}
          onSave={handleSave}
          onCancel={handleCancel}
          advancedTestimonials={true}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {(Array.isArray(content.testimonials) ? content.testimonials : []).map((t: { text: string; author: string; location: string }, i: number) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 text-gray-700">
                <p className="mb-2">"{t.text || ''}"</p>
                <div className="text-sm text-gray-500">— {t.author || 'Patient'}, {t.location || ''}</div>
              </div>
            ))}
          </div>
        </EditableSection>
      </section>

    </div>
  );
};

export default NoseEditorPage; 