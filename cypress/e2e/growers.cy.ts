import { faker } from '@faker-js/faker';

describe('growers dashboard tests', () => {
  beforeEach(() => {
    cy.loginGrower();
  });

  it('should allow a grower to update their profile', () => {
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

    const newEmail = faker.internet.email();
    const newPhone = faker.phone.number('208-5##-1###');
    const newEinTin = faker.finance.bic();

    cy.findByLabelText(/email/i).clear().type(newEmail);
    cy.findByLabelText(/phone/i).clear().type(newPhone);
    cy.findByLabelText(/ein/i).clear().type(newEinTin);
    cy.get('button[name="accountSettings"]').click();

    cy.wait('@profilePost').its('response.statusCode').should('eq', 200);

    cy.findByLabelText(/email/i).should('have.value', newEmail);
    cy.findByLabelText(/phone/i).should('have.value', newPhone);
    cy.findByLabelText(/ein\/tin/i).should('have.value', newEinTin);

    const currentPassword = 'myreallystrongpassword';
    const newPassword = faker.internet.password();

    cy.findByLabelText(/current password/i)
      .clear()
      .type(currentPassword);
    cy.findByLabelText(/^new password/i)
      .clear()
      .type(newPassword);
    cy.findByLabelText(/confirm new password/i)
      .clear()
      .type(newPassword);
    cy.get('button[name="changePassword"]').click();

    cy.wait('@profilePost').its('response.statusCode').should('eq', 200);

    cy.findByLabelText(/current password/i).should('have.value', '');
    cy.findByLabelText(/^new password/i).should('have.value', '');
    cy.findByLabelText(/confirm new password/i).should('have.value', '');
    cy.findByText(/your password was successfully updated/i);
  });

  afterEach(() => {
    cy.cleanupUser();
  });
});
