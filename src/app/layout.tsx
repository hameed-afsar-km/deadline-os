import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeWrapper } from "@/components/ThemeWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ['300','400','500','600','700','800'],
  style: ['normal','italic'],
});

export const metadata: Metadata = {
  title: "DeadlineOS — Stay on top of what matters",
  description: "A warm, focused deadline tracker that helps you stay ahead — smart priorities, live countdowns, and real-time sync across all your devices.",
  keywords: "deadline management, task tracker, productivity, focus",
  openGraph: {
    title: "DeadlineOS",
    description: "Stay on top of what matters most.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable} style={{ background: '#0C0A09' }}>
      <body className="antialiased" style={{ background: '#0C0A09', color: '#D6C9B0' }}>
        <AuthProvider>
          <ThemeWrapper>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1E1A17',
                  color: '#F5EDD6',
                  border: '1px solid rgba(255,200,120,0.15)',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                },
                success: {
                  iconTheme: { primary: '#34D399', secondary: '#1E1A17' },
                },
                error: {
                  iconTheme: { primary: '#FB7185', secondary: '#1E1A17' },
                },
              }}
            />
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
