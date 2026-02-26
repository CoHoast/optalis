'use client';

import { useState, useRef, useEffect, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UserIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import './mobile.css';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://optalis-api-production.up.railway.app';

interface Application {
  id: string;
  patient_name: string;
  dob: string;
  phone: string;
  address: string;
  insurance: string;
  policy_number: string;
  diagnosis: string[];
  medications: string[];
  allergies: string[];
  physician: string;
  facility: string;
  services: string[];
  priority: string;
  source: string;
  status: string;
  created_at: string;
  confidence_score: number;
  ai_summary: string;
}

interface SwipeState {
  id: string;
  startX: number;
  currentX: number;
  direction: 'left' | 'right' | null;
}

export default function MobileInbox() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const [showHint, setShowHint] = useState(true);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch applications from API
  const fetchApplications = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    
    try {
      const response = await fetch(`${API_URL}/api/applications?status=pending&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  // Format relative time
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch {
      return dateStr;
    }
  };

  const handleTouchStart = (e: TouchEvent, id: string) => {
    setSwipeState({
      id,
      startX: e.touches[0].clientX,
      currentX: e.touches[0].clientX,
      direction: null,
    });
    setShowHint(false);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!swipeState) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - swipeState.startX;
    const direction = diff > 0 ? 'right' : 'left';
    
    setSwipeState({
      ...swipeState,
      currentX,
      direction: Math.abs(diff) > 20 ? direction : null,
    });
  };

  const handleTouchEnd = () => {
    if (!swipeState) return;
    
    const diff = swipeState.currentX - swipeState.startX;
    const threshold = 100;
    
    if (diff > threshold) {
      // Swipe right - Approve
      handleQuickAction(swipeState.id, 'approved');
    } else if (diff < -threshold) {
      // Swipe left - Deny
      handleQuickAction(swipeState.id, 'denied');
    }
    
    setSwipeState(null);
  };

  const handleQuickAction = async (id: string, action: 'approved' | 'denied') => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    try {
      const response = await fetch(`${API_URL}/api/applications/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: action })
      });
      
      if (response.ok) {
        // Remove from list
        setApplications(prev => prev.filter(app => app.id !== id));
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const getSwipeOffset = (id: string) => {
    if (!swipeState || swipeState.id !== id) return 0;
    const diff = swipeState.currentX - swipeState.startX;
    return Math.max(-100, Math.min(100, diff));
  };

  const openApplication = (id: string) => {
    if (swipeState && Math.abs(swipeState.currentX - swipeState.startX) > 10) {
      return; // Don't navigate if swiping
    }
    router.push(`/mobile/application/${id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <MobileLayout>
        <div className="mobile-section" style={{ paddingTop: 60, textAlign: 'center' }}>
          <div className="scan-processing-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280' }}>Loading applications...</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Section Header */}
      <div className="mobile-section">
        <div className="mobile-section-header">
          <h2 className="mobile-section-title">Pending Review</h2>
          <button 
            className="mobile-section-action"
            onClick={() => fetchApplications(true)}
            disabled={isRefreshing}
          >
            <ArrowPathIcon 
              className={`w-5 h-5 inline mr-1 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="mobile-empty">
          <CheckIcon className="mobile-empty-icon" />
          <h3 className="mobile-empty-title">All caught up!</h3>
          <p className="mobile-empty-text">No pending applications to review.</p>
        </div>
      )}

      {/* Swipe Hint */}
      {showHint && applications.length > 0 && (
        <div className="swipe-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span>Swipe right to approve, left to deny</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      )}

      {/* Applications List */}
      <div className="app-list">
        {applications.map((app) => {
          const offset = getSwipeOffset(app.id);
          const age = calculateAge(app.dob);
          
          return (
            <div key={app.id} className="app-card-container">
              {/* Left action (Approve) */}
              <div 
                className="app-card-actions left"
                style={{ 
                  width: Math.max(0, offset),
                  opacity: Math.min(1, offset / 60)
                }}
              >
                <CheckIcon className="app-card-action-icon" />
              </div>
              
              {/* Right action (Deny) */}
              <div 
                className="app-card-actions right"
                style={{ 
                  width: Math.max(0, -offset),
                  opacity: Math.min(1, -offset / 60)
                }}
              >
                <XMarkIcon className="app-card-action-icon" />
              </div>
              
              {/* Card */}
              <div
                ref={(el) => { cardRefs.current[app.id] = el; }}
                className="app-card"
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={(e) => handleTouchStart(e, app.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => openApplication(app.id)}
              >
                <div className="app-card-header">
                  <h3 className="app-card-patient">{app.patient_name || 'Unknown Patient'}</h3>
                  <span className={`app-card-priority ${app.priority || 'normal'}`}>
                    {app.priority || 'normal'}
                  </span>
                </div>
                
                <div className="app-card-meta">
                  <span className="app-card-meta-item">
                    <UserIcon className="w-4 h-4" />
                    {age ? `${age}` : '?'} • {app.insurance || 'Unknown'}
                  </span>
                  <span className="app-card-meta-item">
                    <BuildingOffice2Icon className="w-4 h-4" />
                    {app.facility || 'Unknown Facility'}
                  </span>
                </div>
                
                <p className="app-card-summary">{app.ai_summary || 'No summary available'}</p>
                
                {/* Confidence Bar */}
                <div className="confidence-bar">
                  <div 
                    className={`confidence-fill ${
                      (app.confidence_score || 0) >= 85 ? 'high' : 
                      (app.confidence_score || 0) >= 70 ? 'medium' : 'low'
                    }`}
                    style={{ width: `${app.confidence_score || 0}%` }}
                  />
                </div>
                <div className="confidence-label">
                  <span>AI Confidence</span>
                  <span>{app.confidence_score || 0}%</span>
                </div>
                
                <div className="app-card-footer">
                  <span className="app-card-source">{app.source || 'Unknown'}</span>
                  <span className="app-card-time">
                    <ClockIcon className="w-3 h-3 inline mr-1" />
                    {formatTime(app.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </MobileLayout>
  );
}
