// type Props = {};

import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

export default function AppLayout() {
  return (
    <div className="relative h-screen">
      {/* nav bar */}
      <AppNavbar />
      {/* Page content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
