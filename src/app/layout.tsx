import type { Metadata } from "next";
import { Inter, DM_Serif_Display, DM_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeWrapper } from "@/components/ThemeWrapper";

const inter = Inter({ subsets:["latin"], variable:"--font-sans", weight:['400','500','600','700'] });
const dmSerif = DM_Serif_Display({ subsets:["latin"], variable:"--font-serif", weight:'400', style:['normal','italic'] });
const dmMono  = DM_Mono({ subsets:["latin"], variable:"--font-mono", weight:['400','500'] });

export const metadata: Metadata = {
  title: "DeadlineOS — Deadline Intelligence",
  description: "Intelligent deadline management engineered for high-performance teams and individuals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable} ${dmMono.variable}`}
      style={{ background: '#EDE8DE', colorScheme: 'light' }}>
      <body className="antialiased" style={{ background: '#EDE8DE', color: '#17140C', WebkitFontSmoothing: 'antialiased' }}>
        <AuthProvider>
          <ThemeWrapper>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#FAF8F4',
                  color: '#17140C',
                  border: '1.5px solid #E0DDD8',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '600',
                  boxShadow: '0 8px 28px rgba(23,20,12,0.12)',
                },
                success: { iconTheme: { primary: '#1A6635', secondary: '#FAF8F4' } },
                error:   { iconTheme: { primary: '#C8220A', secondary: '#FAF8F4' } },
              }}
            />
          </ThemeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
