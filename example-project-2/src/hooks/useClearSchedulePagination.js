import { useEffect } from 'react';

/**
 * Custom hook to clear schedule pagination data from sessionStorage
 * Clears all sessionStorage keys that start with 'walkdownSchedulePage_' or 'enrichmentSchedulePage_'
 */
export const useClearSchedulePagination = () => {
  useEffect(() => {
    const clearSchedulePaginationData = () => {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('walkdownSchedulePage_') || key.startsWith('enrichmentSchedulePage_')) {
          sessionStorage.removeItem(key);
        }
      });
    };
    
    clearSchedulePaginationData();
  }, []);
};
