import React, { useState } from 'react';
import { ScanTest } from '../components/ScanTest';

export const Races: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'races' | 'scan'>('races');

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #ddd' }}>
          <button
            onClick={() => setActiveTab('races')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'races' ? '3px solid #007bff' : 'none',
              color: activeTab === 'races' ? '#007bff' : '#666',
              fontWeight: activeTab === 'races' ? 600 : 400,
              cursor: 'pointer'
            }}
          >
            Race Management
          </button>
        </div>
      </div>

      {activeTab === 'races' ? (
        <div>
          <h2>Race Management</h2>
          <p>Manage your races and events here</p>
          <button style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
            + Create New Race
          </button>
        </div>
      ) : (
        <h2>Add Other race stuff here</h2>
      )}
    </div>
  );
};
