"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const features = [
  { icon: "📋", title: "Task Management", desc: "Organize your study tasks with priorities and deadlines" },
  { icon: "🤖", title: "AI Study Planner", desc: "Auto-generate personalized study schedules" },
  { icon: "⏱️", title: "Pomodoro Timer", desc: "Stay focused with the Pomodoro technique" },
  { icon: "📊", title: "Progress Tracking", desc: "Monitor your study progress with charts" },
  { icon: "🔔", title: "Smart Reminders", desc: "Never miss a deadline again" },
  { icon: "📰", title: "News & Updates", desc: "Stay updated with latest news" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState("welcome");
  const [visible, setVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState([]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    if (phase === "features") {
      features.forEach((_, i) => {
        setTimeout(() => {
          setFeaturesVisible(prev => [...prev, i]);
        }, i * 200);
      });
    }
  }, [phase]);

  function goToFeatures() {
    setVisible(false);
    setTimeout(() => {
      setPhase("features");
      setVisible(true);
    }, 400);
  }

  function goToDashboard() {
    setVisible(false);
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>

      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float absolute top-20 right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }} />
        <div className="animate-float-delayed absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-10"
          style={{ background: "linear-gradient(135deg, #a8edea, #4F8CFF)" }} />
        <div className="animate-pulse-slow absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #4F8CFF 0%, transparent 70%)", transform: "translate(-50%,-50%)" }} />
      </div>

      <div className="w-full max-w-2xl relative z-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>

        {/* Welcome Phase */}
        {phase === "welcome" && (
          <div className="text-center">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }}>
              <img src="/num-logo.png" alt="NUM" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome! 👋
            </h1>
            <p className="text-white/60 text-lg mb-2">AI-Based Study Planner System</p>
            <p className="text-white/40 text-sm mb-10">National University of Management · Group 13</p>

            <button onClick={goToFeatures}
              className="px-10 py-4 rounded-2xl text-white font-semibold text-lg"
              style={{
                background: "linear-gradient(135deg, #4F8CFF, #667eea)",
                boxShadow: "0 8px 30px rgba(79,140,255,0.4)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
              Let's Go →
            </button>
          </div>
        )}

        {/* Features Phase */}
        {phase === "features" && (
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-2">What can you do? 🚀</h2>
            <p className="text-white/50 text-center mb-8">Everything you need to ace your studies</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {features.map((feature, i) => (
                <div key={i}
                  style={{
                    opacity: featuresVisible.includes(i) ? 1 : 0,
                    transform: featuresVisible.includes(i) ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  className="rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <p className="text-white font-semibold text-sm">{feature.title}</p>
                  <p className="text-white/50 text-xs mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button onClick={goToDashboard}
                className="px-10 py-4 rounded-2xl text-white font-semibold text-lg"
                style={{
                  background: "linear-gradient(135deg, #4F8CFF, #667eea)",
                  boxShadow: "0 8px 30px rgba(79,140,255,0.4)",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                🚀 Start Planning!
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}