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
            padding: '24px',
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
          {/* Preview Mockup - Marketing */}
          <div style={{
            background: 'linear-gradient(135deg, #275380 0%, #1e3f61 100%)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            height: '140px',
          }}>
            {/* Nav mockup */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '60px', height: '14px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '30px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
                <div style={{ width: '30px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
                <div style={{ width: '30px', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
              </div>
            </div>
            {/* Hero text mockup */}
            <div style={{ width: '70%', height: '12px', background: 'rgba(255,255,255,0.9)', borderRadius: '3px', marginBottom: '8px' }}></div>
            <div style={{ width: '50%', height: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '3px', marginBottom: '16px' }}></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '60px', height: '20px', background: '#5a9fd4', borderRadius: '4px' }}></div>
              <div style={{ width: '60px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)' }}></div>
            </div>
          </div>
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a' }}>
            Marketing Website
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
            Product overview, features, and value proposition.
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
            padding: '24px',
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
          {/* Preview Mockup - Dashboard */}
          <div style={{
            background: '#f9f7f4',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '20px',
            height: '140px',
            display: 'flex',
            gap: '8px',
          }}>
            {/* Sidebar mockup */}
            <div style={{ width: '40px', background: '#275380', borderRadius: '8px', padding: '8px' }}>
              <div style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.3)', borderRadius: '6px', marginBottom: '8px' }}></div>
              <div style={{ width: '24px', height: '4px', background: 'rgba(255,255,255,0.5)', borderRadius: '2px', marginBottom: '6px' }}></div>
              <div style={{ width: '24px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '6px' }}></div>
              <div style={{ width: '24px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
            </div>
            {/* Main content mockup */}
            <div style={{ flex: 1 }}>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                <div style={{ flex: 1, height: '32px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}></div>
                <div style={{ flex: 1, height: '32px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}></div>
                <div style={{ flex: 1, height: '32px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}></div>
              </div>
              {/* Table mockup */}
              <div style={{ background: 'white', borderRadius: '6px', padding: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#275380', borderRadius: '50%' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '60%', height: '6px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ width: '40%', height: '4px', background: '#f3f4f6', borderRadius: '2px' }}></div>
                  </div>
                  <div style={{ width: '40px', height: '16px', background: '#dcfce7', borderRadius: '8px' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#6b7280', borderRadius: '50%' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ width: '50%', height: '6px', background: '#e5e7eb', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ width: '35%', height: '4px', background: '#f3f4f6', borderRadius: '2px' }}></div>
                  </div>
                  <div style={{ width: '40px', height: '16px', background: '#fef3c7', borderRadius: '8px' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a' }}>
            Desktop Dashboard
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
            Full-featured admin dashboard for coordinators and managers.
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
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          {/* Preview Mockup - Mobile Phone */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '90px',
              height: '160px',
              background: '#1a1a1a',
              borderRadius: '16px',
              padding: '6px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: '#f9f7f4',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                {/* Phone header */}
                <div style={{ height: '20px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '40px', height: '6px', background: '#e5e7eb', borderRadius: '3px' }}></div>
                </div>
                {/* App content */}
                <div style={{ padding: '6px' }}>
                  <div style={{ background: '#275380', borderRadius: '6px', padding: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '50%', height: '4px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px', marginBottom: '4px' }}></div>
                    <div style={{ width: '80%', height: '3px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px' }}></div>
                  </div>
                  <div style={{ background: 'white', borderRadius: '4px', padding: '4px', marginBottom: '4px' }}>
                    <div style={{ width: '60%', height: '3px', background: '#e5e7eb', borderRadius: '2px' }}></div>
                  </div>
                  <div style={{ background: 'white', borderRadius: '4px', padding: '4px' }}>
                    <div style={{ width: '50%', height: '3px', background: '#e5e7eb', borderRadius: '2px' }}></div>
                  </div>
                </div>
                {/* Bottom nav */}
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', right: '6px', height: '18px', background: 'white', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', background: '#275380', borderRadius: '2px' }}></div>
                  <div style={{ width: '10px', height: '10px', background: '#e5e7eb', borderRadius: '2px' }}></div>
                  <div style={{ width: '14px', height: '14px', background: '#275380', borderRadius: '50%' }}></div>
                  <div style={{ width: '10px', height: '10px', background: '#e5e7eb', borderRadius: '2px' }}></div>
                  <div style={{ width: '10px', height: '10px', background: '#e5e7eb', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a', textAlign: 'center' }}>
            Mobile Web App
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: 1.5, textAlign: 'center' }}>
            On-the-go review for field staff. Scan QR code:
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
