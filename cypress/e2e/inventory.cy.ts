import { faker } from '@faker-js/faker';

describe('inventory list', function () {
  beforeEach(function () {
    cy.loginGrower();
  });

  it('should allow a grower to create their inventory list', function () {
    cy.visitAndCheck('/growers');
    cy.findByRole('link', { name: /update inventory/i }).click();
    cy.location('pathname').should('contain', '/inventory').wait(1000);

    // Create an item
    cy.findByRole('button', { name: /add item/i })
      .should('be.visible')
      .click();

    // Wait for modal to open and finish animation
    cy.wait(1000);

    cy.findAllByRole('button', { name: /species/i })
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.findByLabelText(/quantity/i)
      .should('be.visible')
      .should('be.focused')
      .type(faker.datatype.number({ min: 1, max: 10 }).toString(), { force: true });
    cy.findByRole('button', { name: /save/i }).click({ force: true });

    // Wait for modal to close and finish animation
    cy.wait(1000);

    // // Create a second item
    // cy.findByRole('button', { name: /add item/i })
    //   .should('be.visible')
    //   .click({ force: true });
    //
    // // Wait for modal to open and finish animation
    // cy.wait(2000);
    //
    // cy.findAllByRole('button', { name: /species/i })
    //   .last()
    //   .click({ force: true });
    // cy.findByLabelText(/quantity/i)
    //   .should('be.visible')
    //   .should('be.focused')
    //   .type(faker.datatype.number({ min: 1, max: 10 }).toString(), { force: true });
    // cy.findByRole('button', { name: /save/i }).click({ force: true });
    //
    // // Wait for modal to close and finish animation
    // cy.wait(1000);
    //
    // // Delete the second item
    // cy.findAllByRole('checkbox').should('have.length', 3).last().should('be.visible').click({ force: true });
    // cy.findByRole('button', { name: /delete selected/i }).click({ force: true });
    // cy.findByRole('button', { name: /cancel/i }).should('be.visible');
    // cy.findByRole('button', { name: 'Delete' }).click({ force: true });

    // Submit for market
    cy.findByRole('button', { name: /submit for market/i }).click({ force: true });
    cy.findByRole('button', { name: /cancel/i }).should('be.visible');
    cy.findByRole('button', { name: 'Submit' }).click({ force: true });

    cy.findByText(/inventory list submitted/i).should('be.visible');
  });

  afterEach(function () {
    cy.cleanupUser();
  });
});
