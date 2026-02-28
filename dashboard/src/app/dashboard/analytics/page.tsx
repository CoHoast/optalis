'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import AnalyticsGate from '@/components/AnalyticsGate';
import { 
  AnalyticsTabBar, 
  DateRangePicker, 
  ExportButton, 
  PrintButton, 
  exportToCSV 
} from '@/components/AnalyticsUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

const COLORS = {
  primary: '#275380',
  approved: '#10b981',
  denied: '#ef4444',
  pending: '#f59e0b',
  review: '#6366f1',
};

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];
const DENIAL_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4'];

interface OverviewData {
  total_applications: number;
  approved_count: number;
  denied_count: number;
  pending_count: number;
  review_count: number;
  conversion_rate: number;
  avg_time_to_decision: number;
  total_change: number;
  conversion_change: number;
}

interface VolumeData {
  date: string;
  count: number;
  approved: number;
  denied: number;
  pending: number;
}

interface LocationData {
  location: string;
  total: number;
  approved: number;
  denied: number;
  pending: number;
  conversion_rate: number;
  avg_response_time: number;
}

interface DenialReasonData {
  reason: string;
  count: number;
  percentage: number;
}

interface PayerMixData {
  payer: string;
  count: number;
  percentage: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [volume, setVolume] = useState<VolumeData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [denialReasons, setDenialReasons] = useState<DenialReasonData[]>([]);
  const [payerMix, setPayerMix] = useState<PayerMixData[]>([]);

  useEffect(() => {
    // Set default dates
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(now.toISOString().split('T')[0]);
    setStartDate(monthAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (period !== 'custom') {
      fetchData();
    }
  }, [period]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = period === 'custom' 
        ? `start_date=${startDate}&end_date=${endDate}`
        : `period=${period}`;

      const [overviewRes, volumeRes, locationsRes, denialRes, payerRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/overview?${params}`),
        fetch(`${API_URL}/api/analytics/volume?${params}`),
        fetch(`${API_URL}/api/analytics/locations?${params}`),
        fetch(`${API_URL}/api/analytics/denial-reasons?${params}`),
        fetch(`${API_URL}/api/analytics/payer-mix?${params}`),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (volumeRes.ok) setVolume(await volumeRes.json());
      if (locationsRes.ok) setLocations(await locationsRes.json());
      if (denialRes.ok) setDenialReasons(await denialRes.json());
      if (payerRes.ok) setPayerMix(await payerRes.json());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  }

  const pieData = overview ? [
    { name: 'Approved', value: overview.approved_count },
    { name: 'Denied', value: overview.denied_count },
    { name: 'Pending', value: overview.pending_count },
    { name: 'In Review', value: overview.review_count },
  ].filter(d => d.value > 0) : [];

  const formattedVolume = volume.map(v => ({
    ...v,
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Export handlers
  const exportOverview = () => {
    if (overview) {
      exportToCSV([overview] as unknown as Record<string, unknown>[], 'analytics_overview');
    }
  };

  const exportVolume = () => {
    exportToCSV(volume as unknown as Record<string, unknown>[], 'analytics_volume');
  };

  const exportLocations = () => {
    exportToCSV(locations as unknown as Record<string, unknown>[], 'analytics_locations');
  };

  const exportDenialReasons = () => {
    exportToCSV(denialReasons as unknown as Record<string, unknown>[], 'analytics_denial_reasons');
  };

  return (
    <AnalyticsGate>
      <main style={{ marginLeft: 280, padding: '32px', background: '#faf8f5', minHeight: '100vh' }} className="print-area">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              Intake Analytics
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>
              Track your admissions pipeline performance
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PrintButton />
            <ExportButton onClick={exportOverview} label="Export Summary" />
          </div>
        </div>

        {/* Tab Bar */}
        <AnalyticsTabBar activeTab="/dashboard/analytics" />

        {/* Date Range Picker */}
        <div style={{ marginBottom: '24px' }}>
          <DateRangePicker
            period={period}
            setPeriod={setPeriod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onApply={fetchData}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '3px solid #e5e7eb',
              borderTopColor: '#275380',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280' }}>Loading analytics...</p>
            <style jsx>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
              <KPICard
                title="Total Applications"
                value={overview?.total_applications || 0}
                change={overview?.total_change}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#275380" strokeWidth="2">
                    <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                }
              />
              <KPICard
                title="Conversion Rate"
                value={`${overview?.conversion_rate || 0}%`}
                change={overview?.conversion_change}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <KPICard
                title="Avg Response Time"
                value={`${overview?.avg_time_to_decision || 0}h`}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                }
              />
              <KPICard
                title="Pending Queue"
                value={overview?.pending_count || 0}
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            {/* Row 1: Volume & Decision Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Volume Chart */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                    Application Volume
                  </h3>
                  <ExportButton onClick={exportVolume} />
                </div>
                {formattedVolume.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" fontSize={12} stroke="#9ca3af" />
                      <YAxis fontSize={12} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        dot={{ fill: COLORS.primary, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    No data available for this period
                  </div>
                )}
              </div>

              {/* Decision Breakdown */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#1a1a1a' }}>
                  Decision Breakdown
                </h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={{ stroke: '#9ca3af' }}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Denial Reasons & Payer Mix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Denial Reasons */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                    Denial Reasons
                  </h3>
                  <ExportButton onClick={exportDenialReasons} />
                </div>
                {denialReasons.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={denialReasons} layout="vertical" margin={{ left: 120 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" fontSize={12} stroke="#9ca3af" />
                      <YAxis type="category" dataKey="reason" fontSize={12} stroke="#6b7280" width={110} />
                      <Tooltip
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, 'Count']}
                      />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {denialReasons.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={DENIAL_COLORS[index % DENIAL_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    No denials in this period
                  </div>
                )}
              </div>

              {/* Payer Mix */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 24px 0', color: '#1a1a1a' }}>
                  Payer Mix
                </h3>
                {payerMix.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={payerMix}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {payerMix.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#275380', '#10b981', '#f59e0b', '#6366f1', '#9ca3af'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                      {payerMix.map((p, i) => (
                        <div key={p.payer} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            background: ['#275380', '#10b981', '#f59e0b', '#6366f1', '#9ca3af'][i % 5],
                          }} />
                          <span style={{ fontSize: '13px', color: '#374151' }}>
                            {p.payer}: {p.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Locations Chart */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
                  Applications by Location
                </h3>
                <ExportButton onClick={exportLocations} />
              </div>
              {locations.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(300, locations.length * 50)}>
                  <BarChart data={locations} layout="vertical" margin={{ left: 150 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" fontSize={12} stroke="#9ca3af" />
                    <YAxis type="category" dataKey="location" fontSize={12} stroke="#9ca3af" width={140} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="approved" name="Approved" fill={COLORS.approved} stackId="a" />
                    <Bar dataKey="denied" name="Denied" fill={COLORS.denied} stackId="a" />
                    <Bar dataKey="pending" name="Pending" fill={COLORS.pending} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No location data available
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </AnalyticsGate>
  );
}

function KPICard({ title, value, change, icon }: {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>{title}</span>
        <div style={{
          width: 40,
          height: 40,
          background: '#f3f4f6',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a1a' }}>
        {value}
      </div>
      {change !== undefined && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '8px',
          fontSize: '14px',
          color: change >= 0 ? '#10b981' : '#ef4444',
        }}>
          {change >= 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          )}
          {Math.abs(change)}% vs previous period
        </div>
      )}
    </div>
  );
}
