'use client';

import { useState, useEffect } from 'react';
import AnalyticsGate from '@/components/AnalyticsGate';
import { 
  AnalyticsTabBar, 
  ExportButton, 
  PrintButton, 
  exportToCSV 
} from '@/components/AnalyticsUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface BedAnalyticsData {
  snapshot: {
    total_beds: number;
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
    maintenance: number;
    occupancy_rate: number;
  };
  discharges: {
    discharging_today: number;
    discharging_week: number;
  };
  facilities: Array<{
    id: string;
    name: string;
    total_beds: number;
    available: number;
    occupied: number;
    occupancy_rate: number;
  }>;
  bed_types: Array<{
    bed_type: string;
    count: number;
  }>;
}

export default function BedAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [bedAnalytics, setBedAnalytics] = useState<BedAnalyticsData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/analytics/beds`);
      if (res.ok) {
        setBedAnalytics(await res.json());
      }
    } catch (error) {
      console.error('Error fetching bed analytics:', error);
    }
    setLoading(false);
  }

  const exportFacilities = () => {
    if (bedAnalytics?.facilities) {
      exportToCSV(bedAnalytics.facilities as unknown as Record<string, unknown>[], 'bed_analytics_facilities');
    }
  };

  const exportBedTypes = () => {
    if (bedAnalytics?.bed_types) {
      exportToCSV(bedAnalytics.bed_types as unknown as Record<string, unknown>[], 'bed_analytics_types');
    }
  };

  return (
    <AnalyticsGate>
      <main style={{ marginLeft: 280, padding: '32px', background: '#faf8f5', minHeight: '100vh' }} className="print-area">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              Bed Analytics
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0 0' }}>
              Real-time bed availability and occupancy metrics
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <PrintButton />
            <ExportButton onClick={exportFacilities} label="Export Facilities" />
          </div>
        </div>

        {/* Tab Bar */}
        <AnalyticsTabBar activeTab="/dashboard/analytics/beds" />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ 
              width: 40, height: 40, 
              border: '3px solid #e5e7eb', 
              borderTopColor: '#275380', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : bedAnalytics ? (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>Total Beds</div>
                <div style={{ fontSize: '36px', fontWeight: 700 }}>{bedAnalytics.snapshot?.total_beds || 0}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>Occupancy Rate</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#275380' }}>{bedAnalytics.snapshot?.occupancy_rate || 0}%</div>
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#16a34a', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>Available Now</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#16a34a' }}>{bedAnalytics.snapshot?.available || 0}</div>
              </div>
              <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#92400e', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>Discharging Today</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#92400e' }}>{bedAnalytics.discharges?.discharging_today || 0}</div>
              </div>
              <div style={{ background: '#dbeafe', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '12px', color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>This Week</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e40af' }}>{bedAnalytics.discharges?.discharging_week || 0}</div>
              </div>
            </div>

            {/* Additional Status Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #275380' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Occupied</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#275380' }}>{bedAnalytics.snapshot?.occupied || 0}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Reserved</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>{bedAnalytics.snapshot?.reserved || 0}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #06b6d4' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Cleaning</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#06b6d4' }}>{bedAnalytics.snapshot?.cleaning || 0}</div>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Maintenance</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444' }}>{bedAnalytics.snapshot?.maintenance || 0}</div>
              </div>
            </div>

            {/* Facility Breakdown */}
            {bedAnalytics.facilities && bedAnalytics.facilities.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Occupancy by Facility</h3>
                  <ExportButton onClick={exportFacilities} label="Export" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {bedAnalytics.facilities.map((facility) => (
                    <div key={facility.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '200px', fontSize: '14px', fontWeight: 500 }}>{facility.name}</div>
                      <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '8px', height: '28px', position: 'relative', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            position: 'absolute', 
                            left: 0, 
                            top: 0, 
                            bottom: 0, 
                            width: `${facility.occupancy_rate || 0}%`,
                            background: (facility.occupancy_rate || 0) >= 90 ? '#ef4444' : (facility.occupancy_rate || 0) >= 70 ? '#f59e0b' : '#10b981',
                            borderRadius: '8px',
                            transition: 'width 0.3s'
                          }} 
                        />
                        <span style={{ 
                          position: 'absolute', 
                          left: '12px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          fontSize: '12px', 
                          fontWeight: 600,
                          color: (facility.occupancy_rate || 0) > 50 ? 'white' : '#374151'
                        }}>
                          {facility.occupancy_rate || 0}%
                        </span>
                      </div>
                      <div style={{ width: '120px', textAlign: 'right', fontSize: '14px', color: '#374151' }}>
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>{facility.available}</span>
                        <span style={{ color: '#6b7280' }}> / {facility.total_beds} available</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bed Type Distribution */}
            {bedAnalytics.bed_types && bedAnalytics.bed_types.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Bed Type Distribution</h3>
                  <ExportButton onClick={exportBedTypes} label="Export" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                  {bedAnalytics.bed_types.map((type) => (
                    <div key={type.bed_type} style={{ 
                      padding: '20px', 
                      background: '#f9fafb', 
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ fontSize: '28px', fontWeight: 700, color: '#275380' }}>{type.count}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize', marginTop: '4px' }}>{type.bed_type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            No bed data available
          </div>
        )}
      </main>
    </AnalyticsGate>
  );
}
