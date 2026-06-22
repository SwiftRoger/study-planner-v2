"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const PRIORITY = {
  high:   { stripe: "bg-red-400",    badge: "bg-red-100 text-red-600",    dot: "#f87171" },
  medium: { stripe: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-600", dot: "#fbbf24" },
  low:    { stripe: "bg-green-400",  badge: "bg-green-100 text-green-600", dot: "#4ade80" },
};

function isOverdue(t) {
  return t.status === "pending" && new Date(t.deadline) < new Date();
}

function daysLeft(deadline) {
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

function toDatetimeLocal(iso) {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Logout Button ─────────────────────────────────────────────
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

// ── 3D Road Timeline ──────────────────────────────────────────
function RoadTimeline({ tasks, onSelect }) {
  const completed = useMemo(() => {
    return tasks
      .filter((t) => t.status === "completed")
      // FIX 2: use completedAt instead of updatedAt (matches schema)
      .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt))
      .slice(0, 5);
  }, [tasks]);

  const pending = useMemo(() => {
    return tasks
      .filter((t) => t.status === "pending")
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, [tasks]);

  const dots = [
    ...completed.map((t, i) => ({
      task: t,
      pct: 50 + ((i + 1) / (completed.length + 1)) * 45,
      color: "#4ade80",
      label: "✓",
    })),
    ...pending.map((t, i) => ({
      task: t,
      pct: 50 - ((i + 1) / (pending.length + 1)) * 45,
      color: isOverdue(t) ? "#f87171" : "#4F8CFF",
      label: isOverdue(t) ? "!" : "",
    })),
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">Your Journey</h2>
      <p className="text-xs text-slate-400 mb-4">Behind you = done · Ahead = coming up</p>

      <div style={{ perspective: "700px", height: 320, position: "relative" }}>
        <div
          style={{
            position: "relative",
            height: "100%",
            transform: "rotateX(55deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Road surface */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 150,
              transform: "translateX(-50%)",
              background: "linear-gradient(to top, #1e293b, #475569)",
              clipPath: "polygon(28% 100%, 72% 100%, 86% 0%, 14% 0%)",
            }}
          >
            {/* Center dashed line */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 3,
                transform: "translateX(-50%)",
                background: "repeating-linear-gradient(to top, #fbbf24 0 16px, transparent 16px 32px)",
              }}
            />
          </div>

          {/* Horizon fog */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -20,
              width: 200,
              height: 80,
              transform: "translateX(-50%)",
              background: "linear-gradient(to top, transparent, #F8FAFC)",
              pointerEvents: "none",
            }}
          />

          {/* "Today" marker */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <div className="w-5 h-5 rounded-full bg-white border-4 border-[#4F8CFF] shadow-lg" />
          </div>

          {/* Task dots */}
          {dots.map(({ task, pct, color, label }) => {
            const distFromCenter = Math.abs(pct - 50) / 45;
            const scale = 1.15 - distFromCenter * 0.6;
            return (
              <button
                key={task.id}
                onClick={() => onSelect?.(task)}
                className="group"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: `${pct}%`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: color,
                    border: "2px solid white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    fontSize: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  {label}
                </div>
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    position: "absolute",
                    bottom: "140%",
                    left: "50%",
                    transform: "translateX(-50%) rotateX(-55deg)",
                    background: "#1e293b",
                    color: "white",
                    fontSize: 11,
                    padding: "4px 8px",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {task.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Done</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4F8CFF] inline-block" /> Upcoming</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Overdue</span>
      </div>
    </div>
  );
}

// ── Graph (Trend / Breakdown) ────────────────────────────────
function TaskGraph({ tasks }) {
  const [view, setView] = useState("trend");

  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = tasks.filter((t) => {
        if (t.status !== "completed") return false;
        // FIX 2: use completedAt instead of updatedAt (matches schema)
        const done = new Date(t.completedAt || t.createdAt);
        return done.toDateString() === d.toDateString();
      }).length;
      days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), count });
    }
    return days;
  }, [tasks]);

  const breakdown = useMemo(() => {
    const high = tasks.filter((t) => t.priority === "high").length;
    const medium = tasks.filter((t) => t.priority === "medium").length;
    const low = tasks.filter((t) => t.priority === "low").length;
    return [
      { label: "High", count: high, color: "bg-red-400" },
      { label: "Medium", count: medium, color: "bg-yellow-400" },
      { label: "Low", count: low, color: "bg-green-400" },
    ];
  }, [tasks]);

  const maxTrend = Math.max(1, ...trendData.map((d) => d.count));
  const maxBreakdown = Math.max(1, ...breakdown.map((b) => b.count));

  const chartW = 220, chartH = 90;
  const points = trendData.map((d, i) => {
    const x = (i / (trendData.length - 1)) * chartW;
    const y = chartH - (d.count / maxTrend) * (chartH - 10);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Stats</h2>
        <div className="flex gap-1 bg-[#F0F4FF] rounded-full p-1">
          <button
            onClick={() => setView("trend")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              view === "trend" ? "bg-[#4F8CFF] text-white" : "text-slate-500"
            }`}
          >
            Trend
          </button>
          <button
            onClick={() => setView("breakdown")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              view === "breakdown" ? "bg-[#4F8CFF] text-white" : "text-slate-500"
            }`}
          >
            Breakdown
          </button>
        </div>
      </div>

      {view === "trend" ? (
        <div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: 100 }}>
            <polyline points={points} fill="none" stroke="#4F8CFF" strokeWidth="2.5" strokeLinecap="round" />
            {trendData.map((d, i) => {
              const x = (i / (trendData.length - 1)) * chartW;
              const y = chartH - (d.count / maxTrend) * (chartH - 10);
              return <circle key={i} cx={x} cy={y} r="3" fill="#4F8CFF" />;
            })}
          </svg>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            {trendData.map((d, i) => <span key={i}>{d.label}</span>)}
          </div>
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{b.label}</span>
                <span>{b.count}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${b.color} rounded-full transition-all`}
                  style={{ width: `${(b.count / maxBreakdown) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Task Card ──────────────────────────────────────────────
function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const p = PRIORITY[task.priority] || PRIORITY.low;
  const overdue = isOverdue(task);
  const dl = daysLeft(task.deadline);

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm card-hover">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-10 rounded-full ${p.stripe}`} />
        <button
          onClick={() => onToggle(task)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
            task.status === "completed" ? "bg-green-400 border-green-400 text-white" : "border-slate-300"
          }`}
        >
          {task.status === "completed" ? "✓" : ""}
        </button>
        <div>
          <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
            {task.title}
          </p>
          <p className="text-xs text-slate-500">{task.subject}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            task.status === "completed"
              ? "bg-green-100 text-green-600"
              : overdue
              ? "bg-red-100 text-red-600"
              : "bg-[#EBF1FF] text-[#4F8CFF]"
          }`}
        >
          {task.status === "completed" ? "Done" : overdue ? `Overdue ${Math.abs(dl)}d` : dl === 0 ? "Due today" : `${dl}d left`}
        </span>
        <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-[#4F8CFF] text-sm">✏️</button>
        <button onClick={() => onDelete(task)} className="text-slate-400 hover:text-red-500 text-sm">🗑️</button>
      </div>
    </div>
  );
}

