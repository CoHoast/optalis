'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  CheckIcon, 
  XMarkIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import '../mobile.css';

// Mock data - would come from API based on ID
const getApplication = (id: string) => ({
  id,
  patientName: 'Margaret Thompson',
  dob: '03/15/1943',
  age: 83,
  gender: 'F',
  phone: '(248) 555-0147',
  address: '4521 Maple Grove Dr, West Bloomfield, MI 48322',
  insurance: 'Medicare',
  policyNumber: '1EG4-TE5-MK72',
  secondaryInsurance: 'AARP Medigap Plan F',
  diagnosis: ['Dementia - Moderate', 'Hypertension', 'Type 2 Diabetes'],
  medications: [
    'Lisinopril 10mg daily',
    'Metformin 500mg twice daily',
    'Donepezil 10mg at bedtime',
    'Aspirin 81mg daily',
  ],
  allergies: ['Penicillin', 'Sulfa drugs'],
  physician: 'Dr. Sarah Chen',
  physicianPhone: '(313) 555-0199',
  facility: 'Beaumont Health - Royal Oak',
  requestedServices: ['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy'],
  priority: 'high',
  source: 'Hospital Referral',
  createdAt: '2 hours ago',
  confidence: 95,
  summary: 'Post-acute rehabilitation following hip replacement surgery. Patient requires PT/OT and skilled nursing care. Family prefers facility close to daughter in West Bloomfield area.',
  notes: 'Daughter (primary contact): Susan Thompson (248) 555-0198. Patient has history of falls. Currently ambulating with walker.',
});

