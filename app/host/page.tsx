"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";


export default function HostPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (user || token) {
      router.replace("/setup-tournament");
    } else {
      router.replace(`/signup?next=${encodeURIComponent("/setup-tournament")}`);
    }
  }, [router, user]);

  return null;
}
