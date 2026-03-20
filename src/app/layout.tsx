import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeWrapper } from "@/components/ThemeWrapper";

const fontSans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DeadlineOS — Momentum Intelligence",
  description: "High-octane deadline management for builders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="antialiased min-h-screen Selection:bg-purple-500/30 selection:text-white" style={{ background: '#020617' }}>
        <AuthProvider>
          <ThemeWrapper>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(15, 23, 42, 0.9)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  borderRadius: '12px',
                  // JetBrains Mono for a technical, high-performance feel
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: '600',
                  letterSpacing: '0.02em',
                },
                success: {
                  iconTheme: { primary: '#8B5CF6', secondary: '#fff' }
                },
                error: {
                  iconTheme: { primary: '#F43F5E', secondary: '#fff' }
                }
              }}
            />
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
