'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import '../../mobile.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

// Clean SVG Icons
const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

// Section Icons as inline SVGs
const SectionIcon = ({ type, color }: { type: string; color: string }) => {
  const icons: Record<string, React.ReactNode> = {
    referral: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    patient: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    insurance: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
    dates: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    clinical: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    summary: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>,
    therapy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="5" r="3"/><path d="M12 8v8M8 20l4-4 4 4"/></svg>,
    decision: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
  };
  return icons[type] || null;
};

const SECTIONS = [
  { id: 'referral', title: 'Referral Info', color: '#275380', fields: [
    { key: 'referral_type', label: 'Type', type: 'select', options: ['New Referral', 'Return to Hospital'] },
    { key: 'hospital', label: 'Hospital', type: 'text' },
    { key: 'building', label: 'Building', type: 'text' },
    { key: 'room_number', label: 'Room #', type: 'text' },
    { key: 'case_manager_name', label: 'Case Manager', type: 'text' },
    { key: 'case_manager_phone', label: 'CM Phone', type: 'tel' },
  ]},
  { id: 'patient', title: 'Patient Info', color: '#16a34a', fields: [
    { key: 'patient_name', label: 'Name', type: 'text' },
    { key: 'dob', label: 'DOB', type: 'text' },
    { key: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female', 'Other'] },
    { key: 'ssn_last4', label: 'SSN (last 4)', type: 'text', maxLength: 4 },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'address', label: 'Address', type: 'text' },
  ]},
  { id: 'insurance', title: 'Insurance', color: '#7c3aed', fields: [
    { key: 'insurance', label: 'Insurance', type: 'text' },
    { key: 'policy_number', label: 'Policy #', type: 'text' },
    { key: 'care_level', label: 'Care Level', type: 'select', options: ['SNF', 'LTC', 'AL', 'Hospice'] },
  ]},
  { id: 'dates', title: 'Key Dates', color: '#ea580c', fields: [
    { key: 'date_admitted', label: 'Admitted', type: 'date' },
    { key: 'inpatient_date', label: 'Inpatient', type: 'date' },
    { key: 'anticipated_discharge', label: 'Expected Discharge', type: 'date' },
  ]},
  { id: 'clinical', title: 'Clinical & Medical', color: '#dc2626', fields: [
    { key: 'diagnosis', label: 'Diagnosis', type: 'tags' },
    { key: 'medications', label: 'Medications', type: 'tags' },
    { key: 'allergies', label: 'Allergies', type: 'tags' },
    { key: 'fall_risk', label: 'Fall Risk', type: 'toggle' },
    { key: 'smoking_status', label: 'Smoking', type: 'select', options: ['Never', 'Former', 'Current'] },
    { key: 'isolation', label: 'Isolation', type: 'text' },
    { key: 'barrier_precautions', label: 'Barrier Precautions', type: 'text' },
    { key: 'dme', label: 'DME', type: 'textarea' },
    { key: 'diet', label: 'Diet', type: 'text' },
    { key: 'height', label: 'Height', type: 'text' },
    { key: 'weight', label: 'Weight', type: 'text' },
    { key: 'iv_meds', label: 'IV Meds', type: 'textarea' },
    { key: 'expensive_meds', label: 'Expensive Meds', type: 'textarea' },
    { key: 'infection_prevention', label: 'Infection Prevention', type: 'textarea' },
  ]},
  { id: 'summary', title: 'Summary', color: '#475569', fields: [
    { key: 'clinical_summary', label: 'Clinical Summary', type: 'textarea' },
    { key: 'physician', label: 'Physician', type: 'text' },
  ]},
  { id: 'therapy', title: 'Therapy', color: '#059669', fields: [
    { key: 'therapy_prior_level', label: 'Prior Level', type: 'textarea' },
    { key: 'therapy_bed_mobility', label: 'Bed Mobility', type: 'text' },
    { key: 'therapy_transfers', label: 'Transfers', type: 'text' },
    { key: 'therapy_gait', label: 'Gait', type: 'text' },
    { key: 'services', label: 'Services', type: 'tags' },
  ]},
  { id: 'decision', title: 'Decision', color: '#275380', fields: [
    { key: 'decision_status', label: 'Status', type: 'select', options: ['Accepting', 'Considering', 'Denying'] },
    { key: 'decision_notes', label: 'Notes', type: 'textarea' },
  ]},
];

function ApplicationDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isNewApplication = searchParams?.get('new') === 'true';
  
  const [app, setApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['patient']);
  const [showNewBanner, setShowNewBanner] = useState(isNewApplication || false);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; action: string; title: string; message: string }>({ show: false, action: '', title: '', message: '' });

  useEffect(() => {
    fetch(`${API_URL}/api/applications/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setApp(data);
          setEditedData(data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    if (showNewBanner) {
      const timer = setTimeout(() => setShowNewBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showNewBanner]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) ? prev.filter(s => s !== sectionId) : [...prev, sectionId]
    );
  };

  const getValue = (key: string) => {
    const data = isEditing ? editedData : app;
    const value = data?.[key];
    return Array.isArray(value) ? value : (value || '');
  };

  const setValue = (key: string, value: any) => {
    setEditedData({ ...editedData, [key]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      });
      if (response.ok) {
        setApp({ ...app, ...editedData });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
    setIsSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`${API_URL}/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setApp({ ...app, status: newStatus });
      setConfirmModal({ show: false, action: '', title: '', message: '' });
    } catch (error) {
      console.error('Status error:', error);
    }
  };

  const showConfirmation = (action: string) => {
    const configs: Record<string, { title: string; message: string }> = {
      review: { title: 'Send to Review?', message: 'This application will be moved to the Review queue for further evaluation.' },
      approved: { title: 'Approve Application?', message: 'This will approve the patient application and mark it as ready for admission.' },
      denied: { title: 'Deny Application?', message: 'This will deny the patient application. This action can be undone by changing the status.' },
    };
    setConfirmModal({ show: true, action, ...configs[action] });
  };

  const renderField = (field: any) => {
    const value = getValue(field.key);
    
    if (!isEditing) {
      if (field.type === 'tags') {
        const tags = Array.isArray(value) ? value : [];
        return tags.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map((tag: string, i: number) => (
              <span key={i} style={{ background: '#e5e7eb', padding: '4px 10px', borderRadius: '8px', fontSize: '13px' }}>{tag}</span>
            ))}
          </div>
        ) : <span style={{ color: '#9ca3af' }}>—</span>;
      }
      if (field.type === 'toggle') {
        return (
          <span style={{ 
            background: value ? '#fee2e2' : '#dcfce7', 
            color: value ? '#dc2626' : '#16a34a',
            padding: '4px 12px', 
            borderRadius: '6px', 
            fontSize: '13px',
            fontWeight: 500 
          }}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      }
      return value || <span style={{ color: '#9ca3af' }}>—</span>;
    }

    // Edit mode
    if (field.type === 'select') {
      return (
        <select value={value || ''} onChange={(e) => setValue(field.key, e.target.value)} style={inputStyle}>
          <option value="">Select...</option>
          {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }

    if (field.type === 'toggle') {
      return (
        <button type="button" onClick={() => setValue(field.key, !value)} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', width: '100%',
          background: value ? '#fee2e2' : '#dcfce7',
          border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 500
        }}>
          {value ? 'Yes - Fall Risk' : 'No Fall Risk'}
        </button>
      );
    }

    if (field.type === 'textarea') {
      return <textarea value={value || ''} onChange={(e) => setValue(field.key, e.target.value)} rows={3} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />;
    }

    if (field.type === 'tags') {
      const tags = Array.isArray(value) ? value : [];
      return (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {tags.map((tag: string, i: number) => (
              <span key={i} style={{ background: '#e5e7eb', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tag}
                <button type="button" onClick={() => setValue(field.key, tags.filter((_: string, idx: number) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, fontSize: '16px' }}>×</button>
              </span>
            ))}
          </div>
          <input type="text" placeholder="Add and press Enter..." style={inputStyle} onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              setValue(field.key, [...tags, e.currentTarget.value.trim()]);
              e.currentTarget.value = '';
              e.preventDefault();
            }
          }} />
        </div>
      );
    }

    return <input type={field.type === 'date' ? 'date' : field.type === 'tel' ? 'tel' : 'text'} value={value || ''} onChange={(e) => setValue(field.key, e.target.value)} maxLength={field.maxLength} style={inputStyle} />;
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '15px', background: '#f9fafb'
  };

  if (isLoading) {
    return (
      <MobileLayout title="Loading..." showBack>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#275380', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </MobileLayout>
    );
  }

  if (!app) {
    return (
      <MobileLayout title="Not Found" showBack>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>Application not found</div>
      </MobileLayout>
    );
  }

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <MobileLayout title="Application" showBack>
      {/* Sticky Top Action Bar */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 50,
        padding: '12px 16px', background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex', gap: '10px'
      }}>
        {isEditing ? (
          <>
            <button onClick={() => { setIsEditing(false); setEditedData(app); }} style={{ flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} style={{ flex: 1, padding: '12px', background: '#275380', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} style={{ flex: 1, padding: '12px', background: '#275380', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <PencilIcon style={{ width: 16, height: 16 }} /> Edit Application
            </button>
          </>
        )}
      </div>

      <div style={{ padding: '16px', paddingBottom: '180px' }}>
        
        {/* Success Banner */}
        {showNewBanner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: '12px', marginBottom: '16px', fontWeight: 500 }}>
            <CheckIcon style={{ width: 20, height: 20 }} />
            Application created successfully!
          </div>
        )}

        {/* Patient Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'white', borderRadius: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 52, height: 52, borderRadius: '12px', background: '#275380', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>
            {getInitials(app.patient_name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: 600 }}>{app.patient_name || 'Unknown'}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{app.id}</div>
          </div>
          <span style={{
            padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
            background: app.status === 'approved' ? '#dcfce7' : app.status === 'denied' ? '#fee2e2' : app.status === 'review' ? '#dbeafe' : '#fef3c7',
            color: app.status === 'approved' ? '#166534' : app.status === 'denied' ? '#991b1b' : app.status === 'review' ? '#1e40af' : '#92400e'
          }}>
            {app.status}
          </span>
        </div>

        {/* AI Summary */}
        {app.ai_summary && (
          <div style={{ background: 'linear-gradient(135deg, #275380, #1e4060)', borderRadius: '14px', padding: '16px', color: 'white', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>AI Summary</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '10px', fontSize: '12px' }}>{app.confidence_score || 0}%</span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, opacity: 0.95 }}>{app.ai_summary}</p>
          </div>
        )}

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SECTIONS.map(section => (
            <div key={section.id} style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', background: 'none', border: 'none', borderLeft: `4px solid ${section.color}`,
                  cursor: 'pointer', textAlign: 'left'
                }}
              >
                <SectionIcon type={section.id} color={section.color} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: '15px', color: '#1f2937' }}>{section.title}</span>
                <span style={{ color: '#9ca3af' }}>
                  {expandedSections.includes(section.id) ? <ChevronUp /> : <ChevronDown />}
                </span>
              </button>
              
              {expandedSections.includes(section.id) && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f3f4f6' }}>
                  {section.fields.map(field => (
                    <div key={field.key} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: 500 }}>{field.label}</label>
                      <div style={{ fontSize: '15px', color: '#1f2937' }}>{renderField(field)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
          <span>{app.source || 'Unknown source'}</span>
          <span>{app.created_at ? new Date(app.created_at).toLocaleDateString() : ''}</span>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      {!isEditing && (
        <div style={{ 
          position: 'fixed', bottom: 70, left: 0, right: 0, zIndex: 50,
          padding: '12px 16px', background: 'white', 
          borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          display: 'flex', gap: '10px'
        }}>
          <button 
            onClick={() => showConfirmation('review')} 
            disabled={app.status === 'review'} 
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', background: app.status === 'review' ? '#f3f4f6' : '#dbeafe', 
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              opacity: app.status === 'review' ? 0.5 : 1
            }}
          >
            <PencilIcon style={{ width: 20, height: 20, color: '#1e40af' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af' }}>Review</span>
          </button>
          <button 
            onClick={() => showConfirmation('approved')} 
            disabled={app.status === 'approved'} 
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', background: app.status === 'approved' ? '#f3f4f6' : '#dcfce7', 
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              opacity: app.status === 'approved' ? 0.5 : 1
            }}
          >
            <CheckIcon style={{ width: 20, height: 20, color: '#166534' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#166534' }}>Approve</span>
          </button>
          <button 
            onClick={() => showConfirmation('denied')} 
            disabled={app.status === 'denied'} 
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', background: app.status === 'denied' ? '#f3f4f6' : '#fee2e2', 
              border: 'none', borderRadius: '12px', cursor: 'pointer',
              opacity: app.status === 'denied' ? 0.5 : 1
            }}
          >
            <XMarkIcon style={{ width: 20, height: 20, color: '#991b1b' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#991b1b' }}>Deny</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{ 
            background: 'white', borderRadius: '20px', 
            width: '100%', maxWidth: '340px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: confirmModal.action === 'approved' ? '#dcfce7' : confirmModal.action === 'denied' ? '#fee2e2' : '#dbeafe'
              }}>
                {confirmModal.action === 'approved' && <CheckIcon style={{ width: 28, height: 28, color: '#166534' }} />}
                {confirmModal.action === 'denied' && <XMarkIcon style={{ width: 28, height: 28, color: '#991b1b' }} />}
                {confirmModal.action === 'review' && <PencilIcon style={{ width: 28, height: 28, color: '#1e40af' }} />}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>{confirmModal.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{confirmModal.message}</p>
            </div>
            <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb' }}>
              <button 
                onClick={() => setConfirmModal({ show: false, action: '', title: '', message: '' })}
                style={{ 
                  flex: 1, padding: '16px', background: 'none', border: 'none', 
                  borderRight: '1px solid #e5e7eb',
                  fontSize: '16px', fontWeight: 500, color: '#6b7280', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleStatusChange(confirmModal.action)}
                style={{ 
                  flex: 1, padding: '16px', background: 'none', border: 'none', 
                  fontSize: '16px', fontWeight: 600, cursor: 'pointer',
                  color: confirmModal.action === 'approved' ? '#166534' : confirmModal.action === 'denied' ? '#991b1b' : '#1e40af'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={
      <MobileLayout title="Loading..." showBack>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#275380', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </MobileLayout>
    }>
      <ApplicationDetailContent />
    </Suspense>
  );
}
