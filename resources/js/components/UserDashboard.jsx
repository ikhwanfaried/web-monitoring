import React, { useState, useEffect } from 'react';
import PieChart from './PieChart';
import LineChart from './LineChart';
import SafeStockPieChart from './SafeStockPieChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const UserDashboard = ({ user }) => {
    const [dashboardData, setDashboardData] = useState({
        items: 0,
        dataset2: 0,
        gudang: 0,
        site: 0
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

    // State untuk transaksi - LIMITED for user
    const [transaksiData, setTransaksiData] = useState([]);
    const [transaksiCurrentPage, setTransaksiCurrentPage] = useState(1);
    const [transaksiTotalPages, setTransaksiTotalPages] = useState(1);
    const [transaksiTotal, setTransaksiTotal] = useState(0);
    const [transaksiLoading, setTransaksiLoading] = useState(false);
    const [transaksiPerPage, setTransaksiPerPage] = useState(15);
    const [selectedTransaksiGudang, setSelectedTransaksiGudang] = useState('all');
    const [transaksiGudangList, setTransaksiGudangList] = useState([]);

    // State untuk visualisasi transaksi
    const [statusStatistics, setStatusStatistics] = useState([]);
    const [statusChartLoading, setStatusChartLoading] = useState(false);
    const [warehouseStatistics, setWarehouseStatistics] = useState([]);
    const [warehouseLoading, setWarehouseLoading] = useState(false);

    // State untuk dark mode
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

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
        // Fetch data dari Laravel API - USER: heavily filtered by site
        fetchDashboardData();
        fetchTransactionStatusData();
        fetchGudangList();
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

    // Fetch status statistics and warehouse statistics when transaksi tab is active or filter changes
    useEffect(() => {
        if (activeTab === 'transaksi') {
            fetchStatusStatistics();
            fetchWarehouseStatistics();
        }
    }, [activeTab, selectedTransaksiGudang]); // eslint-disable-line react-hooks/exhaustive-deps

    // USER: Data heavily filtered by user's site
    const fetchDashboardData = async () => {
        try {
            const userSite = user?.site || 'PJKA'; // Use user's actual site
            const response = await fetch(`/api/dashboard?user_role=user&user_site=${encodeURIComponent(userSite)}`);
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchTransactionStatusData = async () => {
        try {
            const userSite = user?.site || 'PJKA'; // Use user's actual site
            const response = await fetch(`/api/transaction-status-chart?user_role=user&user_site=${encodeURIComponent(userSite)}`);
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
            const userSite = user?.site || 'PJKA'; // Use user's actual site
            const filterParam = selectedTransaksiGudang !== 'all' ? `&filter=${encodeURIComponent(selectedTransaksiGudang)}` : '';
            const siteParam = `&user_site=${encodeURIComponent(userSite)}`;
            const roleParam = `&user_role=user`;
            const response = await fetch(`/api/transaksi?page=${page}&per_page=${perPage}${filterParam}${siteParam}${roleParam}`);
            const data = await response.json();
            
            console.log('📄 User Transaksi response:', data);
            
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
            const userSite = user?.site || 'PJKA'; // Use user's actual site
            const response = await fetch(`/api/transaksi-gudang-list?user_role=user&user_site=${encodeURIComponent(userSite)}`);
            const data = await response.json();
            console.log('🏢 User Transaksi gudang list response:', data);
            
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
            const filterParam = selectedTransaksiGudang !== 'all' ? selectedTransaksiGudang : 'all';
            // For demo, use a specific site - in real app this would come from user session
            const userSite = 'LANUD RSN'; // This should be dynamic based on logged user
            const response = await fetch(`/api/status-statistics?filter=${filterParam}&user_site=${userSite}&user_role=user`);
            const data = await response.json();
            console.log('📊 User Status statistics response:', data);
            
            if (data.status_permintaan && data.status_penerimaan && data.status_pengiriman) {
                setStatusStatistics(data);
            }
        } catch (error) {
            console.error('❌ Error fetching user status statistics:', error);
        } finally {
            setStatusChartLoading(false);
        }
    };

    const fetchWarehouseStatistics = async () => {
        try {
            setWarehouseLoading(true);
            const filterParam = selectedTransaksiGudang !== 'all' ? selectedTransaksiGudang : 'all';
            // For demo, use a specific site - in real app this would come from user session
            const userSite = 'LANUD RSN'; // This should be dynamic based on logged user
            const response = await fetch(`/api/top-active-warehouses?filter=${filterParam}&limit=10&user_site=${userSite}&user_role=user`);
            const data = await response.json();
            console.log('🏭 User Warehouse statistics response:', data);
            
            if (data.success) {
                setWarehouseStatistics(data.data);
            }
        } catch (error) {
            console.error('❌ Error fetching user warehouse statistics:', error);
        } finally {
            setWarehouseLoading(false);
        }
    };

    const fetchGudangList = async () => {
        try {
            const userSite = user?.site || 'PJKA'; // Use user's actual site
            const response = await fetch(`/api/gudang-list?user_role=user&user_site=${encodeURIComponent(userSite)}`);
            const data = await response.json();
            console.log('🏢 User Gudang list response:', data);
            
            if (data.data) {
                setGudangList(data.data);
                console.log('✅ User Gudang list set successfully with', data.data.length, 'items');
            }
        } catch (error) {
            console.error('❌ Error fetching user gudang list:', error);
        }
    };

    const fetchGudangData = async (page = 1, perPage = itemsPerPage) => {
        try {
            setLoading(true);
            
            // USER: Always filter by user's site
            const userSite = user?.site || 'PJKA'; // Use user's actual site
            const siteParam = `&user_site=${encodeURIComponent(userSite)}`;
            const roleParam = `&user_role=user`;
            const url = selectedGudang === 'all' 
                ? `/api/gudang?page=${page}&per_page=${perPage}${siteParam}${roleParam}`
                : `/api/gudang?filter=${selectedGudang}&page=${page}&per_page=${perPage}${siteParam}${roleParam}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            setGudangData(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotalItems(data.total || 0);
        } catch (error) {
            console.error('Error fetching user gudang data:', error);
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

    // State untuk chart type dan hover status
    const [activeChartType, setActiveChartType] = useState('status_permintaan');
    const [hoveredStatus, setHoveredStatus] = useState(null);
    const [statusDetailData, setStatusDetailData] = useState(null);
    const [statusDetailLoading, setStatusDetailLoading] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, side: 'right' });

    const renderStatusChart = () => {
        const currentData = statusStatistics[activeChartType] || [];
        
        if (currentData.length === 0) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className={`${getTextClasses('muted')}`}>No data available</div>
                </div>
            );
        }

        const total = currentData.reduce((sum, item) => sum + item.count, 0);
        
        const chartData = {
            labels: currentData.map(item => item.label),
            datasets: [{
                data: currentData.map(item => item.count),
                backgroundColor: [
                    '#10B981', // emerald-500 (green theme for user)
                    '#059669', // emerald-600
                    '#047857', // emerald-700
                    '#065f46', // emerald-800
                    '#064e3b', // emerald-900
                    '#34d399', // emerald-400
                    '#6ee7b7', // emerald-300
                    '#9decf9', // cyan-200
                ],
                borderColor: isDarkMode ? '#374151' : '#ffffff',
                borderWidth: 2,
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    titleColor: isDarkMode ? '#ffffff' : '#000000',
                    bodyColor: isDarkMode ? '#ffffff' : '#000000',
                    borderColor: isDarkMode ? '#6B7280' : '#e5e7eb',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        };

        const getChartTitle = () => {
            switch(activeChartType) {
                case 'status_permintaan': return 'Status Permintaan';
                case 'status_penerimaan': return 'Status Penerimaan';
                case 'status_pengiriman': return 'Status Pengiriman';
                default: return 'Status Chart';
            }
        };

        return (
            <div className="flex flex-col lg:flex-row gap-4">
                <div className={`${getCardClasses('p-4')} flex-1 lg:flex-none lg:w-3/5 h-96`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className={`text-lg font-semibold ${getTextClasses('primary')}`}>{getChartTitle()}</h3>
                        <div className={`text-sm ${getTextClasses('secondary')}`}>
                            Total: {total.toLocaleString()} transaksi
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setActiveChartType('status_permintaan')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                activeChartType === 'status_permintaan'
                                    ? 'bg-green-600 text-white'
                                    : isDarkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Permintaan
                        </button>
                        <button
                            onClick={() => setActiveChartType('status_penerimaan')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                activeChartType === 'status_penerimaan'
                                    ? 'bg-green-600 text-white'
                                    : isDarkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Penerimaan
                        </button>
                        <button
                            onClick={() => setActiveChartType('status_pengiriman')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                activeChartType === 'status_pengiriman'
                                    ? 'bg-green-600 text-white'
                                    : isDarkMode 
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pengiriman
                        </button>
                    </div>

                    <div className="h-56">
                        <Doughnut data={chartData} options={options} />
                    </div>
                </div>

                <div className={`${getCardClasses('p-4')} flex-1 lg:flex-none lg:w-2/5 h-96`}>
                    <h4 className={`text-md font-medium ${getTextClasses('primary')} mb-3`}>Detail Status</h4>
                    <div className="space-y-2">
                        {currentData.map((item, index) => {
                            const percentage = ((item.count / total) * 100).toFixed(1);
                            const backgroundColor = chartData.datasets[0].backgroundColor[index];
                            
                            return (
                                <div 
                                    key={item.label} 
                                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-green-800' 
                                            : 'bg-gray-50 hover:bg-green-50'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div 
                                            className="w-4 h-4 rounded mr-3"
                                            style={{ backgroundColor }}
                                        ></div>
                                        <span className={`text-sm font-medium ${getTextClasses('secondary')}`}>{item.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-semibold ${getTextClasses('primary')}`}>
                                            {item.count.toLocaleString()}
                                        </div>
                                        <div className={`text-xs ${getTextClasses('muted')}`}>
                                            {percentage}%
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderTopWarehouses = () => {
        if (warehouseLoading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className={`${getTextClasses('muted')}`}>Loading warehouse statistics...</div>
                </div>
            );
        }

        if (warehouseStatistics.length === 0) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className={`${getTextClasses('muted')}`}>No warehouse data available</div>
                </div>
            );
        }

        const chartData = {
            labels: warehouseStatistics.map(item => item.nama_gudang),
            datasets: [
                {
                    label: 'Outgoing',
                    data: warehouseStatistics.map(item => item.outgoing_count),
                    backgroundColor: '#10B981', // emerald-500 (green theme)
                    borderColor: '#059669', // emerald-600
                    borderWidth: 1,
                },
                {
                    label: 'Incoming', 
                    data: warehouseStatistics.map(item => item.incoming_count),
                    backgroundColor: '#34D399', // emerald-400
                    borderColor: '#10B981', // emerald-500
                    borderWidth: 1,
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        color: isDarkMode ? '#ffffff' : '#374151',
                    }
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    titleColor: isDarkMode ? '#ffffff' : '#374151',
                    bodyColor: isDarkMode ? '#ffffff' : '#374151',
                    borderColor: isDarkMode ? '#6B7280' : '#D1D5DB',
                    borderWidth: 1,
                    callbacks: {
                        afterLabel: function(context) {
                            const warehouseIndex = context.dataIndex;
                            const warehouse = warehouseStatistics[warehouseIndex];
                            return `Total Activity: ${warehouse.total_activity.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false,
                        color: isDarkMode ? '#4B5563' : '#F3F4F6',
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        color: isDarkMode ? '#ffffff' : '#374151',
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? '#4B5563' : '#F3F4F6',
                    },
                    ticks: {
                        color: isDarkMode ? '#ffffff' : '#374151',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        };

        return (
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-semibold ${getTextClasses('primary')}`}>Top Active Warehouses</h3>
                        <div className={`text-sm ${getTextClasses('secondary')}`}>
                            Top {warehouseStatistics.length} most active warehouses
                        </div>
                    </div>
                    
                    <div className="h-80">
                        <Bar data={chartData} options={options} />
                    </div>
                </div>

                <div className="lg:w-80">
                    <h4 className={`text-md font-medium ${getTextClasses('primary')} mb-3`}>Warehouse Details</h4>
                    <div className="space-y-2">
                        {warehouseStatistics.map((warehouse, index) => (
                            <div key={warehouse.nama_gudang} className={`p-3 rounded-lg ${
                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-sm font-medium ${getTextClasses('secondary')}`}>
                                        {warehouse.nama_gudang}
                                    </span>
                                    <span className={`text-sm font-semibold ${getTextClasses('primary')}`}>
                                        {warehouse.total_activity.toLocaleString()}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded bg-emerald-500 mr-2"></div>
                                        <span className={getTextClasses('secondary')}>
                                            Out: {warehouse.outgoing_count.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded bg-emerald-400 mr-2"></div>
                                        <span className={getTextClasses('secondary')}>
                                            In: {warehouse.incoming_count.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div>
                        {/* USER Dashboard - Simplified */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            <div className="flex flex-col gap-4">
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Items Site Anda</p>
                                            <p className={`text-3xl font-bold ${getTextClasses('primary')}`}>{dashboardData.items.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-green-600 text-white p-3 rounded-full">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Site Anda</p>
                                            <p className={`text-3xl font-bold ${getTextClasses('primary')}`}>1</p>
                                        </div>
                                        <div className="bg-green-700 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏛️</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex-1 ${getCardClasses('p-6')}`}>
                                <h3 className={`text-lg font-bold ${getTextClasses('primary')} mb-3 flex items-center`}>
                                    <span className="text-xl mr-2">📊</span>
                                    Ringkasan Data Site Anda
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <div className="bg-green-500 text-white p-2 rounded-full mx-auto w-8 h-8 flex items-center justify-center mb-1">
                                            <span className="text-sm">📦</span>
                                        </div>
                                        <p className={`text-lg font-bold ${getTextClasses('primary')}`}>{dashboardData.items.toLocaleString()}</p>
                                        <p className={`${getTextClasses('secondary')} text-xs`}>Total Items</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-blue-500 text-white p-2 rounded-full mx-auto w-8 h-8 flex items-center justify-center mb-1">
                                            <span className="text-sm">🏢</span>
                                        </div>
                                        <p className={`text-lg font-bold ${getTextClasses('primary')}`}>{dashboardData.gudang.toLocaleString()}</p>
                                        <p className={`${getTextClasses('secondary')} text-xs`}>Gudang</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-purple-500 text-white p-2 rounded-full mx-auto w-8 h-8 flex items-center justify-center mb-1">
                                            <span className="text-sm">💳</span>
                                        </div>
                                        <p className={`text-lg font-bold ${getTextClasses('primary')}`}>{transaksiTotal.toLocaleString()}</p>
                                        <p className={`${getTextClasses('secondary')} text-xs`}>Transaksi</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="bg-cyan-500 text-white p-2 rounded-full mx-auto w-8 h-8 flex items-center justify-center mb-1">
                                            <span className="text-sm">👤</span>
                                        </div>
                                        <p className={`text-lg font-bold ${getTextClasses('primary')}`}>1</p>
                                        <p className={`${getTextClasses('secondary')} text-xs`}>User (Anda)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row - Only Transaction Status Chart */}
                        <div className="mb-8">
                            <PieChart 
                                data={transactionStatusData} 
                                title="📈 Status Transaksi Site Anda"
                                compact={false}
                            />
                        </div>

                        {/* User Info Card */}
                        <div className={`${getCardClasses('p-6')}`}>
                            <h3 className={`text-xl font-bold ${getTextClasses('primary')} mb-4`}>Informasi User</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <h4 className={`font-semibold ${getTextClasses('primary')} mb-2`}>Data Akun</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className={getTextClasses('secondary')}>Username:</span>
                                            <span className={getTextClasses('primary')}>{user?.username}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={getTextClasses('secondary')}>Nama:</span>
                                            <span className={getTextClasses('primary')}>{user?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={getTextClasses('secondary')}>Email:</span>
                                            <span className={getTextClasses('primary')}>{user?.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={getTextClasses('secondary')}>Status:</span>
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                👤 USER
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <h4 className={`font-semibold ${getTextClasses('primary')} mb-2`}>Akses & Permissions</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                            <span className="text-green-500 mr-2">✅</span>
                                            <span className={getTextClasses('secondary')}>Lihat data gudang site</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-green-500 mr-2">✅</span>
                                            <span className={getTextClasses('secondary')}>Lihat transaksi site</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-red-500 mr-2">❌</span>
                                            <span className={getTextClasses('muted')}>Tambah user baru</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-red-500 mr-2">❌</span>
                                            <span className={getTextClasses('muted')}>Akses data site lain</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'gudang':
                return (
                    <div>
                        <div className={`${getCardClasses('p-6 mb-6')}`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold ${getTextClasses('primary')} mb-2`}>Data Gudang Site Anda</h2>
                                    <p className={`${getTextClasses('secondary')}`}>Lihat data gudang inventaris di site Anda</p>
                                </div>
                                
                                {/* Simplified dropdown for user */}
                                <div className="mt-4 md:mt-0">
                                    <label htmlFor="gudang-select" className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Filter Gudang:
                                    </label>
                                    <div className="custom-dropdown">
                                        <button
                                            id="gudang-select"
                                            type="button"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className={`relative block w-64 px-3 py-2 text-left rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 text-white' 
                                                    : 'bg-white border border-gray-300'
                                            }`}
                                        >
                                            <span className="block truncate">
                                                {selectedGudang === 'all' ? '🏢 Semua Gudang Site' : `📦 ${selectedGudang}`}
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
                                                        className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
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
                                                                ? (isDarkMode ? 'bg-green-800 text-green-300' : 'bg-green-50 text-green-700')
                                                                : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedGudang('all');
                                                            setDropdownOpen(false);
                                                            setSearchGudang('');
                                                        }}
                                                    >
                                                        🏢 Semua Gudang Site
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
                                                                        ? (isDarkMode ? 'bg-green-800 text-green-300' : 'bg-green-50 text-green-700')
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

                        {/* Info Summary */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-800 font-semibold">
                                        {selectedGudang === 'all' 
                                            ? `Total Gudang Site Anda: ${totalItems.toLocaleString()} item` 
                                            : `Data untuk: ${selectedGudang}`
                                        }
                                    </p>
                                    <p className="text-green-600 text-sm">
                                        {totalItems > 0 
                                            ? `Halaman ${currentPage} dari ${totalPages} | Menampilkan ${gudangData.length} dari ${totalItems.toLocaleString()} item` 
                                            : 'Belum ada data'
                                        }
                                    </p>
                                </div>
                                <div className="text-green-600">
                                    <span className="text-2xl">🏢</span>
                                </div>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="items-per-page" className={`text-sm font-medium ${getTextClasses('secondary')}`}>
                                            Items per page:
                                        </label>
                                        <select
                                            id="items-per-page"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(parseInt(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className={`px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 text-white' 
                                                    : 'bg-white border border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className={`text-sm ${getTextClasses('secondary')}`}>
                                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()} items
                                </div>
                            </div>
                        </div>

                        {/* Tabel Data Barang di Gudang */}
                        <div className={`${getCardClasses('p-6')}`}>
                            <h3 className={`text-lg font-bold ${getTextClasses('primary')} mb-4`}>Data Barang di Gudang Site Anda</h3>
                            
                            {gudangData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <div className={`max-h-96 overflow-y-auto rounded-lg ${
                                        isDarkMode ? 'border border-gray-600' : 'border border-gray-200'
                                    }`}>
                                        <table className="min-w-full table-auto">
                                            <thead className={`sticky top-0 ${
                                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                            }`}>
                                                <tr>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Item ID</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Part Number</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Nama Barang</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Gudang</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Rak</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Jumlah</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Satuan</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 divide-gray-600' 
                                                    : 'bg-white divide-gray-200'
                                            }`}>
                                                {gudangData.map((item, index) => (
                                                    <tr key={index} className={`${
                                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                    }`}>
                                                        <td className={`px-4 py-3 text-sm font-mono ${getTextClasses('primary')}`}>{item.item_id}</td>
                                                        <td className="px-4 py-3 text-sm text-green-600 font-semibold">{item.part_number}</td>
                                                        <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`} title={item.nama_barang}>
                                                            <div className="max-w-48 truncate">{item.nama_barang}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                🏢 {item.gudang}
                                                            </span>
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.rak || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm font-semibold text-right ${getTextClasses('primary')}`}>
                                                            {item.jumlah || '0'}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.satuan || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* Loading State */}
                                    {loading && (
                                        <div className="text-center py-4">
                                            <div className="inline-flex items-center px-4 py-2 text-sm text-green-600 bg-green-50 rounded-lg">
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                                            : 'bg-green-500 text-white hover:bg-green-600'
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
                                                                        ? 'bg-green-600 text-white'
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
                                                            : 'bg-green-500 text-white hover:bg-green-600'
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
                                            ? 'Tidak ada data barang tersedia di site Anda'
                                            : `Tidak ada data barang untuk gudang: ${selectedGudang}`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Stock Chart */}
                        <div className="mt-8">
                            <SafeStockPieChart 
                                selectedGudang={selectedGudang} 
                                title="📊 Distribusi Stock Barang Site Anda"
                                isDarkMode={isDarkMode}
                                siteFilter={user?.id_satuan}
                                userRole="user"
                            />
                        </div>
                    </div>
                );
            case 'transaksi':
                return (
                    <div className="space-y-6">
                        <div className={`${getCardClasses('p-6')}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                <span className="text-2xl mr-2">💳</span>
                                Data Transaksi Site Anda
                            </h2>
                            <div className={`text-sm ${getTextClasses('secondary')}`}>
                                Total: {transaksiTotal.toLocaleString()} transaksi
                            </div>
                        </div>

                        {/* Filter Gudang */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <label htmlFor="transaksi-gudang-filter" className={`text-sm font-medium ${getTextClasses('secondary')}`}>Filter Gudang:</label>
                                <select
                                    id="transaksi-gudang-filter"
                                    value={selectedTransaksiGudang}
                                    onChange={(e) => {
                                        const newFilter = e.target.value;
                                        console.log('🔄 User changing filter to:', newFilter);
                                        setSelectedTransaksiGudang(newFilter);
                                        setTransaksiCurrentPage(1);
                                    }}
                                    className={`px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border border-gray-600 text-white' 
                                            : 'bg-white border border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="all">Semua Gudang Site ({transaksiGudangList.length})</option>
                                    {transaksiGudangList.map((gudang, index) => (
                                        <option key={index} value={gudang.gudang}>
                                            {gudang.gudang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm text-gray-500">
                                {selectedTransaksiGudang !== 'all' && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        Filter: {selectedTransaksiGudang}
                                    </span>
                                )}
                            </div>
                        </div>

                        {transaksiLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                    <p className={`mt-4 ${getTextClasses('secondary')}`}>Loading data transaksi...</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead className={`${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                        }`}>
                                            <tr>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Nomor Dokumen</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Part Number</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Nama Barang</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Dari Gudang</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Ke Gudang</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Status Permintaan</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Status Penerimaan</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Status Pengiriman</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${
                                            isDarkMode 
                                                ? 'bg-gray-800 divide-gray-600' 
                                                : 'bg-white divide-gray-200'
                                        }`}>
                                            {transaksiData.map((item, index) => (
                                                <tr key={item.id || index} className={`${
                                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                }`}>
                                                    <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`}>{item.nomor_dokumen || '-'}</td>
                                                    <td className={`px-4 py-3 text-sm font-mono ${getTextClasses('primary')}`}>{item.part_number || '-'}</td>
                                                    <td className={`px-4 py-3 text-sm max-w-xs truncate ${getTextClasses('primary')}`} title={item.nama_barang || 'Nama barang tidak ditemukan'}>
                                                        {item.nama_barang || '-'}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.dari_gudang || '-'}</td>
                                                    <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.ke_gudang || '-'}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            item.status_permintaan === 'Diproses' 
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : item.status_permintaan === 'Selesai'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {item.status_permintaan || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            item.status_penerimaan === 'COMPLETE' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : item.status_penerimaan === 'NONE'
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {item.status_penerimaan || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            item.status_pengiriman === 'SHIPPED' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : item.status_pengiriman === 'ENTERED'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {item.status_pengiriman || '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {transaksiData.length === 0 && !transaksiLoading && (
                                    <div className="text-center py-12">
                                        <div className={`text-6xl mb-4 ${getTextClasses('muted')}`}>📄</div>
                                        <p className={`text-lg ${getTextClasses('muted')}`}>Tidak ada data transaksi di site Anda</p>
                                    </div>
                                )}

                                {/* Pagination untuk transaksi */}
                                {transaksiTotalPages > 1 && (
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className={`text-sm ${getTextClasses('secondary')}`}>
                                            Halaman {transaksiCurrentPage} dari {transaksiTotalPages} 
                                            ({transaksiTotal.toLocaleString()} total transaksi)
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handleTransaksiPrevPage}
                                                disabled={transaksiCurrentPage === 1 || transaksiLoading}
                                                className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            
                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(5, transaksiTotalPages) }, (_, i) => {
                                                let pageNum;
                                                if (transaksiTotalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (transaksiCurrentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (transaksiCurrentPage >= transaksiTotalPages - 2) {
                                                    pageNum = transaksiTotalPages - 4 + i;
                                                } else {
                                                    pageNum = transaksiCurrentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handleTransaksiPageChange(pageNum)}
                                                        disabled={transaksiLoading}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                                            transaksiCurrentPage === pageNum
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            
                                            <button
                                                onClick={handleTransaksiNextPage}
                                                disabled={transaksiCurrentPage === transaksiTotalPages || transaksiLoading}
                                                className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>

                        {/* Container untuk Status Chart */}
                        <div className={`${getCardClasses('p-6 mb-6')}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                    <span className="text-2xl mr-2">📊</span>
                                    Visualisasi Status Transaksi
                                </h2>
                            </div>

                            {statusChartLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className={`${getTextClasses('muted')}`}>Loading chart data...</div>
                                </div>
                            ) : (
                                <div className="h-auto">
                                    {renderStatusChart()}
                                </div>
                            )}
                        </div>

                        {/* Container untuk Top Active Warehouses */}
                        <div className={`${getCardClasses('p-6')}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                    <span className="text-2xl mr-2">🏭</span>
                                    Top Active Warehouses Site Anda
                                </h2>
                            </div>

                            {warehouseLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className={`${getTextClasses('muted')}`}>Loading warehouse data...</div>
                                </div>
                            ) : (
                                <div className="h-auto">
                                    {renderTopWarehouses()}
                                </div>
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
            
            {/* USER Sidebar - Green theme */}
            <aside className={`group fixed left-0 top-0 h-screen w-16 hover:w-80 backdrop-blur border-r text-white flex flex-col transition-all duration-300 ease-in-out z-50 ${
                isDarkMode 
                    ? 'bg-gray-800/95 border-green-400 sidebar-glow' 
                    : 'bg-green-900/90 border-green-500'
            }`}>
                <div className="p-4 group-hover:p-6">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-green-400 group-hover:text-3xl transition-all duration-300">U</h1>
                        <span className="ml-2 text-xl font-bold text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">SER PORTAL</span>
                    </div>
                </div>
                
                {/* Menu Navigation - Limited for User */}
                <nav className="flex-1 px-2 group-hover:px-6 transition-all duration-300">
                    <div className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                            { id: 'gudang', label: 'Gudang', icon: '🏢' },
                            { id: 'transaksi', label: 'Transaksi', icon: '💳' }
                            // Note: No 'add-user' for regular users
                        ].map(menu => (
                            <button
                                key={menu.id}
                                onClick={() => setActiveTab(menu.id)}
                                className={`w-full flex items-center space-x-3 px-2 group-hover:px-4 py-3 rounded-lg transition-all duration-300 text-left relative ${
                                    activeTab === menu.id
                                        ? 'bg-green-500 text-white'
                                        : 'text-green-300 hover:bg-green-800/50 hover:text-green-100'
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
                        className="w-full flex items-center justify-center group-hover:justify-start space-x-2 p-2 rounded-lg hover:bg-green-800/50 transition-all duration-300"
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
                <div className="p-2 group-hover:p-6 border-t border-green-500 transition-all duration-300">
                    <div className="mb-2 group-hover:mb-4">
                        <div className="text-center group-hover:text-left">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto group-hover:mx-0 mb-2 group-hover:mb-0">
                                <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">
                                <p className="font-semibold text-green-100 text-sm">{user?.name}</p>
                                <p className="text-green-400 text-xs">@{user?.username} (USER)</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-green-500 hover:bg-green-400 px-2 group-hover:px-4 py-2 rounded transition-all duration-300 flex items-center justify-center group-hover:justify-start space-x-2"
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
        </div>
    );
};

export default UserDashboard;