"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { LogOut, User as UserIcon, Hammer } from "lucide-react";

type Props = {
  brand: string;
  links: { label: string; href: string }[];
  loginText: string;
};

export default function Header({ brand, links, loginText }: Props) {
  const router = useRouter();
  // Note: We still access 'user' to check auth status, 
  // but we bypass the 'logoutAsync' API call.
  const { user } = useAuthStore(); 
  
  // Always start with false to match server render, then update in useEffect
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Set hydrated flag and check token only after mount (client-side only)
    setIsHydrated(true);
    setHasToken(Boolean(localStorage.getItem("token")));

    const handler = (e: StorageEvent) => {
      if (e.key === "token") {
        setHasToken(Boolean(e.newValue));
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const protectedPaths = ["/setup-tournament", "/register-teams", "/dashboard"];

  const handleNav = (href: string) => {
    if (protectedPaths.includes(href)) {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!user && !token) {
        toast("Please login to continue.", { icon: "🔒" });
        router.push(`/login?next=${encodeURIComponent(href)}`);
        return;
      }
    }

    router.push(href);
  };

  /**
   * CLIENT-ONLY LOGOUT
   * Clears local storage and state without hitting the backend API.
   */
  const handleLogout = () => {
    // 1. Remove the token from local storage
    localStorage.removeItem("token");
    
    // 2. Clear any other auth-related local data if applicable
    localStorage.removeItem("user-storage"); // Common if using Zustand persist

    // 3. Update local state to trigger UI re-render
    setHasToken(false);

    // 4. Force a page reload or state reset in your AuthStore 
    // depending on how useAuthStore is configured.
    // If your store uses persist, you might need: useAuthStore.persist.clearStorage();
    
    toast.success("Logged out successfully");

    // 5. Redirect to home
    router.push("/");
    
    // Optional: Refresh the page to ensure all stores are completely reset
    window.location.reload();
  };

  return (
    <header className="w-full bg-[#020408]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
            <Hammer className="text-black" size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black italic tracking-tighter uppercase text-white">
            {brand.split(' ')[0]}<span className="text-amber-500">{brand.split(' ')[1] || ''}</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => handleNav(link.href)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-amber-500 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Only check auth state after hydration to prevent mismatch */}
          {isHydrated && (user || hasToken) ? (
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl">
              <button
                onClick={() => router.push("/setup-tournament")}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <UserIcon size={12} className="text-amber-500" />
                </div>
                {user?.fullName || "Account"}
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <LogOut size={14} strokeWidth={3} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-white text-black px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-500 transition-all active:scale-95 cursor-pointer"
            >
              {loginText}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}