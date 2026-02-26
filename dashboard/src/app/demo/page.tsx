'use client';

import { useEffect, useState } from 'react';

// Generate QR code URL using Google Charts API (no dependencies needed)
const getQRCodeUrl = (url: string, size: number = 200) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=275380`;
};

export default function DemoLauncherPage() {
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const DEMO_LINKS = {
    marketing: 'https://optalis-marketing-production.up.railway.app',
    dashboard: 'https://optalis-production.up.railway.app/dashboard',
    mobile: 'https://optalis-production.up.railway.app/mobile',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f6f3 0%, #e8e4df 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          {/* Optalis Logo from official site */}
          <img 
            src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" 
            alt="Optalis Health & Rehabilitation"
            style={{
              height: '60px',
              width: 'auto',
            }}
          />
        </div>
        
        <div style={{
          display: 'inline-block',
          padding: '8px 20px',
          background: '#275380',
          color: 'white',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '16px'
        }}>
          🎯 Product Demo
        </div>
        
        <p style={{ 
          fontSize: '18px', 
          color: '#555',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          AI-Powered Admissions Document Processing Platform
        </p>
        
        {currentTime && (
          <p style={{ fontSize: '14px', color: '#888', marginTop: '12px' }}>
            {currentTime}
          </p>
        )}
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        
        {/* Marketing Site Card */}
        <a 
          href={DEMO_LINKS.marketing}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'block',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e8f4f8 0%, #d0e8f0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="32" height="32" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
            Marketing Website
          </h2>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
            Product overview, features, and value proposition for prospective clients.
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#275380',
            fontWeight: 500,
            fontSize: '14px'
          }}>
            <span>Visit Site</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </div>
        </a>

        {/* Dashboard Card */}
        <a 
          href={DEMO_LINKS.dashboard}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'block',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #275380 0%, #1e3f61 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="32" height="32" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
            Desktop Dashboard
          </h2>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
            Full-featured admin dashboard for admissions coordinators and managers.
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#275380',
            fontWeight: 500,
            fontSize: '14px'
          }}>
            <span>Open Dashboard</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </div>
        </a>

        {/* Mobile App Card with QR Code */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="32" height="32" fill="none" stroke="#166534" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px', color: '#1a1a1a' }}>
            Mobile Web App
          </h2>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
            On-the-go review app for field staff. Scan QR code with your phone:
          </p>
          
          {/* QR Code */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            background: '#f9f7f4',
            borderRadius: '16px',
            marginBottom: '16px'
          }}>
            <img 
              src={getQRCodeUrl(DEMO_LINKS.mobile, 180)}
              alt="Scan to open mobile app"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '8px',
              }}
            />
            <p style={{ 
              fontSize: '12px', 
              color: '#888', 
              marginTop: '12px',
              textAlign: 'center'
            }}>
              Scan with your phone camera
            </p>
          </div>
          
          <a 
            href={DEMO_LINKS.mobile}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#275380',
              fontWeight: 500,
              fontSize: '14px',
              textDecoration: 'none',
              padding: '12px',
              background: '#f0f4f8',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
          >
            <span>Or click to open</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '48px',
        paddingTop: '32px',
        borderTop: '1px solid #e0ddd8'
      }}>
        <p style={{ fontSize: '13px', color: '#888' }}>
          Demo Environment • Powered by DOKit AI Platform
        </p>
        <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
          Questions? Contact your sales representative
        </p>
      </div>
    </div>
  );
}
