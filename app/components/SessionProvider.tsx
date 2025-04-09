"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthProvider({ children }: { children: React.ReactNode, session?: any }) {
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'next-auth.session-token' && !event.newValue) {
        // Session token đã bị xóa, làm mới trang để cập nhật state
        router.refresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [router]);

  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}