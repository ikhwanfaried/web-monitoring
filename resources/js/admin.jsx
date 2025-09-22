import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminDashboard from './components/AdminDashboard';

// Get user data from sessionStorage or redirect to login
const getUserData = () => {
    try {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            console.log('Admin user data found:', user);
            return user;
        }
    } catch (error) {
        console.error('Error parsing admin user data:', error);
    }
    
    // If no user data, redirect to login
    console.log('No admin user data found, redirecting to login');
    window.location.href = '/';
    return null;
};

// Mount the Admin component
const container = document.getElementById('admin-app');
if (container) {
    const userData = getUserData();
    if (userData) {
        const root = createRoot(container);
        root.render(<AdminDashboard user={userData} />);
    }
} else {
    console.error('Admin app container not found');
}