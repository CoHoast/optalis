'use client';

import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  ClockIcon,
  BuildingOffice2Icon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import '../mobile.css';

// Mock data - applications in review status
const reviewApplications = [
  {
    id: 'APP-2026-002',
    patientName: 'Robert Williams',
    age: 87,
    gender: 'M',
    insurance: 'Medicare Advantage',
    facility: 'Providence Hospital',
    priority: 'medium',
    assignedTo: 'You',
    reviewStarted: '1 hour ago',
    confidence: 91,
    summary: 'Long-term care placement. Requires assistance with ADLs and mobility. Awaiting family decision.',
    status: 'awaiting_info',
    statusLabel: 'Awaiting Family Response',
  },
  {
    id: 'APP-2026-003',
    patientName: 'Helen Garcia',
    age: 79,
    gender: 'F',
    insurance: 'Medicaid',
    facility: 'St. John Hospital',
    priority: 'high',
    assignedTo: 'You',
    reviewStarted: '3 hours ago',
    confidence: 85,
    summary: 'Post-stroke rehabilitation. Needs speech therapy evaluation before final approval.',
    status: 'pending_eval',
    statusLabel: 'Pending Evaluation',
  },
  {
    id: 'APP-2026-007',
    patientName: 'William Chen',
    age: 72,
    gender: 'M',
    insurance: 'Blue Cross',
    facility: 'Beaumont Dearborn',
    priority: 'normal',
    assignedTo: 'You',
    reviewStarted: '5 hours ago',
    confidence: 94,
    summary: 'Cardiac rehabilitation following bypass surgery. Insurance verification in progress.',
    status: 'verifying_insurance',
    statusLabel: 'Verifying Insurance',
  },
];

export default function MobileReview() {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting_info': return '#f59e0b';
      case 'pending_eval': return '#8b5cf6';
      case 'verifying_insurance': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <MobileLayout>
      {/* Section Header */}
      <div className="mobile-section">
        <div className="mobile-section-header">
          <h2 className="mobile-section-title">In Review</h2>
          <span style={{ fontSize: 14, color: '#6b7280' }}>
            {reviewApplications.length} applications
          </span>
        </div>
      </div>

      {/* Applications List */}
      <div className="app-list">
        {reviewApplications.map((app) => (
          <div 
            key={app.id} 
            className="app-card-container"
            onClick={() => router.push(`/mobile/application/${app.id}`)}
          >
            <div className="app-card" style={{ cursor: 'pointer' }}>
              {/* Status Badge */}
              <div 
                className="review-status-badge"
                style={{ 
                  background: `${getStatusColor(app.status)}15`,
                  color: getStatusColor(app.status),
                }}
              >
                <ClockIcon className="w-3 h-3" />
                {app.statusLabel}
              </div>
              
              <div className="app-card-header" style={{ marginTop: 10 }}>
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
              
              <div className="app-card-footer">
                <span className="app-card-source">Review started {app.reviewStarted}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reviewApplications.length === 0 && (
        <div className="mobile-empty">
          <CheckCircleIcon className="mobile-empty-icon" />
          <h3 className="mobile-empty-title">All caught up!</h3>
          <p className="mobile-empty-text">No applications currently in review.</p>
        </div>
      )}

      <style jsx>{`
        .review-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
        }
      `}</style>
    </MobileLayout>
  );
}
