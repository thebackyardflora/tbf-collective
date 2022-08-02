import { faker } from '@faker-js/faker';

describe('grower catalog', () => {
  beforeEach(() => {
    cy.loginGrower();
  });

  it('should allow a grower to create a catalog item', () => {
    const productName = faker.commerce.productName();

    cy.visitAndCheck('/growers');

    // Create an item
    cy.findByRole('link', { name: /catalog/i }).click();
    cy.findByRole('link', { name: /new item/i }).click();
    cy.findByLabelText(/name/i).type(productName);
    cy.findByLabelText(/description/i).type(faker.lorem.paragraph());
    cy.findByRole('button', { name: /create/i }).click({ force: true });

    // Create a variety
    cy.findByRole('link', { name: new RegExp(productName.toLowerCase(), 'i') }).click();
    cy.findByRole('link', { name: /new variety/i }).click();
    cy.findByLabelText(/name/i).type(faker.commerce.productName());
    cy.findByLabelText(/description/i).type(faker.lorem.paragraph());
    cy.findByRole('button', { name: /create/i }).click({ force: true });
  });

  afterEach(() => {
    cy.cleanupUser();
  });
});
