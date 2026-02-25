'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const mockApplications: Record<string, {
  id: string;
  name: string;
  initials: string;
  facility: string;
  status: string;
  date: string;
  priority: string;
  source: string;
  dob: string;
  phone: string;
  address: string;
  insurance: string;
  policyNumber: string;
  diagnosis: string[];
  medications: string[];
  allergies: string[];
  physician: string;
  services: string[];
  documents: { name: string; type: string }[];
  notes: string;
  confidence: number;
  aiSummary: string;
}> = {
  'APP-2026-001': {
    id: 'APP-2026-001', name: 'Margaret Thompson', initials: 'MT', facility: 'Cranberry Park at West Bloomfield',
    status: 'pending', date: '2/24/2026', priority: 'high', source: 'Hospital Referral',
    dob: '03/15/1942', phone: '(248) 555-0123', address: '1234 Oak Street, Bloomfield Hills, MI 48301',
    insurance: 'Medicare Part A & B', policyNumber: '1EG4-TE5-MK72',
    diagnosis: ['Dementia', 'Hypertension', 'Type 2 Diabetes'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Donepezil 5mg'],
    allergies: ['Penicillin', 'Sulfa'],
    physician: 'Dr. Robert Chen, MD', services: ['Memory Care', 'Medication Management', 'Physical Therapy'],
    documents: [{ name: 'Medical_Records.pdf', type: 'Medical' }, { name: 'Insurance_Card.pdf', type: 'Insurance' }, { name: 'Physician_Orders.pdf', type: 'Orders' }],
    notes: 'Patient being discharged from Beaumont Hospital. Family requesting urgent placement.',
    confidence: 94,
    aiSummary: '83-year-old female with progressive dementia, well-controlled hypertension, and Type 2 diabetes managed with oral medication. Currently hospitalized at Beaumont, medically stable and cleared for discharge. Family seeking memory care placement with 24/7 supervision. Patient requires assistance with ADLs and medication management. Cognitive assessment indicates moderate dementia with preserved mobility. Good candidate for memory care unit with structured activities program. No behavioral concerns noted. Insurance verified - Medicare coverage confirmed for skilled nursing level of care.'
  },
  'APP-2026-002': {
    id: 'APP-2026-002', name: 'Robert Williams', initials: 'RW', facility: 'Optalis of Grand Rapids',
    status: 'review', date: '2/24/2026', priority: 'medium', source: 'Website',
    dob: '07/22/1938', phone: '(616) 555-0456', address: '567 Maple Ave, Grand Rapids, MI 49503',
    insurance: 'Blue Cross Blue Shield', policyNumber: 'XYZ123456789',
    diagnosis: ['COPD', 'Congestive Heart Failure'],
    medications: ['Lasix 40mg', 'Metoprolol 25mg', 'Spiriva'],
    allergies: ['None known'],
    physician: 'Dr. Sarah Johnson, MD', services: ['Skilled Nursing', 'Respiratory Therapy', 'Cardiac Rehab'],
    documents: [{ name: 'Intake_Form.pdf', type: 'Application' }, { name: 'Insurance_Verification.pdf', type: 'Insurance' }],
    notes: 'Insurance verification pending. Awaiting pre-authorization.',
    confidence: 87,
    aiSummary: '87-year-old male with chronic COPD and compensated CHF, recently hospitalized for acute exacerbation. Requires supplemental oxygen (2L NC) and nebulizer treatments. Cardiac function stable with current medication regimen. Needs skilled nursing for respiratory therapy and cardiac monitoring during recovery. Estimated rehab duration: 3-4 weeks. Insurance pre-authorization pending - BCBS requires additional documentation for skilled nursing level. Recommend follow-up with pulmonology within 2 weeks of admission.'
  },
  'APP-2026-003': {
    id: 'APP-2026-003', name: 'Dorothy Martinez', initials: 'DM', facility: 'Cranberry Park at Milford',
    status: 'approved', date: '2/24/2026', priority: 'normal', source: 'Email',
    dob: '11/08/1945', phone: '(248) 555-0789', address: '890 Pine Road, Milford, MI 48381',
    insurance: 'Medicare Advantage - Humana', policyNumber: 'H1234567890',
    diagnosis: ['Mild Cognitive Impairment', 'Osteoarthritis'],
    medications: ['Celebrex 200mg', 'Aricept 10mg', 'Vitamin D 1000IU'],
    allergies: ['Aspirin'],
    physician: 'Dr. Michael Brown, DO', services: ['Assisted Living', 'Memory Support', 'Occupational Therapy'],
    documents: [{ name: 'Complete_Application.pdf', type: 'Application' }, { name: 'Medical_History.pdf', type: 'Medical' }, { name: 'Insurance_Card.pdf', type: 'Insurance' }],
    notes: 'All documentation complete. Family tour completed 2/22. Move-in scheduled for 3/1.',
    confidence: 96,
    aiSummary: '80-year-old female with mild cognitive impairment (MCI) and moderate osteoarthritis affecting mobility. Lives alone, family concerned about safety and medication compliance. Cognitively appropriate for assisted living with memory support services. Independent with most ADLs but needs supervision for medication management and meal preparation. Would benefit from structured daily activities and social engagement. OT recommended for joint protection strategies. Excellent candidate for assisted living - all documentation complete, insurance verified, family engaged in care planning.'
  }
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState('');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [applicationNotes, setApplicationNotes] = useState<{text: string; author: string; time: string}[]>([]);

  const app = mockApplications[params.id as string] || mockApplications['APP-2026-001'];

  // Editable state for extracted data
  const [editedData, setEditedData] = useState({
    name: app.name,
    dob: app.dob,
    phone: app.phone,
    address: app.address,
    facility: app.facility,
    insurance: app.insurance,
    policyNumber: app.policyNumber,
    diagnosis: [...app.diagnosis],
    medications: [...app.medications],
    allergies: [...app.allergies],
    physician: app.physician,
    services: [...app.services],
    customFields: [] as {label: string; value: string}[]
  });

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  const handleDecision = (type: string) => {
    setDecision(type);
    setShowModal(true);
  };

  const submitDecision = () => {
    alert(`Decision: ${decision}\nNotes: ${decisionNotes}`);
    setShowModal(false);
    router.push('/dashboard/applications');
  };

  const handleSaveEdits = () => {
    setIsEditing(false);
    alert('Changes saved successfully!');
  };

  const addCustomField = () => {
    if (newFieldLabel && newFieldValue) {
      setEditedData({
        ...editedData,
        customFields: [...editedData.customFields, { label: newFieldLabel, value: newFieldValue }]
      });
      setNewFieldLabel('');
      setNewFieldValue('');
      setShowAddField(false);
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      setApplicationNotes([
        { text: newNote, author: 'Jennifer Walsh', time: 'Just now' },
        ...applicationNotes
      ]);
      setNewNote('');
    }
  };

  const addArrayItem = (field: 'diagnosis' | 'medications' | 'allergies' | 'services', value: string) => {
    if (value.trim()) {
      setEditedData({
        ...editedData,
        [field]: [...editedData[field], value.trim()]
      });
    }
  };

  const removeArrayItem = (field: 'diagnosis' | 'medications' | 'allergies' | 'services', index: number) => {
    setEditedData({
      ...editedData,
      [field]: editedData[field].filter((_, i) => i !== index)
    });
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/applications" style={{ 
            width: '40px', height: '40px', borderRadius: '8px', background: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textDecoration: 'none'
          }}>
            <svg width="20" height="20" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '28px' }}>{isEditing ? editedData.name : app.name}</h1>
              <span className={`status-badge status-${app.status}`}>
                {app.status === 'pending' && 'Pending'}
                {app.status === 'approved' && 'Approved'}
                {app.status === 'denied' && 'Denied'}
                {app.status === 'review' && 'Needs Review'}
              </span>
            </div>
            <p style={{ color: '#666' }}>{app.id} • {isEditing ? editedData.facility : app.facility}</p>
          </div>
        </div>

        {(app.status === 'pending' || app.status === 'review') && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => handleDecision('approved')} className="btn btn-success">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Approve
            </button>
            <button onClick={() => handleDecision('denied')} className="btn btn-danger">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Deny
            </button>
            <button onClick={() => handleDecision('review')} className="btn btn-warning">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Review
            </button>
          </div>
        )}
      </div>

      {/* AI Summary Card */}
      <div style={{ 
        background: 'linear-gradient(135deg, #275380 0%, #1e3f61 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'rgba(255,255,255,0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>AI Medical Summary</h3>
              <span style={{ 
                padding: '2px 8px', 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '10px', 
                fontSize: '11px' 
              }}>
                {app.confidence}% confidence
              </span>
            </div>
            <p style={{ fontSize: '15px', lineHeight: 1.7, opacity: 0.95 }}>{app.aiSummary}</p>
          </div>
        </div>
      </div>

      {/* AI Confidence & Edit Banner */}
      <div style={{ 
        background: isEditing ? '#fef9c3' : 'linear-gradient(135deg, rgba(39,83,128,0.05) 0%, rgba(58,124,165,0.05) 100%)',
        border: isEditing ? '1px solid #fde047' : '1px solid rgba(39,83,128,0.2)',
        borderRadius: '12px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: isEditing ? '#fde047' : 'rgba(39,83,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" stroke={isEditing ? '#854d0e' : '#275380'} strokeWidth="2" viewBox="0 0 24 24">
              {isEditing ? (
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              ) : (
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              )}
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: isEditing ? '#854d0e' : '#275380' }}>
              {isEditing ? 'Editing Mode' : 'AI Data Extraction'}
            </div>
            <div style={{ fontSize: '14px', color: isEditing ? '#92400e' : '#666' }}>
              {isEditing ? 'Make changes to any field below' : `Confidence: ${app.confidence}%`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditing ? (
            <>
              <button 
                onClick={() => setShowAddField(true)}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
              >
                + Add Field
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdits}
                style={{ padding: '8px 16px', background: '#275380', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ padding: '8px 16px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
            >
              Edit Extracted Data
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Patient Info */}
          <div className="card">
            <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Patient Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Full Name</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedData.name} 
                    onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500 }}>{app.name}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Date of Birth</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedData.dob} 
                    onChange={(e) => setEditedData({...editedData, dob: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500 }}>{app.dob}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Phone</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedData.phone} 
                    onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500 }}>{app.phone}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Requested Facility</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedData.facility} 
                    onChange={(e) => setEditedData({...editedData, facility: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500 }}>{app.facility}</div>
                )}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Address</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedData.address} 
                    onChange={(e) => setEditedData({...editedData, address: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500 }}>{app.address}</div>
                )}
              </div>
            </div>
          </div>

          {/* Insurance Info */}
          <div className="card">
            <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Insurance Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Primary Insurance</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedData.insurance} 
                    onChange={(e) => setEditedData({...editedData, insurance: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500 }}>{app.insurance}</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Policy Number</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editedData.policyNumber} 
                    onChange={(e) => setEditedData({...editedData, policyNumber: e.target.value})}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div style={{ fontWeight: 500 }}>{app.policyNumber}</div>
                )}
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="card">
            <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Medical Information
            </h2>
            
            {/* Diagnosis */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Diagnosis</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(isEditing ? editedData.diagnosis : app.diagnosis).map((d, i) => (
                  <span key={i} style={{ 
                    padding: '6px 12px', 
                    background: '#fee2e2', 
                    color: '#991b1b', 
                    borderRadius: '20px', 
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {d}
                    {isEditing && (
                      <button onClick={() => removeArrayItem('diagnosis', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <svg width="14" height="14" fill="none" stroke="#991b1b" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <input 
                    type="text" 
                    placeholder="Add diagnosis..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('diagnosis', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{ padding: '6px 12px', border: '1px dashed #e0e0e0', borderRadius: '20px', fontSize: '13px', width: '150px' }}
                  />
                )}
              </div>
            </div>

            {/* Medications */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Medications</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(isEditing ? editedData.medications : app.medications).map((m, i) => (
                  <span key={i} style={{ 
                    padding: '6px 12px', 
                    background: '#dbeafe', 
                    color: '#1e40af', 
                    borderRadius: '20px', 
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {m}
                    {isEditing && (
                      <button onClick={() => removeArrayItem('medications', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <svg width="14" height="14" fill="none" stroke="#1e40af" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <input 
                    type="text" 
                    placeholder="Add medication..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('medications', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{ padding: '6px 12px', border: '1px dashed #e0e0e0', borderRadius: '20px', fontSize: '13px', width: '150px' }}
                  />
                )}
              </div>
            </div>

            {/* Allergies */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Allergies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(isEditing ? editedData.allergies : app.allergies).map((a, i) => (
                  <span key={i} style={{ 
                    padding: '6px 12px', 
                    background: '#fef9c3', 
                    color: '#854d0e', 
                    borderRadius: '20px', 
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {a}
                    {isEditing && (
                      <button onClick={() => removeArrayItem('allergies', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <svg width="14" height="14" fill="none" stroke="#854d0e" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <input 
                    type="text" 
                    placeholder="Add allergy..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('allergies', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{ padding: '6px 12px', border: '1px dashed #e0e0e0', borderRadius: '20px', fontSize: '13px', width: '150px' }}
                  />
                )}
              </div>
            </div>

            {/* Physician */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Referring Physician</div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedData.physician} 
                  onChange={(e) => setEditedData({...editedData, physician: e.target.value})}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
                />
              ) : (
                <div style={{ fontWeight: 500 }}>{app.physician}</div>
              )}
            </div>

            {/* Services */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Requested Services</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(isEditing ? editedData.services : app.services).map((s, i) => (
                  <span key={i} style={{ 
                    padding: '6px 12px', 
                    background: 'rgba(39,83,128,0.1)', 
                    color: '#275380', 
                    borderRadius: '20px', 
                    fontSize: '13px', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {s}
                    {isEditing && (
                      <button onClick={() => removeArrayItem('services', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                        <svg width="14" height="14" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <input 
                    type="text" 
                    placeholder="Add service..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('services', (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    style={{ padding: '6px 12px', border: '1px dashed #e0e0e0', borderRadius: '20px', fontSize: '13px', width: '150px' }}
                  />
                )}
              </div>
            </div>

            {/* Custom Fields */}
            {editedData.customFields.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>Additional Fields</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {editedData.customFields.map((field, i) => (
                    <div key={i}>
                      <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>{field.label}</div>
                      <div style={{ fontWeight: 500 }}>{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Application Details */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Application Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Submitted</span>
                <span style={{ fontWeight: 500 }}>{app.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Source</span>
                <span style={{ fontWeight: 500 }}>{app.source}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Priority</span>
                <span style={{ fontWeight: 500, color: app.priority === 'high' ? '#dc2626' : '#4a4a4a', textTransform: 'capitalize' }}>{app.priority}</span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Documents ({app.documents.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {app.documents.map((doc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9f7f4', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="20" height="20" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    </svg>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{doc.name}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{doc.type}</div>
                    </div>
                  </div>
                  <svg width="18" height="18" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Notes</h3>
            
            {/* Add Note Input */}
            <div style={{ marginBottom: '16px' }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px', 
                  resize: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                onClick={addNote}
                disabled={!newNote.trim()}
                style={{ 
                  marginTop: '8px',
                  padding: '8px 16px', 
                  background: newNote.trim() ? '#275380' : '#e0e0e0', 
                  color: newNote.trim() ? 'white' : '#888',
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: newNote.trim() ? 'pointer' : 'not-allowed', 
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {applicationNotes.map((note, i) => (
                <div key={i} style={{ padding: '12px', background: '#f9f7f4', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '8px' }}>{note.text}</p>
                  <div style={{ fontSize: '12px', color: '#888' }}>{note.author} • {note.time}</div>
                </div>
              ))}
              {app.notes && (
                <div style={{ padding: '12px', background: '#f9f7f4', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '8px' }}>{app.notes}</p>
                  <div style={{ fontSize: '12px', color: '#888' }}>System • On submission</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>
              {decision === 'approved' && 'Approve Application'}
              {decision === 'denied' && 'Deny Application'}
              {decision === 'review' && 'Mark for Review'}
            </h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              {decision === 'approved' && 'This will approve the application and sync to CRM.'}
              {decision === 'denied' && 'Please provide a reason for denial.'}
              {decision === 'review' && 'This will flag the application for additional review.'}
            </p>
            <textarea
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              rows={4}
              placeholder={decision === 'denied' ? 'Reason for denial (required)...' : 'Notes (optional)...'}
              style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', resize: 'none', marginBottom: '24px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={submitDecision}
                disabled={decision === 'denied' && !decisionNotes}
                style={{ 
                  flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white',
                  background: decision === 'approved' ? '#16a34a' : decision === 'denied' ? '#dc2626' : '#2563eb',
                  opacity: (decision === 'denied' && !decisionNotes) ? 0.5 : 1
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Field Modal */}
      {showAddField && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Add Custom Field</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Field Label</label>
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="e.g., Emergency Contact"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Field Value</label>
              <input
                type="text"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                placeholder="e.g., John Smith (248) 555-0100"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowAddField(false)} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={addCustomField}
                disabled={!newFieldLabel || !newFieldValue}
                style={{ 
                  flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white',
                  background: '#275380',
                  opacity: (newFieldLabel && newFieldValue) ? 1 : 0.5
                }}
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
