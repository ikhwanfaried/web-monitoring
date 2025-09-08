import React, { useState, useEffect } from 'react';
import PieChart from './PieChart';
import LineChart from './LineChart';
import SafeStockPieChart from './SafeStockPieChart';

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
    
    // State untuk gudang
    const [gudangList, setGudangList] = useState([]);
    const [selectedGudang, setSelectedGudang] = useState('all');
    const [gudangData, setGudangData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchGudang, setSearchGudang] = useState('');

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
        fetchGudangList();
    }, []);

    useEffect(() => {
        // Fetch gudang data ketika selectedGudang berubah dan reset ke halaman 1
        if (activeTab === 'gudang') {
            setCurrentPage(1);
            fetchGudangData(1, itemsPerPage);
        }
    }, [selectedGudang, activeTab, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.custom-dropdown')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

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

    const fetchGudangList = async () => {
        try {
            const response = await fetch('/api/gudang-list');
            const data = await response.json();
            console.log('🏢 Gudang list response:', data);
            console.log('📊 Total gudang received:', data.data ? data.data.length : 0);
            console.log('🔄 Data source:', data.source || 'unknown');
            
            if (data.data) {
                setGudangList(data.data);
                console.log('✅ Gudang list set successfully with', data.data.length, 'items');
                
                // Debug: log first 10 gudang
                console.log('📋 First 10 gudang:', data.data.slice(0, 10).map(g => g.Gudang));
            }
        } catch (error) {
            console.error('❌ Error fetching gudang list:', error);
        }
    };

    const fetchGudangData = async (page = 1, perPage = itemsPerPage) => {
        try {
            setLoading(true);
            
            // Gunakan pagination normal saja
            const url = selectedGudang === 'all' 
                ? `/api/gudang?page=${page}&per_page=${perPage}`
                : `/api/gudang?filter=${selectedGudang}&page=${page}&per_page=${perPage}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            setGudangData(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Error fetching gudang data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk navigasi pagination
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            fetchGudangData(page, itemsPerPage);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    // Handler untuk mengubah items per page
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
        setShowAll(false);
    };

    // Handler untuk show all
    const handleShowAll = () => {
        setShowAll(true);
        setCurrentPage(1);
    };

    // Handler untuk kembali ke pagination
    const handleShowPaginated = () => {
        setShowAll(false);
        setCurrentPage(1);
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

                        {/* Login Logs Table - Scrollable */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Login Activity</h3>
                            <div className="overflow-x-auto">
                                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full table-auto">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">IP Address</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Login Time</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">User Agent</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {loginLogs.map((log, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{log.username}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            log.status === 'success' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {log.status === 'success' ? '✅ Success' : '❌ Failed'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{log.ip_address}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {new Date(log.login_time).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={log.user_agent}>
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
                                <div className="mt-2 text-sm text-gray-500 text-center">
                                    {loginLogs.length > 0 && `Menampilkan ${loginLogs.length} aktivitas login terbaru`}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'gudang':
                return (
                    <div>
                        {/* Header dengan Dropdown */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Gudang</h2>
                                    <p className="text-gray-600">Kelola dan pantau data gudang inventaris</p>
                                </div>
                                
                                {/* Dropdown Pilihan Gudang */}
                                <div className="mt-4 md:mt-0">
                                    <label htmlFor="gudang-select" className="block text-sm font-medium text-gray-700 mb-2">
                                        Filter Gudang:
                                    </label>
                                    <div className="custom-dropdown">
                                        <button
                                            type="button"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="relative block w-64 px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        >
                                            <span className="block truncate">
                                                {selectedGudang === 'all' ? '🏢 Semua Gudang' : `📦 ${selectedGudang}`}
                                            </span>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </button>
                                        
                                        {dropdownOpen && (
                                            <div className="custom-dropdown-content">
                                                {/* Search Input */}
                                                <div className="p-2 border-b border-gray-200 bg-gray-50">
                                                    <input
                                                        type="text"
                                                        placeholder="🔍 Cari gudang..."
                                                        value={searchGudang}
                                                        onChange={(e) => setSearchGudang(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                
                                                {/* Gudang Options */}
                                                <div className="max-h-60 overflow-y-auto">
                                                    <div 
                                                        className={`custom-dropdown-item ${selectedGudang === 'all' ? 'bg-blue-50 text-blue-700' : ''}`}
                                                        onClick={() => {
                                                            setSelectedGudang('all');
                                                            setDropdownOpen(false);
                                                            setSearchGudang('');
                                                        }}
                                                    >
                                                        🏢 Semua Gudang
                                                    </div>
                                                    {gudangList
                                                        .filter(gudang => 
                                                            gudang.Gudang.toLowerCase().includes(searchGudang.toLowerCase())
                                                        )
                                                        .map((gudang, index) => (
                                                            <div 
                                                                key={index}
                                                                className={`custom-dropdown-item ${selectedGudang === gudang.Gudang ? 'bg-blue-50 text-blue-700' : ''}`}
                                                                onClick={() => {
                                                                    setSelectedGudang(gudang.Gudang);
                                                                    setDropdownOpen(false);
                                                                    setSearchGudang('');
                                                                }}
                                                            >
                                                                📦 {gudang.Gudang}
                                                            </div>
                                                        ))
                                                    }
                                                    
                                                    {/* No results message */}
                                                    {searchGudang && gudangList.filter(gudang => 
                                                        gudang.Gudang.toLowerCase().includes(searchGudang.toLowerCase())
                                                    ).length === 0 && (
                                                        <div className="custom-dropdown-item text-gray-500 text-center">
                                                            Tidak ada gudang yang ditemukan
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-6 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-800 font-semibold">
                                        {selectedGudang === 'all' 
                                            ? `Total Semua Gudang: ${totalItems.toLocaleString()} item` 
                                            : `Data untuk: ${selectedGudang}`
                                        }
                                    </p>
                                    <p className="text-blue-600 text-sm">
                                        {totalItems > 0 
                                            ? `Halaman ${currentPage} dari ${totalPages} | Menampilkan ${gudangData.length} dari ${totalItems.toLocaleString()} item` 
                                            : 'Belum ada data'
                                        }
                                    </p>
                                </div>
                                <div className="text-blue-600">
                                    <span className="text-2xl">🏢</span>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="items-per-page" className="text-sm font-medium text-gray-700">
                                            Items per page:
                                        </label>
                                        <select
                                            id="items-per-page"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(parseInt(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()} items
                                </div>
                            </div>
                        </div>

                        {/* Tabel Data Barang di Gudang */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Data Barang di Gudang</h3>
                            
                            {gudangData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                        <table className="min-w-full table-auto">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item ID</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Part Number</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nama Barang</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gudang</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rak</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Jumlah</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Satuan</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Harga</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {gudangData.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{item.item_id}</td>
                                                        <td className="px-4 py-3 text-sm text-blue-600 font-semibold">{item.part_number}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium" title={item.nama_barang}>
                                                            <div className="max-w-48 truncate">{item.nama_barang}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                🏢 {item.gudang}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.rak || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-right">
                                                            {item.jumlah || '0'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.satuan || '-'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">-</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                ✅ ACTIVE
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Loading State */}
                                    {loading && (
                                        <div className="text-center py-4">
                                            <div className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg">
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Memuat data...
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Menampilkan halaman {currentPage} dari {totalPages} | Total: {totalItems.toLocaleString()} item
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={handlePrevPage}
                                                    disabled={currentPage === 1 || loading}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                        currentPage === 1 || loading
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                                >
                                                    ← Previous
                                                </button>
                                                
                                                {/* Page Numbers */}
                                                <div className="flex space-x-1">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum;
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (currentPage >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + i;
                                                        } else {
                                                            pageNum = currentPage - 2 + i;
                                                        }
                                                        
                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => handlePageChange(pageNum)}
                                                                disabled={loading}
                                                                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                                    currentPage === pageNum
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages || loading}
                                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                        currentPage === totalPages || loading
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                                >
                                                    Next →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-3 text-center text-sm text-gray-500">
                                        📊 Total Stok Halaman Ini: {gudangData.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0).toLocaleString()} unit
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className="text-lg font-medium">Belum ada data barang</p>
                                    <p className="text-sm">
                                        {selectedGudang === 'all' 
                                            ? 'Tidak ada data barang tersedia'
                                            : `Tidak ada data barang untuk gudang: ${selectedGudang}`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Stock Chart - Grafik Pie Chart Stock */}
                        <div className="mt-8">
                            <SafeStockPieChart 
                                selectedGudang={selectedGudang} 
                                title="📊 Distribusi Stock Barang"
                            />
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
        <div className="min-h-screen bg-slate-800">
            {/* Fixed Collapsible Sidebar */}
            <aside className="group fixed left-0 top-0 h-screen w-16 hover:w-80 bg-cyan-900/90 backdrop-blur border-r border-cyan-500 text-white flex flex-col transition-all duration-300 ease-in-out z-50">
                <div className="p-4 group-hover:p-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-cyan-400 group-hover:text-3xl transition-all duration-300">S</h1>
                        <span className="ml-2 text-xl font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">IMTELOG</span>
                    </div>
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

            {/* Main Content Area - dengan margin left untuk memberikan ruang sidebar */}
            <div className="ml-16 min-h-screen flex flex-col">
                {/* Main Content */}
                <main className="flex-1 px-8 py-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default WebMonitoringApp;
