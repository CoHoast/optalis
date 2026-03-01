'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileSettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{
        width: '50px',
        height: '28px',
        borderRadius: '14px',
        border: 'none',
        background: enabled ? '#275380' : '#d1d5db',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s'
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: '3px',
        left: enabled ? '25px' : '3px',
        transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  );

  const SettingRow = ({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <div>
        <div style={{ fontWeight: 500, color: '#1f2937' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{sublabel}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #275380 0%, #1a3a5c 100%)',
        padding: '16px 20px',
        paddingTop: '48px',
        color: 'white'
      }}>
        <Link href="/mobile" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
          ← Back
        </Link>
        <h1 style={{ margin: '12px 0 0', fontSize: '24px', fontWeight: 700 }}>Settings</h1>
      </div>

      {/* Settings Sections */}
      <div style={{ padding: '20px' }}>
        {/* Account Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '0 16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 600, color: '#275380', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Account
            </div>
          </div>
          <SettingRow label="Email" sublabel="demo@optalis.com">
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>→</span>
          </SettingRow>
          <SettingRow label="Facility" sublabel="Dublin, OH">
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>→</span>
          </SettingRow>
          <SettingRow label="Role" sublabel="Reviewer">
            <span style={{ color: '#6b7280', fontSize: '14px' }}>—</span>
          </SettingRow>
        </div>

        {/* Preferences Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '0 16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 600, color: '#275380', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Preferences
            </div>
          </div>
          <SettingRow label="Push Notifications" sublabel="New applications, reviews">
            <ToggleSwitch enabled={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
          </SettingRow>
          <SettingRow label="Auto-sync" sublabel="Sync when on WiFi">
            <ToggleSwitch enabled={autoSync} onChange={() => setAutoSync(!autoSync)} />
          </SettingRow>
        </div>

        {/* About Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '0 16px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 600, color: '#275380', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              About
            </div>
          </div>
          <SettingRow label="Version">
            <span style={{ color: '#6b7280', fontSize: '14px' }}>1.0.0</span>
          </SettingRow>
          <SettingRow label="Help & Support">
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>→</span>
          </SettingRow>
          <SettingRow label="Privacy Policy">
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>→</span>
          </SettingRow>
        </div>

        {/* Sign Out */}
        <button style={{
          width: '100%',
          padding: '16px',
          background: 'white',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: '#dc2626',
          fontWeight: 500,
          fontSize: '16px',
          cursor: 'pointer'
        }}>
          Sign Out
        </button>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 20px'
      }}>
        <Link href="/mobile" style={{ textDecoration: 'none', textAlign: 'center', color: '#6b7280' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <div style={{ fontSize: '11px', marginTop: '2px' }}>Apps</div>
        </Link>
        <Link href="/mobile/scan" style={{ textDecoration: 'none', textAlign: 'center', color: '#6b7280' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
          </svg>
          <div style={{ fontSize: '11px', marginTop: '2px' }}>Scan</div>
        </Link>
        <Link href="/mobile/review" style={{ textDecoration: 'none', textAlign: 'center', color: '#6b7280' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <div style={{ fontSize: '11px', marginTop: '2px' }}>Review</div>
        </Link>
        <Link href="/mobile/settings" style={{ textDecoration: 'none', textAlign: 'center', color: '#275380' }}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          <div style={{ fontSize: '11px', marginTop: '2px' }}>Settings</div>
        </Link>
      </div>
    </div>
  );
}
