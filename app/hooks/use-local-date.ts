import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export interface UseLocalDateParams {
  type?: 'date' | 'datetime' | 'time';
  format?: string;
}

export const useLocalDate = (
  value: number | string | Date,
  { type = 'datetime', format }: UseLocalDateParams = { type: 'datetime' }
) => {
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    const date = new Date(value);
    let newDateString;
    if (format) {
      newDateString = dayjs(value).format(format);
    } else {
      newDateString =
        type === 'date'
          ? date.toLocaleDateString()
          : type === 'time'
          ? date.toLocaleTimeString()
          : date.toLocaleString();
    }
    setDateString(newDateString);
  }, [format, type, value]);

  return dateString;
};
