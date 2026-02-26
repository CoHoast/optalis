'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { 
  MagnifyingGlassIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import '../mobile.css';

// Mock search results
const allApplications = [
  { id: 'APP-2026-001', patientName: 'Margaret Thompson', status: 'pending', facility: 'Beaumont Health', date: 'Today' },
  { id: 'APP-2026-002', patientName: 'Robert Williams', status: 'review', facility: 'Providence Hospital', date: 'Today' },
  { id: 'APP-2026-003', patientName: 'Dorothy Martinez', status: 'approved', facility: 'DMC', date: 'Yesterday' },
  { id: 'APP-2026-004', patientName: 'James Wilson', status: 'pending', facility: 'Henry Ford', date: 'Today' },
  { id: 'APP-2026-005', patientName: 'Mary Johnson', status: 'approved', facility: 'St. John Hospital', date: '2 days ago' },
  { id: 'APP-2026-006', patientName: 'Richard Brown', status: 'denied', facility: 'Beaumont Dearborn', date: '3 days ago' },
  { id: 'APP-2026-007', patientName: 'Patricia Davis', status: 'approved', facility: 'Providence Hospital', date: '1 week ago' },
];

const recentSearches = ['Thompson', 'Medicare', 'Beaumont'];

export default function MobileSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof allApplications>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setHasSearched(true);
    
    if (searchQuery.trim()) {
      const filtered = allApplications.filter(app => 
        app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon className="status-icon approved" />;
      case 'denied': return <XMarkIcon className="status-icon denied" />;
      case 'review': return <ClockIcon className="status-icon review" />;
      default: return <ClockIcon className="status-icon pending" />;
    }
  };

  return (
    <MobileLayout title="Search">
      {/* Search Bar */}
      <div className="mobile-section" style={{ paddingTop: 16 }}>
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search patients, facilities, IDs..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          {query && (
            <button className="search-clear" onClick={clearSearch}>
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Recent Searches */}
      {!hasSearched && (
        <div className="mobile-section">
          <h3 className="search-section-title">Recent Searches</h3>
          <div className="recent-searches">
            {recentSearches.map((term, index) => (
              <button 
                key={index}
                className="recent-search-item"
                onClick={() => handleSearch(term)}
              >
                <ClockIcon className="w-4 h-4" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && (
        <div className="mobile-section">
          <h3 className="search-section-title">
            {results.length} Result{results.length !== 1 ? 's' : ''}
          </h3>
          
          {results.length > 0 ? (
            <div className="search-results">
              {results.map((app) => (
                <button
                  key={app.id}
                  className="search-result-item"
                  onClick={() => router.push(`/mobile/application/${app.id}`)}
                >
                  {getStatusIcon(app.status)}
                  <div className="search-result-info">
                    <span className="search-result-name">{app.patientName}</span>
                    <span className="search-result-meta">
                      <BuildingOffice2Icon className="w-3 h-3" />
                      {app.facility} • {app.date}
                    </span>
                  </div>
                  <span className="search-result-id">{app.id}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mobile-empty" style={{ paddingTop: 40 }}>
              <MagnifyingGlassIcon className="mobile-empty-icon" />
              <h3 className="mobile-empty-title">No results found</h3>
              <p className="mobile-empty-text">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .search-container {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 50px;
          padding: 0 16px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .search-icon {
          width: 20px;
          height: 20px;
          color: #9ca3af;
          flex-shrink: 0;
        }
        
        .search-input {
          flex: 1;
          height: 100%;
          font-size: 17px;
          color: #1a1a1a;
          background: transparent;
          border: none;
          outline: none;
        }
        
        .search-input::placeholder {
          color: #9ca3af;
        }
        
        .search-clear {
          padding: 4px;
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
        }
        
        .search-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 20px 0 12px 0;
        }
        
        .recent-searches {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .recent-search-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        
        .recent-search-item:active {
          background: #f9fafb;
        }
        
        .search-results {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #f3f4f6;
          text-align: left;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        
        .search-result-item:last-child {
          border-bottom: none;
        }
        
        .search-result-item:active {
          background: #f9fafb;
        }
        
        :global(.status-icon) {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
        
        :global(.status-icon.approved) { color: #16a34a; }
        :global(.status-icon.denied) { color: #dc2626; }
        :global(.status-icon.review) { color: #f59e0b; }
        :global(.status-icon.pending) { color: #6b7280; }
        
        .search-result-info {
          flex: 1;
          min-width: 0;
        }
        
        .search-result-name {
          display: block;
          font-size: 16px;
          font-weight: 500;
          color: #1a1a1a;
        }
        
        .search-result-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .search-result-id {
          font-size: 12px;
          color: #9ca3af;
          font-family: monospace;
        }
      `}</style>
    </MobileLayout>
  );
}
