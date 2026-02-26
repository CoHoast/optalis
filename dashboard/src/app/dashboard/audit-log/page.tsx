'use client';

import { useState } from 'react';

const auditLogs = [
  { id: 1, action: 'Application Approved', user: 'Jennifer Walsh', target: 'Dorothy Martinez (APP-2026-003)', timestamp: '2/25/2026 2:30 PM', ip: '192.168.1.100', details: 'Decision: Approved. Sent to Salesforce.' },
  { id: 2, action: 'CRM Sync Success', user: 'System', target: 'Dorothy Martinez → Salesforce', timestamp: '2/25/2026 2:30 PM', ip: '—', details: 'Contact created: 003xx000001abcd. Opportunity created: 006xx000001efgh.' },
  { id: 3, action: 'Application Viewed', user: 'Jennifer Walsh', target: 'Margaret Thompson (APP-2026-001)', timestamp: '2/25/2026 2:15 PM', ip: '192.168.1.100', details: 'Viewed application details and extracted data.' },
  { id: 4, action: 'Document Downloaded', user: 'Michael Chen', target: 'Medical_Records.pdf', timestamp: '2/25/2026 1:45 PM', ip: '192.168.1.105', details: 'Downloaded from APP-2026-001.' },
  { id: 5, action: 'Application Denied', user: 'Jennifer Walsh', target: 'Harold Johnson (APP-2026-004)', timestamp: '2/24/2026 11:00 AM', ip: '192.168.1.100', details: 'Decision: Denied. Reason: Does not meet medical criteria.' },
  { id: 6, action: 'Team Member Invited', user: 'Jennifer Walsh', target: 'emily.rodriguez@optalis.com', timestamp: '2/24/2026 10:30 AM', ip: '192.168.1.100', details: 'Role: Viewer. Status: Pending.' },
  { id: 7, action: 'Login Success', user: 'Jennifer Walsh', target: '—', timestamp: '2/24/2026 9:00 AM', ip: '192.168.1.100', details: '2FA verified. Session started.' },
  { id: 8, action: 'Field Mapping Updated', user: 'Michael Chen', target: 'Insurance Provider → Contact.Insurance__c', timestamp: '2/23/2026 4:00 PM', ip: '192.168.1.105', details: 'Added new field mapping to Salesforce.' },
  { id: 9, action: 'Application Submitted', user: 'System', target: 'Robert Williams (APP-2026-002)', timestamp: '2/23/2026 3:30 PM', ip: '—', details: 'Source: Website form. AI extraction confidence: 87%.' },
  { id: 10, action: 'CRM Connected', user: 'Jennifer Walsh', target: 'Salesforce', timestamp: '2/22/2026 2:00 PM', ip: '192.168.1.100', details: 'OAuth connection established. Org: Optalis Healthcare.' },
];

const actionColors: Record<string, { bg: string; text: string }> = {
  'Application Approved': { bg: '#dcfce7', text: '#166534' },
  'Application Denied': { bg: '#fee2e2', text: '#991b1b' },
  'Application Viewed': { bg: '#dbeafe', text: '#1e40af' },
  'Application Submitted': { bg: '#f3e8ff', text: '#7c3aed' },
  'CRM Sync Success': { bg: '#dcfce7', text: '#166534' },
  'Login Success': { bg: '#f3f4f6', text: '#4b5563' },
  'Document Downloaded': { bg: '#fef9c3', text: '#854d0e' },
  'Team Member Invited': { bg: '#dbeafe', text: '#1e40af' },
  'Field Mapping Updated': { bg: '#f3f4f6', text: '#4b5563' },
  'CRM Connected': { bg: '#dcfce7', text: '#166534' },
};

export default function AuditPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.user.toLowerCase().includes(search.toLowerCase()) ||
                          log.target.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'decisions') return matchesSearch && (log.action.includes('Approved') || log.action.includes('Denied'));
    if (filter === 'crm') return matchesSearch && log.action.includes('CRM');
    if (filter === 'security') return matchesSearch && (log.action.includes('Login') || log.action.includes('Team'));
    return matchesSearch;
  });

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Audit Log</h1>
          <p style={{ color: '#4a4a4a' }}>Complete activity history for compliance and tracking</p>
        </div>
        <button style={{ padding: '10px 20px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export Log
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">2,847</div>
          <div className="stat-change">Last 30 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Decisions Made</div>
          <div className="stat-value" style={{ color: '#275380' }}>342</div>
          <div className="stat-change">78% approval rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CRM Syncs</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>298</div>
          <div className="stat-change">99.7% success rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Users</div>
          <div className="stat-value">6</div>
          <div className="stat-change">4 logged in today</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Search by action, user, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none',
              background: 'white',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: 'All Events' },
            { key: 'decisions', label: 'Decisions' },
            { key: 'crm', label: 'CRM Activity' },
            { key: 'security', label: 'Security' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: filter === f.key ? 'none' : '1px solid #e0e0e0',
                background: filter === f.key ? '#275380' : 'white',
                color: filter === f.key ? 'white' : '#4a4a4a',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f4', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Timestamp</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Action</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Target</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>IP Address</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const colors = actionColors[log.action] || { bg: '#f3f4f6', text: '#4b5563' };
              const isExpanded = expandedLog === log.id;
              
              return (
                <>
                  <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0', background: isExpanded ? '#f9f7f4' : 'white' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#666', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: colors.bg,
                        color: colors.text
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}>{log.user}</td>
                    <td style={{ padding: '16px 24px', color: '#666', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.target}</td>
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontSize: '13px', color: '#888' }}>{log.ip}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                        style={{ padding: '6px 12px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${log.id}-details`}>
                      <td colSpan={6} style={{ padding: '0 24px 16px 24px', background: '#f9f7f4' }}>
                        <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                          <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Details</div>
                          <div style={{ fontSize: '14px', color: '#4a4a4a' }}>{log.details}</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* HIPAA Notice */}
      <div style={{ marginTop: '24px', padding: '16px', background: '#f9f7f4', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <svg width="20" height="20" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <div style={{ fontSize: '13px', color: '#666' }}>
          <strong>HIPAA Compliance:</strong> All audit logs are retained for 6 years per HIPAA requirements. 
          Logs include user actions, PHI access, and system events. Export logs periodically for long-term archival.
        </div>
      </div>
    </div>
  );
}
