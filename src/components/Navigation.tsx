"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowRightLeft, LayoutDashboard } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: LayoutDashboard },
    { href: "/swap", icon: ArrowRightLeft },
    { href: "/history", icon: Activity },
  ];

  return (
    <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] bg-[#2EE56B] rounded-[30px] px-3 py-2 flex justify-around items-center z-50 shadow-lg border-4 border-[#0E291A]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isActive ? "bg-white shadow-md scale-110" : "bg-white/80 hover:bg-white"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-[#0E291A]" : "text-[#0E291A]/70"}`} strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}
