import { faker } from '@faker-js/faker';

describe('growers dashboard tests', () => {
  beforeEach(() => {
    cy.loginGrower();
  });

  it('should allow a grower to update their company profile', () => {
    cy.intercept('POST', '/growers/profile*').as('profilePost');

    cy.visit('/growers');
    cy.url().should('include', '/growers/dashboard');
    cy.findByRole('link', { name: /view profile/i }).click();

    const newBusinessName = faker.company.companyName();
    const newOwnerName = faker.name.findName();
    const newBio = faker.lorem.paragraph();
    const newInstagram = faker.internet.userName();
    const newWebsite = faker.internet.url();

    cy.findByLabelText(/business name/i)
      .clear()
      .type(newBusinessName);
    cy.findByLabelText(/business owner name/i)
      .clear()
      .type(newOwnerName);
    cy.findByLabelText(/about/i).clear().type(newBio);
    cy.findByLabelText(/instagram/i)
      .clear()
      .type(newInstagram);
    cy.findByLabelText(/website/i)
      .clear()
      .type(newWebsite);
    cy.get('button[name="companyProfile"]').click();

    cy.wait('@profilePost').its('response.statusCode').should('eq', 200);

    cy.findByLabelText(/business name/i).should('have.value', newBusinessName);
    cy.findByLabelText(/business owner name/i).should('have.value', newOwnerName);
    cy.findByLabelText(/about/i).should('have.value', newBio);
    cy.findByLabelText(/instagram/i).should('have.value', newInstagram);
    cy.findByLabelText(/website/i).should('have.value', newWebsite);
  });

  afterEach(() => {
    cy.cleanupUser();
  });
});
