// type Props = {};

import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';

export default function LandingLayout() {
  return (
    <div className="w-full h-screen relative">
      {/* nav bar */}
      <TopNavbar />
      {/* Page content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
