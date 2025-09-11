import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WebMonitoringApp from './components/WebMonitoringApp';
import LoginPage from './components/LoginPage';
import AddUserPage from './components/AddUserPage';
import '../css/app.css';

const App = () => {
    const [user, setUser] = useState(null);

    if (!user) {
        return <LoginPage onLogin={setUser} />;
    }
    return <WebMonitoringApp user={user} />;
};

// Mount React app ke element dengan id 'app' atau 'add-user-root'
const appContainer = document.getElementById('app');
const addUserContainer = document.getElementById('add-user-root');

console.log('App containers found:', { 
    appContainer: !!appContainer, 
    addUserContainer: !!addUserContainer 
});

if (addUserContainer) {
    console.log('Mounting AddUserPage');
    try {
        const root = createRoot(addUserContainer);
        root.render(<AddUserPage />);
        console.log('AddUserPage mounted successfully');
    } catch (error) {
        console.error('Error mounting AddUserPage:', error);
    }
} else if (appContainer) {
    console.log('Mounting main App');
    try {
        const root = createRoot(appContainer);
        root.render(<App />);
        console.log('Main App mounted successfully');
    } catch (error) {
        console.error('Error mounting main App:', error);
    }
} else {
    console.error('No container element found');
}
