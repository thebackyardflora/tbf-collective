import { vi } from 'vitest';
import * as session from '~/session.server';

vi.mock('~/session.server');

export const sessionMock = vi.mocked(session);
