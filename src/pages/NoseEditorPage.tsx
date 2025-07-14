import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { generatePageContent, DoctorProfile } from '../lib/openrouter';
import { Button } from '@/components/ui/button';
import { 
  Pencil, Save, X
} from 'lucide-react';


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
  className = '',
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
  className?: string;
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
      <div className="bg-white border border-blue-300 shadow-lg rounded-2xl p-6 animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-blue-800 border-b border-blue-200">
              {["Treatment", "Pros", "Cons", "Invasiveness"].map((col, idx) => (
                <th key={idx} className="py-3 px-2 font-semibold">{col}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-blue-50 transition">
                {Array(4).fill(0).map((_, j) => (
                  <td key={j} className="py-2 px-2">
                    <input
                      value={row[j] || ''}
                      onChange={e => updateCell(i, j, e.target.value)}
                      className="w-full bg-transparent border border-transparent focus:border-blue-400 rounded-md px-2 py-1 focus:outline-none focus:bg-white transition-all"
                      placeholder={`Enter ${["Treatment", "Pros", "Cons", "Invasiveness"][j].toLowerCase()}`}
                    />
                  </td>
                ))}
                <td className="text-right pr-2">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-red-500 text-xs hover:underline hover:text-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={addRow}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >{}
            + Add Row
          </Button>
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <Button
            size="sm"
            onClick={onSave}
            className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
          >
            <Save className="w-4 h-4" /> Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4" /> Cancel
          </Button>
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
        <h2 className={className}>{label}</h2>
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
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showAboveFoldQuiz, setShowAboveFoldQuiz] = useState(false);
  const aboveFoldQuizRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="w-full bg-white border-b border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <div className="mb-12">
            <div className="w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <img src={doctorAvatarUrl} alt="Practice Logo" className="w-20 h-20 rounded-xl object-cover" />
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
              className='font-bold text-2xl'
            >
              <h1 className="text-5xl font-bold text-slate-900 mb-8 leading-tight max-w-6xl mx-auto">
                {content.headline || 'Struggling to Breathe Through Your Nose?'}
              </h1>
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
              className='font-bold text-2xl'
            >
              <p className="text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                {content.intro || 'Take Our Quick "Nose Test" to See If You Have Nasal Airway Obstruction'}
              </p>
            </EditableSection>
            <Button
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-12 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl text-xl group"
              onClick={handleShowQuiz}
            >
              <span>Take the Nose Test Now</span>
              <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        </div>
      </section>

      {/* What is NAO */}
      <section className="w-full bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-8 text-center">
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
            className='font-bold text-2xl'
          >
            <h2 className="text-5xl font-bold text-slate-900 mb-8">
              What Is Nasal Airway Obstruction?
            </h2>
            <p className="text-2xl text-slate-600 leading-relaxed max-w-5xl mx-auto">
              {content.whatIsNAO || 'Nasal Airway Obstruction (NAO) occurs when airflow through the nose is chronically limited.'}
            </p>
          </EditableSection>
        </div>
      </section>

      {/*Symptoms and Impact*/}
      <section className="w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-8 text-center">
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
            className='font-bold text-2xl'
          >
            <h2 className="text-5xl font-bold text-slate-900 mb-12">Symptoms & Impact</h2>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {safeList(content.symptoms, 'Chronic nasal congestion or stuffiness').map((symptom: string, i: number) => (
                  <div
                    key={i}
                    className="bg-slate-50 rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow w-80"
                  >
                    <div className="w-3 h-3 bg-blue-600 rounded-full mb-4 mx-auto"></div>
                    <span className="text-slate-700 text-lg">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        </div>
      </section>

      <section className="w-full bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <EditableSection
            label={`Comprehensive Treatment Options at ${doctor?.name?.split(' ')[0]}'s Practice`}
            value={content.treatments}
            isEditing={editingSection === 'treatments'}
            onEdit={() => handleEdit('treatments')}
            editValue={editingSection === 'treatments' ? editValue : ''}
            onEditChange={handleChange}
            onSave={handleSave}
            onCancel={handleCancel}
            multiline
            className='font-bold text-2xl'
          >
            <h2 className="text-5xl font-bold text-slate-900 mb-8 max-w-7xl mx-auto px-8 text-center">
              Comprehensive Treatment Options at undefined Practice
            </h2>
            <p className="text-2xl text-slate-600 mb-16 max-w-5xl mx-auto leading-relaxed">{content.treatments || ''}</p>
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
            className='font-bold text-2xl'
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {safeList(content.treatmentOptions, 'Medical Management').map((option: string, i: number) => (
                <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span className="text-white font-bold text-lg">{i + 1}</span>
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed">{option}</p>
                </div>
              ))}
            </div>
          </EditableSection>

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
            className='font-bold text-2xl'
          >
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-6 px-8 text-left font-semibold text-lg">Treatment</th>
                    <th className="py-6 px-8 text-left font-semibold text-lg">Pros</th>
                    <th className="py-6 px-8 text-left font-semibold text-lg">Cons</th>
                    <th className="py-6 px-8 text-left font-semibold text-lg">Invasiveness</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(content.comparisonTable) ? content.comparisonTable : []).map((row: any, i: number) => {
                    let safeRow = Array.isArray(row) ? row : ['', '', '', ''];
                    if (!Array.isArray(row) && typeof row === 'string') {
                      const split = row.split('\t');
                      safeRow = split.length === 4 ? split : ['', '', '', ''];
                    }
                    if (safeRow.length < 4) safeRow = [...safeRow, '', '', '', ''].slice(0, 4);
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        {safeRow.slice(0, 4).map((cell: string, j: number) => (
                          <td key={`${i}-${j}`} className="py-6 px-8 text-slate-700 text-lg">{cell}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </EditableSection>
        </div>
      </section>
      {/*VivAer Overview*/}
      <section className="w-full bg-white py-24">
      <div className="max-w-7xl mx-auto px-8">
      <div className="grid md:grid-cols-2 gap-16">
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
          className='font-bold text-2xl'
        >
        <div className="text-center bg-slate-50 rounded-xl p-12 border border-slate-200">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">VivAer Overview</h2>
          <p className="text-slate-600 text-lg leading-relaxed">{content.vivAerOverview || ''}</p>
        </div>
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
          className='font-bold text-2xl'
        >
          <div className="text-center bg-slate-50 rounded-xl p-12 border border-slate-200">
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Latera Overview</h2>
            <p className="text-slate-600 text-lg leading-relaxed">{content.lateraOverview || ''}</p>
          </div>
        </EditableSection>
        </div>
        </div>
      </section>

      {/* Surgical Procedures */}
      <section className="w-full bg-slate-100 py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
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
          className='font-bold text-2xl'>
              <h2 className="text-5xl font-bold text-slate-900 mb-12">Surgical Procedures</h2>
              <p className="text-2xl text-slate-600 leading-relaxed max-w-5xl mx-auto">
                {content.surgicalProcedures || ''}
              </p>
          </EditableSection>
          </div>
      </section>  
      {/* Call to Action */}
       <section className="w-full bg-blue-600 py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
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
          className='text-white font-bold'
          >
              <h2 className="text-5xl font-bold text-white mb-12">Take the Next Step</h2>
              <p className="text-2xl text-blue-100 mb-16 max-w-4xl mx-auto leading-relaxed">
                {content.cta || ''}
              </p>
              <button
                onClick={handleShowQuiz}
                className="inline-flex items-center bg-white text-blue-600 font-bold py-6 px-12 rounded-xl transition-all duration-300 hover:scale-105 shadow-xl text-xl group hover:shadow-2xl"
              >
                <span>Take the Nose Test</span>
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </EditableSection>
          </div>
        </section>
      {/* Why Choose This Practice */}
      <section className="w-full bg-white py-24">
          <div className="max-w-7xl mx-auto px-8 text-center">
          <EditableSection
          label={`Why Choose your Practice`}
          value={Array.isArray(content.whyChoose) ? content.whyChoose.join('\n') : content.whyChoose}
          isEditing={editingSection === 'whyChoose'}
          onEdit={() => handleEdit('whyChoose')}
          editValue={editingSection === 'whyChoose' ? editValue : ''}
          onEditChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
          multiline
          className='font-bold text-2xl'
          >
              <h2 className="text-5xl font-bold text-slate-900 mb-16">Why Choose your (your real name) Practice</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {safeList(content.whyChoose, 'Board-Certified ENT Specialists').map((reason: string, i: number) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-8 text-left border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-700 text-lg leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </EditableSection>
          </div>
      </section>
      {/* Testimonials */}
      <section className="w-full bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <EditableSection
            label="Patient Testimonials"
            value={Array.isArray(content.testimonials) ? content.testimonials : []}
            isEditing={editingSection === 'testimonials'}
            onEdit={() => handleEdit('testimonials')}
            editValue={editingSection === 'testimonials' ? editValue : []}
            onEditChange={setEditValue}
            onSave={handleSave}
            onCancel={handleCancel}
            advancedTestimonials
            className='font-bold text-2xl'
          >
            <h2 className="text-5xl font-bold text-slate-900 mb-16">Patient Testimonials</h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {(Array.isArray(content.testimonials) ? content.testimonials : []).map(
                (testimonial: { text: string; author: string; location: string }, i: number) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-12 border border-slate-200 relative shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="absolute top-8 left-8 text-8xl text-slate-300">"</div>
                    <p className="text-slate-700 mb-8 pt-12 text-xl leading-relaxed italic">
                      {testimonial.text || ''}
                    </p>
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-900 text-lg">
                          {testimonial.author || 'Patient'}
                        </div>
                        <div className="text-slate-500">{testimonial.location || ''}</div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </EditableSection>
        </div>
      </section>

    </div>
  );
};

export default NoseEditorPage; 