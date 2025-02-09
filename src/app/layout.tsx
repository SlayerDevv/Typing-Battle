import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Typing Speed Battle",
  description:
    "Challenge your friends or test your speed in this real-time typing battle! Compete in multiplayer mode with live stats or play solo, customize phrase length, and track high scores on the leaderboard.",
  openGraph: {
    title: "Typing Speed Battle",
    description:
      "Challenge your friends or test your speed in this real-time typing battle! Compete in multiplayer mode with live stats or play solo, customize phrase length, and track high scores on the leaderboard.",
    url: "https://typing-battle-six.vercel.app/",
    siteName: "Typing Speed Battle",
    images: [
      {
        url: "https://typing-battle-six.vercel.app/assets/Screenshot 2025-02-09 185259.png", // Use your public image path
        width: 1200,
        height: 630,
        alt: "Typing Battle Preview",
      },
    ],
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
