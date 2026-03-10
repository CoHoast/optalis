'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://optalis-api-production.up.railway.app';

interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  total_beds: number;
}

interface FlaggedCondition {
  id: string;
  condition_name: string;
  condition_type: string;
  description: string;
}

interface DecisionRule {
  id: string;
  rule_name: string;
  rule_type: string;
  field_to_check: string;
  operator: string;
  value: string;
  reason_template: string;
  priority: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'facilities' | 'conditions' | 'rules'>('facilities');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [conditions, setConditions] = useState<FlaggedCondition[]>([]);
  const [rules, setRules] = useState<DecisionRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  
  // Edit state
  const [editingFacility, setEditingFacility] = useState<Partial<Facility>>({});
  const [editingCondition, setEditingCondition] = useState<Partial<FlaggedCondition>>({});
  const [editingRule, setEditingRule] = useState<Partial<DecisionRule>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [facRes, condRes, rulesRes] = await Promise.all([
      fetch(`${API_URL}/api/facilities`),
      fetch(`${API_URL}/api/flagged-conditions`),
      fetch(`${API_URL}/api/decision-rules`)
    ]);
    setFacilities(await facRes.json());
    setConditions(await condRes.json());
    setRules(await rulesRes.json());
    setLoading(false);
  };

  // Facility functions
  const saveFacility = async () => {
    const method = editingFacility.id ? 'PATCH' : 'POST';
    const url = editingFacility.id 
      ? `${API_URL}/api/facilities/${editingFacility.id}`
      : `${API_URL}/api/facilities`;
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingFacility)
    });
    setShowFacilityModal(false);
    setEditingFacility({});
    fetchAll();
  };

  const deleteFacility = async (id: string) => {
    if (!confirm('Are you sure? This will affect all associated beds and data.')) return;
    await fetch(`${API_URL}/api/facilities/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  // Condition functions
  const saveCondition = async () => {
    const method = editingCondition.id ? 'PATCH' : 'POST';
    const url = editingCondition.id 
      ? `${API_URL}/api/flagged-conditions/${editingCondition.id}`
      : `${API_URL}/api/flagged-conditions`;
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingCondition)
    });
    setShowConditionModal(false);
    setEditingCondition({});
    fetchAll();
  };

  const deleteCondition = async (id: string) => {
    if (!confirm('Delete this flagged condition?')) return;
    await fetch(`${API_URL}/api/flagged-conditions/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  // Rule functions
  const saveRule = async () => {
    const method = editingRule.id ? 'PATCH' : 'POST';
    const url = editingRule.id 
      ? `${API_URL}/api/decision-rules/${editingRule.id}`
      : `${API_URL}/api/decision-rules`;
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingRule)
    });
    setShowRuleModal(false);
    setEditingRule({});
    fetchAll();
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Delete this decision rule?')) return;
    await fetch(`${API_URL}/api/decision-rules/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'auto_approve': return { bg: '#dcfce7', text: '#16a34a' };
      case 'auto_deny': return { bg: '#fee2e2', text: '#dc2626' };
      case 'needs_review': return { bg: '#fef3c7', text: '#d97706' };
      case 'flag': return { bg: '#dbeafe', text: '#2563eb' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="main-content" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>⚙️ Settings</h1>
        <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>Manage facilities, flagged conditions, and decision rules</p>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 24px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'facilities', label: '🏥 Facilities', count: facilities.length },
            { key: 'conditions', label: '⚠️ Flagged Conditions', count: conditions.length },
            { key: 'rules', label: '📋 Decision Rules', count: rules.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? '#275380' : '#6b7280',
                borderBottom: activeTab === tab.key ? '2px solid #275380' : '2px solid transparent',
                marginBottom: '-1px'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Facilities Tab */}
        {activeTab === 'facilities' && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Facilities</h2>
              <button
                onClick={() => { setEditingFacility({}); setShowFacilityModal(true); }}
                style={{ padding: '8px 16px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}
              >
                + Add Facility
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Address</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Phone</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Total Beds</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facilities.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No facilities configured yet.</td></tr>
                ) : (
                  facilities.map(f => (
                    <tr key={f.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{f.name}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px' }}>{f.address ? `${f.address}, ${f.city}, ${f.state} ${f.zip}` : '—'}</td>
                      <td style={{ padding: '12px 16px' }}>{f.phone || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>{f.total_beds || 0}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => { setEditingFacility(f); setShowFacilityModal(true); }} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '13px' }}>Edit</button>
                        <button onClick={() => deleteFacility(f.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Conditions Tab */}
        {activeTab === 'conditions' && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Flagged Conditions</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Conditions that will be highlighted in the AI summary when found in an application</p>
              </div>
              <button
                onClick={() => { setEditingCondition({ condition_type: 'flag' }); setShowConditionModal(true); }}
                style={{ padding: '8px 16px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}
              >
                + Add Condition
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Condition</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Description</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conditions.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No conditions configured yet.</td></tr>
                ) : (
                  conditions.map(c => {
                    const typeColor = getTypeColor(c.condition_type);
                    return (
                      <tr key={c.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.condition_name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '16px', background: typeColor.bg, color: typeColor.text, fontSize: '12px', fontWeight: 500, textTransform: 'capitalize' }}>
                            {c.condition_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px' }}>{c.description || '—'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => { setEditingCondition(c); setShowConditionModal(true); }} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '13px' }}>Edit</button>
                          <button onClick={() => deleteCondition(c.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Decision Rules</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>Rules that automatically suggest approve, deny, or needs review</p>
              </div>
              <button
                onClick={() => { setEditingRule({ rule_type: 'needs_review', operator: 'contains', priority: 0 }); setShowRuleModal(true); }}
                style={{ padding: '8px 16px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}
              >
                + Add Rule
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Rule Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Condition</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Reason</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No rules configured yet.</td></tr>
                ) : (
                  rules.map(r => {
                    const typeColor = getTypeColor(r.rule_type);
                    return (
                      <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.rule_name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 12px', borderRadius: '16px', background: typeColor.bg, color: typeColor.text, fontSize: '12px', fontWeight: 500, textTransform: 'capitalize' }}>
                            {r.rule_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px', fontFamily: 'monospace' }}>
                          {r.field_to_check} {r.operator} "{r.value}"
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reason_template || '—'}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => { setEditingRule(r); setShowRuleModal(true); }} style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '13px' }}>Edit</button>
                          <button onClick={() => deleteRule(r.id)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Facility Modal */}
      {showFacilityModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>{editingFacility.id ? 'Edit Facility' : 'Add Facility'}</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Facility Name *</label>
                <input value={editingFacility.name || ''} onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Address</label>
                <input value={editingFacility.address || ''} onChange={(e) => setEditingFacility({ ...editingFacility, address: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>City</label>
                  <input value={editingFacility.city || ''} onChange={(e) => setEditingFacility({ ...editingFacility, city: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>State</label>
                  <input value={editingFacility.state || ''} onChange={(e) => setEditingFacility({ ...editingFacility, state: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>ZIP</label>
                  <input value={editingFacility.zip || ''} onChange={(e) => setEditingFacility({ ...editingFacility, zip: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Phone</label>
                  <input value={editingFacility.phone || ''} onChange={(e) => setEditingFacility({ ...editingFacility, phone: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Total Beds</label>
                  <input type="number" value={editingFacility.total_beds || ''} onChange={(e) => setEditingFacility({ ...editingFacility, total_beds: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowFacilityModal(false); setEditingFacility({}); }} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveFacility} disabled={!editingFacility.name} style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Condition Modal */}
      {showConditionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>{editingCondition.id ? 'Edit Condition' : 'Add Flagged Condition'}</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Condition Name *</label>
                <input value={editingCondition.condition_name || ''} onChange={(e) => setEditingCondition({ ...editingCondition, condition_name: e.target.value })} placeholder="e.g., Ventilator Dependent" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Type</label>
                <select value={editingCondition.condition_type || 'flag'} onChange={(e) => setEditingCondition({ ...editingCondition, condition_type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}>
                  <option value="flag">Flag (Highlight)</option>
                  <option value="auto_deny">Auto Deny</option>
                  <option value="auto_approve">Auto Approve</option>
                  <option value="needs_review">Needs Review</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Description</label>
                <textarea value={editingCondition.description || ''} onChange={(e) => setEditingCondition({ ...editingCondition, description: e.target.value })} placeholder="Why is this condition important?" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '80px', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowConditionModal(false); setEditingCondition({}); }} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveCondition} disabled={!editingCondition.condition_name} style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '600px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>{editingRule.id ? 'Edit Rule' : 'Add Decision Rule'}</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Rule Name *</label>
                <input value={editingRule.rule_name || ''} onChange={(e) => setEditingRule({ ...editingRule, rule_name: e.target.value })} placeholder="e.g., Sex Offender Registry Match" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Decision Type</label>
                <select value={editingRule.rule_type || 'needs_review'} onChange={(e) => setEditingRule({ ...editingRule, rule_type: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}>
                  <option value="auto_approve">Auto Approve</option>
                  <option value="auto_deny">Auto Deny</option>
                  <option value="needs_review">Needs Review</option>
                </select>
              </div>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', fontWeight: 500 }}>Condition</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <select value={editingRule.field_to_check || ''} onChange={(e) => setEditingRule({ ...editingRule, field_to_check: e.target.value })} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}>
                    <option value="">Select field...</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="insurance">Insurance</option>
                    <option value="care_level">Care Level</option>
                    <option value="weight">Weight</option>
                    <option value="sex_offender_check">Sex Offender Check</option>
                    <option value="medications">Medications</option>
                    <option value="dme">DME</option>
                    <option value="services">Services</option>
                  </select>
                  <select value={editingRule.operator || 'contains'} onChange={(e) => setEditingRule({ ...editingRule, operator: e.target.value })} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}>
                    <option value="contains">contains</option>
                    <option value="equals">equals</option>
                    <option value="greater_than">greater than</option>
                    <option value="less_than">less than</option>
                  </select>
                  <input value={editingRule.value || ''} onChange={(e) => setEditingRule({ ...editingRule, value: e.target.value })} placeholder="Value" style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Reason Template</label>
                <textarea value={editingRule.reason_template || ''} onChange={(e) => setEditingRule({ ...editingRule, reason_template: e.target.value })} placeholder="e.g., Patient requires ventilator support which is not available at this facility" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', minHeight: '60px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Priority (higher = evaluated first)</label>
                <input type="number" value={editingRule.priority || 0} onChange={(e) => setEditingRule({ ...editingRule, priority: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowRuleModal(false); setEditingRule({}); }} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveRule} disabled={!editingRule.rule_name || !editingRule.field_to_check || !editingRule.value} style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
