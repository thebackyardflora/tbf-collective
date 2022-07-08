import { faker } from '@faker-js/faker';

describe('smoke tests', () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it('should allow you to register and login', () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      name: faker.name.findName(),
      password: faker.internet.password(),
    };
    cy.then(() => ({ email: loginForm.email })).as('user');

    cy.visit('/login');
    cy.findByRole('link', { name: /sign up/i }).click();

    cy.findByRole('textbox', { name: /name/i }).type(loginForm.name);
    cy.findByRole('textbox', { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole('button', { name: /create account/i }).click();

    // cy.findByRole('button', { name: /logout/i }).click();
  });

  it('should allow you to navigate to the application page', () => {
    cy.login();

    cy.visit('/');
    cy.findByRole('link', { name: /apply now/i }).click();
    cy.url().should('include', '/apply');
  });
});
