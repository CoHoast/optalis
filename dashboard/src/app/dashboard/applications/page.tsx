'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PlusIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/StatusBadge';
import { mockApplications, facilities, ApplicationStatus } from '@/lib/mock-data';

const statusFilters: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Denied', value: 'denied' },
  { label: 'Review', value: 'review' },
];

const priorityColors = {
  high: 'bg-red-500',
  normal: 'bg-gray-400',
  low: 'bg-gray-300',
};

export default function ApplicationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.patientName.toLowerCase().includes(search.toLowerCase()) ||
                         app.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesFacility = facilityFilter === 'all' || app.facilityRequested === facilityFilter;
    return matchesSearch && matchesStatus && matchesFacility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Applications</h1>
          <p className="text-gray-500 mt-1">{filteredApplications.length} applications found</p>
        </div>
        <Link
          href="/dashboard/applications/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Facility Filter */}
          <select
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
          >
            <option value="all">All Facilities</option>
            {facilities.map((facility) => (
              <option key={facility} value={facility}>{facility}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
        {/* Table Header - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
          <div className="col-span-3">Patient</div>
          <div className="col-span-3">Facility</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-2">Submitted</div>
        </div>

        {/* Applications */}
        <div className="divide-y divide-gray-100">
          {filteredApplications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentArrowUpIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No applications found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/applications/${app.id}`}
                className="block hover:bg-cream/50 transition-colors"
              >
                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${priorityColors[app.priority]}`} />
                    <div>
                      <p className="font-medium text-gray-900">{app.patientName}</p>
                      <p className="text-sm text-gray-500">{app.id}</p>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="text-gray-900 truncate">{app.facilityRequested}</p>
                  </div>
                  <div className="col-span-2">
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                      {app.source}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${priorityColors[app.priority]}`} />
                      <div>
                        <p className="font-medium text-gray-900">{app.patientName}</p>
                        <p className="text-sm text-gray-500">{app.facilityRequested}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <span>{app.id}</span>
                    <span>{new Date(app.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
