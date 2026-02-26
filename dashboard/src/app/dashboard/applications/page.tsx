'use client';

import { useState } from 'react';
import Link from 'next/link';

const applications = [
  { id: 'APP-2026-004', name: 'Mary Johnson', initials: 'MJ', facility: 'Optalis of Grand Rapids', status: 'pending', date: '2/25/2026', priority: 'high', source: 'Email (AI Intake)' },
  { id: 'APP-2026-001', name: 'Margaret Thompson', initials: 'MT', facility: 'Cranberry Park at West Bloomfield', status: 'pending', date: '2/24/2026', priority: 'high', source: 'Hospital Referral' },
  { id: 'APP-2026-002', name: 'Robert Williams', initials: 'RW', facility: 'Optalis of Grand Rapids', status: 'review', date: '2/24/2026', priority: 'medium', source: 'Website' },
  { id: 'APP-2026-003', name: 'Dorothy Martinez', initials: 'DM', facility: 'Cranberry Park at Milford', status: 'approved', date: '2/24/2026', priority: 'normal', source: 'Email' },
  { id: 'APP-2026-008', name: 'Harold Johnson', initials: 'HJ', facility: 'Optalis of ShorePointe', status: 'denied', date: '2/23/2026', priority: 'normal', source: 'Phone' },
  { id: 'APP-2026-005', name: 'Betty Anderson', initials: 'BA', facility: 'The Cottages at Grand Rapids', status: 'approved', date: '2/23/2026', priority: 'normal', source: 'Hospital Referral' },
  { id: 'APP-2026-006', name: 'James Wilson', initials: 'JW', facility: 'Optalis of Troy', status: 'pending', date: '2/23/2026', priority: 'high', source: 'Website' },
  { id: 'APP-2026-007', name: 'Patricia Brown', initials: 'PB', facility: 'Optalis of Canton', status: 'pending', date: '2/22/2026', priority: 'medium', source: 'Email' },
];

export default function ApplicationsPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.facility.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    denied: applications.filter(a => a.status === 'denied').length,
    review: applications.filter(a => a.status === 'review').length,
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Applications</h1>
          <p style={{ color: '#4a4a4a' }}>Manage and review patient admission applications</p>
        </div>
        <button className="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4"/>
          </svg>
          New Application
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Search by name or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none',
              background: 'white'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'pending', 'review', 'approved', 'denied'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '10px 16px',
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
              {status} ({counts[status]})
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f7f4', borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Patient</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Facility</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Source</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.map((app) => (
              <tr key={app.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="application-avatar">{app.initials}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{app.name}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{app.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#4a4a4a' }}>{app.facility}</td>
                <td style={{ padding: '16px 24px', color: '#4a4a4a' }}>{app.source}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span className={`status-badge status-${app.status}`}>
                    {app.status === 'pending' && 'Pending'}
                    {app.status === 'approved' && 'Approved'}
                    {app.status === 'denied' && 'Denied'}
                    {app.status === 'review' && 'Needs Review'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', color: '#666' }}>{app.date}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <Link 
                    href={`/dashboard/applications/${app.id}`}
                    style={{ color: '#275380', textDecoration: 'none', fontWeight: 500 }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
