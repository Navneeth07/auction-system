"use client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/setup-tournament");
  };
  return (
    <form onSubmit={handleSignup}>
      <section className="min-h-screen w-full bg-[#060d1b] flex items-center justify-center px-4">
        <div className="bg-[#0f1b30] w-full max-w-md rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Create an account
          </h2>

          <p className="text-gray-400 text-sm mb-8">
            Enter your email below to create your organizer account
          </p>

          <label className="text-gray-300 text-sm">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full mt-1 mb-4 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
          />

          <label className="text-gray-300 text-sm">Email</label>
          <input
            type="email"
            placeholder="m@example.com"
            className="w-full mt-1 mb-4 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
          />

          <label className="text-gray-300 text-sm">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 mb-6 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
          />

          <button
            className="w-full bg-yellow-400 hover:bg-yellow-500 transition text-black font-semibold py-3 rounded-md"
            onClick={() => router.push("/setup-tournament")}
          >
            Sign Up
          </button>

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-yellow-400 hover:underline">
              Login
            </a>
          </p>
        </div>
      </section>
    </form>
  );
}
