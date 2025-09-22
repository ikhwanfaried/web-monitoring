import React, { useState, useEffect } from 'react';
import PieChart from './PieChart';
import LineChart from './LineChart';
import SafeStockPieChart from './SafeStockPieChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = ({ user }) => {
    // Early return if user data is not available
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-orange-300">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    console.log('AdminDashboard user data:', user);

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

    // State untuk transaksi
    const [transaksiData, setTransaksiData] = useState([]);
    const [transaksiCurrentPage, setTransaksiCurrentPage] = useState(1);
    const [transaksiTotalPages, setTransaksiTotalPages] = useState(1);
    const [transaksiTotal, setTransaksiTotal] = useState(0);
    const [transaksiLoading, setTransaksiLoading] = useState(false);
    const [transaksiPerPage, setTransaksiPerPage] = useState(15);
    const [showAll, setShowAll] = useState(false);
    const [selectedTransaksiGudang, setSelectedTransaksiGudang] = useState('all');
    const [transaksiGudangList, setTransaksiGudangList] = useState([]);

    // State untuk status chart
    const [statusStatistics, setStatusStatistics] = useState({
        status_permintaan: [],
        status_penerimaan: [],
        status_pengiriman: []
    });
    const [activeChartType, setActiveChartType] = useState('status_permintaan');
    const [statusChartLoading, setStatusChartLoading] = useState(false);

    // State untuk top active warehouses
    const [warehouseStatistics, setWarehouseStatistics] = useState([]);
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    // State untuk status detail hover
    const [statusDetailData, setStatusDetailData] = useState(null);
    const [statusDetailLoading, setStatusDetailLoading] = useState(false);
    const [hoveredStatus, setHoveredStatus] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, side: 'right' });

    // State untuk dark mode
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    // State untuk modal add user
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [addUserForm, setAddUserForm] = useState({
        username: '',
        password: '',
        Nama: '',
        NRP: '',
        Email: '',
        id_satuan: user?.id_satuan || '' // Admin hanya bisa menambah user di site mereka sendiri
    });
    const [addUserLoading, setAddUserLoading] = useState(false);
    const [addUserSuccess, setAddUserSuccess] = useState(false);
    const [addUserError, setAddUserError] = useState('');
    const [sites, setSites] = useState([]);
    const [sitesLoading, setSitesLoading] = useState(true);

    // Simple tab change function
    const changeTab = (tabName) => {
        setActiveTab(tabName);
    };

    const handleLogout = () => {
        // Redirect ke halaman login
        window.location.href = '/';
    };

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
        
        // Apply to document element for global styles
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Helper function for dark mode classes
    const getCardClasses = (additionalClasses = '') => {
        const baseClasses = 'rounded-lg shadow-md transition-all duration-300';
        const bgClasses = isDarkMode 
            ? 'bg-gray-800 border-2 border-blue-400 glow-blue' 
            : 'bg-white border border-gray-200';
        return `${baseClasses} ${bgClasses} ${additionalClasses}`;
    };

    const getTextClasses = (type = 'primary') => {
        if (type === 'primary') {
            return isDarkMode ? 'text-white' : 'text-gray-900';
        } else if (type === 'secondary') {
            return isDarkMode ? 'text-gray-200' : 'text-gray-600';
        } else if (type === 'muted') {
            return isDarkMode ? 'text-gray-300' : 'text-gray-500';
        }
        return '';
    };

    useEffect(() => {
        // Apply dark mode class on mount
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        // Fetch data dari Laravel API - ADMIN: filtered by site
        fetchDashboardData();
        fetchLoginLogs();
        fetchLoginStats();
        fetchTransactionStatusData();
        fetchGudangList();
        fetchSites();
    }, []);

    useEffect(() => {
        // Fetch gudang data ketika selectedGudang berubah dan reset ke halaman 1
        if (activeTab === 'gudang') {
            setCurrentPage(1);
            fetchGudangData(1, itemsPerPage);
        }
        // Fetch transaksi data ketika tab transaksi dibuka
        if (activeTab === 'transaksi') {
            fetchTransaksiGudangList();
            setTransaksiCurrentPage(1);
            fetchTransaksiData(1, transaksiPerPage);
        }
    }, [selectedGudang, activeTab, itemsPerPage, transaksiPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect terpisah untuk filter transaksi gudang
    useEffect(() => {
        if (activeTab === 'transaksi' && selectedTransaksiGudang) {
            setTransaksiCurrentPage(1);
            fetchTransaksiData(1, transaksiPerPage);
        }
    }, [selectedTransaksiGudang]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect untuk pagination transaksi
    useEffect(() => {
        if (activeTab === 'transaksi' && transaksiCurrentPage > 1) {
            fetchTransaksiData(transaksiCurrentPage, transaksiPerPage);
        }
    }, [transaksiCurrentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch status statistics and warehouse statistics when transaksi tab is active or filter changes
    useEffect(() => {
        if (activeTab === 'transaksi') {
            fetchStatusStatistics();
            fetchWarehouseStatistics();
        }
    }, [activeTab, selectedTransaksiGudang]); // eslint-disable-line react-hooks/exhaustive-deps

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

    // ADMIN: Data filtered by user's site
    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`/api/dashboard?site_filter=${user?.id_satuan}`);
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
            const response = await fetch(`/api/transaction-status-chart?site_filter=${user?.id_satuan}`);
            const data = await response.json();
            setTransactionStatusData(data);
        } catch (error) {
            console.error('Error fetching transaction status data:', error);
        }
    };

    const fetchTransaksiData = async (page = 1, perPage = 15) => {
        if (transaksiLoading) return;
        
        setTransaksiLoading(true);
        try {
            const filterParam = selectedTransaksiGudang !== 'all' ? `&filter=${encodeURIComponent(selectedTransaksiGudang)}` : '';
            const siteParam = `&site_filter=${user?.id_satuan}`;
            const response = await fetch(`/api/transaksi?page=${page}&per_page=${perPage}${filterParam}${siteParam}`);
            const data = await response.json();
            
            console.log('📄 Transaksi response:', data);
            
            if (data.data) {
                setTransaksiData(data.data);
                setTransaksiCurrentPage(data.current_page);
                setTransaksiTotalPages(data.last_page);
                setTransaksiTotal(data.total);
            }
        } catch (error) {
            console.error('Error fetching transaction data:', error);
        } finally {
            setTransaksiLoading(false);
        }
    };

    const fetchTransaksiGudangList = async () => {
        try {
            const response = await fetch(`/api/transaksi-gudang-list?site_filter=${user?.id_satuan}`);
            const data = await response.json();
            console.log('🏢 Transaksi gudang list response:', data);
            
            if (data.data) {
                setTransaksiGudangList(data.data);
            }
        } catch (error) {
            console.error('Error fetching transaction gudang list:', error);
        }
    };

    const fetchStatusStatistics = async () => {
        try {
            setStatusChartLoading(true);
            const response = await fetch(`/api/status-statistics?filter=${selectedTransaksiGudang}&site_filter=${user?.id_satuan}`);
            const data = await response.json();
            console.log('📊 Status statistics response:', data);
            
            if (data.status_permintaan && data.status_penerimaan && data.status_pengiriman) {
                setStatusStatistics(data);
            }
        } catch (error) {
            console.error('Error fetching status statistics:', error);
        } finally {
            setStatusChartLoading(false);
        }
    };

    const fetchWarehouseStatistics = async () => {
        try {
            setWarehouseLoading(true);
            const response = await fetch(`/api/top-active-warehouses?filter=${selectedTransaksiGudang}&limit=10&site_filter=${user?.id_satuan}`);
            const data = await response.json();
            console.log('🏭 Warehouse statistics response:', data);
            
            if (data.success) {
                setWarehouseStatistics(data.data);
            }
        } catch (error) {
            console.error('Error fetching warehouse statistics:', error);
        } finally {
            setWarehouseLoading(false);
        }
    };

    const fetchStatusDetail = async (statusType, statusValue) => {
        try {
            setStatusDetailLoading(true);
            const response = await fetch(`/api/status-detail?status_type=${statusType}&status_value=${encodeURIComponent(statusValue)}&filter=${selectedTransaksiGudang}&site_filter=${user?.id_satuan}`);
            const data = await response.json();
            console.log('📋 Status detail response:', data);
            
            if (data.success) {
                setStatusDetailData(data.data);
            }
        } catch (error) {
            console.error('Error fetching status detail:', error);
        } finally {
            setStatusDetailLoading(false);
        }
    };

    const calculateTooltipPosition = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const tooltipWidth = 320; // estimated tooltip width
        const tooltipHeight = 200; // estimated tooltip height
        
        // Calculate if tooltip fits on the right side
        const fitsRight = rect.right + tooltipWidth + 16 <= windowWidth;
        
        // Calculate if tooltip fits on the left side
        const fitsLeft = rect.left - tooltipWidth - 16 >= 0;
        
        // Determine optimal side
        let side = 'right';
        if (!fitsRight && fitsLeft) {
            side = 'left';
        } else if (!fitsRight && !fitsLeft) {
            // If neither side fits perfectly, choose based on available space
            const rightSpace = windowWidth - rect.right;
            const leftSpace = rect.left;
            side = rightSpace > leftSpace ? 'right' : 'left';
        }
        
        // Calculate vertical position
        let yOffset = 0;
        const tooltipBottom = rect.top + tooltipHeight;
        if (tooltipBottom > windowHeight - 20) {
            yOffset = windowHeight - tooltipBottom - 20;
        }
        
        return {
            x: rect.right,
            y: rect.top,
            side: side,
            yOffset: yOffset
        };
    };

    // Fungsi untuk handle add user modal
    const handleAddUserChange = (e) => {
        setAddUserForm({ ...addUserForm, [e.target.name]: e.target.value });
    };

    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        setAddUserLoading(true);
        setAddUserError('');
        setAddUserSuccess(false);
        
        // ADMIN: Force user to be created with status=3 (user) and same site as admin
        const submitData = {
            ...addUserForm,
            NRP: parseInt(addUserForm.NRP),
            id_satuan: parseInt(user?.id_satuan), // Force admin's site
            id_status: 3 // Force user status
        };
        
        console.log('Admin submitting user data:', submitData);
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken);
            
            const res = await fetch('/api/create-user', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });
            
            console.log('Response status:', res.status);
            const responseData = await res.json();
            console.log('Response data:', responseData);
            
            if (res.ok) {
                setAddUserSuccess(true);
                setAddUserForm({ 
                    username: '', 
                    password: '', 
                    Nama: '', 
                    NRP: '', 
                    Email: '', 
                    id_satuan: user?.id_satuan || '' 
                });
                setTimeout(() => {
                    setShowAddUserModal(false);
                    setAddUserSuccess(false);
                }, 2000);
            } else {
                // Handle validation errors dengan pesan yang user-friendly
                if (res.status === 422 && responseData.messages) {
                    const messages = responseData.messages;
                    let errorMessage = '';
                    
                    if (messages.NRP) {
                        errorMessage += '⚠️ NRP yang Anda masukkan sudah digunakan. Silakan gunakan NRP yang berbeda.\n';
                    }
                    if (messages.username) {
                        errorMessage += '⚠️ Username sudah digunakan. Silakan pilih username lain.\n';
                    }
                    if (messages.Email) {
                        errorMessage += '⚠️ Email sudah terdaftar. Silakan gunakan email lain.\n';
                    }
                    
                    // Jika ada error lain yang tidak spesifik
                    Object.entries(messages).forEach(([field, errors]) => {
                        if (!['NRP', 'username', 'Email'].includes(field)) {
                            errorMessage += `⚠️ ${field}: ${errors.join(', ')}\n`;
                        }
                    });
                    
                    setAddUserError(errorMessage.trim());
                } else {
                    setAddUserError(responseData.message || responseData.error || 'Gagal menambah user');
                }
                console.error('Server error:', responseData);
            }
        } catch (err) {
            console.error('Network error:', err);
            setAddUserError('Network error: ' + err.message);
        }
        
        setAddUserLoading(false);
    };

    const closeAddUserModal = () => {
        setShowAddUserModal(false);
        setAddUserForm({ 
            username: '', 
            password: '', 
            Nama: '', 
            NRP: '', 
            Email: '', 
            id_satuan: user?.id_satuan || '' 
        });
        setAddUserError('');
        setAddUserSuccess(false);
    };

    const fetchGudangList = async () => {
        try {
            const response = await fetch(`/api/gudang-list?site_filter=${user?.id_satuan}`);
            const data = await response.json();
            console.log('🏢 Gudang list response:', data);
            console.log('📊 Total gudang received:', data.data ? data.data.length : 0);
            console.log('🔄 Data source:', data.source || 'unknown');
            
            if (data.data) {
                setGudangList(data.data);
                console.log('✅ Gudang list set successfully with', data.data.length, 'items');
            }
        } catch (error) {
            console.error('❌ Error fetching gudang list:', error);
        }
    };

    const fetchSites = async () => {
        try {
            setSitesLoading(true);
            // ADMIN: Only get current user's site
            const response = await fetch(`/api/site/${user?.id_satuan}`);
            if (response.ok) {
                const result = await response.json();
                setSites([result.data] || []);
                console.log('Admin site loaded:', result.data);
            } else {
                console.error('Failed to fetch admin site');
            }
        } catch (error) {
            console.error('Error fetching admin site:', error);
        } finally {
            setSitesLoading(false);
        }
    };

    const fetchGudangData = async (page = 1, perPage = itemsPerPage) => {
        try {
            setLoading(true);
            
            // ADMIN: Always filter by admin's site
            const siteParam = `&site_filter=${user?.id_satuan}`;
            const url = selectedGudang === 'all' 
                ? `/api/gudang?page=${page}&per_page=${perPage}${siteParam}`
                : `/api/gudang?filter=${selectedGudang}&page=${page}&per_page=${perPage}${siteParam}`;
            
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

    // Handler untuk pagination transaksi
    const handleTransaksiPageChange = (page) => {
        if (page !== transaksiCurrentPage && page >= 1 && page <= transaksiTotalPages) {
            setTransaksiCurrentPage(page);
            fetchTransaksiData(page, transaksiPerPage);
        }
    };

    const handleTransaksiNextPage = () => {
        if (transaksiCurrentPage < transaksiTotalPages) {
            handleTransaksiPageChange(transaksiCurrentPage + 1);
        }
    };

    const handleTransaksiPrevPage = () => {
        if (transaksiCurrentPage > 1) {
            handleTransaksiPageChange(transaksiCurrentPage - 1);
        }
    };

    // [... Rest of the render functions would be identical to WebMonitoringApp ...]
    // For brevity, I'll include just the main render function and key differences

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div>
                        {/* Same dashboard layout but with filtered data */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            <div className="flex flex-col gap-4">
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Gudang (Site Anda)</p>
                                            <p className={`text-3xl font-bold ${getTextClasses('primary')}`}>{dashboardData.gudang.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-blue-600 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏢</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Site Anda</p>
                                            <p className={`text-3xl font-bold ${getTextClasses('primary')}`}>1</p>
                                        </div>
                                        <div className="bg-blue-700 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏛️</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex-1 ${getCardClasses('p-6')}`}>
                                <h3 className={`text-lg font-bold ${getTextClasses('primary')} mb-3 flex items-center`}>
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
                                            <p className={`text-lg font-bold ${getTextClasses('primary')}`}>{stat.value.toLocaleString()}</p>
                                            <p className={`${getTextClasses('secondary')} text-xs`}>{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Charts Row - Transaction Status Chart & Daily Login Chart */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            <div className="flex-1">
                                <PieChart 
                                    data={transactionStatusData} 
                                    title="📈 Status Transaksi (Site Anda)"
                                    compact={false}
                                />
                            </div>

                            <div className="flex-1">
                                <LineChart title="📈 Grafik Login Harian (30 Hari Terakhir)" />
                            </div>
                        </div>

                        {/* Login Logs Table */}
                        <div className={`${getCardClasses('p-6')}`}>
                            <h3 className={`text-xl font-bold ${getTextClasses('primary')} mb-4`}>Recent Login Activity</h3>
                            <div className="overflow-x-auto">
                                <div className={`max-h-96 overflow-y-auto rounded-lg ${
                                    isDarkMode ? 'border border-gray-600' : 'border border-gray-200'
                                }`}>
                                    <table className="min-w-full table-auto">
                                        <thead className={`sticky top-0 ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                        }`}>
                                            <tr>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Username</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Status</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>IP Address</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Login Time</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>User Agent</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${
                                            isDarkMode 
                                                ? 'bg-gray-800 divide-gray-600' 
                                                : 'bg-white divide-gray-200'
                                        }`}>
                                            {loginLogs.map((log, index) => (
                                                <tr key={index} className={`${
                                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                }`}>
                                                    <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`}>{log.username}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            log.status === 'success' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {log.status === 'success' ? '✅ Success' : '❌ Failed'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm font-mono ${getTextClasses('secondary')}`}>{log.ip_address}</td>
                                                    <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>
                                                        {new Date(log.login_time).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm max-w-xs truncate ${getTextClasses('secondary')}`} title={log.user_agent}>
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
                // Same gudang content but with site filtering
                return (
                    <div>
                        <div className={`${getCardClasses('p-6 mb-6')}`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold ${getTextClasses('primary')} mb-2`}>Data Gudang (Site Anda)</h2>
                                    <p className={`${getTextClasses('secondary')}`}>Kelola dan pantau data gudang di site Anda</p>
                                </div>
                                
                                {/* Same dropdown but filtered to admin's site */}
                                <div className="mt-4 md:mt-0">
                                    <label htmlFor="gudang-select" className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Filter Gudang:
                                    </label>
                                    <div className="custom-dropdown">
                                        <button
                                            type="button"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className={`relative block w-64 px-3 py-2 text-left rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 text-white' 
                                                    : 'bg-white border border-gray-300'
                                            }`}
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
                                            <div className={`custom-dropdown-content ${
                                                isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                                            }`}>
                                                <div className={`p-2 border-b ${
                                                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                                }`}>
                                                    <input
                                                        type="text"
                                                        placeholder="🔍 Cari gudang..."
                                                        value={searchGudang}
                                                        onChange={(e) => setSearchGudang(e.target.value)}
                                                        className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                            isDarkMode 
                                                                ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400' 
                                                                : 'bg-white border border-gray-300 text-gray-900'
                                                        }`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                
                                                <div className="max-h-60 overflow-y-auto">
                                                    <div 
                                                        className={`custom-dropdown-item ${
                                                            selectedGudang === 'all' 
                                                                ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                        }`}
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
                                                                className={`custom-dropdown-item ${
                                                                    selectedGudang === gudang.Gudang 
                                                                        ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                        : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                }`}
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

                        {/* Rest of gudang content - same as original but with filtered data */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 mb-6 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-800 font-semibold">
                                        {selectedGudang === 'all' 
                                            ? `Total Gudang Site Anda: ${totalItems.toLocaleString()} item` 
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

                        {/* Rest would be identical to original... */}
                        <div className={`${getCardClasses('p-6')}`}>
                            <h3 className={`text-lg font-bold ${getTextClasses('primary')} mb-4`}>Data Barang di Gudang Site Anda</h3>
                            {/* Same table structure as original but filtered */}
                        </div>

                        <div className="mt-8">
                            <SafeStockPieChart 
                                selectedGudang={selectedGudang} 
                                title="📊 Distribusi Stock Barang Site Anda"
                                isDarkMode={isDarkMode}
                                siteFilter={user?.id_satuan}
                            />
                        </div>
                    </div>
                );
            case 'transaksi':
                return (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className={`text-2xl font-bold ${getTextColor()}`}>Data Transaksi</h2>
                                <p className={`mt-2 ${getSecondaryTextColor()}`}>Kelola data transaksi inventaris di site Anda</p>
                            </div>
                        </div>

                        {/* Filter dan Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <label htmlFor="transaksi-filter" className={`text-sm font-medium ${getSecondaryTextColor()}`}>Filter Gudang:</label>
                                <select
                                    id="transaksi-filter"
                                    value={selectedTransaksiGudang}
                                    onChange={(e) => {
                                        setSelectedTransaksiGudang(e.target.value);
                                        setTransaksiCurrentPage(1);
                                    }}
                                    className={`px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="all">Semua Gudang</option>
                                    {transaksiGudangList.map(gudang => (
                                        <option key={gudang.gudang} value={gudang.gudang}>
                                            {gudang.gudang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <label htmlFor="transaksi-per-page" className={`text-sm font-medium ${getSecondaryTextColor()}`}>Per halaman:</label>
                                <select
                                    id="transaksi-per-page"
                                    value={transaksiPerPage}
                                    onChange={(e) => {
                                        setTransaksiPerPage(Number(e.target.value));
                                        setTransaksiCurrentPage(1);
                                    }}
                                    className={`px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border-gray-600 text-white' 
                                            : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className={`p-4 rounded-lg ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } shadow-sm`}>
                            <div className="text-center">
                                <span className={`text-lg font-semibold ${getTextColor()}`}>
                                    Total: {transaksiTotal.toLocaleString()} transaksi
                                </span>
                            </div>
                        </div>

                        {/* Table */}
                        <div className={`${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } shadow-sm rounded-lg overflow-hidden`}>
                            {transaksiLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <span className={`ml-2 ${getSecondaryTextColor()}`}>Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                                <tr>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getSecondaryTextColor()}`}>
                                                        Nomor Dokumen
                                                    </th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getSecondaryTextColor()}`}>
                                                        Part Number
                                                    </th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getSecondaryTextColor()}`}>
                                                        Nama Barang
                                                    </th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getSecondaryTextColor()}`}>
                                                        Dari Gudang
                                                    </th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getSecondaryTextColor()}`}>
                                                        Ke Gudang
                                                    </th>
                                                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getSecondaryTextColor()}`}>
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                                {transaksiData.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className={`px-6 py-4 text-center ${getSecondaryTextColor()}`}>
                                                            Tidak ada data transaksi
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    transaksiData.map((item) => (
                                                        <tr key={item.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getTextColor()}`}>
                                                                {item.nomor_dokumen}
                                                            </td>
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSecondaryTextColor()}`}>
                                                                {item.part_number}
                                                            </td>
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSecondaryTextColor()}`}>
                                                                {item.nama_barang || '-'}
                                                            </td>
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSecondaryTextColor()}`}>
                                                                {item.dari_gudang || '-'}
                                                            </td>
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSecondaryTextColor()}`}>
                                                                {item.ke_gudang || '-'}
                                                            </td>
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSecondaryTextColor()}`}>
                                                                <div className="space-y-1">
                                                                    {item.status_permintaan && (
                                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                            P: {item.status_permintaan}
                                                                        </span>
                                                                    )}
                                                                    {item.status_penerimaan && (
                                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                            R: {item.status_penerimaan}
                                                                        </span>
                                                                    )}
                                                                    {item.status_pengiriman && (
                                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                            S: {item.status_pengiriman}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {transaksiTotalPages > 1 && (
                                        <div className={`px-6 py-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm ${getSecondaryTextColor()}`}>
                                                    Halaman {transaksiCurrentPage} dari {transaksiTotalPages}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            if (transaksiCurrentPage > 1) {
                                                                setTransaksiCurrentPage(transaksiCurrentPage - 1);
                                                            }
                                                        }}
                                                        disabled={transaksiCurrentPage === 1}
                                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                            transaksiCurrentPage === 1
                                                                ? isDarkMode 
                                                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : isDarkMode
                                                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                        }`}
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (transaksiCurrentPage < transaksiTotalPages) {
                                                                setTransaksiCurrentPage(transaksiCurrentPage + 1);
                                                            }
                                                        }}
                                                        disabled={transaksiCurrentPage === transaksiTotalPages}
                                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                            transaksiCurrentPage === transaksiTotalPages
                                                                ? isDarkMode 
                                                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : isDarkMode
                                                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                        }`}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            default:
                return <div>Select a tab to view content</div>;
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900' : 'bg-slate-800'
        }`}>
            {/* CSS Styles for glow effect */}
            <style jsx>{`
                .glow-blue {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
                }
                .glow-blue:hover {
                    box-shadow: 0 0 25px rgba(59, 130, 246, 0.7), 0 0 50px rgba(59, 130, 246, 0.4);
                }
                .sidebar-glow {
                    box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
                }
            `}</style>
            
            {/* ADMIN Sidebar - Orange theme */}
            <aside className={`group fixed left-0 top-0 h-screen w-16 hover:w-80 backdrop-blur border-r text-white flex flex-col transition-all duration-300 ease-in-out z-50 ${
                isDarkMode 
                    ? 'bg-gray-800/95 border-orange-400 sidebar-glow' 
                    : 'bg-orange-900/90 border-orange-500'
            }`}>
                <div className="p-4 group-hover:p-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-orange-400 group-hover:text-3xl transition-all duration-300">A</h1>
                        <span className="ml-2 text-xl font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">DMIN PANEL</span>
                    </div>
                </div>
                
                {/* Menu Navigation */}
                <nav className="flex-1 px-2 group-hover:px-6 transition-all duration-300">
                    <div className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                            { id: 'gudang', label: 'Gudang', icon: '🏢' },
                            { id: 'transaksi', label: 'Transaksi', icon: '💳' },
                            { id: 'add-user', label: 'Tambah User', icon: '👤' }
                        ].map(menu => (
                            <button
                                key={menu.id}
                                onClick={() => {
                                    if (menu.id === 'add-user') {
                                        setShowAddUserModal(true);
                                    } else {
                                        setActiveTab(menu.id);
                                    }
                                }}
                                className={`w-full flex items-center space-x-3 px-2 group-hover:px-4 py-3 rounded-lg transition-all duration-300 text-left relative ${
                                    activeTab === menu.id
                                        ? 'bg-orange-500 text-white'
                                        : 'text-orange-300 hover:bg-orange-800/50 hover:text-orange-100'
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
                
                {/* Dark Mode Toggle */}
                <div className="px-2 group-hover:px-6 py-2 transition-all duration-300">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-center group-hover:justify-start space-x-2 p-2 rounded-lg hover:bg-orange-800/50 transition-all duration-300"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        <span className="text-lg">
                            {isDarkMode ? '☀️' : '🌙'}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 text-sm font-medium">
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </button>
                </div>
                
                {/* User info dan logout di bawah */}
                <div className="p-2 group-hover:p-6 border-t border-orange-500 transition-all duration-300">
                    <div className="mb-2 group-hover:mb-4">
                        <div className="text-center group-hover:text-left">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto group-hover:mx-0 mb-2 group-hover:mb-0">
                                <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">
                                <p className="font-semibold text-orange-100 text-sm">{user?.name}</p>
                                <p className="text-orange-400 text-xs">@{user?.username} (ADMIN)</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-orange-500 hover:bg-orange-400 px-2 group-hover:px-4 py-2 rounded transition-all duration-300 flex items-center justify-center group-hover:justify-start space-x-2"
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
            <div className="ml-16 min-h-screen flex flex-col">
                <main className="flex-1 px-8 py-8">
                    {renderContent()}
                </main>
            </div>

            {/* Modal Add User - Modified for Admin */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-orange-700">Tambah User Baru (Status: User)</h2>
                            <button
                                onClick={closeAddUserModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                            <div className="flex items-center">
                                <span className="text-orange-400 text-xl mr-2">ℹ️</span>
                                <p className="text-sm font-medium text-orange-800">
                                    Sebagai Admin, user yang Anda buat akan otomatis memiliki status "User" dan terdaftar di site yang sama dengan Anda.
                                </p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleAddUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input 
                                        type="text" 
                                        name="username" 
                                        value={addUserForm.username} 
                                        onChange={handleAddUserChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Masukkan username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={addUserForm.password} 
                                        onChange={handleAddUserChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Masukkan password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                                    <input 
                                        type="text" 
                                        name="Nama" 
                                        value={addUserForm.Nama} 
                                        onChange={handleAddUserChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">NRP</label>
                                    <input 
                                        type="number" 
                                        name="NRP" 
                                        value={addUserForm.NRP} 
                                        onChange={handleAddUserChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Masukkan NRP (angka)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        name="Email" 
                                        value={addUserForm.Email} 
                                        onChange={handleAddUserChange} 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Masukkan email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                                        {sites.length > 0 ? sites[0].Location : 'Site Admin'} (Otomatis)
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={closeAddUserModal}
                                    className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-400 transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={addUserLoading} 
                                    className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 disabled:bg-orange-400 transition"
                                >
                                    {addUserLoading ? 'Menyimpan...' : 'Tambah User'}
                                </button>
                            </div>
                            
                            {addUserSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-green-400 text-xl mr-2">✅</span>
                                        <p className="text-sm font-medium text-green-800">
                                            User berhasil ditambahkan dengan status "User"!
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {addUserError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-red-400 text-xl mr-2">❌</span>
                                        <p className="text-sm font-medium text-red-800">
                                            {addUserError}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;