"use client";
import { useRouter } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { registerUser } from "../lib/api/api";
import { useState } from "react";
import Loading from "../components/Loading";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { User, Mail, Lock, Loader2, ChevronRight } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const hasErrors =
    !!formErrors.fullName ||
    !!formErrors.email ||
    !!formErrors.password ||
    !form.fullName ||
    !form.email ||
    !form.password;
  const { register } = useAuthStore();

  const { request, loading, error } = useApi(registerUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    setFormErrors((prev) => {
      const newErrors = { ...prev };
      if (name === "fullName") {
        newErrors.fullName =
          value.trim().length < 3
            ? "Full name must be at least 3 characters"
            : "";
      }
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
    const { fullName, email, password } = form;
    const payload = { fullName, email, password };

    try {
      const res = await request(payload);
      if (res?.status === 201) {
        toast.success("Account created successfully 🎉");
        register(res?.user, res?.accessToken);
        localStorage.setItem("token", res?.accessToken);
        router.push("/setup-tournament");
      }
    } catch (err) {
      toast.error(error || "Registration failed");
    }
  };

  return (
    <main className="h-screen bg-[#020408] text-white flex overflow-hidden font-sans relative">
      {loading && <Loading />}

      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <section className="hidden lg:flex flex-1 flex-col justify-center px-20 relative z-10 border-r border-white/5 bg-white/[0.01]">
        <div className="bg-amber-600/20 border border-amber-600/40 text-amber-500 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] w-fit mb-8 shadow-2xl">
          Organizer Portal
        </div>
        <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.85] mb-6">
          Start Your <br />
          <span className="text-amber-500">Legacy</span> <span className="text-white/20 font-light italic">2026</span>
        </h1>
        <p className="text-white/40 max-w-md text-lg font-medium leading-relaxed italic">
          Join the most advanced cricket auction platform. Create your account to manage franchises, players, and live bidding sessions.
        </p>
      </section>

      <section className="flex-[0.8] flex flex-col justify-center items-center px-6 relative z-20 backdrop-blur-3xl">
        <form onSubmit={handleSignup} className="w-full max-w-md">
          <header className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-3">
              Create <span className="text-amber-500">Account</span>
            </h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
              Enter details to initialize organizer credentials
            </p>
          </header>

          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-1 italic group-focus-within:text-amber-500 transition-colors">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                  name="fullName"
                  type="text"
                  placeholder="e.g. John Wick"
                  className="w-full bg-white/[0.04] pl-14 pr-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              {formErrors.fullName && (
                <span className="mt-2 inline-block text-[10px] font-black uppercase text-red-500 italic tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">
                  {formErrors.fullName}
                </span>
              )}
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-1 italic group-focus-within:text-amber-500 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  className="w-full bg-white/[0.04] pl-14 pr-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {formErrors.email && (
                <span className="mt-2 inline-block text-[10px] font-black uppercase text-red-500 italic tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">
                  {formErrors.email}
                </span>
              )}
            </div>

            <div className="group">
              <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-1 italic group-focus-within:text-amber-500 transition-colors">
                Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.04] pl-14 pr-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              {formErrors.password && (
                <span className="mt-2 inline-block text-[10px] font-black uppercase text-red-500 italic tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">
                  {formErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={hasErrors || loading}
              className={`cursor-pointer w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-2xl mt-4
                ${hasErrors || loading
                  ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-amber-900/40 hover:brightness-110"
                }
              `}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Establish Access <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>

          <footer className="text-center mt-10">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
              Already authenticated?{" "}
              <a href="/login" className="text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-amber-500/20 cursor-pointer">
                Login here
              </a>
            </p>
          </footer>
        </form>
      </section>
    </main>
  );
}