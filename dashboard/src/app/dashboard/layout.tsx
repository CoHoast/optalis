'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { filterNavigation, canAccess, getRoleDisplayName, demoUsers, UserRole } from '@/lib/permissions';

const navigationGroups = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ]
  },
  {
    name: 'Admissions',
    items: [
      { name: 'Applications', href: '/dashboard/applications', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
      { name: 'Decisions', href: '/dashboard/decisions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    ]
  },
  {
    name: 'Analytics',
    items: [
      { name: 'Reports', href: '/dashboard/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { name: 'Audit Log', href: '/dashboard/audit-log', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ]
  },
  {
    name: 'Configuration',
    items: [
      { name: 'Integrations', href: '/dashboard/integrations', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { name: 'Team', href: '/dashboard/team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { name: 'Security', href: '/dashboard/security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ]
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, switchUser, isLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  // Filter navigation based on user role
  const filteredNavigation = user 
    ? filterNavigation(navigationGroups, user.role)
    : navigationGroups;

  // Redirect if user doesn't have access to current page
  useEffect(() => {
    if (!isLoading && user && !canAccess(user.role, pathname)) {
      // Redirect to first accessible page
      const firstAccessiblePage = filteredNavigation[0]?.items[0]?.href || '/dashboard/applications';
      router.push(firstAccessiblePage);
    }
  }, [pathname, user, isLoading, filteredNavigation, router]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ 
            width: 40, 
            height: 40, 
            border: '3px solid #e5e7eb', 
            borderTopColor: '#275380', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Header */}
      <div className="mobile-header">
        <img src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" alt="Optalis" />
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="#275380" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" alt="Optalis" />
            <button 
              onClick={closeSidebar}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              className="mobile-close-btn"
            >
              <svg width="24" height="24" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <p>Admissions Portal</p>
        </div>
        
        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredNavigation.map((group) => (
            <div key={group.name}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                color: '#9ca3af', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                padding: '0 16px',
                marginBottom: '8px'
              }}>
                {group.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      className={isActive ? 'active' : ''}
                      onClick={closeSidebar}
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d={item.icon} />
                      </svg>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* User Section with Role Switcher */}
        <div className="sidebar-user">
          <div 
            className="sidebar-user-info" 
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="sidebar-avatar">{user?.initials || 'U'}</div>
            <div style={{ flex: 1 }}>
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{user ? getRoleDisplayName(user.role) : 'Loading...'}</div>
            </div>
            <svg 
              width="16" 
              height="16" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
              style={{ 
                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 16,
              right: 16,
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
              marginBottom: 8,
              overflow: 'hidden',
              zIndex: 100,
            }}>
              <div style={{ 
                padding: '12px 16px', 
                fontSize: 11, 
                fontWeight: 600, 
                color: '#9ca3af', 
                textTransform: 'uppercase',
                borderBottom: '1px solid #f3f4f6'
              }}>
                Switch User (Demo)
              </div>
              {Object.values(demoUsers).map((demoUser) => (
                <button
                  key={demoUser.email}
                  onClick={() => {
                    switchUser(demoUser.email);
                    setShowUserMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: user?.email === demoUser.email ? '#f0f7ff' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: user?.email === demoUser.email ? '#275380' : '#e5e7eb',
                    color: user?.email === demoUser.email ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {demoUser.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>
                      {demoUser.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {getRoleDisplayName(demoUser.role)}
                    </div>
                  </div>
                  {user?.email === demoUser.email && (
                    <svg 
                      width="16" 
                      height="16" 
                      fill="none" 
                      stroke="#275380" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                      style={{ marginLeft: 'auto' }}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
          
          <Link href="/" onClick={closeSidebar} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', marginTop: '8px', color: '#666', textDecoration: 'none', fontSize: '14px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sign Out
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {children}

      <style jsx global>{`
        @media (max-width: 1024px) {
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
