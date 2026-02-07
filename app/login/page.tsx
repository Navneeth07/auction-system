"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { loginUser } from "../lib/api/api";
import { useState } from "react";
import Loading from "../components/Loading";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "/setup-tournament";
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });
  const hasErrors =
    !!formErrors.email ||
    !!formErrors.password ||
    !form.email ||
    !form.password;

  const { request, loading, error } = useApi(loginUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (name === "email") {
        newErrors.email = !/^\S+@\S+\.\S+$/.test(value)
          ? "Enter a valid email address"
          : "";
      }
      if (name === "password") {
        newErrors.password =
          value.length < 8 ? "Password must be at least 8 characters" : "";
      }
      return newErrors;
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = form;
    const payload = { email, password };

    try {
      const res = await request(payload);
      if (res?.status === 200) {
        toast.success("Access Granted 🎉");
        login(res.user, res.accessToken);
        localStorage.setItem("token", res.accessToken);
        router.push(nextPath);
      } else {
        toast.error("Something went wrong, please try again later");
      }
    } catch (err) {
      toast.error(error);
    }
  };

  return (
    <main className="h-screen w-full bg-[#020408] flex overflow-hidden font-sans">
      {loading && <Loading />}
      
      {/* LEFT SIDE: Cinematic Feature Stage (Dark Theme) */}
      <section className="hidden lg:flex flex-[0.6] bg-[#020408] border-r border-white/5 relative items-center justify-center p-20 overflow-hidden">
        {/* Atmospheric Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-xl">
          <div className="bg-amber-600/20 border border-amber-500/40 text-amber-500 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.4em] mb-8 inline-block shadow-2xl">
            Broadcasting 2026
          </div>
          <h1 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.85] mb-8">
            Manage <br />
            <span className="text-amber-500 underline decoration-white/10 underline-offset-8">Your Own</span> <br />
            Auction.
          </h1>
          <p className="text-white/40 text-lg font-medium leading-relaxed italic">
            Professional grade auction management system for elite tournaments. <br />
            Real-time bidding, live ledger, and cinematic broadcast UI.
          </p>
        </div>

        {/* Decorative Lines */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-transparent opacity-20" />
      </section>

      {/* RIGHT SIDE: Studio Login Desk (Dark Theme) */}
      <section className="flex-grow lg:flex-[0.4] flex items-center justify-center p-8 bg-[#020408] relative">
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-10 duration-700 relative z-10">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
              Organizer <span className="text-amber-500">Login</span>
            </h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] italic">
              Enter secure credentials to access console
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="group">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-3 ml-2 italic">
                Corporate Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="m@example.com"
                className={`w-full bg-white/[0.03] px-6 py-4 rounded-2xl border transition-all outline-none text-sm font-bold text-white focus:bg-white/[0.06]
                  ${formErrors.email ? "border-red-500/50" : "border-white/5 focus:border-amber-500/50"}
                `}
                value={form.email}
                onChange={handleChange}
              />
              {formErrors.email && (
                <span className="mt-2 inline-block text-[10px] font-black text-red-500 uppercase tracking-tight ml-2 italic">
                  {formErrors.email}
                </span>
              )}
            </div>

            <div className="group">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-3 ml-2 italic">
                Secure Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full bg-white/[0.03] px-6 py-4 pr-12 rounded-2xl border transition-all outline-none text-sm font-bold text-white focus:bg-white/[0.06]
                    ${formErrors.password ? "border-red-500/50" : "border-white/5 focus:border-amber-500/50"}
                  `}
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <span className="mt-2 inline-block text-[10px] font-black text-red-500 uppercase tracking-tight ml-2 italic">
                  {formErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={hasErrors || loading}
              className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer
                ${
                  hasErrors || loading
                    ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                    : "bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-amber-900/40 hover:brightness-110"
                }
              `}
            >
              {loading ? "Verifying..." : "Enter Console 🔨"}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              New Organizer?{" "}
              <a href="/signup" className="text-amber-500 hover:text-amber-400 transition-colors ml-2 underline underline-offset-4 decoration-amber-500/30">
                Register Tournament
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}