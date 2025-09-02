import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, title, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  // High contrast color palette - prioritizing visibility for small segments
  const highContrastColors = [
    '#FF0000', // Pure Red - highest contrast
    '#00FF00', // Pure Green
    '#0000FF', // Pure Blue
    '#FFFF00', // Pure Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FF8000', // Orange
    '#8000FF', // Purple
    '#00FF80', // Spring Green
    '#FF0080', // Rose
    '#80FF00', // Chartreuse
    '#0080FF', // Azure
    '#FF4000', // Red-Orange
    '#4000FF', // Blue-Violet
    '#40FF00', // Lime
  ];

  // Sort data by value to assign high contrast colors to smaller segments
  const sortedData = [...data].sort((a, b) => a.value - b.value);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Create color mapping
  const colorMapping = {};
  data.forEach((item, index) => {
    // Special case: Set kasubdis to black
    if (item.name && item.name.toLowerCase().includes('kasubdis')) {
      colorMapping[item.name] = '#000000'; // Black
      return;
    }
    
    const percentage = (item.value / totalValue) * 100;
    const sortedIndex = sortedData.findIndex(sorted => sorted.name === item.name);
    
    // Use high contrast colors for segments < 5% or smallest segments first
    if (percentage < 5 || sortedIndex < 5) {
      colorMapping[item.name] = highContrastColors[sortedIndex % highContrastColors.length];
    } else {
      // Use regular colors for larger segments
      const regularColors = [
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#96CEB4', // Green
        '#DDA0DD', // Plum
        '#98D8C8', // Mint
        '#F7DC6F', // Light Yellow
        '#BB8FCE', // Light Purple
        '#85C1E9', // Light Blue
        '#F8C471', // Orange
        '#82E0AA', // Light Green
      ];
      colorMapping[item.name] = regularColors[(index - 5) % regularColors.length] || highContrastColors[index % highContrastColors.length];
    }
  });

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => colorMapping[item.name]),
        borderColor: '#FFFFFF', // White border
        borderWidth: 1, // Reduced border width
        hoverBorderWidth: 2, // Reduced hover border width
        hoverBorderColor: '#FFFFFF',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: compact ? false : true, // Hide legend in compact mode
        position: 'bottom',
        labels: {
          color: '#374151', // gray-700
          font: {
            size: compact ? 8 : 10,
            family: 'Inter, sans-serif',
          },
          padding: compact ? 5 : 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1E293B', // slate-800
        titleColor: '#F1F5F9', // slate-100
        bodyColor: '#E2E8F0', // slate-200
        borderColor: '#06B6D4', // cyan-500
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    elements: {
      arc: {
        borderWidth: 1, // Reduced border width for better visibility of small segments
      },
    },
  };

  if (compact) {
    return (
      <div 
        className={`relative bg-white rounded-lg shadow-md p-4 transition-all duration-300 ease-in-out cursor-pointer w-72
          ${isHovered ? 'scale-105 shadow-xl z-10' : 'hover:shadow-lg'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {title && (
          <h3 className="text-base font-semibold text-gray-800 mb-3 text-center">
            {title}
          </h3>
        )}
        
        <div className="h-52 w-52 mx-auto">
          <Pie data={chartData} options={options} />
        </div>

        {/* Hover Detail */}
        {isHovered && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl p-3 border border-gray-200 z-20">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Detail Status:</h4>
            <div className="space-y-1">
              {data.map((item, index) => {
                const total = data.reduce((sum, d) => sum + d.value, 0);
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2 border border-gray-300" 
                        style={{ backgroundColor: colorMapping[item.name] }}
                      ></div>
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">{item.value.toLocaleString()}</span>
                      <span className="ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="h-80 w-full flex justify-center items-center">
        <div className="h-full w-full max-w-sm">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default PieChart;
