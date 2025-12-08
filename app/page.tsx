import HeroSection from "./components/HeroSection";

export default function Page() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0A0F1C]">
      <div className="flex-1 overflow-hidden">
        <HeroSection />
      </div>
    </div>
  );
}
