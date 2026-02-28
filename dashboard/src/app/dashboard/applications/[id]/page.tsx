'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'https://optalis-api-production.up.railway.app';

// Field sections for the Optalis intake form
const FIELD_SECTIONS = {
  referral: {
    title: 'Referral Information',
    icon: '📋',
    color: '#275380',
    fields: [
      { key: 'referral_type', label: 'New Referral or Return to Hospital?', type: 'select', options: ['New Referral', 'Return to Hospital'] },
      { key: 'hospital', label: 'Hospital Patient is at *', type: 'text', required: true },
      { key: 'building', label: 'Building Referral is for *', type: 'text', required: true },
      { key: 'room_number', label: 'Room #', type: 'text' },
      { key: 'case_manager_name', label: 'Case Manager Name', type: 'text' },
      { key: 'case_manager_phone', label: 'Case Manager Phone #', type: 'text' },
    ]
  },
  patient: {
    title: 'Patient Information',
    icon: '👤',
    color: '#16a34a',
    fields: [
      { key: 'patient_name', label: 'Patient Name *', type: 'text', required: true },
      { key: 'dob', label: 'Date of Birth *', type: 'text', required: true },
      { key: 'sex', label: 'Sex *', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { key: 'ssn_last4', label: 'SS# (Last 4)', type: 'text', maxLength: 4 },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
    ]
  },
  insurance: {
    title: 'Insurance & Care Level',
    icon: '💳',
    color: '#7c3aed',
    fields: [
      { key: 'insurance', label: 'Insurance *', type: 'text', required: true },
      { key: 'policy_number', label: 'Policy/Member ID', type: 'text' },
      { key: 'care_level', label: 'SNF/LTC/AL/HOSPICE *', type: 'select', options: ['SNF', 'LTC', 'AL', 'Hospice'], required: true },
    ]
  },
  dates: {
    title: 'Key Dates',
    icon: '📅',
    color: '#ea580c',
    fields: [
      { key: 'date_admitted', label: 'Date Admitted *', type: 'date', required: true },
      { key: 'inpatient_date', label: 'Inpatient Date *', type: 'date', required: true },
      { key: 'anticipated_discharge', label: 'Anticipated Discharge *', type: 'date', required: true },
    ]
  },
  clinical: {
    title: 'Clinical Information',
    icon: '🏥',
    color: '#dc2626',
    fields: [
      { key: 'diagnosis', label: 'Admitting Diagnosis *', type: 'tags', required: true },
      { key: 'fall_risk', label: 'Fall Risk', type: 'select', options: ['Yes', 'No'] },
      { key: 'smoking_status', label: 'Smoking Status', type: 'select', options: ['Never', 'Former', 'Current'] },
      { key: 'isolation', label: 'Isolation *', type: 'text', required: true },
      { key: 'barrier_precautions', label: 'Enhanced Barrier Precautions *', type: 'text', required: true },
      { key: 'infection_prevention', label: 'Infection Prevention', type: 'textarea' },
    ]
  },
  medical: {
    title: 'Medical Details',
    icon: '💊',
    color: '#0891b2',
    fields: [
      { key: 'dme', label: 'Durable Medical Equipment *', type: 'textarea', required: true },
      { key: 'diet', label: 'Diet *', type: 'text', required: true },
      { key: 'height', label: 'Height', type: 'text' },
      { key: 'weight', label: 'Weight', type: 'text' },
      { key: 'medications', label: 'Current Medications', type: 'tags' },
      { key: 'allergies', label: 'Allergies', type: 'tags' },
      { key: 'iv_meds', label: 'IV Meds (if discharging on IVs)', type: 'textarea' },
      { key: 'expensive_meds', label: 'Expensive Meds/Carve Out/Chemo', type: 'textarea' },
    ]
  },
  clinical_summary: {
    title: 'Clinical Summary',
    icon: '📝',
    color: '#475569',
    fields: [
      { key: 'clinical_summary', label: 'Clinical Summary *', type: 'textarea', required: true, fullWidth: true },
      { key: 'physician', label: 'Referring Physician', type: 'text' },
    ]
  },
  therapy: {
    title: 'Therapy Status',
    icon: '🏃',
    color: '#059669',
    fields: [
      { key: 'therapy_prior_level', label: 'Prior Level of Function', type: 'textarea', hint: 'Who do they live with, how many levels in home, stairs to enter home, prior assistance needed' },
      { key: 'therapy_bed_mobility', label: 'Bed Mobility', type: 'text' },
      { key: 'therapy_transfers', label: 'Transfers', type: 'text' },
      { key: 'therapy_gait', label: 'Gait', type: 'text' },
      { key: 'services', label: 'Services Requested', type: 'tags' },
    ]
  },
  decision: {
    title: 'Decision',
    icon: '✅',
    color: '#275380',
    fields: [
      { key: 'decision_status', label: 'Accepting, Considering or Denying?', type: 'select', options: ['Accepting', 'Considering', 'Denying'] },
      { key: 'decision_notes', label: 'Decision Notes', type: 'textarea', hint: 'If considering, what additional info is needed?' },
      { key: 'last_updated_by', label: 'Last Updated By', type: 'text' },
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
  const [activeSection, setActiveSection] = useState('referral');
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docContent, setDocContent] = useState<{original: any; extracted: any}>({ original: null, extracted: null });
  const [docViewTab, setDocViewTab] = useState<'original' | 'extracted'>('original');
  const [docLoading, setDocLoading] = useState(false);

  // Fetch application data
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

  // Fetch document content when viewer opens
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
      const response = await fetch(`${API_URL}/api/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      });
      if (response.ok) {
        const updated = await response.json();
        setApp({ ...app, ...editedData });
        setIsEditing(false);
      }
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
      console.error('Status change error:', error);
    }
  };

  const getFieldValue = (key: string) => {
    const value = isEditing ? editedData[key] : app?.[key];
    if (Array.isArray(value)) return value;
    return value || '';
  };

  const setFieldValue = (key: string, value: any) => {
    setEditedData({ ...editedData, [key]: value });
  };

  const renderField = (field: any) => {
    const value = getFieldValue(field.key);
    
    if (!isEditing) {
      // Display mode
      if (field.type === 'tags' && Array.isArray(value)) {
        return value.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {value.map((tag: string, i: number) => (
              <span key={i} style={{ 
                background: '#e5e7eb', 
                padding: '4px 10px', 
                borderRadius: '12px', 
                fontSize: '13px' 
              }}>{tag}</span>
            ))}
          </div>
        ) : <span style={{ color: '#9ca3af' }}>—</span>;
      }
      if (field.type === 'select' && field.key === 'fall_risk') {
        return value === true || value === 'Yes' ? (
          <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠️ YES</span>
        ) : value === false || value === 'No' ? (
          <span style={{ color: '#16a34a' }}>No</span>
        ) : <span style={{ color: '#9ca3af' }}>—</span>;
      }
      return value || <span style={{ color: '#9ca3af' }}>—</span>;
    }

    // Edit mode
    if (field.type === 'select') {
      return (
        <select
          value={value || ''}
          onChange={(e) => setFieldValue(field.key, e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'white'
          }}
        >
          <option value="">Select...</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    
    if (field.type === 'textarea') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => setFieldValue(field.key, e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
        />
      );
    }

    if (field.type === 'tags') {
      const tags = Array.isArray(value) ? value : [];
      return (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {tags.map((tag: string, i: number) => (
              <span key={i} style={{ 
                background: '#e5e7eb', 
                padding: '4px 10px', 
                borderRadius: '12px', 
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {tag}
                <button 
                  onClick={() => setFieldValue(field.key, tags.filter((_: string, idx: number) => idx !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}
                >×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type and press Enter to add..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                setFieldValue(field.key, [...tags, e.currentTarget.value.trim()]);
                e.currentTarget.value = '';
                e.preventDefault();
              }
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      );
    }

    return (
      <input
        type={field.type === 'date' ? 'date' : 'text'}
        value={value || ''}
        onChange={(e) => setFieldValue(field.key, e.target.value)}
        maxLength={field.maxLength}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px'
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="main-content">
        <div style={{ padding: '60px', textAlign: 'center' }}>Application not found</div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="main-content" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/applications" style={{ color: '#275380', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          ← Back to Applications
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '16px', 
              background: '#275380', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 600
            }}>
              {getInitials(app.patient_name)}
            </div>
            <div>
              <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{app.patient_name || 'Unknown Patient'}</h1>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                {app.id} • {app.facility || 'Optalis Healthcare'}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={app.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontWeight: 500,
                background: app.status === 'approved' ? '#dcfce7' : app.status === 'denied' ? '#fee2e2' : app.status === 'review' ? '#dbeafe' : '#fef3c7',
                cursor: 'pointer'
              }}
            >
              <option value="pending">Pending</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
            
            <button
              onClick={() => setShowDocViewer(true)}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📄 View Documents
            </button>
            
            {isEditing ? (
              <>
                <button
                  onClick={() => { setIsEditing(false); setEditedData(app); }}
                  style={{ padding: '10px 20px', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ padding: '10px 24px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{ padding: '10px 24px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
              >
                ✏️ Edit Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Banner */}
      {app.ai_summary && (
        <div style={{ 
          background: 'linear-gradient(135deg, #275380 0%, #1e4060 100%)', 
          borderRadius: '12px', 
          padding: '20px 24px', 
          marginBottom: '24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600 }}>🤖 AI Summary</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
              {app.confidence_score || 0}% confidence
            </span>
          </div>
          <p style={{ margin: 0, lineHeight: '1.6', opacity: 0.95 }}>{app.ai_summary}</p>
        </div>
      )}

      {/* Section Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {Object.entries(FIELD_SECTIONS).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              padding: '10px 16px',
              background: activeSection === key ? section.color : 'white',
              color: activeSection === key ? 'white' : '#374151',
              border: `1px solid ${activeSection === key ? section.color : '#d1d5db'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: activeSection === key ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>{section.icon}</span>
            {section.title}
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {Object.entries(FIELD_SECTIONS).map(([key, section]) => (
          <div 
            key={key} 
            style={{ display: activeSection === key ? 'block' : 'none' }}
          >
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: `3px solid ${section.color}`,
              background: '#fafafa'
            }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: section.color }}>
                <span style={{ fontSize: '24px' }}>{section.icon}</span>
                {section.title}
              </h2>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '20px' 
              }}>
                {section.fields.map((field: any) => (
                  <div 
                    key={field.key} 
                    style={{ 
                      gridColumn: field.fullWidth ? '1 / -1' : 'auto'
                    }}
                  >
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '6px', 
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: '#374151' 
                    }}>
                      {field.label}
                    </label>
                    {field.hint && !isEditing && (
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{field.hint}</div>
                    )}
                    <div style={{ fontSize: '15px' }}>
                      {renderField(field)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Source Information */}
      <div style={{ 
        marginTop: '24px', 
        padding: '16px 20px', 
        background: '#f9fafb', 
        borderRadius: '12px',
        fontSize: '13px',
        color: '#6b7280'
      }}>
        <strong>Source:</strong> {app.source || 'Unknown'} • 
        <strong style={{ marginLeft: '12px' }}>Created:</strong> {app.created_at ? new Date(app.created_at).toLocaleString() : 'Unknown'} •
        <strong style={{ marginLeft: '12px' }}>Updated:</strong> {app.updated_at ? new Date(app.updated_at).toLocaleString() : 'Unknown'}
      </div>

      {/* Document Viewer Modal */}
      {showDocViewer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Application Documents</h3>
              <button 
                onClick={() => setShowDocViewer(false)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e0e0e0', background: 'white', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: '0' }}>
              <button
                onClick={() => setDocViewTab('original')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: docViewTab === 'original' ? '3px solid #275380' : '3px solid transparent',
                  color: docViewTab === 'original' ? '#275380' : '#666',
                  fontWeight: docViewTab === 'original' ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                📄 Original Document
              </button>
              <button
                onClick={() => setDocViewTab('extracted')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: docViewTab === 'extracted' ? '3px solid #275380' : '3px solid transparent',
                  color: docViewTab === 'extracted' ? '#275380' : '#666',
                  fontWeight: docViewTab === 'extracted' ? 600 : 400,
                  cursor: 'pointer'
                }}
              >
                🤖 Extracted Data
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f9fafb' }}>
              {docLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
              ) : docViewTab === 'original' ? (
                <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  {docContent.original ? (
                    <>
                      <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', background: '#fafafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#275380', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                            {(docContent.original.from || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{docContent.original.from || 'Unknown'}</div>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                              {docContent.original.received_at ? new Date(docContent.original.received_at).toLocaleString() : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#275380' }}>
                          {docContent.original.subject || 'No Subject'}
                        </div>
                      </div>
                      <div style={{ padding: '24px', fontSize: '15px', lineHeight: '1.7' }}>
                        {(docContent.original.body || 'No content').split('\n').map((line: string, i: number) => (
                          <p key={i} style={{ margin: '0 0 8px 0' }}>{line || '\u00A0'}</p>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>No document available</div>
                  )}
                </div>
              ) : (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  {docContent.extracted ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={{ background: 'linear-gradient(135deg, #275380, #1e4060)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>AI Confidence</div>
                        <div style={{ fontSize: '28px', fontWeight: 700 }}>{docContent.extracted.confidence_score || 0}%</div>
                      </div>
                      {docContent.extracted.ai_summary && (
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#275380' }}>AI Summary</div>
                          <p style={{ margin: 0, lineHeight: '1.6' }}>{docContent.extracted.ai_summary}</p>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#16a34a' }}>Patient Info</div>
                          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                            <div><span style={{ color: '#6b7280' }}>Name:</span> <strong>{docContent.extracted.patient_name || '—'}</strong></div>
                            <div><span style={{ color: '#6b7280' }}>DOB:</span> <strong>{docContent.extracted.dob || '—'}</strong></div>
                            <div><span style={{ color: '#6b7280' }}>Phone:</span> <strong>{docContent.extracted.phone || '—'}</strong></div>
                          </div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontWeight: 600, marginBottom: '12px', color: '#7c3aed' }}>Insurance</div>
                          <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                            <div><span style={{ color: '#6b7280' }}>Provider:</span> <strong>{docContent.extracted.insurance || '—'}</strong></div>
                            <div><span style={{ color: '#6b7280' }}>Policy:</span> <strong>{docContent.extracted.policy_number || '—'}</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#666', background: 'white', borderRadius: '12px' }}>No extracted data</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
