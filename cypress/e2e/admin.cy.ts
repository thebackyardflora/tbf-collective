describe('admin portal', () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it('should allow an admin user to navigate to the admin portal', () => {
    cy.login({ isAdmin: true });

    cy.visit('/admin');
  });
});
