"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getDaysLeft(deadline) {
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

// ── Reminder Card ─────────────────────────────────────────────
function ReminderCard({ task, type, onComplete, onReschedule }) {
  const daysLeft = getDaysLeft(task.deadline);

  const config = {
    overdue:  { bg: "#fff5f5", border: "#fecaca", icon: "🚨", badge: { bg: "#fee2e2", color: "#dc2626" }, badgeLabel: `${Math.abs(daysLeft)}d overdue` },
    today:    { bg: "#fff7ed", border: "#fed7aa", icon: "⏰", badge: { bg: "#ffedd5", color: "#ea580c" }, badgeLabel: "Due today!" },
    soon:     { bg: "#fefce8", border: "#fde68a", icon: "⚠️", badge: { bg: "#fef9c3", color: "#ca8a04" }, badgeLabel: `${daysLeft}d left` },
    upcoming: { bg: "#f0f9ff", border: "#bae6fd", icon: "📅", badge: { bg: "#EBF1FF", color: "#4F8CFF" }, badgeLabel: `${daysLeft}d left` },
  };
  const c = config[type];

  const priColors = {
    high:   { bg: "#fee2e2", color: "#dc2626" },
    medium: { bg: "#fef9c3", color: "#ca8a04" },
    low:    { bg: "#dcfce7", color: "#16a34a" },
  };
  const pri = priColors[task.priority] || priColors.medium;

  // Urgency progress bar (how close to deadline)
  const totalDays = 14;
  const urgencyPct = type === "overdue" ? 100 : Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
  const urgencyColor = type === "overdue" ? "#ef4444" : type === "today" ? "#f97316" : type === "soon" ? "#eab308" : "#4F8CFF";

  return (
    <div style={{
      background: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: 16, padding: "14px 16px",
      animation: "fadeSlideUp 0.4s ease both",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>{task.title}</p>
          <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>
            📖 {task.subject} · 📅 {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: pri.bg, color: pri.color }}>
            {task.priority}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: c.badge.bg, color: c.badge.color }}>
            {c.badgeLabel}
          </span>
        </div>
      </div>

      {/* Urgency bar */}
      <div style={{ width: "100%", background: "rgba(0,0,0,0.06)", borderRadius: 99, height: 4, marginBottom: 10, overflow: "hidden" }}>
        <div style={{ width: `${urgencyPct}%`, height: "100%", background: urgencyColor, borderRadius: 99, transition: "width 1s ease" }} />
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onComplete(task.id)}
          style={{
            flex: 1, padding: "7px", borderRadius: 10, border: "none",
            background: "#dcfce7", color: "#16a34a",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}
        >
          ✅ Mark Done
        </button>
        <button
          onClick={() => onReschedule(task)}
          style={{
            flex: 1, padding: "7px", borderRadius: 10, border: "none",
            background: "#EBF1FF", color: "#4F8CFF",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}
        >
          📅 Reschedule
        </button>
      </div>
    </div>
  );
}

