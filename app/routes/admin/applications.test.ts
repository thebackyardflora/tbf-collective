import { sessionMock } from '~/test/session-mock';
import { loader } from './applications';
import { faker } from '@faker-js/faker';

describe('admin applications page', () => {
  test('the loader requires a user', async () => {
    await loader({ request: new Request(faker.internet.url()), context: {}, params: {} });

    expect(sessionMock.requireAdmin).toHaveBeenCalledOnce();
  });
});
