"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

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
    // Special handling for Host link: unauthenticated users should start with registration/login
    if (href === "/host") {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (user || token) {
        // Already authenticated -> start from Create Tournament page
        router.push("/setup-tournament");
      } else {
        // Not authenticated -> send to registration page so they can register (signup links to login)
        toast("Please register or login to host an auction.", { icon: "🔒" });
        router.push(`/signup?next=${encodeURIComponent("/setup-tournament")}`);
      }

      return;
    }

    // For other protected paths, require login
    if (protectedPaths.includes(href)) {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!user && !token) {
        toast("Please login to continue.", { icon: "🔒" });
        router.push(`/login?next=${encodeURIComponent(href)}`);
        return;
      }
    }

    router.push(href);
  };

  return (
    <header className="w-full bg-[#000814] text-white py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-yellow-400 text-xl">🏏</span>
          <span className="text-xl font-semibold tracking-wide">{brand}</span>
        </div>

        <nav className="flex items-center gap-8">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => handleNav(link.href)}
              className="text-base hover:text-yellow-400 transition font-medium"
            >
              {link.label}
            </button>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/setup-tournament")}
                className="text-sm text-gray-200 px-3 py-1 rounded hover:bg-gray-700"
              >
                {user.fullName}
              </button>
              <button
                onClick={async () => {
                  try {
                    await logoutAsync();
                    setHasToken(false);
                    toast.success("Logged out successfully");
                    router.push("/");
                  } catch (err) {
                    console.warn("Logout failed", err);
                    toast.error("Failed to logout, try again");
                    // Ensure client cleanup even if server call failed
                    localStorage.removeItem("token");
                    setHasToken(false);
                    router.push("/");
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : hasToken ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/setup-tournament")}
                className="text-sm text-gray-200 px-3 py-1 rounded hover:bg-gray-700"
              >
                Account
              </button>
              <button
                onClick={async () => {
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
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-yellow-400 text-black px-5 py-2 rounded-md font-semibold shadow hover:bg-yellow-500 transition"
            >
              {loginText}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
