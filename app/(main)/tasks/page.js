"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const quotes = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Study hard, for the well is deep and our brains are shallow. — Richard Baxter",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "The more that you read, the more things you will know. — Dr. Seuss",
  "Education is the most powerful weapon you can use to change the world. — Nelson Mandela",
  "Success is the sum of small efforts repeated day in and day out. — Robert Collier",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
];

// ── Lucy Briefing Card ────────────────────────────────────────
function LucyBriefing({ language }) {
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cache briefing per day so we don't call API on every refresh
    const cacheKey = `lucy_briefing_${new Date().toDateString()}_${language}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setBriefing(cached);
      setLoading(false);
      return;
    }

    fetch(`/api/lucy?language=${language}`)
      .then(r => r.json())
      .then(data => {
        if (data.reply) {
          setBriefing(data.reply);
          sessionStorage.setItem(cacheKey, data.reply);
        }
        setLoading(false);
      })
      .catch(() => {
        setBriefing("Good morning! Let's make today productive. 💙");
        setLoading(false);
      });
  }, [language]);

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      borderRadius: 20, padding: 20, marginBottom: 24,
      boxShadow: "0 8px 32px rgba(79,140,255,0.15)",
      border: "1px solid rgba(79,140,255,0.2)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,140,255,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative" }}>
        {/* Lucy avatar */}
        <div style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #4F8CFF, #667eea)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, boxShadow: "0 4px 12px rgba(79,140,255,0.4)",
        }}>
          🎓
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8CFF" }}>Lucy</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20,
              background: "rgba(79,140,255,0.2)", color: "#93c5fd", fontWeight: 600,
            }}>
              {language === "kh" ? "ការណែនាំប្រចាំថ្ងៃ" : "Daily Briefing"}
            </span>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 16, height: 16, border: "2px solid #4F8CFF",
                borderTopColor: "transparent", borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                {language === "kh" ? "Lucy កំពុងរៀបចំ..." : "Lucy is preparing your briefing..."}
              </span>
            </div>
          ) : (
            <p style={{
              fontSize: 13, color: "#e2e8f0", lineHeight: 1.7,
              margin: 0, whiteSpace: "pre-wrap",
            }}>
              {briefing}
            </p>
          )}

          <Link href="/lucy" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 10, fontSize: 12, color: "#4F8CFF",
            textDecoration: "none", fontWeight: 600,
          }}>
            {language === "kh" ? "និយាយជាមួយ Lucy →" : "Chat with Lucy →"}
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Logout button ─────────────────────────────────────────────
function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }
  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
    >
      Logout
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const lang = localStorage.getItem("lucyLanguage") || "en";
    setLanguage(lang);

    // Load user
    fetch("/api/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
    });

    // Load tasks
    fetch("/api/tasks").then(r => {
      if (r.status === 401) { router.push("/login"); return; }
      return r.json();
    }).then(data => {
      if (data) setTasks(data);
      setLoading(false);
    });
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4F8CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending   = tasks.filter(t => t.status === "pending").length;
  const overdue   = tasks.filter(t => t.status === "pending" && new Date(t.deadline) < new Date()).length;
  const percent   = total === 0 ? 0 : Math.round((completed / total) * 100);
  const quote     = quotes[new Date().getDay() % quotes.length];

  const upcoming = tasks
    .filter(t => t.status === "pending" && new Date(t.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  const today = new Date();
  const todayTasks = tasks.filter(t => {
    const d = new Date(t.deadline);
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  });

  const dueSoon = tasks.filter(t => {
    const diff = new Date(t.deadline) - new Date();
    const hours = diff / (1000 * 60 * 60);
    return t.status === "pending" && hours > 0 && hours <= 24;
  });

  return (
    <div className="max-w-5xl mx-auto relative">

      {/* Background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="animate-float absolute top-20 right-20 w-32 h-32 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }} />
        <div className="animate-float-delayed absolute top-40 left-10 w-20 h-20 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #a8edea, #4F8CFF)" }} />
        <div className="animate-float absolute bottom-40 right-40 w-24 h-24 opacity-5"
          style={{ background: "linear-gradient(135deg, #667eea, #4F8CFF)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }} />
        <div className="animate-float-delayed absolute bottom-20 left-20 w-16 h-16 opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #a8edea)", transform: "rotate(45deg)" }} />
      </div>

      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 card-enter">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Hello, {user.name}! 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Let's make today productive.</p>
          </div>
          <LogoutButton />
        </div>

        {/* Lucy Briefing */}
        <LucyBriefing language={language} />

        {/* Due soon alert */}
        {dueSoon.length > 0 && (
          <div className="card-enter-1 mb-4 p-4 rounded-2xl border border-orange-200 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-orange-700 text-sm">Due within 24 hours!</p>
              <p className="text-orange-600 text-xs mt-0.5">
                {dueSoon.map(t => t.title).join(", ")} — don't forget!
              </p>
            </div>
          </div>
        )}

        {/* Motivational quote */}
        <div className="card-enter-1 mb-6 p-4 rounded-2xl text-white text-sm italic text-center"
          style={{ background: "linear-gradient(135deg, #4F8CFF 0%, #667eea 100%)" }}>
          💡 "{quote}"
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Tasks",  value: total,     color: "text-slate-800", bg: "from-slate-50 to-white",  delay: "card-enter-1" },
            { label: "Pending",      value: pending,   color: "text-[#4F8CFF]", bg: "from-blue-50 to-white",   delay: "card-enter-2" },
            { label: "Completed",    value: completed, color: "text-green-500", bg: "from-green-50 to-white",  delay: "card-enter-3" },
            { label: "Overdue",      value: overdue,   color: "text-red-500",   bg: "from-red-50 to-white",    delay: "card-enter-4" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.delay} bg-gradient-to-br ${stat.bg} rounded-2xl shadow-sm p-5 text-center card-hover`}>
              <p className="text-slate-500 text-sm">{stat.label}</p>
              <h2 className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</h2>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Upcoming Deadlines */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6 card-enter-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Upcoming Deadlines</h2>
              <Link href="/tasks" className="text-sm text-[#4F8CFF] hover:underline">View all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-slate-400 text-sm">No upcoming tasks!</p>
                <Link href="/lucy" className="text-sm text-[#4F8CFF] mt-2 inline-block hover:underline">
                  Tell Lucy about your tasks →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(task => {
                  const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-[#F0F4FF] rounded-xl card-hover">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${
                          task.priority === "high" ? "bg-red-400" :
                          task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                        }`} />
                        <div>
                          <p className="font-medium text-sm text-slate-800">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.subject}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        daysLeft <= 2 ? "bg-red-100 text-red-600" : "bg-[#EBF1FF] text-[#4F8CFF]"
                      }`}>
                        {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl shadow-sm p-6 card-enter-3">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Overall Progress</h2>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#EBF1FF" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke="url(#grad1)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - percent / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }} />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F8CFF" />
                      <stop offset="100%" stopColor="#a8edea" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">{percent}%</span>
                  <span className="text-xs text-slate-400">Done</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">{completed} of {total} tasks completed</p>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/lucy" className="flex items-center gap-2 p-3 bg-[#F0F4FF] rounded-xl hover:bg-[#EBF1FF] transition-all card-hover">
                <span>🎓</span>
                <span className="text-sm font-medium text-[#4F8CFF]">Chat with Lucy</span>
              </Link>
              <Link href="/planner" className="flex items-center gap-2 p-3 bg-[#F0F4FF] rounded-xl hover:bg-[#EBF1FF] transition-all card-hover">
                <span>🤖</span>
                <span className="text-sm font-medium text-[#4F8CFF]">Generate Study Plan</span>
              </Link>
              <Link href="/progress" className="flex items-center gap-2 p-3 bg-[#F0F4FF] rounded-xl hover:bg-[#EBF1FF] transition-all card-hover">
                <span>📊</span>
                <span className="text-sm font-medium text-[#4F8CFF]">View Full Progress</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Study Stats Row */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 card-enter-3 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎯</span>
              <p className="text-sm text-slate-500">Completion Rate</p>
            </div>
            <h3 className="text-2xl font-bold text-[#4F8CFF]">{percent}%</h3>
            <p className="text-xs text-slate-400 mt-1">of all tasks done</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 card-enter-4 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📚</span>
              <p className="text-sm text-slate-500">High Priority</p>
            </div>
            <h3 className="text-2xl font-bold text-red-500">
              {tasks.filter(t => t.priority === "high" && t.status === "pending").length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">tasks need attention</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 card-enter-5 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <p className="text-sm text-slate-500">Done This Week</p>
            </div>
            <h3 className="text-2xl font-bold text-green-500">
              {tasks.filter(t => {
                const d = new Date(t.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return t.status === "completed" && d >= weekAgo;
              }).length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">tasks completed</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm p-6 card-enter-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">📅 Today's Schedule</h2>
            <span className="text-sm text-slate-400">
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-slate-400 text-sm">No tasks due today!</p>
              <Link href="/lucy" className="text-sm text-[#4F8CFF] mt-2 inline-block hover:underline">
                Ask Lucy what to study today →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-[#F0F4FF] rounded-xl card-hover">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${
                      task.priority === "high" ? "bg-red-400" :
                      task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                    }`} />
                    <div>
                      <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">{task.subject}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    task.status === "completed" ? "bg-green-100 text-green-600" :
                    task.priority === "high" ? "bg-red-100 text-red-600" :
                    task.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
                    "bg-green-100 text-green-600"
                  }`}>
                    {task.status === "completed" ? "Done" : task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}