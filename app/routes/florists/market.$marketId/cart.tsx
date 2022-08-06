import type { LoaderArgs } from '@remix-run/node';
import { requireFlorist } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  await requireFlorist(request);
}

export default function Cart() {
  return <div>Cart page</div>;
}