export default function MobileApplicationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [app, setApp] = useState(getApplication(id));
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setEditedFields({ ...editedFields, [field]: value });
  };

  const handleSave = () => {
    // TODO: API call to save changes
    console.log('Saving changes:', editedFields);
    setIsEditing(false);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  };

  const handleSubmitToCRM = async () => {
    setIsSubmitting(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // TODO: API call to submit to PointClickCare
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowSubmitConfirm(false);
    
    // Success haptic
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 100, 10, 100, 10]);
    }
    
    // Navigate back
    router.push('/mobile');
  };

  const handleApprove = () => {
    setShowSubmitConfirm(true);
  };

  const handleDeny = () => {
    // TODO: Show denial reason modal
    console.log('Deny application');
    router.push('/mobile');
  };

  const renderEditableField = (label: string, field: string, value: string, multiline = false) => {
    const currentValue = editedFields[field] ?? value;
    
    return (
      <div className="mobile-form-group">
        <label className="mobile-label">{label}</label>
        {isEditing ? (
          multiline ? (
            <textarea
              className="mobile-textarea"
              value={currentValue}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              rows={3}
            />
          ) : (
            <input
              type="text"
              className="mobile-input"
              value={currentValue}
              onChange={(e) => handleFieldChange(field, e.target.value)}
            />
          )
        ) : (
          <div className="mobile-field-value">{currentValue}</div>
        )}
      </div>
    );
  };

  const renderListField = (label: string, items: string[]) => (
    <div className="mobile-form-group">
      <label className="mobile-label">{label}</label>
      <div className="mobile-tags">
        {items.map((item, i) => (
          <span key={i} className="mobile-tag">{item}</span>
        ))}
      </div>
    </div>
  );

  return (
    <MobileLayout 
      title={isEditing ? 'Edit Application' : 'Application'} 
      showBack 
      rightAction={
        isEditing ? (
          <button className="mobile-icon-btn" onClick={handleSave}>
            <CheckIcon className="w-6 h-6 text-green-600" />
          </button>
        ) : (
          <button className="mobile-icon-btn" onClick={() => setIsEditing(true)}>
            <PencilIcon className="w-6 h-6" />
          </button>
        )
      }
    >
      {/* AI Summary Card */}
      <div className="mobile-section" style={{ paddingTop: 16 }}>
        <div className="ai-summary-card">
          <div className="ai-summary-header">
            <DocumentTextIcon className="w-5 h-5" />
            <span>AI Summary</span>
            <span className="ai-confidence">{app.confidence}% confidence</span>
          </div>
          <p className="ai-summary-text">{app.summary}</p>
        </div>
      </div>

      {/* Low Confidence Warning */}
      {app.confidence < 85 && (
        <div className="mobile-section">
          <div className="warning-banner">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>Low confidence extraction - please verify all fields</span>
          </div>
        </div>
      )}

      {/* Patient Information */}
      <div className="mobile-section">
        <h3 className="mobile-section-title" style={{ fontSize: 15, color: '#6b7280', marginTop: 20 }}>
          Patient Information
        </h3>
        
        {renderEditableField('Patient Name', 'patientName', app.patientName)}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {renderEditableField('Date of Birth', 'dob', app.dob)}
          {renderEditableField('Phone', 'phone', app.phone)}
        </div>
        
        {renderEditableField('Address', 'address', app.address)}
      </div>

      {/* Insurance Information */}
      <div className="mobile-section">
        <h3 className="mobile-section-title" style={{ fontSize: 15, color: '#6b7280', marginTop: 20 }}>
          Insurance
        </h3>
        
        {renderEditableField('Primary Insurance', 'insurance', app.insurance)}
        {renderEditableField('Policy Number', 'policyNumber', app.policyNumber)}
        {renderEditableField('Secondary Insurance', 'secondaryInsurance', app.secondaryInsurance)}
      </div>

      {/* Medical Information */}
      <div className="mobile-section">
        <h3 className="mobile-section-title" style={{ fontSize: 15, color: '#6b7280', marginTop: 20 }}>
          Medical Information
        </h3>
        
        {renderListField('Diagnosis', app.diagnosis)}
        {renderListField('Medications', app.medications)}
        {renderListField('Allergies', app.allergies)}
      </div>

      {/* Referral Information */}
      <div className="mobile-section">
        <h3 className="mobile-section-title" style={{ fontSize: 15, color: '#6b7280', marginTop: 20 }}>
          Referral
        </h3>
        
        {renderEditableField('Referring Physician', 'physician', app.physician)}
        {renderEditableField('Referring Facility', 'facility', app.facility)}
        {renderListField('Requested Services', app.requestedServices)}
      </div>

      {/* Notes */}
      <div className="mobile-section" style={{ paddingBottom: 120 }}>
        <h3 className="mobile-section-title" style={{ fontSize: 15, color: '#6b7280', marginTop: 20 }}>
          Notes
        </h3>
        {renderEditableField('Notes', 'notes', app.notes, true)}
      </div>

      {/* Action Bar */}
      {!isEditing && (
        <div className="quick-actions-bar" style={{ 
          position: 'fixed', 
          bottom: 'calc(83px + env(safe-area-inset-bottom))',
          left: 0,
          right: 0,
        }}>
          <button className="quick-action-btn deny" onClick={handleDeny}>
            <XMarkIcon className="w-5 h-5" />
            Deny
          </button>
          <button className="quick-action-btn approve" onClick={handleApprove}>
            <CheckIcon className="w-5 h-5" />
            Approve
          </button>
        </div>
      )}

      {/* Submit to CRM Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="mobile-modal-overlay" onClick={() => setShowSubmitConfirm(false)}>
          <div className="mobile-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="mobile-modal-title">Submit to PointClickCare?</h3>
            <p className="mobile-modal-text">
              This will approve the application and sync patient data to your CRM.
            </p>
            
            <div className="mobile-modal-actions">
              <button 
                className="quick-action-btn review"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="quick-action-btn submit"
                onClick={handleSubmitToCRM}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="btn-spinner" />
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-summary-card {
          background: linear-gradient(135deg, #275380 0%, #1e3f61 100%);
          border-radius: 12px;
          padding: 16px;
          color: white;
        }
        
        .ai-summary-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .ai-confidence {
          margin-left: auto;
          background: rgba(255,255,255,0.2);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
        }
        
        .ai-summary-text {
          font-size: 15px;
          line-height: 1.5;
          margin: 0;
          opacity: 0.95;
        }
        
        .warning-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #fef3c7;
          border-radius: 10px;
          font-size: 13px;
          color: #92400e;
          margin-top: 12px;
        }
        
        .mobile-field-value {
          font-size: 17px;
          color: #1a1a1a;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .mobile-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 8px 0;
        }
        
        .mobile-tag {
          display: inline-block;
          padding: 6px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
        }
        
        .mobile-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 200;
          padding: 16px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom));
        }
        
        .mobile-modal {
          width: 100%;
          max-width: 400px;
          background: white;
          border-radius: 16px;
          padding: 24px;
        }
        
        .mobile-modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }
        
        .mobile-modal-text {
          font-size: 15px;
          color: #6b7280;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }
        
        .mobile-modal-actions {
          display: flex;
          gap: 12px;
        }
        
        .btn-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </MobileLayout>
  );
}
