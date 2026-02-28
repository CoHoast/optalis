'use client';

import React from 'react';

// Feature flag - set to true to enable analytics for all users
// In production, this would come from the client/subscription settings
const ANALYTICS_ENABLED = true;

interface AnalyticsGateProps {
  children: React.ReactNode;
}

export default function AnalyticsGate({ children }: AnalyticsGateProps) {
  if (ANALYTICS_ENABLED) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '600px' }}>
      {/* Blurred preview */}
      <div style={{
        filter: 'blur(8px)',
        pointerEvents: 'none',
        opacity: 0.4,
      }}>
        {children}
      </div>

      {/* Upgrade overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '48px',
          maxWidth: '480px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        }}>
          {/* Lock icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #275380 0%, #1a3a5c 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: '0 0 12px 0',
          }}>
            Unlock Intake Analytics
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 32px 0',
            lineHeight: 1.6,
          }}>
            See your referral pipeline, track response times, and benchmark across locations with powerful analytics.
          </p>

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 32px 0',
            textAlign: 'left',
          }}>
            {[
              'Referral source tracking & ROI',
              'Response time analysis',
              'Multi-location benchmarking',
              'Team performance metrics',
              'Payer mix insights',
              'Trend forecasting',
            ].map((feature, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0',
                color: '#374151',
                fontSize: '15px',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <p style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#275380',
            margin: '0 0 24px 0',
          }}>
            $750<span style={{ fontSize: '18px', fontWeight: 500, color: '#6b7280' }}>/month</span>
          </p>

          <button style={{
            width: '100%',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 600,
            color: 'white',
            background: 'linear-gradient(135deg, #275380 0%, #1a3a5c 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(39, 83, 128, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            Upgrade Now
          </button>

          <p style={{
            fontSize: '13px',
            color: '#9ca3af',
            marginTop: '16px',
          }}>
            Contact sales@dokit.ai to get started
          </p>
        </div>
      </div>
    </div>
  );
}
