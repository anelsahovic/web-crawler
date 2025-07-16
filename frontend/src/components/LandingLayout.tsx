// type Props = {};

import { Outlet } from 'react-router-dom';
import LandingNavbar from './LandingNavbar';

export default function LandingLayout() {
  return (
    <div className="w-full h-screen relative">
      {/* nav bar */}
      <LandingNavbar />
      {/* Page content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
