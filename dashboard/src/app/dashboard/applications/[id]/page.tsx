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
    confidence: 94
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
    confidence: 87
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
    confidence: 96
  }
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');

  const app = mockApplications[params.id as string] || mockApplications['APP-2026-001'];

  const handleDecision = (type: string) => {
    setDecision(type);
    setShowModal(true);
  };

  const submitDecision = () => {
    alert(`Decision: ${decision}\nNotes: ${notes}`);
    setShowModal(false);
    router.push('/dashboard/applications');
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '28px' }}>{app.name}</h1>
              <span className={`status-badge status-${app.status}`}>
                {app.status === 'pending' && 'Pending'}
                {app.status === 'approved' && 'Approved'}
                {app.status === 'denied' && 'Denied'}
                {app.status === 'review' && 'Needs Review'}
              </span>
            </div>
            <p style={{ color: '#666' }}>{app.id} • {app.facility}</p>
          </div>
        </div>

        {(app.status === 'pending' || app.status === 'review') && (
          <div style={{ display: 'flex', gap: '8px' }}>
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

      {/* AI Confidence Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(39,83,128,0.05) 0%, rgba(58,124,165,0.05) 100%)',
        border: '1px solid rgba(39,83,128,0.2)',
        borderRadius: '12px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(39,83,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#275380' }}>AI Data Extraction</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Confidence: {app.confidence}%</div>
          </div>
        </div>
        <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
          Edit Extracted Data
        </button>
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
                <div style={{ fontWeight: 500 }}>{app.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Date of Birth</div>
                <div style={{ fontWeight: 500 }}>{app.dob}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Phone</div>
                <div style={{ fontWeight: 500 }}>{app.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Requested Facility</div>
                <div style={{ fontWeight: 500 }}>{app.facility}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Address</div>
                <div style={{ fontWeight: 500 }}>{app.address}</div>
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
                <div style={{ fontWeight: 500 }}>{app.insurance}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Policy Number</div>
                <div style={{ fontWeight: 500 }}>{app.policyNumber}</div>
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
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Diagnosis</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {app.diagnosis.map((d, i) => (
                  <span key={i} style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '20px', fontSize: '13px' }}>{d}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Medications</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {app.medications.map((m, i) => (
                  <span key={i} style={{ padding: '6px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '13px' }}>{m}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Allergies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {app.allergies.map((a, i) => (
                  <span key={i} style={{ padding: '6px 12px', background: '#fef9c3', color: '#854d0e', borderRadius: '20px', fontSize: '13px' }}>{a}</span>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Referring Physician</div>
              <div style={{ fontWeight: 500 }}>{app.physician}</div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Requested Services</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {app.services.map((s, i) => (
                  <span key={i} style={{ padding: '6px 12px', background: 'rgba(39,83,128,0.1)', color: '#275380', borderRadius: '20px', fontSize: '13px', fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
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

          {/* Notes */}
          <div className="card">
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Notes</h3>
            <p style={{ fontSize: '14px', color: '#4a4a4a', lineHeight: 1.6 }}>{app.notes}</p>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>
              {decision === 'approved' && 'Approve Application'}
              {decision === 'denied' && 'Deny Application'}
              {decision === 'review' && 'Mark for Review'}
            </h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              {decision === 'approved' && 'This will approve the application and notify the patient.'}
              {decision === 'denied' && 'Please provide a reason for denial.'}
              {decision === 'review' && 'This will flag the application for additional review.'}
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={decision === 'denied' ? 'Reason for denial...' : 'Notes (optional)...'}
              style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', resize: 'none', marginBottom: '24px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={submitDecision}
                disabled={decision === 'denied' && !notes}
                style={{ 
                  flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white',
                  background: decision === 'approved' ? '#16a34a' : decision === 'denied' ? '#dc2626' : '#2563eb',
                  opacity: (decision === 'denied' && !notes) ? 0.5 : 1
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
