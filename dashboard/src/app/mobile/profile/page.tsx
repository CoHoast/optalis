'use client';

import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  BellIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import '../mobile.css';

export default function MobileProfile() {
  const router = useRouter();

  const handleSignOut = () => {
    // TODO: Sign out logic
    router.push('/');
  };

  const handleSwitchToDesktop = () => {
    router.push('/dashboard');
  };

  const menuItems = [
    {
      icon: BellIcon,
      label: 'Notifications',
      value: 'On',
      onClick: () => {},
    },
    {
      icon: ComputerDesktopIcon,
      label: 'Switch to Desktop',
      onClick: handleSwitchToDesktop,
    },
    {
      icon: ShieldCheckIcon,
      label: 'Security',
      onClick: () => {},
    },
    {
      icon: QuestionMarkCircleIcon,
      label: 'Help & Support',
      onClick: () => {},
    },
  ];

  return (
    <MobileLayout title="Profile">
      {/* User Card */}
      <div className="mobile-section" style={{ paddingTop: 20 }}>
        <div className="profile-card">
          <div className="profile-avatar">JW</div>
          <div className="profile-info">
            <h2 className="profile-name">Jennifer Walsh</h2>
            <p className="profile-role">Admissions Director</p>
            <p className="profile-location">Dublin, OH</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mobile-section">
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-value">47</span>
            <span className="profile-stat-label">Reviewed Today</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">94%</span>
            <span className="profile-stat-label">Approval Rate</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-value">2.3m</span>
            <span className="profile-stat-label">Avg Review Time</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="mobile-section" style={{ marginTop: 24 }}>
        <div className="profile-menu">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              className="profile-menu-item"
              onClick={item.onClick}
            >
              <item.icon className="profile-menu-icon" />
              <span className="profile-menu-label">{item.label}</span>
              {item.value ? (
                <span className="profile-menu-value">{item.value}</span>
              ) : (
                <ChevronRightIcon className="profile-menu-arrow" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <div className="mobile-section" style={{ marginTop: 24, paddingBottom: 120 }}>
        <button className="sign-out-btn" onClick={handleSignOut}>
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* App Version */}
      <div className="app-version">
        Optalis Mobile v1.0.0
      </div>

      <style jsx>{`
        .profile-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #275380 0%, #1e3f61 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
          color: white;
        }
        
        .profile-info {
          flex: 1;
        }
        
        .profile-name {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }
        
        .profile-role {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 2px 0;
        }
        
        .profile-location {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
        }
        
        .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
        }
        
        .profile-stat {
          background: white;
          border-radius: 12px;
          padding: 16px 12px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .profile-stat-value {
          display: block;
          font-size: 22px;
          font-weight: 700;
          color: #275380;
          margin-bottom: 4px;
        }
        
        .profile-stat-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .profile-menu {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #f3f4f6;
          text-align: left;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        
        .profile-menu-item:last-child {
          border-bottom: none;
        }
        
        .profile-menu-item:active {
          background: #f9fafb;
        }
        
        .profile-menu-icon {
          width: 22px;
          height: 22px;
          color: #6b7280;
        }
        
        .profile-menu-label {
          flex: 1;
          font-size: 16px;
          color: #1a1a1a;
        }
        
        .profile-menu-value {
          font-size: 14px;
          color: #9ca3af;
        }
        
        .profile-menu-arrow {
          width: 18px;
          height: 18px;
          color: #d1d5db;
        }
        
        .sign-out-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: white;
          border: 1px solid #fecaca;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          color: #dc2626;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        
        .sign-out-btn:active {
          background: #fef2f2;
        }
        
        .app-version {
          position: fixed;
          bottom: calc(100px + env(safe-area-inset-bottom));
          left: 0;
          right: 0;
          text-align: center;
          font-size: 12px;
          color: #d1d5db;
        }
      `}</style>
    </MobileLayout>
  );
}
