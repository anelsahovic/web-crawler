import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';
import { Toaster } from './ui/sonner';

export default function AppLayout() {
  return (
    <div className="relative h-screen">
      {/* nav bar */}
      <AppNavbar />
      {/* Page content */}
      <Toaster theme="light" richColors position="top-center" />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
