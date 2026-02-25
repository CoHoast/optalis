'use client';

import { useState } from 'react';

const weeklyData = [
  { day: 'Mon', received: 8, approved: 5, denied: 1, pending: 2 },
  { day: 'Tue', received: 12, approved: 7, denied: 2, pending: 3 },
  { day: 'Wed', received: 6, approved: 4, denied: 1, pending: 1 },
  { day: 'Thu', received: 10, approved: 6, denied: 2, pending: 2 },
  { day: 'Fri', received: 9, approved: 5, denied: 1, pending: 3 },
  { day: 'Sat', received: 3, approved: 2, denied: 0, pending: 1 },
  { day: 'Sun', received: 2, approved: 1, denied: 0, pending: 1 },
];

const facilityStats = [
  { name: 'Cranberry Park at West Bloomfield', applications: 45, approved: 38, rate: 84 },
  { name: 'Optalis of Grand Rapids', applications: 38, approved: 30, rate: 79 },
  { name: 'Cranberry Park at Milford', applications: 32, approved: 28, rate: 88 },
  { name: 'The Cottages at Grand Rapids', applications: 28, approved: 22, rate: 79 },
  { name: 'Optalis of ShorePointe', applications: 25, approved: 19, rate: 76 },
  { name: 'Optalis of Troy', applications: 22, approved: 18, rate: 82 },
];

const sourceStats = [
  { source: 'Hospital Referrals', count: 89, percentage: 45 },
  { source: 'Website Form', count: 52, percentage: 26 },
  { source: 'Email', count: 35, percentage: 18 },
  { source: 'Phone/Fax', count: 22, percentage: 11 },
];

const processingTimes = [
  { range: '< 1 hour', count: 45, percentage: 32 },
  { range: '1-2 hours', count: 58, percentage: 41 },
  { range: '2-4 hours', count: 25, percentage: 18 },
  { range: '4-8 hours', count: 10, percentage: 7 },
  { range: '> 8 hours', count: 3, percentage: 2 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Reports & Analytics</h1>
          <p style={{ color: '#4a4a4a' }}>Track application trends, processing times, and team performance</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '10px 16px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', background: 'white', cursor: 'pointer' }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="year">This year</option>
          </select>
          <button style={{ padding: '10px 20px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Applications</div>
          <div className="stat-value">198</div>
          <div className="stat-change" style={{ color: '#16a34a' }}>↑ 12% vs last period</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Approval Rate</div>
          <div className="stat-value" style={{ color: '#16a34a' }}>78%</div>
          <div className="stat-change">155 approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Processing Time</div>
          <div className="stat-value">2.4h</div>
          <div className="stat-change" style={{ color: '#16a34a' }}>↓ 18% faster</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CRM Sync Rate</div>
          <div className="stat-value">99.7%</div>
          <div className="stat-change">1 failed this month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Weekly Trend */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Weekly Application Trend</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weeklyData.map((day) => (
              <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '40px', fontWeight: 500, color: '#666' }}>{day.day}</span>
                <div style={{ flex: 1, display: 'flex', height: '32px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(day.approved / 15) * 100}%`, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>{day.approved}</span>
                  </div>
                  <div style={{ width: `${(day.denied / 15) * 100}%`, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {day.denied > 0 && <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>{day.denied}</span>}
                  </div>
                  <div style={{ width: `${(day.pending / 15) * 100}%`, background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {day.pending > 0 && <span style={{ fontSize: '11px', color: '#854d0e', fontWeight: 600 }}>{day.pending}</span>}
                  </div>
                </div>
                <span style={{ width: '60px', textAlign: 'right', fontSize: '14px', color: '#888' }}>{day.received} total</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#16a34a' }} />
              Approved
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#dc2626' }} />
              Denied
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#fbbf24' }} />
              Pending
            </div>
          </div>
        </div>

        {/* Application Sources */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Application Sources</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sourceStats.map((source) => (
              <div key={source.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 500 }}>{source.source}</span>
                  <span style={{ color: '#666' }}>{source.count} ({source.percentage}%)</span>
                </div>
                <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${source.percentage}%`, height: '100%', background: '#275380', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Processing Time Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Processing Time Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {processingTimes.map((time) => (
              <div key={time.range} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '80px', fontSize: '14px', color: '#666' }}>{time.range}</span>
                <div style={{ flex: 1, height: '24px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${time.percentage}%`, 
                    height: '100%', 
                    background: time.range === '< 1 hour' || time.range === '1-2 hours' ? '#16a34a' : 
                               time.range === '2-4 hours' ? '#fbbf24' : '#dc2626',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '8px'
                  }}>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: 600 }}>{time.count}</span>
                  </div>
                </div>
                <span style={{ width: '40px', textAlign: 'right', fontSize: '14px', fontWeight: 500 }}>{time.percentage}%</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', padding: '12px', background: '#dcfce7', borderRadius: '8px', fontSize: '14px', color: '#166534' }}>
            <strong>73%</strong> of applications processed within 2 hours — above target!
          </div>
        </div>

        {/* Facility Performance */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Facility Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {facilityStats.map((facility) => (
              <div key={facility.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f9f7f4', borderRadius: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{facility.name}</div>
                  <div style={{ fontSize: '13px', color: '#888' }}>{facility.applications} applications</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    color: facility.rate >= 85 ? '#16a34a' : facility.rate >= 75 ? '#275380' : '#dc2626' 
                  }}>
                    {facility.rate}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>approval</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="card">
        <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Team Performance</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#666' }}>Team Member</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Processed</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Approved</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Denied</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Avg. Time</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#666' }}>Approval Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Jennifer Walsh', initials: 'JW', processed: 89, approved: 72, denied: 17, avgTime: '1.8h', rate: 81 },
                { name: 'Michael Chen', initials: 'MC', processed: 67, approved: 52, denied: 15, avgTime: '2.1h', rate: 78 },
                { name: 'Sarah Johnson', initials: 'SJ', processed: 42, approved: 31, denied: 11, avgTime: '2.8h', rate: 74 },
              ].map((member) => (
                <tr key={member.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#275380', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px' }}>
                        {member.initials}
                      </div>
                      <span style={{ fontWeight: 500 }}>{member.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{member.processed}</td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#16a34a', fontWeight: 500 }}>{member.approved}</td>
                  <td style={{ padding: '16px', textAlign: 'center', color: '#dc2626', fontWeight: 500 }}>{member.denied}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>{member.avgTime}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: member.rate >= 80 ? '#dcfce7' : '#fef9c3',
                      color: member.rate >= 80 ? '#166534' : '#854d0e'
                    }}>
                      {member.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
