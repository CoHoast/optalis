'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { features } from '@/lib/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface Application {
  id: string;
  patient_name: string;
  facility: string;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  review: number;
  approved: number;
  denied: number;
}

interface BedSummary {
  facility_id: string;
  facility_name: string;
  total_beds: number;
  available_now: number;
  next_24h: number;
  next_7d: number;
  occupied: number;
}

export default function DashboardPage() {
  const { user, isAdmin, facilityId } = useUser();
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, review: 0, approved: 0, denied: 0 });
  const [bedSummary, setBedSummary] = useState<BedSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build URL with facility filter for non-admins
    const facilityParam = !isAdmin && facilityId ? `&facility_id=${facilityId}` : '';
    
    // Fetch recent applications
    fetch(`${API_URL}/api/applications?limit=5${facilityParam}`)
      .then(res => res.json())
      .then(data => {
        setRecentApplications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch applications:', err);
        setLoading(false);
      });

    // Fetch stats (TODO: add facility filtering to stats endpoint)
    fetch(`${API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));

    // Fetch bed summary
    fetch(`${API_URL}/api/beds/summary`)
      .then(res => res.json())
      .then(data => {
        // Filter bed summary for non-admins
        if (!isAdmin && facilityId) {
          data = data.filter((b: BedSummary) => b.facility_id === facilityId);
        }
        setBedSummary(data);
      })
      .catch(err => console.error('Failed to fetch bed summary:', err));
  }, [isAdmin, facilityId]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="main-content">
      {/* Facility Filter Banner for non-admins */}
      {!isAdmin && user?.facility_name && (
        <div style={{ 
          background: '#eff6ff', 
          border: '1px solid #bfdbfe', 
          borderRadius: '8px', 
          padding: '12px 16px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <span style={{ color: '#1e40af', fontWeight: 500 }}>
            Viewing data for: <strong>{user.facility_name}</strong>
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#4a4a4a' }}>
          {isAdmin 
            ? "Welcome back. Here's what's happening across all facilities today."
            : `Welcome back. Here's what's happening at ${user?.facility_name || 'your facility'} today.`
          }
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <Link href="/dashboard/applications?status=pending" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Pending Review</div>
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-change">Awaiting action</div>
              </div>
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/applications?status=approved" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Approved</div>
                <div className="stat-value">{stats.approved}</div>
                <div className="stat-change" style={{ color: '#16a34a' }}>Ready for admission</div>
              </div>
              <div className="stat-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/applications?status=review" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label">In Review</div>
                <div className="stat-value">{stats.review}</div>
                <div className="stat-change" style={{ color: '#f59e0b' }}>Being processed</div>
              </div>
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/applications" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Total Applications</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-change">All time</div>
              </div>
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Intake Email Card - Only in Full Mode */}
      {features.emailIntake && (
      <div style={{
        background: 'linear-gradient(135deg, #275380 0%, #1e3f61 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '24px',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Email Intake Address
            </h3>
          <p style={{ fontSize: '24px', fontFamily: 'monospace', marginBottom: '8px' }}>intake@optalis.dokit.ai</p>
          <p style={{ fontSize: '13px', opacity: 0.8 }}>Forward applications here for automatic AI processing</p>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText('intake@optalis.dokit.ai')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '12px 20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Copy Address
        </button>
      </div>
      )}

      {/* Quick Actions */}
      <h2 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 600 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        <Link href="/dashboard/applications?status=pending" className="quick-action pending">
          <svg width="24" height="24" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          <span>Review Pending</span>
        </Link>
        <Link href="/dashboard/applications?status=review" className="quick-action review">
          <svg width="24" height="24" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          <span>Check Reviews</span>
        </Link>
        <Link href="/dashboard/applications/new" className="quick-action new">
          <span style={{ fontSize: '24px' }}>➕</span>
          <span>New Application</span>
        </Link>
      </div>

      {/* Bed Availability Summary */}
      {bedSummary.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 13h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zM3 13V8a2 2 0 012-2h3v7M21 13V8a2 2 0 00-2-2h-9v7"/>
              </svg>
              Bed Availability
            </h2>
            <Link href="/dashboard/beds" style={{ color: '#275380', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
              Manage Beds →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {bedSummary.slice(0, 4).map((facility) => {
              const occupancyRate = Math.round((facility.occupied / facility.total_beds) * 100);
              return (
                <div key={facility.facility_id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '20px',
                  transition: 'box-shadow 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{facility.facility_name}</h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>{facility.total_beds} total beds</p>
                    </div>
                    <div style={{ 
                      padding: '4px 10px', 
                      borderRadius: '16px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      background: occupancyRate >= 90 ? '#fee2e2' : occupancyRate >= 70 ? '#fef3c7' : '#dcfce7',
                      color: occupancyRate >= 90 ? '#dc2626' : occupancyRate >= 70 ? '#d97706' : '#16a34a'
                    }}>
                      {occupancyRate}% full
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>{facility.available_now}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Available</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#fefce8', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#ca8a04' }}>{facility.next_24h}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>24 Hours</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: '#eff6ff', borderRadius: '8px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb' }}>{facility.next_7d}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>7 Days</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {bedSummary.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link href="/dashboard/beds" style={{ color: '#275380', textDecoration: 'none', fontSize: '14px' }}>
                View all {bedSummary.length} facilities →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Recent Applications */}
      <div className="applications-card">
        <div className="applications-header">
          <h2 className="applications-title">Recent Applications</h2>
          <Link href="/dashboard/applications" className="applications-link">View all →</Link>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Loading...
          </div>
        ) : recentApplications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No applications yet
          </div>
        ) : (
          <div className="applications-list">
            {recentApplications.map((app) => (
              <Link key={app.id} href={`/dashboard/applications/${app.id}`} className="application-row">
                <div className="application-avatar">
                  {getInitials(app.patient_name)}
                </div>
                <div className="application-info">
                  <div className="application-name">{app.patient_name || 'Unknown'}</div>
                  <div className="application-facility">{app.facility || 'Optalis Healthcare'}</div>
                </div>
                <div className="application-meta">
                  <span className={`status-badge ${app.status}`}>{app.status}</span>
                  <span className="application-date">{formatDate(app.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          color: #374151;
          transition: all 0.2s;
        }
        .quick-action:hover {
          border-color: #275380;
          box-shadow: 0 4px 12px rgba(39, 83, 128, 0.1);
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-badge.review {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-badge.approved {
          background: #dcfce7;
          color: #166534;
        }
        .status-badge.denied {
          background: #fee2e2;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
}
