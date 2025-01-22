import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { Item } from '../types';
import { usePriceHistory } from '../hooks/usePriceHistory';

interface PriceChartProps {
  items: Item[];
}

export const PriceChart: React.FC<PriceChartProps> = ({ items }) => {
  const { priceHistory, loading } = usePriceHistory(items[0]?.id);

  if (loading) return <Box>Loading chart...</Box>;

  const data = {
    labels: priceHistory.map(h => new Date(h.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Item Price',
        data: priceHistory.map(h => h.newPrice),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Market Average',
        data: priceHistory.map(h => h.marketAveragePrice),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Price History
      </Typography>
      <Line data={data} />
    </Box>
  );
}; 