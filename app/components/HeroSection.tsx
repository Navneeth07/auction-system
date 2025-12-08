"use client";

import FeatureCard from "./FeatureCard";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center text-white"
      style={{
        backgroundImage: "url('/background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="max-w-4xl text-center px-6 pt-24">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-1 rounded-full text-sm font-medium mb-6">
            <span>🏆</span>
            #1 Platform for Sports Auctions
          </div>

          <h1 className="text-6xl md:text-6xl font-extrabold leading-tight">
            Manage Your <span className="text-yellow-400">Dream Team</span>{" "}
            Auction
          </h1>

          <p className="text-gray-300 mt-6 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Experience the thrill of a professional IPL-style auction. Manage
            teams, budgets, and players in real-time with our cutting-edge
            platform.
          </p>

          <div className="mt-10 flex justify-center gap-6">
            <button
              className="bg-yellow-400 text-black px-6 md:px-8 py-3 md:py-3.5 rounded-md font-semibold shadow hover:bg-yellow-500 transition"
              onClick={() => router.push("/signup")}
            >
              Start Free Trial
            </button>

            <button className="border border-white px-6 md:px-8 py-3 md:py-3.5 rounded-md font-semibold hover:bg-white hover:text-black transition">
              View Demo
            </button>
          </div>
        </div>

        <div className="relative z-10 w-full mt-16 px-6 pb-16">
          <FeatureCard />
        </div>
      </div>
    </section>
  );
}
