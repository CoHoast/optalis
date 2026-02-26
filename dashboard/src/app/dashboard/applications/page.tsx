'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = 'https://optalis-api-production.up.railway.app';

interface Application {
  id: string;
  patient_name: string;
  facility: string;
  status: string;
  priority: string;
  source: string;
  created_at: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/applications`)
      .then(res => res.json())
      .then(data => {
        setApplications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch applications:', err);
        setLoading(false);
      });
  }, []);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = (app.patient_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                          (app.facility?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    denied: applications.filter(a => a.status === 'denied').length,
    review: applications.filter(a => a.status === 'review').length,
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>Loading applications...</div>
            <div style={{ color: '#666' }}>Fetching from API</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Applications</h1>
          <p style={{ color: '#4a4a4a' }}>Manage and review patient admission applications</p>
        </div>
        <Link href="/dashboard/applications/new" className="btn btn-primary">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4"/>
          </svg>
          New Application
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'review', 'approved', 'denied'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filter === status ? '2px solid #275380' : '1px solid #e0e0e0',
              background: filter === status ? 'rgba(39,83,128,0.1)' : 'white',
              color: filter === status ? '#275380' : '#666',
              cursor: 'pointer',
              fontWeight: filter === status ? 600 : 400,
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by name or facility..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Applications List */}
      <div className="card" style={{ padding: 0 }}>
        {filteredApps.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No applications found
          </div>
        ) : (
          filteredApps.map((app) => (
            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #f0f0f0',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background 0.2s'
              }}
              className="application-row-hover"
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#275380', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, marginRight: '16px'
              }}>
                {getInitials(app.patient_name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{app.patient_name || 'Unknown'}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>{app.facility || 'No facility'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {app.priority === 'high' && (
                  <span style={{
                    padding: '4px 8px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    URGENT
                  </span>
                )}
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: app.status === 'pending' ? '#fef9c3' :
                              app.status === 'approved' ? '#dcfce7' :
                              app.status === 'denied' ? '#fee2e2' :
                              app.status === 'review' ? '#dbeafe' : '#f3f4f6',
                  color: app.status === 'pending' ? '#854d0e' :
                         app.status === 'approved' ? '#166534' :
                         app.status === 'denied' ? '#991b1b' :
                         app.status === 'review' ? '#1e40af' : '#666'
                }}>
                  {app.status === 'pending' && 'Pending'}
                  {app.status === 'approved' && 'Approved'}
                  {app.status === 'denied' && 'Denied'}
                  {app.status === 'review' && 'Needs Review'}
                </span>
                <div style={{ fontSize: '14px', color: '#888', width: '100px', textAlign: 'right' }}>
                  {formatDate(app.created_at)}
                </div>
                <div style={{ fontSize: '13px', color: '#888', width: '120px' }}>
                  {app.source || 'Unknown'}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <style jsx>{`
        .application-row-hover:hover {
          background: #f9f7f4;
        }
      `}</style>
    </div>
  );
}
