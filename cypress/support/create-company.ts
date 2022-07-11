import { upsertCompany } from '~/models/company.server';

interface CreateCompanyParams {
  params: Parameters<typeof upsertCompany>[0];
}

async function createCompany({ params }: CreateCompanyParams) {
  const company = await upsertCompany(params);

  console.log(
    `
<company>
  ${JSON.stringify(company)}
</company>
  `.trim()
  );
}

function isCreateCompanyParams(obj: unknown): obj is CreateCompanyParams {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  return true;
}

const params = JSON.parse(process.argv[2]);

if (!isCreateCompanyParams(params)) {
  throw new Error('please provide valid params. received "' + process.argv[2] + '"');
}

createCompany(params);
