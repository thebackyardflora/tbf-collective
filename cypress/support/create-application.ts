import { prisma } from '~/db.server';
import type { ApplicationStatus } from '@prisma/client';
import { CompanyType } from '@prisma/client';

interface CreateApplicationParams {
  userId: string;
  type: CompanyType;
  payloadJson: Record<string, any>;
  status?: ApplicationStatus;
}

async function createApplication(params: CreateApplicationParams) {
  const application = await prisma.application.create({
    data: {
      userId: params.userId,
      type: params.type,
      payloadJson: params.payloadJson,
      status: params.status,
    },
  });

  console.log(
    `
<application>
  ${JSON.stringify(application)}
</application>
  `.trim()
  );
}

function isCreateApplicationParams(obj: unknown): obj is CreateApplicationParams {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const params = obj as Record<any, any>;

  if (
    !params.userId ||
    typeof params.userId !== 'string' ||
    !params.type ||
    !Object.values(CompanyType).includes(params.type) ||
    !params.payloadJson ||
    typeof params.payloadJson !== 'object'
  ) {
    return false;
  }

  return true;
}

const params = JSON.parse(process.argv[2]);

if (!isCreateApplicationParams(params)) {
  throw new Error('please provide valid params. received "' + process.argv[2] + '"');
}

createApplication(params);
