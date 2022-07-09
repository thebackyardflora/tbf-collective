import { sessionMock } from '~/test/session-mock';
import { loader } from './dashboard';
import { faker } from '@faker-js/faker';

describe('admin dashboard page', () => {
  test('the loader requires a user', async () => {
    await loader({ request: new Request(faker.internet.url()), context: {}, params: {} });

    expect(sessionMock.requireAdmin).toHaveBeenCalledOnce();
  });
});
