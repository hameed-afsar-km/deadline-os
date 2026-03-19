import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DeadlineOS — Smart Deadline Management",
  description:
    "Track deadlines, hackathons, exams, and personal events with AI-powered prioritization and real-time sync across all your devices.",
  keywords: "deadline management, task tracker, hackathon, exam, productivity",
  openGraph: {
    title: "DeadlineOS",
    description: "Smart deadline and event management system",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#f0f0ff",
                border: "1px solid #2a2a3d",
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#6366f1",
                  secondary: "#fff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
