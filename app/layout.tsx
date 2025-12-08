import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

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
            { label: "Host Auction", href: "/host" },
          ]}
          loginText="Login"
        />

        {children}
      </body>
    </html>
  );
}
