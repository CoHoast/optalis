'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileLayout from '@/components/MobileLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface Facility {
  id: string;
  name: string;
}

interface Bed {
  id: string;
  facility_id: string;
  room_number: string;
  bed_identifier: string;
  bed_type: string;
  status: string;
  current_patient_name: string | null;
  available_date: string | null;
  available_time: string | null;
}

interface BedSummary {
  available_now: number;
  next_24_hours: number;
  next_7_days: number;
  total_beds: number;
  occupied: number;
}

export default function MobileBedsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [beds, setBeds] = useState<Bed[]>([]);
  const [summary, setSummary] = useState<BedSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchBeds();
      fetchSummary();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchBeds();
        fetchSummary();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedFacility]);

  const fetchFacilities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/facilities`);
      const data = await res.json();
      setFacilities(data);
      if (data.length > 0) setSelectedFacility(data[0].id);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
    setLoading(false);
  };

  const fetchBeds = async () => {
    try {
      const res = await fetch(`${API_URL}/api/facilities/${selectedFacility}/beds`);
      const data = await res.json();
      setBeds(data);
    } catch (err) {
      console.error('Failed to fetch beds:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/api/facilities/${selectedFacility}/beds/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const quickAction = async (bedId: string, action: string) => {
    setActionLoading(bedId);
    try {
      await fetch(`${API_URL}/api/beds/${bedId}/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      await fetchBeds();
      await fetchSummary();
    } catch (err) {
      console.error('Quick action failed:', err);
    }
    setActionLoading(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#dcfce7', text: '#16a34a' };
      case 'occupied': return { bg: '#fee2e2', text: '#dc2626' };
      case 'cleaning': return { bg: '#fef3c7', text: '#92400e' };
      case 'maintenance': return { bg: '#f3f4f6', text: '#6b7280' };
      case 'reserved': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const filteredBeds = beds.filter(bed => {
    if (filter === 'available') return bed.status === 'available';
    if (filter === 'occupied') return bed.status === 'occupied';
    return true;
  });

  if (loading) {
    return (
      <MobileLayout title="Beds">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
          Loading...
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Bed Management">
      {/* Header with facility selector */}
      <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '12px',
            background: 'white'
          }}
        >
          {facilities.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px' }}>
          <div style={{
            background: '#f0fdf4',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>{summary.available_now}</div>
            <div style={{ fontSize: '12px', color: '#16a34a', textTransform: 'uppercase' }}>Available</div>
          </div>
          <div style={{
            background: '#fef3c7',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#92400e' }}>{summary.next_24_hours}</div>
            <div style={{ fontSize: '12px', color: '#92400e', textTransform: 'uppercase' }}>24 Hours</div>
          </div>
          <div style={{
            background: '#fee2e2',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>{summary.occupied}</div>
            <div style={{ fontSize: '12px', color: '#dc2626', textTransform: 'uppercase' }}>Occupied</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', padding: '0 16px', gap: '8px', marginBottom: '16px' }}>
        {(['all', 'available', 'occupied'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: filter === f ? '#275380' : '#f3f4f6',
              color: filter === f ? 'white' : '#374151',
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bed List */}
      <div style={{ padding: '0 16px 100px' }}>
        {filteredBeds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No beds found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredBeds.map(bed => {
              const color = getStatusColor(bed.status);
              return (
                <div
                  key={bed.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 600 }}>
                        {bed.room_number}{bed.bed_identifier}
                      </span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: color.bg,
                        color: color.text,
                        fontSize: '12px',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {bed.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {bed.bed_type} • {bed.current_patient_name || 'Empty'}
                    </div>
                    {bed.available_date && (
                      <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                        Available: {new Date(bed.available_date).toLocaleDateString()}
                        {bed.available_time && ` at ${bed.available_time}`}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {bed.status === 'cleaning' && (
                      <button
                        onClick={() => quickAction(bed.id, 'available')}
                        disabled={actionLoading === bed.id}
                        style={{
                          padding: '10px 16px',
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          opacity: actionLoading === bed.id ? 0.7 : 1
                        }}
                      >
                        ✓ Ready
                      </button>
                    )}
                    {bed.status === 'maintenance' && (
                      <button
                        onClick={() => quickAction(bed.id, 'available')}
                        disabled={actionLoading === bed.id}
                        style={{
                          padding: '10px 16px',
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          opacity: actionLoading === bed.id ? 0.7 : 1
                        }}
                      >
                        ✓ Fixed
                      </button>
                    )}
                    {bed.status === 'occupied' && (
                      <button
                        onClick={() => quickAction(bed.id, 'cleaning')}
                        disabled={actionLoading === bed.id}
                        style={{
                          padding: '10px 16px',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          opacity: actionLoading === bed.id ? 0.7 : 1
                        }}
                      >
                        D/C
                      </button>
                    )}
                    {bed.status === 'available' && (
                      <button
                        onClick={() => quickAction(bed.id, 'maintenance')}
                        disabled={actionLoading === bed.id}
                        style={{
                          padding: '10px 16px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          opacity: actionLoading === bed.id ? 0.7 : 1
                        }}
                      >
                        🔧
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
      }}>
        <Link href="/mobile" style={{ textAlign: 'center', color: '#6b7280', textDecoration: 'none' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>Applications</div>
        </Link>
        <Link href="/mobile/beds" style={{ textAlign: 'center', color: '#275380', textDecoration: 'none' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
            <path d="M3 13h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zM3 13V8a2 2 0 012-2h3v7M21 13V8a2 2 0 00-2-2h-9v7"/>
          </svg>
          <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>Beds</div>
        </Link>
        <Link href="/mobile/scan" style={{ textAlign: 'center', color: '#6b7280', textDecoration: 'none' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ margin: '0 auto' }}>
            <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M15 3h4a2 2 0 012 2v4M15 21h4a2 2 0 002-2v-4"/>
          </svg>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>Scan</div>
        </Link>
      </div>
    </MobileLayout>
  );
}
