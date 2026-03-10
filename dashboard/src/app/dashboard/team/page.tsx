'use client';

import { useState, useEffect } from 'react';

const API_URL = 'https://optalis-api-production.up.railway.app';

type Role = 'admin' | 'manager' | 'reviewer' | 'viewer';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  facility_id: string | null;
  facility_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Facility {
  id: string;
  name: string;
}

const rolePermissions = {
  admin: ['Manage team', 'View ALL facilities', 'Make decisions', 'Edit settings', 'View reports', 'Manage integrations'],
  manager: ['View assigned facility', 'Make decisions', 'View reports', 'Assign reviewers'],
  reviewer: ['View assigned facility', 'Make decisions', 'Add notes'],
  viewer: ['View assigned facility', 'View reports'],
};

const roleColors = {
  admin: { bg: '#fef3c7', text: '#92400e' },
  manager: { bg: '#dbeafe', text: '#1e40af' },
  reviewer: { bg: '#dcfce7', text: '#166534' },
  viewer: { bg: '#f3f4f6', text: '#4b5563' },
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'reviewer' as Role,
    facility_id: '' as string | null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, facilitiesRes] = await Promise.all([
      fetch(`${API_URL}/api/users`),
      fetch(`${API_URL}/api/facilities`)
    ]);
    setUsers(await usersRes.json());
    setFacilities(await facilitiesRes.json());
    setLoading(false);
  };

  const createUser = async () => {
    await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newUser,
        facility_id: newUser.facility_id || null
      })
    });
    setShowInviteModal(false);
    setNewUser({ name: '', email: '', role: 'reviewer', facility_id: '' });
    fetchData();
  };

  const updateUser = async () => {
    if (!selectedUser) return;
    await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: selectedUser.name,
        role: selectedUser.role,
        facility_id: selectedUser.facility_id || null,
        is_active: selectedUser.is_active
      })
    });
    setShowEditModal(false);
    setSelectedUser(null);
    fetchData();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    await fetch(`${API_URL}/api/users/${userId}`, { method: 'DELETE' });
    fetchData();
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="main-content" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>👥 Team Management</h1>
          <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>Manage users, roles, and facility assignments</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Add User
        </button>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Role Legend */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '16px' }}>Role Permissions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {(Object.keys(rolePermissions) as Role[]).map((role) => (
              <div key={role} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
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

        {/* Info Box */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <svg width="24" height="24" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <div>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '4px' }}>Facility-Based Access Control</div>
            <div style={{ fontSize: '14px', color: '#3b82f6' }}>
              <strong>Admins</strong> see all facilities and data. <strong>Managers, Reviewers, and Viewers</strong> only see applications and beds for their assigned facility.
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Team Members ({users.length})</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Assigned Facility</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No users configured yet. Add your first team member.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#275380',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{user.name}</div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '16px', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        background: roleColors[user.role]?.bg || '#f3f4f6',
                        color: roleColors[user.role]?.text || '#374151',
                        textTransform: 'capitalize'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {user.role === 'admin' ? (
                        <span style={{ color: '#16a34a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          All Facilities
                        </span>
                      ) : user.facility_name ? (
                        <span style={{ color: '#374151' }}>{user.facility_name}</span>
                      ) : (
                        <span style={{ color: '#dc2626', fontStyle: 'italic' }}>⚠️ No facility assigned</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: user.is_active ? '#16a34a' : '#6b7280'
                      }}>
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: user.is_active ? '#16a34a' : '#6b7280'
                        }} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => { setSelectedUser({...user}); setShowEditModal(true); }}
                        style={{ padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '13px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>Add Team Member</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Full Name *</label>
                <input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Smith"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Email Address *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john.smith@optalis.com"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="admin">Admin — Full access to all facilities</option>
                  <option value="manager">Manager — Manage assigned facility</option>
                  <option value="reviewer">Reviewer — Review applications</option>
                  <option value="viewer">Viewer — View-only access</option>
                </select>
              </div>
              {newUser.role !== 'admin' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Assigned Facility *</label>
                  <select
                    value={newUser.facility_id || ''}
                    onChange={(e) => setNewUser({ ...newUser, facility_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="">Select a facility...</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                    This user will only see applications and beds for this facility.
                  </p>
                </div>
              )}
              {newUser.role === 'admin' && (
                <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                  ⚠️ Admins have access to ALL facilities and can manage all settings.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowInviteModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={createUser} 
                disabled={!newUser.name || !newUser.email || (newUser.role !== 'admin' && !newUser.facility_id)}
                style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: (!newUser.name || !newUser.email || (newUser.role !== 'admin' && !newUser.facility_id)) ? 0.5 : 1 }}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>Edit User — {selectedUser.name}</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Full Name</label>
                <input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Email (read-only)</label>
                <input
                  value={selectedUser.email}
                  disabled
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#f9fafb', color: '#6b7280' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as Role })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="admin">Admin — Full access to all facilities</option>
                  <option value="manager">Manager — Manage assigned facility</option>
                  <option value="reviewer">Reviewer — Review applications</option>
                  <option value="viewer">Viewer — View-only access</option>
                </select>
              </div>
              {selectedUser.role !== 'admin' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Assigned Facility</label>
                  <select
                    value={selectedUser.facility_id || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, facility_id: e.target.value || null })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="">Select a facility...</option>
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Status</label>
                <select
                  value={selectedUser.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setSelectedUser({ ...selectedUser, is_active: e.target.value === 'active' })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEditModal(false); setSelectedUser(null); }} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={updateUser} style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
