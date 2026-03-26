import React, { useState, useEffect, useRef } from 'react';
import BarChart from './BarChart';
import LineChart from './LineChart';
import SafeStockPieChart from './SafeStockPieChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const UserDashboard = ({ user }) => {
    // Refs untuk dropdown
    const itemDropdownRef = useRef(null);
    const locationDropdownRef = useRef(null);
    const transaksiItemDropdownRef = useRef(null);
    const transaksiLocationDropdownRef = useRef(null);
    const gudangDropdownRef = useRef(null);
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
    const [filterItemId, setFilterItemId] = useState('');
    const [filterPartNumber, setFilterPartNumber] = useState('');
    const [filterNamaBarang, setFilterNamaBarang] = useState('all');
    const [namaBarangDropdownOpen, setNamaBarangDropdownOpen] = useState(false);
    const [searchNamaBarang, setSearchNamaBarang] = useState('');
    const [namaBarangList, setNamaBarangList] = useState([]);

    // State untuk notifikasi toast
    const [notification, setNotification] = useState({
        show: false,
        type: '', // 'success', 'error', 'warning', 'info'
        title: '',
        message: ''
    });

    // State untuk transaksi - LIMITED for user
    const [transaksiData, setTransaksiData] = useState([]);
    const [transaksiCurrentPage, setTransaksiCurrentPage] = useState(1);
    const [transaksiTotalPages, setTransaksiTotalPages] = useState(1);
    const [transaksiTotal, setTransaksiTotal] = useState(0);
    const [transaksiLoading, setTransaksiLoading] = useState(false);
    const [transaksiPerPage, setTransaksiPerPage] = useState(15);
    const [selectedTransaksiGudang, setSelectedTransaksiGudang] = useState('all');
    const [transaksiGudangList, setTransaksiGudangList] = useState([]);
    const [filterTransaksiNoDok, setFilterTransaksiNoDok] = useState('');
    const [filterTransaksiPartNumber, setFilterTransaksiPartNumber] = useState('');
    const [filterTransaksiNoReg, setFilterTransaksiNoReg] = useState('');
    const [filterTransaksiNamaBarang, setFilterTransaksiNamaBarang] = useState('all');
    const [transaksiNamaBarangDropdownOpen, setTransaksiNamaBarangDropdownOpen] = useState(false);
    const [searchTransaksiNamaBarang, setSearchTransaksiNamaBarang] = useState('');
    const [transaksiNamaBarangList, setTransaksiNamaBarangList] = useState([]);

    // State untuk modal tambah barang
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [addItemForm, setAddItemForm] = useState({
        itemnum: '',
        binnum: '',
        jumlah: ''
    });
    const [addItemLoading, setAddItemLoading] = useState(false);
    const [addItemSuccess, setAddItemSuccess] = useState(false);
    const [addItemError, setAddItemError] = useState('');
    const [itemList, setItemList] = useState([]);
    const [itemDropdownOpen, setItemDropdownOpen] = useState(false);
    const [searchItem, setSearchItem] = useState('');

    // State untuk modal tambah jenis barang
    const [showAddItemTypeModal, setShowAddItemTypeModal] = useState(false);
    const [addItemTypeForm, setAddItemTypeForm] = useState({
        itemnum: '',
        description: '',
        pn: '',
        issueunit: ''
    });
    const [addItemTypeLoading, setAddItemTypeLoading] = useState(false);
    const [addItemTypeSuccess, setAddItemTypeSuccess] = useState(false);
    const [addItemTypeError, setAddItemTypeError] = useState('');

    // State untuk modal tambah transaksi
    const [showAddTransaksiModal, setShowAddTransaksiModal] = useState(false);
    const [addTransaksiForm, setAddTransaksiForm] = useState({
        nomerdokumen: '',
        itemnum: '',
        tostoreloc: '',
        no_reg_sista: '',
        statpermintaan: '',
        receipts: '',
        status: '',
        diminta: '',
        dikirim: ''
    });
    const [addTransaksiLoading, setAddTransaksiLoading] = useState(false);
    const [transaksiItemList, setTransaksiItemList] = useState([]);
    const [transaksiLocationList, setTransaksiLocationList] = useState([]);

    // State untuk modal update status
    const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
    const [statusType, setStatusType] = useState(''); // 'permintaan', 'penerimaan', 'pengiriman'
    const [statusTransaksiList, setStatusTransaksiList] = useState([]);
    const [searchStatusTransaksi, setSearchStatusTransaksi] = useState('');
    const [selectedStatusTransaksi, setSelectedStatusTransaksi] = useState(null);
    const [newStatusValue, setNewStatusValue] = useState('');
    const [jumlahDikirim, setJumlahDikirim] = useState('');
    const [showJumlahDikirimInput, setShowJumlahDikirimInput] = useState(false);
    const [jumlahTerkirim, setJumlahTerkirim] = useState('');
    const [showJumlahTerkirimInput, setShowJumlahTerkirimInput] = useState(false);
    const [rakBinnum, setRakBinnum] = useState('');
    const [showRakBinnumInput, setShowRakBinnumInput] = useState(false);
    const [transaksiItemDropdownOpen, setTransaksiItemDropdownOpen] = useState(false);
    const [transaksiLocationDropdownOpen, setTransaksiLocationDropdownOpen] = useState(false);
    const [searchTransaksiItem, setSearchTransaksiItem] = useState('');
    const [searchTransaksiLocation, setSearchTransaksiLocation] = useState('');
    const [addTransaksiSuccess, setAddTransaksiSuccess] = useState(false);
    const [addTransaksiError, setAddTransaksiError] = useState('');

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
        // Fetch data dari Laravel API - USER: heavily filtered by location
        // Only fetch if user object is available
        if (user) {
            fetchDashboardData();
            fetchTransactionStatusData();
            fetchGudangList();
            fetchNamaBarangList();
            fetchTransaksiNamaBarangList();
            // Fetch gudang data immediately for tab display
            fetchGudangData(1, itemsPerPage);
            // Fetch transaksi data for dashboard summary
            fetchTransaksiData(1, transaksiPerPage);
        }
    }, [user]); // Add user as dependency

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
    }, [selectedTransaksiGudang, filterTransaksiNoDok, filterTransaksiPartNumber, filterTransaksiNoReg, filterTransaksiNamaBarang]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fungsi helper untuk menampilkan notifikasi
    const showNotification = (type, title, message) => {
        setNotification({
            show: true,
            type,
            title,
            message
        });

        // Auto hide setelah 5 detik
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.custom-dropdown')) {
                setDropdownOpen(false);
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
    }, [dropdownOpen, namaBarangDropdownOpen, transaksiNamaBarangDropdownOpen]);

    // Close item dropdown (Tambah Barang) when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
                setItemDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close transaksi item dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (transaksiItemDropdownRef.current && !transaksiItemDropdownRef.current.contains(event.target)) {
                setTransaksiItemDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close transaksi location dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (transaksiLocationDropdownRef.current && !transaksiLocationDropdownRef.current.contains(event.target)) {
                setTransaksiLocationDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch status statistics and warehouse statistics when transaksi tab is active or filter changes
    useEffect(() => {
        if (activeTab === 'transaksi') {
            fetchStatusStatistics();
            fetchWarehouseStatistics();
        }
    }, [activeTab, selectedTransaksiGudang, filterTransaksiNoDok, filterTransaksiPartNumber, filterTransaksiNoReg, filterTransaksiNamaBarang]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load item list when modal opens
    useEffect(() => {
        if (showAddItemModal) {
            fetchItemList();
        }
    }, [showAddItemModal]);

    // Load transaksi item and location list when modal opens
    useEffect(() => {
        if (showAddTransaksiModal) {
            fetchTransaksiItemList();
            fetchTransaksiLocationList();
        }
    }, [showAddTransaksiModal]);

    // Close modals when ESC key is pressed
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                if (showAddItemModal) {
                    setShowAddItemModal(false);
                }
                if (showAddItemTypeModal) {
                    setShowAddItemTypeModal(false);
                }
                if (showAddTransaksiModal) {
                    setShowAddTransaksiModal(false);
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showAddItemModal, showAddItemTypeModal, showAddTransaksiModal]);

    // USER: Data heavily filtered by user's site
    const fetchDashboardData = async () => {
        try {
            console.log('🔍 UserDashboard - Full user object:', user);
            
            // Check if user has location ID directly
            let userLocId = user?.locid || user?.loc_id || user?.location_id || user?.idlocation;
            
            // If not, check if user has location name and we need to get ID from backend
            const userLocation = user?.location;
            
            console.log('🔍 UserDashboard - User locid:', userLocId);
            console.log('🔍 UserDashboard - User location name:', userLocation);
            
            // If we have location name but no ID, send location name to backend
            let apiUrl;
            if (userLocId) {
                apiUrl = `/api/dashboard?user_role=user&user_locid=${userLocId}`;
            } else if (userLocation) {
                // Send location name, backend will resolve to ID
                apiUrl = `/api/dashboard?user_role=user&user_location=${encodeURIComponent(userLocation)}`;
            } else {
                console.error('❌ User location ID or name not found in user object!');
                return;
            }
            
            console.log('🔗 Calling API:', apiUrl);
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log('📊 UserDashboard - Dashboard data:', data);
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchTransactionStatusData = async () => {
        try {
            const userLocId = user?.locid; // Use user's location ID
            const response = await fetch(`/api/transaction-status-chart?user_role=user&user_locid=${userLocId}`);
            const data = await response.json();
            setTransactionStatusData(data);
        } catch (error) {
            console.error('Error fetching transaction status data:', error);
        }
    };

    const fetchItemList = async (search = '') => {
        try {
            // Tidak kirim user_locid agar mendapat semua item dari database
            const response = await fetch(`/api/item-list?search=${encodeURIComponent(search)}`);
            const data = await response.json();
            if (data.success) {
                setItemList(data.data);
            }
        } catch (error) {
            console.error('Error fetching item list:', error);
        }
    };

    const fetchTransaksiItemList = async (search = '') => {
        try {
            const response = await fetch(`/api/item-list?search=${encodeURIComponent(search)}&user_locid=${user?.locid || ''}`);
            const data = await response.json();
            if (data.success) {
                setTransaksiItemList(data.data);
            }
        } catch (error) {
            console.error('Error fetching transaksi item list:', error);
        }
    };

    const fetchTransaksiLocationList = async (search = '') => {
        try {
            const response = await fetch(`/api/location-list?search=${encodeURIComponent(search)}`);
            const data = await response.json();
            if (data.success) {
                setTransaksiLocationList(data.data);
            }
        } catch (error) {
            console.error('Error fetching location list:', error);
        }
    };

    const openUpdateStatusModal = (type) => {
        setStatusType(type);
        setShowUpdateStatusModal(true);
        setSearchStatusTransaksi('');
        // Fetch transaksi data untuk modal dengan filter berdasarkan type
        fetchStatusTransaksiList(type);
    };

    const fetchStatusTransaksiList = async (type) => {
        try {
            const userLocId = user?.locid;
            // Filter berdasarkan tipe status:
            // - permintaan & pengiriman: fromstoreloc = user.locid (dari gudang user)
            // - penerimaan: tostoreloc = user.locid (tujuan ke gudang user)
            const filterParam = type === 'penerimaan' 
                ? `&filter_type=tostoreloc&filter_locid=${userLocId}`
                : `&filter_type=fromstoreloc&filter_locid=${userLocId}`;
            
            const response = await fetch(`/api/transaksi?page=1&per_page=1000&user_role=user&user_locid=${userLocId}${filterParam}`);
            const data = await response.json();
            if (data.data) {
                setStatusTransaksiList(data.data);
            }
        } catch (error) {
            console.error('Error fetching status transaksi list:', error);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedStatusTransaksi || !newStatusValue) {
            showNotification('warning', 'Perhatian!', 'Silakan pilih transaksi dan status baru terlebih dahulu');
            return;
        }

        // Validasi jumlah dikirim jika input ditampilkan
        if (showJumlahDikirimInput && !jumlahDikirim) {
            showNotification('warning', 'Perhatian!', 'Jumlah dikirim harus diisi');
            return;
        }

        // Validasi jumlah terkirim jika input ditampilkan (hanya untuk PARTIAL)
        if (showJumlahTerkirimInput && !jumlahTerkirim) {
            showNotification('warning', 'Perhatian!', 'Jumlah terkirim harus diisi');
            return;
        }

        try {
            const requestBody = {
                invusenum: selectedStatusTransaksi.invusenum,
                status_type: statusType,
                status_value: newStatusValue
            };

            // Tambahkan old_status_value untuk status penerimaan
            if (statusType === 'penerimaan') {
                requestBody.old_status_value = selectedStatusTransaksi.status_penerimaan || 'NONE';
            }

            // Tambahkan jumlah dikirim jika status permintaan berubah dari DITOLAK ke DIPROSES
            if (showJumlahDikirimInput && jumlahDikirim) {
                requestBody.jumlah_dikirim = jumlahDikirim;
            }

            // Tambahkan jumlah terkirim jika status penerimaan diubah ke PARTIAL atau COMPLETE
            if (showJumlahTerkirimInput && jumlahTerkirim) {
                requestBody.jumlah_terkirim = jumlahTerkirim;
            }

            // Tambahkan rak (binnum) jika diisi (opsional untuk PARTIAL/COMPLETE)
            if (showRakBinnumInput && rakBinnum) {
                requestBody.rak_binnum = rakBinnum;
            }

            const response = await fetch('/api/transaksi/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success) {
                showNotification('success', 'Berhasil!', `Status ${statusType === 'penerimaan' ? 'Penerimaan' : statusType === 'permintaan' ? 'Permintaan' : 'Pengiriman'} berhasil diperbarui menjadi ${newStatusValue}`);
                setShowUpdateStatusModal(false);
                setSelectedStatusTransaksi(null);
                setNewStatusValue('');
                setJumlahDikirim('');
                setJumlahTerkirim('');
                setRakBinnum('');
                setShowJumlahDikirimInput(false);
                setShowJumlahTerkirimInput(false);
                setShowRakBinnumInput(false);
                setSearchStatusTransaksi('');
                // Refresh transaksi data
                fetchTransaksiData(transaksiCurrentPage, transaksiPerPage);
            } else {
                showNotification('error', 'Gagal!', data.message || 'Terjadi kesalahan saat mengupdate status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('error', 'Error!', 'Terjadi kesalahan saat mengupdate status. Silakan coba lagi.');
        }
    };

    const fetchTransaksiData = async (page = 1, perPage = 15) => {
        if (transaksiLoading) return;
        
        setTransaksiLoading(true);
        try {
            const userLocId = user?.locid; // Use user's location ID
            console.log('🔍 User object:', user);
            console.log('🔍 User locid:', userLocId);
            
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('per_page', perPage);
            params.append('user_locid', userLocId);
            params.append('user_role', 'user');
            
            if (selectedTransaksiGudang !== 'all') {
                params.append('filter_from', selectedTransaksiGudang);
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
            
            const apiUrl = `/api/transaksi?${params.toString()}`;
            
            console.log('🔗 Calling API:', apiUrl);
            console.log('🔍 User Fetching transaksi with params:', { page, perPage, filter_from: selectedTransaksiGudang, userLocId });
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            console.log('📄 User Transaksi response:', data);
            console.log('📄 User Transaksi total:', data.total);
            
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
            
            // Build query params with all transaksi filters
            const params = new URLSearchParams();
            params.append('filter', selectedTransaksiGudang);
            params.append('user_locid', user?.locid || '');
            params.append('user_role', 'user');
            
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
            
            const response = await fetch(`/api/status-statistics?${params.toString()}`);
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
            
            // Build query params with all transaksi filters
            const params = new URLSearchParams();
            params.append('filter', selectedTransaksiGudang);
            params.append('limit', '10');
            params.append('user_locid', user?.locid || '');
            params.append('user_role', 'user');
            
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
            
            const response = await fetch(`/api/top-active-warehouses?${params.toString()}`);
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

    const fetchStatusDetail = async (statusType, statusValue) => {
        setStatusDetailLoading(true);
        try {
            const params = {
                status_type: statusType,
                status_value: statusValue,
                filter: selectedTransaksiGudang || 'all',
                site_filter: user?.siteid || '',
                user_role: 'user',
                user_locid: user?.locid || ''
            };
            
            // Add additional filters
            if (filterTransaksiNoDok) params.filter_nodok = filterTransaksiNoDok;
            if (filterTransaksiPartNumber) params.filter_partnumber = filterTransaksiPartNumber;
            if (filterTransaksiNoReg) params.filter_noreg = filterTransaksiNoReg;
            if (filterTransaksiNamaBarang && filterTransaksiNamaBarang !== 'all') {
                params.filter_namabarang = filterTransaksiNamaBarang;
            }
            
            const response = await axios.get('/api/status-detail', { params });
            
            if (response.data.success) {
                setStatusDetailData(response.data.data);
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

    // Fetch nama barang list untuk dropdown filter gudang
    const fetchNamaBarangList = async () => {
        try {
            const response = await fetch(`/api/nama-barang-list?user_locid=${user?.locid}&user_role=user`);
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
            const response = await fetch(`/api/transaksi-nama-barang-list?user_locid=${user?.locid}&user_role=user`);
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
            params.append('user_locid', user?.locid);
            params.append('user_role', 'user');
            
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
            console.log('🔄 Fetching gudang data from URL:', url);
            const response = await fetch(url);
            const data = await response.json();
            console.log('📦 Gudang data response:', data);
            
            setGudangData(data.data || []);
            setCurrentPage(data.current_page || 1);
            setTotalPages(data.last_page || 1);
            setTotalItems(data.total || 0);
            
            console.log('✅ Gudang data set:', {
                dataLength: (data.data || []).length,
                currentPage: data.current_page || 1,
                totalPages: data.last_page || 1,
                totalItems: data.total || 0
            });
        } catch (error) {
            console.error('❌ Error fetching user gudang data:', error);
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
    
    // State untuk pagination tooltip
    const [tooltipPage, setTooltipPage] = useState(1);
    const tooltipPerPage = 5;

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
                                            : 'bg-gray-50 hover:bg-green-50'
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
                                                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                                                    : 'bg-green-500 text-white hover:bg-green-600'
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
                                                                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                                                                    : 'bg-green-500 text-white hover:bg-green-600'
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
                        {/* USER Dashboard - Simplified */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            <div className="flex flex-col gap-4">
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Gudang Anda</p>
                                            <p className={`text-xl font-bold ${getTextClasses('primary')} truncate`} title={user?.location || '-'}>
                                                {user?.location || '-'}
                                            </p>
                                        </div>
                                        <div className="bg-blue-600 text-white p-3 rounded-full">
                                            <span className="text-2xl">🏢</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={`${getCardClasses('p-6 w-72')}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className={`${getTextClasses('secondary')} text-sm`}>Site Anda</p>
                                            <p className={`text-xl font-bold ${getTextClasses('primary')} truncate`} title={user?.site || '-'}>
                                                {user?.site || '-'}
                                            </p>
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
                                    Ringkasan Data 
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <div className="bg-blue-500 text-white p-2 rounded-full mx-auto w-8 h-8 flex items-center justify-center mb-1">
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

                        {/* Transaction Status Chart */}
                        <div className="mb-8">
                            <div className={`${getCardClasses('p-6')}`}>
                                <BarChart 
                                    data={transactionStatusData} 
                                    title="📈 Status Transaksi"
                                    compact={false}
                                    onBarClick={handleBarClick}
                                />
                            </div>
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
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                👤 USER
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <h4 className={`font-semibold ${getTextClasses('primary')} mb-2`}>Akses & Permissions</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                            <span className="text-blue-500 mr-2">✅</span>
                                            <span className={getTextClasses('secondary')}>Lihat data gudang site</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-blue-500 mr-2">✅</span>
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
                    <div className={`${getCardClasses('p-6')} ${namaBarangDropdownOpen || dropdownOpen ? 'overflow-visible' : ''}`}>
                        {/* Header dengan Judul, Total, Filter dan Button Tambah */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                            <div className="flex-1">
                                <h2 className={`text-2xl font-bold ${getTextClasses('primary')} mb-2`}>Data Gudang</h2>
                                <p className={`${getTextClasses('secondary')} text-sm mb-4`}>
                                    Total: {totalItems.toLocaleString()} item di gudang Anda
                                </p>
                            </div>
                            
                            {/* Filter Gudang, Items per page, dan Button Tambah */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
                                {/* Button Tambah Jenis Barang */}
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setShowAddItemTypeModal(true)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <span>📦</span>
                                        Tambah Jenis Barang
                                    </button>
                                </div>
                                
                                {/* Button Tambah Barang */}
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setShowAddItemModal(true)}
                                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <span>➕</span>
                                        Tambah Barang
                                    </button>
                                </div>

                                {/* Items per page */}
                                <div>
                                    <label htmlFor="items-per-page" className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Items per page:
                                    </label>
                                    <select
                                        id="items-per-page"
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(parseInt(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className={`px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
                        </div>

                        {/* Tabel */}
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
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.rak || '-'}</td>
                                                        <td className={`px-4 py-3 text-sm font-semibold text-right ${getTextClasses('primary')}`}>
                                                            {item.jumlah || '0'}
                                                        </td>
                                                        <td className={`px-4 py-3 text-sm ${getTextClasses('secondary')}`}>{item.satuan || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-4 py-12 text-center">
                                                        <span className={`text-4xl mb-4 block ${getTextClasses('secondary')}`}>📭</span>
                                                        <p className={`text-lg font-medium ${getTextClasses('primary')}`}>Belum ada data barang</p>
                                                        <p className={`text-sm ${getTextClasses('secondary')}`}>
                                                            Tidak ada data barang tersedia untuk lokasi Anda
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                            </div>
                        )}
                        </div>

                        {/* Distribusi Stock Chart */}
                        <div className="mt-8">
                            {console.log('🔍 UserDashboard - Tab Gudang - user object:', user)}
                            {console.log('🔍 UserDashboard - Tab Gudang - user.locid:', user?.locid)}
                            <SafeStockPieChart 
                                selectedGudang={selectedGudang} 
                                title="📊 Distribusi Stock Barang"
                                isDarkMode={isDarkMode}
                                userLocId={user?.locid}
                                userRole="user"
                                filterItemId={filterItemId}
                                filterPartNumber={filterPartNumber}
                                filterNamaBarang={filterNamaBarang}
                            />
                        </div>
                    </div>
                );

            case 'transaksi':
                return (
                    <div className="space-y-6">
                        <div className={`${getCardClasses('p-6')} ${transaksiNamaBarangDropdownOpen ? 'overflow-visible' : ''}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-2xl font-bold ${getTextClasses('primary')} flex items-center`}>
                                <span className="text-2xl mr-2">💳</span>
                                Data Transaksi
                            </h2>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowAddTransaksiModal(true)}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <span>➕</span>
                                    <span>Tambah Transaksi</span>
                                </button>
                                <div className={`text-sm ${getTextClasses('secondary')}`}>
                                    Total: {transaksiTotal.toLocaleString()} transaksi
                                </div>
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
                                <div className={`overflow-x-auto ${transaksiNamaBarangDropdownOpen ? 'overflow-visible' : 'relative'}`}>
                                    <div className={`rounded-lg ${
                                        isDarkMode ? 'border border-gray-600' : 'border border-gray-200'
                                    } ${transaksiData.length > 0 && !transaksiNamaBarangDropdownOpen ? 'max-h-[600px] overflow-y-auto' : 'overflow-visible'}`}>
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
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Dari Gudang</th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>Tujuan</th>
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
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <button
                                                            onClick={() => openUpdateStatusModal('permintaan')}
                                                            className="w-full px-2 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
                                                        >
                                                            Ubah Status
                                                        </button>
                                                        <span>Status Permintaan</span>
                                                    </div>
                                                </th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <button
                                                            onClick={() => openUpdateStatusModal('penerimaan')}
                                                            className="w-full px-2 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
                                                        >
                                                            Ubah Status
                                                        </button>
                                                        <span>Status Penerimaan</span>
                                                    </div>
                                                </th>
                                                <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${getTextClasses('muted')}`}>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <button
                                                            onClick={() => openUpdateStatusModal('pengiriman')}
                                                            className="w-full px-2 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
                                                        >
                                                            Ubah Status
                                                        </button>
                                                        <span>Status Pengiriman</span>
                                                    </div>
                                                </th>
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
                        <div className={`${getCardClasses('p-6')}`}>
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
            {/* Toast Notification */}
            {notification.show && (
                <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
                    <div className={`max-w-md rounded-lg shadow-2xl border-l-4 ${
                        notification.type === 'success' ? 'bg-white border-green-500' :
                        notification.type === 'error' ? 'bg-white border-red-500' :
                        notification.type === 'warning' ? 'bg-white border-yellow-500' :
                        'bg-white border-blue-500'
                    } p-4 flex items-start gap-3`}>
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.type === 'success' ? 'bg-green-100' :
                            notification.type === 'error' ? 'bg-red-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            'bg-blue-100'
                        }`}>
                            {notification.type === 'success' && (
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {notification.type === 'error' && (
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            {notification.type === 'warning' && (
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                            {notification.type === 'info' && (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${
                                notification.type === 'success' ? 'text-green-800' :
                                notification.type === 'error' ? 'text-red-800' :
                                notification.type === 'warning' ? 'text-yellow-800' :
                                'text-blue-800'
                            }`}>
                                {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                            <div className={`h-full ${
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'error' ? 'bg-red-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                'bg-blue-500'
                            } animate-progress`}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Styles for glow effect and animations */}
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
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
                .animate-progress {
                    animation: progress 5s linear;
                }
            `}</style>
            
            {/* USER Sidebar - Cyan theme */}
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
                            <p className="text-cyan-400 text-xs truncate opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">{user?.username} (USER)</p>
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

            {/* Modal Tambah Barang */}
            {showAddItemModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">Tambah Barang</h2>
                            <button
                                onClick={() => {
                                    setShowAddItemModal(false);
                                    setAddItemForm({ itemnum: '', binnum: '', jumlah: '' });
                                    setAddItemSuccess(false);
                                    setAddItemError('');
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            
                            if (!addItemForm.itemnum) {
                                setAddItemError('Silakan pilih Item ID terlebih dahulu');
                                return;
                            }
                            
                            setAddItemLoading(true);
                            setAddItemError('');
                            setAddItemSuccess(false);

                            try {
                                const response = await fetch('/api/item/add', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        itemnum: addItemForm.itemnum,
                                        binnum: addItemForm.binnum,
                                        jumlah: addItemForm.jumlah,
                                        user_locid: user?.locid
                                    })
                                });

                                const data = await response.json();

                                if (data.success) {
                                    setAddItemSuccess(true);
                                    setAddItemForm({ itemnum: '', binnum: '', jumlah: '' });
                                    
                                    // Refresh data gudang setelah 1.5 detik
                                    setTimeout(() => {
                                        setShowAddItemModal(false);
                                        setAddItemSuccess(false);
                                        fetchGudangData(currentPage);
                                    }, 1500);
                                } else {
                                    setAddItemError(data.message || 'Gagal menambahkan barang');
                                }
                            } catch (error) {
                                console.error('Error adding item:', error);
                                setAddItemError('Terjadi kesalahan saat menambahkan barang');
                            } finally {
                                setAddItemLoading(false);
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Item ID <span className="text-red-500">*</span>
                                    </label>
                                    <div className="custom-dropdown relative" ref={itemDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setItemDropdownOpen(!itemDropdownOpen)}
                                            className={`relative block w-full px-3 py-2 text-left rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors ${
                                                isDarkMode 
                                                    ? 'bg-gray-700 border border-gray-600 text-white' 
                                                    : 'bg-white border border-gray-300'
                                            }`}
                                        >
                                            <span className="block truncate">
                                                {addItemForm.itemnum || '🔍 Pilih Item'}
                                            </span>
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </button>
                                        
                                        {itemDropdownOpen && (
                                            <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
                                                isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-200'
                                            }`}>
                                                <div className={`p-2 border-b ${
                                                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                                                }`}>
                                                    <input
                                                        type="text"
                                                        placeholder="🔍 Cari item..."
                                                        value={searchItem}
                                                        onChange={(e) => {
                                                            setSearchItem(e.target.value);
                                                            fetchItemList(e.target.value);
                                                        }}
                                                        className={`w-full px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                                                            isDarkMode 
                                                                ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400' 
                                                                : 'bg-white border border-gray-300 text-gray-900'
                                                        }`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                
                                                <div className="max-h-60 overflow-y-auto">
                                                    {itemList.length > 0 ? (
                                                        itemList.map((item, index) => (
                                                            <div 
                                                                key={index}
                                                                className={`px-3 py-2 cursor-pointer ${
                                                                    addItemForm.itemnum === item.itemnum 
                                                                        ? (isDarkMode ? 'bg-cyan-800 text-cyan-300' : 'bg-cyan-50 text-cyan-700')
                                                                        : (isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100')
                                                                }`}
                                                                onClick={() => {
                                                                    setAddItemForm({...addItemForm, itemnum: item.itemnum});
                                                                    setItemDropdownOpen(false);
                                                                    setSearchItem('');
                                                                }}
                                                            >
                                                                <div className="font-medium">{item.itemnum}</div>
                                                                {item.description && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                        {item.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                                                            {searchItem ? 'Item tidak ditemukan' : 'Loading...'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Rak <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addItemForm.binnum}
                                        onChange={(e) => setAddItemForm({...addItemForm, binnum: e.target.value.toUpperCase()})}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white uppercase"
                                        placeholder="Masukkan nomor rak"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Jumlah <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={addItemForm.jumlah}
                                        onChange={(e) => setAddItemForm({...addItemForm, jumlah: e.target.value})}
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Masukkan jumlah"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddItemModal(false);
                                        setAddItemForm({ itemnum: '', binnum: '', jumlah: '' });
                                        setAddItemSuccess(false);
                                        setAddItemError('');
                                    }}
                                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addItemLoading}
                                    className="flex-1 py-2 px-4 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 disabled:bg-cyan-400 transition"
                                >
                                    {addItemLoading ? 'Menyimpan...' : 'Tambah Barang'}
                                </button>
                            </div>
                            
                            {addItemSuccess && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-blue-400 text-xl mr-2">✅</span>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                            Barang berhasil ditambahkan!
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {addItemError && (
                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-red-400 text-xl mr-2">❌</span>
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                            {addItemError}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Jenis Barang */}
            {showAddItemTypeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">Tambah Jenis Barang</h2>
                            <button
                                onClick={() => {
                                    setShowAddItemTypeModal(false);
                                    setAddItemTypeForm({ itemnum: '', description: '', pn: '', issueunit: '' });
                                    setAddItemTypeSuccess(false);
                                    setAddItemTypeError('');
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setAddItemTypeLoading(true);
                            setAddItemTypeError('');
                            setAddItemTypeSuccess(false);

                            try {
                                const response = await fetch('/api/item-type/add', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(addItemTypeForm)
                                });

                                const data = await response.json();

                                if (data.success) {
                                    setAddItemTypeSuccess(true);
                                    setAddItemTypeForm({ itemnum: '', description: '', pn: '', issueunit: '' });
                                    
                                    // Refresh item list dan close modal setelah 1.5 detik
                                    setTimeout(() => {
                                        setShowAddItemTypeModal(false);
                                        setAddItemTypeSuccess(false);
                                        fetchItemList(); // Refresh dropdown item
                                    }, 1500);
                                } else {
                                    setAddItemTypeError(data.message || 'Gagal menambahkan jenis barang');
                                }
                            } catch (error) {
                                console.error('Error adding item type:', error);
                                setAddItemTypeError('Terjadi kesalahan saat menambahkan jenis barang');
                            } finally {
                                setAddItemTypeLoading(false);
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Item ID <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addItemTypeForm.itemnum}
                                        onChange={(e) => setAddItemTypeForm({...addItemTypeForm, itemnum: e.target.value.toUpperCase()})}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
                                        placeholder="Masukkan Item ID"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Barang <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addItemTypeForm.description}
                                        onChange={(e) => setAddItemTypeForm({...addItemTypeForm, description: e.target.value.toUpperCase()})}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
                                        placeholder="Masukkan nama barang"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Part Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addItemTypeForm.pn}
                                        onChange={(e) => setAddItemTypeForm({...addItemTypeForm, pn: e.target.value.toUpperCase()})}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
                                        placeholder="Masukkan part number"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Satuan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addItemTypeForm.issueunit}
                                        onChange={(e) => setAddItemTypeForm({...addItemTypeForm, issueunit: e.target.value.toUpperCase()})}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white uppercase"
                                        placeholder="Masukkan satuan (contoh: PCS, KG, LITER)"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddItemTypeModal(false);
                                        setAddItemTypeForm({ itemnum: '', description: '', pn: '', issueunit: '' });
                                        setAddItemTypeSuccess(false);
                                        setAddItemTypeError('');
                                    }}
                                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addItemTypeLoading}
                                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400 transition"
                                >
                                    {addItemTypeLoading ? 'Menyimpan...' : 'Tambah Jenis Barang'}
                                </button>
                            </div>
                            
                            {addItemTypeSuccess && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-blue-400 text-xl mr-2">✅</span>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                            Jenis barang berhasil ditambahkan!
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {addItemTypeError && (
                                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-3 mt-4">
                                    <div className="flex items-center">
                                        <span className="text-red-400 text-xl mr-2">❌</span>
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                            {addItemTypeError}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Tambah Transaksi */}
            {showAddTransaksiModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
                        <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 flex justify-between items-center`}>
                            <h3 className={`text-xl font-bold ${getTextClasses('primary')}`}>➕ Tambah Transaksi Baru</h3>
                            <button
                                onClick={() => {
                                    setShowAddTransaksiModal(false);
                                    setAddTransaksiForm({
                                        nomerdokumen: '',
                                        itemnum: '',
                                        tostoreloc: '',
                                        no_reg_sista: '',
                                        statpermintaan: '',
                                        receipts: '',
                                        status: ''
                                    });
                                    setAddTransaksiSuccess(false);
                                    setAddTransaksiError('');
                                }}
                                className={`${getTextClasses('secondary')} hover:${getTextClasses('primary')} text-2xl`}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            
                            try {
                                const requestData = {
                                    nomerdokumen: addTransaksiForm.nomerdokumen,
                                    itemnum: addTransaksiForm.itemnum,
                                    tostoreloc: addTransaksiForm.tostoreloc,
                                    no_reg_sista: addTransaksiForm.no_reg_sista,
                                    statpermintaan: addTransaksiForm.statpermintaan,
                                    status: addTransaksiForm.status,
                                    diminta: addTransaksiForm.diminta,
                                    dikirim: addTransaksiForm.dikirim,
                                    user_locid: user?.locid
                                };
                                
                                console.log('Sending data:', requestData);
                                
                                const response = await fetch('/api/transaksi/add', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(requestData)
                                });

                                const data = await response.json();
                                
                                console.log('API Response:', data);

                                if (response.ok && data.success) {
                                    showNotification('success', 'Berhasil!', 'Transaksi baru berhasil ditambahkan ke sistem');
                                    // Reset form
                                    setAddTransaksiForm({
                                        nomerdokumen: '',
                                        itemnum: '',
                                        tostoreloc: '',
                                        no_reg_sista: '',
                                        statpermintaan: '',
                                        receipts: 'NONE',
                                        status: '',
                                        diminta: '',
                                        dikirim: ''
                                    });
                                    // Close modal after 1.5s
                                    setTimeout(() => {
                                        setShowAddTransaksiModal(false);
                                        // Refresh transaksi list
                                        fetchTransaksi();
                                    }, 1500);
                                } else {
                                    // Tampilkan pesan error dari server
                                    showNotification('error', 'Gagal!', data.message || 'Terjadi kesalahan saat menambahkan transaksi');
                                }
                            } catch (error) {
                                console.error('Error adding transaksi:', error);
                                showNotification('error', 'Error!', 'Terjadi kesalahan saat menambahkan transaksi. Silakan coba lagi.');
                            }
                        }} className="p-6">
                            <div className="space-y-4">
                                {/* Nomor Dokumen */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Nomor Dokumen <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addTransaksiForm.nomerdokumen}
                                        onChange={(e) => setAddTransaksiForm({...addTransaksiForm, nomerdokumen: e.target.value.toUpperCase()})}
                                        required
                                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase`}
                                        placeholder="Masukkan nomor dokumen"
                                    />
                                </div>

                                {/* Item ID */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Item ID <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative" ref={transaksiItemDropdownRef}>
                                        <input
                                            type="text"
                                            value={searchTransaksiItem || addTransaksiForm.itemnum}
                                            onChange={(e) => {
                                                setSearchTransaksiItem(e.target.value);
                                                setTransaksiItemDropdownOpen(true);
                                            }}
                                            onFocus={() => setTransaksiItemDropdownOpen(true)}
                                            required
                                            className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="Cari atau pilih item..."
                                        />
                                        
                                        {transaksiItemDropdownOpen && (
                                            <div className={`absolute z-50 w-full mt-1 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-md shadow-lg`}>
                                                {transaksiItemList
                                                    .filter(item => 
                                                        item.itemnum.toLowerCase().includes(searchTransaksiItem.toLowerCase()) ||
                                                        item.description.toLowerCase().includes(searchTransaksiItem.toLowerCase())
                                                    )
                                                    .map((item, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => {
                                                                setAddTransaksiForm({...addTransaksiForm, itemnum: item.itemnum});
                                                                setSearchTransaksiItem('');
                                                                setTransaksiItemDropdownOpen(false);
                                                            }}
                                                            className={`px-3 py-2 cursor-pointer ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                                                        >
                                                            <div className="font-semibold">{item.itemnum}</div>
                                                            <div className={`text-sm ${getTextClasses('secondary')}`}>{item.description}</div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                    {addTransaksiForm.itemnum && (
                                        <div className={`mt-1 text-sm ${getTextClasses('secondary')}`}>
                                            Dipilih: {addTransaksiForm.itemnum}
                                        </div>
                                    )}
                                </div>

                                {/* Peminta (tostoreloc) */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Peminta <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative" ref={transaksiLocationDropdownRef}>
                                        <input
                                            type="text"
                                            value={searchTransaksiLocation}
                                            onChange={(e) => {
                                                setSearchTransaksiLocation(e.target.value);
                                                setTransaksiLocationDropdownOpen(true);
                                            }}
                                            onFocus={() => setTransaksiLocationDropdownOpen(true)}
                                            required
                                            className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                            placeholder="Cari atau pilih lokasi..."
                                        />
                                        
                                        {transaksiLocationDropdownOpen && (
                                            <div className={`absolute z-50 w-full mt-1 max-h-60 overflow-y-auto ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-md shadow-lg`}>
                                                {transaksiLocationList
                                                    .filter(loc => 
                                                        loc.location.toLowerCase().includes(searchTransaksiLocation.toLowerCase())
                                                    )
                                                    .map((loc, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => {
                                                                setAddTransaksiForm({...addTransaksiForm, tostoreloc: loc.id});
                                                                setSearchTransaksiLocation(loc.location);
                                                                setTransaksiLocationDropdownOpen(false);
                                                            }}
                                                            className={`px-3 py-2 cursor-pointer ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                                                        >
                                                            {loc.location}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </div>
                                    {addTransaksiForm.tostoreloc && (
                                        <div className={`mt-1 text-sm ${getTextClasses('secondary')}`}>
                                            ID Lokasi: {addTransaksiForm.tostoreloc}
                                        </div>
                                    )}
                                </div>

                                {/* No. Reg */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        No. Reg <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addTransaksiForm.no_reg_sista}
                                        onChange={(e) => setAddTransaksiForm({...addTransaksiForm, no_reg_sista: e.target.value.toUpperCase()})}
                                        required
                                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase`}
                                        placeholder="Masukkan nomor registrasi"
                                    />
                                </div>

                                {/* Status Permintaan */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Status Permintaan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={addTransaksiForm.statpermintaan}
                                        onChange={(e) => setAddTransaksiForm({...addTransaksiForm, statpermintaan: e.target.value})}
                                        required
                                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                    >
                                        <option value="">Pilih Status</option>
                                        <option value="DIPROSES">Diproses</option>
                                        <option value="DITOLAK">Ditolak</option>
                                    </select>
                                </div>

                                {/* Status Penerimaan */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Status Penerimaan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={addTransaksiForm.receipts}
                                        onChange={(e) => setAddTransaksiForm({...addTransaksiForm, receipts: e.target.value})}
                                        required
                                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                    >
                                        <option value="">Pilih Status</option>
                                        <option value="NONE">None</option>
                                        <option value="PARTIAL">Partial</option>
                                        <option value="COMPLETE">Complete</option>
                                    </select>
                                </div>

                                {/* Status Pengiriman */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Status Pengiriman <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={addTransaksiForm.status}
                                        onChange={(e) => setAddTransaksiForm({...addTransaksiForm, status: e.target.value})}
                                        required
                                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                    >
                                        <option value="">Pilih Status</option>
                                        <option value="CANCELLED">Cancelled</option>
                                        <option value="COMPLETE">Complete</option>
                                        <option value="ENTERED">Entered</option>
                                        <option value="PROCEED">Proceed</option>
                                        <option value="SHIPPED">Shipped</option>
                                    </select>
                                </div>

                                {/* Diminta */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Diminta <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={addTransaksiForm.diminta}
                                        onChange={(e) => setAddTransaksiForm({...addTransaksiForm, diminta: e.target.value})}
                                        required
                                        min="0"
                                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                        placeholder="Masukkan jumlah diminta"
                                    />
                                </div>

                                {/* Dikirim */}
                                <div>
                                    <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                        Dikirim <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={addTransaksiForm.dikirim}
                                        onChange={(e) => setAddTransaksiForm({...addTransaksiForm, dikirim: e.target.value})}
                                        required
                                        min="0"
                                        className={`w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                        placeholder="Masukkan jumlah dikirim"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddTransaksiModal(false);
                                        setAddTransaksiForm({
                                            nomerdokumen: '',
                                            itemnum: '',
                                            tostoreloc: '',
                                            no_reg_sista: '',
                                            statpermintaan: '',
                                            receipts: '',
                                            status: '',
                                            diminta: '',
                                            dikirim: ''
                                        });
                                        setAddTransaksiSuccess(false);
                                        setAddTransaksiError('');
                                    }}
                                    className={`flex-1 py-2 px-4 border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} rounded-md font-semibold transition`}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addTransaksiLoading}
                                    className="flex-1 py-2 px-4 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 disabled:bg-cyan-400 transition"
                                >
                                    {addTransaksiLoading ? 'Menyimpan...' : 'Tambah Transaksi'}
                                </button>
                            </div>
                            
                            {addTransaksiSuccess && (
                                <div className={`${isDarkMode ? 'bg-cyan-900/30 border-cyan-700' : 'bg-cyan-50 border-cyan-200'} border rounded-md p-3 mt-4`}>
                                    <div className="flex items-center">
                                        <span className="text-cyan-400 text-xl mr-2">✅</span>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-cyan-800'}`}>
                                            Transaksi berhasil ditambahkan!
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {addTransaksiError && (
                                <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} border rounded-md p-3 mt-4`}>
                                    <div className="flex items-center">
                                        <span className="text-red-400 text-xl mr-2">❌</span>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                                            {addTransaksiError}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Update Status */}
            {showUpdateStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden`}>
                        <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-xl font-bold ${getTextClasses('primary')}`}>
                                Ubah Status {statusType === 'permintaan' ? 'Permintaan' : statusType === 'penerimaan' ? 'Penerimaan' : 'Pengiriman'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowUpdateStatusModal(false);
                                    setSelectedStatusTransaksi(null);
                                    setNewStatusValue('');
                                    setJumlahDikirim('');
                                    setJumlahTerkirim('');
                                    setRakBinnum('');
                                    setShowJumlahDikirimInput(false);
                                    setShowJumlahTerkirimInput(false);
                                    setShowRakBinnumInput(false);
                                    setSearchStatusTransaksi('');
                                }}
                                className={`${getTextClasses('muted')} hover:${getTextClasses('primary')}`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                            {/* Search Box */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={searchStatusTransaksi}
                                    onChange={(e) => setSearchStatusTransaksi(e.target.value)}
                                    placeholder="Cari nomor dokumen..."
                                    className={`w-full px-4 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                />
                            </div>

                            {/* List Transaksi */}
                            <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg mb-4 max-h-60 overflow-y-auto`}>
                                {statusTransaksiList
                                    .filter(item => item.no_dok?.toLowerCase().includes(searchStatusTransaksi.toLowerCase()))
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                setSelectedStatusTransaksi(item);
                                                // Set current status value
                                                if (statusType === 'permintaan') setNewStatusValue(item.status_permintaan || '');
                                                else if (statusType === 'penerimaan') setNewStatusValue(item.status_penerimaan || '');
                                                else setNewStatusValue(item.status_pengiriman || '');
                                            }}
                                            className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer transition ${
                                                selectedStatusTransaksi?.invusenum === item.invusenum
                                                    ? isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-50'
                                                    : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className={`font-semibold ${getTextClasses('primary')}`}>{item.no_dok}</p>
                                                    <p className={`text-sm ${getTextClasses('secondary')}`}>
                                                        {item.part_no} - {item.nama_barang}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm ${getTextClasses('muted')}`}>
                                                        Status: {
                                                            statusType === 'permintaan' ? item.status_permintaan :
                                                            statusType === 'penerimaan' ? item.status_penerimaan :
                                                            item.status_pengiriman
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Form Update Status */}
                            {selectedStatusTransaksi && (
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                            Transaksi Dipilih
                                        </label>
                                        <p className={`text-sm ${getTextClasses('primary')} font-semibold`}>
                                            {selectedStatusTransaksi.no_dok}
                                        </p>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                            Status Baru <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={newStatusValue}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                setNewStatusValue(newValue);
                                                
                                                // Tampilkan input jumlah dikirim jika status permintaan berubah dari DITOLAK ke DIPROSES
                                                if (statusType === 'permintaan' && 
                                                    selectedStatusTransaksi?.status_permintaan === 'DITOLAK' && 
                                                    newValue === 'DIPROSES') {
                                                    setShowJumlahDikirimInput(true);
                                                } else {
                                                    setShowJumlahDikirimInput(false);
                                                    setJumlahDikirim('');
                                                }

                                                // Tampilkan input jumlah terkirim dan rak jika status penerimaan diubah ke PARTIAL atau COMPLETE
                                                if (statusType === 'penerimaan' && (newValue === 'PARTIAL' || newValue === 'COMPLETE')) {
                                                    setShowJumlahTerkirimInput(newValue === 'PARTIAL'); // Hanya PARTIAL yang perlu input terkirim
                                                    setShowRakBinnumInput(true); // PARTIAL dan COMPLETE keduanya perlu input rak
                                                } else {
                                                    setShowJumlahTerkirimInput(false);
                                                    setShowRakBinnumInput(false);
                                                    setJumlahTerkirim('');
                                                    setRakBinnum('');
                                                }
                                            }}
                                            required
                                            className={`w-full px-4 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                        >
                                            <option value="">Pilih Status</option>
                                            {statusType === 'permintaan' && (
                                                <>
                                                    <option value="DIPROSES">DIPROSES</option>
                                                    <option value="DITOLAK">DITOLAK</option>
                                                </>
                                            )}
                                            {statusType === 'penerimaan' && (
                                                <>
                                                    <option value="NONE">NONE</option>
                                                    <option value="PARTIAL">PARTIAL</option>
                                                    <option value="COMPLETE">COMPLETE</option>
                                                </>
                                            )}
                                            {statusType === 'pengiriman' && (
                                                <>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                    <option value="COMPLETE">COMPLETE</option>
                                                    <option value="ENTERED">ENTERED</option>
                                                    <option value="PROCEED">PROCEED</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {/* Input Jumlah Dikirim - Hanya muncul jika status permintaan berubah dari DITOLAK ke DIPROSES */}
                                    {showJumlahDikirimInput && (
                                        <div>
                                            <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                                Jumlah Dikirim <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={jumlahDikirim}
                                                onChange={(e) => setJumlahDikirim(e.target.value)}
                                                required
                                                className={`w-full px-4 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                placeholder="Masukkan jumlah dikirim"
                                            />
                                        </div>
                                    )}

                                    {/* Input Jumlah Terkirim - Hanya muncul jika status penerimaan diubah ke PARTIAL */}
                                    {showJumlahTerkirimInput && (
                                        <div>
                                            <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                                Terkirim <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={jumlahTerkirim}
                                                onChange={(e) => setJumlahTerkirim(e.target.value)}
                                                required
                                                className={`w-full px-4 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                placeholder="Masukkan jumlah terkirim"
                                            />
                                        </div>
                                    )}

                                    {/* Input Rak (binnum) - Muncul jika status penerimaan diubah ke PARTIAL atau COMPLETE */}
                                    {showRakBinnumInput && (
                                        <div>
                                            <label className={`block text-sm font-medium ${getTextClasses('secondary')} mb-2`}>
                                                Rak  <span className="text-gray-400 text-xs">(Opsional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={rakBinnum}
                                                onChange={(e) => setRakBinnum(e.target.value.toUpperCase())}
                                                className={`w-full px-4 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase`}
                                                placeholder="Masukkan nomor rak (opsional)"
                                            />
                                        </div>
                                    )}

                                    <button
                                        onClick={handleUpdateStatus}
                                        className="w-full py-2 px-4 bg-cyan-600 text-white rounded-md font-semibold hover:bg-cyan-700 transition"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

export default UserDashboard;