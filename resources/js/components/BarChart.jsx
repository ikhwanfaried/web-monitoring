import React, { useEffect, useRef } from 'react';

/**
 * BarChart Component - Displays data as a horizontal bar chart
 * @param {Array} data - Array of objects with 'name' and 'value' properties
 * @param {String} title - Chart title (optional)
 * @param {Boolean} compact - Use compact layout (optional)
 */
const BarChart = ({ data, title, compact = false }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (!data || data.length === 0) return;

        const chartContainer = chartRef.current;
        if (!chartContainer) return;

        // Clear previous chart
        chartContainer.innerHTML = '';

        // Calculate total
        const total = data.reduce((sum, item) => sum + item.value, 0);

        // Create chart
        const chart = document.createElement('div');
        chart.className = 'w-full';
        chart.style.padding = compact ? '1rem' : '1.5rem';

        // Add title if provided
        if (title) {
            const titleEl = document.createElement('h3');
            titleEl.className = 'text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center';
            titleEl.textContent = title;
            chart.appendChild(titleEl);
        }

        // Color mapping - sesuaikan dengan Detail Status Transaksi
        const getStatusColor = (name, index) => {
            // Jika nama mengandung 'kasubdis', gunakan warna hitam
            if (name && name.toLowerCase().includes('kasubdis')) return '#000000';
            
            // Array warna yang sama dengan di Detail Status Transaksi
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FF8000'];
            return colors[index % colors.length];
        };

        // Create bars container
        const barsContainer = document.createElement('div');
        barsContainer.className = 'space-y-4';

        data.forEach((item, index) => {
            const percentage = total > 0 ? (item.value / total * 100) : 0;
            const color = getStatusColor(item.name, index);

            // Bar row
            const barRow = document.createElement('div');
            barRow.className = 'flex flex-col';

            // Label and value row
            const labelRow = document.createElement('div');
            labelRow.className = 'flex justify-between items-center mb-1';

            const label = document.createElement('span');
            label.className = 'text-sm font-medium text-gray-700 dark:text-gray-300';
            label.textContent = item.name;

            const value = document.createElement('span');
            value.className = 'text-sm font-bold text-gray-900 dark:text-white';
            value.textContent = `${item.value.toLocaleString()} (${percentage.toFixed(1)}%)`;

            labelRow.appendChild(label);
            labelRow.appendChild(value);

            // Bar background
            const barBg = document.createElement('div');
            barBg.className = 'w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative';

            // Bar fill
            const barFill = document.createElement('div');
            barFill.className = 'h-full rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-2';
            barFill.style.width = '0%';
            barFill.style.backgroundColor = color;

            // Animate bar
            setTimeout(() => {
                barFill.style.width = `${percentage}%`;
            }, 100);

            // Add percentage text inside bar if wide enough
            if (percentage > 15) {
                const percentText = document.createElement('span');
                percentText.className = 'text-xs font-bold text-white';
                percentText.textContent = `${percentage.toFixed(1)}%`;
                barFill.appendChild(percentText);
            }

            barBg.appendChild(barFill);
            barRow.appendChild(labelRow);
            barRow.appendChild(barBg);
            barsContainer.appendChild(barRow);
        });

        chart.appendChild(barsContainer);

        // Add total summary
        const summary = document.createElement('div');
        summary.className = 'mt-6 pt-4 border-t border-gray-200 dark:border-gray-700';
        summary.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total:</span>
                <span class="text-lg font-bold text-gray-900 dark:text-white">${total.toLocaleString()}</span>
            </div>
        `;
        chart.appendChild(summary);

        chartContainer.appendChild(chart);

    }, [data, title, compact]);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={chartRef} className="w-full h-full"></div>
    );
};

export default BarChart;
