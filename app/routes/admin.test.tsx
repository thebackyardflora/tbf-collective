import { loader } from './admin';
import { faker } from '@faker-js/faker';
import { redirect } from '@remix-run/node';
import { sessionMock } from '~/test/session-mock';
import { createTestUser } from '~/test/utils';

describe('Admin', () => {
  test('loader redirects user to login if not logged in', async () => {
    sessionMock.requireUser.mockRejectedValue(redirect('/login'));

    await expect(
      async () => await loader({ request: new Request(faker.internet.url()), context: {}, params: {} })
    ).rejects.toStrictEqual(redirect('/login'));
  });

  test('loader redirects user to root if they are not an admin', async () => {
    sessionMock.requireUser.mockResolvedValue(createTestUser());

    const response = await loader({ request: new Request(faker.internet.url()), context: {}, params: {} });

    expect(response).toStrictEqual(redirect('/'));
  });

  test('loader returns loader data if user is admin', async () => {
    const testUser = createTestUser({ isAdmin: true });
    sessionMock.requireUser.mockResolvedValue(testUser);

    const response = await loader({ request: new Request(faker.internet.url()), context: {}, params: {} });

    expect(response).toStrictEqual({ user: testUser });
  });
});
