// type Props = {};

import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div>
      {/* nav bar */}
      <nav className=" bg-cyan-500 p-4 text-white">NAVBAR</nav>
      {/* Page content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
