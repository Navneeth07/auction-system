import { useEffect, useRef, useState } from "react";
import { useTournamentStore } from "../store/tournamentStore";
import { getTournamentById } from "../lib/api/api";
import { useApi } from "./useApi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/**
 * Hook to ensure tournament is loaded from localStorage if missing from store
 * Call this in any page that requires tournament context
 * Handles SSR hydration and ensures tournament is available before rendering
 */
export function useTournamentInit(redirectOnMissing = true) {
  const { tournament, setTournament } = useTournamentStore();
  const { request: fetchTournamentById } = useApi(getTournamentById);
  const router = useRouter();
  const initAttemptedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand persist to hydrate
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for hydration to complete
    if (!isHydrated) {
      return;
    }

    // If tournament is already loaded, nothing to do
    if (tournament?._id) {
      return;
    }

    // Only attempt initialization once
    if (initAttemptedRef.current) {
      return;
    }

    initAttemptedRef.current = true;

    const initializeTournament = async () => {
      // Small delay to ensure localStorage is accessible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const savedTournamentId = typeof window !== "undefined" 
        ? localStorage.getItem("selectedTournamentId")
        : null;
      
      if (savedTournamentId) {
        try {
          const res = await fetchTournamentById(savedTournamentId);
          const tournamentData = (res as any)?.data;
          if (tournamentData) {
            setTournament(tournamentData);
            return;
          }
        } catch (e) {
          console.warn("Failed to load tournament from ID:", e);
        }
      }

      // If we get here and redirect is enabled, redirect to setup
      if (redirectOnMissing) {
        toast.error("Tournament context missing. Redirecting...");
        router.push("/setup-tournament");
      }
    };

    initializeTournament();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournament?._id, isHydrated]);

  return { tournament, isInitialized: !!tournament?._id, isHydrated };
}
