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
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                credentials: 'same-origin',
                body: JSON.stringify({ username, password }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                // Simpan user data ke sessionStorage
                sessionStorage.setItem('userData', JSON.stringify(result.user));
                
                // Redirect berdasarkan id_status user
                const userRole = result.user.id_status;
                switch (userRole) {
                    case 1:
                        window.location.href = '/superadmin';
                        break;
                    case 2:
                        window.location.href = '/admin';
                        break;
                    case 3:
                        window.location.href = '/user';
                        break;
                    default:
                        onLogin(result.user); // Fallback ke behavior lama
                }
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
        <div className="min-h-screen flex items-center justify-center bg-slate-800 relative overflow-hidden">
            {/* Curved Text Background - Outside the box */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[800px] h-[800px]">
                    {/* Upper Arc Text */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
                        <defs>
                            <path
                                id="upperArc"
                                d="M 110 400 A 280 280 0 0 1 690 400"
                                fill="none"
                            />
                            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FFD700" />
                                <stop offset="50%" stopColor="#FFA500" />
                                <stop offset="100%" stopColor="#FFD700" />
                            </linearGradient>
                        </defs>
                        <text className="text-4xl font-bold tracking-[0.3em] opacity-90">
                            <textPath href="#upperArc" startOffset="50%" textAnchor="middle" fill="url(#goldGradient)">
                                AIR FORCE LOGISTICS SYSTEM
                            </textPath>
                        </text>
                    </svg>
                    
                    {/* Lower Arc Text */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
                        <defs>
                            <path
                                id="lowerArc"
                                d="M 690 400 A 280 280 0 0 1 110 400"
                                fill="none"
                            />
                            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#1E40AF" />
                                <stop offset="50%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#1E40AF" />
                            </linearGradient>
                        </defs>
                        <text className="text-4xl font-bold tracking-[0.3em] opacity-90">
                            <textPath href="#lowerArc" startOffset="50%" textAnchor="middle" fill="url(#blueGradient)">
                                ANGKATAN UDARA
                            </textPath>
                        </text>
                    </svg>
                </div>
            </div>

            {/* Login Form */}
            <div className="bg-cyan-900/50 border border-cyan-500 p-8 rounded-lg shadow-2xl backdrop-blur w-full max-w-md relative z-10">
                {/* Logo AIRLOGS */}
                <div className="text-center mb-6">
                    <img 
                        src="/images/logo_airlogs.png" 
                        alt="Logo AIRLOGS" 
                        className="h-32 w-32 mx-auto mb-4 object-contain"
                    />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">AIRLOGS</h2>
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
