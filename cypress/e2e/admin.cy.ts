import { CompanyType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';

describe('admin portal', () => {
  beforeEach(() => {
    cy.login({ isAdmin: true });
  });

  describe('applications', () => {
    it('should allow an admin to review an application', () => {
      cy.createApplication({ type: CompanyType.FLORIST });
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

  describe('market-events', () => {
    it('should allow an admin to create a market event', () => {
      cy.intercept('POST', /\/market-events\/new/i).as('newMarketPost');
      cy.intercept('POST', /\/market-events\/(?!.*(new))/i).as('updateMarketPost');

      cy.visit('/admin');
      cy.findByRole('link', { name: /market events/i }).click();
      cy.findByRole('link', { name: /new event/i }).click();
      cy.findByLabelText(/market date/i).type(dayjs(faker.date.future()).format('YYYY-MM-DDThh:mm'));
      cy.findByLabelText(/street address/i).type(faker.address.streetAddress());
      cy.findByLabelText(/city/i).type(faker.address.city());
      cy.findByLabelText(/state/i).type(faker.address.state());
      cy.findByLabelText(/zip/i).type(faker.address.zipCode());
      cy.findByLabelText(/notes/i).type(faker.lorem.paragraph());

      cy.findByRole('button', { name: /create market/i }).click({ force: true });

      cy.wait('@newMarketPost').its('response.statusCode').should('eq', 204);

      cy.findAllByTestId('market-event-link').first().click();

      // cy.findByLabelText(/market date/i)
      //   .clear()
      //   .type(dayjs(faker.date.future()).format('YYYY-MM-DDThh:mm'));
      // cy.findByLabelText(/notes/i).clear().type(faker.lorem.paragraph());
      //
      // cy.findByRole('button', { name: /update market/i }).click({ force: true });
      //
      // cy.wait('@updateMarketPost').its('response.statusCode').should('eq', 200);

      cy.findByRole('button', { name: /cancel market/i })
        .should('be.visible')
        .click({ force: true });

      cy.wait('@updateMarketPost').its('response.statusCode').should('eq', 200);
    });
  });

  afterEach(() => {
    cy.cleanupUser();
  });
});
