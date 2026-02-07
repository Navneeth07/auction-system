"use client";

import { useEffect, useRef, useState } from "react";
import { useTournamentInit } from "../hooks/useTournamentInit";
import { useRouter } from "next/navigation"; // 1. Added Import
import { getAuctionRoom, postAuctionBid, hammerDownPlayer, updateBiddingPrice, revertBid } from "../lib/api/api";
import { AuctionTeam } from "../lib/api/types"; // Ensure these are imported
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";


type Player = {
  id: string;
  fullName: string;
  tournamentPlayerId?: string;
  image?: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
  status: "registered" | "sold";
  soldTo?: {
    id: string;
    name: string;
    shortCode: string;
  };
  soldAmount?: number;
};


type Team = {
  id: string;
  name: string;
  shortCode: string;
  remainingPurse: number;
};

type BidHistoryItem = {
  teamCode: string;
  amount: number;
  timestamp: number;
  bidHistoryId?: string;
  teamId?: string;
};

type SoldPlayer = {
  id: string;
  fullName: string;
  role: string;
  soldToCode: string;
  soldToName: string;
  amount: number;
};

const formatRupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const getHistoryKey = (tournamentId: string, playerId: string) =>
  `auction-history-${tournamentId}-${playerId}`;

export default function AuctionRoomPage() {
  const { tournament } = useTournamentInit(); // This ensures tournament is loaded
  const tournamentId = tournament?._id;
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>([]);
  const [playersByCategory, setPlayersByCategory] = useState<Record<string, Player[]>>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [soldPlayers, setSoldPlayers] = useState<SoldPlayer[]>([]);

  const [activeCategory, setActiveCategory] = useState("");
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  const [currentBid, setCurrentBid] = useState(0);
  const [leadingTeam, setLeadingTeam] = useState<Team | null>(null);
  const [lastBiddingTeamId, setLastBiddingTeamId] = useState<string | null>(null);

  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [showTeamSelectionModal, setShowTeamSelectionModal] = useState(false);

  const [rightPanelTab, setRightPanelTab] = useState<"bids" | "sold">("bids");
  const [isEditingBiddingPrice, setIsEditingBiddingPrice] = useState(false);
  const [editingBiddingPrice, setEditingBiddingPrice] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { request: updateBiddingPriceRequest } = useApi(updateBiddingPrice);

  const getTeamDataFromId = (id: string, teamList: Team[]) => {
    const team = teamList.find(t => t.id === id);
    return {
      name: team?.name || "Unknown Team",
      code: team?.shortCode || "N/A"
    };
  };

  const findFirstAvailableCategory = (roles: string[], mapped: Record<string, Player[]>) => {
    return roles.find(role => mapped[role] && mapped[role].length > 0) || roles[0] || "";
  };

  useEffect(() => {
    if (!tournamentId) return;

    getAuctionRoom(tournamentId).then(res => {
      const data = res.data;
      const roles = Object.keys(data.roles);
      const mapped: Record<string, Player[]> = {};
      const alreadySold: SoldPlayer[] = [];

      // FIX: Mapping raw API teams to local Team type with fallback for remainingPurse
      const mappedTeams: Team[] = (data.teams || []).map((t: AuctionTeam) => ({
        id: t.id,
        name: t.name,
        shortCode: t.shortCode,
        remainingPurse: t.remainingPurse ?? 0 // Provide 0 if undefined
      }));

      roles.forEach(role => {
        // Show ALL players including sold ones - don't filter them out
        mapped[role] = (data.roles[role].players as Player[]) || [];

        (data.roles[role].players as Player[]).forEach((p) => {
          if (p.status === "sold") {
            alreadySold.push({
              id: p.id,
              fullName: p.fullName,
              role: p.role,
              soldToCode: p.soldTo?.shortCode || "N/A",
              soldToName: p.soldTo?.name || "Unknown Team",
              amount: p.soldAmount || p.basePrice
            });
          }
        });
      });

      setCategories(roles);
      setPlayersByCategory(mapped);
      setTeams(mappedTeams);
      setSoldPlayers(alreadySold);

      const firstValidCat = findFirstAvailableCategory(roles, mapped);
      setActiveCategory(firstValidCat);

      let selectedPlayer: Player | null = null;
      if (data.activePlayer && data.activePlayer.status !== "sold") {
        selectedPlayer = data.activePlayer as Player;
      } else {
        // Find first non-sold player from the mapped category
        selectedPlayer = mapped[firstValidCat]?.find(p => p.status !== "sold") ?? null;
      }

      if (selectedPlayer) {
        setActivePlayer(selectedPlayer);
        setCurrentBid(selectedPlayer.basePrice);

        // Restore leading team and bid history from sessionStorage or API
        const historyKey = getHistoryKey(tournamentId, selectedPlayer.id);
        const savedHistory = sessionStorage.getItem(historyKey);
        if (savedHistory) {
          try {
            const parsedHistory: BidHistoryItem[] = JSON.parse(savedHistory);
            if (parsedHistory.length > 0) {
              setBidHistory(parsedHistory);
              // Find leading team from the latest bid
              const latestBid = parsedHistory[0];
              const leadingTeamFromHistory = mappedTeams.find(t => t.shortCode === latestBid.teamCode);
              if (leadingTeamFromHistory) {
                setLeadingTeam(leadingTeamFromHistory);
              }
            }
          } catch (e) {
            console.error("Failed to parse saved history", e);
          }
        }

        // Also check API bid history if available
        if (data.biddingHistory && data.biddingHistory.length > 0) {
          const apiHistory: BidHistoryItem[] = data.biddingHistory.map((bh: any) => ({
            teamCode: bh.teamId?.shortCode || "N/A",
            amount: bh.bidAmount,
            timestamp: new Date(bh.createdAt).getTime(),
            bidHistoryId: bh._id?.toString(),
            teamId: bh.teamId?._id?.toString() || bh.teamId?.toString()
          }));
          if (apiHistory.length > 0) {
            setBidHistory(apiHistory);
            const latestBid = apiHistory[0];
            const leadingTeamFromHistory = mappedTeams.find(t => t.shortCode === latestBid.teamCode);
            if (leadingTeamFromHistory) {
              setLeadingTeam(leadingTeamFromHistory);
              setLastBiddingTeamId(latestBid.teamId || null);
            }
          }
        }
      } else {
        setActivePlayer(null);
        setCurrentBid(0);
      }
    });
  }, [tournamentId]);

  const stopCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleBid = async (team: Team) => {
    if (!activePlayer || !activePlayer.tournamentPlayerId) return;

    const inc = activePlayer.biddingPrice;
    // Always use activePlayer.basePrice which is the source of truth from database
    const next = activePlayer.basePrice + inc;

    // if (team.remainingPurse < next) {
    //   toast.error("Team does not have enough purse for this bid");
    //   return;
    // }

    try {
      // Call API to place bid and get the actual updated price from database
      const response = await postAuctionBid({
        tournamentPlayerId: activePlayer.tournamentPlayerId,
        teamId: team.id,
        bidAmount: inc
      });

      const responseData = response.data?.data || response.data;
      const actualNewPrice = responseData?.currentPrice || next;
      const actualRemainingPurse = responseData?.remainingPurse || (team.remainingPurse - inc);

      // Update teams with actual remaining purse from server
      setTeams(prevTeams => prevTeams.map(t =>
        t.id === team.id ? { ...t, remainingPurse: actualRemainingPurse } : t
      ));

      // Update active player with new basePrice
      setActivePlayer(prev => prev ? {
        ...prev,
        basePrice: actualNewPrice
      } : null);

      // Update current bid with actual price from server
      setCurrentBid(actualNewPrice);
      setLeadingTeam(team);
      setLastBiddingTeamId(team.id); // Track last bidding team

      // Update bid history with actual price and bidHistoryId
      const bidHistoryId = responseData?.bidHistoryId;
      setBidHistory(prev => {
        const entry: BidHistoryItem = { 
          teamCode: team.shortCode, 
          amount: actualNewPrice, 
          timestamp: Date.now(),
          bidHistoryId: bidHistoryId,
          teamId: team.id
        };
        const updated = [entry, ...prev];
        sessionStorage.setItem(getHistoryKey(tournamentId!, activePlayer.id), JSON.stringify(updated));
        return updated;
      });

      // Update playersByCategory to reflect new basePrice
      setPlayersByCategory(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(role => {
          updated[role] = updated[role].map(p =>
            p.id === activePlayer.id
              ? { ...p, basePrice: actualNewPrice }
              : p
          );
        });
        return updated;
      });

      startCountdown();
    } catch (error: any) {
      console.error("Bid error:", error);
      toast.error(error?.response?.data?.message || "Failed to place bid. Please try again.");
    }
  };

  const handleRevertBid = async (bidItem: BidHistoryItem, index: number) => {
    if (!bidItem.bidHistoryId) {
      toast.error("Cannot revert: Bid ID missing");
      return;
    }

    if (index !== 0) {
      toast.error("You can only revert the latest bid");
      return;
    }

    if (!activePlayer || !tournamentId) return;

    try {
      const revertResponse = await revertBid(bidItem.bidHistoryId);
      
      // Get the previous price from revert response
      const previousPrice = revertResponse?.data?.data?.previousPrice;
      const playerIdToUpdate = activePlayer.id;
      
      // Update activePlayer immediately with the reverted price
      if (previousPrice !== undefined) {
        setActivePlayer(prev => prev ? {
          ...prev,
          basePrice: previousPrice
        } : null);
        
        setCurrentBid(previousPrice);
        
        // Update playersByCategory immediately
        setPlayersByCategory(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(role => {
            updated[role] = updated[role].map(p =>
              p.id === playerIdToUpdate
                ? { ...p, basePrice: previousPrice }
                : p
            );
          });
          return updated;
        });
      }
      
      // Refresh data from API to get updated state (teams, etc.)
      if (tournamentId) {
        try {
          const res = await getAuctionRoom(tournamentId);
          const data = res.data;
          const mappedTeams: Team[] = (data.teams || []).map((t: AuctionTeam) => ({
            id: t.id,
            name: t.name,
            shortCode: t.shortCode,
            remainingPurse: t.remainingPurse ?? 0
          }));
          setTeams(mappedTeams);

          // Double-check player base price from API response if available
          if (data.activePlayer && data.activePlayer.id === playerIdToUpdate) {
            const updatedPlayer = data.activePlayer as Player;
            setActivePlayer(prev => prev ? {
              ...prev,
              basePrice: updatedPlayer.basePrice
            } : null);
            setCurrentBid(updatedPlayer.basePrice);
          }
        } catch (error: any) {
          console.error("Failed to refresh auction room data after revert:", error);
          // Don't show error toast as the revert was successful, just log it
        }
      }

      // Remove from bid history and update leading team
      setBidHistory(prev => {
        const updated = prev.filter((_, i) => i !== index);
        sessionStorage.setItem(getHistoryKey(tournamentId, activePlayer.id), JSON.stringify(updated));
        
        // Update leading team based on updated history
        if (updated.length > 0) {
          const previousBid = updated[0];
          // Use teams state to find the previous team
          setTeams(currentTeams => {
            const previousTeam = currentTeams.find((t: Team) => t.shortCode === previousBid.teamCode);
            if (previousTeam) {
              setLeadingTeam(previousTeam);
              setLastBiddingTeamId(previousBid.teamId || null);
            } else {
              setLeadingTeam(null);
              setLastBiddingTeamId(null);
            }
            return currentTeams;
          });
        } else {
          setLeadingTeam(null);
          setLastBiddingTeamId(null);
        }
        
        return updated;
      });

      toast.success("Bid reverted successfully");
    } catch (error: any) {
      console.error("Revert bid error:", error);
      toast.error(error?.response?.data?.message || "Failed to revert bid. Please try again.");
    }
  };

  const startCountdown = () => {
    stopCountdown();
    setCountdown(10);
    timerRef.current = setInterval(() => {
      setCountdown(p => (p && p > 1 ? p - 1 : (stopCountdown(), null)));
    }, 1000);
  };

  const handleHammerDownClick = () => {
    if (!activePlayer) return;
    
    // Show team selection popup if no team is selected
    if (!leadingTeam) {
      setShowTeamSelectionModal(true);
      return;
    }
    
    setConfirmationStep(1);
    setIsModalOpen(true);
  };

  const handleTeamSelectionForHammer = async (selectedTeam: Team) => {
    if (!activePlayer || !activePlayer.tournamentPlayerId) return;
    
    setShowTeamSelectionModal(false);
    
    // Set the selected team as leading team
    setLeadingTeam(selectedTeam);
    setCurrentBid(activePlayer.basePrice);
    
    // Show confirmation modal
    setConfirmationStep(1);
    setIsModalOpen(true);
  };

  const executeHammerDown = async () => {
    if (!activePlayer || !activePlayer.tournamentPlayerId || !leadingTeam) {
      setIsModalOpen(false);
      return;
    }
    
    setIsModalOpen(false);

    try {
      const res = await hammerDownPlayer({ 
        tournamentPlayerId: activePlayer.tournamentPlayerId,
        teamId: leadingTeam.id
      });
      
      // Handle unsold case
      if (res.data.status === "unsold") {
        toast.success("Player marked as UNSOLD");
        setPlayersByCategory(prev => {
          const remaining = prev[activeCategory].filter(p => p.id !== activePlayer.id);
          const firstAvailable = remaining.find(p => p.status !== "sold") || null;
          setActivePlayer(firstAvailable);
          setCurrentBid(firstAvailable?.basePrice ?? 0);
          setLeadingTeam(null);
          setBidHistory([]);
          setCountdown(null);
          stopCountdown();
          return { ...prev, [activeCategory]: remaining };
        });
        return;
      }

      // Handle sold case
      const teamInfo = getTeamDataFromId(res.data.soldTo?.id || res.data.soldTo, teams);

      const newlySold: SoldPlayer = {
        id: activePlayer.id,
        fullName: activePlayer.fullName,
        role: activePlayer.role,
        soldToCode: teamInfo.code,
        soldToName: teamInfo.name,
        amount: res.data.soldAmount || currentBid
      };

      setSoldPlayers(prev => [newlySold, ...prev]);
      setRightPanelTab("sold");

      // Clear sessionStorage for this player
      const historyKey = getHistoryKey(tournamentId!, activePlayer.id);
      sessionStorage.removeItem(historyKey);

      // Refresh data from API to get updated player list and next active player
      if (tournamentId) {
        getAuctionRoom(tournamentId).then(res => {
          const data = res.data;
          const roles = Object.keys(data.roles);
          const mapped: Record<string, Player[]> = {};
          
          roles.forEach(role => {
            mapped[role] = (data.roles[role].players as Player[]) || [];
          });

          // Update teams with fresh data from API
          const mappedTeams: Team[] = (data.teams || []).map((t: AuctionTeam) => ({
            id: t.id,
            name: t.name,
            shortCode: t.shortCode,
            remainingPurse: t.remainingPurse ?? 0
          }));
          setTeams(mappedTeams);

          setPlayersByCategory(mapped);

          const firstValidCat = findFirstAvailableCategory(roles, mapped);
          setActiveCategory(firstValidCat);

          // Find next available player
          let nextPlayer: Player | null = null;
          if (data.activePlayer && data.activePlayer.status !== "sold") {
            nextPlayer = data.activePlayer as Player;
          } else {
            nextPlayer = mapped[firstValidCat]?.find(p => p.status !== "sold") ?? null;
          }

          if (nextPlayer) {
            setActivePlayer(nextPlayer);
            setCurrentBid(nextPlayer.basePrice);
            
            // Restore leading team and bid history for new player
            const nextHistoryKey = getHistoryKey(tournamentId, nextPlayer.id);
            const savedHistory = sessionStorage.getItem(nextHistoryKey);
            if (savedHistory) {
              try {
                const parsedHistory: BidHistoryItem[] = JSON.parse(savedHistory);
                if (parsedHistory.length > 0) {
                  setBidHistory(parsedHistory);
                  const latestBid = parsedHistory[0];
                  const leadingTeamFromHistory = mappedTeams.find(t => t.shortCode === latestBid.teamCode);
                  if (leadingTeamFromHistory) {
                    setLeadingTeam(leadingTeamFromHistory);
                  }
                } else {
                  setBidHistory([]);
                  setLeadingTeam(null);
                }
              } catch (e) {
                console.error("Failed to parse saved history", e);
                setBidHistory([]);
                setLeadingTeam(null);
              }
            } else {
              setBidHistory([]);
              setLeadingTeam(null);
            }
          } else {
            setActivePlayer(null);
            setCurrentBid(0);
            setLeadingTeam(null);
            setBidHistory([]);
          }

          setCountdown(null);
          stopCountdown();
        });
      }
    } catch (error: any) {
      console.error("Hammer down failed:", error);
      toast.error(error?.response?.data?.message || "Failed to hammer down. Please try again.");
    }
  };

  return (
    <div className="h-screen bg-[#020408] text-white p-4 flex flex-col relative overflow-hidden font-sans">

      {/* TEAM SELECTION MODAL */}
      {showTeamSelectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0c10] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-10 shadow-[0_0_100px_rgba(245,158,11,0.3)] relative overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
            
            <div className="text-center mb-6">
              <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block italic">Select Team</span>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2 text-white">Choose Team for <span className="text-amber-500">{activePlayer?.fullName}</span></h2>
              <p className="text-white/50 text-sm mb-2 leading-relaxed italic">
                Player will be sold at base price: <span className="text-amber-500 font-bold">{formatRupees(activePlayer?.basePrice || 0)}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelectionForHammer(team)}
                  className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-amber-500/50 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center font-black text-xl text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors">
                      {team.shortCode[0]}
                    </div>
                    <p className="text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-amber-500 transition-colors">
                      {team.shortCode}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">{team.name}</p>
                  <div className="border rounded-lg px-3 py-2 bg-black/40 border-white/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Purse</p>
                    <p className="text-sm font-black tabular-nums tracking-tighter text-amber-500">{formatRupees(team.remainingPurse)}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowTeamSelectionModal(false)} 
                className="w-full py-4 rounded-xl bg-white/5 border border-white/10 font-black uppercase text-xs hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-LAYER SECURITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0a0c10] border border-white/10 w-full max-w-lg rounded-[3.5rem] p-10 shadow-[0_0_100px_rgba(245,158,11,0.3)] relative overflow-hidden transform animate-in zoom-in-95 duration-200 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]" />

            {confirmationStep === 1 ? (
              <>
                <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6 block italic">Step 01: Identification</span>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-4 text-white">Confirm <span className="text-amber-500">Sale</span>?</h2>
                <p className="text-white/50 text-sm mb-10 leading-relaxed italic">Sell <span className="text-white font-bold">{activePlayer?.fullName}</span> to <span className="text-amber-500 font-bold">{leadingTeam?.name}</span> for <span className="text-white font-bold">{formatRupees(currentBid)}</span>?</p>
                <div className="flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 font-black uppercase text-xs hover:bg-white/10 transition-colors">Back</button>
                  <button onClick={() => setConfirmationStep(2)} className="flex-[2] py-4 rounded-xl bg-amber-600 font-black uppercase text-xs hover:bg-amber-500 transition-all shadow-lg">Proceed</button>
                </div>
              </>
            ) : (
              <>
                <span className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6 block italic animate-pulse">Step 02: Final Authorization</span>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 text-red-500 underline decoration-red-500/20 underline-offset-8">Authorize Hammer?</h2>
                <p className="text-white/70 text-sm mb-10 italic leading-relaxed">This action will finalize the transaction permanently. Proceed?</p>
                <div className="flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 font-black uppercase text-xs opacity-50 hover:opacity-100 transition-opacity">Abort</button>
                  <button onClick={executeHammerDown} className="flex-[2] py-4 rounded-xl bg-red-600 font-black uppercase text-xs shadow-2xl shadow-red-900/40 hover:bg-red-500 active:scale-95 transition-all">Hammer Down! 🔨</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex justify-between items-center mb-4 bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl backdrop-blur-2xl z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/40 rounded-lg text-[10px] font-black tracking-widest text-red-500 uppercase">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Live Auction
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">Cric<span className="text-amber-500">Auction</span> <span className="text-white/20 ml-1 italic text-lg">2026</span></h1>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white/5 hover:bg-red-600 border border-white/10 px-6 py-2 rounded-xl font-black transition-all text-xs uppercase text-red-500 hover:text-white cursor-pointer active:scale-95">End Session</button>
      </header>

      <div className="grid grid-cols-12 gap-4 flex-grow min-h-0 relative z-10">
        <div className="col-span-2 flex flex-col gap-4 min-h-0">
          <div className="bg-white/[0.03] backdrop-blur-xl p-4 rounded-3xl border border-white/10 shrink-0 shadow-lg">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 italic opacity-60">Pools</p>
            <div className="space-y-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${activeCategory === cat ? "bg-amber-600 text-white shadow-lg translate-x-1" : "text-white/40 hover:bg-white/5"}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex flex-col min-h-0 flex-grow shadow-inner overflow-hidden">
            <p className="text-[10px] font-black text-white/30 uppercase mb-3 italic">Queue</p>
            <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {(playersByCategory[activeCategory] ?? []).map(p => (
                <button 
                  key={p.id} 
                  onClick={async () => {
                    // Only allow selecting non-sold players as active
                    if (p.status !== "sold") {
                      setActivePlayer(p);
                      setCurrentBid(p.basePrice);
                      
                      // Restore leading team and bid history for selected player
                      if (tournamentId) {
                        const historyKey = getHistoryKey(tournamentId, p.id);
                        const savedHistory = sessionStorage.getItem(historyKey);
                        if (savedHistory) {
                          try {
                            const parsedHistory: BidHistoryItem[] = JSON.parse(savedHistory);
                            if (parsedHistory.length > 0) {
                              setBidHistory(parsedHistory);
                              const latestBid = parsedHistory[0];
                              const leadingTeamFromHistory = teams.find(t => t.shortCode === latestBid.teamCode);
                              if (leadingTeamFromHistory) {
                                setLeadingTeam(leadingTeamFromHistory);
                              } else {
                                setLeadingTeam(null);
                              }
                            } else {
                              setBidHistory([]);
                              setLeadingTeam(null);
                            }
                          } catch (e) {
                            console.error("Failed to parse saved history", e);
                            setBidHistory([]);
                            setLeadingTeam(null);
                          }
                        } else {
                          // Fetch fresh data from API for this player
                          if (p.tournamentPlayerId) {
                            try {
                              const res = await getAuctionRoom(tournamentId, p.tournamentPlayerId);
                              if (res.data.biddingHistory && res.data.biddingHistory.length > 0) {
                                const apiHistory: BidHistoryItem[] = res.data.biddingHistory.map((bh: any) => ({
                                  teamCode: bh.teamId?.shortCode || "N/A",
                                  amount: bh.bidAmount,
                                  timestamp: new Date(bh.createdAt).getTime()
                                }));
                                setBidHistory(apiHistory);
                                const latestBid = apiHistory[0];
                                const leadingTeamFromHistory = teams.find(t => t.shortCode === latestBid.teamCode);
                                if (leadingTeamFromHistory) {
                                  setLeadingTeam(leadingTeamFromHistory);
                                } else {
                                  setLeadingTeam(null);
                                }
                                // Save to sessionStorage
                                sessionStorage.setItem(historyKey, JSON.stringify(apiHistory));
                              } else {
                                setBidHistory([]);
                                setLeadingTeam(null);
                              }
                            } catch (error) {
                              console.error("Failed to fetch bid history", error);
                              setBidHistory([]);
                              setLeadingTeam(null);
                            }
                          } else {
                            setBidHistory([]);
                            setLeadingTeam(null);
                          }
                        }
                      }
                      
                      setCountdown(null);
                      stopCountdown();
                    }
                  }} 
                  className={`w-full p-2.5 rounded-2xl text-left border transition-all ${p.status === "sold" ? "cursor-not-allowed opacity-30" : "cursor-pointer"} ${activePlayer?.id === p.id ? "bg-amber-600/20 border-amber-500/50 shadow-lg" : "bg-white/5 border-transparent opacity-40 hover:opacity-100"}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black text-[10px] uppercase italic truncate">{p.fullName}</p>
                    {p.status === "sold" && (
                      <span className="text-[8px] font-black text-red-500 uppercase ml-2 shrink-0">SOLD</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-7 flex flex-col gap-4 min-h-0">
          <div className="bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-3xl rounded-[2.5rem] p-6 flex gap-8 border border-white/10 items-center shrink-0 min-h-[250px] relative overflow-hidden group">
            <div className="w-40 h-56 bg-black/40 rounded-[2rem] border border-white/5 shrink-0 flex items-center justify-center relative overflow-hidden shadow-2xl ring-1 ring-white/10">
              {activePlayer?.image ? (
                <img src={activePlayer.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              ) : (
                <span className="text-white/[0.03] font-black text-[10rem] italic absolute -bottom-6">?</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3 animate-pulse">{activeCategory} Pool</span>
              <h1 className="text-5xl font-black tracking-tighter leading-none uppercase italic text-white mb-4 drop-shadow-xl truncate min-h-[1.1em]">
                {activePlayer ? activePlayer.fullName : "SELECT PLAYER"}
              </h1>
              <p className="text-xl text-white/30 font-medium uppercase tracking-[0.4em] italic truncate">{activePlayer?.role ?? "---"}</p>
              <div className="mt-6 space-y-2">
                <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest italic leading-none uppercase">Base Valuation: <span className="text-white ml-2 not-italic text-lg font-black">{activePlayer ? formatRupees(activePlayer.basePrice) : "-"}</span></p>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest italic leading-none uppercase">Bid Increment: </p>
                  {isEditingBiddingPrice && activePlayer ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editingBiddingPrice}
                        onChange={(e) => setEditingBiddingPrice(Number(e.target.value))}
                        className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                        min="1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Save button clicked", { 
                            tournamentPlayerId: activePlayer?.tournamentPlayerId, 
                            biddingPrice: editingBiddingPrice 
                          });
                          
                          if (!activePlayer?.tournamentPlayerId) {
                            toast.error("Player ID missing");
                            return;
                          }
                          if (editingBiddingPrice <= 0) {
                            toast.error("Bidding price must be greater than 0");
                            return;
                          }
                          try {
                            console.log("Calling API...");
                            const response = await updateBiddingPriceRequest({
                              tournamentPlayerId: activePlayer.tournamentPlayerId,
                              biddingPrice: editingBiddingPrice,
                            });
                            console.log("API response:", response);
                            
                            // Update local state
                            setActivePlayer({
                              ...activePlayer,
                              biddingPrice: editingBiddingPrice,
                            });
                            // Update in playersByCategory
                            setPlayersByCategory(prev => {
                              const updated = { ...prev };
                              Object.keys(updated).forEach(role => {
                                updated[role] = updated[role].map(p =>
                                  p.id === activePlayer.id
                                    ? { ...p, biddingPrice: editingBiddingPrice }
                                    : p
                                );
                              });
                              return updated;
                            });
                            setIsEditingBiddingPrice(false);
                            toast.success("Bidding price updated");
                          } catch (error: any) {
                            console.error("Error updating bidding price:", error);
                            toast.error(error?.response?.data?.message || error?.message || "Failed to update bidding price");
                          }
                        }}
                        className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-500 transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsEditingBiddingPrice(false);
                          setEditingBiddingPrice(activePlayer?.biddingPrice || 0);
                        }}
                        className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-white ml-2 not-italic text-lg font-black">{activePlayer ? formatRupees(activePlayer.biddingPrice) : "-"}</span>
                      {activePlayer && activePlayer.status !== "sold" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Edit button clicked", activePlayer.biddingPrice);
                            setEditingBiddingPrice(activePlayer.biddingPrice);
                            setIsEditingBiddingPrice(true);
                          }}
                          className="ml-2 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          title="Edit bidding price"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-500 rounded-3xl p-5 flex items-center justify-between border backdrop-blur-3xl shadow-xl shrink-0 ${leadingTeam ? "bg-amber-600/10 border-amber-500/40 scale-[1.01]" : "bg-white/[0.02] border-white/5 opacity-50"}`}>
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-2xl text-amber-400 border border-white/10 shadow-inner">{leadingTeam ? leadingTeam.shortCode[0] : "!"}</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60 mb-1 italic">Current Leader</p>
                <p className="text-3xl font-black uppercase tracking-tighter text-white italic leading-none">{leadingTeam ? leadingTeam.shortCode : "Awaiting First Bid"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60 mb-1 italic">Live Price</p>
              <p className="text-4xl font-black italic text-white leading-none tracking-tighter tabular-nums underline decoration-amber-500/50 underline-offset-8 decoration-4">{formatRupees(currentBid)}</p>
            </div>
          </div>

          <div className="flex gap-2 relative z-50 overflow-hidden shrink-0">
            {teams.map(team => {
              const isActive = leadingTeam?.id === team.id;
              const isLastBidder = lastBiddingTeamId === team.id;
              const isDisabled = isLastBidder && !isActive;
              return (
                <button
                  key={team.id}
                  onClick={() => {
                    if (isDisabled) {
                      toast.error("You cannot bid again. Another team must bid first.", {
                        icon: "⚠️",
                        duration: 3000
                      });
                      return;
                    }
                    handleBid(team);
                  }}
                  disabled={isDisabled}
                  className={`flex-1 min-w-0 p-3 rounded-xl border transition-all active:scale-95 text-left group
                    ${isDisabled
                      ? "bg-white/[0.01] border-white/5 opacity-30 cursor-not-allowed"
                      : isActive
                      ? "bg-white text-black border-white shadow-xl translate-y-[-2px] cursor-pointer"
                      : "bg-white/[0.03] border-white/5 hover:bg-white hover:text-black hover:border-white hover:translate-y-[-4px] hover:shadow-[0_10px_20px_rgba(255,255,255,0.15)] cursor-pointer"
                    }`}
                >
                  <p className={`text-lg font-black italic tracking-tighter uppercase leading-none mb-2 transition-colors ${isActive ? "text-black" : "text-white group-hover:text-black"}`}>{team.shortCode}</p>
                  <div className={`w-8 h-[2px] mb-3 rounded-full transition-all duration-700 ease-out ${isActive ? "bg-amber-600 w-full" : "bg-white/10 group-hover:bg-amber-600 group-hover:w-full"}`} />
                  <div className={`border rounded-lg px-2.5 py-1.5 flex flex-col shadow-inner transition-colors ${isActive ? "bg-black/10 border-amber-600/40" : "bg-black/40 border-white/5 group-hover:bg-black/10 group-hover:border-amber-600/40"}`}>
                    <p className={`text-[7px] font-black uppercase tracking-widest ${isActive ? "text-amber-600" : "text-amber-500/60 group-hover:text-amber-600"}`}>Purse</p>
                    <p className={`text-xs font-black tabular-nums tracking-tighter ${isActive ? "text-amber-600" : "text-amber-500 group-hover:text-amber-600"}`}>{formatRupees(team.remainingPurse)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 pt-2 pb-2 shrink-0 relative z-10">
            <button onClick={() => setActivePlayer(null)} className="flex-1 bg-white/[0.03] border border-white/10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all text-white/30 hover:text-red-500 cursor-pointer active:scale-95">Skip</button>
            <button
              onClick={handleHammerDownClick}
              className={`flex-[3.5] bg-gradient-to-r from-amber-600 to-amber-400 py-4 rounded-2xl font-black text-xl uppercase tracking-[0.4em] shadow-2xl shadow-amber-900/40 transition-all hover:brightness-110 active:scale-95 text-white cursor-pointer relative overflow-hidden`}
            >
              🔨 Hammer Down {countdown !== null && <span className="ml-4 opacity-50 italic">({countdown}s)</span>}
            </button>
          </div>
        </div>

        <div className="col-span-3 flex flex-col min-h-0 relative z-10 shrink-0">
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-4 border border-white/10 flex flex-col min-h-0 flex-grow shadow-2xl overflow-hidden">
            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-4 border border-white/5 relative shrink-0">
              <button onClick={() => setRightPanelTab("bids")} className={`relative z-10 flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${rightPanelTab === "bids" ? "text-white" : "text-white/30"}`}>Live Bids</button>
              <button onClick={() => setRightPanelTab("sold")} className={`relative z-10 flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${rightPanelTab === "sold" ? "text-white" : "text-white/30"}`}>Sold Records</button>
              <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-4px)] bg-amber-600 rounded-xl transition-all duration-300 ease-out ${rightPanelTab === "sold" ? "translate-x-[calc(100%+0px)]" : "translate-x-0"}`} />
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-grow">
              {rightPanelTab === "bids" ? (
                bidHistory.length > 0 ? (
                  bidHistory.map((b, i) => (
                    <div key={b.timestamp} className={`p-3 rounded-xl border flex justify-between items-center animate-in slide-in-from-right duration-500 ${i === 0 ? "bg-white/5 border-white/10 shadow-lg shadow-amber-900/10 ring-1 ring-amber-500/20" : "bg-transparent border-white/5 opacity-50"}`}>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-black italic text-white uppercase leading-none mb-1 truncate">{b.teamCode}</p>
                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-tighter italic">Bid Recorded</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className={`text-base font-black italic tabular-nums ${i === 0 ? "text-amber-400" : "text-white"}`}>{formatRupees(b.amount)}</p>
                        {i === 0 && b.bidHistoryId && (
                          <button
                            onClick={() => handleRevertBid(b, i)}
                            className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded text-[8px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            title="Revert this bid"
                          >
                            ↶
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/30 text-sm italic">No bids yet</div>
                )
              ) : (
                soldPlayers.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent relative mb-2 animate-in slide-in-from-bottom-2 duration-500 hover:border-emerald-500/30 transition-all group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-full bg-white/[0.02] -skew-x-12 translate-x-10 pointer-events-none" />
                    <div className="relative z-10 flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[7px] font-black uppercase tracking-widest border border-emerald-500/30">Contract Finalized</span>
                      <p className="text-xs font-black text-emerald-400 tabular-nums italic">{formatRupees(p.amount)}</p>
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-white uppercase truncate mb-1 leading-tight group-hover:text-amber-400 transition-colors italic">{p.fullName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="px-2 py-1 rounded bg-black/40 border border-white/5 flex items-center justify-center">
                          <p className="text-[9px] font-black text-amber-500 uppercase tracking-tighter italic leading-none">{p.soldToCode}</p>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[7px] font-bold text-white/40 uppercase truncate leading-none mb-0.5">{p.soldToName}</p>
                          <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest leading-none italic">{p.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
      `}</style>
    </div>
  );
}