"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/tasks", label: "Tasks", icon: "📋" },
  { href: "/planner", label: "Study Planner", icon: "🤖" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/progress", label: "Progress", icon: "📊" },
  { href: "/reminders", label: "Reminders", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/timer", label: "Study Timer", icon: "⏱️" },
];

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => { if (data.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F0F4FF]">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col fixed h-full z-10">
        {/* Logo */}
<div className="p-6 border-b border-slate-100">
  <div className="flex items-center gap-2">
    <img src="/num-logo.png" alt="NUM Logo" className="w-10 h-10 object-contain" />
    <div>
      <p className="font-bold text-slate-800 text-sm">Study Planner</p>
      <p className="text-xs text-slate-400">AI-Based System</p>
    </div>
  </div>
</div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#4F8CFF] text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#EBF1FF] hover:text-[#4F8CFF]"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user info */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-[#4F8CFF] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user ? user.name[0].toUpperCase() : "S"}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-700 truncate">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user ? user.email : ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-6">
        {children}
      </main>
    </div>
  );
}