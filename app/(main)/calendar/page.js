"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const PRIORITY_COLOR = {
  high:   "#ef4444",
  medium: "#eab308",
  low:    "#22c55e",
};

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks]           = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch("/api/tasks").then(r => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then(d => { if (d) { setTasks(d); setLoading(false); } });
  }, [router]);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  function getTasksForDay(day) {
    return tasks.filter(t => {
      const d = new Date(t.deadline);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function isToday(day) {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  }

  function jumpToday() {
    setCurrentDate(new Date());
    setSelectedDay(today.getDate());
  }

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  // Month stats
  const monthTasks     = tasks.filter(t => { const d = new Date(t.deadline); return d.getFullYear() === year && d.getMonth() === month; });
  const monthCompleted = monthTasks.filter(t => t.status === "completed").length;
  const monthPending   = monthTasks.filter(t => t.status === "pending").length;
  const monthOverdue   = monthTasks.filter(t => t.status === "pending" && new Date(t.deadline) < new Date()).length;

  // Busiest day
  let busiestDay = null, busiestCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const count = getTasksForDay(d).length;
    if (count > busiestCount) { busiestCount = count; busiestDay = d; }
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .day-cell:hover{background:#EBF1FF !important;}
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>📅 Calendar</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>View your tasks by date</p>
          </div>
          <button onClick={jumpToday} style={{
            padding: "8px 16px", borderRadius: 12, border: "1.5px solid #4F8CFF",
            background: "white", color: "#4F8CFF", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>
            Today
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

          {/* ── Calendar ── */}
          <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
                style={{ width: 32, height: 32, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                ‹
              </button>
              <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1e293b", margin: 0 }}>{MONTH_NAMES[month]} {year}</h2>
              </div>
              <button onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
                style={{ width: 32, height: 32, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                ›
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", padding: "6px 0", letterSpacing: 0.5 }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayTasks  = getTasksForDay(day);
                const isSelected = selectedDay === day;
                const isTod     = isToday(day);
                const isBusiest = day === busiestDay && busiestCount > 0;
                const hasOverdue = dayTasks.some(t => t.status === "pending" && new Date(t.deadline) < new Date());

                return (
                  <button
                    key={day}
                    className={dayTasks.length === 0 ? "day-cell" : ""}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    style={{
                      aspectRatio: "1", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "flex-start",
                      paddingTop: 6, borderRadius: 12, border: "none", cursor: "pointer",
                      background: isSelected ? "#4F8CFF" : isTod ? "#EBF1FF" : "transparent",
                      transition: "all 0.15s", position: "relative",
                    }}
                  >
                    <span style={{
                      fontSize: 13, fontWeight: isTod || isSelected ? 800 : 500,
                      color: isSelected ? "white" : isTod ? "#4F8CFF" : "#475569",
                    }}>{day}</span>

                    {/* Task dots */}
                    {dayTasks.length > 0 && (
                      <div style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap", justifyContent: "center", maxWidth: "80%" }}>
                        {dayTasks.slice(0, 3).map((t, idx) => (
                          <div key={idx} style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: isSelected ? "white" :
                              t.status === "completed" ? "#22c55e" :
                              hasOverdue ? "#ef4444" :
                              PRIORITY_COLOR[t.priority] || "#4F8CFF",
                          }} />
                        ))}
                        {dayTasks.length > 3 && (
                          <span style={{ fontSize: 8, color: isSelected ? "white" : "#94a3b8", lineHeight: "5px" }}>+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Task count badge */}
                    {dayTasks.length > 0 && !isSelected && (
                      <span style={{
                        position: "absolute", top: 2, right: 2,
                        fontSize: 8, fontWeight: 800,
                        background: hasOverdue ? "#ef4444" : "#4F8CFF",
                        color: "white", borderRadius: 99, padding: "1px 4px", minWidth: 12, textAlign: "center",
                      }}>{dayTasks.length}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9", flexWrap: "wrap" }}>
              {[
                { color: "#ef4444", label: "High/Overdue" },
                { color: "#eab308", label: "Medium" },
                { color: "#22c55e", label: "Low/Done" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                  {l.label}
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
                <div style={{ width: 8, height: 8, borderRadius: 3, background: "#EBF1FF" }} />
                Today
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Selected day tasks */}
            <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 14 }}>
                {selectedDay
                  ? `${MONTH_NAMES[month]} ${selectedDay}${isToday(selectedDay) ? " 🟢" : ""}`
                  : "Select a day"}
              </h3>

              {!selectedDay ? (
                <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Click on a day to see tasks</p>
              ) : selectedTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 28, margin: "0 0 8px" }}>🎉</p>
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>No tasks this day!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedTasks.map(task => {
                    const isCompleted = task.status === "completed";
                    const isOverdue   = !isCompleted && new Date(task.deadline) < new Date();
                    return (
                      <div key={task.id} style={{
                        padding: "12px 14px", borderRadius: 12,
                        background: isCompleted ? "#f0fdf4" : isOverdue ? "#fff5f5" : "#F8FAFF",
                        border: `1.5px solid ${isCompleted ? "#bbf7d0" : isOverdue ? "#fecaca" : "#e0e7ff"}`,
                        animation: "fadeSlideUp 0.3s ease",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: isCompleted ? "#94a3b8" : "#1e293b", margin: 0, textDecoration: isCompleted ? "line-through" : "none" }}>
                              {task.title}
                            </p>
                            <p style={{ fontSize: 11, color: "#64748b", margin: "3px 0 0" }}>{task.subject}</p>
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, flexShrink: 0,
                            background: isCompleted ? "#dcfce7" : isOverdue ? "#fee2e2" : task.priority === "high" ? "#fee2e2" : task.priority === "medium" ? "#fef9c3" : "#dcfce7",
                            color: isCompleted ? "#16a34a" : isOverdue ? "#dc2626" : task.priority === "high" ? "#dc2626" : task.priority === "medium" ? "#ca8a04" : "#16a34a",
                          }}>
                            {isCompleted ? "✅ Done" : isOverdue ? "⚠️ Late" : task.priority}
                          </span>
                        </div>
                        <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
                          ⏰ {new Date(task.deadline).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Month summary */}
            <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 12 }}>THIS MONTH</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Total",     value: monthTasks.length,    color: "#1e293b" },
                  { label: "Completed", value: monthCompleted,        color: "#16a34a" },
                  { label: "Pending",   value: monthPending,          color: "#4F8CFF" },
                  { label: "Overdue",   value: monthOverdue,          color: "#dc2626" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{s.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {busiestDay && busiestCount > 0 && (
                <div style={{ marginTop: 14, padding: "10px 12px", background: "#EBF1FF", borderRadius: 12 }}>
                  <p style={{ fontSize: 11, color: "#4F8CFF", fontWeight: 700, margin: 0 }}>
                    📌 Busiest day: {MONTH_NAMES[month]} {busiestDay} ({busiestCount} task{busiestCount > 1 ? "s" : ""})
                  </p>
                </div>
              )}

              <Link href="/lucy" style={{
                display: "block", marginTop: 12, padding: "10px", borderRadius: 12, textAlign: "center",
                background: "linear-gradient(135deg, #4F8CFF, #667eea)", color: "white",
                fontSize: 12, fontWeight: 700, textDecoration: "none",
              }}>
                🎓 Ask Lucy to reschedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}