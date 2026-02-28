'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'https://optalis-api-production.up.railway.app';

// SVG Icons
const Icons = {
  referral: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  patient: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  insurance: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  clinical: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  therapy: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20 13c-1 2-3.5 3-5.5 3s-4.5-1-5.5-3"/><path d="M8.5 10c-.83 0-1.5-.67-1.5-1.5v-5C7 2.67 7.67 2 8.5 2S10 2.67 10 3.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M12 22v-6"/><circle cx="12" cy="22" r="2"/></svg>,
  summary: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
};

// Organized field groups
const FIELD_GROUPS = {
  referral: {
    title: 'Referral Information',
    icon: Icons.referral,
    fields: [
      { key: 'referral_type', label: 'Referral Type', type: 'select', options: ['New Referral', 'Return to Hospital'], span: 1 },
      { key: 'hospital', label: 'Hospital', type: 'text', required: true, span: 1 },
      { key: 'building', label: 'Building/Facility', type: 'text', required: true, span: 1 },
      { key: 'room_number', label: 'Room #', type: 'text', span: 1 },
      { key: 'case_manager_name', label: 'Case Manager', type: 'text', span: 1 },
      { key: 'case_manager_phone', label: 'CM Phone', type: 'text', span: 1 },
    ]
  },
  patient: {
    title: 'Patient Information',
    icon: Icons.patient,
    fields: [
      { key: 'patient_name', label: 'Full Name', type: 'text', required: true, span: 2 },
      { key: 'dob', label: 'Date of Birth', type: 'text', required: true, span: 1 },
      { key: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female', 'Other'], span: 1 },
      { key: 'ssn_last4', label: 'SSN (Last 4)', type: 'text', maxLength: 4, span: 1 },
      { key: 'phone', label: 'Phone', type: 'text', span: 1 },
      { key: 'address', label: 'Address', type: 'text', span: 2 },
    ]
  },
  insurance: {
    title: 'Insurance & Dates',
    icon: Icons.insurance,
    fields: [
      { key: 'insurance', label: 'Insurance', type: 'text', required: true, span: 1 },
      { key: 'policy_number', label: 'Policy/Member ID', type: 'text', span: 1 },
      { key: 'care_level', label: 'Care Level', type: 'select', options: ['SNF', 'LTC', 'AL', 'Hospice'], span: 1 },
      { key: 'date_admitted', label: 'Date Admitted', type: 'date', span: 1 },
      { key: 'inpatient_date', label: 'Inpatient Date', type: 'date', span: 1 },
      { key: 'anticipated_discharge', label: 'Expected Discharge', type: 'date', span: 1 },
    ]
  },
  clinical: {
    title: 'Clinical & Medical',
    icon: Icons.clinical,
    fields: [
      { key: 'diagnosis', label: 'Diagnosis', type: 'tags', span: 2 },
      { key: 'medications', label: 'Current Medications', type: 'tags', span: 2 },
      { key: 'allergies', label: 'Allergies', type: 'tags', span: 2 },
      { key: 'fall_risk', label: 'Fall Risk', type: 'toggle', span: 1 },
      { key: 'smoking_status', label: 'Smoking Status', type: 'select', options: ['Never', 'Former', 'Current'], span: 1 },
      { key: 'isolation', label: 'Isolation', type: 'text', span: 1 },
      { key: 'barrier_precautions', label: 'Enhanced Barrier Precautions', type: 'text', span: 1 },
      { key: 'dme', label: 'Durable Medical Equipment', type: 'textarea', span: 2 },
      { key: 'diet', label: 'Diet', type: 'text', span: 1 },
      { key: 'height', label: 'Height', type: 'text', span: 1 },
      { key: 'weight', label: 'Weight', type: 'text', span: 1 },
      { key: 'iv_meds', label: 'IV Medications', type: 'textarea', span: 1 },
      { key: 'expensive_meds', label: 'Expensive Meds/Chemo', type: 'textarea', span: 2 },
      { key: 'infection_prevention', label: 'Infection Prevention', type: 'textarea', span: 2 },
    ]
  },
  therapy: {
    title: 'Therapy & Services',
    icon: Icons.therapy,
    fields: [
      { key: 'services', label: 'Services Requested', type: 'tags', span: 2 },
      { key: 'therapy_prior_level', label: 'Prior Level of Function', type: 'textarea', span: 2 },
      { key: 'therapy_bed_mobility', label: 'Bed Mobility', type: 'text', span: 1 },
      { key: 'therapy_transfers', label: 'Transfers', type: 'text', span: 1 },
      { key: 'therapy_gait', label: 'Gait', type: 'text', span: 1 },
      { key: 'physician', label: 'Referring Physician', type: 'text', span: 1 },
    ]
  },
  summary: {
    title: 'Clinical Summary & Decision',
    icon: Icons.summary,
    fields: [
      { key: 'clinical_summary', label: 'Clinical Summary', type: 'textarea', span: 2, rows: 4 },
      { key: 'decision_status', label: 'Decision', type: 'select', options: ['Accepting', 'Considering', 'Denying'], span: 1 },
      { key: 'decision_notes', label: 'Decision Notes', type: 'textarea', span: 1 },
      { key: 'last_updated_by', label: 'Last Updated By', type: 'text', span: 2 },
    ]
  },
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('referral');
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docContent, setDocContent] = useState<{original: any; extracted: any}>({ original: null, extracted: null });
  const [docViewTab, setDocViewTab] = useState<'original' | 'extracted'>('original');
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/applications/${params.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setApp(data);
          setEditedData(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (showDocViewer && app) {
      setDocLoading(true);
      Promise.all([
        fetch(`${API_URL}/api/applications/${app.id}/document/original`).then(r => r.json()).catch(() => null),
        fetch(`${API_URL}/api/applications/${app.id}/document/extracted`).then(r => r.json()).catch(() => null)
      ]).then(([original, extracted]) => {
        setDocContent({ original, extracted });
        setDocLoading(false);
      });
    }
  }, [showDocViewer, app]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      });
      setApp({ ...app, ...editedData });
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
    }
    setSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`${API_URL}/api/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setApp({ ...app, status: newStatus });
    } catch (error) {
      console.error('Status error:', error);
    }
  };

  const getValue = (key: string) => {
    const data = isEditing ? editedData : app;
    return data?.[key] ?? '';
  };

  const setValue = (key: string, value: any) => {
    setEditedData({ ...editedData, [key]: value });
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!app) return 0;
    const requiredFields = ['patient_name', 'dob', 'insurance', 'hospital', 'diagnosis'];
    const filled = requiredFields.filter(f => {
      const val = app[f];
      return val && (Array.isArray(val) ? val.length > 0 : val.toString().trim() !== '');
    });
    return Math.round((filled.length / requiredFields.length) * 100);
  };

  const renderField = (field: any) => {
    const value = getValue(field.key);
    
    if (!isEditing) {
      if (field.type === 'tags') {
        const tags = Array.isArray(value) ? value : [];
        return tags.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map((tag: string, i: number) => (
              <span key={i} style={{ background: '#e5e7eb', padding: '4px 12px', borderRadius: '6px', fontSize: '13px' }}>{tag}</span>
            ))}
          </div>
        ) : <span style={{ color: '#9ca3af' }}>—</span>;
      }
      if (field.type === 'toggle') {
        return value ? (
          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}>Yes</span>
        ) : (
          <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontWeight: 500, fontSize: '13px' }}>No</span>
        );
      }
      if (field.type === 'textarea' && value) {
        return <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{value}</div>;
      }
      return value || <span style={{ color: '#9ca3af' }}>—</span>;
    }

    // Edit mode
    const baseStyle = {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      background: 'white'
    };

    if (field.type === 'select') {
      return (
        <select value={value || ''} onChange={(e) => setValue(field.key, e.target.value)} style={baseStyle}>
          <option value="">Select...</option>
          {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }

    if (field.type === 'toggle') {
      return (
        <button
          type="button"
          onClick={() => setValue(field.key, !value)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px', background: value ? '#fee2e2' : '#dcfce7',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500
          }}
        >
          {value ? 'Yes - Fall Risk' : 'No Fall Risk'}
        </button>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => setValue(field.key, e.target.value)}
          rows={field.rows || 3}
          style={{ ...baseStyle, resize: 'vertical' }}
        />
      );
    }

    if (field.type === 'tags') {
      const tags = Array.isArray(value) ? value : [];
      return (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {tags.map((tag: string, i: number) => (
              <span key={i} style={{ background: '#e5e7eb', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tag}
                <button onClick={() => setValue(field.key, tags.filter((_: any, idx: number) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type and press Enter..."
            style={baseStyle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                setValue(field.key, [...tags, e.currentTarget.value.trim()]);
                e.currentTarget.value = '';
                e.preventDefault();
              }
            }}
          />
        </div>
      );
    }

    return (
      <input
        type={field.type === 'date' ? 'date' : 'text'}
        value={value || ''}
        onChange={(e) => setValue(field.key, e.target.value)}
        maxLength={field.maxLength}
        style={baseStyle}
      />
    );
  };

  if (loading) {
    return <div className="main-content"><div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div></div>;
  }

  if (!app) {
    return <div className="main-content"><div style={{ padding: '60px', textAlign: 'center' }}>Application not found</div></div>;
  }

  const completion = calculateCompletion();
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div className="main-content" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'white', borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/applications" style={{ color: '#6b7280', textDecoration: 'none' }}>
            ← Back
          </Link>
          <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: '#275380', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 600
            }}>
              {getInitials(app.patient_name)}
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{app.patient_name || 'Unknown Patient'}</h1>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{app.id}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Completion Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', background: completion === 100 ? '#dcfce7' : '#fef3c7',
            borderRadius: '8px', fontSize: '13px', fontWeight: 500
          }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: completion === 100 ? '#16a34a' : '#f59e0b',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700
            }}>
              {completion}%
            </div>
            Complete
          </div>

          {/* Status Dropdown */}
          <select
            value={app.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: '8px',
              border: '1px solid #d1d5db', fontSize: '14px', fontWeight: 500,
              background: app.status === 'approved' ? '#dcfce7' : app.status === 'denied' ? '#fee2e2' : app.status === 'review' ? '#dbeafe' : '#fef3c7',
              cursor: 'pointer'
            }}
          >
            <option value="pending">Pending</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>

          <button onClick={() => setShowDocViewer(true)} style={{
            padding: '10px 16px', background: 'white', border: '1px solid #d1d5db',
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
          }}>
            Documents
          </button>

          {isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); setEditedData(app); }} style={{
                padding: '10px 16px', background: 'white', border: '1px solid #d1d5db',
                borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '10px 20px', background: '#275380', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500
              }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} style={{
              padding: '10px 20px', background: '#275380', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500
            }}>
              Edit
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '0 24px 40px' }}>
        {/* AI Summary Card */}
        {app.ai_summary && (
          <div style={{
            background: 'linear-gradient(135deg, #275380 0%, #1e4060 100%)',
            borderRadius: '12px', padding: '20px', marginBottom: '24px', color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>AI Summary</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
                {app.confidence_score || 0}% confidence
              </span>
            </div>
            <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.95, fontSize: '14px' }}>{app.ai_summary}</p>
          </div>
        )}

        {/* Quick Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Hospital', value: app.hospital },
            { label: 'Insurance', value: app.insurance },
            { label: 'Care Level', value: app.care_level },
            { label: 'Source', value: app.source },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '12px', padding: '16px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 500 }}>{item.value || '—'}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content'
        }}>
          {Object.entries(FIELD_GROUPS).map(([key, group]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '10px 16px', border: 'none', borderRadius: '8px',
                background: activeTab === key ? 'white' : 'transparent',
                boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === key ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: '6px',
                color: activeTab === key ? '#1f2937' : '#6b7280'
              }}
            >
              <span>{group.icon}</span>
              {group.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {Object.entries(FIELD_GROUPS).map(([key, group]) => (
            <div key={key} style={{ display: activeTab === key ? 'block' : 'none' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{group.icon}</span>
                  {group.title}
                </h2>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {group.fields.map((field: any) => (
                    <div key={field.key} style={{ gridColumn: field.span === 2 ? '1 / -1' : 'auto' }}>
                      <label style={{
                        display: 'block', marginBottom: '6px',
                        fontSize: '13px', fontWeight: 500, color: '#374151'
                      }}>
                        {field.label}
                        {field.required && <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>}
                      </label>
                      <div style={{ fontSize: '15px' }}>{renderField(field)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div style={{
          marginTop: '24px', padding: '16px 20px',
          background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280'
        }}>
          <span><strong>Created:</strong> {app.created_at ? new Date(app.created_at).toLocaleString() : 'Unknown'}</span>
          <span><strong>Updated:</strong> {app.updated_at ? new Date(app.updated_at).toLocaleString() : 'Unknown'}</span>
          <span><strong>Facility:</strong> {app.facility || 'Optalis Healthcare'}</span>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocViewer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDocViewTab('original')} style={{
                  padding: '8px 16px', border: 'none', borderRadius: '6px',
                  background: docViewTab === 'original' ? '#275380' : '#f1f5f9',
                  color: docViewTab === 'original' ? 'white' : '#374151',
                  cursor: 'pointer', fontWeight: 500, fontSize: '13px'
                }}>Original</button>
                <button onClick={() => setDocViewTab('extracted')} style={{
                  padding: '8px 16px', border: 'none', borderRadius: '6px',
                  background: docViewTab === 'extracted' ? '#275380' : '#f1f5f9',
                  color: docViewTab === 'extracted' ? 'white' : '#374151',
                  cursor: 'pointer', fontWeight: 500, fontSize: '13px'
                }}>Extracted</button>
              </div>
              <button onClick={() => setShowDocViewer(false)} style={{
                width: '32px', height: '32px', borderRadius: '6px',
                border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer'
              }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f8fafc' }}>
              {docLoading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
              ) : docViewTab === 'original' ? (
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  {docContent.original ? (
                    <>
                      <div style={{ padding: '16px 20px', background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{docContent.original.subject || 'No Subject'}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>From: {docContent.original.from || 'Unknown'}</div>
                      </div>
                      <div style={{ padding: '20px', fontSize: '14px', lineHeight: 1.7 }}>
                        {(docContent.original.body || 'No content').split('\n').map((line: string, i: number) => (
                          <p key={i} style={{ margin: '0 0 8px 0' }}>{line || '\u00A0'}</p>
                        ))}
                      </div>
                    </>
                  ) : <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>No document</div>}
                </div>
              ) : (
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                  {docContent.extracted ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={{ background: '#275380', borderRadius: '12px', padding: '16px', color: 'white' }}>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Confidence</div>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>{docContent.extracted.confidence_score || 0}%</div>
                      </div>
                      {docContent.extracted.ai_summary && (
                        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontWeight: 600, marginBottom: '8px' }}>AI Summary</div>
                          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '14px' }}>{docContent.extracted.ai_summary}</p>
                        </div>
                      )}
                    </div>
                  ) : <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280', background: 'white', borderRadius: '12px' }}>No data</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
