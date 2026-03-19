import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeWrapper } from "@/components/ThemeWrapper";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ['300','400','500','600','700'],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ['400','500','600','700','800'],
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
    <html lang="en" className={`${spaceGrotesk.variable} ${syne.variable}`} style={{ background: '#F5F2EC' }}>
      <body className="antialiased" style={{ background: '#F5F2EC', color: '#0D0D0D' }}>
        <AuthProvider>
          <ThemeWrapper>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#FFFFFF',
                  color: '#0D0D0D',
                  border: '2px solid #0D0D0D',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '4px 4px 0 #0D0D0D',
                },
                success: {
                  iconTheme: { primary: '#00C896', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#FF5533', secondary: '#fff' },
                },
              }}
            />
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
