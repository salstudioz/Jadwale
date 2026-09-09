import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import MobileBottomNav from '../../components/MobileBottomNav';
import MobilePageHeader from '../../components/MobilePageHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
        {/* Desktop Sidebar — hidden on mobile */}
        <Sidebar />

        {/* Main column: header (mobile) + content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile page header — sticky, md:hidden */}
          <MobilePageHeader />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto">
            <div
              className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"
              /* Bottom padding on mobile accounts for the bottom nav bar (56px + safe area) */
              style={{ paddingBottom: 'calc(1rem + 64px)' }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <MobileBottomNav />
    </ProtectedRoute>
  );
}
