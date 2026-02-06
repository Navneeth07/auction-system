"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { LogOut, User as UserIcon, Trophy, Hammer } from "lucide-react";

type Props = {
  brand: string;
  links: { label: string; href: string }[];
  loginText: string;
};

export default function Header({ brand, links, loginText }: Props) {
  const router = useRouter();
  const { user, logoutAsync } = useAuthStore();
  const [hasToken, setHasToken] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? Boolean(localStorage.getItem("token"))
      : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: StorageEvent) => {
      if (e.key === "token") {
        setHasToken(Boolean(e.newValue));
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const protectedPaths = ["/setup-tournament", "/register-teams"];

  const handleNav = (href: string) => {
    if (href === "/host") {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (user || token) {
        router.push("/setup-tournament");
      } else {
        toast("Please register or login to host an auction.", { icon: "🔒" });
        router.push(`/signup?next=${encodeURIComponent("/setup-tournament")}`);
      }
      return;
    }

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

  const handleLogout = async () => {
    try {
      await logoutAsync();
      setHasToken(false);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (err) {
      console.warn("Logout failed", err);
      toast.error("Failed to logout, try again");
      localStorage.removeItem("token");
      setHasToken(false);
      router.push("/");
    }
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
          {user || hasToken ? (
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