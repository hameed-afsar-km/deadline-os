import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeadlineOS — Smart Deadline Manager",
  description: "Manage, track, and complete your deadlines with a premium glass interface powered by AI-based priority.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen overflow-x-hidden">
        {/* Aurora background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-[30%] -left-[15%] w-[65%] h-[65%] rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 65%)' }} />
          <div className="absolute top-[15%] -right-[15%] w-[55%] h-[70%] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #0EA5E9 0%, transparent 65%)' }} />
          <div className="absolute -bottom-[25%] left-[25%] w-[60%] h-[50%] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              gutter={10}
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#16161F',
                  color: '#F1F0FB',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '14px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)',
                },
                success: { iconTheme: { primary: '#10B981', secondary: '#0A0A0F' } },
                error:   { iconTheme: { primary: '#F43F5E', secondary: '#0A0A0F' } },
              }}
            />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
