import { formDataFromObject, validateEmail, validateName } from './utils';
import { faker } from '@faker-js/faker';

test('validateEmail returns false for non-emails', () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail('')).toBe(false);
  expect(validateEmail('not-an-email')).toBe(false);
  expect(validateEmail('n@')).toBe(false);
});

test('validateEmail returns true for emails', () => {
  expect(validateEmail('kody@example.com')).toBe(true);
});

test('validateName returns true for a name', () => {
  expect(validateName('Justin')).toBe(true);
  expect(validateName('Justin Waite')).toBe(true);
});

test('validateName returns false for names that are too short', () => {
  expect(validateName('J')).toBe(false);
  expect(validateName(null)).toBe(false);
  expect(validateName(undefined)).toBe(false);
  expect(validateName('')).toBe(false);
});

test('formDataFromObject returns a FormData object', () => {
  const data = {
    name: faker.name.findName(),
  };

  const formData = formDataFromObject(data);

  expect(formData.has('name')).toBe(true);
  expect(formData.get('name')).toBe(data.name);
});
