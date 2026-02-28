'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  CheckIcon, 
  XMarkIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import '../../mobile.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

// Field sections for mobile - optimized for touch
// SVG Icons for mobile
const SectionIcons: Record<string, React.ReactNode> = {
  referral: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  patient: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  insurance: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
  dates: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  clinical: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  summary: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>,
  therapy: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><path d="M12 8v8M8 20l4-4 4 4"/></svg>,
  decision: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
};

const SECTIONS = [
  {
    id: 'referral',
    title: 'Referral Info',
    icon: SectionIcons.referral,
    color: '#275380',
    fields: [
      { key: 'referral_type', label: 'Type', type: 'select', options: ['New Referral', 'Return to Hospital'] },
      { key: 'hospital', label: 'Hospital', type: 'text' },
      { key: 'building', label: 'Building', type: 'text' },
      { key: 'room_number', label: 'Room #', type: 'text' },
      { key: 'case_manager_name', label: 'Case Manager', type: 'text' },
      { key: 'case_manager_phone', label: 'CM Phone', type: 'tel' },
    ]
  },
  {
    id: 'patient',
    title: 'Patient Info',
    icon: SectionIcons.patient,
    color: '#16a34a',
    fields: [
      { key: 'patient_name', label: 'Name', type: 'text' },
      { key: 'dob', label: 'DOB', type: 'text' },
      { key: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female', 'Other'] },
      { key: 'ssn_last4', label: 'SSN (last 4)', type: 'text', maxLength: 4 },
      { key: 'phone', label: 'Phone', type: 'tel' },
      { key: 'address', label: 'Address', type: 'text' },
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance',
    icon: SectionIcons.insurance,
    color: '#7c3aed',
    fields: [
      { key: 'insurance', label: 'Insurance', type: 'text' },
      { key: 'policy_number', label: 'Policy #', type: 'text' },
      { key: 'care_level', label: 'Care Level', type: 'select', options: ['SNF', 'LTC', 'AL', 'Hospice'] },
    ]
  },
  {
    id: 'dates',
    title: 'Key Dates',
    icon: SectionIcons.dates,
    color: '#ea580c',
    fields: [
      { key: 'date_admitted', label: 'Admitted', type: 'date' },
      { key: 'inpatient_date', label: 'Inpatient', type: 'date' },
      { key: 'anticipated_discharge', label: 'Expected Discharge', type: 'date' },
    ]
  },
  {
    id: 'clinical',
    title: 'Clinical & Medical',
    icon: SectionIcons.clinical,
    color: '#dc2626',
    fields: [
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
    ]
  },
  {
    id: 'summary',
    title: 'Summary',
    icon: SectionIcons.summary,
    color: '#475569',
    fields: [
      { key: 'clinical_summary', label: 'Summary', type: 'textarea' },
      { key: 'physician', label: 'Physician', type: 'text' },
      { key: 'infection_prevention', label: 'Infection Prevention', type: 'textarea' },
    ]
  },
  {
    id: 'therapy',
    title: 'Therapy',
    icon: SectionIcons.therapy,
    color: '#059669',
    fields: [
      { key: 'therapy_prior_level', label: 'Prior Level', type: 'textarea' },
      { key: 'therapy_bed_mobility', label: 'Bed Mobility', type: 'text' },
      { key: 'therapy_transfers', label: 'Transfers', type: 'text' },
      { key: 'therapy_gait', label: 'Gait', type: 'text' },
      { key: 'services', label: 'Services', type: 'tags' },
    ]
  },
  {
    id: 'decision',
    title: 'Decision',
    icon: SectionIcons.decision,
    color: '#275380',
    fields: [
      { key: 'decision_status', label: 'Status', type: 'select', options: ['Accepting', 'Considering', 'Denying'] },
      { key: 'decision_notes', label: 'Notes', type: 'textarea' },
    ]
  },
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

  // Fetch application
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

  // Auto-hide new banner
  useEffect(() => {
    if (showNewBanner) {
      const timer = setTimeout(() => setShowNewBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showNewBanner]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getValue = (key: string) => {
    const data = isEditing ? editedData : app;
    const value = data?.[key];
    if (Array.isArray(value)) return value;
    return value || '';
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
    } catch (error) {
      console.error('Status error:', error);
    }
  };

  const renderField = (field: any) => {
    const value = getValue(field.key);
    
    // Display mode
    if (!isEditing) {
      if (field.type === 'tags') {
        const tags = Array.isArray(value) ? value : [];
        return tags.length > 0 ? (
          <div className="mobile-tags">
            {tags.map((tag: string, i: number) => (
              <span key={i} className="mobile-tag">{tag}</span>
            ))}
          </div>
        ) : <span className="mobile-empty">—</span>;
      }
      if (field.type === 'toggle') {
        return (
          <span className={`mobile-badge ${value ? 'danger' : 'success'}`}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      }
      return value || <span className="mobile-empty">—</span>;
    }

    // Edit mode
    if (field.type === 'select') {
      return (
        <select
          value={value || ''}
          onChange={(e) => setValue(field.key, e.target.value)}
          className="mobile-select"
        >
          <option value="">Select...</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'toggle') {
      return (
        <button
          type="button"
          onClick={() => setValue(field.key, !value)}
          className={`mobile-toggle ${value ? 'active' : ''}`}
        >
          <span className="mobile-toggle-track">
            <span className="mobile-toggle-thumb" />
          </span>
          <span>{value ? 'Yes' : 'No'}</span>
        </button>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value || ''}
          onChange={(e) => setValue(field.key, e.target.value)}
          rows={3}
          className="mobile-textarea"
          placeholder={field.label}
        />
      );
    }

    if (field.type === 'tags') {
      const tags = Array.isArray(value) ? value : [];
      return (
        <div>
          <div className="mobile-tags" style={{ marginBottom: '8px' }}>
            {tags.map((tag: string, i: number) => (
              <span key={i} className="mobile-tag editable">
                {tag}
                <button 
                  type="button"
                  onClick={() => setValue(field.key, tags.filter((_: string, idx: number) => idx !== i))}
                  className="mobile-tag-remove"
                >×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add and press Enter..."
            className="mobile-input"
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
        type={field.type === 'date' ? 'date' : field.type === 'tel' ? 'tel' : 'text'}
        value={value || ''}
        onChange={(e) => setValue(field.key, e.target.value)}
        maxLength={field.maxLength}
        className="mobile-input"
        placeholder={field.label}
      />
    );
  };

  if (isLoading) {
    return (
      <MobileLayout title="Loading..." showBack>
        <div className="mobile-loading">
          <div className="mobile-spinner" />
        </div>
      </MobileLayout>
    );
  }

  if (!app) {
    return (
      <MobileLayout title="Not Found" showBack>
        <div className="mobile-empty-state">
          <p>Application not found</p>
        </div>
      </MobileLayout>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <MobileLayout title="Application" showBack>
      <div className="mobile-app-detail">
        {/* New Application Banner */}
        {showNewBanner && (
          <div className="mobile-success-banner">
            <CheckIcon className="w-5 h-5" />
            <span>Application created successfully!</span>
          </div>
        )}

        {/* Patient Header Card */}
        <div className="mobile-patient-header">
          <div className="mobile-avatar" style={{ background: '#275380' }}>
            {getInitials(app.patient_name)}
          </div>
          <div className="mobile-patient-info">
            <h1>{app.patient_name || 'Unknown Patient'}</h1>
            <p>{app.id}</p>
          </div>
          <div className={`mobile-status-badge ${app.status}`}>
            {app.status}
          </div>
        </div>

        {/* AI Summary */}
        {app.ai_summary && (
          <div className="mobile-ai-card">
            <div className="mobile-ai-header">
              <span>AI Summary</span>
              <span className="mobile-confidence">{app.confidence_score || 0}%</span>
            </div>
            <p>{app.ai_summary}</p>
          </div>
        )}

        {/* Action Bar */}
        <div className="mobile-action-bar">
          {isEditing ? (
            <>
              <button 
                className="mobile-btn secondary"
                onClick={() => { setIsEditing(false); setEditedData(app); }}
              >
                Cancel
              </button>
              <button 
                className="mobile-btn primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button 
                className="mobile-btn secondary"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <select 
                className="mobile-status-select"
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="review">Review</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </>
          )}
        </div>

        {/* Collapsible Sections */}
        <div className="mobile-sections">
          {SECTIONS.map(section => (
            <div key={section.id} className="mobile-section">
              <button
                type="button"
                className="mobile-section-header"
                onClick={() => toggleSection(section.id)}
                style={{ borderLeftColor: section.color }}
              >
                <span className="mobile-section-icon">{section.icon}</span>
                <span className="mobile-section-title">{section.title}</span>
                {expandedSections.includes(section.id) ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>
              
              {expandedSections.includes(section.id) && (
                <div className="mobile-section-content">
                  {section.fields.map(field => (
                    <div key={field.key} className="mobile-field">
                      <label>{field.label}</label>
                      <div className="mobile-field-value">
                        {renderField(field)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {!isEditing && (
          <div className="mobile-quick-actions">
            <button
              className="mobile-action-btn approve"
              onClick={() => handleStatusChange('approved')}
              disabled={app.status === 'approved'}
            >
              <CheckIcon className="w-6 h-6" />
              <span>Approve</span>
            </button>
            <button
              className="mobile-action-btn review"
              onClick={() => handleStatusChange('review')}
              disabled={app.status === 'review'}
            >
              <PencilIcon className="w-6 h-6" />
              <span>Review</span>
            </button>
            <button
              className="mobile-action-btn deny"
              onClick={() => handleStatusChange('denied')}
              disabled={app.status === 'denied'}
            >
              <XMarkIcon className="w-6 h-6" />
              <span>Deny</span>
            </button>
          </div>
        )}

        {/* Source Footer */}
        <div className="mobile-source-footer">
          <span>Source: {app.source || 'Unknown'}</span>
          <span>{app.created_at ? new Date(app.created_at).toLocaleDateString() : ''}</span>
        </div>
      </div>

      <style jsx>{`
        .mobile-app-detail {
          padding: 16px;
          padding-bottom: 100px;
        }
        .mobile-success-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #dcfce7;
          color: #166534;
          border-radius: 12px;
          margin-bottom: 16px;
          font-weight: 500;
        }
        .mobile-patient-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .mobile-avatar {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 20px;
        }
        .mobile-patient-info {
          flex: 1;
        }
        .mobile-patient-info h1 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }
        .mobile-patient-info p {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
        }
        .mobile-status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .mobile-status-badge.pending { background: #fef3c7; color: #92400e; }
        .mobile-status-badge.review { background: #dbeafe; color: #1e40af; }
        .mobile-status-badge.approved { background: #dcfce7; color: #166534; }
        .mobile-status-badge.denied { background: #fee2e2; color: #991b1b; }
        
        .mobile-ai-card {
          background: linear-gradient(135deg, #275380, #1e4060);
          border-radius: 16px;
          padding: 16px;
          color: white;
          margin-bottom: 16px;
        }
        .mobile-ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .mobile-confidence {
          background: rgba(255,255,255,0.2);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 13px;
        }
        .mobile-ai-card p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.95;
        }
        
        .mobile-action-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .mobile-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .mobile-btn.primary {
          background: #275380;
          color: white;
        }
        .mobile-btn.secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .mobile-status-select {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          font-weight: 500;
          background: white;
        }
        
        .mobile-sections {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-section {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .mobile-section-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: none;
          border: none;
          border-left: 4px solid;
          cursor: pointer;
          text-align: left;
        }
        .mobile-section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        .mobile-section-icon svg {
          width: 20px;
          height: 20px;
        }
        .mobile-section-title {
          flex: 1;
          font-weight: 600;
          font-size: 15px;
          color: #1f2937;
        }
        .mobile-section-content {
          padding: 0 16px 16px;
          border-top: 1px solid #f3f4f6;
        }
        .mobile-field {
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .mobile-field:last-child {
          border-bottom: none;
        }
        .mobile-field label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .mobile-field-value {
          font-size: 15px;
          color: #1f2937;
        }
        
        .mobile-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .mobile-tag {
          background: #e5e7eb;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 13px;
        }
        .mobile-tag.editable {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mobile-tag-remove {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          font-size: 16px;
        }
        .mobile-empty {
          color: #9ca3af;
        }
        .mobile-badge {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
        }
        .mobile-badge.danger {
          background: #fee2e2;
          color: #dc2626;
        }
        .mobile-badge.success {
          background: #dcfce7;
          color: #16a34a;
        }
        
        .mobile-input, .mobile-select, .mobile-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 15px;
          background: #f9fafb;
        }
        .mobile-textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .mobile-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: #f3f4f6;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 15px;
        }
        .mobile-toggle-track {
          width: 44px;
          height: 26px;
          background: #d1d5db;
          border-radius: 13px;
          position: relative;
          transition: background 0.2s;
        }
        .mobile-toggle.active .mobile-toggle-track {
          background: #275380;
        }
        .mobile-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .mobile-toggle.active .mobile-toggle-thumb {
          transform: translateX(18px);
        }
        
        .mobile-quick-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          padding: 16px;
          background: white;
          border-radius: 16px;
        }
        .mobile-action-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 12px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }
        .mobile-action-btn.approve {
          background: #dcfce7;
          color: #166534;
        }
        .mobile-action-btn.review {
          background: #dbeafe;
          color: #1e40af;
        }
        .mobile-action-btn.deny {
          background: #fee2e2;
          color: #991b1b;
        }
        .mobile-action-btn:disabled {
          opacity: 0.5;
        }
        
        .mobile-source-footer {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          margin-top: 16px;
          font-size: 12px;
          color: #9ca3af;
        }
        
        .mobile-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
        }
        .mobile-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #275380;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .mobile-empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }
      `}</style>
    </MobileLayout>
  );
}

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={
      <MobileLayout title="Loading..." showBack>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#275380', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </MobileLayout>
    }>
      <ApplicationDetailContent />
    </Suspense>
  );
}
