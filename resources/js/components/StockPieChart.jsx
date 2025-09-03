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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStockData();
  }, [selectedGudang]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const url = selectedGudang === 'all' 
        ? '/api/stock-chart'
        : `/api/stock-chart?filter=${encodeURIComponent(selectedGudang)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  // Hitung total dan statistik
  const totalItems = data.reduce((sum, item) => sum + item.value, 0);
  const stockHabis = data.find(item => item.name === 'Stock Habis')?.value || 0;
  const stockMenupis = data.find(item => item.name === 'Stock Menipis')?.value || 0;
  const stockSiapPakai = data.find(item => item.name === 'Siap Pakai')?.value || 0;

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
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Stock Habis */}
            <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Stock Habis</p>
                <p className="text-lg font-bold text-red-900">{stockHabis.toLocaleString()} item</p>
              </div>
              <div className="text-red-600 text-xl">🚫</div>
            </div>

            {/* Stock Menipis */}
            <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="w-4 h-4 bg-amber-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Stock Menipis</p>
                <p className="text-lg font-bold text-amber-900">{stockMenupis.toLocaleString()} item</p>
                <p className="text-xs text-amber-700">(1-10 unit)</p>
              </div>
              <div className="text-amber-600 text-xl">⚠️</div>
            </div>

            {/* Siap Pakai */}
            <div className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
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
    </div>
  );
};

export default StockPieChart;
