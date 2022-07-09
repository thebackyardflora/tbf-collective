import { ApplicationType } from '@prisma/client';

describe('admin portal', () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it('should allow an admin user to navigate to the admin portal', () => {
    cy.login({ isAdmin: true });

    cy.visit('/admin');
    cy.url().should('include', '/admin');
  });

  describe('applications', () => {
    beforeEach(() => {
      cy.login({ isAdmin: true });
      cy.createApplication({ type: ApplicationType.FLORIST });
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
      cy.findByText('APPROVED');
    });

    afterEach(() => {
      cy.cleanupApplication();
    });
  });
});
