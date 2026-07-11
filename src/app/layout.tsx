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
      <body className="antialiased font-sans text-white bg-[#2EE56B] sm:bg-gray-100 flex items-start sm:items-center justify-center h-full w-full">
        <Providers>
          <div className="w-full h-full sm:h-[850px] sm:max-w-[400px] sm:rounded-[40px] sm:shadow-2xl relative flex flex-col overflow-hidden bg-[#2EE56B]">
            <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-24 flex flex-col">
              {children}
            </main>
            <Navigation />
          </div>
        </Providers>
      </body>
    </html>
  );
}
