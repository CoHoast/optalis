'use client';

import Link from 'next/link';

const recentApplications = [
  { id: 'APP-2026-001', name: 'Margaret Thompson', initials: 'MT', facility: 'Cranberry Park at West Bloomfield', status: 'pending', date: '2/24/2026' },
  { id: 'APP-2026-002', name: 'Robert Williams', initials: 'RW', facility: 'Optalis of Grand Rapids', status: 'review', date: '2/24/2026' },
  { id: 'APP-2026-003', name: 'Dorothy Martinez', initials: 'DM', facility: 'Cranberry Park at Milford', status: 'approved', date: '2/24/2026' },
  { id: 'APP-2026-004', name: 'Harold Johnson', initials: 'HJ', facility: 'Optalis of ShorePointe', status: 'denied', date: '2/23/2026' },
  { id: 'APP-2026-005', name: 'Betty Anderson', initials: 'BA', facility: 'The Cottages at Grand Rapids', status: 'approved', date: '2/23/2026' },
];

export default function DashboardPage() {
  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#4a4a4a' }}>Welcome back, Jennifer. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-label">Pending Review</div>
              <div className="stat-value">3</div>
              <div className="stat-change">+2 from yesterday</div>
            </div>
            <div className="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-label">Approved Today</div>
              <div className="stat-value">2</div>
              <div className="stat-change" style={{ color: '#16a34a' }}>On track</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-label">Needs Review</div>
              <div className="stat-value">1</div>
              <div className="stat-change" style={{ color: '#dc2626' }}>1 urgent</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-label">Approval Rate</div>
              <div className="stat-value">78%</div>
              <div className="stat-change">This week</div>
            </div>
            <div className="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/dashboard/applications?status=pending" className="quick-action pending">
          <div className="quick-action-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div className="quick-action-title">3 Pending</div>
            <div className="quick-action-subtitle">Awaiting review</div>
          </div>
        </Link>
        
        <Link href="/dashboard/applications?status=review" className="quick-action review">
          <div className="quick-action-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </div>
          <div>
            <div className="quick-action-title">1 Needs Review</div>
            <div className="quick-action-subtitle">Insurance verification</div>
          </div>
        </Link>
        
        <Link href="/dashboard/applications/new" className="quick-action new">
          <div className="quick-action-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <div className="quick-action-title">New Application</div>
            <div className="quick-action-subtitle">Upload documents</div>
          </div>
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="applications-card">
        <div className="applications-header">
          <h2 className="applications-title">Recent Applications</h2>
          <Link href="/dashboard/applications" className="applications-link">View all →</Link>
        </div>
        {recentApplications.map((app) => (
          <Link key={app.id} href={`/dashboard/applications/${app.id}`} className="application-row">
            <div className="application-avatar">{app.initials}</div>
            <div className="application-info">
              <div className="application-name">{app.name}</div>
              <div className="application-facility">{app.facility}</div>
            </div>
            <div className="application-meta">
              <span className={`status-badge status-${app.status}`}>
                {app.status === 'pending' && 'Pending'}
                {app.status === 'approved' && 'Approved'}
                {app.status === 'denied' && 'Denied'}
                {app.status === 'review' && 'Needs Review'}
              </span>
              <div className="application-date">{app.date}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Section */}
      <div className="two-column">
        {/* Activity Feed */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Recent Activity</h3>
          
          <div className="activity-item">
            <div className="activity-icon approved">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div className="activity-text">Dorothy Martinez application <strong style={{ color: '#16a34a' }}>approved</strong></div>
              <div className="activity-time">2 hours ago by Jennifer Walsh</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon new">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              </svg>
            </div>
            <div>
              <div className="activity-text">New application received for <strong>Margaret Thompson</strong></div>
              <div className="activity-time">3 hours ago via email</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon review">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div className="activity-text">Robert Williams marked for <strong style={{ color: '#ca8a04' }}>review</strong></div>
              <div className="activity-time">5 hours ago - Insurance verification needed</div>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon denied">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <div className="activity-text">Harold Johnson application <strong style={{ color: '#dc2626' }}>denied</strong></div>
              <div className="activity-time">Yesterday - Does not meet criteria</div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>This Week&apos;s Performance</h3>
          
          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Applications Processed</span>
              <span className="progress-value">28</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '75%' }}></div>
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Average Processing Time</span>
              <span className="progress-value">2.4 hours</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill green" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div className="progress-item">
            <div className="progress-header">
              <span className="progress-label">Approval Rate</span>
              <span className="progress-value">78%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '78%' }}></div>
            </div>
          </div>
          
          <div className="week-stats">
            <div>
              <div className="week-stat-value pending">12</div>
              <div className="week-stat-label">Pending</div>
            </div>
            <div>
              <div className="week-stat-value approved">18</div>
              <div className="week-stat-label">Approved</div>
            </div>
            <div>
              <div className="week-stat-value denied">4</div>
              <div className="week-stat-label">Denied</div>
            </div>
            <div>
              <div className="week-stat-value review">6</div>
              <div className="week-stat-label">Review</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
