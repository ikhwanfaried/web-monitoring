import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ title = 'Login Harian (30 Hari Terakhir)', siteFilter = null }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDailyLoginData();
    // re-fetch when siteFilter changes
  }, [siteFilter]);

  const fetchDailyLoginData = async () => {
    try {
      const url = siteFilter ? `/api/daily-login-chart?site_filter=${encodeURIComponent(siteFilter)}` : '/api/daily-login-chart';
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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  // Format data untuk chart
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartData = {
    labels: data.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Total Login',
        data: data.map(item => item.total),
        borderColor: '#06B6D4', // cyan-500
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#06B6D4',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Login Berhasil',
        data: data.map(item => item.successful),
        borderColor: '#10B981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Login Gagal',
        data: data.map(item => item.failed),
        borderColor: '#EF4444', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
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
          color: '#374151', // gray-700
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // white background
        titleColor: '#111827', // gray-900
        bodyColor: '#374151', // gray-700
        borderColor: '#D1D5DB', // gray-300
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            const dataIndex = context[0].dataIndex;
            return `Tanggal: ${data[dataIndex].date}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} login`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(209, 213, 219, 0.5)', // gray-300 with opacity
          drawBorder: false
        },
        ticks: {
          color: '#6B7280', // gray-500
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        },
        title: {
          display: true,
          text: 'Tanggal',
          color: '#374151', // gray-700
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(209, 213, 219, 0.5)', // gray-300 with opacity
          drawBorder: false
        },
        ticks: {
          color: '#6B7280', // gray-500
          font: {
            size: 11
          },
          callback: function(value) {
            return Math.floor(value);
          }
        },
        title: {
          display: true,
          text: 'Jumlah Login',
          color: '#374151', // gray-700
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }
  };

  // Hitung statistik
  const totalLogins = data.reduce((sum, item) => sum + item.total, 0);
  const avgDaily = data.length > 0 ? Math.round(totalLogins / data.length) : 0;
  const maxDaily = data.length > 0 ? Math.max(...data.map(item => item.total)) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="flex space-x-4 text-sm">
          <span className="text-gray-600">
            Total: <span className="text-blue-600 font-semibold">{totalLogins}</span>
          </span>
          <span className="text-gray-600">
            Rata-rata: <span className="text-blue-600 font-semibold">{avgDaily}/hari</span>
          </span>
          <span className="text-gray-600">
            Maksimal: <span className="text-blue-600 font-semibold">{maxDaily}/hari</span>
          </span>
        </div>
      </div>
      
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
      
      {data.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          Tidak ada data login untuk ditampilkan
        </div>
      )}
    </div>
  );
};

export default LineChart;
