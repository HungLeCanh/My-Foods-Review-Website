"use client";

import { usePathname } from "next/navigation";
import AuthProvider from "./SessionProvider";

export default function ConditionalSessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/pages/login" || pathname === "/pages/register" || pathname === "/pages/business_home" || pathname === "/";

  return isAuthPage ? <>{children}</> : <AuthProvider>{children}</AuthProvider>;
}
