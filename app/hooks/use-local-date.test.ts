import { describe, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLocalDate } from './use-local-date';

describe('useLocalDate', () => {
  test('should return a datetime string in the local timezone using the default type', () => {
    const { result } = renderHook(() => useLocalDate(new Date('2020-01-01T00:00:00.000Z')));

    expect(result.current).toBe('1/1/2020, 12:00:00 AM');
  });

  test('should return a datetime string in the local timezone, with "datetime" type', () => {
    const { result } = renderHook(() => useLocalDate(new Date('2020-01-01T00:00:00.000Z')));

    expect(result.current).toBe('1/1/2020, 12:00:00 AM');
  });

  test('should return a date string in the local timezone, with "date" type', () => {
    const { result } = renderHook(() => useLocalDate(new Date('2020-01-01T00:00:00.000Z'), { type: 'date' }));

    expect(result.current).toBe('1/1/2020');
  });

  test('should return a time string in the local timezone, with "time" type', () => {
    const { result } = renderHook(() => useLocalDate(new Date('2020-01-01T00:00:00.000Z'), { type: 'time' }));

    expect(result.current).toBe('12:00:00 AM');
  });
});
