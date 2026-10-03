import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Jadwale — Generator & Pembuat Jadwal Pelajaran Sekolah Otomatis",
    template: "%s | Jadwale",
  },
  description: "Aplikasi pembuat dan penyusun jadwal pelajaran SD/SMP otomatis tanpa bentrok berbasis AI Constraint Satisfaction Problem (CSP). Solusi cepat, rapi, dan responsif.",
  keywords: ["Jadwale", "Jadwal Pelajaran Otomatis", "Generator Jadwal SD", "Aplikasi Sekolah", "Jadwal Pelajaran SD", "CSP Scheduler"],
  authors: [{ name: "Jadwale Team" }],
  icons: {
    icon: [
      { url: '/logo-dark.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
      { url: '/logo-light.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
    ],
    shortcut: [
      { url: '/logo-dark.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
      { url: '/logo-light.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
    ],
    apple: [
      { url: '/logo-dark.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
      { url: '/logo-light.png', media: '(prefers-color-scheme: light)', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Jadwale — Generator & Pembuat Jadwal Pelajaran Sekolah Otomatis",
    description: "Buat dan kelola jadwal pelajaran sekolah tanpa bentrok dalam hitungan detik.",
    type: "website",
    locale: "id_ID",
  },
};

import { ThemeProvider } from "../components/ThemeProvider";
import Navigation from "../components/Navigation";
import BottomNav from "../components/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="font-sans min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <Navigation>
            {children}
          </Navigation>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
