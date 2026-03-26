import React, { useState, useEffect } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import SafeStockPieChart from './SafeStockPieChart';
import SuccessModal from './SuccessModal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AdminDashboard = ({ user }) => {
    // Early return if user data is not available
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-blue-300">Loading admin dashboard...</p>
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
    const [filterItemId, setFilterItemId] = useState('');
    const [filterPartNumber, setFilterPartNumber] = useState('');
    const [filterNamaBarang, setFilterNamaBarang] = useState('all');
    const [namaBarangDropdownOpen, setNamaBarangDropdownOpen] = useState(false);
    const [searchNamaBarang, setSearchNamaBarang] = useState('');
    const [namaBarangList, setNamaBarangList] = useState([]);

    // State untuk transaksi
    const [transaksiData, setTransaksiData] = useState([]);
    const [transaksiCurrentPage, setTransaksiCurrentPage] = useState(1);
    const [transaksiTotalPages, setTransaksiTotalPages] = useState(1);
    const [transaksiTotal, setTransaksiTotal] = useState(0);
    const [transaksiGudangDropdownOpen, setTransaksiGudangDropdownOpen] = useState(false);
    const [searchTransaksiGudang, setSearchTransaksiGudang] = useState('');
    const [transaksiLoading, setTransaksiLoading] = useState(false);
    const [transaksiPerPage, setTransaksiPerPage] = useState(15);
    const [showAll, setShowAll] = useState(false);
    const [selectedTransaksiGudang, setSelectedTransaksiGudang] = useState('all');
    const [selectedTransaksiGudangTujuan, setSelectedTransaksiGudangTujuan] = useState('all');
    const [transaksiGudangTujuanDropdownOpen, setTransaksiGudangTujuanDropdownOpen] = useState(false);
    const [searchTransaksiGudangTujuan, setSearchTransaksiGudangTujuan] = useState('');
    const [transaksiGudangList, setTransaksiGudangList] = useState([]);
    const [filterTransaksiNoDok, setFilterTransaksiNoDok] = useState('');
    const [filterTransaksiPartNumber, setFilterTransaksiPartNumber] = useState('');
    const [filterTransaksiNoReg, setFilterTransaksiNoReg] = useState('');
    const [filterTransaksiNamaBarang, setFilterTransaksiNamaBarang] = useState('all');
    const [transaksiNamaBarangDropdownOpen, setTransaksiNamaBarangDropdownOpen] = useState(false);
    const [searchTransaksiNamaBarang, setSearchTransaksiNamaBarang] = useState('');
    const [transaksiNamaBarangList, setTransaksiNamaBarangList] = useState([]);

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
    
    // State untuk pagination tooltip
    const [tooltipPage, setTooltipPage] = useState(1);
    const tooltipPerPage = 5;

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
        siteid: user?.siteid || '', // Admin hanya bisa menambah user di site mereka sendiri
        gudang: '' // Tambahan field untuk gudang
    });
    const [addUserLoading, setAddUserLoading] = useState(false);
    const [addUserSuccess, setAddUserSuccess] = useState(false);
    const [addUserError, setAddUserError] = useState('');
    const [sites, setSites] = useState([]);
    const [sitesLoading, setSitesLoading] = useState(true);
    const [gudangListForUser, setGudangListForUser] = useState([]); // List gudang untuk dropdown
    const [gudangForUserLoading, setGudangForUserLoading] = useState(false);

    // State untuk modal gudang dan site
    const [showGudangModal, setShowGudangModal] = useState(false);
    const [showSiteModal, setShowSiteModal] = useState(false);
    const [gudangModalData, setGudangModalData] = useState([]);
    const [gudangModalPage, setGudangModalPage] = useState(1);
    const [gudangModalTotal, setGudangModalTotal] = useState(0);
    const [gudangModalTotalPages, setGudangModalTotalPages] = useState(1);
    const [gudangModalLoading, setGudangModalLoading] = useState(false);
    const [siteModalData, setSiteModalData] = useState([]);
    const [siteModalPage, setSiteModalPage] = useState(1);
    const [siteModalTotal, setSiteModalTotal] = useState(0);
    const [siteModalTotalPages, setSiteModalTotalPages] = useState(1);
    const [siteModalLoading, setSiteModalLoading] = useState(false);

    // State untuk form add gudang (admin)
    const [showAddGudangModal, setShowAddGudangModal] = useState(false);
    const [addGudangForm, setAddGudangForm] = useState({ location: '' });
    const [addGudangLoading, setAddGudangLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Simple tab change function
    const changeTab = (tabName) => {
        setActiveTab(tabName);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
            });
            
            if (response.ok) {
                window.location.href = '/login';
            } else {
                console.error('Logout failed');
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/login';
        }
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
        fetchNamaBarangList();
        fetchTransaksiNamaBarangList();
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
    }, [selectedGudang, filterItemId, filterPartNumber, filterNamaBarang, activeTab, itemsPerPage, transaksiPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect terpisah untuk filter transaksi gudang
    useEffect(() => {
        if (activeTab === 'transaksi' && selectedTransaksiGudang) {
            setTransaksiCurrentPage(1);
            fetchTransaksiData(1, transaksiPerPage);
        }
    }, [selectedTransaksiGudang, selectedTransaksiGudangTujuan, filterTransaksiNoDok, filterTransaksiPartNumber, filterTransaksiNoReg, filterTransaksiNamaBarang]); // eslint-disable-line react-hooks/exhaustive-deps

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
    }, [activeTab, selectedTransaksiGudang, selectedTransaksiGudangTujuan, filterTransaksiNoDok, filterTransaksiPartNumber, filterTransaksiNoReg, filterTransaksiNamaBarang]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.custom-dropdown')) {
                setDropdownOpen(false);
            }
            if (transaksiGudangDropdownOpen && !event.target.closest('.custom-dropdown-transaksi')) {
                setTransaksiGudangDropdownOpen(false);
            }
            if (transaksiGudangTujuanDropdownOpen && !event.target.closest('.custom-dropdown-transaksi-tujuan')) {
                setTransaksiGudangTujuanDropdownOpen(false);
            }
            if (namaBarangDropdownOpen && !event.target.closest('.custom-dropdown-namabarang')) {
                setNamaBarangDropdownOpen(false);
            }
            if (transaksiNamaBarangDropdownOpen && !event.target.closest('.custom-dropdown-transaksi-namabarang')) {
                setTransaksiNamaBarangDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen, transaksiGudangDropdownOpen, transaksiGudangTujuanDropdownOpen, namaBarangDropdownOpen, transaksiNamaBarangDropdownOpen]);

    // Fetch gudang modal data when modal opens
    useEffect(() => {
        if (showGudangModal) {
            setGudangModalPage(1);
            fetchGudangModalData(1);
        }
    }, [showGudangModal]);

    // Fetch site modal data when modal opens
    useEffect(() => {
        if (showSiteModal) {
            setSiteModalPage(1);
            fetchSiteModalData(1);
        }
    }, [showSiteModal]);

    // ADMIN: Data filtered by user's site
    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`/api/dashboard?user_role=admin&site_filter=${encodeURIComponent(user?.site)}`);
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchLoginLogs = async () => {
        try {
            const response = await fetch(`/api/login-logs?siteid=${user?.siteid}`);
            const data = await response.json();
            setLoginLogs(data.data || []);
        } catch (error) {
            console.error('Error fetching login logs:', error);
        }
    };

    const fetchLoginStats = async () => {
        try {
            const response = await fetch(`/api/login-stats?siteid=${user?.siteid}`);
            const data = await response.json();
            setLoginStats(data);
        } catch (error) {
            console.error('Error fetching login stats:', error);
        }
    };

    const fetchTransactionStatusData = async () => {
        try {
            const response = await fetch(`/api/transaction-status-chart?siteid=${user?.siteid}`);
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
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('per_page', perPage);
            params.append('site_filter', user?.site);
            params.append('user_role', 'admin');
            
            if (selectedTransaksiGudang !== 'all') {
                params.append('filter_from', selectedTransaksiGudang);
            }
            
            if (selectedTransaksiGudangTujuan !== 'all') {
                params.append('filter_to', selectedTransaksiGudangTujuan);
            }
            
            if (filterTransaksiNoDok) {
                params.append('filter_nodok', filterTransaksiNoDok);
            }
            
            if (filterTransaksiPartNumber) {
                params.append('filter_partnumber', filterTransaksiPartNumber);
            }
            
            if (filterTransaksiNoReg) {
                params.append('filter_noreg', filterTransaksiNoReg);
            }
            
            if (filterTransaksiNamaBarang !== 'all') {
                params.append('filter_namabarang', filterTransaksiNamaBarang);
            }
            
            console.log('🔍 Fetching transaksi with params:', { page, perPage, filterFrom: selectedTransaksiGudang, filterTo: selectedTransaksiGudangTujuan, site: user?.site });
            const response = await fetch(`/api/transaksi?${params.toString()}`);
            const data = await response.json();
            
            console.log('📄 Transaksi response:', data);
            console.log('📄 Transaksi data array:', data.data);
            console.log('📄 Transaksi data length:', data.data?.length);
            
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
            const response = await fetch(`/api/transaksi-gudang-list?site_filter=${encodeURIComponent(user?.site)}&user_role=admin`);
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
            
            // Build query params with all transaksi filters
            const params = new URLSearchParams();
            params.append('filter', selectedTransaksiGudang);
            params.append('site_filter', user?.site || '');
            params.append('user_role', 'admin');
            
            if (filterTransaksiNoDok) {
                params.append('filter_nodok', filterTransaksiNoDok);
            }
            if (filterTransaksiPartNumber) {
                params.append('filter_partnumber', filterTransaksiPartNumber);
            }
            if (filterTransaksiNoReg) {
                params.append('filter_noreg', filterTransaksiNoReg);
            }
            if (filterTransaksiNamaBarang && filterTransaksiNamaBarang !== 'all') {
                params.append('filter_namabarang', filterTransaksiNamaBarang);
            }
            if (selectedTransaksiGudang && selectedTransaksiGudang !== 'all') {
                params.append('filter_from', selectedTransaksiGudang);
            }
            if (selectedTransaksiGudangTujuan && selectedTransaksiGudangTujuan !== 'all') {
                params.append('filter_to', selectedTransaksiGudangTujuan);
            }
            
            const response = await fetch(`/api/status-statistics?${params.toString()}`);
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
            
            // Build query params with all transaksi filters
            const params = new URLSearchParams();
            params.append('filter', selectedTransaksiGudang);
            params.append('limit', '10');
            params.append('site_filter', user?.site || '');
            params.append('user_role', 'admin');
            
            if (filterTransaksiNoDok) {
                params.append('filter_nodok', filterTransaksiNoDok);
            }
            if (filterTransaksiPartNumber) {
                params.append('filter_partnumber', filterTransaksiPartNumber);
            }
            if (filterTransaksiNoReg) {
                params.append('filter_noreg', filterTransaksiNoReg);
            }
            if (filterTransaksiNamaBarang && filterTransaksiNamaBarang !== 'all') {
                params.append('filter_namabarang', filterTransaksiNamaBarang);
            }
            if (selectedTransaksiGudang && selectedTransaksiGudang !== 'all') {
                params.append('filter_from', selectedTransaksiGudang);
            }
            if (selectedTransaksiGudangTujuan && selectedTransaksiGudangTujuan !== 'all') {
                params.append('filter_to', selectedTransaksiGudangTujuan);
            }
            
            const response = await fetch(`/api/top-active-warehouses?${params.toString()}`);
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
            
            // Build query parameters
            const params = new URLSearchParams({
                status_type: statusType,
                status_value: statusValue,
                filter: selectedTransaksiGudang,
                site_filter: user?.site || '',
                user_role: 'admin'
            });
            
            // Add additional filters if they exist
            if (filterTransaksiNoDok) params.append('filter_nodok', filterTransaksiNoDok);
            if (filterTransaksiPartNumber) params.append('filter_partnumber', filterTransaksiPartNumber);
            if (filterTransaksiNoReg) params.append('filter_noreg', filterTransaksiNoReg);
            if (filterTransaksiNamaBarang && filterTransaksiNamaBarang !== 'all') {
                params.append('filter_namabarang', filterTransaksiNamaBarang);
            }
            
            const response = await fetch(`/api/status-detail?${params.toString()}`);
            const data = await response.json();
            console.log('📋 Status detail response:', data);
            console.log('📦 Warehouse breakdown:', data.data?.warehouse_breakdown);
            
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
        const tooltipWidth = 600;
        const tooltipHeight = 500;
        const padding = 20;
        
        // Get cursor position from event
        const cursorX = event.clientX || (window.innerWidth / 2);
        const cursorY = event.clientY || (window.innerHeight / 2);
        
        // Calculate initial position (cursor at center of tooltip)
        let x = cursorX - (tooltipWidth / 2);
        let y = cursorY - (tooltipHeight / 2);
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust if tooltip goes outside viewport (left/right)
        if (x < padding) {
            x = padding;
        } else if (x + tooltipWidth > viewportWidth - padding) {
            x = viewportWidth - tooltipWidth - padding;
        }
        
        // Adjust if tooltip goes outside viewport (top/bottom)
        if (y < padding) {
            y = padding;
        } else if (y + tooltipHeight > viewportHeight - padding) {
            y = viewportHeight - tooltipHeight - padding;
        }
        
        setTooltipPosition({ x, y });
    };

    // Handle bar chart click to show tooltip
    const handleBarClick = async (barItem, event) => {
        const statusType = 'status_pengiriman';
        const statusValue = barItem.name;
        
        // Fetch status detail data
        await fetchStatusDetail(statusType, statusValue);
        
        // Calculate tooltip position
        calculateTooltipPosition(event);
        
        // Set hovered status to show tooltip
        setHoveredStatus({
            type: statusType,
            value: statusValue,
            label: barItem.name,
            count: barItem.value
        });
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
            siteid: parseInt(user?.siteid), // Force admin's site
            id_status: 3, // Force user status
            locid: addUserForm.gudang ? parseInt(addUserForm.gudang) : null // Send location ID as locid
        };
        
        // Remove gudang from submitData as we're sending locid instead
        delete submitData.gudang;
        
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
                    siteid: user?.siteid || '' 
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
            siteid: user?.siteid || '',
            gudang: '' 
        });
        setAddUserError('');
        setAddUserSuccess(false);
    };

    const fetchGudangList = async () => {
        try {
            const response = await fetch(`/api/gudang-list?site_filter=${user?.siteid}`);
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
            const response = await fetch(`/api/site/${user?.siteid}`);
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

    // Fetch gudang list untuk dropdown di modal add user (filter by admin's site)
    const fetchGudangForUser = async () => {
        try {
            setGudangForUserLoading(true);
            const response = await fetch(`/api/gudang-list?site_filter=${user?.siteid}&user_role=admin`);
            const data = await response.json();
            console.log('🏢 Gudang for user dropdown:', data);
            
            if (data.data && Array.isArray(data.data)) {
                setGudangListForUser(data.data);
                console.log('✅ Gudang list for user loaded:', data.data.length, 'items');
            } else {
                setGudangListForUser([]);
            }
        } catch (error) {
            console.error('❌ Error fetching gudang for user:', error);
            setGudangListForUser([]);
        } finally {
            setGudangForUserLoading(false);
        }
    };

    // Fetch nama barang list untuk dropdown filter gudang
    const fetchNamaBarangList = async () => {
        try {
            const response = await fetch(`/api/nama-barang-list?site_filter=${encodeURIComponent(user?.site)}&user_role=admin`);
            const data = await response.json();
            if (data.data) {
                setNamaBarangList(data.data);
            }
        } catch (error) {
            console.error('Error fetching nama barang list:', error);
        }
    };

    // Fetch nama barang list untuk dropdown filter transaksi
    const fetchTransaksiNamaBarangList = async () => {
        try {
            const response = await fetch(`/api/transaksi-nama-barang-list?site_filter=${encodeURIComponent(user?.site)}&user_role=admin`);
            const data = await response.json();
            if (data.data) {
                setTransaksiNamaBarangList(data.data);
            }
        } catch (error) {
            console.error('Error fetching transaksi nama barang list:', error);
        }
    };

    const fetchGudangData = async (page = 1, perPage = itemsPerPage) => {
        try {
            setLoading(true);
            
            // Build filter parameters
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('per_page', perPage);
            params.append('site_filter', user?.site);
            params.append('user_role', 'admin');
            
            if (selectedGudang !== 'all') {
                params.append('filter', selectedGudang);
            }
            
            if (filterItemId) {
                params.append('filter_itemid', filterItemId);
            }
            
            if (filterPartNumber) {
                params.append('filter_partnumber', filterPartNumber);
            }
            
            if (filterNamaBarang !== 'all') {
                params.append('filter_namabarang', filterNamaBarang);
            }
            
            const url = `/api/gudang?${params.toString()}`;
            console.log('🔄 Admin fetching gudang data from URL:', url);
            const response = await fetch(url);
            const data = await response.json();
            console.log('📦 Admin Gudang data response:', data);
            console.log('📦 Admin Gudang Total Items:', data.total);
            console.log('📦 Admin Gudang Current Page Items:', data.data?.length);
            
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

    // Fungsi untuk fetch data gudang modal (filtered by user site)
    const fetchGudangModalData = async (page = 1) => {
        try {
            setGudangModalLoading(true);
            console.log('🔄 Fetching gudang modal data, page:', page);
            
            // Filter by admin's site
            const response = await fetch(`/api/gudang-modal?page=${page}&per_page=10&site_filter=${encodeURIComponent(user?.site)}`);
            const result = await response.json();
            console.log('📊 Gudang modal response:', result);
            
            if (result.success) {
                setGudangModalData(result.data || []);
                setGudangModalPage(parseInt(result.pagination.current_page));
                setGudangModalTotal(result.pagination.total);
                setGudangModalTotalPages(result.pagination.total_pages);
                console.log('✅ Gudang modal data loaded:', result.data?.length || 0, 'items');
            }
        } catch (error) {
            console.error('❌ Error fetching gudang modal data:', error);
        } finally {
            setGudangModalLoading(false);
        }
    };

    // Fungsi untuk fetch data site modal (filtered by user site)
    const fetchSiteModalData = async (page = 1) => {
        try {
            setSiteModalLoading(true);
            console.log('🔄 Fetching site modal data, page:', page);
            
            // Filter by admin's site
            const response = await fetch(`/api/site-modal?page=${page}&per_page=10&site_filter=${encodeURIComponent(user?.site)}`);
            const result = await response.json();
            console.log('📊 Site modal response:', result);
            
            if (result.success) {
                setSiteModalData(result.data || []);
                setSiteModalPage(parseInt(result.pagination.current_page));
                setSiteModalTotal(result.pagination.total);
                setSiteModalTotalPages(result.pagination.total_pages);
                console.log('✅ Site modal data loaded:', result.data?.length || 0, 'items');
            }
        } catch (error) {
            console.error('❌ Error fetching site modal data:', error);
        } finally {
            setSiteModalLoading(false);
        }
    };

    // Fungsi untuk menambah gudang (admin - auto site)
    const handleAddGudang = async (e) => {
        e.preventDefault();
        setAddGudangLoading(true);
        try {
            // Get site ID from user's site
            const siteResponse = await fetch(`/api/site-list`);
            const siteResult = await siteResponse.json();
            
            if (!siteResult.success) {
                alert('Gagal mendapatkan data site');
                return;
            }

            // Find site ID yang sesuai dengan user site
            const userSiteData = siteResult.data.find(s => s.siteid === user?.site);
            
            if (!userSiteData) {
                alert('Site tidak ditemukan');
                return;
            }

            const response = await fetch('/api/gudang/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: addGudangForm.location,
                    idsite: userSiteData.id // Otomatis menggunakan site admin
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setSuccessMessage('Gudang berhasil ditambahkan! 🎉');
                setShowSuccessModal(true);
                setShowAddGudangModal(false);
                setAddGudangForm({ location: '' });
                fetchGudangModalData(1); // Refresh data from page 1
                fetchDashboardData(); // Update counter
            } else {
                alert(result.message || 'Gagal menambahkan gudang');
            }
        } catch (error) {
            console.error('Error adding gudang:', error);
            alert('Terjadi kesalahan saat menambahkan gudang');
        } finally {
            setAddGudangLoading(false);
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

    // Render function for status chart visualization
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
                                        calculateTooltipPosition(e);
                                        setHoveredStatus(`${activeChartType}-${item.label}`);
                                        setTooltipPage(1);
                                        fetchStatusDetail(activeChartType, item.label);
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredStatus(null);
                                        setStatusDetailData(null);
                                        setTooltipPage(1);
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
                                    
                                    {/* Tooltip */}
                                    {isHovered && statusDetailData && (
                                        <div 
                                            className={`fixed z-[9999] w-[600px] max-h-[500px] overflow-y-auto shadow-2xl rounded-lg border ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-gray-600 text-white' 
                                                    : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                            style={{
                                                left: `${tooltipPosition.x}px`,
                                                top: `${tooltipPosition.y}px`,
                                                pointerEvents: 'auto'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="p-6">
                                                <h5 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    Detail: {item.label}
                                                </h5>
                                                
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className={`text-base font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            Total Transaksi:
                                                        </p>
                                                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {statusDetailData.total_count?.toLocaleString() || 0}
                                                        </p>
                                                    </div>
                                                    
                                                    {statusDetailData.warehouse_breakdown && statusDetailData.warehouse_breakdown.length > 0 && (
                                                        <div>
                                                            <p className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                Breakdown per Gudang:
                                                            </p>
                                                            <div className="space-y-2">
                                                                {statusDetailData.warehouse_breakdown
                                                                    .slice((tooltipPage - 1) * tooltipPerPage, tooltipPage * tooltipPerPage)
                                                                    .map((warehouse, idx) => (
                                                                    <div 
                                                                        key={idx} 
                                                                        className={`flex justify-between items-center p-3 rounded-lg ${
                                                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                                                                        }`}
                                                                    >
                                                                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                            {warehouse.gudang || 'Unknown'}
                                                                        </span>
                                                                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                            {warehouse.count?.toLocaleString() || 0}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            
                                                            {/* Pagination Controls */}
                                                            {statusDetailData.warehouse_breakdown.length > tooltipPerPage && (
                                                                <div className="mt-4 flex items-center justify-between">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTooltipPage(prev => Math.max(1, prev - 1));
                                                                        }}
                                                                        disabled={tooltipPage === 1}
                                                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                                            tooltipPage === 1
                                                                                ? isDarkMode 
                                                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                                : isDarkMode
                                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                                        }`}
                                                                    >
                                                                        Previous
                                                                    </button>
                                                                    
                                                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                        Showing {((tooltipPage - 1) * tooltipPerPage) + 1} - {Math.min(tooltipPage * tooltipPerPage, statusDetailData.warehouse_breakdown.length)} of {statusDetailData.warehouse_breakdown.length}
                                                                    </span>
                                                                    
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTooltipPage(prev => Math.min(Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage), prev + 1));
                                                                        }}
                                                                        disabled={tooltipPage >= Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage)}
                                                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                                                            tooltipPage >= Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage)
                                                                                ? isDarkMode 
                                                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                                : isDarkMode
                                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                                        }`}
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
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

    // Render function for top active warehouses
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
                        {/* Same dashboard layout but with filtered data */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            <div className="flex flex-col gap-4">
                                <div className={`${getCardClasses('p-6 w-72 cursor-pointer hover:shadow-lg transition-shadow')} `}
                                    onClick={() => setShowGudangModal(true)}
                                >
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
                                
                                <div className={`${getCardClasses('p-6 w-72 cursor-pointer hover:shadow-lg transition-shadow')}`}
                                    onClick={() => setShowSiteModal(true)}
                                >
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
                                        { label: 'Hari Ini', value: loginStats.today, color: 'bg-blue-500', icon: '📅' },
                                        { label: 'Berhasil', value: loginStats.successful, color: 'bg-blue-600', icon: '✅' },
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
                                <div className={`${getCardClasses('p-6')}`}>
                                    <BarChart 
                                        data={transactionStatusData} 
                                        title="📈 Status Transaksi"
                                        compact={false}
                                        onBarClick={handleBarClick}
                                    />
                                </div>
                            </div>

                            {/* Daily Login Chart */}
                            <div className="flex-1">
                                <LineChart title="📈 Grafik Login Harian (30 Hari Terakhir)" siteFilter={user?.site} />
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
                                                                ? 'bg-blue-100 text-blue-800'
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
                        {/* Single Container for: Title, Total, Filter, and Table */}
                        <div className={`${getCardClasses('p-6 mb-6')} ${namaBarangDropdownOpen || dropdownOpen ? 'overflow-visible' : ''}`}>
                            {/* Header: Title and Total */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <h2 className={`text-2xl font-bold ${getTextClasses('primary')} mb-1`}>Data Gudang</h2>
                                    <p className={`text-sm ${getTextClasses('secondary')}`}>
                                        Total: {totalItems.toLocaleString()} item | Halaman {currentPage} dari {totalPages}
                                    </p>
                                </div>
                                {/* Items Per Page */}
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

                            {/* Table */}
                            <div className={`overflow-x-auto ${namaBarangDropdownOpen || dropdownOpen ? 'overflow-visible' : 'relative'}`}>
                                <div className={`rounded-lg ${
                                    isDarkMode ? 'border border-gray-600' : 'border border-gray-200'
                                } ${gudangData.length > 0 && !namaBarangDropdownOpen && !dropdownOpen ? 'max-h-96 overflow-y-auto' : 'overflow-visible'}`}>
                                    <table className="min-w-full table-auto">
                                        <thead className={`sticky top-0 ${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                        } z-10`}>
                                                <tr>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>
                                                        <div className="mb-1">Item ID</div>
                                                        <input
                                                            type="text"
                                                            placeholder="Filter..."
                                                            value={filterItemId}
                                                            onChange={(e) => setFilterItemId(e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs rounded border ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                                    : 'bg-white border-gray-300 text-gray-900'
                                                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>
                                                        <div className="mb-1">Part Number</div>
                                                        <input
                                                            type="text"
                                                            placeholder="Filter..."
                                                            value={filterPartNumber}
                                                            onChange={(e) => setFilterPartNumber(e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs rounded border ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                                    : 'bg-white border-gray-300 text-gray-900'
                                                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')} relative custom-dropdown-namabarang`}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNamaBarangDropdownOpen(!namaBarangDropdownOpen);
                                                            }}
                                                            className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                        >
                                                            Nama Barang
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        
                                                        {namaBarangDropdownOpen && (
                                                            <div 
                                                                className={`absolute top-full left-0 mt-1 w-64 rounded-md shadow-lg z-50 ${
                                                                    isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                                                                }`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {/* Search Input */}
                                                                <div className={`p-2 border-b ${
                                                                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                                                }`}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="🔍 Cari nama barang..."
                                                                        value={searchNamaBarang}
                                                                        onChange={(e) => setSearchNamaBarang(e.target.value)}
                                                                        className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                                            isDarkMode 
                                                                                ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400' 
                                                                                : 'bg-white border border-gray-300 text-gray-900'
                                                                        }`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                
                                                                {/* Nama Barang Options */}
                                                                <div className="max-h-60 overflow-y-auto">
                                                                    <div 
                                                                        className={`px-3 py-2 cursor-pointer ${
                                                                            filterNamaBarang === 'all' 
                                                                                ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFilterNamaBarang('all');
                                                                            setNamaBarangDropdownOpen(false);
                                                                            setSearchNamaBarang('');
                                                                        }}
                                                                    >
                                                                        📦 Semua Barang
                                                                    </div>
                                                                    {namaBarangList
                                                                        .filter(item => 
                                                                            item.nama_barang.toLowerCase().includes(searchNamaBarang.toLowerCase())
                                                                        )
                                                                        .map((item, index) => (
                                                                            <div 
                                                                                key={index}
                                                                                className={`px-3 py-2 cursor-pointer ${
                                                                                    filterNamaBarang === item.nama_barang 
                                                                                        ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                        : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                                }`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFilterNamaBarang(item.nama_barang);
                                                                                    setNamaBarangDropdownOpen(false);
                                                                                    setSearchNamaBarang('');
                                                                                }}
                                                                            >
                                                                                🔧 {item.nama_barang}
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        )}
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')} relative custom-dropdown`}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDropdownOpen(!dropdownOpen);
                                                            }}
                                                            className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                        >
                                                            Gudang
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        
                                                        {dropdownOpen && (
                                                            <div 
                                                                className={`absolute top-full left-0 mt-1 w-64 rounded-md shadow-lg z-50 ${
                                                                    isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                                                                }`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
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
                                                                        className={`px-3 py-2 cursor-pointer ${
                                                                            selectedGudang === 'all' 
                                                                                ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
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
                                                                                className={`px-3 py-2 cursor-pointer ${
                                                                                    selectedGudang === gudang.Gudang 
                                                                                        ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                        : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                                }`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
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
                                                                        <div className="px-3 py-2 text-gray-500 text-center">
                                                                            Tidak ada gudang yang ditemukan
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Site</th>
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
                                                {gudangData.length > 0 ? (
                                                    gudangData.map((item, index) => (
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
                                                            <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>
                                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                    📍 {item.site || '-'}
                                                                </span>
                                                            </td>
                                                            <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.rak || '-'}</td>
                                                            <td className={`px-4 py-3 text-sm font-semibold text-right ${getTextClasses('primary')}`}>
                                                                {item.jumlah || '0'}
                                                            </td>
                                                            <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.satuan || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="8" className="px-4 py-12 text-center">
                                                            <span className={`text-4xl mb-4 block ${getTextClasses('secondary')}`}>📭</span>
                                                            <p className={`text-lg font-medium ${getTextClasses('primary')}`}>Belum ada data barang</p>
                                                            <p className={`text-sm ${getTextClasses('secondary')}`}>
                                                                {selectedGudang === 'all' 
                                                                    ? 'Tidak ada data barang tersedia'
                                                                    : `Tidak ada data barang untuk gudang: ${selectedGudang}`
                                                                }
                                                            </p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                        <div className="mt-4 flex justify-between items-center">
                                            <div className={`text-sm ${getTextClasses('secondary')}`}>
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
                                </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memuat data...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <SafeStockPieChart 
                                selectedGudang={selectedGudang} 
                                title="📊 Distribusi Stock Barang"
                                isDarkMode={isDarkMode}
                                siteFilter={user?.site}
                                filterItemId={filterItemId}
                                filterPartNumber={filterPartNumber}
                                filterNamaBarang={filterNamaBarang}
                                userRole="admin"
                                userLocId={null}
                            />
                        </div>
                    </div>
                );
            case 'transaksi':
                return (
                    <div className="space-y-6">
                        {/* Container utama untuk tabel transaksi */}
                        <div className={`${getCardClasses('p-6')} ${transaksiNamaBarangDropdownOpen || transaksiGudangDropdownOpen || transaksiGudangTujuanDropdownOpen ? 'overflow-visible' : ''}`}>
                            {/* Header dengan judul dan total */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                    <span className="text-2xl mr-2">💳</span>
                                    Data Transaksi
                                </h2>
                                <div className={`text-sm ${getTextClasses('secondary')}`}>
                                    Total: {transaksiTotal.toLocaleString()} transaksi
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
                                    <div className={`overflow-x-auto ${transaksiNamaBarangDropdownOpen || transaksiGudangDropdownOpen || transaksiGudangTujuanDropdownOpen ? 'overflow-visible' : 'relative'}`}>
                                        <div className={`rounded-lg ${
                                            isDarkMode ? 'border border-gray-600' : 'border border-gray-200'
                                        } ${transaksiData.length > 0 && !transaksiNamaBarangDropdownOpen && !transaksiGudangDropdownOpen && !transaksiGudangTujuanDropdownOpen ? 'max-h-[600px] overflow-y-auto' : 'overflow-visible'}`}>
                                        <table className="min-w-full table-auto">
                                            <thead className={`${
                                                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                            }`}>
                                                <tr>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>
                                                        <div className="mb-1">Nomor Dokumen</div>
                                                        <input
                                                            type="text"
                                                            placeholder="Filter..."
                                                            value={filterTransaksiNoDok}
                                                            onChange={(e) => setFilterTransaksiNoDok(e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs rounded border ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                                    : 'bg-white border-gray-300 text-gray-900'
                                                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>
                                                        <div className="mb-1">Part Number</div>
                                                        <input
                                                            type="text"
                                                            placeholder="Filter..."
                                                            value={filterTransaksiPartNumber}
                                                            onChange={(e) => setFilterTransaksiPartNumber(e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs rounded border ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                                    : 'bg-white border-gray-300 text-gray-900'
                                                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')} relative custom-dropdown-transaksi-namabarang`}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTransaksiNamaBarangDropdownOpen(!transaksiNamaBarangDropdownOpen);
                                                            }}
                                                            className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                        >
                                                            Nama Barang
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        
                                                        {transaksiNamaBarangDropdownOpen && (
                                                            <div 
                                                                className={`absolute top-full left-0 mt-1 w-64 rounded-md shadow-lg z-50 ${
                                                                    isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                                                                }`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {/* Search Input */}
                                                                <div className={`p-2 border-b ${
                                                                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                                                                }`}>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="🔍 Cari nama barang..."
                                                                        value={searchTransaksiNamaBarang}
                                                                        onChange={(e) => setSearchTransaksiNamaBarang(e.target.value)}
                                                                        className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                                            isDarkMode 
                                                                                ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400' 
                                                                                : 'bg-white border border-gray-300 text-gray-900'
                                                                        }`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                
                                                                {/* Nama Barang Options */}
                                                                <div className="max-h-60 overflow-y-auto">
                                                                    <div 
                                                                        className={`px-3 py-2 cursor-pointer ${
                                                                            filterTransaksiNamaBarang === 'all' 
                                                                                ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFilterTransaksiNamaBarang('all');
                                                                            setTransaksiNamaBarangDropdownOpen(false);
                                                                            setSearchTransaksiNamaBarang('');
                                                                        }}
                                                                    >
                                                                        📦 Semua Barang
                                                                    </div>
                                                                    {transaksiNamaBarangList
                                                                        .filter(item => 
                                                                            item.nama_barang.toLowerCase().includes(searchTransaksiNamaBarang.toLowerCase())
                                                                        )
                                                                        .map((item, index) => (
                                                                            <div 
                                                                                key={index}
                                                                                className={`px-3 py-2 cursor-pointer ${
                                                                                    filterTransaksiNamaBarang === item.nama_barang 
                                                                                        ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                        : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                                }`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFilterTransaksiNamaBarang(item.nama_barang);
                                                                                    setTransaksiNamaBarangDropdownOpen(false);
                                                                                    setSearchTransaksiNamaBarang('');
                                                                                }}
                                                                            >
                                                                                🔧 {item.nama_barang}
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        )}
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')} relative custom-dropdown-transaksi`}>
                                                        <div className="flex items-center cursor-pointer" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTransaksiGudangDropdownOpen(!transaksiGudangDropdownOpen);
                                                        }}>
                                                            <span>Dari Gudang</span>
                                                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                        
                                                        {transaksiGudangDropdownOpen && (
                                                            <div className="absolute z-50 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" onClick={(e) => e.stopPropagation()}>
                                                                <div className="p-2 border-b border-gray-200">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="🔍 Cari gudang..."
                                                                        value={searchTransaksiGudang}
                                                                        onChange={(e) => setSearchTransaksiGudang(e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                <div className="max-h-60 overflow-y-auto">
                                                                    <div
                                                                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-900 ${
                                                                            selectedTransaksiGudang === 'all' ? 'bg-blue-100 font-semibold' : ''
                                                                        }`}
                                                                        onClick={() => {
                                                                            setSelectedTransaksiGudang('all');
                                                                            setTransaksiGudangDropdownOpen(false);
                                                                            setSearchTransaksiGudang('');
                                                                            setTransaksiCurrentPage(1);
                                                                        }}
                                                                    >
                                                                        🏢 Semua Gudang ({transaksiGudangList.length})
                                                                    </div>
                                                                    {transaksiGudangList
                                                                        .filter(gudang => gudang.gudang.toLowerCase().includes(searchTransaksiGudang.toLowerCase()))
                                                                        .map((gudang, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-900 ${
                                                                                    selectedTransaksiGudang === gudang.gudang ? 'bg-blue-100 font-semibold' : ''
                                                                                }`}
                                                                                onClick={() => {
                                                                                    setSelectedTransaksiGudang(gudang.gudang);
                                                                                    setTransaksiGudangDropdownOpen(false);
                                                                                    setSearchTransaksiGudang('');
                                                                                    setTransaksiCurrentPage(1);
                                                                                }}
                                                                            >
                                                                                📦 {gudang.gudang}
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')} relative custom-dropdown-transaksi-tujuan`}>
                                                        <div className="flex items-center cursor-pointer" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTransaksiGudangTujuanDropdownOpen(!transaksiGudangTujuanDropdownOpen);
                                                        }}>
                                                            <span>Tujuan</span>
                                                            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                        
                                                        {transaksiGudangTujuanDropdownOpen && (
                                                            <div className="absolute z-50 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" onClick={(e) => e.stopPropagation()}>
                                                                <div className="p-2 border-b border-gray-200">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="🔍 Cari gudang tujuan..."
                                                                        value={searchTransaksiGudangTujuan}
                                                                        onChange={(e) => setSearchTransaksiGudangTujuan(e.target.value)}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                <div className="max-h-60 overflow-y-auto">
                                                                    <div
                                                                        className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-900 ${
                                                                            selectedTransaksiGudangTujuan === 'all' ? 'bg-blue-100 font-semibold' : ''
                                                                        }`}
                                                                        onClick={() => {
                                                                            setSelectedTransaksiGudangTujuan('all');
                                                                            setTransaksiGudangTujuanDropdownOpen(false);
                                                                            setSearchTransaksiGudangTujuan('');
                                                                            setTransaksiCurrentPage(1);
                                                                        }}
                                                                    >
                                                                        🏢 Semua Gudang ({transaksiGudangList.length})
                                                                    </div>
                                                                    {transaksiGudangList
                                                                        .filter(gudang => gudang.gudang.toLowerCase().includes(searchTransaksiGudangTujuan.toLowerCase()))
                                                                        .map((gudang, index) => (
                                                                            <div
                                                                                key={index}
                                                                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-900 ${
                                                                                    selectedTransaksiGudangTujuan === gudang.gudang ? 'bg-blue-100 font-semibold' : ''
                                                                                }`}
                                                                                onClick={() => {
                                                                                    setSelectedTransaksiGudangTujuan(gudang.gudang);
                                                                                    setTransaksiGudangTujuanDropdownOpen(false);
                                                                                    setSearchTransaksiGudangTujuan('');
                                                                                    setTransaksiCurrentPage(1);
                                                                                }}
                                                                            >
                                                                                📦 {gudang.gudang}
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>
                                                        <div className="mb-1">No. Reg</div>
                                                        <input
                                                            type="text"
                                                            placeholder="Filter..."
                                                            value={filterTransaksiNoReg}
                                                            onChange={(e) => setFilterTransaksiNoReg(e.target.value)}
                                                            className={`w-full px-2 py-1 text-xs rounded border ${
                                                                isDarkMode 
                                                                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                                                                    : 'bg-white border-gray-300 text-gray-900'
                                                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </th>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Diminta</th>
                                                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Dikirim</th>
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
                                                    <tr key={item.invusenum || index} className={`${
                                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                    }`}>
                                                        <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`}>{item.no_dok || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm font-mono ${getTextClasses('primary')}`}>{item.part_no || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm max-w-xs truncate ${getTextClasses('primary')}`} title={item.nama_barang || 'Nama barang tidak ditemukan'}>
                                                            {item.nama_barang || '-'}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.dari_gudang || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.ke_gudang || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('primary')}`}>{item.reg || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('primary')} text-center`}>{item.diminta || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('primary')} text-center`}>{item.dikirim || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                item.status_permintaan?.toUpperCase() === 'DIPROSES' 
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : item.status_permintaan?.toUpperCase() === 'DITOLAK'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {item.status_permintaan ? item.status_permintaan.toUpperCase() : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                item.status_penerimaan?.toUpperCase() === 'DIPROSES' 
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : item.status_penerimaan?.toUpperCase() === 'DITOLAK'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {item.status_penerimaan || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                item.status_pengiriman === 'SHIPPED' 
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : item.status_pengiriman === 'ENTERED'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : item.status_pengiriman === 'COMPLETE'
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
                        <div className={`${getCardClasses('p-6')}`}>
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">📊</span>
                                <h3 className={`text-xl font-bold ${getTextClasses('primary')}`}>
                                    Analisis Status Transaksi
                                </h3>
                            </div>
                            {statusChartLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <span className={`ml-2 ${getTextClasses('secondary')}`}>Loading status statistics...</span>
                                </div>
                            ) : (
                                renderStatusChart()
                            )}
                        </div>

                        {/* Top Active Warehouses Visualization */}
                        <div className={`${getCardClasses('p-6')}`}>
                            <div className="flex items-center mb-4">
                                <span className="text-2xl mr-3">🏭</span>
                                <h3 className={`text-xl font-bold ${getTextClasses('primary')}`}>
                                    Top Active Warehouses
                                </h3>
                            </div>
                            {warehouseLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <span className={`ml-2 ${getTextClasses('secondary')}`}>Loading warehouse statistics...</span>
                                </div>
                            ) : (
                                renderTopWarehouses()
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
            
            {/* ADMIN Sidebar - Blue theme */}
            <aside className={`group fixed left-0 top-0 h-screen w-16 hover:w-80 backdrop-blur border-r text-white flex flex-col transition-all duration-300 ease-in-out z-50 ${
                isDarkMode 
                    ? 'bg-gray-800/95 border-green-400 sidebar-glow' 
                    : 'bg-cyan-900/90 border-cyan-500'
            }`}>
                <div className="p-4 group-hover:p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 group-hover:w-14 group-hover:h-14 transition-all duration-300 flex-shrink-0">
                            <img 
                                src="/images/logo_airlogs.png" 
                                alt="Logo AIRLOGS" 
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
                                        fetchGudangForUser(); // Fetch gudang ketika modal dibuka
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
                            <p className="text-cyan-400 text-xs truncate opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">{user?.username} (ADMIN)</p>
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
                            <h2 className="text-2xl font-bold text-blue-700">Tambah User Baru (Status: User)</h2>
                            <button
                                onClick={closeAddUserModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                            <div className="flex items-center">
                                <span className="text-blue-400 text-xl mr-2">ℹ️</span>
                                <p className="text-sm font-medium text-blue-800">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gudang *</label>
                                    {gudangForUserLoading ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                                            Loading gudang...
                                        </div>
                                    ) : (
                                        <select 
                                            name="gudang" 
                                            value={addUserForm.gudang} 
                                            onChange={handleAddUserChange} 
                                            required 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                        >
                                            <option value="">-- Pilih Gudang --</option>
                                            {gudangListForUser.map((gudang, index) => (
                                                <option key={index} value={gudang.id}>
                                                    {gudang.Gudang}
                                                </option>
                                            ))}
                                        </select>
                                    )}
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
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-blue-400 text-xl mr-2">✅</span>
                                        <p className="text-sm font-medium text-blue-800">
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

            {/* Modal Gudang */}
            {showGudangModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${getCardClasses('p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col')}`}>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                <span className="text-2xl mr-2">🏢</span>
                                Data Gudang
                            </h2>
                            <button
                                onClick={() => setShowGudangModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content with scroll */}
                        <div className="flex-1 overflow-y-auto mb-4">
                            {gudangModalLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            ) : gudangModalData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <tr>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>No</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Gudang</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Site</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                                            {gudangModalData.map((item, index) => (
                                                <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                                    <td className={`px-4 py-3 text-sm ${getTextClasses('primary')}`}>
                                                        {(gudangModalPage - 1) * 10 + index + 1}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`}>
                                                        🏢 {item.gudang}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>
                                                        {item.site_name || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className={`text-lg font-medium ${getTextClasses('primary')}`}>Belum ada data gudang</p>
                                </div>
                            )}
                        </div>

                        {/* Footer with pagination */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <div className={`text-sm ${getTextClasses('secondary')}`}>
                                    Menampilkan {gudangModalData.length} dari {gudangModalTotal} gudang
                                </div>
                                <button
                                    onClick={() => setShowAddGudangModal(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                >
                                    <span>➕</span>
                                    Tambah Gudang
                                </button>
                            </div>
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => fetchGudangModalData(Math.max(1, gudangModalPage - 1))}
                                    disabled={gudangModalPage === 1 || gudangModalLoading}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                        gudangModalPage === 1 || gudangModalLoading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    ← Previous
                                </button>
                                <span className={`px-4 py-2 text-sm ${getTextClasses('primary')}`}>
                                    Page {gudangModalPage} of {gudangModalTotalPages}
                                </span>
                                <button
                                    onClick={() => fetchGudangModalData(Math.min(gudangModalTotalPages, gudangModalPage + 1))}
                                    disabled={gudangModalPage === gudangModalTotalPages || gudangModalLoading}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                        gudangModalPage === gudangModalTotalPages || gudangModalLoading
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Site */}
            {showSiteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${getCardClasses('p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col')}`}>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                <span className="text-2xl mr-2">🏛️</span>
                                Data Site Anda
                            </h2>
                            <button
                                onClick={() => setShowSiteModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content with scroll */}
                        <div className="flex-1 overflow-y-auto mb-4">
                            {siteModalLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            ) : siteModalData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full table-auto">
                                        <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <tr>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>No</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Site ID</th>
                                                <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Total Gudang</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                                            {siteModalData.map((item, index) => (
                                                <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                                    <td className={`px-4 py-3 text-sm ${getTextClasses('primary')}`}>
                                                        {(siteModalPage - 1) * 10 + index + 1}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`}>
                                                        {item.siteid}
                                                    </td>
                                                    <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>
                                                        {item.total_gudang}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className={`text-lg font-medium ${getTextClasses('primary')}`}>Belum ada data site</p>
                                </div>
                            )}
                        </div>

                        {/* Footer with pagination */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <div className={`text-sm ${getTextClasses('secondary')}`}>
                                    Menampilkan {siteModalData.length} dari {siteModalTotal} site
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchSiteModalData(Math.max(1, siteModalPage - 1))}
                                        disabled={siteModalPage === 1 || siteModalLoading}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                            siteModalPage === 1 || siteModalLoading
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        ← Previous
                                    </button>
                                    <span className={`px-4 py-2 text-sm ${getTextClasses('primary')}`}>
                                        Page {siteModalPage} of {siteModalTotalPages}
                                    </span>
                                    <button
                                        onClick={() => fetchSiteModalData(Math.min(siteModalTotalPages, siteModalPage + 1))}
                                        disabled={siteModalPage === siteModalTotalPages || siteModalLoading}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                            siteModalPage === siteModalTotalPages || siteModalLoading
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Add Gudang (Admin) */}
            {showAddGudangModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${getCardClasses('p-6 max-w-md w-full')}`}>
                        <h3 className={`text-xl font-bold ${getTextClasses('primary')} mb-4`}>
                            ➕ Tambah Gudang Baru
                        </h3>
                        <form onSubmit={handleAddGudang}>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${getTextClasses('primary')}`}>
                                    Nama Gudang <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addGudangForm.location}
                                    onChange={(e) => setAddGudangForm({ ...addGudangForm, location: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                    }`}
                                    placeholder="Contoh: Gudang Utama"
                                    required
                                />
                                <p className={`mt-2 text-sm ${getTextClasses('secondary')}`}>
                                    Site: <strong>{user?.site}</strong> (otomatis)
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddGudangModal(false);
                                        setAddGudangForm({ location: '' });
                                    }}
                                    className={`flex-1 px-4 py-2 rounded-md ${
                                        isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addGudangLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {addGudangLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <SuccessModal 
                show={showSuccessModal}
                message={successMessage}
                onClose={() => setShowSuccessModal(false)}
                isDarkMode={isDarkMode}
            />

            {/* Global Tooltip for Bar Chart */}
            {hoveredStatus && typeof hoveredStatus === 'object' && statusDetailData && (
                <>
                    {/* Backdrop to close tooltip on outside click */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => {
                            setHoveredStatus(null);
                            setStatusDetailData(null);
                            setTooltipPage(1);
                        }}
                    />
                    
                    {/* Tooltip */}
                    <div 
                        className={`fixed z-50 w-[600px] rounded-lg shadow-xl p-4 transition-all duration-200 ease-in-out ${
                            isDarkMode 
                                ? 'bg-gray-800 border-2 border-blue-400 glow-blue' 
                                : 'bg-white border-2 border-gray-300'
                        }`}
                        style={{
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`,
                            maxHeight: '500px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h5 className={`font-semibold text-lg ${getTextClasses('primary')}`}>
                                {hoveredStatus.label}
                            </h5>
                            <div className="flex items-center gap-3">
                                <span className={`text-sm ${getTextClasses('muted')}`}>
                                    {statusDetailData.total_count.toLocaleString()} total
                                </span>
                                <button
                                    onClick={() => {
                                        setHoveredStatus(null);
                                        setStatusDetailData(null);
                                        setTooltipPage(1);
                                    }}
                                    className={`text-xl hover:opacity-70 ${getTextClasses('muted')}`}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        
                        <div className={`text-xs ${getTextClasses('secondary')} mb-2`}>
                            Breakdown by warehouse:
                        </div>
                        
                        <div className="max-h-[350px] overflow-y-auto">
                            {statusDetailLoading ? (
                                <div className={`text-center py-4 ${getTextClasses('muted')}`}>
                                    Loading...
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2 mb-3">
                                        {statusDetailData.warehouse_breakdown
                                            .slice((tooltipPage - 1) * tooltipPerPage, tooltipPage * tooltipPerPage)
                                            .map((wh, idx) => (
                                            <div 
                                                key={idx}
                                                className={`p-3 rounded-md ${
                                                    isDarkMode 
                                                        ? 'bg-gray-700/50 hover:bg-gray-700' 
                                                        : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-medium ${getTextClasses('primary')}`}>
                                                        {wh.gudang}
                                                    </span>
                                                    <span className={`text-sm font-semibold ${getTextClasses('primary')}`}>
                                                        {wh.count.toLocaleString()}
                                                    </span>
                                                </div>
                                                {wh.description && (
                                                    <div className={`text-xs ${getTextClasses('muted')}`}>
                                                        {wh.description}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {statusDetailData.warehouse_breakdown.length > tooltipPerPage && (
                                        <div className={`border-t pt-3 mt-2 ${
                                            isDarkMode ? 'border-gray-600' : 'border-gray-200'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className={`text-xs ${getTextClasses('muted')}`}>
                                                    Showing {((tooltipPage - 1) * tooltipPerPage) + 1} - {Math.min(tooltipPage * tooltipPerPage, statusDetailData.warehouse_breakdown.length)} of {statusDetailData.warehouse_breakdown.length}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setTooltipPage(prev => Math.max(1, prev - 1))}
                                                        disabled={tooltipPage === 1}
                                                        className={`px-3 py-1 rounded text-xs transition-colors ${
                                                            tooltipPage === 1
                                                                ? isDarkMode 
                                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : isDarkMode
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                        }`}
                                                    >
                                                        ← Prev
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setTooltipPage(prev => Math.min(Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage), prev + 1));
                                                        }}
                                                        disabled={tooltipPage >= Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage)}
                                                        className={`px-3 py-1 rounded text-xs transition-colors ${
                                                            tooltipPage >= Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage)
                                                                ? isDarkMode 
                                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : isDarkMode
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                                        }`}
                                                    >
                                                        Next →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
