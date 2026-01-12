export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060d1b]">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-2 text-white text-2xl font-bold">
          <span className="text-yellow-400">🏏</span>
          <span>CricAuction</span>
        </div>

        <div className="relative">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 bg-yellow-400 rounded-full opacity-30 animate-ping"></div>
        </div>

        <p className="text-gray-400 text-sm tracking-widest animate-pulse">
          LOADING AUCTION...
        </p>
      </div>
    </div>
  );
}
