import { Link } from '@remix-run/react';

export default function ApplyIndex() {
  return (
    <>
      <Link to="florist">I'm a florist</Link>
      <Link to="grower">I'm a grower</Link>
    </>
  );
}
