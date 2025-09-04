import React, { useState, useEffect } from 'react';

const SafeStockPieChart = ({ selectedGudang, title = '📊 Distribusi Stock Barang' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ category: '', items: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStockData();
  }, [selectedGudang]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = selectedGudang === 'all' 
        ? '/api_stock_chart.php'
        : `/api_stock_chart.php?filter=${encodeURIComponent(selectedGudang)}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      if (!Array.isArray(result)) {
        throw new Error('Invalid data format: expected array');
      }
      
      setData(result);
      
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

      const url = selectedGudang === 'all' 
        ? `/api_stock_chart.php?detail=${stockCondition}`
        : `/api_stock_chart.php?filter=${encodeURIComponent(selectedGudang)}&detail=${stockCondition}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch category details');
      const result = await response.json();
      
      // Debug: log data yang diterima
      console.log(`Fetched category details for ${category}:`, result);
      console.log(`Total items received: ${result.items ? result.items.length : 0}`);
      
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

  // Calculate totals
  const totalItems = Array.isArray(data) ? data.reduce((sum, item) => {
    return sum + (typeof item?.value === 'number' ? item.value : 0);
  }, 0) : 0;
  
  const stockHabis = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Stock Habis')?.value || 0) : 0;
  const stockMenupis = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Stock Menipis')?.value || 0) : 0;
  const stockSiapPakai = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Siap Pakai')?.value || 0) : 0;

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
        />
      );
    });

    return (
      <svg width="200" height="200" viewBox="0 0 200 200">
        {segments}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Memuat data stock...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">
          {selectedGudang === 'all' 
            ? 'Semua Gudang' 
            : `Gudang: ${selectedGudang}`
          }
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Simple SVG Pie Chart */}
        <div className="flex-shrink-0">
          {createPieChart()}
        </div>

        {/* Statistik Detail */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Stock Habis */}
            <div 
              className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
              onClick={() => handleCategoryClick('Stock Habis')}
            >
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Stock Habis</p>
                <p className="text-lg font-bold text-red-900">{stockHabis.toLocaleString()} item</p>
              </div>
              <div className="text-red-600 text-xl">🚫</div>
            </div>

            {/* Stock Menipis */}
            <div 
              className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              onClick={() => handleCategoryClick('Stock Menipis')}
            >
              <div className="w-4 h-4 bg-amber-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Stock Menipis</p>
                <p className="text-lg font-bold text-amber-900">{stockMenupis.toLocaleString()} item</p>
                <p className="text-xs text-amber-700">(1-10 unit)</p>
              </div>
              <div className="text-amber-600 text-xl">⚠️</div>
            </div>

            {/* Siap Pakai */}
            <div 
              className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              onClick={() => handleCategoryClick('Siap Pakai')}
            >
              <div className="w-4 h-4 bg-emerald-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Siap Pakai</p>
                <p className="text-lg font-bold text-emerald-900">{stockSiapPakai.toLocaleString()} item</p>
                <p className="text-xs text-emerald-700">(&gt;10 unit)</p>
              </div>
              <div className="text-emerald-600 text-xl">✅</div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Item</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk detail lengkap */}
      {showModal && modalData && modalData.items && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 stock-detail-modal overflow-hidden">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Detail {modalData.category}
                </h3>
                <p className="text-xs text-gray-600">
                  {searchTerm ? `${filteredItems.length} dari ${modalData?.items?.length || 0} items` : `${modalData?.items?.length || 0} total items`}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
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
                    className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  className="border border-gray-300 rounded-md px-2 py-2"
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
                <table className="stock-detail-table min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left text-gray-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="text-left text-gray-500 uppercase tracking-wider">
                        Nama Barang
                      </th>
                      <th className="text-left text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="text-left text-gray-500 uppercase tracking-wider">
                        Gudang
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="text-gray-900">
                          {item.part_number}
                        </td>
                        <td className="text-gray-900">
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
              <div className="stock-modal-controls flex items-center justify-between mt-3 pt-2 border-t">
                <div className="text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} 
                  {searchTerm && ` (filtered from ${modalData?.items?.length || 0} total)`} items
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Prev
                    </button>
                    
                    <span className="px-2 py-1">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
    </div>
  );
};

export default SafeStockPieChart;
