"use client";
import { useRouter } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { registerUser } from "../lib/api/api";
import { useState } from "react";
import Loading from "../components/Loading";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

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

  //hook use
  const { request, loading, error } = useApi(registerUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    setFormErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "fullName") {
        newErrors.fullName =
          value.trim().length < 2
            ? "Full name must be at least 2 characters"
            : "";
      }

      if (name === "email") {
        newErrors.email = !/^\S+@\S+\.\S+$/.test(value)
          ? "Enter a valid email address"
          : "";
      }

      if (name === "password") {
        newErrors.password =
          value.length < 8 ? "Password must be at least 6 characters" : "";
      }

      return newErrors;
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, password } = form;
    const payload = { fullName, email, password };

    //error validations
    if (formErrors.fullName || formErrors.email || formErrors.password) {
      toast.error("Please fix the form errors");
      return;
    }

    if (!form.fullName || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await request(payload);
      if (res?.status === 201) {
        toast.success("Account created successfully 🎉");
        register(res?.user, res?.accessToken);
        localStorage.setItem("token", res?.accessToken);
        router.push("/setup-tournament");
      }
    } catch (err) {
      console.log("regeistration error", err);
      toast.error(error || "Registration failed, please try again later");
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

          <label className="text-gray-300 text-sm">Full Name</label>
          <input
            name="fullName"
            type="text"
            placeholder="John Doe"
            className="w-full mt-1 mb-4 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
            value={form.fullName}
            onChange={handleChange}
          />

          <label className="text-gray-300 text-sm">Email</label>
          <input
            name="email"
            type="email"
            placeholder="m@example.com"
            className="w-full mt-1 mb-4 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
            value={form.email}
            onChange={handleChange}
          />

          <label className="text-gray-300 text-sm">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 mb-6 px-4 py-3 rounded-md bg-[#0c1527] border border-[#1e2a40] text-white focus:border-yellow-400 focus:ring-0 outline-none"
            value={form.password}
            onChange={handleChange}
          />

          <button
            className="w-full bg-yellow-400 hover:bg-yellow-500 transition text-black font-semibold py-3 rounded-md"
            onClick={() => router.push("/setup-tournament")}
          >
            {loading ? "Creating..." : "Sign Up"}
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
