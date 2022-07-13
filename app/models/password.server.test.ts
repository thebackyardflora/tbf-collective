import { InvalidPasswordError, updatePassword } from './password.server';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { prismaMock } from '~/test/prisma-mock';

vi.mock('bcryptjs');

const mockBcrypt = vi.mocked(bcrypt);

test('updatePassword calls prisma.password.update with the correct params', async () => {
  const userId = faker.datatype.uuid();
  const password = faker.internet.password();
  const currentPassword = faker.internet.password();
  const hashedPassword = faker.internet.password();

  prismaMock.password.findUnique.mockResolvedValueOnce({
    hash: faker.internet.password(),
    userId: faker.datatype.uuid(),
  });
  mockBcrypt.hash.mockResolvedValueOnce(hashedPassword as never);
  mockBcrypt.compare.mockResolvedValueOnce(true as never);

  await updatePassword({ userId, newPassword: password, currentPassword });

  expect(prismaMock.password.update).toHaveBeenCalledOnce();
  expect(prismaMock.password.update).toHaveBeenCalledWith({
    where: { userId },
    data: { hash: hashedPassword },
  });
});

test('update password throws an error if the current password is incorrect', async () => {
  const hashedPassword = faker.internet.password();

  prismaMock.password.findUnique.mockResolvedValueOnce({
    hash: faker.internet.password(),
    userId: faker.datatype.uuid(),
  });
  mockBcrypt.hash.mockResolvedValueOnce(hashedPassword as never);
  mockBcrypt.compare.mockResolvedValueOnce(false as never);

  await expect(async () => updatePassword({ newPassword: '', currentPassword: '', userId: '' })).rejects.toThrow(
    InvalidPasswordError
  );
});

test('update password throws an error if there is no password entity for the user', async () => {
  prismaMock.password.findUnique.mockResolvedValueOnce(null);

  await expect(async () => updatePassword({ newPassword: '', currentPassword: '', userId: '' })).rejects.toThrow(
    Error('User does not have a password')
  );
});
