import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "VibeCodex App",
  description: "Generated with VibeCodex",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0a] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
