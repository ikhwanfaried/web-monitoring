import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WebMonitoringApp from './components/WebMonitoringApp';
import LoginPage from './components/LoginPage';
import '../css/app.css';

const App = () => {
    const [user, setUser] = useState(null);

    if (!user) {
        return <LoginPage onLogin={setUser} />;
    }
    return <WebMonitoringApp user={user} />;
};

// Mount React app ke element dengan id 'app'
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
