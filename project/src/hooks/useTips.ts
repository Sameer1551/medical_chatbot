import { useState, useEffect } from 'react';
import axios from 'axios';
import { AyurvedicData } from '../types/chat';

export const useTips = () => {
  const [tipData, setTipData] = useState<AyurvedicData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ayurvedic-tips');
        setTipData(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load ayurvedic tips');
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const getTip = async (condition: string): Promise<string> => {
    try {
      const response = await axios.post('http://localhost:5000/api/ayurvedic-tips', {
        condition
      });

      if (response.data.success) {
        const { tips, precautions } = response.data.data;
        return `Here are some Ayurvedic tips for ${condition}:\n\nTips -\n${tips.map((tip: string, i: number) => `${i + 1}. ${tip}`).join('\n')}\n\nPrecautions:\n${precautions.map((precaution: string, i: number) => `${i + 1}. ${precaution}`).join('\n')}`;
      } else {
        return `I don't have specific ayurvedic tips for ${condition}. Would you like tips for another condition?`;
      }
    } catch (error) {
      return 'Sorry, I encountered an error while fetching the tips. Please try again.';
    }
  };

  return { getTip, loading, error };
};