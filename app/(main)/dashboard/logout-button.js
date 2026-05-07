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
      className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 text-sm font-medium transition-colors"
    >
      Logout
    </button>
  );
}