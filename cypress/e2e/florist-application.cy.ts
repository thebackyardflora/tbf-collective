describe('florist application tests', function () {
  afterEach(() => {
    cy.cleanupUser();
  });

  it('should allow you to fill out the florist application', () => {
    cy.login();
    cy.visitAndCheck('/apply');
    cy.findByRole('link', { name: /florist/i }).click();
  });
});
