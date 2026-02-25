'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f9f7f4' }}>
      {/* Mobile Header - Shows only on mobile */}
      <div className="mobile-login-header" style={{
        display: 'none',
        background: 'linear-gradient(135deg, #275380 0%, #1e3f61 100%)',
        padding: '40px 24px',
        textAlign: 'center'
      }}>
        <img 
          src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" 
          alt="Optalis" 
          style={{ height: '40px', marginBottom: '16px', filter: 'brightness(0) invert(1)' }}
        />
        <h1 style={{ 
          fontFamily: 'Cormorant Garamond, serif', 
          fontSize: '24px', 
          color: 'white', 
          marginBottom: '8px',
          fontWeight: 600
        }}>
          Admissions Portal
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
          Streamline patient admissions
        </p>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Panel - Hidden on mobile */}
        <div className="desktop-panel" style={{ 
          width: '50%', 
          background: 'linear-gradient(135deg, #275380 0%, #1e3f61 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 10, padding: '64px', maxWidth: '500px' }}>
            <img 
              src="https://www.optalishealthcare.com/wp-content/uploads/2023/03/optalis_logonav.webp" 
              alt="Optalis" 
              style={{ height: '56px', marginBottom: '32px', filter: 'brightness(0) invert(1)' }}
            />
            <h1 style={{ 
              fontFamily: 'Cormorant Garamond, serif', 
              fontSize: '42px', 
              color: 'white', 
              marginBottom: '16px',
              fontWeight: 600
            }}>
              Admissions Portal
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              Streamline patient admissions with intelligent document processing and workflow management.
            </p>
            
            <div style={{ marginTop: '48px' }}>
              {['AI-powered document extraction', 'Real-time application tracking', 'Seamless CRM integration'].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Decorative circles */}
          <div style={{ position: 'absolute', bottom: '-120px', right: '-120px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-form-panel" style={{ 
          width: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '32px',
          flex: 1
        }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', marginBottom: '8px' }}>Welcome back</h2>
              <p style={{ color: '#666', marginBottom: '32px' }}>Sign in to access the admissions dashboard</p>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="jennifer.walsh@optalis.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#333' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    defaultValue="demo123"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#666' }}>
                    <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
                    Remember me
                  </label>
                  <a href="#" style={{ fontSize: '14px', color: '#275380', textDecoration: 'none' }}>Forgot password?</a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#275380',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    opacity: isLoading ? 0.7 : 1
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#888' }}>
                Need help? Contact <a href="mailto:support@optalis.com" style={{ color: '#275380' }}>IT Support</a>
              </p>
            </div>

            <p style={{ marginTop: '32px', textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
              © 2026 Optalis Healthcare. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .desktop-panel {
            display: none !important;
          }
          .login-form-panel {
            width: 100% !important;
          }
          .mobile-login-header {
            display: block !important;
          }
        }
        
        @media (max-width: 480px) {
          .login-form-panel {
            padding: 16px !important;
          }
          .login-form-panel > div > div {
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
