import { CompanyType } from '@prisma/client';

describe('admin portal', () => {
  beforeEach(() => {
    cy.login({ isAdmin: true });
    cy.createApplication({ type: CompanyType.FLORIST });
  });

  it('should allow an admin to review an application', () => {
    cy.visit('/admin');
    cy.findByRole('link', { name: /applications/i }).click();
    cy.url().should('include', '/admin/applications');

    cy.get('@application').then((application) => {
      const { payloadJson } = application as Record<string, any>;
      cy.findByRole('link', { name: new RegExp(`${payloadJson.businessName}`, 'i') }).click();
    });

    cy.findByRole('button', { name: /approve application/i }).click({ force: true });
  });

  afterEach(() => {
    cy.cleanupApplication();
  });
});
