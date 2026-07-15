import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Celo Agentic Hub",
  description: "MiniPay Agentic Remittance Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-white bg-[#2EE56B] sm:bg-gray-100 flex justify-center h-[100dvh] w-full">
        <Providers>
          <div className="w-full h-full max-w-md relative flex flex-col bg-[#2EE56B] sm:shadow-2xl overflow-hidden">
            <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 flex flex-col pb-6">
              {children}
            </main>
            <Navigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
