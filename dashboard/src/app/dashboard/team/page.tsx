'use client';

import { useState } from 'react';

type Role = 'admin' | 'manager' | 'reviewer' | 'viewer';
type Status = 'active' | 'pending' | 'disabled';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
  status: Status;
  lastActive: string;
  twoFactorEnabled: boolean;
}

const teamMembers: TeamMember[] = [
  { id: '1', name: 'Jennifer Walsh', email: 'jennifer.walsh@optalis.com', initials: 'JW', role: 'admin', status: 'active', lastActive: 'Now', twoFactorEnabled: true },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@optalis.com', initials: 'MC', role: 'manager', status: 'active', lastActive: '2 hours ago', twoFactorEnabled: true },
  { id: '3', name: 'Sarah Johnson', email: 'sarah.johnson@optalis.com', initials: 'SJ', role: 'reviewer', status: 'active', lastActive: '1 day ago', twoFactorEnabled: false },
  { id: '4', name: 'David Kim', email: 'david.kim@optalis.com', initials: 'DK', role: 'reviewer', status: 'active', lastActive: '3 hours ago', twoFactorEnabled: true },
  { id: '5', name: 'Emily Rodriguez', email: 'emily.rodriguez@optalis.com', initials: 'ER', role: 'viewer', status: 'pending', lastActive: 'Never', twoFactorEnabled: false },
  { id: '6', name: 'James Wilson', email: 'james.wilson@optalis.com', initials: 'JW', role: 'viewer', status: 'disabled', lastActive: '30 days ago', twoFactorEnabled: false },
];

const rolePermissions = {
  admin: ['Manage team', 'View all applications', 'Make decisions', 'Edit settings', 'View reports', 'Manage integrations'],
  manager: ['View all applications', 'Make decisions', 'View reports', 'Assign reviewers'],
  reviewer: ['View assigned applications', 'Make decisions', 'Add notes'],
  viewer: ['View applications', 'View reports'],
};

const roleColors = {
  admin: { bg: '#fef3c7', text: '#92400e' },
  manager: { bg: '#dbeafe', text: '#1e40af' },
  reviewer: { bg: '#dcfce7', text: '#166534' },
  viewer: { bg: '#f3f4f6', text: '#4b5563' },
};

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('reviewer');
  const [filter, setFilter] = useState<'all' | Status>('all');

  const filteredMembers = filter === 'all' 
    ? teamMembers 
    : teamMembers.filter(m => m.status === filter);

  const handleEditRole = (member: TeamMember) => {
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const handleInvite = () => {
    alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Team Management</h1>
          <p style={{ color: '#4a4a4a' }}>Manage team members, roles, and permissions</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Members</div>
          <div className="stat-value">{teamMembers.length}</div>
          <div className="stat-change">Across all roles</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>{teamMembers.filter(m => m.status === 'active').length}</div>
          <div className="stat-change">Currently active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Invites</div>
          <div className="stat-value" style={{ color: '#ca8a04' }}>{teamMembers.filter(m => m.status === 'pending').length}</div>
          <div className="stat-change">Awaiting acceptance</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">2FA Enabled</div>
          <div className="stat-value">{teamMembers.filter(m => m.twoFactorEnabled).length}/{teamMembers.length}</div>
          <div className="stat-change">{Math.round(teamMembers.filter(m => m.twoFactorEnabled).length / teamMembers.length * 100)}% compliance</div>
        </div>
      </div>

      {/* Role Legend */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: '16px' }}>Role Permissions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {(Object.keys(rolePermissions) as Role[]).map((role) => (
            <div key={role} style={{ padding: '16px', background: '#f9f7f4', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  background: roleColors[role].bg,
                  color: roleColors[role].text,
                  textTransform: 'capitalize'
                }}>
                  {role}
                </span>
              </div>
              <ul style={{ fontSize: '13px', color: '#666', listStyle: 'none', padding: 0, margin: 0 }}>
                {rolePermissions[role].map((perm, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <svg width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'active', 'pending', 'disabled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: filter === status ? 'none' : '1px solid #e0e0e0',
              background: filter === status ? '#275380' : 'white',
              color: filter === status ? 'white' : '#4a4a4a',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          >
            {status === 'all' ? 'All Members' : status}
          </button>
        ))}
      </div>

      {/* Team Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f4', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Member</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>2FA</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Last Active</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: member.status === 'disabled' ? '#e0e0e0' : '#275380',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      {member.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: member.status === 'disabled' ? '#888' : '#1a1a1a' }}>{member.name}</div>
                      <div style={{ fontSize: '13px', color: '#888' }}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 600,
                    background: roleColors[member.role].bg,
                    color: roleColors[member.role].text,
                    textTransform: 'capitalize'
                  }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: member.status === 'active' ? '#16a34a' : member.status === 'pending' ? '#ca8a04' : '#888'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: member.status === 'active' ? '#16a34a' : member.status === 'pending' ? '#ca8a04' : '#888'
                    }} />
                    {member.status === 'active' ? 'Active' : member.status === 'pending' ? 'Pending' : 'Disabled'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {member.twoFactorEnabled ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '13px' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Enabled
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '13px' }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      Disabled
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', color: '#666', fontSize: '14px' }}>{member.lastActive}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleEditRole(member)}
                      style={{ padding: '6px 12px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Edit Role
                    </button>
                    <button style={{ padding: '6px 12px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <svg width="16" height="16" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Invite Team Member</h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>Send an invitation to join the admissions portal</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@optalis.com"
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: 'white' }}
              >
                <option value="admin">Admin - Full access to all features</option>
                <option value="manager">Manager - Manage applications and team</option>
                <option value="reviewer">Reviewer - Review and decide on applications</option>
                <option value="viewer">Viewer - View-only access</option>
              </select>
            </div>

            <div style={{ padding: '16px', background: '#f9f7f4', borderRadius: '8px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>This user will be able to:</div>
              <ul style={{ fontSize: '13px', color: '#4a4a4a', margin: 0, paddingLeft: '20px' }}>
                {rolePermissions[inviteRole].map((perm, i) => (
                  <li key={i}>{perm}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={handleInvite}
                disabled={!inviteEmail}
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', background: '#275380', opacity: inviteEmail ? 1 : 0.5 }}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showRoleModal && selectedMember && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Edit Member Role</h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>Change role for {selectedMember.name}</p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Role</label>
              <select
                defaultValue={selectedMember.role}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: 'white' }}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="reviewer">Reviewer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Status</label>
              <select
                defaultValue={selectedMember.status}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', background: 'white' }}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {!selectedMember.twoFactorEnabled && (
              <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 500, marginBottom: '4px' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  2FA Not Enabled
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>This user has not enabled two-factor authentication. Send a reminder?</div>
                <button style={{ marginTop: '8px', padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                  Send 2FA Reminder
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowRoleModal(false)} style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button 
                onClick={() => { alert('Role updated!'); setShowRoleModal(false); }}
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', background: '#275380' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
