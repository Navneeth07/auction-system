import type { Metadata } from "next";
import { Toaster } from "react-hot-toast"
import "./globals.css";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

export const metadata: Metadata = {
  title: "CricAuction",
  description: "Sports Auction Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden flex flex-col bg-[#0A0F1C]">
        <Header
          brand="CricAuction"
          links={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
          ]}
          loginText="Login"
        />

        <ProtectedRoute>{children}</ProtectedRoute>
        <Toaster position="top-right" reverseOrder={false} />
      </body>
    </html>
  );
}
