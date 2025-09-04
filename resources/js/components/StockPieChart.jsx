import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const StockPieChart = ({ selectedGudang, title = '📊 Distribusi Stock Barang' }) => {
  const [data, setData] = useState([]);
  const [detailItems, setDetailItems] = useState({});
  const [totalCounts, setTotalCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // State untuk modal table
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ category: '', items: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
      
      console.log('Fetching stock data from:', url); // Debug log
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      
      console.log('Stock chart data:', result); // Debug log
      
      // Validate data format
      if (!Array.isArray(result)) {
        throw new Error('Invalid data format: expected array');
      }
      
      // Data sudah dalam format yang benar dari PHP
      setData(result);
      
      // Extract detail items untuk tooltip
      const detailItemsMap = {};
      const totalCountsMap = {};
      
      result.forEach(item => {
        if (item && typeof item === 'object') {
          const key = item.name;
          if (key) {
            detailItemsMap[key] = Array.isArray(item.items) ? item.items : [];
            totalCountsMap[key] = typeof item.value === 'number' ? item.value : 0;
          }
        }
      });
      
      setDetailItems(detailItemsMap);
      setTotalCounts(totalCountsMap);
      
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err.message);
      setData([]);
      setDetailItems({});
      setTotalCounts({});
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk fetch semua data dari kategori yang diklik
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
      
      return result.items || [];
    } catch (err) {
      console.error('Error fetching category details:', err);
      return [];
    }
  };

  // Handle click pada segment pie chart
  const handleChartClick = async (event, elements) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const category = data[clickedIndex]?.name;
      
      if (category) {
        const categoryItems = await fetchCategoryDetails(category);
        setModalData({ category, items: categoryItems });
        setCurrentPage(1);
        setShowModal(true);
      }
    }
  };

  // Handle click pada legend
  const handleLegendClick = async (category) => {
    const categoryItems = await fetchCategoryDetails(category);
    setModalData({ category, items: categoryItems });
    setCurrentPage(1);
    setShowModal(true);
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

  // Warna khusus untuk stock
  const stockColors = {
    'Stock Habis': '#EF4444',        // Red-500 - Merah untuk stock habis
    'Stock Menipis': '#F59E0B',      // Amber-500 - Kuning/Orange untuk stock menipis  
    'Siap Pakai': '#10B981'          // Emerald-500 - Hijau untuk siap pakai
  };

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => stockColors[item.name]),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#FFFFFF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151', // gray-700
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827', // gray-900
        bodyColor: '#374151', // gray-700
        borderColor: '#D1D5DB', // gray-300
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = data.reduce((sum, item) => sum + item.value, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed.toLocaleString()} item (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  // Handle mouse events untuk tooltip
  const handleMouseEnter = (event, segmentName) => {
    setHoveredSegment(segmentName);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  const handleMouseMove = (event) => {
    if (hoveredSegment) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Helper function untuk mendapatkan key detail items
  const getDetailKey = (segmentName) => {
    switch (segmentName) {
      case 'Stock Habis': return 'stock_habis';
      case 'Stock Menipis': return 'stock_menipis';
      case 'Siap Pakai': return 'siap_pakai';
      default: return '';
    }
  };

  // Handle closing modal
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

  // Hitung total dan statistik - dengan validasi
  const totalItems = Array.isArray(data) ? data.reduce((sum, item) => {
    return sum + (typeof item?.value === 'number' ? item.value : 0);
  }, 0) : 0;
  
  const stockHabis = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Stock Habis')?.value || 0) : 0;
  const stockMenupis = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Stock Menipis')?.value || 0) : 0;
  const stockSiapPakai = Array.isArray(data) ? 
    (data.find(item => item?.name === 'Siap Pakai')?.value || 0) : 0;

  // Early return jika loading
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

  // Early return jika error
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

  // Early return jika tidak ada data atau data tidak valid
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
        {/* Pie Chart */}
        <div className="h-64 w-64 flex-shrink-0">
          <Pie data={chartData} options={options} />
        </div>

        {/* Statistik Detail */}
        <div className="flex-1 space-y-4" onMouseMove={handleMouseMove}>
          <div className="grid grid-cols-1 gap-3">
            {/* Stock Habis */}
            <div 
              className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer relative"
              onMouseEnter={(e) => handleMouseEnter(e, 'Stock Habis')}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleLegendClick('Stock Habis')}
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
              className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer relative"
              onMouseEnter={(e) => handleMouseEnter(e, 'Stock Menipis')}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleLegendClick('Stock Menipis')}
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
              className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer relative"
              onMouseEnter={(e) => handleMouseEnter(e, 'Siap Pakai')}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleLegendClick('Siap Pakai')}
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

      {totalItems === 0 && (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-4 block">📊</span>
          <p className="text-lg font-medium">Belum ada data stock</p>
          <p className="text-sm">
            {selectedGudang === 'all' 
              ? 'Tidak ada data stock tersedia'
              : `Tidak ada data stock untuk gudang: ${selectedGudang}`
            }
          </p>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredSegment && (
        <div 
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 100,
            pointerEvents: 'none'
          }}
        >
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: stockColors[hoveredSegment] }}
            ></div>
            {hoveredSegment} - Detail Items
          </h4>
          
          {detailItems[getDetailKey(hoveredSegment)] && detailItems[getDetailKey(hoveredSegment)].length > 0 ? (
            <div className="space-y-2">
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Part Number</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Nama Barang</th>
                      <th className="px-2 py-1 text-center font-medium text-gray-700">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detailItems[getDetailKey(hoveredSegment)].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-2 py-1 text-gray-900 font-mono text-xs">{item.part_number}</td>
                        <td className="px-2 py-1 text-gray-700 text-xs" title={item.nama_barang}>
                          {item.nama_barang.length > 20 
                            ? item.nama_barang.substring(0, 20) + '...'
                            : item.nama_barang
                          }
                        </td>
                        <td className="px-2 py-1 text-center text-gray-600 font-semibold">{item.jumlah}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalCounts[getDetailKey(hoveredSegment)] > 10 && (
                <div className="text-xs text-gray-500 text-center border-t pt-2">
                  Menampilkan 10 dari {totalCounts[getDetailKey(hoveredSegment)]} total items
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Tidak ada data item</div>
          )}
        </div>
      )}
      
      {/* Modal untuk detail lengkap */}
      {showModal && modalData && modalData.items && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Detail {modalData.category}
                </h3>
                <p className="text-sm text-gray-600">
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
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari berdasarkan Part Number, Nama Barang, atau Gudang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {currentItems.length > 0 ? (
              <div className="overflow-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Barang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gudang
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.part_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.nama_barang}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 border-t pt-4">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} 
                  {searchTerm && ` (filtered from ${modalData?.items?.length || 0} total)`} items
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    {/* First page button */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      title="First page"
                    >
                      ««
                    </button>
                    
                    {/* Previous button */}
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const pages = [];
                        const showPages = 5; // Number of page buttons to show
                        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                        let endPage = Math.min(totalPages, startPage + showPages - 1);
                        
                        // Adjust start if we're near the end
                        if (endPage - startPage < showPages - 1) {
                          startPage = Math.max(1, endPage - showPages + 1);
                        }
                        
                        // Show first page if not in range
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => setCurrentPage(1)}
                              className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 text-gray-500">...</span>
                            );
                          }
                        }
                        
                        // Show page range
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-2 py-1 border rounded text-sm ${
                                currentPage === i
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        // Show last page if not in range
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 text-gray-500">...</span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                    </div>
                    
                    {/* Next button */}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                    
                    {/* Last page button */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      title="Last page"
                    >
                      »»
                    </button>
                  </div>
                )}
                
                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPieChart;
