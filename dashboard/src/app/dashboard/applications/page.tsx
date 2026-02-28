'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'https://optalis-api-production.up.railway.app';

// Retention policy: 30 days for pending/review, 7 days for approved/denied
const PENDING_RETENTION_DAYS = 30;
const PROCESSED_RETENTION_DAYS = 7;

interface Application {
  id: string;
  patient_name: string;
  facility: string;
  status: string;
  priority: string;
  source: string;
  created_at: string;
  decided_at?: string;
}

type SortField = 'date' | 'priority' | 'status' | 'patient_name';
type SortDirection = 'asc' | 'desc';

// Calculate days remaining before auto-delete
function getDaysRemaining(app: Application): number {
  const now = new Date();
  
  if (app.status === 'approved' || app.status === 'denied') {
    const decisionDate = app.decided_at ? new Date(app.decided_at) : new Date(app.created_at);
    const deleteDate = new Date(decisionDate);
    deleteDate.setDate(deleteDate.getDate() + PROCESSED_RETENTION_DAYS);
    const diffTime = deleteDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    const createdDate = new Date(app.created_at);
    const deleteDate = new Date(createdDate);
    deleteDate.setDate(deleteDate.getDate() + PENDING_RETENTION_DAYS);
    const diffTime = deleteDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Get color for days remaining
function getRetentionColor(days: number, status: string): { bg: string; text: string } {
  if (status === 'approved' || status === 'denied') {
    return { bg: '#f3f4f6', text: '#6b7280' };
  }
  
  if (days >= 21) {
    return { bg: '#dcfce7', text: '#166534' };
  } else if (days >= 10) {
    return { bg: '#fef3c7', text: '#92400e' };
  } else {
    return { bg: '#fee2e2', text: '#991b1b' };
  }
}

// Priority sort order
const priorityOrder: { [key: string]: number } = {
  'high': 1,
  'urgent': 1,
  'normal': 2,
  'low': 3,
};

// Status sort order
const statusOrder: { [key: string]: number } = {
  'pending': 1,
  'review': 2,
  'approved': 3,
  'denied': 4,
};

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Read status filter from URL params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam && ['pending', 'review', 'approved', 'denied'].includes(statusParam)) {
      setFilter(statusParam);
    }
  }, [searchParams]);

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

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to desc for date, asc for others
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
  };

  // Filter applications
  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = (app.patient_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
                          (app.facility?.toLowerCase() || '').includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort applications
  const sortedApps = [...filteredApps].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'priority':
        const aPriority = priorityOrder[a.priority?.toLowerCase()] || 99;
        const bPriority = priorityOrder[b.priority?.toLowerCase()] || 99;
        comparison = aPriority - bPriority;
        break;
      case 'status':
        const aStatus = statusOrder[a.status?.toLowerCase()] || 99;
        const bStatus = statusOrder[b.status?.toLowerCase()] || 99;
        comparison = aStatus - bStatus;
        break;
      case 'patient_name':
        comparison = (a.patient_name || '').localeCompare(b.patient_name || '');
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    denied: applications.filter(a => a.status === 'denied').length,
    review: applications.filter(a => a.status === 'review').length,
  };

  // Sortable header component
  const SortHeader = ({ field, label, width, align = 'center' }: { 
    field: SortField; 
    label: string; 
    width: string;
    align?: 'left' | 'center' | 'right';
  }) => {
    const isActive = sortField === field;
    return (
      <div 
        onClick={() => handleSort(field)}
        style={{ 
          width, 
          textAlign: align,
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
          gap: '4px',
          color: isActive ? '#275380' : '#6b7280',
          fontWeight: isActive ? 700 : 600,
        }}
      >
        {label}
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 0 }}>
          <svg 
            width="8" 
            height="8" 
            viewBox="0 0 8 8" 
            fill={isActive && sortDirection === 'asc' ? '#275380' : '#d1d5db'}
          >
            <path d="M4 0L8 4H0L4 0Z" />
          </svg>
          <svg 
            width="8" 
            height="8" 
            viewBox="0 0 8 8" 
            fill={isActive && sortDirection === 'desc' ? '#275380' : '#d1d5db'}
            style={{ marginTop: '1px' }}
          >
            <path d="M4 8L0 4H8L4 8Z" />
          </svg>
        </span>
      </div>
    );
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
        {/* Column Headers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '2px solid #e5e7eb',
          background: '#f9fafb',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#6b7280'
        }}>
          <div style={{ width: '48px', marginRight: '16px' }}></div>
          <SortHeader field="patient_name" label="Patient / Facility" width="flex: 1" align="left" />
          <SortHeader field="priority" label="Priority" width="80px" />
          <SortHeader field="status" label="Status" width="120px" />
          <div style={{ width: '100px', textAlign: 'center' }}>Auto-Delete</div>
          <SortHeader field="date" label="Date" width="100px" align="right" />
          <div style={{ width: '120px', textAlign: 'left', paddingLeft: '16px' }}>Source</div>
        </div>

        {sortedApps.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No applications found
          </div>
        ) : (
          sortedApps.map((app) => {
            const daysRemaining = getDaysRemaining(app);
            const retentionColor = getRetentionColor(daysRemaining, app.status);
            const isProcessed = app.status === 'approved' || app.status === 'denied';

            return (
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
                  transition: 'background 0.2s',
                  opacity: isProcessed ? 0.6 : 1,
                  background: isProcessed ? '#fafafa' : 'transparent'
                }}
                className="application-row-hover"
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: isProcessed ? '#9ca3af' : '#275380', 
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, marginRight: '16px'
                }}>
                  {getInitials(app.patient_name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{app.patient_name || 'Unknown'}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{app.facility || 'No facility'}</div>
                </div>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  {(app.priority === 'high' || app.priority === 'urgent') && (
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
                  {app.priority === 'normal' && (
                    <span style={{
                      padding: '4px 8px',
                      background: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      Normal
                    </span>
                  )}
                  {app.priority === 'low' && (
                    <span style={{
                      padding: '4px 8px',
                      background: '#dbeafe',
                      color: '#1e40af',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      Low
                    </span>
                  )}
                </div>
                <div style={{ width: '120px', textAlign: 'center' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
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
                    {app.status === 'approved' && (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                        Synced
                      </>
                    )}
                    {app.status === 'denied' && (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Denied
                      </>
                    )}
                    {app.status === 'review' && 'Needs Review'}
                  </span>
                </div>
                <div style={{ width: '100px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: retentionColor.bg,
                    color: retentionColor.text
                  }}>
                    {daysRemaining > 0 ? `${daysRemaining}d left` : 'Expiring'}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#888', width: '100px', textAlign: 'right' }}>
                  {formatDate(app.created_at)}
                </div>
                <div style={{ fontSize: '13px', color: '#888', width: '120px', paddingLeft: '16px' }}>
                  {app.source || 'Unknown'}
                </div>
              </Link>
            );
          })
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

// Wrap with Suspense for useSearchParams
export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>Loading applications...</div>
          </div>
        </div>
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  );
}
