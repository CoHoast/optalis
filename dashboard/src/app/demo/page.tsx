'use client';

import { useEffect, useState } from 'react';

// Generate QR code URL using Google Charts API (no dependencies needed)
const getQRCodeUrl = (url: string, size: number = 200) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=275380`;
};

// Modal component
const InfoModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          background: 'white',
          borderRadius: '20px 20px 0 0',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div style={{ padding: '28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Feature list item
const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #e8f4f8 0%, #d0e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{title}</h4>
      <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5, margin: 0 }}>{description}</p>
    </div>
  </div>
);

// Section divider
const SectionTitle = ({ children }: { children: string }) => (
  <h3 style={{ 
    fontSize: '13px', 
    fontWeight: 700, 
    color: '#275380', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px',
    marginTop: '28px',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #e8f4f8',
  }}>
    {children}
  </h3>
);

// Button component
const DemoButton = ({ 
  href, 
  onClick, 
  children, 
  primary = false 
}: { 
  href?: string; 
  onClick?: () => void; 
  children: React.ReactNode; 
  primary?: boolean;
}) => {
  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    flex: 1,
    ...(primary ? {
      background: '#275380',
      color: 'white',
    } : {
      background: '#f0f4f8',
      color: '#275380',
    }),
  };
  
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    );
  }
  
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  );
};

export default function DemoLauncherPage() {
  const [currentTime, setCurrentTime] = useState('');
  const [activeModal, setActiveModal] = useState<'marketing' | 'dashboard' | 'mobile' | null>(null);
  
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
        <img 
          src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" 
          alt="Optalis Health & Rehabilitation"
          style={{ height: '56px', width: 'auto', marginBottom: '16px' }}
        />
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(39, 83, 128, 0.08)',
          border: '1px solid rgba(39, 83, 128, 0.15)',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#275380',
          marginBottom: '20px'
        }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          Product Demo
        </div>
        
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600,
          color: '#1a1a1a',
          maxWidth: '600px',
          margin: '0 auto 8px',
          lineHeight: 1.4
        }}>
          AI-Powered Admissions Platform
        </h1>
        
        <p style={{ 
          fontSize: '16px', 
          color: '#666',
          maxWidth: '500px',
          margin: '0 auto',
          lineHeight: 1.5
        }}>
          Automated document intake and processing for healthcare admissions
        </p>
        
        {currentTime && (
          <p style={{ fontSize: '13px', color: '#999', marginTop: '16px' }}>
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
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            borderRadius: '12px',
            marginBottom: '20px',
            overflow: 'hidden',
            height: '160px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <img 
              src="/demo-previews/marketing-preview.jpg" 
              alt="Marketing Website Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a' }}>
            Marketing Website
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
            Modern, user-friendly public website for prospective patients and families.
          </p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <DemoButton href={DEMO_LINKS.marketing} primary>
              <span>Visit Site</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </DemoButton>
            <DemoButton onClick={() => setActiveModal('marketing')}>
              <span>More Info</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </DemoButton>
          </div>
        </div>

        {/* Dashboard Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            borderRadius: '12px',
            marginBottom: '20px',
            overflow: 'hidden',
            height: '160px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <img 
              src="/demo-previews/dashboard-preview.jpg" 
              alt="Dashboard Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
            />
          </div>
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a' }}>
            Desktop Dashboard
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
            AI-powered document intake and processing for admissions coordinators.
          </p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <DemoButton href={DEMO_LINKS.dashboard} primary>
              <span>Open Dashboard</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </DemoButton>
            <DemoButton onClick={() => setActiveModal('dashboard')}>
              <span>More Info</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </DemoButton>
          </div>
        </div>

        {/* Mobile App Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a', textAlign: 'center' }}>
            Mobile Web App
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px', lineHeight: 1.5, textAlign: 'center' }}>
            On-the-go application review for field staff. Scan QR code:
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            background: '#f9f7f4',
            borderRadius: '16px',
            marginBottom: '20px'
          }}>
            <img 
              src={getQRCodeUrl(DEMO_LINKS.mobile, 160)}
              alt="Scan to open mobile app"
              style={{ width: '160px', height: '160px', borderRadius: '8px' }}
            />
            <p style={{ fontSize: '12px', color: '#888', marginTop: '12px', textAlign: 'center' }}>
              Scan with your phone camera
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <DemoButton href={DEMO_LINKS.mobile} primary>
              <span>Open App</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </DemoButton>
            <DemoButton onClick={() => setActiveModal('mobile')}>
              <span>More Info</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </DemoButton>
          </div>
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

      {/* Marketing Website Modal */}
      <InfoModal 
        isOpen={activeModal === 'marketing'} 
        onClose={() => setActiveModal(null)}
        title="Marketing Website"
      >
        <p style={{ fontSize: '16px', color: '#444', lineHeight: 1.7, marginBottom: '20px' }}>
          We&apos;ve completely redesigned the Optalis public-facing website with a modern, clean, and welcoming aesthetic that reflects your commitment to exceptional patient care.
        </p>
        
        <SectionTitle>What We&apos;ve Built</SectionTitle>
        
        <FeatureItem 
          icon="🎨"
          title="Modern Visual Design"
          description="Clean, professional layout with Optalis brand colors. High-quality imagery, intuitive navigation, and mobile-responsive design that looks beautiful on any device."
        />
        
        <FeatureItem 
          icon="✨"
          title="Enhanced User Experience"
          description="Streamlined navigation with clear calls-to-action. Visitors can easily find care services, locations, and contact information without confusion."
        />
        
        <FeatureItem 
          icon="📱"
          title="Mobile-First Approach"
          description="Fully responsive design optimized for smartphones and tablets. Families researching care options on the go will have a seamless experience."
        />
        
        <FeatureItem 
          icon="⚡"
          title="Fast & Accessible"
          description="Optimized for speed and accessibility compliance. Quick load times and clear typography ensure all visitors can access your information."
        />
        
        <SectionTitle>Key Improvements</SectionTitle>
        
        <ul style={{ paddingLeft: '20px', color: '#555', lineHeight: 1.8 }}>
          <li>Hero section highlighting &quot;Exceptional Care Since 1992&quot;</li>
          <li>Clear service categories (Skilled Nursing, Rehabilitation, etc.)</li>
          <li>Prominent &quot;Find a Location&quot; and &quot;Schedule a Tour&quot; buttons</li>
          <li>Statistics showcasing 30+ care communities and 100+ years leadership</li>
          <li>Modern imagery conveying warmth and professionalism</li>
          <li>Streamlined footer with quick links and contact information</li>
        </ul>
        
        <div style={{ 
          marginTop: '28px', 
          padding: '16px 20px', 
          background: '#f0f9ff', 
          borderRadius: '12px',
          borderLeft: '4px solid #275380'
        }}>
          <p style={{ fontSize: '14px', color: '#275380', margin: 0, fontWeight: 500 }}>
            💡 The redesigned website positions Optalis as a modern, trustworthy healthcare provider while maintaining the warmth and compassion families are looking for.
          </p>
        </div>
      </InfoModal>

      {/* Dashboard Modal */}
      <InfoModal 
        isOpen={activeModal === 'dashboard'} 
        onClose={() => setActiveModal(null)}
        title="Desktop Dashboard"
      >
        <p style={{ fontSize: '16px', color: '#444', lineHeight: 1.7, marginBottom: '20px' }}>
          The Optalis Admissions Dashboard is a <strong>white-labeled AI-powered platform</strong> custom-built specifically for Optalis workflows. Powered by DOKit technology, it automates document intake and processing to save your team hours of manual data entry.
        </p>
        
        <SectionTitle>AI Document Intake</SectionTitle>
        
        <FeatureItem 
          icon="📧"
          title="Dedicated Email Intake"
          description="Forward referral documents to intake@optalis.dokit.ai. Our system automatically processes incoming emails, extracts attachments, and queues them for AI analysis—no manual uploading required."
        />
        
        <FeatureItem 
          icon="📤"
          title="Manual Upload Option"
          description="Drag and drop documents directly into the dashboard. Supports PDFs, images, faxes, and scanned documents in any common format."
        />
        
        <FeatureItem 
          icon="📱"
          title="Mobile Scan & Submit"
          description="Field staff can photograph documents with their phone and submit directly through the mobile app—perfect for intake coordinators on the go."
        />
        
        <SectionTitle>Multi-Step AI Analysis</SectionTitle>
        
        <div style={{ 
          padding: '20px', 
          background: '#f9f7f4', 
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#275380', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>1</div>
            <div>
              <strong>Vision AI Extraction</strong>
              <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>GPT-4 Vision analyzes the document image and extracts all patient data fields</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#275380', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>2</div>
            <div>
              <strong>Confidence Scoring</strong>
              <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>Each extraction receives a confidence score. If below 85%, automatic re-analysis is triggered</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>✓</div>
            <div>
              <strong>Ready for Review</strong>
              <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>High-confidence extractions are queued for human review; flagged items get extra attention</p>
            </div>
          </div>
        </div>
        
        <SectionTitle>Dashboard Features</SectionTitle>
        
        <FeatureItem 
          icon="📊"
          title="Real-Time Analytics"
          description="Track pending reviews, approvals, denials, and approval rates at a glance. Monitor application volume and team productivity."
        />
        
        <FeatureItem 
          icon="👥"
          title="Role-Based Access Control"
          description="Administrators, Managers, and Reviewers each have tailored permissions. Control who can approve, edit, or view sensitive data."
        />
        
        <FeatureItem 
          icon="📝"
          title="Application Management"
          description="View, edit, approve, or deny applications. Side-by-side document viewer shows original document alongside extracted data."
        />
        
        <FeatureItem 
          icon="🔗"
          title="PointClickCare Integration"
          description="One-click sync approved patient data directly to your PointClickCare system—eliminating double data entry."
        />
        
        <FeatureItem 
          icon="📋"
          title="Audit Trail & Reports"
          description="Complete audit log of all actions for compliance. Generate reports on processing times, approval rates, and volume trends."
        />
        
        <SectionTitle>Security & Compliance</SectionTitle>
        
        <FeatureItem 
          icon="🔒"
          title="HIPAA Compliant"
          description="End-to-end encryption, secure authentication, and comprehensive audit logging meet healthcare data protection requirements."
        />
        
        <FeatureItem 
          icon="🗓️"
          title="30-Day Data Retention"
          description="Patient data is retained for 30 days for processing and review, then automatically purged. Export approved records to your systems before retention period ends."
        />
        
        <FeatureItem 
          icon="☁️"
          title="Dedicated Infrastructure"
          description="Your Optalis instance runs on isolated, dedicated infrastructure—not shared with other organizations. Your data stays yours."
        />
        
        <div style={{ 
          marginTop: '28px', 
          padding: '16px 20px', 
          background: '#f0fdf4', 
          borderRadius: '12px',
          borderLeft: '4px solid #16a34a'
        }}>
          <p style={{ fontSize: '14px', color: '#166534', margin: 0, fontWeight: 500 }}>
            ⚡ Average processing time: Under 2 minutes from document receipt to review-ready status
          </p>
        </div>
      </InfoModal>

      {/* Mobile App Modal */}
      <InfoModal 
        isOpen={activeModal === 'mobile'} 
        onClose={() => setActiveModal(null)}
        title="Mobile Web App"
      >
        <p style={{ fontSize: '16px', color: '#444', lineHeight: 1.7, marginBottom: '20px' }}>
          The Optalis Mobile App is a <strong>Progressive Web App (PWA)</strong> that works just like a native iOS or Android app—without requiring app store downloads. Perfect for field staff, intake coordinators on the move, and anyone who needs to review applications away from their desk.
        </p>
        
        <SectionTitle>Native-Like Experience</SectionTitle>
        
        <FeatureItem 
          icon="📲"
          title="Add to Home Screen"
          description="Users can save the app to their phone's home screen and launch it just like any native app. Full-screen experience with no browser chrome."
        />
        
        <FeatureItem 
          icon="⚡"
          title="Instant Access"
          description="No app store downloads, no updates to install. Open the link once, add to home screen, and you're ready to go. Works offline for viewing cached data."
        />
        
        <FeatureItem 
          icon="🎯"
          title="Touch-Optimized Interface"
          description="Large touch targets, swipe gestures, and mobile-first design. Every interaction is optimized for fingertips, not mouse clicks."
        />
        
        <SectionTitle>On-the-Go Features</SectionTitle>
        
        <FeatureItem 
          icon="📥"
          title="Inbox & Review Queues"
          description="New applications appear in the Inbox. Once reviewed or edited, they move to the Review queue. Clear separation keeps work organized."
        />
        
        <FeatureItem 
          icon="✏️"
          title="Full Editing Capabilities"
          description="Edit any field on an application—patient info, diagnoses, medications, allergies, insurance details. Add or remove items from lists."
        />
        
        <FeatureItem 
          icon="📷"
          title="Document Scanning"
          description="Use your phone's camera to scan new documents. Multi-page support for longer referrals. Scanned docs go straight to AI processing."
        />
        
        <FeatureItem 
          icon="✅"
          title="Approve or Deny"
          description="Make decisions right from your phone. Approved applications sync to PointClickCare. Denied applications are logged with reasons."
        />
        
        <SectionTitle>Access & Security</SectionTitle>
        
        <FeatureItem 
          icon="👤"
          title="Role-Based Permissions"
          description="Same permission levels as the desktop dashboard. Reviewers can view and edit; Managers can approve; Admins have full access."
        />
        
        <FeatureItem 
          icon="🔐"
          title="Secure Authentication"
          description="Protected login with the same credentials as the desktop dashboard. Session timeouts for security on shared or lost devices."
        />
        
        <FeatureItem 
          icon="🔔"
          title="Push Notifications"
          description="Get notified when new applications arrive or when items need urgent attention. Stay responsive even when away from your desk."
        />
        
        <SectionTitle>How to Install</SectionTitle>
        
        <div style={{ 
          padding: '20px', 
          background: '#f9f7f4', 
          borderRadius: '12px',
          marginBottom: '12px'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>iPhone / iPad:</p>
          <ol style={{ paddingLeft: '20px', margin: 0, color: '#555', lineHeight: 1.8 }}>
            <li>Open the mobile app link in Safari</li>
            <li>Tap the Share button (square with arrow)</li>
            <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
            <li>Tap &quot;Add&quot; to confirm</li>
          </ol>
        </div>
        
        <div style={{ 
          padding: '20px', 
          background: '#f9f7f4', 
          borderRadius: '12px'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '12px', color: '#1a1a1a' }}>Android:</p>
          <ol style={{ paddingLeft: '20px', margin: 0, color: '#555', lineHeight: 1.8 }}>
            <li>Open the mobile app link in Chrome</li>
            <li>Tap the three-dot menu</li>
            <li>Tap &quot;Add to Home screen&quot;</li>
            <li>Tap &quot;Add&quot; to confirm</li>
          </ol>
        </div>
        
        <div style={{ 
          marginTop: '28px', 
          padding: '16px 20px', 
          background: '#fef3c7', 
          borderRadius: '12px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <p style={{ fontSize: '14px', color: '#92400e', margin: 0, fontWeight: 500 }}>
            📱 Pro tip: Add the app to your home screen for the best experience—it will open full-screen without browser bars!
          </p>
        </div>
      </InfoModal>
    </div>
  );
}
