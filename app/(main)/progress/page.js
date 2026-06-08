"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUBJECT_COLORS = [
  "#4F8CFF","#667eea","#22c55e","#f97316","#ec4899",
  "#8b5cf6","#14b8a6","#eab308","#ef4444","#06b6d4",
];

function getSubjectColor(subject, index) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

// ── Circular Progress ─────────────────────────────────────────
function CircularProgress({ percent, size = 128, stroke = 12, color = "#4F8CFF" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EBF1FF" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.18, fontWeight: 800, color: "#1e293b" }}>{percent}%</span>
        <span style={{ fontSize: size * 0.09, color: "#94a3b8" }}>Done</span>
      </div>
    </div>
  );
}

// ── Study Streak ──────────────────────────────────────────────
function getStreak(tasks) {
  const completedDates = tasks
    .filter(t => t.status === "completed")
    .map(t => new Date(t.createdAt).toDateString());
  const uniqueDates = [...new Set(completedDates)].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (uniqueDates[i] === expected.toDateString()) streak++;
    else break;
  }
  return streak;
}

// ── Lucy Summary Card ─────────────────────────────────────────
function LucySummaryCard({ tasks, language }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `lucy_progress_${new Date().toDateString()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setSummary(cached); setLoading(false); return; }

    const pending   = tasks.filter(t => t.status === "pending").length;
    const completed = tasks.filter(t => t.status === "completed").length;
    const overdue   = tasks.filter(t => t.status === "pending" && new Date(t.deadline) < new Date()).length;
    const total     = tasks.length;
    const percent   = total === 0 ? 0 : Math.round((completed / total) * 100);
    const highPri   = tasks.filter(t => t.priority === "high" && t.status === "pending").length;

    const prompt = language === "kh"
      ? `អ្នកគឺជា Lucy ជំនួយការសិក្សា AI។ សរសេរសង្ខេបវឌ្ឍនភាព 2-3 ប្រយោគជាភាសាខ្មែរ។ ទិន្នន័យ: សរុប ${total} | រួចរាល់ ${completed} (${percent}%) | ជំពោះ ${pending} | ហួសសម័យ ${overdue} | អាទិភាពខ្ពស់ ${highPri}។ បង្ហាញការលើកទឹកចិត្ត និងដំបូន្មានមួយ។`
      : `You are Lucy, an AI study companion. Write a 2-3 sentence progress summary. Data: ${total} total tasks, ${completed} completed (${percent}%), ${pending} pending, ${overdue} overdue, ${highPri} high priority. Be encouraging but firm. Give one specific tip.`;

    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY || ""}` },
      body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], max_tokens: 150 }),
    })
    .then(r => r.json())
    .then(d => {
      const text = d.choices?.[0]?.message?.content || (language === "kh" ? "រក្សាការខិតខំប្រឹងប្រែង! អ្នកកំពុងធ្វើបានល្អ។" : "Keep pushing! You're making great progress.");
      setSummary(text);
      sessionStorage.setItem(cacheKey, text);
      setLoading(false);
    })
    .catch(() => {
      setSummary(language === "kh" ? "រក្សាការខិតខំប្រឹងប្រែង! អ្នកកំពុងធ្វើបានល្អ។" : "Keep pushing! Every task you complete brings you closer to your goals.");
      setLoading(false);
    });
  }, [tasks.length, language]);

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
      borderRadius: 20, padding: 20, marginBottom: 24,
      boxShadow: "0 8px 32px rgba(79,140,255,0.15)",
      border: "1px solid rgba(79,140,255,0.2)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,140,255,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #4F8CFF, #667eea)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 12px rgba(79,140,255,0.4)" }}>🎓</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8CFF" }}>Lucy</span>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(79,140,255,0.2)", color: "#93c5fd", fontWeight: 600 }}>
              {language === "kh" ? "សង្ខេបវឌ្ឍនភាព" : "Progress Summary"}
            </span>
          </div>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, border: "2px solid #4F8CFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{language === "kh" ? "Lucy កំពុងវិភាគ..." : "Lucy is analyzing your progress..."}</span>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.7, margin: 0 }}>{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const router = useRouter();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(localStorage.getItem("lucyLanguage") || "en");
    fetch("/api/tasks").then(r => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then(d => { if (d) { setTasks(d); setLoading(false); } });
  }, [router]);

  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending   = tasks.filter(t => t.status === "pending").length;
  const overdue   = tasks.filter(t => t.status === "pending" && new Date(t.deadline) < new Date()).length;
  const percent   = total === 0 ? 0 : Math.round((completed / total) * 100);
  const streak    = getStreak(tasks);
  const highPri   = tasks.filter(t => t.priority === "high" && t.status === "pending").length;

  // By subject
  const bySubject = tasks.reduce((acc, task) => {
    if (!acc[task.subject]) acc[task.subject] = { total: 0, completed: 0 };
    acc[task.subject].total++;
    if (task.status === "completed") acc[task.subject].completed++;
    return acc;
  }, {});

  // Weekly data
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayTasks = tasks.filter(t => new Date(t.createdAt).toDateString() === d.toDateString());
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      total: dayTasks.length,
      done:  dayTasks.filter(t => t.status === "completed").length,
    };
  });
  const maxVal = Math.max(...weeklyData.map(d => d.total), 1);

  // Priority breakdown
  const byPriority = {
    high:   tasks.filter(t => t.priority === "high").length,
    medium: tasks.filter(t => t.priority === "medium").length,
    low:    tasks.filter(t => t.priority === "low").length,
  };

  // Filtered tasks list
  const filteredTasks = tasks.filter(t => {
    if (filter === "completed") return t.status === "completed";
    if (filter === "pending")   return t.status === "pending" && new Date(t.deadline) >= new Date();
    if (filter === "overdue")   return t.status === "pending" && new Date(t.deadline) < new Date();
    return true;
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #4F8CFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>📊 Progress</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Track your study performance and achievements</p>
        </div>

        {/* Lucy Summary */}
        {!loading && tasks.length > 0 && <LucySummaryCard tasks={tasks} language={language} />}

        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Tasks",   value: total,     color: "#1e293b", bg: "from-slate-50 to-white",  icon: "📋" },
            { label: "Completed",     value: completed, color: "#16a34a", bg: "from-green-50 to-white",  icon: "✅" },
            { label: "Pending",       value: pending,   color: "#4F8CFF", bg: "from-blue-50 to-white",   icon: "⏳" },
            { label: "Overdue",       value: overdue,   color: "#dc2626", bg: "from-red-50 to-white",    icon: "⚠️" },
            { label: "🔥 Day Streak", value: streak,    color: "#f97316", bg: "from-orange-50 to-white", icon: "" },
            { label: "High Priority", value: highPri,   color: "#dc2626", bg: "from-red-50 to-white",    icon: "🚨" },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              background: "white", borderRadius: 16, padding: "16px 14px", textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              animation: `fadeSlideUp 0.4s ease ${i * 0.05}s both`,
            }}>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>{stat.icon} {stat.label}</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Circular + linear progress */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Overall Progress</h2>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#4F8CFF" }}>{percent}%</span>
            </div>
            <div style={{ width: "100%", background: "#EBF1FF", borderRadius: 99, height: 10, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ height: "100%", width: `${percent}%`, background: "linear-gradient(90deg, #4F8CFF, #667eea)", borderRadius: 99, transition: "width 1s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress percent={percent} />
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>{completed} of {total} tasks completed</p>
          </div>

          {/* Weekly bar chart */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>Weekly Activity</h2>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginBottom: 12 }}>
              {weeklyData.map((day, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100px", gap: 2 }}>
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      background: "linear-gradient(to top, #4F8CFF, #667eea)",
                      height: `${Math.max((day.done / maxVal) * 100, day.done > 0 ? 8 : 0)}px`,
                      transition: "height 0.5s ease",
                    }} />
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      background: "#EBF1FF",
                      height: `${Math.max(((day.total - day.done) / maxVal) * 100, (day.total - day.done) > 0 ? 8 : 0)}px`,
                      transition: "height 0.5s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{day.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>{day.total}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "linear-gradient(135deg, #4F8CFF, #667eea)" }} /> Completed
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#EBF1FF" }} /> Pending
              </div>
            </div>
          </div>
        </div>

        {/* Priority breakdown */}
        <div style={{ background: "white", borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Priority Breakdown</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "High",   value: byPriority.high,   bg: "#fee2e2", color: "#dc2626", bar: "#ef4444" },
              { label: "Medium", value: byPriority.medium, bg: "#fef9c3", color: "#ca8a04", bar: "#eab308" },
              { label: "Low",    value: byPriority.low,    bg: "#dcfce7", color: "#16a34a", bar: "#22c55e" },
            ].map(p => (
              <div key={p.label} style={{ background: p.bg, borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: p.color, margin: "0 0 6px" }}>{p.label} Priority</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: p.color, margin: "0 0 8px" }}>{p.value}</p>
                <div style={{ width: "100%", background: "rgba(255,255,255,0.6)", borderRadius: 99, height: 6 }}>
                  <div style={{ width: `${total === 0 ? 0 : Math.round((p.value / total) * 100)}%`, height: "100%", background: p.bar, borderRadius: 99 }} />
                </div>
                <p style={{ fontSize: 10, color: p.color, margin: "4px 0 0", opacity: 0.7 }}>
                  {total === 0 ? 0 : Math.round((p.value / total) * 100)}% of tasks
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Subject progress */}
        <div style={{ background: "white", borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Progress by Subject</h2>
          {Object.keys(bySubject).length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>📚</p>
              <p style={{ fontSize: 14 }}>No subjects yet. Add some tasks!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(bySubject).map(([subject, data], i) => {
                const subPct = Math.round((data.completed / data.total) * 100);
                const color  = getSubjectColor(subject, i);
                return (
                  <div key={subject}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{subject}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{data.completed}/{data.total}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}18`, padding: "2px 8px", borderRadius: 99 }}>{subPct}%</span>
                      </div>
                    </div>
                    <div style={{ width: "100%", background: "#f1f5f9", borderRadius: 99, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${subPct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Tasks with filter */}
        <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>All Tasks</h2>
            <div style={{ display: "flex", gap: 6 }}>
              {["all","pending","completed","overdue"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 600, transition: "all 0.15s",
                  background: filter === f ? "#4F8CFF" : "#f1f5f9",
                  color: filter === f ? "white" : "#64748b",
                }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8", padding: "24px 0" }}>No tasks in this category</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredTasks.map((task, i) => {
                const isCompleted = task.status === "completed";
                const isOverdue   = !isCompleted && new Date(task.deadline) < new Date();
                const daysLeft    = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                const priColor    = task.priority === "high" ? "#dc2626" : task.priority === "medium" ? "#ca8a04" : "#16a34a";
                const priBg       = task.priority === "high" ? "#fee2e2" : task.priority === "medium" ? "#fef9c3" : "#dcfce7";
                return (
                  <div key={task.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 12,
                    background: isCompleted ? "#f8fafc" : isOverdue ? "#fff5f5" : "#F8FAFF",
                    border: `1px solid ${isOverdue && !isCompleted ? "#fecaca" : "#f1f5f9"}`,
                    animation: `fadeSlideUp 0.4s ease ${i * 0.03}s both`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: isCompleted ? "#94a3b8" : "#1e293b", margin: 0, textDecoration: isCompleted ? "line-through" : "none" }}>
                        {task.title}
                      </p>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0" }}>
                        {task.subject} · {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: priBg, color: priColor }}>
                        {task.priority}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                        background: isCompleted ? "#dcfce7" : isOverdue ? "#fee2e2" : "#EBF1FF",
                        color: isCompleted ? "#16a34a" : isOverdue ? "#dc2626" : "#4F8CFF",
                      }}>
                        {isCompleted ? "✅ Done" : isOverdue ? "⚠️ Overdue" : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}