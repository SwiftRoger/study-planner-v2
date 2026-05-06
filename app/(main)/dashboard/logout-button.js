"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-sm transition-colors"
    >
      Logout
    </button>
  );
}