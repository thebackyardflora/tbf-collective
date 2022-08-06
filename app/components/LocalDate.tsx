import type { FC } from 'react';
import type { UseLocalDateParams } from '~/hooks/use-local-date';
import { useLocalDate } from '~/hooks/use-local-date';

export const LocalDate: FC<{ children: string; format?: string; type?: UseLocalDateParams['type'] }> = ({
  children,
}) => {
  const localDate = useLocalDate(children, {});

  return <>{localDate}</>;
};
