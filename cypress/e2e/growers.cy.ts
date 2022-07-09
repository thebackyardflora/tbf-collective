describe('growers dashboard tests', () => {
  beforeEach(() => {
    cy.loginGrower();
  });

  it('should allow a grower to access the grower dashboard', () => {
    cy.visit('/growers');
    cy.url().should('include', '/growers/dashboard');
  });

  afterEach(() => {
    cy.cleanupUser();
  });
});
