"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loading from "./Loading";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    // Pages that don't require authentication
    const publicPaths = ["/", "/login", "/signup"];

    if (!pathname) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllowed(true);
      return;
    }

    if (publicPaths.includes(pathname)) {
      setAllowed(true);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (user || token) {
      setAllowed(true);
      return;
    }

    // If not authenticated, redirect to login and pass the originally requested path
    router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
  }, [pathname, router, user]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return <>{children}</>;
}
