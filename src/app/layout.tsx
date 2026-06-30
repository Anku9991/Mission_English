import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Mission English — Master English with Confidence",
  description: "Premium Computer Based Testing platform for English language mastery. Practice SSC CGL, NDA, CDS with real exam-style CBTs.",
  keywords: "Mission English, CBT, English test, SSC CGL, NDA, computer based test",
  openGraph: {
    title: "Mission English CBT Platform",
    description: "Advanced Computer Based Testing for English mastery",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    apple: "/logo.jpeg",
  }
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
