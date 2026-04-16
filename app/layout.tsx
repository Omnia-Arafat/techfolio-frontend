import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StarsBackground from "@/components/ui/StarsBackground";
import Navbar from "@/components/ui/Navbar";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechFolio — Ministry Tech Incubator Directory",
  description: "Discover and connect with tech startups sharing the same incubator.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`} data-theme="light">
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <StarsBackground />
            <Navbar />
            <main className="relative z-10">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
