import { loader } from './admin';
import { faker } from '@faker-js/faker';
import { redirect } from '@remix-run/node';
import { sessionMock } from '~/test/session-mock';
import { createTestUser } from '~/test/utils';

describe('Admin', () => {
  test('loader returns loader data if user is admin', async () => {
    const testUser = createTestUser({ isAdmin: true });
    sessionMock.requireAdmin.mockResolvedValue(testUser);

    const response = await loader({ request: new Request(faker.internet.url()), context: {}, params: {} });

    expect(response).toStrictEqual({ user: testUser });
  });
});
