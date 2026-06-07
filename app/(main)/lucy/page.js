"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "lucy_chat_history";

// ── Lucy Avatar ───────────────────────────────────────────────
function LucyAvatar({ size = 36, pulse = false }) {
  return (
    <div
      className={pulse ? "animate-pulse" : ""}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #4F8CFF 0%, #667eea 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.45, flexShrink: 0,
        boxShadow: "0 2px 12px rgba(79,140,255,0.35)",
      }}
    >🎓</div>
  );
}

// ── Quick Action Bar ──────────────────────────────────────────
function QuickActionBar({ onAction, language }) {
  const buttons = [
    { key: "add",        icon: "➕", label: language === "kh" ? "បន្ថែមកិច្ចការ" : "Add Task",   color: "#4F8CFF" },
    { key: "reschedule", icon: "📅", label: language === "kh" ? "ផ្លាស់ប្តូរ"    : "Reschedule",  color: "#7c3aed" },
    { key: "complete",   icon: "✅", label: language === "kh" ? "បញ្ចប់"          : "Complete",    color: "#16a34a" },
    { key: "delete",     icon: "🗑️", label: language === "kh" ? "លុប"             : "Delete",      color: "#dc2626" },
  ];

  return (
    <div style={{
      display: "flex", gap: 6, flexWrap: "wrap",
      padding: "10px 14px",
      background: "white",
      borderRadius: "0 0 16px 16px",
      borderTop: "1px solid #f1f5f9",
      marginTop: -4,
      marginBottom: 16,
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    }}>
      {buttons.map(b => (
        <button
          key={b.key}
          onClick={() => onAction(b.key)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 20,
            border: `1.5px solid ${b.color}22`,
            background: `${b.color}11`,
            color: b.color, fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${b.color}22`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${b.color}11`; }}
        >
          <span>{b.icon}</span> {b.label}
        </button>
      ))}
    </div>
  );
}

