'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  DocumentArrowDownIcon,
  UserIcon,
  BuildingOffice2Icon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import StatusBadge from '@/components/StatusBadge';
import { mockApplications, ApplicationStatus } from '@/lib/mock-data';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<ApplicationStatus | null>(null);
  const [notes, setNotes] = useState('');

  const application = mockApplications.find(app => app.id === params.id);

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <Link href="/dashboard/applications" className="text-primary hover:underline mt-4 inline-block">
          Back to applications
        </Link>
      </div>
    );
  }

  const handleDecision = (newDecision: ApplicationStatus) => {
    setDecision(newDecision);
    setShowDecisionModal(true);
  };

  const submitDecision = () => {
    alert(`Decision: ${decision}\nNotes: ${notes}\n\nThis would update the application status.`);
    setShowDecisionModal(false);
    router.push('/dashboard/applications');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/applications"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif text-gray-900">{application.patientName}</h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="text-gray-500 mt-1">{application.id} • {application.facilityRequested}</p>
          </div>
        </div>
        
        {(application.status === 'pending' || application.status === 'review') && (
          <div className="flex gap-2">
            <button
              onClick={() => handleDecision('approved')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Approve
            </button>
            <button
              onClick={() => handleDecision('denied')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
              Deny
            </button>
            <button
              onClick={() => handleDecision('review')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
              Review
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {application.extractedData && (
            <>
              {/* AI Confidence */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AI Data Extraction</p>
                    <p className="text-sm text-gray-500">Confidence: {application.extractedData.confidence}%</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  {isEditing ? 'Done' : 'Edit'}
                </button>
              </div>

              {/* Patient Info */}
              <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-gray-900">Patient Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-gray-900">{application.extractedData.patientInfo.firstName} {application.extractedData.patientInfo.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                    <p className="text-gray-900">{new Date(application.extractedData.patientInfo.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-900">{application.extractedData.patientInfo.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Preferred Admit Date</label>
                    <p className="text-gray-900">{new Date(application.extractedData.preferredAdmitDate).toLocaleDateString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                    <p className="text-gray-900">{application.extractedData.patientInfo.address}</p>
                  </div>
                </div>
              </div>

              {/* Insurance Info */}
              <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-gray-900">Insurance Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Primary Insurance</label>
                    <p className="text-gray-900">{application.extractedData.insuranceInfo.primary}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Policy Number</label>
                    <p className="text-gray-900">{application.extractedData.insuranceInfo.policyNumber}</p>
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <HeartIcon className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-gray-900">Medical Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Diagnosis</label>
                    <div className="flex flex-wrap gap-2">
                      {application.extractedData.medicalInfo.diagnosis.map((d, i) => (
                        <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Medications</label>
                    <div className="flex flex-wrap gap-2">
                      {application.extractedData.medicalInfo.medications.map((m, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Allergies</label>
                    <div className="flex flex-wrap gap-2">
                      {application.extractedData.medicalInfo.allergies.map((a, i) => (
                        <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Referring Physician</label>
                    <p className="text-gray-900">{application.extractedData.medicalInfo.physician}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Requested Services</label>
                    <div className="flex flex-wrap gap-2">
                      {application.extractedData.requestedServices.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-soft-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Application Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Submitted</span>
                <span className="text-gray-900">{new Date(application.submittedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="text-gray-900 capitalize">{application.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Priority</span>
                <span className={application.priority === 'high' ? 'text-red-600 font-medium' : 'text-gray-900'}>{application.priority}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <DocumentTextIcon className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-gray-900">Documents ({application.documents.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {application.documents.map((doc) => (
                <div key={doc.id} className="px-6 py-3 flex items-center justify-between hover:bg-cream/50">
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{doc.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{doc.type}</p>
                    </div>
                  </div>
                  <DocumentArrowDownIcon className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
            {application.notes ? (
              <p className="text-gray-700 text-sm">{application.notes}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">No notes</p>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              {decision === 'approved' && 'Approve Application'}
              {decision === 'denied' && 'Deny Application'}
              {decision === 'review' && 'Mark for Review'}
            </h3>
            <p className="text-gray-500 mb-6">
              {decision === 'approved' && 'This will approve the application and notify the patient.'}
              {decision === 'denied' && 'Please provide a reason for denial.'}
              {decision === 'review' && 'This will mark the application for additional review.'}
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none mb-6"
              placeholder={decision === 'denied' ? 'Reason for denial...' : 'Notes (optional)...'}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDecisionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                disabled={decision === 'denied' && !notes}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  decision === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                  decision === 'denied' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
