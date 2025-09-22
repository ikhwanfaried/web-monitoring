import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import WebMonitoringApp from './components/WebMonitoringApp';

// Mount the SuperAdmin component
const container = document.getElementById('superadmin-app');
if (container) {
    const root = createRoot(container);
    root.render(<WebMonitoringApp />);
} else {
    console.error('SuperAdmin app container not found');
}