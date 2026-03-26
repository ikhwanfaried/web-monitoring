import React, { useState, useEffect } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import SafeStockPieChart from './SafeStockPieChart';
import SuccessModal from './SuccessModal';
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
    const [filterItemId, setFilterItemId] = useState('');
    const [filterPartNumber, setFilterPartNumber] = useState('');
    const [filterNamaBarang, setFilterNamaBarang] = useState('all');
    const [namaBarangDropdownOpen, setNamaBarangDropdownOpen] = useState(false);
    const [searchNamaBarang, setSearchNamaBarang] = useState('');
    const [namaBarangList, setNamaBarangList] = useState([]);
    const [filterSite, setFilterSite] = useState('all');
    const [siteDropdownOpen, setSiteDropdownOpen] = useState(false);
    const [searchSite, setSearchSite] = useState('');

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
    const [transaksiGudangDropdownOpen, setTransaksiGudangDropdownOpen] = useState(false);
    const [searchTransaksiGudang, setSearchTransaksiGudang] = useState('');
    const [selectedTransaksiGudangTujuan, setSelectedTransaksiGudangTujuan] = useState('all');
    const [transaksiGudangTujuanDropdownOpen, setTransaksiGudangTujuanDropdownOpen] = useState(false);
    const [searchTransaksiGudangTujuan, setSearchTransaksiGudangTujuan] = useState('');
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
        siteid: '',
        id_status: '3' // Default ke User (3)
    });
    const [addUserLoading, setAddUserLoading] = useState(false);
    const [addUserSuccess, setAddUserSuccess] = useState(false);
    const [addUserError, setAddUserError] = useState('');
    const [sites, setSites] = useState([]);
    const [sitesLoading, setSitesLoading] = useState(true);

    // State untuk edit/delete user modals
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showEditOptionsModal, setShowEditOptionsModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    // State untuk modal gudang dan site
    const [showGudangModal, setShowGudangModal] = useState(false);
    const [showSiteModal, setShowSiteModal] = useState(false);
    const [gudangModalData, setGudangModalData] = useState([]);
    const [siteModalData, setSiteModalData] = useState([]);
    const [gudangModalPage, setGudangModalPage] = useState(1);
    const [siteModalPage, setSiteModalPage] = useState(1);
    const [gudangModalTotal, setGudangModalTotal] = useState(0);
    const [siteModalTotal, setSiteModalTotal] = useState(0);
    const [gudangModalLoading, setGudangModalLoading] = useState(false);
    const [siteModalLoading, setSiteModalLoading] = useState(false);
    const itemsPerModalPage = 10;
    
    // State untuk form input gudang dan site
    const [showAddGudangModal, setShowAddGudangModal] = useState(false);
    const [showAddSiteModal, setShowAddSiteModal] = useState(false);
    const [addGudangForm, setAddGudangForm] = useState({ location: '', idsite: '' });
    const [addSiteForm, setAddSiteForm] = useState({ siteid: '' });
    const [siteList, setSiteList] = useState([]);
    const [addGudangLoading, setAddGudangLoading] = useState(false);
    const [addSiteLoading, setAddSiteLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editUserSearch, setEditUserSearch] = useState('');
    const [deleteUserSearch, setDeleteUserSearch] = useState('');

    // State untuk edit form
    const [showEditFormModal, setShowEditFormModal] = useState(false);
    const [editField, setEditField] = useState('');
    const [editValue, setEditValue] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState(false);
    const [rolesList, setRolesList] = useState([]);

    // State untuk users
    const [usersData, setUsersData] = useState([]);
    const [usersCurrentPage, setUsersCurrentPage] = useState(1);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersPerPage, setUsersPerPage] = useState(15);
    const [searchUsers, setSearchUsers] = useState('');

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
        // Fetch data dari Laravel API
        fetchDashboardData();
        fetchLoginLogs();
        fetchLoginStats();
        fetchTransactionStatusData();
        fetchGudangList();
        fetchNamaBarangList();
        fetchTransaksiNamaBarangList();
        fetchSiteList();
        fetchSites();
        fetchRoles();
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
        // Fetch users data ketika tab users dibuka
        if (activeTab === 'users') {
            setUsersCurrentPage(1);
            fetchUsersData(1, usersPerPage);
        }
    }, [selectedGudang, filterItemId, filterPartNumber, filterNamaBarang, filterSite, activeTab, itemsPerPage, transaksiPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect terpisah untuk filter transaksi gudang
    useEffect(() => {
        if (activeTab === 'transaksi' && (selectedTransaksiGudang || selectedTransaksiGudangTujuan || filterTransaksiNoDok || filterTransaksiPartNumber || filterTransaksiNoReg)) {
            setTransaksiCurrentPage(1);
            fetchTransaksiData(1, transaksiPerPage);
        }
    }, [selectedTransaksiGudang, selectedTransaksiGudangTujuan, filterTransaksiNoDok, filterTransaksiPartNumber, filterTransaksiNoReg, filterTransaksiNamaBarang, filterSite]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect terpisah untuk search users
    useEffect(() => {
        if (activeTab === 'users') {
            setUsersCurrentPage(1);
            fetchUsersData(1, usersPerPage, searchUsers);
        }
    }, [searchUsers]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect untuk fetch data modal gudang saat dibuka
    useEffect(() => {
        if (showGudangModal) {
            setGudangModalPage(1); // Reset to page 1
            fetchGudangModalData(1);
        }
    }, [showGudangModal]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect untuk fetch data modal site saat dibuka
    useEffect(() => {
        if (showSiteModal) {
            setSiteModalPage(1); // Reset to page 1
            fetchSiteModalData(1);
        }
    }, [showSiteModal]); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect untuk fetch site list saat modal add gudang dibuka
    useEffect(() => {
        if (showAddGudangModal) {
            fetchSiteList();
        }
    }, [showAddGudangModal]);

    // Fetch status statistics and warehouse statistics when transaksi tab is active or filter changes
    useEffect(() => {
        if (activeTab === 'transaksi') {
            fetchStatusStatistics();
            fetchWarehouseStatistics();
        }
    }, [activeTab, selectedTransaksiGudang, selectedTransaksiGudangTujuan, filterTransaksiNoDok, filterTransaksiPartNumber, filterTransaksiNoReg, filterTransaksiNamaBarang, filterSite]); // eslint-disable-line react-hooks/exhaustive-deps

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
            if (siteDropdownOpen && !event.target.closest('.custom-dropdown-site')) {
                setSiteDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen, transaksiGudangDropdownOpen, transaksiGudangTujuanDropdownOpen, namaBarangDropdownOpen, transaksiNamaBarangDropdownOpen, siteDropdownOpen]);

    // Close modals when Esc key is pressed
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                if (showAddUserModal) {
                    setShowAddUserModal(false);
                    setAddUserForm({ username: '', password: '', Nama: '', NRP: '', Email: '', siteid: '', id_status: '3' });
                    setAddUserError('');
                    setAddUserSuccess(false);
                }
                if (showEditUserModal) {
                    setShowEditUserModal(false);
                    setEditUserSearch('');
                }
                if (showDeleteUserModal) {
                    setShowDeleteUserModal(false);
                    setDeleteUserSearch('');
                }
                if (showDeleteConfirmModal) {
                    setShowDeleteConfirmModal(false);
                    setUserToDelete(null);
                }
                if (showEditOptionsModal) {
                    setShowEditOptionsModal(false);
                    setUserToEdit(null);
                }
                if (showEditFormModal) {
                    setShowEditFormModal(false);
                    setEditField('');
                    setEditValue('');
                    setEditError('');
                    setEditSuccess(false);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showAddUserModal, showEditUserModal, showDeleteUserModal, showDeleteConfirmModal, showEditOptionsModal, showEditFormModal]);

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
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('per_page', perPage);
            
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
            
            if (filterSite !== 'all') {
                params.append('filter_site', filterSite);
            }
            
            const response = await fetch(`/api/transaksi?${params.toString()}`);
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
            
            // Build query params with all transaksi filters
            const params = new URLSearchParams();
            params.append('filter', selectedTransaksiGudang);
            
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
            if (filterSite && filterSite !== 'all') {
                params.append('filter_site', filterSite);
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
            if (filterSite && filterSite !== 'all') {
                params.append('filter_site', filterSite);
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
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const tooltipWidth = 600; // estimated tooltip width
        const tooltipHeight = 500; // estimated tooltip height
        
        // Get cursor position from event
        const cursorX = event.clientX || (windowWidth / 2);
        const cursorY = event.clientY || (windowHeight / 2);
        
        // Calculate tooltip position with cursor at center
        let xPos = cursorX - (tooltipWidth / 2);
        let yPos = cursorY - (tooltipHeight / 2);
        
        // Adjust horizontal position if tooltip goes outside window
        if (xPos < 16) {
            xPos = 16;
        } else if (xPos + tooltipWidth > windowWidth - 16) {
            xPos = windowWidth - tooltipWidth - 16;
        }
        
        // Adjust vertical position if tooltip goes outside window
        if (yPos < 20) {
            yPos = 20;
        } else if (yPos + tooltipHeight > windowHeight - 20) {
            yPos = windowHeight - tooltipHeight - 20;
        }
        
        // Determine side for styling (left/right of cursor)
        let side = 'right';
        if (cursorX > windowWidth / 2) {
            side = 'left';
        }
        
        return {
            x: xPos,
            y: yPos,
            side: side,
            yOffset: 0
        };
    };

    // Handle bar chart click to show tooltip
    const handleBarClick = async (barItem, event) => {
        const statusType = 'status_pengiriman';
        const statusValue = barItem.name;
        
        // Fetch status detail data
        await fetchStatusDetail(statusType, statusValue);
        
        // Calculate tooltip position
        const position = calculateTooltipPosition(event);
        setTooltipPosition(position);
        
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
        
        // Convert NRP, siteid, dan id_status to integer
        const submitData = {
            ...addUserForm,
            NRP: parseInt(addUserForm.NRP),
            siteid: parseInt(addUserForm.siteid),
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
                setAddUserForm({ username: '', password: '', Nama: '', NRP: '', Email: '', siteid: '', id_status: '3' });
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
        setAddUserForm({ username: '', password: '', Nama: '', NRP: '', Email: '', siteid: '', id_status: '3' });
        setAddUserError('');
        setAddUserSuccess(false);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/delete-user/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Close modal and refresh data
                setShowDeleteConfirmModal(false);
                setUserToDelete(null);
                
                // Refresh users data
                fetchUsersData(usersCurrentPage, usersPerPage, searchUsers);
            } else {
                console.error('Error deleting user:', data.message);
                alert('Gagal menghapus user: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error: ' + error.message);
        }
        
        setDeleteLoading(false);
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

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/status?page=1&per_page=1000');
            if (response.ok) {
                const result = await response.json();
                setRolesList(result.data || []);
                console.log('Roles loaded for modal:', result.data?.length || 0);
            } else {
                console.error('Failed to fetch roles for modal');
            }
        } catch (error) {
            console.error('Error fetching roles for modal:', error);
        }
    };

    const fetchNamaBarangList = async () => {
        try {
            const response = await fetch('/api/nama-barang-list');
            const data = await response.json();
            if (data.data) {
                setNamaBarangList(data.data);
            }
        } catch (error) {
            console.error('Error fetching nama barang list:', error);
        }
    };

    const fetchTransaksiNamaBarangList = async () => {
        try {
            const response = await fetch('/api/transaksi-nama-barang-list');
            const data = await response.json();
            if (data.data) {
                setTransaksiNamaBarangList(data.data);
            }
        } catch (error) {
            console.error('Error fetching transaksi nama barang list:', error);
        }
    };

    const fetchUsersData = async (page = 1, perPage = 15, search = '') => {
        if (usersLoading) return;
        
        setUsersLoading(true);
        try {
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
            const response = await fetch(`/api/users?page=${page}&per_page=${perPage}${searchParam}`);
            const data = await response.json();
            
            console.log('👥 Users response:', data);
            
            if (data.data) {
                setUsersData(data.data);
                setUsersCurrentPage(data.current_page);
                setUsersTotalPages(data.last_page);
                setUsersTotal(data.total);
            }
        } catch (error) {
            console.error('Error fetching users data:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchGudangData = async (page = 1, perPage = itemsPerPage) => {
        try {
            setLoading(true);
            
            // Build filter parameters
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('per_page', perPage);
            
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
            
            if (filterSite !== 'all') {
                params.append('filter_site', filterSite);
            }
            
            const url = `/api/gudang?${params.toString()}`;
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

    // Fungsi untuk fetch data modal gudang
    const fetchGudangModalData = async (page = 1) => {
        setGudangModalLoading(true);
        try {
            console.log('🔄 Fetching gudang modal data for page:', page);
            const response = await fetch(`/api/gudang-modal?page=${page}&per_page=${itemsPerModalPage}`);
            const data = await response.json();
            
            console.log('📦 Gudang modal response:', data);
            
            if (data.success && data.data) {
                setGudangModalData(data.data);
                setGudangModalPage(data.pagination.current_page);
                setGudangModalTotal(data.pagination.total);
                console.log('✅ Gudang modal data loaded:', data.data.length, 'items');
            } else {
                console.error('❌ Failed to load gudang modal data:', data);
                setGudangModalData([]);
                setGudangModalTotal(0);
            }
        } catch (error) {
            console.error('❌ Error fetching gudang modal data:', error);
            setGudangModalData([]);
            setGudangModalTotal(0);
        } finally {
            setGudangModalLoading(false);
        }
    };

    // Fungsi untuk fetch data modal site
    const fetchSiteModalData = async (page = 1) => {
        setSiteModalLoading(true);
        try {
            const response = await fetch(`/api/site-modal?page=${page}&per_page=${itemsPerModalPage}`);
            const data = await response.json();
            
            if (data.success && data.data) {
                setSiteModalData(data.data);
                setSiteModalPage(data.pagination.current_page);
                setSiteModalTotal(data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching site modal data:', error);
        } finally {
            setSiteModalLoading(false);
        }
    };

    // Fungsi untuk fetch list site (untuk dropdown)
    const fetchSiteList = async () => {
        try {
            const response = await fetch('/api/site-list');
            const result = await response.json();
            
            console.log('🏢 Site list API response:', result);
            
            if (result.success) {
                console.log('🏢 Setting siteList with:', result.data);
                setSiteList(result.data);
            } else {
                console.error('🏢 Site list API returned success: false');
            }
        } catch (error) {
            console.error('Error fetching site list:', error);
        }
    };

    // Fungsi untuk menambah gudang
    const handleAddGudang = async (e) => {
        e.preventDefault();
        setAddGudangLoading(true);
        try {
            const response = await fetch('/api/gudang/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addGudangForm)
            });
            
            const result = await response.json();
            
            if (result.success) {
                setSuccessMessage('Gudang berhasil ditambahkan! 🎉');
                setShowSuccessModal(true);
                setShowAddGudangModal(false);
                setAddGudangForm({ location: '', idsite: '' });
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

    // Fungsi untuk menambah site
    const handleAddSite = async (e) => {
        e.preventDefault();
        setAddSiteLoading(true);
        try {
            const response = await fetch('/api/site/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addSiteForm)
            });
            
            const result = await response.json();
            
            if (result.success) {
                setSuccessMessage('Site berhasil ditambahkan! 🎉');
                setShowSuccessModal(true);
                setShowAddSiteModal(false);
                setAddSiteForm({ siteid: '' });
                fetchSiteModalData(1); // Refresh data from page 1
                fetchDashboardData(); // Update counter
            } else {
                alert(result.message || 'Gagal menambahkan site');
            }
        } catch (error) {
            console.error('Error adding site:', error);
            alert('Terjadi kesalahan saat menambahkan site');
        } finally {
            setAddSiteLoading(false);
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

                {/* Details Container - sesuai tooltip 600px */}
                <div className={`${getCardClasses('p-6')} w-full lg:w-[600px] h-200`}>
                        <h4 className={`text-lg font-semibold ${getTextClasses('primary')} mb-4`}>Detail Status</h4>
                    <div className="space-y-3">
                        {currentData.map((item, index) => {
                            const percentage = ((item.count / total) * 100).toFixed(1);
                            const backgroundColor = chartData.datasets[0].backgroundColor[index];
                            const isHovered = hoveredStatus === `${activeChartType}-${item.label}`;
                            
                            return (
                                <div 
                                    key={item.label} 
                                    className={`relative flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer ${
                                        isDarkMode 
                                            ? 'bg-gray-700 hover:bg-blue-800' 
                                            : 'bg-gray-50 hover:bg-blue-50'
                                    }`}
                                    onMouseEnter={(e) => {
                                        const position = calculateTooltipPosition(e);
                                        setTooltipPosition(position);
                                        setHoveredStatus(`${activeChartType}-${item.label}`);
                                        setTooltipPage(1); // Reset to page 1 on new hover
                                        fetchStatusDetail(activeChartType, item.label);
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredStatus(null);
                                        setStatusDetailData(null);
                                        setTooltipPage(1); // Reset page
                                    }}
                                >
                                    <div className="flex items-center">
                                        <div 
                                            className="w-5 h-5 rounded mr-4 flex-shrink-0"
                                            style={{ backgroundColor }}
                                        ></div>
                                        <span className={`text-base font-medium ${getTextClasses('secondary')}`}>{item.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-base font-semibold ${getTextClasses('primary')}`}>
                                            {item.count.toLocaleString()}
                                        </div>
                                        <div className={`text-sm ${getTextClasses('muted')}`}>
                                            {percentage}%
                                        </div>
                                    </div>

                                    {/* Tooltip with detailed breakdown */}
                                    {isHovered && statusDetailData && (
                                        <div 
                                            className={`fixed z-50 w-[600px] rounded-lg shadow-lg p-4 transition-all duration-200 ease-in-out ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 border-2 border-blue-400 glow-blue' 
                                                    : 'bg-white border border-gray-200'
                                            }`}
                                            style={{
                                                left: `${tooltipPosition.x}px`,
                                                top: `${tooltipPosition.y}px`,
                                                maxHeight: '500px'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-4">
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
                                            
                                            <div className="space-y-3">
                                                {statusDetailLoading ? (
                                                    <div className={`text-xs ${getTextClasses('muted')}`}>Loading...</div>
                                                ) : (
                                                    <>
                                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                                            {statusDetailData.warehouse_breakdown
                                                                .slice((tooltipPage - 1) * tooltipPerPage, tooltipPage * tooltipPerPage)
                                                                .map((warehouse, idx) => (
                                                                    <div key={warehouse.gudang} className={`flex justify-between items-center text-sm py-3 px-4 rounded ${
                                                                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                                                    }`}>
                                                                        <span className={`${getTextClasses('secondary')} truncate`} title={warehouse.gudang}>
                                                                            {warehouse.gudang}
                                                                        </span>
                                                                        <div className="flex items-center ml-3">
                                                                            <span className={`font-medium text-sm ${getTextClasses('primary')}`}>
                                                                                {warehouse.count.toLocaleString()}
                                                                            </span>
                                                                            <span className={`${getTextClasses('muted')} ml-2 text-sm`}>
                                                                                {warehouse.description}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                        
                                                        {/* Pagination controls */}
                                                        {statusDetailData.warehouse_breakdown.length > tooltipPerPage && (
                                                            <div className={`flex items-center justify-between pt-3 border-t ${
                                                                isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                            }`}>
                                                                <div className={`text-xs ${getTextClasses('muted')}`}>
                                                                    Showing {((tooltipPage - 1) * tooltipPerPage) + 1} - {Math.min(tooltipPage * tooltipPerPage, statusDetailData.warehouse_breakdown.length)} of {statusDetailData.warehouse_breakdown.length}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTooltipPage(prev => Math.max(1, prev - 1));
                                                                        }}
                                                                        disabled={tooltipPage === 1}
                                                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
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
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setTooltipPage(prev => Math.min(Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage), prev + 1));
                                                                        }}
                                                                        disabled={tooltipPage >= Math.ceil(statusDetailData.warehouse_breakdown.length / tooltipPerPage)}
                                                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
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
                                                        )}
                                                    </>
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
                                <div 
                                    className={`${getCardClasses('p-6 w-72 cursor-pointer hover:shadow-lg transition-shadow duration-200')}`}
                                    onClick={() => {
                                        setShowGudangModal(true);
                                        fetchGudangModalData(1);
                                    }}
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
                                
                                {/* Box Site */}
                                <div 
                                    className={`${getCardClasses('p-6 w-72 cursor-pointer hover:shadow-lg transition-shadow duration-200')}`}
                                    onClick={() => {
                                        setShowSiteModal(true);
                                        fetchSiteModalData(1);
                                    }}
                                >
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
                                <div className={`${getCardClasses('p-6')}`}>
                                    <BarChart 
                                        data={transactionStatusData} 
                                        title="Status Transaksi"
                                        compact={false}
                                        onBarClick={handleBarClick}
                                    />
                                </div>
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
                    <div className={`${getCardClasses('p-6')}`}>
                        {/* Header dengan Title dan Total */}
                        <div className="mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold ${getTextClasses('primary')} mb-2 flex items-center`}>
                                        <span className="text-2xl mr-2">📦</span>
                                        Data Gudang
                                    </h2>
                                    <p className={`${getTextClasses('secondary')}`}>
                                        {selectedGudang === 'all' 
                                            ? `Total Semua Gudang: ${totalItems.toLocaleString()} item` 
                                            : `Data untuk: ${selectedGudang} | Total: ${totalItems.toLocaleString()} item`
                                        }
                                    </p>
                                    <p className={`text-sm ${getTextClasses('secondary')} mt-1`}>
                                        {totalItems > 0 
                                            ? `Halaman ${currentPage} dari ${totalPages} | Menampilkan ${gudangData.length} item` 
                                            : 'Belum ada data'
                                        }
                                    </p>
                                </div>
                                {/* Items Per Page Selector */}
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
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
                                        className={`px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                        </div>

                        {/* Tabel Data Barang di Gudang */}
                        <div className={`mb-6 ${namaBarangDropdownOpen || dropdownOpen || siteDropdownOpen ? 'overflow-visible' : ''}`}>
                            <div className={`overflow-x-auto ${namaBarangDropdownOpen || dropdownOpen || siteDropdownOpen ? 'overflow-visible' : 'relative'}`}>
                                <div className={`rounded-lg ${
                                    isDarkMode ? 'border border-gray-600' : 'border border-gray-200'
                                } ${gudangData.length > 0 && !namaBarangDropdownOpen && !dropdownOpen && !siteDropdownOpen ? 'max-h-96 overflow-y-auto' : 'overflow-visible'}`}>
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
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')} relative custom-dropdown-site`}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSiteDropdownOpen(!siteDropdownOpen);
                                                            }}
                                                            className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                        >
                                                            Site
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        
                                                        {siteDropdownOpen && (
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
                                                                        placeholder="🔍 Cari site..."
                                                                        value={searchSite}
                                                                        onChange={(e) => setSearchSite(e.target.value)}
                                                                        className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                                            isDarkMode 
                                                                                ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400' 
                                                                                : 'bg-white border border-gray-300 text-gray-900'
                                                                        }`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                                
                                                                {/* Site Options */}
                                                                <div className="max-h-60 overflow-y-auto">
                                                                    <div 
                                                                        className={`px-3 py-2 cursor-pointer ${
                                                                            filterSite === 'all' 
                                                                                ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setFilterSite('all');
                                                                            setSiteDropdownOpen(false);
                                                                            setSearchSite('');
                                                                        }}
                                                                    >
                                                                        📍 Semua Site
                                                                    </div>
                                                                    {siteList
                                                                        .filter(site => 
                                                                            site.siteid.toLowerCase().includes(searchSite.toLowerCase())
                                                                        )
                                                                        .map((site, index) => (
                                                                            <div 
                                                                                key={index}
                                                                                className={`px-3 py-2 cursor-pointer ${
                                                                                    filterSite === site.siteid 
                                                                                        ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                        : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                                }`}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFilterSite(site.siteid);
                                                                                    setSiteDropdownOpen(false);
                                                                                    setSearchSite('');
                                                                                }}
                                                                            >
                                                                                📍 {site.siteid}
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        )}
                                                    </th>
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
                                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className={`text-sm ${getTextClasses('secondary')}`}>
                                                Halaman {currentPage} dari {totalPages} | Total: {totalItems.toLocaleString()} item
                                            </div>
                                            <div className="flex gap-2">
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
                                                <div className="flex gap-1">
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
                                    
                                    {gudangData.length > 0 && (
                                        <div className={`mt-3 text-center text-sm ${getTextClasses('secondary')}`}>
                                            📊 Total Stok Halaman Ini: {gudangData.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0).toLocaleString()} unit
                                        </div>
                                    )}
                                </div>
                            </div>

                        {/* Distribusi Stock Chart */}
                        <div className="mt-8">
                            <SafeStockPieChart 
                                selectedGudang={selectedGudang} 
                                title="📊 Distribusi Stock Barang"
                                isDarkMode={isDarkMode}
                                filterItemId={filterItemId}
                                filterPartNumber={filterPartNumber}
                                filterNamaBarang={filterNamaBarang}
                                siteFilter={filterSite}
                                userRole="superadmin"
                                userLocId={null}
                            />
                        </div>
                    </div>
                );

            case 'transaksi':
                return (
                    <div className="space-y-6">
                        {/* Container untuk Table Transaksi */}
                        <div className={`${getCardClasses('p-6')} ${transaksiNamaBarangDropdownOpen || siteDropdownOpen || transaksiGudangDropdownOpen || transaksiGudangTujuanDropdownOpen ? 'overflow-visible' : 'max-h-[600px] overflow-y-auto'}`}>
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
                            <div className={transaksiNamaBarangDropdownOpen || siteDropdownOpen || transaksiGudangDropdownOpen || transaksiGudangTujuanDropdownOpen ? 'overflow-visible' : ''}>
                                <div className={`border rounded ${transaksiNamaBarangDropdownOpen || siteDropdownOpen || transaksiGudangDropdownOpen || transaksiGudangTujuanDropdownOpen ? 'overflow-visible' : 'overflow-auto max-h-64'}`}>
                                    <table className="w-full table-fixed text-sm">
                                        <thead className={`${
                                            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                        }`}>
                                            <tr>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20`}>
                                                    <div className="mb-1">No. Dok</div>
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
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-24`}>
                                                    <div className="mb-1">Part No</div>
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
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-32 relative custom-dropdown-transaksi-namabarang`}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTransaksiNamaBarangDropdownOpen(!transaksiNamaBarangDropdownOpen);
                                                        }}
                                                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                    >
                                                        Nama Barang
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20 relative custom-dropdown-transaksi`}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTransaksiGudangDropdownOpen(!transaksiGudangDropdownOpen);
                                                        }}
                                                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                    >
                                                        Dari Gudang
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {transaksiGudangDropdownOpen && (
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
                                                                    value={searchTransaksiGudang}
                                                                    onChange={(e) => setSearchTransaksiGudang(e.target.value)}
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
                                                                        selectedTransaksiGudang === 'all' 
                                                                            ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                            : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                    }`}
                                                                    onClick={() => {
                                                                        setSelectedTransaksiGudang('all');
                                                                        setTransaksiGudangDropdownOpen(false);
                                                                        setSearchTransaksiGudang('');
                                                                        setTransaksiCurrentPage(1);
                                                                    }}
                                                                >
                                                                    🏢 Semua Gudang
                                                                </div>
                                                                {transaksiGudangList
                                                                    .filter(gudang => 
                                                                        gudang.gudang.toLowerCase().includes(searchTransaksiGudang.toLowerCase())
                                                                    )
                                                                    .map((gudang, index) => (
                                                                        <div 
                                                                            key={index}
                                                                            className={`px-3 py-2 cursor-pointer ${
                                                                                selectedTransaksiGudang === gudang.gudang 
                                                                                    ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                    : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
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
                                                                    ))
                                                                }
                                                                
                                                                {/* No results message */}
                                                                {searchTransaksiGudang && transaksiGudangList.filter(gudang => 
                                                                    gudang.gudang.toLowerCase().includes(searchTransaksiGudang.toLowerCase())
                                                                ).length === 0 && (
                                                                    <div className="px-3 py-2 text-gray-500 text-center">
                                                                        Tidak ada gudang yang ditemukan
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20 relative custom-dropdown-transaksi-tujuan`}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTransaksiGudangTujuanDropdownOpen(!transaksiGudangTujuanDropdownOpen);
                                                        }}
                                                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                    >
                                                        Tujuan
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {transaksiGudangTujuanDropdownOpen && (
                                                        <div className={`absolute top-full left-0 mt-1 w-64 rounded-md shadow-lg z-50 ${
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
                                                                    placeholder="🔍 Cari gudang tujuan..."
                                                                    value={searchTransaksiGudangTujuan}
                                                                    onChange={(e) => setSearchTransaksiGudangTujuan(e.target.value)}
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
                                                                        selectedTransaksiGudangTujuan === 'all' 
                                                                            ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                            : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                    }`}
                                                                    onClick={() => {
                                                                        setSelectedTransaksiGudangTujuan('all');
                                                                        setTransaksiGudangTujuanDropdownOpen(false);
                                                                        setSearchTransaksiGudangTujuan('');
                                                                    }}
                                                                >
                                                                    🏢 Semua Gudang
                                                                </div>
                                                                {transaksiGudangList
                                                                    .filter(gudang => 
                                                                        gudang.gudang.toLowerCase().includes(searchTransaksiGudangTujuan.toLowerCase())
                                                                    )
                                                                    .map((gudang, index) => (
                                                                        <div 
                                                                            key={index}
                                                                            className={`px-3 py-2 cursor-pointer ${
                                                                                selectedTransaksiGudangTujuan === gudang.gudang 
                                                                                    ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                    : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                            }`}
                                                                            onClick={() => {
                                                                                setSelectedTransaksiGudangTujuan(gudang.gudang);
                                                                                setTransaksiGudangTujuanDropdownOpen(false);
                                                                                setSearchTransaksiGudangTujuan('');
                                                                            }}
                                                                        >
                                                                            📦 {gudang.gudang}
                                                                        </div>
                                                                    ))
                                                                }
                                                                
                                                                {/* No results message */}
                                                                {searchTransaksiGudangTujuan && transaksiGudangList.filter(gudang => 
                                                                    gudang.gudang.toLowerCase().includes(searchTransaksiGudangTujuan.toLowerCase())
                                                                ).length === 0 && (
                                                                    <div className="px-3 py-2 text-gray-500 text-center">
                                                                        Tidak ada gudang yang ditemukan
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-20`}>
                                                    <div className="mb-1">Reg</div>
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
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-16`}>Diminta</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-16`}>Dikirim</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-24`}>Status Permintaan</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-24`}>Status Penerimaan</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-24`}>Status Pengiriman</th>
                                                <th className={`px-2 py-2 text-left text-xs font-medium uppercase tracking-wide ${getTextClasses('muted')} w-16 relative custom-dropdown-site`}>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('🏢 Site dropdown opened, siteList:', siteList);
                                                            setSiteDropdownOpen(!siteDropdownOpen);
                                                        }}
                                                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                                                    >
                                                        Site
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {siteDropdownOpen && (
                                                        <div 
                                                            className={`absolute top-full right-0 mt-1 w-64 rounded-md shadow-lg z-50 ${
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
                                                                    placeholder="🔍 Cari site..."
                                                                    value={searchSite}
                                                                    onChange={(e) => setSearchSite(e.target.value)}
                                                                    className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                                                        isDarkMode 
                                                                            ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400' 
                                                                            : 'bg-white border border-gray-300 text-gray-900'
                                                                    }`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            
                                                            {/* Site Options */}
                                                            <div className="max-h-60 overflow-y-auto">
                                                                <div 
                                                                    className={`px-3 py-2 cursor-pointer ${
                                                                        filterSite === 'all' 
                                                                            ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                            : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                    }`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFilterSite('all');
                                                                        setSiteDropdownOpen(false);
                                                                        setSearchSite('');
                                                                    }}
                                                                >
                                                                    🏢 Semua Site
                                                                </div>
                                                                {siteList
                                                                    .filter(site => 
                                                                        site.siteid.toLowerCase().includes(searchSite.toLowerCase())
                                                                    )
                                                                    .map((site, index) => (
                                                                        <div 
                                                                            key={index}
                                                                            className={`px-3 py-2 cursor-pointer ${
                                                                                filterSite === site.siteid 
                                                                                    ? (isDarkMode ? 'bg-blue-800 text-blue-300' : 'bg-blue-50 text-blue-700')
                                                                                    : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                            }`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFilterSite(site.siteid);
                                                                                setSiteDropdownOpen(false);
                                                                                setSearchSite('');
                                                                            }}
                                                                        >
                                                                            🏢 {site.siteid}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${
                                            isDarkMode 
                                                ? 'bg-gray-800 divide-gray-600' 
                                                : 'bg-white divide-gray-200'
                                        }`}>
                                            {transaksiData.map((item, index) => {
                                                // Temporary log untuk debug
                                                if (index === 0) console.log('Sample status_penerimaan:', item.status_penerimaan);
                                                return (
                                                <tr key={item.id || index} className={`${
                                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                }`}>
                                                    <td className={`px-2 py-2 text-xs font-medium ${getTextClasses('primary')} truncate`} title={item.no_dok}>{item.no_dok || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs font-mono ${getTextClasses('primary')} truncate`} title={item.part_no}>{item.part_no || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('primary')} truncate`} title={item.nama_barang || 'Nama barang tidak ditemukan'}>
                                                        {item.nama_barang || '-'}
                                                    </td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.dari_gudang}>{item.dari_gudang || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.ke_gudang}>{item.ke_gudang || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.reg}>{item.reg || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('primary')} text-center`}>{item.diminta || '-'}</td>
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('primary')} text-center`}>{item.dikirim || '-'}</td>
                                                    <td className="px-2 py-2 text-xs">
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
                                                    <td className="px-2 py-2 text-xs">
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
                                                    <td className="px-2 py-2 text-xs">
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
                                                    <td className={`px-2 py-2 text-xs ${getTextClasses('secondary')} truncate`} title={item.site}>{item.site || '-'}</td>
                                                </tr>
                                            )})}
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
            case 'users':
                return (
                    <div>
                        {/* Header */}
                        <div className={`${getCardClasses('p-6 mb-6')}`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className={`text-2xl font-bold ${getTextClasses('primary')} mb-2`}>Data User</h2>
                                    <p className={`${getTextClasses('secondary')}`}>Kelola dan pantau data pengguna sistem</p>
                                </div>
                                
                                {/* Search Input */}
                                <div className="mt-4 md:mt-0">
                                    <label htmlFor="user-search" className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Cari User:
                                    </label>
                                    <input
                                        type="text"
                                        id="user-search"
                                        value={searchUsers}
                                        onChange={(e) => setSearchUsers(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                setUsersCurrentPage(1);
                                                fetchUsersData(1, usersPerPage, searchUsers);
                                            }
                                        }}
                                        placeholder="🔍 Cari username, nama, email, NRP..."
                                        className={`w-64 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' 
                                                : 'bg-white border border-gray-300'
                                        }`}
                                    />
                                    <button
                                        onClick={() => {
                                            setUsersCurrentPage(1);
                                            fetchUsersData(1, usersPerPage, searchUsers);
                                        }}
                                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Cari
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className={`${getCardClasses('p-6')}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${getTextClasses('primary')}`}>
                                    👥 Daftar User ({usersTotal.toLocaleString()})
                                </h3>
                                
                                {/* Items per page selector */}
                                <div className="flex items-center space-x-2">
                                    <span className={`text-sm ${getTextClasses('secondary')}`}>Tampilkan:</span>
                                    <select
                                        value={usersPerPage}
                                        onChange={(e) => {
                                            const newPerPage = parseInt(e.target.value);
                                            setUsersPerPage(newPerPage);
                                            setUsersCurrentPage(1);
                                            fetchUsersData(1, newPerPage, searchUsers);
                                        }}
                                        className={`px-2 py-1 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-white' 
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <option value={10}>10</option>
                                        <option value={15}>15</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className={`text-sm ${getTextClasses('secondary')}`}>entri</span>
                                </div>
                            </div>

                            {/* Loading state */}
                            {usersLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className={`${getTextClasses('muted')}`}>Loading users data...</div>
                                </div>
                            ) : (
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
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Nama</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>NRP</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Email</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Site</th>
                                                    <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Role</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y ${
                                                isDarkMode 
                                                    ? 'bg-gray-800 divide-gray-600' 
                                                    : 'bg-white divide-gray-200'
                                            }`}>
                                                {usersData.map((user, index) => (
                                                    <tr key={user.id} className={`${
                                                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                                    }`}>
                                                        <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`}>
                                                            {user.username}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('primary')}`}>
                                                            {user.Nama}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm font-mono ${getTextClasses('secondary')}`}>
                                                            {user.NRP}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>
                                                            {user.Email}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>
                                                            {user.site_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                user.role_name === 'SuperAdmin' 
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : user.role_name === 'Admin'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {user.role_name}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {usersData.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                {searchUsers ? `Tidak ada user yang ditemukan untuk "${searchUsers}"` : 'Tidak ada data user'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Pagination */}
                            {usersTotalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className={`text-sm ${getTextClasses('secondary')}`}>
                                        Menampilkan {((usersCurrentPage - 1) * usersPerPage) + 1} - {Math.min(usersCurrentPage * usersPerPage, usersTotal)} dari {usersTotal.toLocaleString()} user
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                if (usersCurrentPage > 1) {
                                                    const newPage = usersCurrentPage - 1;
                                                    setUsersCurrentPage(newPage);
                                                    fetchUsersData(newPage, usersPerPage, searchUsers);
                                                }
                                            }}
                                            disabled={usersCurrentPage === 1 || usersLoading}
                                            className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                                usersCurrentPage === 1 || usersLoading
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            ← Sebelumnya
                                        </button>
                                        
                                        <span className={`text-sm ${getTextClasses('secondary')}`}>
                                            Halaman {usersCurrentPage} dari {usersTotalPages}
                                        </span>
                                        
                                        <button
                                            onClick={() => {
                                                if (usersCurrentPage < usersTotalPages) {
                                                    const newPage = usersCurrentPage + 1;
                                                    setUsersCurrentPage(newPage);
                                                    fetchUsersData(newPage, usersPerPage, searchUsers);
                                                }
                                            }}
                                            disabled={usersCurrentPage === usersTotalPages || usersLoading}
                                            className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                                usersCurrentPage === usersTotalPages || usersLoading
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            Selanjutnya →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Action Buttons */}
                        <div className="mt-6 flex justify-center space-x-4">
                            <button
                                onClick={() => setShowAddUserModal(true)}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                            >
                                <span className="text-lg">👤</span>
                                <span>Tambah User Baru</span>
                            </button>
                            <button
                                onClick={() => setShowEditUserModal(true)}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                            >
                                <span className="text-lg">✏️</span>
                                <span>Edit User</span>
                            </button>
                            <button
                                onClick={() => setShowDeleteUserModal(true)}
                                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                            >
                                <span className="text-lg">🗑️</span>
                                <span>Hapus User</span>
                            </button>
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
                            { id: 'users', label: 'User', icon: '👥' }
                            
                        ].map(menu => (
                            <button
                                key={menu.id}
                                onClick={() => {
                                    setActiveTab(menu.id);
                                }}
                                className={`w-full flex items-center space-x-3 px-2 group-hover:px-4 py-3 rounded-lg transition-all duration-300 text-left relative ${
                                    activeTab === menu.id
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-cyan-300 hover:bg-cyan-800/50 hover:text-cyan-100'
                                }`}
                                title={menu.label}
                            >
                                <span className="text-xl flex-shrink-0">{menu.icon}</span>
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
                                            name="siteid"
                                            value={addUserForm.siteid}
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

            {/* Modal Edit User */}
            {showEditUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-green-700">Edit User</h2>
                            <button
                                onClick={() => {
                                    setShowEditUserModal(false);
                                    setEditUserSearch('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Search Input */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="🔍 Cari username atau nama..."
                                value={editUserSearch}
                                onChange={(e) => setEditUserSearch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Users Table */}
                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Username</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Nama</th>
                                        <th className="px-3 py-2 text-center font-medium text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {usersData
                                        .filter(user => 
                                            user.id_status !== 1 && // Exclude superadmin
                                            (user.username.toLowerCase().includes(editUserSearch.toLowerCase()) ||
                                            user.Nama.toLowerCase().includes(editUserSearch.toLowerCase()))
                                        )
                                        .map((user, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 font-medium text-gray-900">{user.username}</td>
                                                <td className="px-3 py-2 text-gray-700">{user.Nama}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setUserToEdit(user);
                                                            setShowEditOptionsModal(true);
                                                        }}
                                                        className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            {usersData.filter(user => 
                                user.id_status !== 1 && // Exclude superadmin
                                (user.username.toLowerCase().includes(editUserSearch.toLowerCase()) ||
                                user.Nama.toLowerCase().includes(editUserSearch.toLowerCase()))
                            ).length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    {editUserSearch ? 'Tidak ada user yang ditemukan' : 'Tidak ada data user'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Delete User */}
            {showDeleteUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-red-700">Hapus User</h2>
                            <button
                                onClick={() => {
                                    setShowDeleteUserModal(false);
                                    setDeleteUserSearch('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Search Input */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="🔍 Cari username atau nama..."
                                value={deleteUserSearch}
                                onChange={(e) => setDeleteUserSearch(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        {/* Users Table */}
                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Username</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Nama</th>
                                        <th className="px-3 py-2 text-center font-medium text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {usersData
                                        .filter(user => 
                                            user.id_status !== 1 && // Exclude superadmin
                                            (user.username.toLowerCase().includes(deleteUserSearch.toLowerCase()) ||
                                            user.Nama.toLowerCase().includes(deleteUserSearch.toLowerCase()))
                                        )
                                        .map((user, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 font-medium text-gray-900">{user.username}</td>
                                                <td className="px-3 py-2 text-gray-700">{user.Nama}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setUserToDelete(user);
                                                            setShowDeleteConfirmModal(true);
                                                        }}
                                                        className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                            {usersData.filter(user => 
                                user.id_status !== 1 && // Exclude superadmin
                                (user.username.toLowerCase().includes(deleteUserSearch.toLowerCase()) ||
                                user.Nama.toLowerCase().includes(deleteUserSearch.toLowerCase()))
                            ).length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    {deleteUserSearch ? 'Tidak ada user yang ditemukan' : 'Tidak ada data user'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Delete Confirmation */}
            {showDeleteConfirmModal && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all">
                        {/* Icon and Title */}
                        <div className="text-center mb-4">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus User</h3>
                            <p className="text-sm text-gray-600 mb-2">
                                Apakah Anda yakin ingin menghapus user:
                            </p>
                            <div className="bg-gray-50 rounded-md p-3 mb-4">
                                <p className="font-semibold text-gray-900">{userToDelete.username}</p>
                                <p className="text-sm text-gray-600">{userToDelete.Nama}</p>
                            </div>
                            
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirmModal(false);
                                    setUserToDelete(null);
                                    setDeleteLoading(false);
                                }}
                                disabled={deleteLoading}
                                className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 font-medium ${
                                    deleteLoading 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={deleteLoading}
                                className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center justify-center ${
                                    deleteLoading 
                                        ? 'bg-red-400 cursor-not-allowed' 
                                        : 'bg-red-600 hover:bg-red-700'
                                } text-white`}
                            >
                                {deleteLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menghapus...
                                    </>
                                ) : (
                                    'Hapus'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Options */}
            {showEditOptionsModal && userToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-green-700">Edit User</h2>
                                <p className="text-sm text-gray-600">Pilih data yang ingin diubah</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditOptionsModal(false);
                                    setUserToEdit(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="bg-gray-50 rounded-md p-3 mb-6">
                            <p className="font-semibold text-gray-900">{userToEdit.username}</p>
                            <p className="text-sm text-gray-600">{userToEdit.Nama}</p>
                        </div>

                        {/* Edit Options */}
                        <div className="space-y-3">
                            {[
                                { id: 'nama', label: 'Nama', icon: '👤', current: userToEdit.Nama },
                                { id: 'nrp', label: 'NRP', icon: '🔢', current: userToEdit.NRP },
                                { id: 'email', label: 'Email', icon: '📧', current: userToEdit.Email },
                                { id: 'site', label: 'Site', icon: '🏢', current: userToEdit.site_name },
                                { id: 'role', label: 'Role', icon: '🛡️', current: userToEdit.role_name },
                                { id: 'password', label: 'Password', icon: '🔒', current: '••••••••' }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setEditField(option.id);
                                        setEditValue(''); // Always start with empty value
                                        setShowEditOptionsModal(false);
                                        setShowEditFormModal(true);
                                        setEditError('');
                                        setEditSuccess(false);
                                    }}
                                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xl">{option.icon}</span>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">{option.label}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-48">{option.current}</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>

                        {/* Cancel Button */}
                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setShowEditOptionsModal(false);
                                    setUserToEdit(null);
                                }}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Form */}
            {showEditFormModal && userToEdit && editField && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-green-700">Edit {editField.charAt(0).toUpperCase() + editField.slice(1)}</h2>
                                <p className="text-sm text-gray-600">{userToEdit.username} - {userToEdit.Nama}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditFormModal(false);
                                    setEditField('');
                                    setEditValue('');
                                    setEditError('');
                                    setEditSuccess(false);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // TODO: Implement actual edit functionality
                            alert(`Update ${editField} to: ${editValue}`);
                        }}>
                            {/* Input Field */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {editField === 'nama' && 'Masukkan Nama Lengkap Baru'}
                                    {editField === 'nrp' && 'Masukkan NRP Baru'}
                                    {editField === 'email' && 'Masukkan Email Baru'}
                                    {editField === 'password' && 'Masukkan Password Baru'}
                                    {editField === 'site' && 'Pilih Site Baru'}
                                    {editField === 'role' && 'Pilih Role Baru'}
                                </label>
                                
                                {/* Show current value info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-medium">Data saat ini: </span>
                                        {editField === 'nama' && userToEdit.Nama}
                                        {editField === 'nrp' && userToEdit.NRP}
                                        {editField === 'email' && userToEdit.Email}
                                        {editField === 'password' && '••••••••'}
                                        {editField === 'site' && userToEdit.site_name}
                                        {editField === 'role' && userToEdit.role_name}
                                    </p>
                                </div>
                                
                                {/* Text inputs for nama, nrp, email, password */}
                                {['nama', 'nrp', 'email', 'password'].includes(editField) && (
                                    <input
                                        type={editField === 'password' ? 'password' : editField === 'email' ? 'email' : 'text'}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder={
                                            editField === 'nama' ? 'Contoh: Ahmad Suryadi' :
                                            editField === 'nrp' ? 'Contoh: 123456789' :
                                            editField === 'email' ? 'Contoh: ahmad@email.com' :
                                            editField === 'password' ? 'Minimal 8 karakter' : ''
                                        }
                                        required
                                    />
                                )}

                                {/* Dropdown for site */}
                                {editField === 'site' && (
                                    <select
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="">-- Pilih Site Baru --</option>
                                        {sites.length > 0 ? sites.map((site) => (
                                            <option key={site.id} value={site.siteid}>
                                                {site.siteid}
                                            </option>
                                        )) : (
                                            <option value="" disabled>Loading sites...</option>
                                        )}
                                    </select>
                                )}

                                {/* Dropdown for role */}
                                {editField === 'role' && (
                                    <select
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="">-- Pilih Role Baru --</option>
                                        {rolesList.length > 0 ? rolesList.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        )) : (
                                            <option value="" disabled>Loading roles...</option>
                                        )}
                                    </select>
                                )}
                            </div>

                            {/* Error Message */}
                            {editError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                                    <div className="flex items-center">
                                        <span className="text-red-400 text-xl mr-2">❌</span>
                                        <p className="text-sm font-medium text-red-800">
                                            {editError}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {editSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                                    <div className="flex items-center">
                                        <span className="text-green-400 text-xl mr-2">✅</span>
                                        <p className="text-sm font-medium text-green-800">
                                            Data berhasil diupdate!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditFormModal(false);
                                        setEditField('');
                                        setEditValue('');
                                        setEditError('');
                                        setEditSuccess(false);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 font-medium disabled:bg-green-300"
                                >
                                    {editLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Gudang */}
            {showGudangModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${getCardClasses('p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col')}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-bold ${getTextClasses('primary')}`}>
                                🏢 Data Gudang
                            </h3>
                            <button
                                onClick={() => setShowGudangModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Button Add Gudang */}
                        <div className="mb-4">
                            <button
                                onClick={() => setShowAddGudangModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                                ➕ Tambah Gudang
                            </button>
                        </div>

                        {/* Table with scroll */}
                        <div className="flex-1 overflow-y-auto mb-4">
                            {gudangModalLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memuat data...
                                    </div>
                                </div>
                            ) : gudangModalData.length > 0 ? (
                                <table className="min-w-full table-auto">
                                    <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>No</th>
                                            <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Nama Gudang</th>
                                            <th className={`px-4 py-3 text-left text-sm font-medium ${getTextClasses('secondary')}`}>Site</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                                        {gudangModalData.map((item, index) => (
                                            <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                                <td className={`px-4 py-3 text-sm ${getTextClasses('primary')}`}>
                                                    {(gudangModalPage - 1) * itemsPerModalPage + index + 1}
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
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className="text-lg font-medium">Belum ada data gudang</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {gudangModalTotal > itemsPerModalPage && (
                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className={`text-sm ${getTextClasses('secondary')}`}>
                                    Total: {gudangModalTotal} gudang
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchGudangModalData(gudangModalPage - 1)}
                                        disabled={gudangModalPage === 1}
                                        className={`px-3 py-1 rounded ${
                                            gudangModalPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        ← Prev
                                    </button>
                                    <span className={`px-3 py-1 ${getTextClasses('primary')}`}>
                                        Page {gudangModalPage} of {Math.ceil(gudangModalTotal / itemsPerModalPage)}
                                    </span>
                                    <button
                                        onClick={() => fetchGudangModalData(gudangModalPage + 1)}
                                        disabled={gudangModalPage >= Math.ceil(gudangModalTotal / itemsPerModalPage)}
                                        className={`px-3 py-1 rounded ${
                                            gudangModalPage >= Math.ceil(gudangModalTotal / itemsPerModalPage)
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Site */}
            {showSiteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${getCardClasses('p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col')}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-bold ${getTextClasses('primary')}`}>
                                🏛️ Data Site
                            </h3>
                            <button
                                onClick={() => setShowSiteModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Button Add Site */}
                        <div className="mb-4">
                            <button
                                onClick={() => setShowAddSiteModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                                ➕ Tambah Site
                            </button>
                        </div>

                        {/* Table with scroll */}
                        <div className="flex-1 overflow-y-auto mb-4">
                            {siteModalLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memuat data...
                                    </div>
                                </div>
                            ) : siteModalData.length > 0 ? (
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
                                            <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                                <td className={`px-4 py-3 text-sm ${getTextClasses('primary')}`}>
                                                    {(siteModalPage - 1) * itemsPerModalPage + index + 1}
                                                </td>
                                                <td className={`px-4 py-3 text-sm font-medium ${getTextClasses('primary')}`}>
                                                    🏛️ {item.siteid}
                                                </td>
                                                <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>
                                                    {item.total_gudang || 0} gudang
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl mb-4 block">📭</span>
                                    <p className="text-lg font-medium">Belum ada data site</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {siteModalTotal > itemsPerModalPage && (
                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className={`text-sm ${getTextClasses('secondary')}`}>
                                    Total: {siteModalTotal} site
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchSiteModalData(siteModalPage - 1)}
                                        disabled={siteModalPage === 1}
                                        className={`px-3 py-1 rounded ${
                                            siteModalPage === 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        ← Prev
                                    </button>
                                    <span className={`px-3 py-1 ${getTextClasses('primary')}`}>
                                        Page {siteModalPage} of {Math.ceil(siteModalTotal / itemsPerModalPage)}
                                    </span>
                                    <button
                                        onClick={() => fetchSiteModalData(siteModalPage + 1)}
                                        disabled={siteModalPage >= Math.ceil(siteModalTotal / itemsPerModalPage)}
                                        className={`px-3 py-1 rounded ${
                                            siteModalPage >= Math.ceil(siteModalTotal / itemsPerModalPage)
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Add Gudang */}
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
                            </div>
                            <div className="mb-4">
                                <label className={`block text-sm font-medium mb-2 ${getTextClasses('primary')}`}>
                                    Site <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={addGudangForm.idsite}
                                    onChange={(e) => setAddGudangForm({ ...addGudangForm, idsite: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="">-- Pilih Site --</option>
                                    {siteList.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.siteid}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddGudangModal(false);
                                        setAddGudangForm({ location: '', idsite: '' });
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

            {/* Modal Add Site */}
            {showAddSiteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${getCardClasses('p-6 max-w-md w-full')}`}>
                        <h3 className={`text-xl font-bold ${getTextClasses('primary')} mb-4`}>
                            ➕ Tambah Site Baru
                        </h3>
                        <form onSubmit={handleAddSite}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Site ID</label>
                                <input
                                    type="text"
                                    value={addSiteForm.siteid}
                                    onChange={(e) => setAddSiteForm({ ...addSiteForm, siteid: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Contoh: LANUD ATS"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddSiteModal(false);
                                        setAddSiteForm({ siteid: '' });
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Simpan
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

export default WebMonitoringApp;
