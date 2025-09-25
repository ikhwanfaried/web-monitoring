import React, { useState, useEffect } from 'react';
import PieChart from './PieChart';
import LineChart from './LineChart';
import SafeStockPieChart from './SafeStockPieChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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
        id_satuan: '',
        id_status: '3' // Default ke User (3)
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
        // Fetch data dari Laravel API
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

    const fetchTransaksiData = async (page = 1, perPage = 15) => {
        if (transaksiLoading) return;
        
        setTransaksiLoading(true);
        try {
            const filterParam = selectedTransaksiGudang !== 'all' ? `&filter=${encodeURIComponent(selectedTransaksiGudang)}` : '';
            const response = await fetch(`/api/transaksi?page=${page}&per_page=${perPage}${filterParam}`);
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
            const response = await fetch('/api/transaksi-gudang-list');
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
            const response = await fetch(`/api/status-statistics?filter=${selectedTransaksiGudang}`);
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
            const response = await fetch(`/api/top-active-warehouses?filter=${selectedTransaksiGudang}&limit=10`);
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
            const response = await fetch(`/api/status-detail?status_type=${statusType}&status_value=${encodeURIComponent(statusValue)}&filter=${selectedTransaksiGudang}`);
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
        
        // Convert NRP, id_satuan, dan id_status to integer
        const submitData = {
            ...addUserForm,
            NRP: parseInt(addUserForm.NRP),
            id_satuan: parseInt(addUserForm.id_satuan),
            id_status: parseInt(addUserForm.id_status)
        };
        
        console.log('Submitting user data:', submitData);
        
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
                setAddUserForm({ username: '', password: '', Nama: '', NRP: '', Email: '', id_satuan: '', id_status: '3' });
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
        setAddUserForm({ username: '', password: '', Nama: '', NRP: '', Email: '', id_satuan: '', id_status: '3' });
        setAddUserError('');
        setAddUserSuccess(false);
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

    const fetchSites = async () => {
        try {
            setSitesLoading(true);
            const response = await fetch('/api/site?page=1&per_page=1000');
            if (response.ok) {
                const result = await response.json();
                setSites(result.data || []);
                console.log('Sites loaded for modal:', result.data?.length || 0);
            } else {
                console.error('Failed to fetch sites for modal');
            }
        } catch (error) {
            console.error('Error fetching sites for modal:', error);
        } finally {
            setSitesLoading(false);
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
                    '#3B82F6', // blue-500
                    '#10B981', // emerald-500
                    '#F59E0B', // amber-500
                    '#EF4444', // red-500
                    '#8B5CF6', // violet-500
                    '#F97316', // orange-500
                    '#06B6D4', // cyan-500
                    '#84CC16', // lime-500
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
                    display: false, // Hide default legend
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
                {/* Chart Container - 60% width */}
                <div className={`${getCardClasses('p-4')} flex-1 lg:flex-none lg:w-3/5 h-96`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className={`text-lg font-semibold ${getTextClasses('primary')}`}>{getChartTitle()}</h3>
                        <div className={`text-sm ${getTextClasses('secondary')}`}>
                            Total: {total.toLocaleString()} transaksi
                        </div>
                    </div>
                    
                    {/* Toggle Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setActiveChartType('status_permintaan')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                activeChartType === 'status_permintaan'
                                    ? 'bg-blue-600 text-white'
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
                                    ? 'bg-blue-600 text-white'
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
                                    ? 'bg-blue-600 text-white'
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

                {/* Details Container - 40% width */}
                <div className={`${getCardClasses('p-4')} flex-1 lg:flex-none lg:w-2/5 h-96`}>
                        <h4 className={`text-md font-medium ${getTextClasses('primary')} mb-3`}>Detail Status</h4>
                    <div className="space-y-2">
                        {currentData.map((item, index) => {
                            const percentage = ((item.count / total) * 100).toFixed(1);
                            const backgroundColor = chartData.datasets[0].backgroundColor[index];
                            const isHovered = hoveredStatus === `${activeChartType}-${item.label}`;
                            
                            return (
                                <div 
                                    key={item.label} 
                                    className={`relative flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-blue-800' 
                                            : 'bg-gray-50 hover:bg-blue-50'
                                    }`}
                                    onMouseEnter={(e) => {
                                        const position = calculateTooltipPosition(e);
                                        setTooltipPosition(position);
                                        setHoveredStatus(`${activeChartType}-${item.label}`);
                                        fetchStatusDetail(activeChartType, item.label);
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredStatus(null);
                                        setStatusDetailData(null);
                                    }}
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

                                    {/* Tooltip with detailed breakdown */}
                                    {isHovered && statusDetailData && (
                                        <div 
                                            className={`fixed z-50 w-80 rounded-lg shadow-lg p-4 transition-all duration-200 ease-in-out ${
                                                tooltipPosition.side === 'left' ? 'transform -translate-x-full' : ''
                                            } ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-2 border-blue-400 glow-blue' 
                                                    : 'bg-white border border-gray-200'
                                            }`}
                                            style={{
                                                left: tooltipPosition.side === 'left' 
                                                    ? `${tooltipPosition.x - 8}px` 
                                                    : `${tooltipPosition.x + 8}px`,
                                                top: `${tooltipPosition.y + (tooltipPosition.yOffset || 0)}px`,
                                                maxHeight: '400px'
                                            }}
                                        >
                                            {/* Arrow indicator */}
                                            <div 
                                                className={`absolute top-4 w-0 h-0 ${
                                                    tooltipPosition.side === 'left' 
                                                        ? `right-0 transform translate-x-1 border-l-8 border-y-8 border-y-transparent ${
                                                            isDarkMode ? 'border-l-gray-800' : 'border-l-white'
                                                        }` 
                                                        : `left-0 transform -translate-x-1 border-r-8 border-y-8 border-y-transparent ${
                                                            isDarkMode ? 'border-r-gray-800' : 'border-r-white'
                                                        }`
                                                }`}
                                                style={{ filter: 'drop-shadow(-1px 0 1px rgba(0,0,0,0.1))' }}
                                            ></div>
                                            <div 
                                                className={`absolute top-4 w-0 h-0 ${
                                                    tooltipPosition.side === 'left' 
                                                        ? `right-0 transform translate-x-0.5 border-l-8 border-y-8 border-y-transparent ${
                                                            isDarkMode ? 'border-l-blue-400' : 'border-l-gray-200'
                                                        }` 
                                                        : `left-0 transform -translate-x-0.5 border-r-8 border-y-8 border-y-transparent ${
                                                            isDarkMode ? 'border-r-blue-400' : 'border-r-gray-200'
                                                        }`
                                                }`}
                                            ></div>
                                            
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className={`font-semibold ${getTextClasses('primary')}`}>
                                                    {item.label}
                                                </h5>
                                                <span className={`text-sm ${getTextClasses('muted')}`}>
                                                    {statusDetailData.total_count.toLocaleString()} total
                                                </span>
                                            </div>
                                            
                                            <div className={`text-xs ${getTextClasses('secondary')} mb-2`}>
                                                Breakdown by warehouse:
                                            </div>
                                            
                                            <div className="max-h-48 overflow-y-auto space-y-1">
                                                {statusDetailLoading ? (
                                                    <div className={`text-xs ${getTextClasses('muted')}`}>Loading...</div>
                                                ) : statusDetailData.warehouse_breakdown.slice(0, 10).map((warehouse, idx) => (
                                                    <div key={warehouse.gudang} className={`flex justify-between items-center text-xs py-1 px-2 rounded ${
                                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                    }`}>
                                                        <span className={`${getTextClasses('secondary')} truncate`} title={warehouse.gudang}>
                                                            {warehouse.gudang}
                                                        </span>
                                                        <div className="flex items-center ml-2">
                                                            <span className={`font-medium ${getTextClasses('primary')}`}>
                                                                {warehouse.count.toLocaleString()}
                                                            </span>
                                                            <span className={`${getTextClasses('muted')} ml-1`}>
                                                                {warehouse.description}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {statusDetailData.warehouse_breakdown.length > 10 && (
                                                    <div className={`text-xs ${getTextClasses('muted')} text-center py-1`}>
                                                        ... dan {statusDetailData.warehouse_breakdown.length - 10} gudang lainnya
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
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

        const maxCount = Math.max(...warehouseStatistics.map(item => item.total_activity));
        
        const chartData = {
            labels: warehouseStatistics.map(item => item.nama_gudang),
            datasets: [
                {
                    label: 'Outgoing',
                    data: warehouseStatistics.map(item => item.outgoing_count),
                    backgroundColor: '#3B82F6', // blue-500
                    borderColor: '#1D4ED8', // blue-700
                    borderWidth: 1,
                },
                {
                    label: 'Incoming', 
                    data: warehouseStatistics.map(item => item.incoming_count),
                    backgroundColor: '#10B981', // emerald-500
                    borderColor: '#047857', // emerald-700
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
                {/* Chart */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-lg font-semibold ${getTextClasses('primary')}`}>Top Active Warehouses</h3>
                        <div className={`text-sm ${getTextClasses('secondary')}`}>
                            Top {warehouseStatistics.length} most active warehouses
                        </div>
                    </div>
                    
                    <div className="h-64">
                        <Bar data={chartData} options={options} />
                    </div>
                </div>

                {/* Details */}
                <div className="lg:w-80">
                    <h4 className={`text-md font-medium ${getTextClasses('primary')} mb-3`}>Warehouse Details</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
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
                                        <div className="w-2 h-2 rounded bg-blue-500 mr-2"></div>
                                        <span className={getTextClasses('secondary')}>
                                            Out: {warehouse.outgoing_count.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 rounded bg-emerald-500 mr-2"></div>
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
                        {/* Layout baru: Gudang-Site (kiri) dan Login Statistics (kanan) */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            {/* Kolom Kiri: Gudang dan Site (atas-bawah) */}
                            <div className="flex flex-col gap-4">
                                {/* Box Gudang */}
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Gudang</p>
                                            <p className={`text-3xl font-bold ${getTextClasses('primary')}`}>{dashboardData.gudang.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-blue-600 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏢</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Box Site */}
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Site</p>
                                            <p className={`text-3xl font-bold ${getTextClasses('primary')}`}>{dashboardData.site.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-blue-700 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏛️</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kolom Kanan: Login Statistics */}
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
                return (
                    <div>
                        {/* Header dengan Dropdown */}
                        <div className={`${getCardClasses('p-6 mb-6')}`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold ${getTextClasses('primary')} mb-2`}>Data Gudang</h2>
                                    <p className={`${getTextClasses('secondary')}`}>Kelola dan pantau data gudang inventaris</p>
                                </div>
                                
                                {/* Dropdown Pilihan Gudang */}
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
                                                {/* Search Input */}
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
                                                
                                                {/* Gudang Options */}
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
                                            className={`px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 text-white' 
                                                    : 'bg-white border border-gray-300 text-gray-900'
                                            }`}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
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
                            <h3 className={`text-lg font-bold ${getTextClasses('primary')} mb-4`}>Data Barang di Gudang</h3>
                            
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
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Harga</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Status</th>
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
                                                        <td className="px-4 py-3 text-sm text-blue-600 font-semibold">{item.part_number}</td>
                                                        <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`} title={item.nama_barang}>
                                                            <div className="max-w-48 truncate">{item.nama_barang}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                🏢 {item.gudang}
                                                            </span>
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.rak || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm font-semibold text-right ${getTextClasses('primary')}`}>
                                                            {item.jumlah || '0'}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.satuan || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm text-right ${getTextClasses('primary')}`}>-</td>
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
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    </div>
                );
            case 'transaksi':
                return (
                    <div className="space-y-6">
                        {/* Container untuk Table Transaksi */}
                        <div className={`${getCardClasses('p-6')} max-h-[600px]`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                <span className="text-2xl mr-2">💳</span>
                                Data Transaksi
                            </h2>
                            <div className={`text-sm ${getTextClasses('secondary')}`}>
                                Total: {transaksiTotal.toLocaleString()} transaksi
                            </div>
                        </div>

                        {/* Filter Gudang */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <label className={`text-sm font-medium ${getTextClasses('secondary')}`}>Filter Gudang:</label>
                                <select
                                    value={selectedTransaksiGudang}
                                    onChange={(e) => {
                                        const newFilter = e.target.value;
                                        console.log('🔄 Changing filter to:', newFilter);
                                        setSelectedTransaksiGudang(newFilter);
                                        setTransaksiCurrentPage(1);
                                        // Note: fetchTransaksiData will be called by useEffect
                                    }}
                                    className={`px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        isDarkMode 
                                            ? 'bg-gray-700 border border-gray-600 text-white' 
                                            : 'bg-white border border-gray-300 text-gray-900'
                                    }`}
                                >
                                    <option value="all">Semua Gudang ({transaksiGudangList.length})</option>
                                    {transaksiGudangList.map((gudang, index) => (
                                        <option key={index} value={gudang.gudang}>
                                            {gudang.gudang}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-sm text-gray-500">
                                {selectedTransaksiGudang !== 'all' && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Filter: {selectedTransaksiGudang}
                                    </span>
                                )}
                            </div>
                        </div>

                        {transaksiLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className={`mt-4 ${getTextClasses('secondary')}`}>Loading data transaksi...</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="overflow-auto max-h-64 border rounded">
                                    <table className="w-full table-fixed text-sm">
                                        <thead className={`${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                        }`}>
                                            <tr>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20`}>No. Dok</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-24`}>Part No</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-32`}>Nama Barang</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20`}>Dari</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20`}>Ke</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20`}>Reg</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-16`}>Req</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-16`}>Rcv</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-16`}>Ship</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-16`}>Site</th>
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
                                                    <td className={`px-2 py-2 text-xs font-medium ${getTextClasses('primary')} truncate`} title={item.nomor_dokumen}>{item.nomor_dokumen || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs font-mono ${getTextClasses('primary')} truncate`} title={item.part_number}>{item.part_number || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('primary')} truncate`} title={item.nama_barang || 'Nama barang tidak ditemukan'}>
                                                        {item.nama_barang || '-'}
                                                    </td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.dari_gudang}>{item.dari_gudang || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.ke_gudang}>{item.ke_gudang || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.dipasang_di_no_reg_sista}>{item.dipasang_di_no_reg_sista || '-'}</td>
                                                    <td className="px-2 py-2 text-xs">
                                                        <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${
                                                            item.status_permintaan === 'Diproses' 
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : item.status_permintaan === 'Selesai'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`} title={item.status_permintaan}>
                                                            {item.status_permintaan?.substring(0,3) || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-2 text-xs">
                                                        <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${
                                                            item.status_penerimaan === 'COMPLETE' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : item.status_penerimaan === 'NONE'
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`} title={item.status_penerimaan}>
                                                            {item.status_penerimaan?.substring(0,3) || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-2 text-xs">
                                                        <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded ${
                                                            item.status_pengiriman === 'SHIPPED' 
                                                                ? 'bg-green-100 text-green-800'
                                                                : item.status_pengiriman === 'ENTERED'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`} title={item.status_pengiriman}>
                                                            {item.status_pengiriman?.substring(0,3) || '-'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.site}>{item.site || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {transaksiData.length === 0 && !transaksiLoading && (
                                    <div className="text-center py-12">
                                        <div className={`text-6xl mb-4 ${getTextClasses('muted')}`}>📄</div>
                                        <p className={`text-lg ${getTextClasses('muted')}`}>Tidak ada data transaksi</p>
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
                                                                ? 'bg-blue-600 text-white'
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
                        <div className={`${getCardClasses('p-6')} max-h-[600px]`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                    <span className="text-2xl mr-2">🏭</span>
                                    Top Active Warehouses
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
            {/* Fixed Collapsible Sidebar */}
            <aside className={`group fixed left-0 top-0 h-screen w-16 hover:w-80 backdrop-blur border-r text-white flex flex-col transition-all duration-300 ease-in-out z-50 ${
                isDarkMode 
                    ? 'bg-gray-800/95 border-green-400 sidebar-glow' 
                    : 'bg-cyan-900/90 border-cyan-500'
            }`}>
                <div className="p-4 group-hover:p-6">
                    <div className="flex items-center">
                        <div className="w-8 h-8 group-hover:w-10 group-hover:h-10 transition-all duration-300 flex-shrink-0">
                            <img 
                                src="/images/Lambang_TNI_AU.png" 
                                alt="Logo TNI AU" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="ml-3 text-xl font-bold text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 whitespace-nowrap">AIRLOGS</span>
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
                
                {/* Dark Mode Toggle */}
                <div className="px-2 group-hover:px-6 py-2 transition-all duration-300 overflow-hidden">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-center group-hover:justify-start space-x-2 p-2 rounded-lg hover:bg-cyan-800/50 transition-all duration-300 overflow-hidden"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        <span className="text-lg flex-shrink-0">
                            {isDarkMode ? '☀️' : '🌙'}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 text-sm font-medium whitespace-nowrap overflow-hidden">
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </button>
                </div>
                
                {/* User info dan logout di bawah */}
                <div className="p-2 group-hover:p-6 border-t border-cyan-500 transition-all duration-300 overflow-hidden">
                    <div className="mb-2 group-hover:mb-4">
                        <div className="flex flex-col items-center text-center w-full">
                            <p className="font-semibold text-cyan-100 text-sm truncate opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">{user?.name}</p>
                            <p className="text-cyan-400 text-xs truncate opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">{user?.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 px-2 group-hover:px-4 py-2 rounded transition-all duration-300 flex items-center justify-center group-hover:justify-start space-x-2 overflow-hidden"
                        title="Logout"
                    >
                        <span className="text-sm flex-shrink-0">🚪</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 text-sm font-medium whitespace-nowrap overflow-hidden">
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

            {/* Modal Add User */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-700">Tambah User Baru</h2>
                            <button
                                onClick={closeAddUserModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Masukkan email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                                    {sitesLoading ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                                            Memuat data site...
                                        </div>
                                    ) : (
                                        <select
                                            name="id_satuan"
                                            value={addUserForm.id_satuan}
                                            onChange={handleAddUserChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="">Pilih Site</option>
                                            {sites.map((site) => (
                                                <option key={site.id} value={site.id}>
                                                    {site.Location}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select
                                        name="id_status"
                                        value={addUserForm.id_status}
                                        onChange={handleAddUserChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="1">Super Admin</option>
                                        <option value="2">Admin</option>
                                        <option value="3">User</option>
                                    </select>
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
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition"
                                >
                                    {addUserLoading ? 'Menyimpan...' : 'Tambah User'}
                                </button>
                            </div>
                            
                            {addUserSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-green-400 text-xl mr-2">✅</span>
                                        <p className="text-sm font-medium text-green-800">
                                            User berhasil ditambahkan!
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

export default WebMonitoringApp;
