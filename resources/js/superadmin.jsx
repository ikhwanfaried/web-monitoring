import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import WebMonitoringApp from './components/WebMonitoringApp';

// Get user data from sessionStorage or redirect to login
const getUserData = () => {
    try {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            console.log('SuperAdmin user data found:', user);
            return user;
        }
    } catch (error) {
        console.error('Error parsing superadmin user data:', error);
    }
    
    // If no user data, redirect to login
    console.log('No superadmin user data found, redirecting to login');
    window.location.href = '/';
    return null;
};

// Mount the SuperAdmin component
const container = document.getElementById('superadmin-app');
if (container) {
    const userData = getUserData();
    if (userData) {
        const root = createRoot(container);
        root.render(<WebMonitoringApp />);
    }
} else {
    console.error('SuperAdmin app container not found');
}