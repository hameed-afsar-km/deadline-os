import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeWrapper } from "@/components/ThemeWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DeadlineOS | Liquid Glass",
  description: "A professional platform for managing critical deadlines and tasks with a modern glass interface.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen text-white bg-black selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
        <AuthProvider>
          <ThemeWrapper>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(24, 24, 27, 0.7)',
                  backdropFilter: 'blur(20px)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                  borderRadius: '16px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#000' }
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#000' }
                }
              }}
            />
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
