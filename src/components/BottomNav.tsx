"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, ArrowRightLeft, Clock, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home },
    { href: "/history", icon: FileText },
    { href: "/swap", icon: ArrowRightLeft },
    { href: "/activity", icon: Clock },
    { href: "/profile", icon: User },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black rounded-[32px] px-4 py-2 flex items-center justify-between w-[90%] shadow-2xl z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex items-center justify-center w-12 h-12 transition-all"
          >
            {isActive && (
              <div className="absolute inset-0 bg-[#C9FF22] rounded-full scale-90" />
            )}
            <Icon
              className={`w-5 h-5 relative z-10 transition-colors ${
                isActive ? "text-black" : "text-gray-400 hover:text-gray-200"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
