describe('smoke tests', () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it('should allow you to visit the root', () => {
    cy.login();
    cy.visit('/');
  });
});
