import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import MobileBottomNav from '../../components/MobileBottomNav';
import MobilePageHeader from '../../components/MobilePageHeader';
import PeriodeSwitcher from '../../components/PeriodeSwitcher';
import ArchiveBanner from '../../components/ArchiveBanner';

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

        {/* Main column: topbar + banner + content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Desktop Topbar */}
          <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 z-20">
            <div className="flex items-center gap-3">
              <PeriodeSwitcher />
            </div>
          </header>

          {/* Read-only banner for archived periods */}
          <ArchiveBanner />

          {/* Mobile page header — sticky, md:hidden */}
          <MobilePageHeader />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto">
            <div
              className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto"
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
