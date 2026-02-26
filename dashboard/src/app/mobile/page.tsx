'use client';

import { useState, useRef, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  CheckIcon, 
  XMarkIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UserIcon,
} from '@heroicons/react/24/outline';
import './mobile.css';

// Mock data - would come from API
const applications = [
  {
    id: 'APP-2026-001',
    patientName: 'Margaret Thompson',
    age: 83,
    gender: 'F',
    insurance: 'Medicare',
    diagnosis: ['Dementia', 'Hypertension', 'Diabetes'],
    physician: 'Dr. Sarah Chen',
    facility: 'Beaumont Health',
    priority: 'high',
    source: 'Hospital Referral',
    createdAt: '2 hours ago',
    confidence: 95,
    summary: 'Post-acute rehabilitation following hip replacement surgery. Patient requires PT/OT and skilled nursing care.',
  },
  {
    id: 'APP-2026-004',
    patientName: 'James Wilson',
    age: 76,
    gender: 'M',
    insurance: 'Blue Cross',
    diagnosis: ['COPD', 'CHF'],
    physician: 'Dr. Michael Brown',
    facility: 'Henry Ford Hospital',
    priority: 'high',
    source: 'Email',
    createdAt: '3 hours ago',
    confidence: 88,
    summary: 'Respiratory therapy and cardiac rehabilitation needed. Patient on supplemental oxygen.',
  },
  {
    id: 'APP-2026-005',
    patientName: 'Dorothy Martinez',
    age: 80,
    gender: 'F',
    insurance: 'Medicaid',
    diagnosis: ['Stroke', 'Dysphagia'],
    physician: 'Dr. Lisa Park',
    facility: 'DMC',
    priority: 'medium',
    source: 'Fax',
    createdAt: '5 hours ago',
    confidence: 72,
    summary: 'Speech therapy and swallowing evaluation required. Left-sided weakness.',
  },
  {
    id: 'APP-2026-006',
    patientName: 'Robert Williams',
    age: 87,
    gender: 'M',
    insurance: 'Medicare Advantage',
    diagnosis: ['Parkinson\'s', 'Falls risk'],
    physician: 'Dr. James Lee',
    facility: 'Providence Hospital',
    priority: 'normal',
    source: 'Website',
    createdAt: '1 day ago',
    confidence: 91,
    summary: 'Long-term care placement. Requires assistance with ADLs and mobility.',
  },
];

interface SwipeState {
  id: string;
  startX: number;
  currentX: number;
  direction: 'left' | 'right' | null;
}

export default function MobileInbox() {
  const router = useRouter();
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const [showHint, setShowHint] = useState(true);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
      handleQuickAction(swipeState.id, 'approve');
    } else if (diff < -threshold) {
      // Swipe left - Deny
      handleQuickAction(swipeState.id, 'deny');
    }
    
    setSwipeState(null);
  };

  const handleQuickAction = (id: string, action: 'approve' | 'deny') => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    console.log(`${action} application ${id}`);
    // TODO: API call to update status
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

  return (
    <MobileLayout>
      {/* Section Header */}
      <div className="mobile-section">
        <div className="mobile-section-header">
          <h2 className="mobile-section-title">Pending Review</h2>
          <button className="mobile-section-action">Filter</button>
        </div>
      </div>

      {/* Swipe Hint */}
      {showHint && (
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
          const showApprove = offset > 30;
          const showDeny = offset < -30;
          
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
                  <h3 className="app-card-patient">{app.patientName}</h3>
                  <span className={`app-card-priority ${app.priority}`}>
                    {app.priority}
                  </span>
                </div>
                
                <div className="app-card-meta">
                  <span className="app-card-meta-item">
                    <UserIcon className="w-4 h-4" />
                    {app.age}{app.gender} • {app.insurance}
                  </span>
                  <span className="app-card-meta-item">
                    <BuildingOffice2Icon className="w-4 h-4" />
                    {app.facility}
                  </span>
                </div>
                
                <p className="app-card-summary">{app.summary}</p>
                
                {/* Confidence Bar */}
                <div className="confidence-bar">
                  <div 
                    className={`confidence-fill ${
                      app.confidence >= 85 ? 'high' : 
                      app.confidence >= 70 ? 'medium' : 'low'
                    }`}
                    style={{ width: `${app.confidence}%` }}
                  />
                </div>
                <div className="confidence-label">
                  <span>AI Confidence</span>
                  <span>{app.confidence}%</span>
                </div>
                
                <div className="app-card-footer">
                  <span className="app-card-source">{app.source}</span>
                  <span className="app-card-time">
                    <ClockIcon className="w-3 h-3 inline mr-1" />
                    {app.createdAt}
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
