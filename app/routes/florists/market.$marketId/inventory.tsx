import type { LoaderArgs } from '@remix-run/node';
import { requireFlorist } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  await requireFlorist(request);

  return null;
}

export default function Inventory() {
  return <div>Inventory page</div>;
}
