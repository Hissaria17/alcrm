import type { Metadata } from "next";
import "./globals.css";
import { SupabaseProvider } from "@/contexts/SupabaseProvider";
import { Toaster } from "@/components/ui/sonner";
import { geist } from '@/utils/fonts/font';

export const metadata: Metadata = {
  title: "ALCRM Admin Dashboard",
  description: "Professional admin dashboard for managing job postings and applications",
  keywords: ["admin", "dashboard", "ALCRM", "recruitment", "hr"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.className}>
      <body
        className="antialiased"
      >
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
