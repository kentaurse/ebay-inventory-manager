import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit, Refresh } from '@mui/icons-material';
import { Item } from '../types';
import { useItemActions } from '../hooks/useItemActions';

interface ItemListProps {
  items: Item[];
}

export const ItemList: React.FC<ItemListProps> = ({ items }) => {
  const { updatePrice, refreshStock } = useItemActions();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell align="right">Current Price</TableCell>
          <TableCell align="right">Stock</TableCell>
          <TableCell align="right">Last Updated</TableCell>
          <TableCell align="center">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.title}</TableCell>
            <TableCell align="right">
              ${item.currentPrice.toFixed(2)}
            </TableCell>
            <TableCell align="right">{item.quantity}</TableCell>
            <TableCell align="right">
              {new Date(item.lastUpdated).toLocaleString()}
            </TableCell>
            <TableCell align="center">
              <Tooltip title="Update Price">
                <IconButton onClick={() => updatePrice(item.id)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Stock">
                <IconButton onClick={() => refreshStock(item.id)}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 