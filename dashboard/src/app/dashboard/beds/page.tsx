'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';

const API_URL = 'https://optalis-api-production.up.railway.app';

interface Facility {
  id: string;
  name: string;
  total_beds: number;
}

interface Bed {
  id: string;
  facility_id: string;
  room_number: string;
  bed_identifier: string;
  bed_type: string;
  status: string;
  current_patient_id: string | null;
  current_patient_name: string | null;
  available_date: string | null;
  available_time: string | null;
  notes: string | null;
}

interface BedSummary {
  available_now: number;
  next_24_hours: number;
  next_7_days: number;
  total_beds: number;
  occupied: number;
}

export default function BedManagementPage() {
  const { user, isAdmin, facilityId } = useUser();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [beds, setBeds] = useState<Bed[]>([]);
  const [summary, setSummary] = useState<BedSummary | null>(null);
  const [upcomingBeds, setUpcomingBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'all' | 'available' | '24h' | '7d'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [newBed, setNewBed] = useState({ room_number: '', bed_identifier: 'A', bed_type: 'standard', status: 'available', notes: '' });
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  // Quick action to update bed status
  const quickAction = async (bedId: string, action: string) => {
    try {
      await fetch(`${API_URL}/api/beds/${bedId}/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      fetchBeds();
      fetchSummary();
    } catch (err) {
      console.error('Quick action failed:', err);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [isAdmin, facilityId]);

  useEffect(() => {
    if (selectedFacility) {
      fetchBeds();
      fetchSummary();
      fetchUpcoming();
    }
  }, [selectedFacility]);

  const fetchFacilities = async () => {
    const res = await fetch(`${API_URL}/api/facilities`);
    let data = await res.json();
    
    // Non-admins only see their assigned facility
    if (!isAdmin && facilityId) {
      data = data.filter((f: Facility) => f.id === facilityId);
    }
    
    setFacilities(data);
    
    // Auto-select facility
    if (!isAdmin && facilityId) {
      setSelectedFacility(facilityId);
    } else if (data.length > 0) {
      setSelectedFacility(data[0].id);
    }
    setLoading(false);
  };

  const fetchBeds = async () => {
    const res = await fetch(`${API_URL}/api/facilities/${selectedFacility}/beds`);
    const data = await res.json();
    setBeds(data);
  };

  const fetchSummary = async () => {
    const res = await fetch(`${API_URL}/api/facilities/${selectedFacility}/beds/summary`);
    const data = await res.json();
    setSummary(data);
  };

  const fetchUpcoming = async () => {
    const res = await fetch(`${API_URL}/api/facilities/${selectedFacility}/beds/upcoming?days=7`);
    const data = await res.json();
    setUpcomingBeds(data);
  };

  const addBed = async () => {
    await fetch(`${API_URL}/api/facilities/${selectedFacility}/beds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBed)
    });
    setShowAddModal(false);
    setNewBed({ room_number: '', bed_identifier: 'A', bed_type: 'standard', status: 'available', notes: '' });
    fetchBeds();
    fetchSummary();
  };

  const updateBed = async () => {
    if (!editingBed) return;
    await fetch(`${API_URL}/api/beds/${editingBed.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingBed)
    });
    setShowEditModal(false);
    setEditingBed(null);
    fetchBeds();
    fetchSummary();
    fetchUpcoming();
  };

  const deleteBed = async (bedId: string) => {
    if (!confirm('Are you sure you want to delete this bed?')) return;
    await fetch(`${API_URL}/api/beds/${bedId}`, { method: 'DELETE' });
    fetchBeds();
    fetchSummary();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#dcfce7', text: '#16a34a' };
      case 'occupied': return { bg: '#fee2e2', text: '#dc2626' };
      case 'reserved': return { bg: '#fef3c7', text: '#d97706' };
      case 'maintenance': return { bg: '#e5e7eb', text: '#6b7280' };
      case 'cleaning': return { bg: '#dbeafe', text: '#2563eb' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const filteredBeds = beds.filter(bed => {
    if (activeView === 'available') return bed.status === 'available';
    if (activeView === '24h') return upcomingBeds.filter(b => {
      const availDate = new Date(b.available_date || '');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return availDate <= tomorrow;
    }).map(b => b.id).includes(bed.id);
    if (activeView === '7d') return upcomingBeds.map(b => b.id).includes(bed.id);
    return true;
  });

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;
  }

  if (facilities.length === 0) {
    return (
      <div className="main-content" style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px' }}>Bed Management</h1>
        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#92400e', marginBottom: '10px' }}>No facilities configured yet.</p>
          <p style={{ color: '#92400e', fontSize: '14px' }}>Go to Settings → Facilities to add your first facility.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Facility Filter Banner for non-admins */}
      {!isAdmin && user?.facility_name && (
        <div style={{ 
          background: '#eff6ff', 
          borderBottom: '1px solid #bfdbfe',
          padding: '12px 24px', 
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          <span style={{ color: '#1e40af', fontWeight: 500 }}>
            Viewing beds for: <strong>{user.facility_name}</strong>
          </span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 13h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zM3 13V8a2 2 0 012-2h3v7M21 13V8a2 2 0 00-2-2h-9v7"/>
            </svg>
            Bed Management
          </h1>
          <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>
            {isAdmin ? 'Track bed availability across all facilities' : `Bed availability for ${user?.facility_name || 'your facility'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Only show facility dropdown for admins or if user has access to multiple facilities */}
          {(isAdmin || facilities.length > 1) && (
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', minWidth: '200px' }}
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
          >
            + Add Bed
          </button>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Summary Cards */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div
              onClick={() => setActiveView('available')}
              style={{
                background: activeView === 'available' ? '#275380' : 'white',
                color: activeView === 'available' ? 'white' : 'inherit',
                borderRadius: '16px', padding: '20px', cursor: 'pointer',
                border: '1px solid #e5e7eb', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px' }}>Available Now</div>
              <div style={{ fontSize: '36px', fontWeight: 700 }}>{summary.available_now}</div>
            </div>
            <div
              onClick={() => setActiveView('24h')}
              style={{
                background: activeView === '24h' ? '#275380' : 'white',
                color: activeView === '24h' ? 'white' : 'inherit',
                borderRadius: '16px', padding: '20px', cursor: 'pointer',
                border: '1px solid #e5e7eb', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px' }}>Next 24 Hours</div>
              <div style={{ fontSize: '36px', fontWeight: 700 }}>{summary.next_24_hours}</div>
            </div>
            <div
              onClick={() => setActiveView('7d')}
              style={{
                background: activeView === '7d' ? '#275380' : 'white',
                color: activeView === '7d' ? 'white' : 'inherit',
                borderRadius: '16px', padding: '20px', cursor: 'pointer',
                border: '1px solid #e5e7eb', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px' }}>Next 7 Days</div>
              <div style={{ fontSize: '36px', fontWeight: 700 }}>{summary.next_7_days}</div>
            </div>
            <div
              onClick={() => setActiveView('all')}
              style={{
                background: activeView === 'all' ? '#275380' : 'white',
                color: activeView === 'all' ? 'white' : 'inherit',
                borderRadius: '16px', padding: '20px', cursor: 'pointer',
                border: '1px solid #e5e7eb', transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px' }}>Total Beds</div>
              <div style={{ fontSize: '36px', fontWeight: 700 }}>{summary.total_beds}</div>
            </div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>Occupied</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#dc2626' }}>{summary.occupied}</div>
            </div>
          </div>
        )}

        {/* Beds Table */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              {activeView === 'all' ? 'All Beds' : activeView === 'available' ? 'Available Beds' : activeView === '24h' ? 'Available in 24 Hours' : 'Available in 7 Days'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{filteredBeds.length} beds</span>
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    background: viewMode === 'table' ? 'white' : 'transparent',
                    boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    fontSize: '13px', fontWeight: 500
                  }}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  style={{
                    padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    background: viewMode === 'timeline' ? 'white' : 'transparent',
                    boxShadow: viewMode === 'timeline' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    fontSize: '13px', fontWeight: 500
                  }}
                >
                  Timeline
                </button>
              </div>
            </div>
          </div>
          {viewMode === 'table' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Room</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Bed</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Patient</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Available</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Notes</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeds.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    No beds found. Add your first bed to get started.
                  </td>
                </tr>
              ) : (
                filteredBeds.map(bed => {
                  const statusColor = getStatusColor(bed.status);
                  return (
                    <tr key={bed.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{bed.room_number}</td>
                      <td style={{ padding: '12px 16px' }}>{bed.bed_identifier}</td>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{bed.bed_type}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: '16px', background: statusColor.bg, color: statusColor.text, fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' }}>
                          {bed.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: bed.current_patient_name ? '#374151' : '#9ca3af' }}>
                        {bed.current_patient_name || '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {bed.available_date ? (
                          <span>
                            {new Date(bed.available_date).toLocaleDateString()}
                            {bed.available_time && ` at ${bed.available_time}`}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bed.notes || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* Quick Actions based on current status */}
                          {bed.status === 'cleaning' && (
                            <button
                              onClick={() => quickAction(bed.id, 'available')}
                              style={{ padding: '6px 10px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                            >
                              ✓ Ready
                            </button>
                          )}
                          {bed.status === 'maintenance' && (
                            <button
                              onClick={() => quickAction(bed.id, 'available')}
                              style={{ padding: '6px 10px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                            >
                              ✓ Fixed
                            </button>
                          )}
                          {bed.status === 'occupied' && (
                            <button
                              onClick={() => quickAction(bed.id, 'cleaning')}
                              style={{ padding: '6px 10px', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                            >
                              Discharge
                            </button>
                          )}
                          {bed.status === 'available' && (
                            <>
                              <button
                                onClick={() => quickAction(bed.id, 'reserved')}
                                style={{ padding: '6px 10px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                              >
                                Reserve
                              </button>
                              <button
                                onClick={() => quickAction(bed.id, 'maintenance')}
                                style={{ padding: '6px 10px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}
                              >
                                🔧
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setEditingBed(bed); setShowEditModal(true); }}
                            style={{ padding: '6px 10px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          ) : (
            /* Timeline View */
            <div style={{ padding: '20px' }}>
              {filteredBeds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No beds found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Timeline Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr', gap: '12px', padding: '8px 0', borderBottom: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>
                    <div>Room</div>
                    <div>Status</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
                      {[0,1,2,3,4,5,6].map(d => {
                        const date = new Date();
                        date.setDate(date.getDate() + d);
                        return <div key={d}>{d === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}</div>;
                      })}
                    </div>
                  </div>
                  
                  {/* Bed Rows */}
                  {filteredBeds.map(bed => {
                    const statusColor = getStatusColor(bed.status);
                    const dischargeDay = bed.available_date ? Math.ceil((new Date(bed.available_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                    
                    return (
                      <div key={bed.id} style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{bed.room_number}{bed.bed_identifier}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{bed.bed_type}</div>
                        </div>
                        <div>
                          <span style={{ padding: '4px 8px', borderRadius: '12px', background: statusColor.bg, color: statusColor.text, fontSize: '11px', fontWeight: 500 }}>
                            {bed.status}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                          {[0,1,2,3,4,5,6].map(d => {
                            let cellColor = '#f0fdf4'; // Green = available
                            let cellText = '';
                            
                            if (bed.status === 'occupied') {
                              if (dischargeDay === null || d < dischargeDay) {
                                cellColor = '#fee2e2'; // Red = occupied
                                cellText = d === 0 && bed.current_patient_name ? bed.current_patient_name.split(' ')[0] : '';
                              } else if (d === dischargeDay) {
                                cellColor = '#fef3c7'; // Yellow = discharge day
                                cellText = 'D/C';
                              }
                            } else if (bed.status === 'cleaning' || bed.status === 'maintenance') {
                              if (d === 0) {
                                cellColor = '#f3f4f6'; // Gray
                                cellText = bed.status === 'cleaning' ? '🧹' : '🔧';
                              }
                            } else if (bed.status === 'reserved') {
                              cellColor = '#dbeafe'; // Blue
                              cellText = d === 0 ? 'Res' : '';
                            }
                            
                            return (
                              <div 
                                key={d} 
                                style={{ 
                                  height: '36px', 
                                  background: cellColor, 
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  color: '#374151'
                                }}
                              >
                                {cellText}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f0fdf4' }}></div>
                      Available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#fee2e2' }}></div>
                      Occupied
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#fef3c7' }}></div>
                      Discharge
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#dbeafe' }}></div>
                      Reserved
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f3f4f6' }}></div>
                      Cleaning/Maintenance
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Bed Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>Add New Bed</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Room Number *</label>
                  <input
                    value={newBed.room_number}
                    onChange={(e) => setNewBed({ ...newBed, room_number: e.target.value })}
                    placeholder="e.g., 204"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Bed Identifier</label>
                  <select
                    value={newBed.bed_identifier}
                    onChange={(e) => setNewBed({ ...newBed, bed_identifier: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Bed Type</label>
                  <select
                    value={newBed.bed_type}
                    onChange={(e) => setNewBed({ ...newBed, bed_type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="standard">Standard</option>
                    <option value="bariatric">Bariatric</option>
                    <option value="isolation">Isolation</option>
                    <option value="memory_care">Memory Care</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Status</label>
                  <select
                    value={newBed.status}
                    onChange={(e) => setNewBed({ ...newBed, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Notes</label>
                <textarea
                  value={newBed.notes}
                  onChange={(e) => setNewBed({ ...newBed, notes: e.target.value })}
                  placeholder="Optional notes..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', minHeight: '80px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addBed} disabled={!newBed.room_number} style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Add Bed</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bed Modal */}
      {showEditModal && editingBed && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>Edit Bed — Room {editingBed.room_number}-{editingBed.bed_identifier}</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Status</label>
                <select
                  value={editingBed.status}
                  onChange={(e) => setEditingBed({ ...editingBed, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Current Patient</label>
                <input
                  value={editingBed.current_patient_name || ''}
                  onChange={(e) => setEditingBed({ ...editingBed, current_patient_name: e.target.value })}
                  placeholder="Patient name (if occupied)"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Available Date</label>
                  <input
                    type="date"
                    value={editingBed.available_date || ''}
                    onChange={(e) => setEditingBed({ ...editingBed, available_date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Available Time</label>
                  <input
                    type="time"
                    value={editingBed.available_time || ''}
                    onChange={(e) => setEditingBed({ ...editingBed, available_time: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>Notes</label>
                <textarea
                  value={editingBed.notes || ''}
                  onChange={(e) => setEditingBed({ ...editingBed, notes: e.target.value })}
                  placeholder="e.g., Discharge pending, family confirmed..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', minHeight: '80px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEditModal(false); setEditingBed(null); }} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={updateBed} style={{ padding: '10px 20px', background: '#275380', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