// ── Task Picker (for reschedule/complete/delete) ──────────────
function TaskPicker({ tasks, mode, language, onPick, onClose }) {
  const [selected, setSelected] = useState([]);
  const [newDate, setNewDate] = useState("");

  const isMulti = mode === "complete" || mode === "delete";

  function toggleSelect(id) {
    if (isMulti) {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelected([id]);
    }
  }

  function handleConfirm() {
    if (selected.length === 0) return;
    const pickedTasks = tasks.filter(t => selected.includes(t.id));
    if (mode === "reschedule") {
      onPick(pickedTasks[0], newDate);
    } else {
      onPick(pickedTasks);
    }
  }

  const modeConfig = {
    reschedule: { title: "📅 Pick task to reschedule", color: "#7c3aed", btnLabel: "Reschedule" },
    complete:   { title: "✅ Mark tasks as complete",  color: "#16a34a", btnLabel: "Mark Complete" },
    delete:     { title: "🗑️ Pick tasks to delete",    color: "#dc2626", btnLabel: "Delete" },
  };
  const cfg = modeConfig[mode];

  const pending = tasks.filter(t => t.status === "pending");

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: 16, marginBottom: 16,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      border: "1.5px solid #e0e7ff",
      animation: "fadeSlideUp 0.3s ease forwards",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16 }}>✕</button>
      </div>

      {pending.length === 0 ? (
        <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "12px 0" }}>No pending tasks!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {pending.map(t => {
            const isSelected = selected.includes(t.id);
            const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <div
                key={t.id}
                onClick={() => toggleSelect(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  border: `1.5px solid ${isSelected ? cfg.color : "#e2e8f0"}`,
                  background: isSelected ? `${cfg.color}11` : "#f8fafc",
                  transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: `2px solid ${isSelected ? cfg.color : "#cbd5e1"}`,
                  background: isSelected ? cfg.color : "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {isSelected && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: 0 }}>{t.title}</p>
                  <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0" }}>
                    {t.subject} · {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                  </p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                  background: t.priority === "high" ? "#fee2e2" : t.priority === "medium" ? "#fef9c3" : "#dcfce7",
                  color: t.priority === "high" ? "#dc2626" : t.priority === "medium" ? "#ca8a04" : "#16a34a",
                }}>
                  {t.priority}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Date picker for reschedule */}
      {mode === "reschedule" && selected.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>
            📅 New deadline:
          </label>
          <input
            type="date"
            value={newDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={e => setNewDate(e.target.value)}
            style={{
              width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10,
              padding: "8px 12px", fontSize: 13, outline: "none",
              boxSizing: "border-box", color: "#1e293b",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0 || (mode === "reschedule" && !newDate)}
          style={{
            flex: 2, padding: "10px", borderRadius: 12, border: "none",
            background: selected.length === 0 || (mode === "reschedule" && !newDate)
              ? "#e2e8f0" : `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
            color: selected.length === 0 ? "#94a3b8" : "white",
            fontWeight: 700, fontSize: 13,
            cursor: selected.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {cfg.btnLabel} {selected.length > 0 ? `(${selected.length})` : ""}
        </button>
        <button onClick={onClose} style={{
          flex: 1, padding: "10px", borderRadius: 12,
          border: "1.5px solid #e2e8f0", background: "white",
          color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ── New Task Card ─────────────────────────────────────────────
function AddTaskCard({ language, onConfirm, onClose }) {
  const [form, setForm] = useState({ title: "", subject: "", deadline: "", priority: "medium", notes: "" });

  const priorityColors = {
    low:    { bg: "#dcfce7", color: "#16a34a", border: "#16a34a" },
    medium: { bg: "#fef9c3", color: "#ca8a04", border: "#ca8a04" },
    high:   { bg: "#fee2e2", color: "#dc2626", border: "#dc2626" },
  };

  const isValid = form.title && form.subject && form.deadline;

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: 16, marginBottom: 16,
      boxShadow: "0 4px 20px rgba(79,140,255,0.15)",
      border: "1.5px solid #e0e7ff",
      animation: "fadeSlideUp 0.3s ease forwards",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8CFF" }}>
          ➕ {language === "kh" ? "បន្ថែមកិច្ចការថ្មី" : "Add New Task"}
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 16 }}>✕</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {[
          { label: language === "kh" ? "ចំណងជើង *" : "Title *", key: "title", type: "text", placeholder: "e.g. Math Assignment" },
          { label: language === "kh" ? "មុខវិជ្ជា *" : "Subject *", key: "subject", type: "text", placeholder: "e.g. Mathematics" },
          { label: language === "kh" ? "ផុតកំណត់ *" : "Deadline *", key: "deadline", type: "datetime-local", placeholder: "" },
        ].map(f => (
          <div key={f.key}>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              placeholder={f.placeholder}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        ))}

        <div>
          <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>
            {language === "kh" ? "អាទិភាព" : "Priority"}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["low","medium","high"].map(p => {
              const c = priorityColors[p];
              return (
                <button key={p} onClick={() => setForm({ ...form, priority: p })} style={{
                  flex: 1, padding: "8px 4px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  border: form.priority === p ? `2px solid ${c.border}` : "2px solid #e2e8f0",
                  background: form.priority === p ? c.bg : "white",
                  color: form.priority === p ? c.color : "#94a3b8",
                }}>
                  {p === "low" ? "🟢" : p === "medium" ? "🟡" : "🔴"} {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 4 }}>
            {language === "kh" ? "កំណត់ចំណាំ (ស្រេចចិត្ត)" : "Notes (optional)"}
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={2} placeholder="Any notes..."
            style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => isValid && onConfirm(form)}
          disabled={!isValid}
          style={{
            flex: 2, padding: "10px", borderRadius: 12, border: "none",
            background: isValid ? "linear-gradient(135deg, #4F8CFF, #667eea)" : "#e2e8f0",
            color: isValid ? "white" : "#94a3b8",
            fontWeight: 700, fontSize: 13, cursor: isValid ? "pointer" : "not-allowed",
            boxShadow: isValid ? "0 4px 12px rgba(79,140,255,0.3)" : "none",
          }}
        >
          ✅ {language === "kh" ? "រក្សាទុក" : "Save Task"}
        </button>
        <button onClick={onClose} style={{
          flex: 1, padding: "10px", borderRadius: 12,
          border: "1.5px solid #e2e8f0", background: "white",
          color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Action Confirm Card ───────────────────────────────────────
function ActionConfirmCard({ actions, language, onConfirm, onCancel }) {
  const [editedActions, setEditedActions] = useState(actions);

  function updateDate(index, newDate) {
    const updated = [...editedActions];
    updated[index] = {
      ...updated[index], newDeadline: new Date(newDate).toISOString(),
      newDeadlineDisplay: new Date(newDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
    };
    setEditedActions(updated);
  }

  function removeAction(index) {
    setEditedActions(prev => prev.filter((_, i) => i !== index));
  }

  const actionColors = {
    complete:   { bg: "#dcfce7", color: "#16a34a", border: "#86efac" },
    reschedule: { bg: "#ede9fe", color: "#7c3aed", border: "#c4b5fd" },
    delete:     { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
    add:        { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
  };

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: 16, marginBottom: 16,
      boxShadow: "0 4px 20px rgba(79,140,255,0.15)",
      border: "1.5px solid #e0e7ff",
      animation: "fadeSlideUp 0.3s ease forwards",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>🎓</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8CFF" }}>
          {language === "kh"
            ? `Lucy រៀបចំការផ្លាស់ប្តូរ ${editedActions.length}`
            : `Lucy prepared ${editedActions.length} change${editedActions.length > 1 ? "s" : ""}:`}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {editedActions.map((action, i) => {
          const c = actionColors[action.type] || actionColors.reschedule;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: c.bg, borderRadius: 10, padding: "10px 12px",
              border: `1px solid ${c.border}`,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{action.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: c.color, margin: 0 }}>
                  {action.type === "complete" && `Complete "${action.title}"`}
                  {action.type === "delete" && `Delete "${action.title}"`}
                  {action.type === "reschedule" && (
                    <>
                      Reschedule <strong>"{action.title}"</strong> →{" "}
                      <input
                        type="date"
                        value={action.newDeadline ? action.newDeadline.slice(0,10) : ""}
                        onChange={e => updateDate(i, e.target.value)}
                        style={{ border: `1px solid ${c.border}`, borderRadius: 6, padding: "1px 6px", fontSize: 12, color: c.color, background: "white", cursor: "pointer" }}
                      />
                    </>
                  )}
                </p>
                {action.subject && action.type !== "reschedule" && (
                  <p style={{ fontSize: 11, color: c.color, opacity: 0.7, margin: "2px 0 0" }}>📖 {action.subject}</p>
                )}
              </div>
              <button onClick={() => removeAction(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: c.color, opacity: 0.6, flexShrink: 0 }}>✕</button>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => editedActions.length > 0 && onConfirm(editedActions)}
          disabled={editedActions.length === 0}
          style={{
            flex: 2, padding: "10px", borderRadius: 12, border: "none",
            background: editedActions.length === 0 ? "#e2e8f0" : "linear-gradient(135deg, #4F8CFF, #667eea)",
            color: editedActions.length === 0 ? "#94a3b8" : "white",
            fontWeight: 700, fontSize: 13, cursor: editedActions.length === 0 ? "not-allowed" : "pointer",
          }}
        >✅ {language === "kh" ? "បញ្ជាក់ទាំងអស់" : "Confirm All"}</button>
        <button onClick={onCancel} style={{
          flex: 1, padding: "10px", borderRadius: 12,
          border: "1.5px solid #e2e8f0", background: "white",
          color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>❌ {language === "kh" ? "បោះបង់" : "Cancel"}</button>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 100,
      background: msg.bg || "linear-gradient(135deg, #4F8CFF, #667eea)",
      color: "white", borderRadius: 16, padding: "14px 18px",
      boxShadow: "0 8px 32px rgba(79,140,255,0.4)", maxWidth: 300,
      animation: "slideUp 0.3s ease",
    }}>
      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{msg.title}</p>
      <p style={{ fontSize: 12, opacity: 0.9 }}>{msg.body}</p>
      <button onClick={onClose} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 14, opacity: 0.7 }}>✕</button>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#4F8CFF", animation: "bounce 1.2s ease infinite", animationDelay: `${i*0.2}s` }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg, isLatest }) {
  const isLucy = msg.role === "assistant";
  return (
    <div style={{ display: "flex", flexDirection: isLucy ? "row" : "row-reverse", alignItems: "flex-end", gap: 10, marginBottom: isLatest && isLucy ? 0 : 16, animation: isLatest ? "fadeSlideUp 0.35s ease forwards" : "none" }}>
      {isLucy && <LucyAvatar size={34} />}
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isLucy ? "flex-start" : "flex-end" }}>
        {isLucy && <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>Lucy</span>}
        <div style={{
          padding: "12px 16px",
          borderRadius: isLucy ? (isLatest ? "4px 18px 0 0" : "4px 18px 18px 18px") : "18px 4px 18px 18px",
          background: isLucy ? "white" : "linear-gradient(135deg, #4F8CFF 0%, #667eea 100%)",
          color: isLucy ? "#1e293b" : "white",
          fontSize: 14, lineHeight: 1.6,
          boxShadow: isLucy ? "0 2px 12px rgba(0,0,0,0.06)" : "0 4px 16px rgba(79,140,255,0.3)",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>{msg.content}</div>
        <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{msg.time || ""}</span>
      </div>
    </div>
  );
}

const QUICK_EN = ["What tasks do I have this week?","I have an exam coming up, help me plan","What should I study today?","I'm feeling overwhelmed"];
const QUICK_KH = ["តើខ្ញុំមានកិច្ចការអ្វីខ្លះអាទិត្យនេះ?","ខ្ញុំមានប្រឡង សូមជួយរៀបចំផែនការ","ថ្ងៃនេះខ្ញុំគួរសិក្សាអ្វី?","ខ្ញុំមានអារម្មណ៍ភ័យខ្លាចកិច្ចការច្រើន"];
function detectKhmerText(t) { return /[\u1780-\u17FF]/.test(t); }
function now() { return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }

// ─────────────────────────────────────────────────────────────
export default function LucyPage() {
  const router = useRouter();
  const [messages, setMessages]         = useState(null);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [language, setLanguage]         = useState("en");
  const [toast, setToast]               = useState(null);
  const [userName, setUserName]         = useState("there");
  const [tasks, setTasks]               = useState([]);
  const [activeCard, setActiveCard]     = useState(null); // "add"|"reschedule"|"complete"|"delete"
  const [pendingTask, setPendingTask]   = useState(null); // Lucy auto-detected new task
  const [pendingActions, setPendingActions] = useState(null); // Lucy auto-detected actions
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Load on mount ─────────────────────────────────────────
  useEffect(() => {
    const savedLang = localStorage.getItem("lucyLanguage") || "en";
    setLanguage(savedLang);

    // Load tasks for picker
    fetch("/api/tasks").then(r => r.json()).then(d => { if (Array.isArray(d)) setTasks(d); });

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) { setMessages(parsed); return; }
      }
    } catch {}

    fetch("/api/me").then(r => r.json()).then(d => {
      const name = d.user ? d.user.name.split(" ")[0] : "there";
      setUserName(name);
      const lang = localStorage.getItem("lucyLanguage") || "en";
      const greet = lang === "kh"
        ? `សួស្តី! ខ្ញុំឈ្មោះ Lucy 🎓\nខ្ញុំជាជំនួយការសិក្សា AI របស់អ្នក។ តើខ្ញុំអាចជួយអ្នកបានដោយរបៀបណា?`
        : `Hi ${name}! I'm Lucy 🎓\nI'm your AI study companion. Tell me about assignments, exams, or tasks and I'll help you stay on track.\nWhat's on your plate today?`;
      const initial = [{ role: "assistant", content: greet, time: now() }];
      setMessages(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    });
  }, []);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => { if (d.user) setUserName(d.user.name.split(" ")[0]); });
  }, []);

  useEffect(() => {
    if (messages && messages.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pendingTask, pendingActions, activeCard]);

  function refreshTasks() {
    fetch("/api/tasks").then(r => r.json()).then(d => { if (Array.isArray(d)) setTasks(d); });
  }

  function toggleLanguage() {
    const next = language === "en" ? "kh" : "en";
    setLanguage(next);
    localStorage.setItem("lucyLanguage", next);
    setMessages(prev => [...(prev || []), {
      role: "assistant",
      content: next === "kh" ? "បានប្តូរទៅភាសាខ្មែរ! 🇰🇭" : "Switched to English! 🇺🇸",
      time: now(),
    }]);
  }

  function clearChat() {
    localStorage.removeItem(STORAGE_KEY);
    setActiveCard(null); setPendingTask(null); setPendingActions(null);
    const lang = localStorage.getItem("lucyLanguage") || "en";
    const greet = lang === "kh"
      ? `សួស្តី! Lucy នៅទីនេះ 🎓`
      : `Hi ${userName}! I'm Lucy 🎓\nWhat's on your plate today?`;
    const initial = [{ role: "assistant", content: greet, time: now() }];
    setMessages(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }

  // ── Quick action bar handler ──────────────────────────────
  function handleQuickAction(action) {
    setActiveCard(activeCard === action ? null : action);
    setPendingTask(null);
    setPendingActions(null);
  }

  // ── Add task (manual) ─────────────────────────────────────
  async function handleAddTask(form) {
    setActiveCard(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const task = await res.json();
        setToast({ title: "✅ Task added!", body: `"${task.title}" saved to your tasks.`, bg: "linear-gradient(135deg,#4F8CFF,#667eea)" });
        refreshTasks();
        setMessages(prev => [...(prev||[]), {
          role: "assistant",
          content: language === "kh" ? `បានបន្ថែម "${task.title}" ។ 📋` : `Added "${task.title}" to your tasks! 📋`,
          time: now(),
        }]);
      }
    } catch { setToast({ title: "❌ Error", body: "Couldn't add task.", bg: "linear-gradient(135deg,#ef4444,#dc2626)" }); }
  }

  // ── Task picker confirm (reschedule/complete/delete) ──────
  async function handlePickerConfirm(pickedTask, newDate) {
    setActiveCard(null);
    const actions = [];
    if (activeCard === "reschedule" && pickedTask) {
      actions.push({ type: "reschedule", taskId: pickedTask.id, title: pickedTask.title, subject: pickedTask.subject, newDeadline: new Date(newDate).toISOString() });
    } else if (activeCard === "complete") {
      for (const t of pickedTask) actions.push({ type: "complete", taskId: t.id, title: t.title, subject: t.subject });
    } else if (activeCard === "delete") {
      for (const t of pickedTask) actions.push({ type: "delete", taskId: t.id, title: t.title, subject: t.subject });
    }
    if (actions.length === 0) return;
    await executeActions(actions);
  }

  // ── Execute actions via API ───────────────────────────────
  async function executeActions(actions) {
    setPendingActions(null);
    try {
      const res = await fetch("/api/lucy/actions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions }),
      });
      const data = await res.json();
      const count = data.successCount || 0;
      const completed  = actions.filter(a => a.type === "complete").length;
      const rescheduled = actions.filter(a => a.type === "reschedule").length;
      const deleted    = actions.filter(a => a.type === "delete").length;
      const summary = [
        completed > 0  && `${completed} completed`,
        rescheduled > 0 && `${rescheduled} rescheduled`,
        deleted > 0    && `${deleted} deleted`,
      ].filter(Boolean).join(", ");
      setToast({ title: `✅ ${count} change${count > 1 ? "s" : ""} applied!`, body: summary, bg: "linear-gradient(135deg,#22c55e,#16a34a)" });
      refreshTasks();
      setMessages(prev => [...(prev||[]), {
        role: "assistant",
        content: language === "kh"
          ? `ការផ្លាស់ប្តូរ ${count} ត្រូវបានអនុវត្ត! 🎉`
          : `Done! ${count} change${count > 1 ? "s" : ""} applied. Check your Tasks tab! 🎉`,
        time: now(),
      }]);
    } catch {
      setToast({ title: "❌ Error", body: "Some actions failed.", bg: "linear-gradient(135deg,#ef4444,#dc2626)" });
    }
  }

  // ── Lucy auto-detected task confirm ──────────────────────
  async function confirmLucyTask(taskData) {
    setPendingTask(null);
    try {
      const res = await fetch("/api/lucy/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.task) {
        setToast({ title: "✅ Task saved!", body: `"${data.task.title}" added.`, bg: "linear-gradient(135deg,#4F8CFF,#667eea)" });
        refreshTasks();
        setMessages(prev => [...(prev||[]), {
          role: "assistant",
          content: language === "kh" ? `បានរក្សាទុក "${data.task.title}" ។ 📋` : `Got it! "${data.task.title}" added to your tasks. 📋`,
          time: now(),
        }]);
      }
    } catch { setToast({ title: "❌ Error", body: "Couldn't save task.", bg: "linear-gradient(135deg,#ef4444,#dc2626)" }); }
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage(text) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    setActiveCard(null);
    const userMsg = { role: "user", content, time: now() };
    const updatedMessages = [...(messages || []), userMsg];
    setMessages(updatedMessages);
    setLoading(true);
    try {
      const effectiveLang = detectKhmerText(content) ? "kh" : language;
      const res = await fetch("/api/lucy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "chat", messages: updatedMessages.map(({ role, content }) => ({ role, content })), language: effectiveLang }),
      });
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      setMessages(prev => [...(prev||[]), { role: "assistant", content: data.reply || "Sorry, try again!", time: now() }]);
      if (data.pendingTask) setPendingTask(data.pendingTask);
      if (data.pendingActions && data.pendingActions.length > 0) setPendingActions(data.pendingActions);
    } catch {
      setMessages(prev => [...(prev||[]), { role: "assistant", content: "Oops, something went wrong. Try again! 😅", time: now() }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  }

  function handleKeyDown(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

  if (messages === null) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #4F8CFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const lastMsgIsLucy = messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .lucy-input:focus{outline:none}
        .quick-btn:hover{background:#EBF1FF !important;color:#4F8CFF !important;border-color:#4F8CFF !important}
        .send-btn:hover{opacity:0.85}.send-btn:disabled{opacity:0.5;cursor:not-allowed}
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ background: "white", borderRadius: 20, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LucyAvatar size={44} />
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Lucy</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 12, color: "#64748b" }}>{language === "kh" ? "ជំនួយការសិក្សា AI" : "AI Study Companion · Online"}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={clearChat} style={{ padding: "8px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 12, color: "#94a3b8" }}>🗑️ Clear</button>
            <button onClick={toggleLanguage} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569" }}>
              <span>{language === "en" ? "🇺🇸" : "🇰🇭"}</span>
              <span>{language === "en" ? "EN" : "KH"}</span>
              <span style={{ opacity: 0.4, fontSize: 11 }}>/ {language === "en" ? "KH" : "EN"}</span>
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, overflowY: "auto", background: "#F0F4FF", borderRadius: 20, padding: "20px 16px", marginBottom: 12 }}>

          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const isLucy = msg.role === "assistant";
            return (
              <div key={i}>
                <MessageBubble msg={msg} isLatest={isLast && !loading} />
                {/* Quick action bar after last Lucy message */}
                {isLast && isLucy && !loading && (
                  <div style={{ paddingLeft: 44 }}>
                    <QuickActionBar onAction={handleQuickAction} language={language} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16 }}>
              <LucyAvatar size={34} pulse />
              <div style={{ background: "white", borderRadius: "4px 18px 18px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}><TypingDots /></div>
            </div>
          )}

          {/* Active card from quick action buttons */}
          {activeCard === "add" && (
            <AddTaskCard language={language} onConfirm={handleAddTask} onClose={() => setActiveCard(null)} />
          )}
          {(activeCard === "reschedule" || activeCard === "complete" || activeCard === "delete") && (
            <TaskPicker tasks={tasks} mode={activeCard} language={language} onPick={handlePickerConfirm} onClose={() => setActiveCard(null)} />
          )}

          {/* Lucy auto-detected actions confirmation */}
          {pendingActions && pendingActions.length > 0 && !activeCard && (
            <ActionConfirmCard
              actions={pendingActions} language={language}
              onConfirm={executeActions}
              onCancel={() => { setPendingActions(null); setMessages(prev => [...(prev||[]), { role: "assistant", content: language === "kh" ? "យល់ព្រម! បានលុបចោល។" : "No problem! Changes cancelled.", time: now() }]); }}
            />
          )}

          {/* Lucy auto-detected new task */}
          {pendingTask && !activeCard && !pendingActions && (
            <div style={{ paddingLeft: 44 }}>
              {/* reuse AddTaskCard but pre-filled */}
              <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 4px 20px rgba(79,140,255,0.15)", border: "1.5px solid #e0e7ff", animation: "fadeSlideUp 0.3s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span>📚</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8CFF" }}>{language === "kh" ? "Lucy ចង់បន្ថែមកិច្ចការ" : "Lucy wants to add this task"}</span>
                </div>
                <div style={{ background: "#F8FAFF", borderRadius: 10, padding: 10, marginBottom: 12, fontSize: 13, color: "#1e293b" }}>
                  <p style={{ fontWeight: 700, margin: "0 0 4px" }}>{pendingTask.title}</p>
                  <p style={{ margin: "0 0 2px", color: "#64748b" }}>📖 {pendingTask.subject}</p>
                  <p style={{ margin: 0, color: "#64748b" }}>📅 {new Date(pendingTask.deadline).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {["low","medium","high"].map(p => (
                    <span key={p} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 10, fontSize: 11, fontWeight: 700,
                      background: pendingTask.priority === p ? (p === "high" ? "#fee2e2" : p === "medium" ? "#fef9c3" : "#dcfce7") : "#f1f5f9",
                      color: pendingTask.priority === p ? (p === "high" ? "#dc2626" : p === "medium" ? "#ca8a04" : "#16a34a") : "#94a3b8",
                    }}>{p === "low" ? "🟢" : p === "medium" ? "🟡" : "🔴"} {p}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => confirmLucyTask(pendingTask)} style={{ flex: 2, padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#4F8CFF,#667eea)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✅ {language === "kh" ? "បន្ថែម" : "Add Task"}</button>
                  <button onClick={() => { setPendingTask(null); }} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white", color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>❌</button>
                </div>
              </div>
            </div>
          )}

          {/* Quick prompts */}
          {messages.length <= 2 && !activeCard && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {(language === "kh" ? QUICK_KH : QUICK_EN).map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)} className="quick-btn" style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid #e2e8f0", background: "white", fontSize: 12, color: "#475569", cursor: "pointer", fontWeight: 500 }}>{p}</button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ background: "white", borderRadius: 20, padding: "12px 16px", display: "flex", alignItems: "flex-end", gap: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px solid #e2e8f0" }}>
          <textarea ref={inputRef} className="lucy-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={language === "kh" ? "សរសេរសាររបស់អ្នកទៅ Lucy... (Enter ដើម្បីផ្ញើ)" : "Tell Lucy about your tasks, exams, or ask anything... (Enter to send)"}
            rows={1} style={{ flex: 1, border: "none", resize: "none", fontSize: 14, color: "#1e293b", lineHeight: 1.5, background: "transparent", maxHeight: 120, overflowY: "auto" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="send-btn" style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #4F8CFF, #667eea)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(79,140,255,0.3)" }}>
            {loading
              ? <div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            }
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
          {language === "kh" ? "Lucy នឹងស្នើសុំការបញ្ជាក់ មុននឹងផ្លាស់ប្តូរ" : "Use the action buttons or just chat naturally with Lucy"}
        </p>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}