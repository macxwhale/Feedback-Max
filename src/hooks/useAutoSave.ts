
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useAutoSave = (
  data: any,
  key: string,
  delay: number = 2000
) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log('Auto-saved form data');
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, delay]);

  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load saved data:', error);
      return null;
    }
  };

  const clearSavedData = () => {
    try {
      localStorage.removeItem(key);
      console.log('Cleared saved form data');
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  };

  return { loadSavedData, clearSavedData };
};
