'use client';

import { useState } from 'react';

interface CopyButtonProps {
  value: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CopyButton({ value, label, size = 'sm', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value || value === '—' || value === 'N/A') return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const iconSize = size === 'sm' ? 14 : 18;
  const padding = size === 'sm' ? '4px' : '6px';

  return (
    <button
      onClick={handleCopy}
      className={className}
      style={{
        padding,
        background: copied ? '#dcfce7' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: value && value !== '—' && value !== 'N/A' ? 'pointer' : 'not-allowed',
        opacity: value && value !== '—' && value !== 'N/A' ? 1 : 0.3,
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={copied ? 'Copied!' : `Copy ${label || 'value'}`}
    >
      {copied ? (
        <svg width={iconSize} height={iconSize} fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

interface CopyAllButtonProps {
  data: Record<string, any>;
  formatFn?: (data: Record<string, any>) => string;
  className?: string;
}

export function CopyAllButton({ data, formatFn, className = '' }: CopyAllButtonProps) {
  const [copied, setCopied] = useState(false);

  const defaultFormat = (d: Record<string, any>) => {
    const sections = [
      {
        title: 'PATIENT INFORMATION',
        fields: [
          ['Name', d.patient_name],
          ['Date of Birth', d.dob],
          ['Sex', d.sex],
          ['Phone', d.phone],
          ['Address', d.address],
          ['SSN (Last 4)', d.ssn_last4],
        ]
      },
      {
        title: 'REFERRAL INFORMATION',
        fields: [
          ['Hospital', d.hospital],
          ['Building', d.building],
          ['Room #', d.room_number],
          ['Case Manager', d.case_manager_name],
          ['CM Phone', d.case_manager_phone],
        ]
      },
      {
        title: 'INSURANCE & DATES',
        fields: [
          ['Insurance', d.insurance],
          ['Policy/Member ID', d.policy_number],
          ['Care Level', d.care_level],
          ['Date Admitted', d.date_admitted],
          ['Inpatient Date', d.inpatient_date],
          ['Expected Discharge', d.anticipated_discharge],
        ]
      },
      {
        title: 'CLINICAL INFORMATION',
        fields: [
          ['Diagnosis', Array.isArray(d.diagnosis) ? d.diagnosis.join(', ') : d.diagnosis],
          ['Medications', Array.isArray(d.medications) ? d.medications.join(', ') : d.medications],
          ['Allergies', Array.isArray(d.allergies) ? d.allergies.join(', ') : d.allergies],
          ['Services', Array.isArray(d.services) ? d.services.join(', ') : d.services],
          ['Fall Risk', d.fall_risk ? 'Yes' : 'No'],
          ['Diet', d.diet],
          ['Physician', d.physician],
        ]
      },
      {
        title: 'THERAPY STATUS',
        fields: [
          ['Prior Level', d.therapy_prior_level],
          ['Bed Mobility', d.therapy_bed_mobility],
          ['Transfers', d.therapy_transfers],
          ['Gait', d.therapy_gait],
        ]
      },
      {
        title: 'CLINICAL SUMMARY',
        fields: [
          ['Summary', d.clinical_summary],
        ]
      },
    ];

    let output = '';
    for (const section of sections) {
      const validFields = section.fields.filter(([_, val]) => val && val !== '—' && val !== 'N/A');
      if (validFields.length === 0) continue;
      
      output += `${section.title}\n`;
      output += '─'.repeat(section.title.length) + '\n';
      for (const [label, value] of validFields) {
        output += `${label}: ${value}\n`;
      }
      output += '\n';
    }
    
    output += `───────────────────────────────\n`;
    output += `Copied from Optalis | ${new Date().toLocaleDateString()}`;
    
    return output.trim();
  };

  const handleCopy = async () => {
    try {
      const text = formatFn ? formatFn(data) : defaultFormat(data);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: copied ? '#16a34a' : '#275380',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? (
        <>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied to Clipboard!
        </>
      ) : (
        <>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy All Fields
        </>
      )}
    </button>
  );
}
