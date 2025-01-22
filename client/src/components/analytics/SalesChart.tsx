import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';
import { ChartData, ChartOptions } from 'chart.js';

interface SalesChartProps {
  data: {
    dates: string[];
    sales: number[];
    revenue: number[];
  };
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const chartData: ChartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Sales Count',
        data: data.sales,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        yAxisID: 'y'
      },
      {
        label: 'Revenue',
        data: data.revenue,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  };

  const options: ChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sales Count'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <Box sx={{ height: 400 }}>
      <Line data={chartData} options={options} />
    </Box>
  );
}; 