"use client";

import { useRouter } from "next/navigation";

type Props = {
  brand: string;
  links: { label: string; href: string }[];
  loginText: string;
};

export default function Header({ brand, links, loginText }: Props) {
  const router = useRouter();

  return (
    <header className="w-full bg-[#000814] text-white py-4 shadow-md">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-yellow-400 text-xl">🏏</span>
          <span className="text-xl font-semibold tracking-wide">{brand}</span>
        </div>

        <nav className="flex items-center gap-8">
          {links.map((link, index) => (
            <button
              key={index}
              onClick={() => router.push(link.href)}
              className="text-base hover:text-yellow-400 transition font-medium"
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-400 text-black px-5 py-2 rounded-md font-semibold shadow hover:bg-yellow-500 transition"
          >
            {loginText}
          </button>
        </nav>
      </div>
    </header>
  );
}
