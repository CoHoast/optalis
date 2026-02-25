'use client';

import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { mockApplications, dashboardStats } from '@/lib/mock-data';
import Link from 'next/link';

export default function DashboardPage() {
  const recentApplications = mockApplications.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Jennifer. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Review"
          value={dashboardStats.today.pending}
          change="+2 from yesterday"
          changeType="neutral"
          icon={<ClockIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Approved Today"
          value={dashboardStats.today.approved}
          change="On track"
          changeType="increase"
          icon={<CheckCircleIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Needs Review"
          value={dashboardStats.today.review}
          change="1 urgent"
          changeType="decrease"
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
        />
        <StatCard
          title="Approval Rate"
          value={dashboardStats.approvalRate}
          change="This week"
          changeType="increase"
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/dashboard/applications?status=pending"
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:bg-yellow-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-200 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="font-medium text-yellow-900">3 Pending</p>
              <p className="text-sm text-yellow-700">Awaiting review</p>
            </div>
          </div>
        </Link>
        <Link 
          href="/dashboard/applications?status=review"
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="font-medium text-blue-900">1 Needs Review</p>
              <p className="text-sm text-blue-700">Insurance verification</p>
            </div>
          </div>
        </Link>
        <Link 
          href="/dashboard/applications/new"
          className="bg-primary/5 border border-primary/20 rounded-xl p-4 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary">New Application</p>
              <p className="text-sm text-primary/70">Upload documents</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link href="/dashboard/applications" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentApplications.map((app) => (
            <Link 
              key={app.id} 
              href={`/dashboard/applications/${app.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-cream/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {app.patientName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{app.patientName}</p>
                <p className="text-sm text-gray-500 truncate">{app.facilityRequested}</p>
              </div>
              <div className="hidden sm:block text-right">
                <StatusBadge status={app.status} />
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(app.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Feed & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-soft-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Dorothy Martinez application <span className="font-medium text-green-600">approved</span></p>
                <p className="text-xs text-gray-500">2 hours ago by Jennifer Walsh</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">New application received for <span className="font-medium">Margaret Thompson</span></p>
                <p className="text-xs text-gray-500">3 hours ago via email</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Robert Williams marked for <span className="font-medium text-yellow-600">review</span></p>
                <p className="text-xs text-gray-500">5 hours ago - Insurance verification needed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircleIcon className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900">Harold Johnson application <span className="font-medium text-red-600">denied</span></p>
                <p className="text-xs text-gray-500">Yesterday - Does not meet criteria</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl shadow-soft-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week's Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Applications Processed</span>
                <span className="font-medium">{dashboardStats.week.approved + dashboardStats.week.denied + dashboardStats.week.review}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Average Processing Time</span>
                <span className="font-medium">{dashboardStats.avgProcessingTime}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Approval Rate</span>
                <span className="font-medium">{dashboardStats.approvalRate}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 mt-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-serif text-gray-900">{dashboardStats.week.pending}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-green-600">{dashboardStats.week.approved}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-red-600">{dashboardStats.week.denied}</p>
                  <p className="text-xs text-gray-500">Denied</p>
                </div>
                <div>
                  <p className="text-2xl font-serif text-blue-600">{dashboardStats.week.review}</p>
                  <p className="text-xs text-gray-500">Review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
