'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { features } from '@/lib/config';

// Icon components for integrations
const CRMIcon = () => (
  <svg width="24" height="24" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const CloudIcon = () => (
  <svg width="24" height="24" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
  </svg>
);
const BuildingIcon = () => (
  <svg width="24" height="24" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>
);

const crmIntegrations = [
  { id: 'salesforce', name: 'Salesforce', type: 'CRM', status: 'disconnected', lastSync: 'Never', icon: 'cloud', records: 0 },
  { id: 'hubspot', name: 'HubSpot', type: 'CRM', status: 'disconnected', lastSync: 'Never', icon: 'crm', records: 0 },
  { id: 'pointclickcare', name: 'PointClickCare', type: 'EHR/CRM', status: 'connected', lastSync: '2 minutes ago', icon: 'building', records: 1456 },
];

const inputSources = [
  { id: 'email', name: 'Quick Intake Email', type: 'EMAIL', address: 'intake@optalis.dokit.ai', status: 'active', lastPolled: '30 seconds ago', pending: 3 },
  { id: 'fax', name: 'eFax Integration', type: 'FAX', address: '+1 (248) 555-0199', status: 'active', lastPolled: '15 minutes ago', pending: 1 },
  { id: 'webform', name: 'Website Contact Form', type: 'WEB_FORM', address: 'optalishealthcare.com/apply', status: 'active', lastPolled: 'Real-time', pending: 0 },
  { id: 'referral', name: 'Hospital Referral Portal', type: 'API', address: 'api.beaumont.org/referrals', status: 'active', lastPolled: '5 minutes ago', pending: 2 },
];

const defaultFieldMappings = [
  { source: 'Patient Name', destination: 'Patient.FullName', status: 'mapped' },
  { source: 'Date of Birth', destination: 'Patient.DateOfBirth', status: 'mapped' },
  { source: 'Phone', destination: 'Patient.PrimaryPhone', status: 'mapped' },
  { source: 'Insurance Provider', destination: 'Patient.InsurancePlan', status: 'mapped' },
  { source: 'Policy Number', destination: 'Patient.MemberID', status: 'mapped' },
  { source: 'Diagnosis', destination: 'Referral.PrimaryDiagnosis', status: 'mapped' },
  { source: 'Requested Facility', destination: 'Referral.FacilityCode', status: 'mapped' },
  { source: 'Referring Physician', destination: 'Referral.ReferringProvider', status: 'mapped' },
  { source: 'Decision Status', destination: 'Referral.AdmissionStatus', status: 'mapped' },
  { source: 'Decision Notes', destination: 'Referral.ClinicalNotes', status: 'mapped' },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const [showAddCRM, setShowAddCRM] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [showFieldMapping, setShowFieldMapping] = useState(false);
  const [fieldMappings, setFieldMappings] = useState(defaultFieldMappings);
  const [editingMapping, setEditingMapping] = useState<{index: number; source: string; destination: string} | null>(null);
  const [showAddMapping, setShowAddMapping] = useState(false);
  const [newMapping, setNewMapping] = useState({ source: '', destination: '' });

  // Redirect to dashboard in basic mode
  useEffect(() => {
    if (!features.crmAutoSync) {
      router.replace('/dashboard');
    }
  }, [router]);

  // Don't render anything in basic mode while redirecting
  if (!features.crmAutoSync) {
    return null;
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Integrations</h1>
        <p style={{ color: '#4a4a4a' }}>Configure input sources, CRM connections, and field mappings</p>
      </div>

      {/* Basic Mode Banner */}
      {!features.emailIntake && (
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <svg width="24" height="24" fill="none" stroke="#0284c7" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <div>
            <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '2px' }}>Basic Mode</div>
            <div style={{ fontSize: '14px', color: '#0284c7' }}>
              Email intake and AI processing features are not included in this plan. 
              Applications are entered manually.
            </div>
          </div>
        </div>
      )}

      {/* CRM Connections */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>CRM Connections</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>Send approved/denied applications directly to your CRM</p>
          </div>
          <button onClick={() => setShowAddCRM(true)} className="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            Add CRM
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {crmIntegrations.map((crm) => (
            <div key={crm.id} style={{ 
              padding: '20px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '12px',
              background: crm.status === 'connected' ? '#f9f7f4' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {crm.icon === 'cloud' && <CloudIcon />}
                  {crm.icon === 'crm' && <CRMIcon />}
                  {crm.icon === 'building' && <BuildingIcon />}
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: crm.status === 'connected' ? '#dcfce7' : '#f3f4f6',
                  color: crm.status === 'connected' ? '#166534' : '#666'
                }}>
                  {crm.status === 'connected' ? '● Connected' : '○ Disconnected'}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{crm.name}</h3>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>{crm.type}</p>
              
              {crm.status === 'connected' ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                  <span>{crm.records.toLocaleString()} records synced</span>
                  <span>Last: {crm.lastSync}</span>
                </div>
              ) : (
                <button style={{ width: '100%', padding: '8px', background: '#275380', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input Sources */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Input Sources</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>Where applications are received from</p>
          </div>
          <button onClick={() => setShowAddSource(true)} className="btn btn-primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            Add Source
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Source</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Address</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Last Polled</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Pending</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#666' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inputSources.filter(source => features.emailIntake || source.type !== 'EMAIL').map((source) => (
                <tr key={source.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '8px', 
                        background: 'rgba(39,83,128,0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        {source.type === 'EMAIL' && <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                        {source.type === 'FAX' && <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24"><path d="M6.5 12H7V8a3 3 0 013-3h4a3 3 0 013 3v4h.5a2.5 2.5 0 012.5 2.5v3a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 17.5v-3A2.5 2.5 0 016.5 12zM8 12h8V8a1 1 0 00-1-1h-6a1 1 0 00-1 1v4zM9 16h6"/></svg>}
                        {source.type === 'WEB_FORM' && <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>}
                        {source.type === 'API' && <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>}
                      </div>
                      <span style={{ fontWeight: 500 }}>{source.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#666' }}>{source.type.replace('_', ' ')}</td>
                  <td style={{ padding: '16px', color: '#666', fontFamily: 'monospace', fontSize: '13px' }}>{source.address}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 500,
                      background: '#dcfce7', color: '#166534'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#666', fontSize: '14px' }}>{source.lastPolled}</td>
                  <td style={{ padding: '16px' }}>
                    {source.pending > 0 ? (
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: '#fef9c3', color: '#854d0e' }}>
                        {source.pending} pending
                      </span>
                    ) : (
                      <span style={{ color: '#888', fontSize: '14px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button style={{ padding: '6px 12px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginRight: '8px' }}>
                      Configure
                    </button>
                    <button style={{ padding: '6px 12px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Mapping */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Field Mapping</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>Map extracted data fields to your CRM fields</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '10px 16px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
              Auto-Map Fields
            </button>
            <button onClick={() => setShowFieldMapping(true)} className="btn btn-primary">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4"/>
              </svg>
              Add Mapping
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', padding: '12px 16px', background: '#f9f7f4', borderRadius: '8px' }}>
          <span style={{ fontWeight: 500, color: '#666', width: '200px' }}>Extracted Field</span>
          <span style={{ color: '#888' }}>→</span>
          <span style={{ fontWeight: 500, color: '#666', flex: 1 }}>PointClickCare Field</span>
          <span style={{ width: '80px' }}></span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {fieldMappings.map((mapping, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', border: '1px solid #f0f0f0', borderRadius: '8px', transition: 'background 0.2s' }}
                 onMouseOver={(e) => e.currentTarget.style.background = '#f9f7f4'}
                 onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
              <span style={{ width: '200px', fontWeight: 500 }}>{mapping.source}</span>
              <svg width="20" height="20" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span style={{ flex: 1, fontFamily: 'monospace', fontSize: '14px', color: '#666' }}>{mapping.destination}</span>
              <span style={{ 
                padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 500,
                background: '#dcfce7', color: '#166534'
              }}>
                ✓ Mapped
              </span>
              <button
                onClick={() => setEditingMapping({ index: i, source: mapping.source, destination: mapping.destination })}
                style={{ padding: '6px 12px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#666' }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Remove this field mapping?')) {
                    setFieldMappings(fieldMappings.filter((_, idx) => idx !== i));
                  }
                }}
                style={{ padding: '6px 10px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#dc2626' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAddMapping(true)}
            style={{ padding: '10px 20px', background: 'white', border: '1px solid #275380', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#275380', fontWeight: 500 }}
          >
            + Add Field Mapping
          </button>
        </div>

        <div style={{ marginTop: '16px', padding: '16px', background: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <svg width="20" height="20" fill="none" stroke="#1e40af" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div>
            <div style={{ fontWeight: 500, color: '#1e40af', marginBottom: '4px' }}>One-Click PointClickCare Sync</div>
            <div style={{ fontSize: '14px', color: '#1e40af' }}>
              When you approve or deny an application, the decision and all mapped fields are automatically sent to PointClickCare. 
              The patient referral is created (or updated) and the admission status is set based on your decision.
            </div>
          </div>
        </div>
      </div>

      {/* Add CRM Modal */}
      {showAddCRM && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Connect CRM</h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>Choose your CRM platform to connect</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { name: 'Salesforce', icon: 'cloud', desc: 'Connect via OAuth 2.0' },
                { name: 'HubSpot', icon: 'crm', desc: 'Connect via API key' },
                { name: 'PointClickCare', icon: 'building', desc: 'Healthcare EHR integration' },
                { name: 'Custom Webhook', icon: 'link', desc: 'Send to any REST API' },
              ].map((crm) => (
                <button key={crm.name} style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                  border: '1px solid #e0e0e0', borderRadius: '12px', background: 'white',
                  cursor: 'pointer', textAlign: 'left', width: '100%'
                }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {crm.icon === 'cloud' && <CloudIcon />}
                    {crm.icon === 'crm' && <CRMIcon />}
                    {crm.icon === 'building' && <BuildingIcon />}
                    {crm.icon === 'link' && <svg width="24" height="24" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{crm.name}</div>
                    <div style={{ fontSize: '13px', color: '#888' }}>{crm.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setShowAddCRM(false)} style={{ width: '100%', padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Field Mapping Modal */}
      {editingMapping && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Edit Field Mapping</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Extracted Field (Source)</label>
              <input
                type="text"
                value={editingMapping.source}
                onChange={(e) => setEditingMapping({ ...editingMapping, source: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>PointClickCare Field (Destination)</label>
              <input
                type="text"
                value={editingMapping.destination}
                onChange={(e) => setEditingMapping({ ...editingMapping, destination: e.target.value })}
                placeholder="e.g., Patient.FullName"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>Use dot notation for nested fields (e.g., Patient.Address.Street)</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setEditingMapping(null)} 
                style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const updated = [...fieldMappings];
                  updated[editingMapping.index] = { source: editingMapping.source, destination: editingMapping.destination, status: 'mapped' };
                  setFieldMappings(updated);
                  setEditingMapping(null);
                }} 
                style={{ flex: 1, padding: '12px', border: 'none', background: '#275380', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Mapping Modal */}
      {showAddMapping && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Add Field Mapping</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Extracted Field (Source)</label>
              <input
                type="text"
                value={newMapping.source}
                onChange={(e) => setNewMapping({ ...newMapping, source: e.target.value })}
                placeholder="e.g., Emergency Contact"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>PointClickCare Field (Destination)</label>
              <input
                type="text"
                value={newMapping.destination}
                onChange={(e) => setNewMapping({ ...newMapping, destination: e.target.value })}
                placeholder="e.g., Patient.EmergencyContact.Name"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => { setShowAddMapping(false); setNewMapping({ source: '', destination: '' }); }} 
                style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newMapping.source && newMapping.destination) {
                    setFieldMappings([...fieldMappings, { source: newMapping.source, destination: newMapping.destination, status: 'mapped' }]);
                    setShowAddMapping(false);
                    setNewMapping({ source: '', destination: '' });
                  }
                }} 
                disabled={!newMapping.source || !newMapping.destination}
                style={{ flex: 1, padding: '12px', border: 'none', background: newMapping.source && newMapping.destination ? '#275380' : '#e0e0e0', color: newMapping.source && newMapping.destination ? 'white' : '#888', borderRadius: '8px', cursor: newMapping.source && newMapping.destination ? 'pointer' : 'not-allowed', fontWeight: 500 }}
              >
                Add Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
