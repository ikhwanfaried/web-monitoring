import React, { useState, useEffect } from 'react';
import PieChart from './PieChart';
import LineChart from './LineChart';

const WebMonitoringApp = ({ user }) => {
    const [dashboardData, setDashboardData] = useState({
        items: 0,
        dataset2: 0,
        gudang: 0,
        site: 0
    });

    const [loginLogs, setLoginLogs] = useState([]);
    const [loginStats, setLoginStats] = useState({
        today: 0,
        successful: 0,
        failed: 0,
        total: 0
    });

    const [transactionStatusData, setTransactionStatusData] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Simple tab change function
    const changeTab = (tabName) => {
        setActiveTab(tabName);
    };

    const handleLogout = () => {
        window.location.reload();
    };

    useEffect(() => {
        // Fetch data dari Laravel API
        fetchDashboardData();
        fetchLoginLogs();
        fetchLoginStats();
        fetchTransactionStatusData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchLoginLogs = async () => {
        try {
            const response = await fetch('/api/login-logs');
            const data = await response.json();
            setLoginLogs(data.data || []);
        } catch (error) {
            console.error('Error fetching login logs:', error);
        }
    };

    const fetchLoginStats = async () => {
        try {
            const response = await fetch('/api/login-stats');
            const data = await response.json();
            setLoginStats(data);
        } catch (error) {
            console.error('Error fetching login stats:', error);
        }
    };

    const fetchTransactionStatusData = async () => {
        try {
            const response = await fetch('/api/transaction-status-chart');
            const data = await response.json();
            setTransactionStatusData(data);
        } catch (error) {
            console.error('Error fetching transaction status data:', error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div>
                        {/* Layout baru: Gudang-Site (kiri) dan Login Statistics (kanan) */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            {/* Kolom Kiri: Gudang dan Site (atas-bawah) */}
                            <div className="flex flex-col gap-4">
                                {/* Box Gudang */}
                                <div className="bg-white rounded-lg shadow-md p-6 w-72">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm">Gudang</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.gudang.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-blue-600 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏢</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Box Site */}
                                <div className="bg-white rounded-lg shadow-md p-6 w-72">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 text-sm">Site</p>
                                            <p className="text-3xl font-bold text-gray-900">{dashboardData.site.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-blue-700 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏛️</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kolom Kanan: Login Statistics */}
                            <div className="flex-1 bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="text-xl mr-2">📊</span>
                                    Login Statistics
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Hari Ini', value: loginStats.today, color: 'bg-green-500', icon: '📅' },
                                        { label: 'Berhasil', value: loginStats.successful, color: 'bg-emerald-500', icon: '✅' },
                                        { label: 'Gagal', value: loginStats.failed, color: 'bg-red-500', icon: '❌' },
                                        { label: 'Total', value: loginStats.total, color: 'bg-purple-500', icon: '📊' }
                                    ].map((stat, index) => (
                                        <div key={index} className="text-center">
                                            <div className={`${stat.color} text-white p-2 rounded-full mx-auto w-8 h-8 flex items-center justify-center mb-1`}>
                                                <span className="text-sm">{stat.icon}</span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                                            <p className="text-gray-600 text-xs">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Charts Row - Transaction Status Chart & Daily Login Chart */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            {/* Transaction Status Chart */}
                            <div className="flex-1">
                                <PieChart 
                                    data={transactionStatusData} 
                                    title="📈 Status Transaksi"
                                    compact={false}
                                />
                            </div>

                            {/* Daily Login Chart */}
                            <div className="flex-1">
                                <LineChart title="📈 Grafik Login Harian (30 Hari Terakhir)" />
                            </div>
                        </div>

                        {/* Login Logs Table */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Login Activity</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">IP Address</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Login Time</th>
                                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">User Agent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loginLogs.map((log, index) => (
                                            <tr key={index} className="border-t border-gray-200">
                                                <td className="px-4 py-2 text-sm text-gray-900">{log.username}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        log.status === 'success' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {log.status === 'success' ? '✅ Success' : '❌ Failed'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600">{log.ip_address}</td>
                                                <td className="px-4 py-2 text-sm text-gray-600">
                                                    {new Date(log.login_time).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-600 max-w-xs truncate" title={log.user_agent}>
                                                    {log.user_agent}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {loginLogs.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Tidak ada data login logs
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'gudang':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Gudang</h2>
                        <p className="text-gray-600">Halaman untuk mengelola data gudang akan ditampilkan di sini.</p>
                        <div className="mt-4 p-4 bg-cyan-50 rounded border border-cyan-200">
                            <p className="text-cyan-800">Total Gudang: {dashboardData.gudang.toLocaleString()}</p>
                        </div>
                    </div>
                );
            case 'transaksi':
                return (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Transaksi</h2>
                        <p className="text-gray-600">Halaman untuk mengelola data transaksi akan ditampilkan di sini.</p>
                        <div className="mt-4 p-4 bg-cyan-50 rounded border border-cyan-200">
                            <p className="text-cyan-800">Fitur transaksi dalam pengembangan.</p>
                        </div>
                    </div>
                );
            default:
                return <div>Select a tab to view content</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-800 flex">
            {/* Collapsible Sidebar */}
            <aside className="group w-16 hover:w-80 bg-cyan-900/90 backdrop-blur border-r border-cyan-500 text-white flex flex-col transition-all duration-300 ease-in-out">
                <div className="p-4 group-hover:p-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-cyan-400 group-hover:text-3xl transition-all duration-300">S</h1>
                        <span className="ml-2 text-xl font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">IMTELOG</span>
                    </div>
                    <p className="text-cyan-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200">Dashboard Monitoring Data Inventaris</p>
                </div>
                
                {/* Menu Navigation */}
                <nav className="flex-1 px-2 group-hover:px-6 transition-all duration-300">
                    <div className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                            { id: 'gudang', label: 'Gudang', icon: '🏢' },
                            { id: 'transaksi', label: 'Transaksi', icon: '💳' }
                        ].map(menu => (
                            <button
                                key={menu.id}
                                onClick={() => setActiveTab(menu.id)}
                                className={`w-full flex items-center space-x-3 px-2 group-hover:px-4 py-3 rounded-lg transition-all duration-300 text-left relative ${
                                    activeTab === menu.id
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-cyan-300 hover:bg-cyan-800/50 hover:text-cyan-100'
                                }`}
                                title={menu.label}
                            >
                                <span className="text-xl min-w-[24px] flex justify-center">{menu.icon}</span>
                                <span className="font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 whitespace-nowrap">
                                    {menu.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </nav>
                
                {/* User info dan logout di bawah */}
                <div className="p-2 group-hover:p-6 border-t border-cyan-500 transition-all duration-300">
                    <div className="mb-2 group-hover:mb-4">
                        <div className="text-center group-hover:text-left">
                            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mx-auto group-hover:mx-0 mb-2 group-hover:mb-0">
                                <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">
                                <p className="font-semibold text-cyan-100 text-sm">{user?.name}</p>
                                <p className="text-cyan-400 text-xs">@{user?.username}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 px-2 group-hover:px-4 py-2 rounded transition-all duration-300 flex items-center justify-center group-hover:justify-start space-x-2"
                        title="Logout"
                    >
                        <span className="text-sm">🚪</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 text-sm font-medium">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Main Content */}
                <main className="flex-1 px-8 py-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default WebMonitoringApp;
