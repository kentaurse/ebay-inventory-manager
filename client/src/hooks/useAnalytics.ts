import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useAnalytics = (timeRange: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/analytics/dashboard`, {
          params: { timeRange }
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  return { data, loading, error };
}; 