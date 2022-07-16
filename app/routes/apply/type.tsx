import { Link } from '@remix-run/react';
import { Agriculture, LocalFlorist } from '@mui/icons-material';
import { CompanyType } from '@prisma/client';
import type { LoaderArgs } from '@remix-run/node';
import { requireUserId } from '~/session.server';
import { getApplicationByUserId } from '~/models/application.server';
import { redirect } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);

  const application = await getApplicationByUserId(userId);

  if (application) {
    return redirect('/apply/review');
  }

  return null;
}

export default function ApplyIndex() {
  return (
    <>
      <p className="mb-4 text-gray-500">Let's see which application you need</p>
      <div className="flex flex-col justify-center space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <Link
          to={`/apply/application?type=${CompanyType.FLORIST}`}
          className="group flex items-center justify-center rounded-md border-2 border-primary-600 p-8 hover:bg-primary-50 lg:flex-1"
        >
          <LocalFlorist className="mr-2 h-4 w-4 text-primary-600" />
          I'm a florist
        </Link>
        <Link
          to={`/apply/application?type=${CompanyType.GROWER}`}
          className="group flex items-center justify-center rounded-md border-2 border-primary-600 p-8 hover:bg-primary-50 lg:flex-1"
        >
          <Agriculture className="mr-2 h-4 w-4 text-primary-600" />
          I'm a grower
        </Link>
      </div>
    </>
  );
}
