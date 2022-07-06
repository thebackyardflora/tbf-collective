import { Link } from '@remix-run/react';
import { Agriculture, LocalFlorist } from '@mui/icons-material';

export default function ApplyIndex() {
  return (
    <>
      <p className="mb-4 text-gray-500">What are you applying for?</p>
      <div className="flex flex-col justify-center space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <Link
          to="florist"
          className="group flex items-center justify-center rounded-md border-2 border-primary-600 p-8 hover:bg-primary-50 lg:flex-1"
        >
          <LocalFlorist className="mr-2 h-4 w-4 text-primary-600" />
          I'm a florist
        </Link>
        <Link
          to="grower"
          className="group flex items-center justify-center rounded-md border-2 border-primary-600 p-8 hover:bg-primary-50 lg:flex-1"
        >
          <Agriculture className="mr-2 h-4 w-4 text-primary-600" />
          I'm a grower
        </Link>
      </div>
    </>
  );
}
