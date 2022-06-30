import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

export default function Index() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-white">
      <div className="relative w-full sm:pb-16 sm:pt-8">
        <div className="mx-auto w-full max-w-md space-y-4 sm:px-6 lg:px-8">
          <button className="flex w-full items-center justify-center rounded-lg border-2 border-primary-500 p-4 font-bold text-primary-600 hover:bg-primary-50 sm:p-8">
            I'm a florist <LocalFloristIcon />
          </button>

          <button className="flex w-full items-center justify-center rounded-lg border-2 border-primary-500 p-4 sm:p-8">
            I'm a grower <AgricultureIcon />
          </button>
        </div>
      </div>
    </main>
  );
}
