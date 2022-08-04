import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'tbf-collective',
  e2e: {
    setupNodeEvents: (on, config) => {
      const isDev = config.watchForFileChanges;
      const port = process.env.PORT ?? (isDev ? '3000' : '8811');
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        baseUrl: `http://localhost:${port}`,
      };

      // To use this:
      // cy.task('log', whateverYouWantInTheTerminal)
      on('task', {
        log: (message) => {
          console.log(message);

          return null;
        },
      });

      return { ...config, ...configOverrides };
    },
    env: {
      SESSION_SECRET: 'super-secret-session-secret',
      NODE_ENV: 'scoop',
    },
  },
});
