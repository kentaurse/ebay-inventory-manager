import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { ItemList } from '../components/ItemList';
import { PriceChart } from '../components/PriceChart';
import { StockAlert } from '../components/StockAlert';
import { useItems } from '../hooks/useItems';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { items, loading, error } = useItems();
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);

  useEffect(() => {
    if (items) {
      const lowStock = items.filter(item => item.quantity <= 5);
      setLowStockItems(lowStock);
    }
  }, [items]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            eBay Inventory Dashboard
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <ItemList items={items} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <StockAlert items={lowStockItems} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <PriceChart items={items} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 