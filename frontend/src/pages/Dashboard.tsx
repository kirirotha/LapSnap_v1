import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to LapSnap Race Timing System</p>
      <div style={{ marginTop: '2rem' }}>
        <h3>System Status</h3>
        <p>✅ Frontend Running</p>
        <p>✅ Backend API Connected</p>
        <p>⚠️ Redis Cache Disabled (using in-memory)</p>
      </div>
    </div>
  );
};
