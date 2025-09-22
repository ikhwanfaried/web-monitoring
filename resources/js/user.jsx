import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import UserDashboard from './components/UserDashboard';

// Get user data from sessionStorage or redirect to login
const getUserData = () => {
    try {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            console.log('User data found:', user);
            return user;
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
    
    // If no user data, redirect to login
    console.log('No user data found, redirecting to login');
    window.location.href = '/';
    return null;
};

// Mount the User component
const container = document.getElementById('user-app');
if (container) {
    const userData = getUserData();
    if (userData) {
        const root = createRoot(container);
        root.render(<UserDashboard user={userData} />);
    }
} else {
    console.error('User app container not found');
}