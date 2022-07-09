import { useEffect, useState } from 'react';

export interface UseLocalDateParams {
  type?: 'date' | 'datetime' | 'time';
}

export const useLocalDate = (
  value: number | string | Date,
  { type = 'datetime' }: UseLocalDateParams = { type: 'datetime' }
) => {
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const date = new Date(value);
    setDateString(
      type === 'date' ? date.toLocaleDateString() : type === 'time' ? date.toLocaleTimeString() : date.toLocaleString()
    );
  }, [type, value]);

  return dateString;
};
