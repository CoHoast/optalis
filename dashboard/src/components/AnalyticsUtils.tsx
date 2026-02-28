'use client';

import React from 'react';

// ============================================================
// CSV Export Utility
// ============================================================

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ============================================================
// Print/PDF Utility
// ============================================================

export function printPage() {
  window.print();
}

// ============================================================
// Export Button Component
// ============================================================

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
}

export function ExportButton({ onClick, label = 'Export CSV' }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#374151',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#f9fafb';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      {label}
    </button>
  );
}

// ============================================================
// Print Button Component
// ============================================================

export function PrintButton() {
  return (
    <button
      onClick={printPage}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#374151',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = '#f9fafb';
        e.currentTarget.style.borderColor = '#d1d5db';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Print / PDF
    </button>
  );
}

// ============================================================
// Analytics Tab Bar Component
// ============================================================

interface Tab {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface AnalyticsTabBarProps {
  activeTab: string;
}

const tabs: Tab[] = [
  {
    name: 'Overview',
    href: '/dashboard/analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: 'Referrals',
    href: '/dashboard/analytics/referrals',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8v6M23 11h-6" />
      </svg>
    ),
  },
  {
    name: 'Response Time',
    href: '/dashboard/analytics/response-time',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    name: 'Locations',
    href: '/dashboard/analytics/locations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export function AnalyticsTabBar({ activeTab }: AnalyticsTabBarProps) {
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '4px',
      background: '#f3f4f6',
      borderRadius: '12px',
      marginBottom: '24px',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.href;
        return (
          <a
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#275380' : '#6b7280',
              background: isActive ? 'white' : 'transparent',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {tab.icon}
            {tab.name}
          </a>
        );
      })}
    </div>
  );
}

// ============================================================
// Date Range Picker Component
// ============================================================

interface DateRangePickerProps {
  period: string;
  setPeriod: (period: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onApply: () => void;
}

export function DateRangePicker({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApply,
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = React.useState(period === 'custom');

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onApply();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <select
        value={period}
        onChange={(e) => handlePeriodChange(e.target.value)}
        style={{
          padding: '10px 16px',
          fontSize: '14px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        <option value="week">This Week</option>
        <option value="month">This Month</option>
        <option value="quarter">This Quarter</option>
        <option value="custom">Custom Range</option>
      </select>

      {showCustom && (
        <>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
            }}
          />
          <span style={{ color: '#9ca3af' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
            }}
          />
          <button
            onClick={onApply}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              background: '#275380',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </>
      )}
    </div>
  );
}
