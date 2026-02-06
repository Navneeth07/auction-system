"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { loginUser } from "../lib/api/api";
import { useState } from "react";
import Loading from "../components/Loading";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "/setup-tournament";
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
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

  //hook use
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
        toast.success("Logged In successfully 🎉");
        // Persist auth in store and localStorage
        login(res.user, res.accessToken);
        localStorage.setItem("token", res.accessToken);
        // Redirect to next or default path
        router.push(nextPath);
      } else {
        toast.error("Something went wrong, please try again later");
      }
    } catch (err) {
      console.log("login error", err);
      toast.error(error);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      {loading && <Loading />}
      <section className="min-h-screen w-full bg-[#060d1b] flex items-center justify-center px-4">
        <div className="bg-[#0f1b30] w-full max-w-md rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Create an account
          </h2>

          <p className="text-gray-400 text-sm mb-8">
            Enter your email below to create your organizer account
          </p>

          <label className="text-gray-300 text-sm">Email</label>
          <input
            name="email"
            type="email"
            placeholder="m@example.com"
            className="w-full mt-1 mb-4 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
            value={form.email}
            onChange={handleChange}
          />
          <div>
            {formErrors?.email && (
              <span className="mt-1 inline-block rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-400">
                {formErrors.email}
              </span>
            )}
          </div>

          <label className="text-gray-300 text-sm">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 mb-6 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
            value={form.password}
            onChange={handleChange}
          />
          <div>
            {formErrors?.password && (
              <span className="mt-1 inline-block rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-400">
                {formErrors.password}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={hasErrors || loading}
            className={`w-full py-3 rounded-md font-semibold transition-all duration-200
                ${
                  hasErrors || loading
                    ? "bg-yellow-400/40 text-black/50 cursor-not-allowed shadow-inner"
                    : "bg-yellow-400 hover:bg-yellow-500 text-black hover:shadow-lg hover:-translate-y-px-active:translate-y-0"
                }
              `}
          >
            {loading ? "Creating..." : "Login"}
          </button>

          <p className="text-center text-gray-400 text-sm mt-4">
            Dontt have an account ?{" "}
            <a href="/signup" className="text-yellow-400 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </section>
    </form>
  );
}
