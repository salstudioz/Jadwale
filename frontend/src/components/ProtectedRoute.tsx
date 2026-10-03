'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
      return;
    }

    if (user && user.is_verified === false && pathname !== '/status-verifikasi') {
      router.push('/status-verifikasi');
      return;
    }

    if (user && user.is_verified === true && pathname === '/status-verifikasi') {
      router.push('/dashboard');
      return;
    }

    if (user && (user.role === 'ADMIN_SEKOLAH' || user.is_admin)) {
      const isPendingSetup = user.sekolah?.status === 'PENDING_SETUP' && !user.sekolah?.setupCompleted;
      if (isPendingSetup && pathname !== '/setup') {
        router.push('/setup');
      } else if (!isPendingSetup && pathname === '/setup') {
        router.push('/dashboard');
      }
    }
  }, [token, user, pathname, router]);

  if (!mounted || !token) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-blue-700" />
      </div>
    );
  }

  return <>{children}</>;
}
