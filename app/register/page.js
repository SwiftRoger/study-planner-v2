"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.message); return; }
    router.push("/onboarding");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #a8edea 0%, #4F8CFF 50%, #667eea 100%)" }}>

      {/* Decorative vector shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left circle */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full border-4 border-white/10" />
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full border-4 border-white/10" />
        {/* Bottom right circle */}
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full border-4 border-white/10" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full border-4 border-white/10" />
        {/* Floating dots */}
        <div className="absolute top-1/4 left-10 w-3 h-3 rounded-full bg-white/20" />
        <div className="absolute top-1/3 left-20 w-2 h-2 rounded-full bg-white/20" />
        <div className="absolute top-2/3 right-10 w-3 h-3 rounded-full bg-white/20" />
        <div className="absolute top-3/4 right-24 w-2 h-2 rounded-full bg-white/20" />
        <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-white/10" />
        {/* Glowing blobs */}
        <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
      </div>

      <div className="w-full max-w-md relative"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(60px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg"
            style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) rotate(5deg)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) rotate(0)"; e.currentTarget.style.boxShadow = ""; }}>
            <img src="/num-logo.png" alt="NUM Logo" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">AI-Based Study Planner</h1>
          <p className="text-white/70 text-sm mt-1">National University of Management</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8"
          style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 25px 50px rgba(0,0,0,0.15)"; }}>

          <h2 className="text-2xl font-bold text-slate-800">Create Account 🎓</h2>
          <p className="text-slate-400 text-sm mt-1">Start planning your study journey</p>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-500 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Full Name</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent bg-slate-50 focus:bg-white"
                style={{ transition: "all 0.2s ease" }}
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Email</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent bg-slate-50 focus:bg-white"
                style={{ transition: "all 0.2s ease" }}
                placeholder="Enter your email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">Password</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:border-transparent bg-slate-50 focus:bg-white"
                style={{ transition: "all 0.2s ease" }}
                placeholder="Create a password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white rounded-xl py-3 font-medium mt-2 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #a8edea 0%, #4F8CFF 100%)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 15px rgba(79, 140, 255, 0.4)"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(79, 140, 255, 0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(79, 140, 255, 0.4)"; }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-slate-400 mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4F8CFF] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/60 mt-6">
          Group 13 · Faculty of Information Technology · NUM
        </p>
      </div>
    </main>
  );
}