import { faker } from '@faker-js/faker';
import type { Application, User } from '@prisma/client';
import { ApplicationStatus, CompanyType } from '@prisma/client';
import { createTestCompanyCreateData, createTestFloristApplication } from '../../test/utils';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Logs in with a random user that has an approved grower's application Yields the user and adds an alias to the user
       *
       * @returns {typeof loginGrower}
       * @memberof Chainable
       * @example
       *    cy.loginGrower()
       */
      loginGrower: typeof loginGrower;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Creates a test application with a new applicant user
       *
       * @returns {typeof createApplication}
       * @memberof Chainable
       * @example
       *    cy.createApplication({ type: 'FLORIST' })
       * @example
       *    cy.createApplication({ type: 'GROWER' })
       */
      createApplication: typeof createApplication;

      /**
       * Deletes the applicant of the application
       *
       * @returns {typeof cleanupApplication}
       * @memberof Chainable
       * @example
       *    cy.cleanupApplication()
       */
      cleanupApplication: typeof cleanupApplication;

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;
    }
  }
}

function login({
  email = faker.internet.email(undefined, undefined, 'example.com'),
  isAdmin = false,
}: {
  email?: string;
  isAdmin?: boolean;
} = {}) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "true" "${email}" "${isAdmin}"`
  )
    .then(({ stdout }) => {
      const cookieValue = stdout.replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, '$<cookieValue>').trim();
      const userId = stdout.replace(/.*<id>(?<userId>.*)<\/id>.*/s, '$<userId>').trim();

      return cy.setCookie('__session', cookieValue).then(() => ({ email, id: userId }));
    })
    .as('user');

  return cy.get('@user');
}

function loginGrower() {
  cy.login().then((user) => {
    const { id } = user as unknown as { email: User['email']; id: User['id'] };

    const params: Pick<Application, 'type' | 'userId' | 'payloadJson' | 'status'> = {
      type: CompanyType.GROWER,
      userId: id,
      status: ApplicationStatus.APPROVED,
      payloadJson: createTestFloristApplication(),
    };

    return cy
      .exec(
        `npx ts-node --require tsconfig-paths/register ./cypress/support/create-application.ts '${JSON.stringify(
          params
        ).replace("'", '')}'`
      )
      .then(() => {
        const companyParams = {
          params: { ...createTestCompanyCreateData({ type: CompanyType.GROWER, active: true }), ownerId: id },
        };
        return cy.exec(
          `npx ts-node --require tsconfig-paths/register ./cypress/support/create-company.ts '${JSON.stringify(
            companyParams
          ).replace("'", '')}'`
        );
      });
  });
  return cy.get('@user');
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get('@user').then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie('__session');
}

function createApplication({ type }: { type: CompanyType }) {
  const email = faker.internet.email(undefined, undefined, 'example.com');

  cy.exec(`npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "false" "${email}" "false"`)
    .then(({ stdout }) => {
      const userId = stdout.replace(/.*<id>(?<userId>.*)<\/id>.*/s, '$<userId>').trim();
      return { email, id: userId };
    })
    .as('applicant');

  cy.get('@applicant')
    .then((applicant) => {
      const userId = (applicant as unknown as { id: string }).id;
      const params: Pick<Application, 'type' | 'userId' | 'payloadJson'> = {
        type,
        userId,
        payloadJson: createTestFloristApplication(),
      };

      return cy.exec(
        `npx ts-node --require tsconfig-paths/register ./cypress/support/create-application.ts '${JSON.stringify(
          params
        ).replace("'", '')}'`
      );
    })
    .then(({ stdout }) => {
      const applicationJson = stdout
        .replace(/.*<application>(?<applicationJson>.*)<\/application>.*/s, '$<applicationJson>')
        .trim();
      return JSON.parse(applicationJson);
    })
    .as('application');

  cy.get('@applicant')
    .then((applicant) => {
      const userId = (applicant as unknown as { id: string }).id;

      const companyParams = {
        params: { ...createTestCompanyCreateData({ type }), ownerId: userId },
      };
      return cy.exec(
        `npx ts-node --require tsconfig-paths/register ./cypress/support/create-company.ts '${JSON.stringify(
          companyParams
        ).replace("'", '')}'`
      );
    })
    .then(({ stdout }) => {
      const companyJson = stdout.replace(/.*<company>(?<companyJson>.*)<\/company>.*/s, '$<companyJson>').trim();
      return JSON.parse(companyJson);
    })
    .as('company');

  return cy.get('@application');
}

function cleanupApplication() {
  cy.get('@applicant').then((user) => {
    const email = (user as { email?: string }).email;
    if (email) {
      deleteUserByEmail(email);
    }
  });
}

function deleteUserByEmail(email: string) {
  cy.exec(`npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts "${email}"`);
  cy.clearCookie('__session');
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime: number = 1000) {
  cy.visit(url);
  cy.location('pathname').should('contain', url).wait(waitTime);
}

Cypress.Commands.add('login', login);
Cypress.Commands.add('loginGrower', loginGrower);
Cypress.Commands.add('cleanupUser', cleanupUser);
Cypress.Commands.add('createApplication', createApplication);
Cypress.Commands.add('cleanupApplication', cleanupApplication);
Cypress.Commands.add('visitAndCheck', visitAndCheck);

/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
