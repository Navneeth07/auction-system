"use client";

import { useRouter } from "next/navigation";
import { Zap, Users, ShieldCheck, Hammer } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Zap size={24} />,
      title: "Real-time Sync",
      desc: "Sub-millisecond bid synchronization."
    },
    {
      icon: <Users size={24} />,
      title: "Multi-Franchise",
      desc: "Manage up to 20 teams simultaneously."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Auto-Validation",
      desc: "Smart rules for purse and squad limits."
    }
  ];

  return (
    <section className="relative w-full h-screen flex flex-col items-center bg-[#020408] text-white overflow-hidden font-sans">

      <div
        className="absolute inset-0 opacity-30 grayscale pointer-events-none"
        style={{
          backgroundImage: "url('/background.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#020408]/90 to-[#020408]" />
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center h-full px-6 py-12 justify-between">

        <div className="flex flex-col items-center text-center space-y-6 mt-30">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/[0.03] border border-white/10 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500 italic">
              #1 Platform for Sports Auctions
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] animate-in slide-in-from-bottom-4 duration-700">
            Manage Your <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-100 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              Elite Dream Team
            </span> <br />
            Auction 2026
          </h1>

          <p className="max-w-xl mx-auto text-white/40 text-sm md:text-base font-medium leading-relaxed italic animate-in slide-in-from-bottom-8 duration-1000">
            Professional IPL-style auctioning. Zero-latency bidding, intelligent budget
            tracking, and professional squad validation.
          </p>

          <div className="pt-4 flex flex-col md:flex-row items-center gap-4">
            <button
              className="cursor-pointer group relative px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl overflow-hidden transition-all hover:bg-amber-500 active:scale-95 shadow-xl shadow-amber-900/20"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </button>


          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-900/10"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2 group-hover:text-amber-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/30 text-xs font-medium leading-relaxed italic">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 opacity-20 hover:opacity-50 transition-opacity">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Hammer className="text-black" size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black italic tracking-tighter uppercase">
            Cric<span className="text-amber-500">Auction</span>
          </span>
        </div>

      </div>
    </section>
  );
}