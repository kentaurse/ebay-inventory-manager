import { useState, useEffect } from 'react';
import { Item } from '../types';
import { api } from '../services/api';

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get('/items');
        setItems(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, loading, error };
}; 