// ── Reschedule Modal ──────────────────────────────────────────
function RescheduleModal({ task, onSave, onClose }) {
  const [newDate, setNewDate] = useState("");

  async function handleSave() {
    if (!newDate) return;
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deadline: new Date(newDate).toISOString(), isEdit: true }),
    });
    onSave();
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div style={{ background: "white", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>📅 Reschedule Task</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#94a3b8" }}>✕</button>
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 16 }}>"{task.title}"</p>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>New deadline:</label>
          <input
            type="datetime-local"
            value={newDate}
            min={new Date().toISOString().slice(0, 16)}
            onChange={e => setNewDate(e.target.value)}
            style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={!newDate} style={{ flex: 2, padding: "10px", borderRadius: 12, border: "none", background: newDate ? "linear-gradient(135deg, #4F8CFF, #667eea)" : "#e2e8f0", color: newDate ? "white" : "#94a3b8", fontWeight: 700, fontSize: 13, cursor: newDate ? "pointer" : "not-allowed" }}>
            Save New Date
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function RemindersPage() {
  const router = useRouter();
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [rescheduleTask, setRescheduleTask] = useState(null);
  const [toast, setToast]             = useState(null);
  const [language, setLanguage]       = useState("en");

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setLanguage(localStorage.getItem("lucyLanguage") || "en");
    fetchTasks();
    // Auto-refresh every 60s
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  async function handleComplete(id) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    setToast({ text: "✅ Task marked complete!", color: "#16a34a" });
    setTimeout(() => setToast(null), 3000);
    fetchTasks();
  }

  const pending  = tasks.filter(t => t.status === "pending");
  const overdue  = pending.filter(t => getDaysLeft(t.deadline) < 0).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const dueToday = pending.filter(t => getDaysLeft(t.deadline) === 0);
  const dueSoon  = pending.filter(t => getDaysLeft(t.deadline) > 0 && getDaysLeft(t.deadline) <= 3).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const upcoming = pending.filter(t => getDaysLeft(t.deadline) > 3).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const urgentCount = overdue.length + dueToday.length + dueSoon.length;

  return (
    <>
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>🔔 Reminders</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Stay on top of your deadlines</p>
          </div>
          {urgentCount > 0 && (
            <div style={{ padding: "8px 16px", borderRadius: 12, background: "#fee2e2", color: "#dc2626", fontSize: 13, fontWeight: 700 }}>
              ⚠️ {urgentCount} urgent
            </div>
          )}
        </div>

        {/* Lucy tip banner */}
        {!loading && urgentCount > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #1e293b, #334155)",
            borderRadius: 16, padding: "14px 18px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#4F8CFF,#667eea)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#4F8CFF", margin: "0 0 4px" }}>Lucy says</p>
              <p style={{ fontSize: 13, color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>
                {language === "kh"
                  ? `អ្នកមានកិច្ចការបន្ទាន់ ${urgentCount} ។ ចាប់ផ្តើមជាមួយរបស់ដែលហួសសម័យជាមុន!`
                  : overdue.length > 0
                    ? `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}! Deal with ${overdue[0].title} first — it's already late.`
                    : `${urgentCount} task${urgentCount > 1 ? "s" : ""} need${urgentCount === 1 ? "s" : ""} your attention soon. Don't let them slip!`
                }
              </p>
            </div>
            <Link href="/lucy" style={{ padding: "8px 14px", borderRadius: 10, background: "#4F8CFF", color: "white", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
              Ask Lucy
            </Link>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{ width: 32, height: 32, border: "3px solid #4F8CFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : pending.length === 0 ? (
          <div style={{ background: "white", borderRadius: 20, padding: 60, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 48, margin: "0 0 12px" }}>🎉</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>All caught up!</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px" }}>No pending tasks right now</p>
            <Link href="/lucy" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg,#4F8CFF,#667eea)", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              🎓 Tell Lucy about new tasks
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {overdue.length > 0 && (
              <section>
                <h2 style={{ fontSize: 12, fontWeight: 800, color: "#dc2626", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  🚨 OVERDUE <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 99, padding: "1px 8px", fontSize: 11 }}>{overdue.length}</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {overdue.map(t => <ReminderCard key={t.id} task={t} type="overdue" onComplete={handleComplete} onReschedule={setRescheduleTask} />)}
                </div>
              </section>
            )}

            {dueToday.length > 0 && (
              <section>
                <h2 style={{ fontSize: 12, fontWeight: 800, color: "#ea580c", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  ⏰ DUE TODAY <span style={{ background: "#ffedd5", color: "#ea580c", borderRadius: 99, padding: "1px 8px", fontSize: 11 }}>{dueToday.length}</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dueToday.map(t => <ReminderCard key={t.id} task={t} type="today" onComplete={handleComplete} onReschedule={setRescheduleTask} />)}
                </div>
              </section>
            )}

            {dueSoon.length > 0 && (
              <section>
                <h2 style={{ fontSize: 12, fontWeight: 800, color: "#ca8a04", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  ⚠️ DUE SOON <span style={{ background: "#fef9c3", color: "#ca8a04", borderRadius: 99, padding: "1px 8px", fontSize: 11 }}>{dueSoon.length}</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dueSoon.map(t => <ReminderCard key={t.id} task={t} type="soon" onComplete={handleComplete} onReschedule={setRescheduleTask} />)}
                </div>
              </section>
            )}

            {upcoming.length > 0 && (
              <section>
                <h2 style={{ fontSize: 12, fontWeight: 800, color: "#4F8CFF", letterSpacing: 1, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  📅 UPCOMING <span style={{ background: "#EBF1FF", color: "#4F8CFF", borderRadius: 99, padding: "1px 8px", fontSize: 11 }}>{upcoming.length}</span>
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {upcoming.map(t => <ReminderCard key={t.id} task={t} type="upcoming" onComplete={handleComplete} onReschedule={setRescheduleTask} />)}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Reschedule modal */}
        {rescheduleTask && (
          <RescheduleModal
            task={rescheduleTask}
            onSave={fetchTasks}
            onClose={() => setRescheduleTask(null)}
          />
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 100,
            background: toast.color, color: "white",
            borderRadius: 14, padding: "12px 18px",
            fontSize: 13, fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            animation: "fadeSlideUp 0.3s ease",
          }}>
            {toast.text}
          </div>
        )}

      </div>
    </>
  );
}