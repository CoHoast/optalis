'use client';

import { useState } from 'react';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon,
  BuildingOffice2Icon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    newApplications: true,
    decisions: true,
    reviews: true,
    email: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and application preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <UserIcon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-semibold">
              JW
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Jennifer Walsh</h3>
              <p className="text-gray-500">Admissions Director</p>
              <p className="text-sm text-gray-400">jennifer.walsh@optalis.com</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="Jennifer Walsh"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="jennifer.walsh@optalis.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="(248) 555-0100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                defaultValue="Admissions Director"
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
          <button className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <BellIcon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">New Applications</p>
              <p className="text-sm text-gray-500">Get notified when new applications arrive</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, newApplications: !n.newApplications }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.newApplications ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                notifications.newApplications ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Decision Updates</p>
              <p className="text-sm text-gray-500">Notifications for application decisions</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, decisions: !n.decisions }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.decisions ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                notifications.decisions ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Review Reminders</p>
              <p className="text-sm text-gray-500">Reminders for applications needing review</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, reviews: !n.reviews }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.reviews ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                notifications.reviews ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.email ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                notifications.email ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Facility Preferences */}
      <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <BuildingOffice2Icon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900">Facility Preferences</h2>
        </div>
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Facility View</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option>All Facilities</option>
              <option>Cranberry Park Locations</option>
              <option>Optalis Locations</option>
              <option>Michigan Only</option>
              <option>Ohio Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          <button className="text-primary hover:underline text-sm">Change Password</button>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Last login: Today at 2:34 PM from 192.168.1.xxx</p>
          </div>
        </div>
      </div>
    </div>
  );
}
