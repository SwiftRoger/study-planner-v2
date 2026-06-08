"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRIORITY_CONFIG = {
  high:   { bg: "#fee2e2", color: "#dc2626" },
  medium: { bg: "#fef9c3", color: "#ca8a04" },
  low:    { bg: "#dcfce7", color: "#16a34a" },
};

const SUBJECT_COLORS = [
  "#4F8CFF","#667eea","#22c55e","#f97316","#ec4899",
  "#8b5cf6","#14b8a6","#eab308","#ef4444","#06b6d4",
];

function getSubjectColor(subject, allSubjects) {
  const index = allSubjects.indexOf(subject);
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

function groupByMonth(tasks) {
  const groups = {};
  for (const task of tasks) {
    const date = new Date(task.completedAt || task.createdAt);
    const key  = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  }
  return groups;
}

export default function HistoryPage() {
  const router = useRouter();
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [view, setView]         = useState("timeline"); // "timeline" | "grid"

  useEffect(() => {
    fetch("/api/tasks").then(r => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then(d => {
      if (d) {
        // Only completed tasks, sorted by completedAt desc
        const completed = d
          .filter(t => t.status === "completed")
          .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
        setTasks(completed);
        setLoading(false);
      }
    });
  }, [router]);

  const allSubjects = [...new Set(tasks.map(t => t.subject))];

  const filtered = tasks.filter(t => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject  = filterSubject === "all" || t.subject === filterSubject;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchSearch && matchSubject && matchPriority;
  });

  // Stats
  const total     = tasks.length;
  const thisWeek  = tasks.filter(t => {
    const d = new Date(t.completedAt || t.createdAt);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;
  const thisMonth = tasks.filter(t => {
    const d = new Date(t.completedAt || t.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const bySubjectCount = tasks.reduce((acc, t) => {
    acc[t.subject] = (acc[t.subject] || 0) + 1; return acc;
  }, {});
  const topSubject = Object.entries(bySubjectCount).sort((a,b) => b[1]-a[1])[0];

  const grouped = groupByMonth(filtered);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #4F8CFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .hist-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.1) !important}
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>📜 Task History</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>All your completed tasks</p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Done",   value: total,      color: "#16a34a", icon: "✅" },
            { label: "This Week",    value: thisWeek,   color: "#4F8CFF", icon: "📅" },
            { label: "This Month",   value: thisMonth,  color: "#7c3aed", icon: "🗓️" },
            { label: "Top Subject",  value: topSubject ? topSubject[0].split(" ")[0] : "—", color: "#f97316", icon: "🏆", small: true },
          ].map((s, i) => (
            <div key={s.label} style={{
              background: "white", borderRadius: 16, padding: "16px 14px", textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              animation: `fadeSlideUp 0.4s ease ${i*0.05}s both`,
            }}>
              <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 4px" }}>{s.icon} {s.label}</p>
              <h2 style={{ fontSize: s.small ? 16 : 26, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</h2>
            </div>
          ))}
        </div>

        {/* Subject breakdown bar */}
        {total > 0 && (
          <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>COMPLETED BY SUBJECT</p>
            <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
              {Object.entries(bySubjectCount).map(([subject, count], i) => (
                <div key={subject} style={{ width: `${(count/total)*100}%`, background: getSubjectColor(subject, allSubjects), transition: "width 1s ease" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {Object.entries(bySubjectCount).map(([subject, count], i) => (
                <div key={subject} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: getSubjectColor(subject, allSubjects) }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>{subject} ({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ background: "white", borderRadius: 16, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <input
            type="text" placeholder="🔍 Search history..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "7px 12px", fontSize: 13, outline: "none", flex: 1, minWidth: 140 }}
          />
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "7px 12px", fontSize: 13, outline: "none", color: "#475569", background: "white" }}>
            <option value="all">All Subjects</option>
            {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            style={{ border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "7px 12px", fontSize: 13, outline: "none", color: "#475569", background: "white" }}>
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div style={{ display: "flex", gap: 4 }}>
            {["timeline","grid"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "7px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: view === v ? "#4F8CFF" : "#f1f5f9",
                color: view === v ? "white" : "#64748b",
              }}>
                {v === "timeline" ? "📅 Timeline" : "⊞ Grid"}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {total === 0 ? (
          <div style={{ background: "white", borderRadius: 20, padding: 60, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 48, margin: "0 0 12px" }}>📭</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>No completed tasks yet</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>Complete some tasks and they'll show up here!</p>
            <Link href="/tasks" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg,#4F8CFF,#667eea)", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Go to Tasks
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "white", borderRadius: 20, padding: 40, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>No tasks match your filters</p>
          </div>

        /* ── Timeline view ── */
        ) : view === "timeline" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {Object.entries(grouped).map(([month, monthTasks]) => (
              <div key={month}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ height: 1, flex: 1, background: "#e2e8f0" }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", letterSpacing: 1, whiteSpace: "nowrap" }}>
                    {month.toUpperCase()} · {monthTasks.length} completed
                  </span>
                  <div style={{ height: 1, flex: 1, background: "#e2e8f0" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {monthTasks.map((task, i) => {
                    const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                    const subColor = getSubjectColor(task.subject, allSubjects);
                    const completedDate = new Date(task.completedAt || task.createdAt);
                    return (
                      <div key={task.id} className="hist-card" style={{
                        display: "flex", alignItems: "center", gap: 14,
                        background: "white", borderRadius: 14, padding: "14px 16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        border: "1px solid #f1f5f9",
                        transition: "all 0.15s",
                        animation: `fadeSlideUp 0.4s ease ${i*0.04}s both`,
                      }}>
                        {/* Timeline dot */}
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✅</div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0, textDecoration: "line-through", textDecorationColor: "#94a3b8" }}>{task.title}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: subColor }} />
                            <span style={{ fontSize: 11, color: "#64748b" }}>{task.subject}</span>
                            <span style={{ fontSize: 10, color: "#94a3b8" }}>·</span>
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                              Completed {completedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>

                        {/* Priority badge */}
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: pri.bg, color: pri.color, flexShrink: 0 }}>
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        /* ── Grid view ── */
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {filtered.map((task, i) => {
              const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              const subColor = getSubjectColor(task.subject, allSubjects);
              const completedDate = new Date(task.completedAt || task.createdAt);
              return (
                <div key={task.id} className="hist-card" style={{
                  background: "white", borderRadius: 16, padding: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
                  transition: "all 0.15s",
                  animation: `fadeSlideUp 0.4s ease ${i*0.03}s both`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: pri.bg, color: pri.color }}>{task.priority}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 6px", textDecoration: "line-through", textDecorationColor: "#94a3b8" }}>{task.title}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: subColor }} />
                    <span style={{ fontSize: 11, color: "#64748b" }}>{task.subject}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                    {completedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}