import React from 'react';
import { Line } from 'react-chartjs-2';

const CurrencyChart = ({ data }) => {
    const chartData = {
        labels: data.dates, // Массив с датами
        datasets: [
            {
                label: `Exchange Rate (${data.from} → ${data.to})`,
                data: data.rates, // Массив с курсами
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
                tension: 0.4, // Плавные линии
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default CurrencyChart;
