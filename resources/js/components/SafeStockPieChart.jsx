import React, { useState, useEffect } from 'react';

const SafeStockPieChart = ({ selectedGudang, title = '📊 Distribusi Stock Barang', isDarkMode = false, siteFilter = null, userLocId = null, userRole = null }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ category: '', items: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hover tooltip state
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Helper functions for consistent styling
  const getCardClasses = (baseClasses = '') => {
    return `${baseClasses} rounded-lg shadow-md transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border border-blue-400 glow-blue' 
        : 'bg-white border border-gray-200'
    }`;
  };

  const getTextClasses = (type = 'primary') => {
    if (type === 'primary') {
      return isDarkMode ? 'text-white' : 'text-gray-900';
    } else if (type === 'secondary') {
      return isDarkMode ? 'text-gray-300' : 'text-gray-700';
    } else if (type === 'muted') {
      return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    }
    return isDarkMode ? 'text-white' : 'text-gray-900';
  };

  useEffect(() => {
    fetchStockData();
  }, [selectedGudang, siteFilter, userLocId, userRole]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api_stock_chart.php';
      const params = new URLSearchParams();
      
      // Add filter parameter if not 'all'
      if (selectedGudang !== 'all') {
        params.append('filter', selectedGudang);
      }
      
      // Add USER location filter (highest priority)
      if (userRole === 'user' && userLocId) {
        params.append('user_locid', userLocId);
        params.append('user_role', 'user');
      }
      // Add site filter if provided (for Admin role)
      else if (siteFilter) {
        params.append('site_filter', siteFilter);
      }
      
      // Build final URL
      const queryString = params.toString();
      if (queryString) {
        url += '?' + queryString;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      // Handle both old format (array) and new format (object with data and debug)
      let chartData;
      let debugInfo;
      
      if (Array.isArray(result)) {
        // Old format
        chartData = result;
        debugInfo = null;
      } else if (result.data && Array.isArray(result.data)) {
        // New format with debug info
        chartData = result.data;
        debugInfo = result.debug;
      } else {
        throw new Error('Invalid data format: expected array or object with data property');
      }
      
      console.log('📊 SafeStockPieChart - Raw result:', result);
      console.log('📊 SafeStockPieChart - Data received:', chartData);
      console.log('📊 SafeStockPieChart - Debug Info:', debugInfo);
      console.log('📊 SafeStockPieChart - selectedGudang:', selectedGudang);
      console.log('📊 SafeStockPieChart - siteFilter:', siteFilter);
      console.log('📊 SafeStockPieChart - userLocId:', userLocId);
      console.log('📊 SafeStockPieChart - userRole:', userRole);
      console.log('📊 SafeStockPieChart - URL called:', url);
      
      // Log detailed breakdown of each category
      chartData.forEach((category, index) => {
        console.log(`📊 Category ${index + 1}:`, {
          name: category.name,
          value: category.value,
          items_sample: category.items?.length || 0
        });
      });
      
      console.log('📊 SafeStockPieChart - About to setData with:', chartData);
      setData(chartData);
      console.log('📊 SafeStockPieChart - Data state updated');
      
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryDetails = async (category) => {
    try {
      let stockCondition = '';
      if (category === 'Stock Habis') {
        stockCondition = 'habis';
      } else if (category === 'Stock Menipis') {
        stockCondition = 'menipis';
      } else if (category === 'Siap Pakai') {
        stockCondition = 'siap';
      }

      const params = new URLSearchParams();
      params.append('detail', stockCondition);
      
      // Add filter parameter if not 'all'
      if (selectedGudang !== 'all') {
        params.append('filter', selectedGudang);
      }
      
      // Add USER location filter (highest priority)
      if (userRole === 'user' && userLocId) {
        params.append('user_locid', userLocId);
        params.append('user_role', 'user');
      }
      // Add site filter if provided (for Admin role)
      else if (siteFilter) {
        params.append('site_filter', siteFilter);
      }
      
      const url = `/api_stock_chart.php?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch category details');
      const result = await response.json();
      
      // Debug: log data yang diterima
      console.log(`Fetched category details for ${category}:`, result);
      console.log(`Total items received: ${result.items ? result.items.length : 0}`);
      console.log(`URL called:`, url);
      
      return result.items || [];
    } catch (err) {
      console.error('Error fetching category details:', err);
      return [];
    }
  };

  const handleCategoryClick = async (category) => {
    console.log(`Clicking category: ${category}`);
    const categoryItems = await fetchCategoryDetails(category);
    console.log(`Setting modal data with ${categoryItems.length} items`);
    setModalData({ category, items: categoryItems });
    setCurrentPage(1);
    setSearchTerm('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalData({ category: '', items: [] });
    setCurrentPage(1);
    setSearchTerm('');
  };

  // Filter items based on search term
  const filteredItems = modalData?.items ? modalData.items.filter(item => 
    item.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.gudang?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Calculate pagination with filtered items
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (searchTerm !== '') {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Calculate totals with extra safety checks
  const totalItems = Array.isArray(data) ? data.reduce((sum, item) => {
    const value = item?.value;
    return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
  }, 0) : 0;
  
  const stockHabis = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Stock Habis')?.value ?? 0) : 0;
  const stockMenupis = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Stock Menipis')?.value ?? 0) : 0;
  const stockSiapPakai = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Siap Pakai')?.value ?? 0) : 0;
  
  // Debug: Log calculated totals
  console.log('📊 SafeStockPieChart - Calculated Totals:', {
    totalItems,
    stockHabis,
    stockMenupis,
    stockSiapPakai,
    sum: stockHabis + stockMenupis + stockSiapPakai,
    rawData: data
  });

  // Create simple SVG pie chart
  const createPieChart = () => {
    if (totalItems === 0) return null;

    const radius = 80;
    const centerX = 100;
    const centerY = 100;
    
    const colors = {
      'Stock Habis': '#EF4444',
      'Stock Menipis': '#F59E0B',
      'Siap Pakai': '#10B981'
    };

    let cumulativePercentage = 0;
    const segments = data.map((item, index) => {
      const percentage = item.value / totalItems;
      const startAngle = cumulativePercentage * 2 * Math.PI;
      const endAngle = (cumulativePercentage + percentage) * 2 * Math.PI;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = percentage > 0.5 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      cumulativePercentage += percentage;

      return (
        <path
          key={index}
          d={pathData}
          fill={colors[item.name]}
          stroke="white"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleCategoryClick(item.name)}
          onMouseEnter={(e) => {
            const rect = e.target.getBoundingClientRect();
            setTooltipPosition({
              x: e.clientX,
              y: e.clientY
            });
            setHoveredSegment({
              name: item.name,
              value: item.value,
              percentage: ((item.value / totalItems) * 100).toFixed(1)
            });
          }}
          onMouseMove={(e) => {
            setTooltipPosition({
              x: e.clientX,
              y: e.clientY
            });
          }}
          onMouseLeave={() => {
            setHoveredSegment(null);
          }}
        />
      );
    });

    return (
      <svg width="400" height="400" viewBox="0 0 200 200">
        {segments}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={getCardClasses('p-6')}>
        <h3 className={`text-lg font-semibold ${getTextClasses('primary')} mb-4 text-center`}>{title}</h3>
        <div className="flex justify-center items-center h-64">
          <div className={getTextClasses('secondary')}>Memuat data stock...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={getCardClasses('p-6')}>
        <h3 className={`text-lg font-semibold ${getTextClasses('primary')} mb-4 text-center`}>{title}</h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Tidak ada data stock tersedia</div>
        </div>
      </div>
    );
  }

  return (
    <div className={getCardClasses('p-6')}>
      <div className="text-center mb-4">
        <h3 className={`text-lg font-semibold ${getTextClasses('primary')} mb-2`}>{title}</h3>
        <p className={`text-sm ${getTextClasses('secondary')}`}>
          {selectedGudang === 'all' 
            ? 'Semua Gudang' 
            : `Gudang: ${selectedGudang}`
          }
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Simple SVG Pie Chart */}
        <div className="flex-shrink-0">
          {createPieChart()}
        </div>

        {/* Statistik Detail */}
        <div className="flex-1 max-w-md space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Stock Habis */}
            <div 
              className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-red-900/20 border-red-400 hover:bg-red-800/30' 
                  : 'bg-red-50 border-red-200 hover:bg-red-100'
              }`}
              onClick={() => handleCategoryClick('Stock Habis')}
            >
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>Stock Habis</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-red-100' : 'text-red-900'}`}>{stockHabis.toLocaleString()} item</p>
              </div>
              <div className="text-red-600 text-xl">🚫</div>
            </div>

            {/* Stock Menipis */}
            <div 
              className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-amber-900/20 border-amber-400 hover:bg-amber-800/30' 
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
              }`}
              onClick={() => handleCategoryClick('Stock Menipis')}
            >
              <div className="w-4 h-4 bg-amber-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>Stock Menipis</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>{stockMenupis.toLocaleString()} item</p>
                <p className={`text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>(1-10 unit)</p>
              </div>
              <div className="text-amber-600 text-xl">⚠️</div>
            </div>

            {/* Siap Pakai */}
            <div 
              className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-emerald-900/20 border-emerald-400 hover:bg-emerald-800/30' 
                  : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
              }`}
              onClick={() => handleCategoryClick('Siap Pakai')}
            >
              <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>Siap Pakai</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-emerald-100' : 'text-emerald-900'}`}>{stockSiapPakai.toLocaleString()} item</p>
                <p className={`text-xs ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>(&gt;10 unit)</p>
              </div>
              <div className="text-emerald-600 text-xl">✅</div>
            </div>
          </div>

          {/* Total */}
          <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="text-center">
              <p className={`text-sm ${getTextClasses('secondary')}`}>Total Item</p>
              <p className={`text-2xl font-bold ${getTextClasses('primary')}`}>{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk detail lengkap */}
      {showModal && modalData && modalData.items && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-4 stock-detail-modal overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-800 border border-blue-400' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className={`text-lg font-bold ${getTextClasses('primary')}`}>
                  Detail {modalData.category}
                </h3>
                <p className={`text-xs ${getTextClasses('secondary')}`}>
                  {searchTerm ? `${filteredItems.length} dari ${modalData?.items?.length || 0} items` : `${modalData?.items?.length || 0} total items`}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className={`text-2xl font-bold transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ×
              </button>
            </div>

            {/* Search Box */}
            <div className="stock-modal-controls mb-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Cari Part Number, Nama Barang, atau Gudang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-3 py-2 pl-8 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`border rounded-md px-2 py-2 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {currentItems.length > 0 ? (
              <div className="overflow-auto max-h-64">
                <table className={`stock-detail-table min-w-full divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                  <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`text-left uppercase tracking-wider ${getTextClasses('muted')}`}>
                        Part Number
                      </th>
                      <th className={`text-left uppercase tracking-wider ${getTextClasses('muted')}`}>
                        Nama Barang
                      </th>
                      <th className={`text-left uppercase tracking-wider ${getTextClasses('muted')}`}>
                        Stock
                      </th>
                      <th className={`text-left uppercase tracking-wider ${getTextClasses('muted')}`}>
                        Gudang
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'
                  }`}>
                    {currentItems.map((item, index) => (
                      <tr key={index} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={getTextClasses('primary')}>
                          {item.part_number}
                        </td>
                        <td className={getTextClasses('primary')}>
                          {item.nama_barang}
                        </td>
                        <td>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.jumlah === 0 
                              ? 'bg-red-100 text-red-800'
                              : item.jumlah <= 10
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.jumlah}
                          </span>
                        </td>
                        <td className="text-gray-900">
                          {item.gudang}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Tidak ada hasil pencarian' : 'Tidak ada data'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `Tidak ditemukan item yang cocok dengan "${searchTerm}"`
                    : 'Belum ada data untuk kategori ini'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-3 text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Hapus filter pencarian
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredItems.length > 0 && (
              <div className={`stock-modal-controls flex items-center justify-between mt-3 pt-2 border-t ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <div className={getTextClasses('secondary')}>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} 
                  {searchTerm && ` (filtered from ${modalData?.items?.length || 0} total)`} items
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`border rounded disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 ${
                        isDarkMode 
                          ? 'border-gray-600 hover:bg-gray-700 text-white' 
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Prev
                    </button>
                    
                    <span className={`px-2 py-1 ${getTextClasses('primary')}`}>
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`border rounded disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 ${
                        isDarkMode 
                          ? 'border-gray-600 hover:bg-gray-700 text-white' 
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
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
      )}

      {/* Hover Tooltip */}
      {hoveredSegment && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translate(0, -100%)'
          }}
        >
          <div className={`px-3 py-2 rounded-lg shadow-lg border max-w-xs ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="text-sm font-semibold">{hoveredSegment.name}</div>
            <div className="text-xs text-gray-500">
              <div>{hoveredSegment.value.toLocaleString()} items</div>
              <div>{hoveredSegment.percentage}% dari total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafeStockPieChart;