// ── Add/Edit Modal ────────────────────────────────────────
function TaskFormModal({ initialTask, onClose, onSave }) {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [subject, setSubject] = useState(initialTask?.subject || "");
  const [deadline, setDeadline] = useState(toDatetimeLocal(initialTask?.deadline));
  const [priority, setPriority] = useState(initialTask?.priority || "medium");
  // FIX 3: include notes field to match schema + API
  const [notes, setNotes] = useState(initialTask?.notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSave({
      id: initialTask?.id,
      title,
      subject,
      deadline: new Date(deadline).toISOString(),
      priority,
      notes,
    });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {initialTask ? "Edit Task" : "Add Task"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-500">Title</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Subject</label>
            <input
              value={subject} onChange={(e) => setSubject(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Deadline</label>
            <input
              type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#4F8CFF]"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Priority</label>
            <select
              value={priority} onChange={(e) => setPriority(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#4F8CFF]"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {/* FIX 3: notes field */}
          <div>
            <label className="text-xs text-slate-500">Notes (optional)</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#4F8CFF] resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-[#4F8CFF] text-white text-sm font-medium disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ────────────────────────────────────
function DeleteConfirmModal({ task, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-3xl mb-2">🗑️</p>
        <h2 className="text-base font-semibold text-slate-800 mb-1">Delete this task?</h2>
        <p className="text-sm text-slate-500 mb-5">"{task.title}" will be permanently removed.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm">
            Cancel
          </button>
          <button
            disabled={deleting}
            onClick={async () => { setDeleting(true); await onConfirm(task.id); }}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [formTask, setFormTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
    });
    fetch("/api/tasks").then((r) => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then((d) => { if (d) { setTasks(d); setLoading(false); } });
  }, [router]);

  const counts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending" && !isOverdue(t)).length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (search && !`${t.title} ${t.subject}`.toLowerCase().includes(search.toLowerCase())) return false;
        if (filter === "pending") return t.status === "pending" && !isOverdue(t);
        if (filter === "overdue") return isOverdue(t);
        if (filter === "completed") return t.status === "completed";
        return true;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [tasks, filter, search]);

  async function refreshTasks() {
    const d = await fetch("/api/tasks").then((r) => r.json());
    setTasks(d);
  }

  async function handleToggle(task) {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    refreshTasks();
  }

  async function handleSave(data) {
    if (data.id) {
      // FIX 1: send isEdit: true so the API does a full update, not just status
      await fetch(`/api/tasks/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isEdit: true }),
      });
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setFormTask(null);
    refreshTasks();
  }

  async function handleDelete(id) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setDeleteTask(null);
    refreshTasks();
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4F8CFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "overdue", label: "Overdue" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Background shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="animate-float absolute top-20 right-20 w-32 h-32 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }} />
        <div className="animate-float-delayed absolute bottom-20 left-20 w-16 h-16 opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #a8edea)", transform: "rotate(45deg)" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 card-enter">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
            <p className="text-slate-500 text-sm mt-1">
              {counts.all} tasks · {counts.overdue} overdue
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFormTask("new")}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium"
              style={{ background: "linear-gradient(135deg, #4F8CFF 0%, #667eea 100%)" }}
            >
              + Add Task
            </button>
            <LogoutButton />
          </div>
        </div>

        {/* Search row */}
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search tasks by title or subject..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#4F8CFF] bg-white"
          />
        </div>

        {/* Centerpiece: tabs / road / graph */}
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_280px] gap-6 mb-8">
          {/* Filter tabs sidebar */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 lg:flex-shrink text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between gap-2 ${
                  filter === tab.key ? "bg-[#4F8CFF] text-white" : "bg-white text-slate-500 hover:bg-[#F0F4FF]"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs ${filter === tab.key ? "text-white/80" : "text-slate-400"}`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Road timeline */}
          <RoadTimeline tasks={tasks} onSelect={(t) => setFormTask(t)} />

          {/* Graph */}
          <TaskGraph tasks={tasks} />
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-slate-400 text-sm">No tasks match this view.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => setFormTask(t)}
                onDelete={(t) => setDeleteTask(t)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {formTask && (
        <TaskFormModal
          initialTask={formTask === "new" ? null : formTask}
          onClose={() => setFormTask(null)}
          onSave={handleSave}
        />
      )}
      {deleteTask && (
        <DeleteConfirmModal
          task={deleteTask}
          onClose={() => setDeleteTask(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}