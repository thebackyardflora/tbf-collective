import { faker } from '@faker-js/faker';

describe('flower catalog', () => {
  beforeEach(() => {
    cy.login({ isAdmin: true });
  });

  it('should allow an admin to create a catalog item', () => {
    const productName = faker.commerce.productName();

    cy.visitAndCheck('/admin');

    // Create an item
    cy.findByRole('link', { name: /catalog/i }).click();
    cy.findByRole('link', { name: /new item/i }).click();
    cy.findByLabelText(/name/i).type(productName);
    cy.findByLabelText(/description/i).type(faker.lorem.paragraph());
    cy.findByRole('button', { name: /create/i }).click({ force: true });

    // Create a variety
    cy.findAllByRole('link', { name: new RegExp(productName.toLowerCase(), 'i') })
      .first()
      .click();
    cy.findByRole('link', { name: /new variety/i }).click();
    cy.findByLabelText(/name/i).type(faker.commerce.productName());
    cy.findByLabelText(/description/i).type(faker.lorem.paragraph());
    cy.findByRole('button', { name: /create/i }).click({ force: true });
  });

  afterEach(() => {
    cy.cleanupUser();
  });
});
