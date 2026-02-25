'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/StatusBadge';
import { mockApplications } from '@/lib/mock-data';

type TimeFilter = 'today' | 'week' | 'month' | 'all';

export default function DecisionsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  // Filter applications that have been decided (not pending)
  const decidedApplications = mockApplications.filter(
    app => app.status !== 'pending'
  );

  const stats = {
    approved: decidedApplications.filter(a => a.status === 'approved').length,
    denied: decidedApplications.filter(a => a.status === 'denied').length,
    review: decidedApplications.filter(a => a.status === 'review').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Decisions</h1>
        <p className="text-gray-500 mt-1">Review past application decisions and outcomes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-3xl font-serif text-green-900">{stats.approved}</p>
              <p className="text-sm text-green-700">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-3xl font-serif text-red-900">{stats.denied}</p>
              <p className="text-sm text-red-700">Denied</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-3xl font-serif text-blue-900">{stats.review}</p>
              <p className="text-sm text-blue-700">Under Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-4">
        <CalendarIcon className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                timeFilter === filter
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? 'All Time' : `This ${filter}`}
            </button>
          ))}
        </div>
      </div>

      {/* Decisions List */}
      <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {decidedApplications.map((app) => (
            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-cream/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                app.status === 'approved' ? 'bg-green-100' :
                app.status === 'denied' ? 'bg-red-100' :
                'bg-blue-100'
              }`}>
                {app.status === 'approved' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                {app.status === 'denied' && <XCircleIcon className="w-5 h-5 text-red-600" />}
                {app.status === 'review' && <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{app.patientName}</p>
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

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Report
        </button>
      </div>
    </div>
  );
}
