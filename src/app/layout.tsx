import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeWrapper } from "@/components/ThemeWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DeadlineOS | Intelligent Productivity",
  description: "A professional platform for managing critical deadlines and tasks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen text-slate-900 bg-slate-50 selection:bg-blue-500/20 selection:text-blue-900">
        <AuthProvider>
          <ThemeWrapper>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#ffffff',
                  color: '#0F172A',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#fff' }
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#fff' }
                }
              }}
            />
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
