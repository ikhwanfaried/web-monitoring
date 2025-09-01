import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                onLogin(result.user);
            } else {
                setError(result.message || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan pada server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-800">
            <div className="bg-cyan-900/50 border border-cyan-500 p-8 rounded-lg shadow-2xl backdrop-blur w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        
                        <input
                            type="text"
                            className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-cyan-500 text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-0 placeholder-cyan-400"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        
                        <input
                            type="password"
                            className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-cyan-500 text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-0 placeholder-cyan-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
                   
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="w-24 bg-cyan-500 text-white py-2 rounded hover:bg-cyan-400 transition duration-300 font-medium"
                            disabled={loading}
                        >
                            {loading ? '...' : 'Login'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;
