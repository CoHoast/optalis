'use client';

import { useState, useEffect } from 'react';
import MobileLayout from '@/components/MobileLayout';
import '../mobile.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface FacilityBeds {
  id: string;
  name: string;
  total_beds: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  maintenance: number;
  occupancy_rate: number;
}

interface BedAnalytics {
  snapshot: {
    total_beds: number;
    available: number;
    occupied: number;
    occupancy_rate: number;
  };
  discharges: {
    discharging_today: number;
    discharging_week: number;
  };
  facilities: FacilityBeds[];
}

export default function MobileBedsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BedAnalytics | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string>('');
  const [facilityDetail, setFacilityDetail] = useState<FacilityBeds | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/beds`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedFacility && data?.facilities) {
      const facility = data.facilities.find(f => f.id === selectedFacility);
      setFacilityDetail(facility || null);
    } else {
      setFacilityDetail(null);
    }
  }, [selectedFacility, data]);

  if (loading) {
    return (
      <MobileLayout title="Bed Availability" showBack>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Bed Availability" showBack>
      <div style={{ padding: '16px', paddingBottom: '100px' }}>
        
        {/* Overall Summary */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0d9488, #0f766e)', 
          borderRadius: '16px', 
          padding: '20px', 
          color: 'white',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>System Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{data?.snapshot?.available || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>Available Now</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{data?.snapshot?.occupancy_rate || 0}%</div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>Occupancy</div>
            </div>
          </div>
        </div>

        {/* Upcoming Availability */}
        <div style={{ 
          background: 'white', 
          borderRadius: '14px', 
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
            Upcoming Availability
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              flex: 1, 
              background: '#fef3c7', 
              borderRadius: '10px', 
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#92400e' }}>
                {data?.discharges?.discharging_today || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#92400e' }}>Today</div>
            </div>
            <div style={{ 
              flex: 1, 
              background: '#dbeafe', 
              borderRadius: '10px', 
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e40af' }}>
                {data?.discharges?.discharging_week || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#1e40af' }}>This Week</div>
            </div>
          </div>
        </div>

        {/* Facility Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>
            Select Location
          </label>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '15px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '20px'
            }}
          >
            <option value="">All Locations</option>
            {data?.facilities?.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Facility Detail or All Facilities List */}
        {facilityDetail ? (
          <div style={{ 
            background: 'white', 
            borderRadius: '14px', 
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{ 
              padding: '16px', 
              borderBottom: '1px solid #f3f4f6',
              background: '#f9fafb'
            }}>
              <div style={{ fontWeight: 600, fontSize: '16px', color: '#374151' }}>
                {facilityDetail.name}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                {facilityDetail.total_beds} total beds
              </div>
            </div>
            
            {/* Occupancy Bar */}
            <div style={{ padding: '16px' }}>
              <div style={{ 
                height: '12px', 
                background: '#f3f4f6', 
                borderRadius: '6px', 
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${facilityDetail.occupancy_rate}%`,
                  background: facilityDetail.occupancy_rate >= 90 ? '#ef4444' : 
                             facilityDetail.occupancy_rate >= 70 ? '#f59e0b' : '#10b981',
                  borderRadius: '6px',
                  transition: 'width 0.3s'
                }} />
              </div>
              
              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ textAlign: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '10px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#16a34a' }}>{facilityDetail.available}</div>
                  <div style={{ fontSize: '11px', color: '#16a34a' }}>Available</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#fef2f2', borderRadius: '10px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>{facilityDetail.occupied}</div>
                  <div style={{ fontSize: '11px', color: '#dc2626' }}>Occupied</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '10px' }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#6b7280' }}>{facilityDetail.occupancy_rate}%</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Occupancy</div>
                </div>
              </div>

              {/* Additional Status */}
              {(facilityDetail.reserved > 0 || facilityDetail.cleaning > 0 || facilityDetail.maintenance > 0) && (
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '12px',
                  flexWrap: 'wrap'
                }}>
                  {facilityDetail.reserved > 0 && (
                    <span style={{ 
                      padding: '6px 10px', 
                      background: '#fef3c7', 
                      color: '#92400e',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {facilityDetail.reserved} Reserved
                    </span>
                  )}
                  {facilityDetail.cleaning > 0 && (
                    <span style={{ 
                      padding: '6px 10px', 
                      background: '#e0f2fe', 
                      color: '#0369a1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {facilityDetail.cleaning} Cleaning
                    </span>
                  )}
                  {facilityDetail.maintenance > 0 && (
                    <span style={{ 
                      padding: '6px 10px', 
                      background: '#fee2e2', 
                      color: '#dc2626',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500
                    }}>
                      {facilityDetail.maintenance} Maintenance
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* All Facilities List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.facilities?.map(facility => (
              <div 
                key={facility.id}
                onClick={() => setSelectedFacility(facility.id)}
                style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                    {facility.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>{facility.available}</span> available of {facility.total_beds}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '50px',
                    height: '8px', 
                    background: '#f3f4f6', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${facility.occupancy_rate}%`,
                      background: facility.occupancy_rate >= 90 ? '#ef4444' : 
                                 facility.occupancy_rate >= 70 ? '#f59e0b' : '#10b981',
                      borderRadius: '4px'
                    }} />
                  </div>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 600,
                    color: facility.occupancy_rate >= 90 ? '#ef4444' : 
                           facility.occupancy_rate >= 70 ? '#f59e0b' : '#10b981'
                  }}>
                    {facility.occupancy_rate}%
                  </span>
                  <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </MobileLayout>
  );
}
