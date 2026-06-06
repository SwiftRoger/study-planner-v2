"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "lucy_chat_history";

// ── Lucy avatar ───────────────────────────────────────────────
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
    >
      🎓
    </div>
  );
}

// ── Task confirmation card ────────────────────────────────────
function TaskConfirmCard({ task, onConfirm, onCancel, language }) {
  const [priority, setPriority] = useState(task.priority || "medium");
  const [title, setTitle] = useState(task.title || "");
  const [subject, setSubject] = useState(task.subject || "");
  const [editing, setEditing] = useState(false);

  const deadlineDisplay = (() => {
    try {
      const d = new Date(task.deadline);
      if (isNaN(d)) return task.deadline;
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch { return task.deadline; }
  })();

  const priorityColors = {
    low: { bg: "#dcfce7", color: "#16a34a", border: "#16a34a" },
    medium: { bg: "#fef9c3", color: "#ca8a04", border: "#ca8a04" },
    high: { bg: "#fee2e2", color: "#dc2626", border: "#dc2626" },
  };

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: 16, marginBottom: 16,
      boxShadow: "0 4px 20px rgba(79,140,255,0.15)",
      border: "1.5px solid #e0e7ff",
      animation: "fadeSlideUp 0.3s ease forwards",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>📚</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4F8CFF" }}>
          {language === "kh" ? "Lucy ចង់បន្ថែមកិច្ចការនេះ" : "Lucy wants to add this task"}
        </span>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            marginLeft: "auto", fontSize: 11, padding: "3px 10px",
            borderRadius: 8, border: "1px solid #e2e8f0",
            background: editing ? "#EBF1FF" : "white",
            color: editing ? "#4F8CFF" : "#94a3b8",
            cursor: "pointer", fontWeight: 600,
          }}
        >
          ✏️ {editing ? (language === "kh" ? "រួចរាល់" : "Done") : (language === "kh" ? "កែប្រែ" : "Edit")}
        </button>
      </div>

      {/* Task details */}
      <div style={{ background: "#F8FAFF", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                {language === "kh" ? "ចំណងជើង" : "TITLE"}
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
                  padding: "6px 10px", fontSize: 13, marginTop: 2,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                {language === "kh" ? "មុខវិជ្ជា" : "SUBJECT"}
              </label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{
                  width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
                  padding: "6px 10px", fontSize: 13, marginTop: 2,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{title}</p>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
              📖 {language === "kh" ? "មុខវិជ្ជា" : "Subject"}: <strong>{subject}</strong>
            </p>
            <p style={{ fontSize: 12, color: "#64748b" }}>
              📅 {language === "kh" ? "ផុតកំណត់" : "Deadline"}: <strong>{deadlineDisplay}</strong>
            </p>
          </>
        )}
      </div>

      {/* Priority picker */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 6 }}>
          {language === "kh" ? "អាទិភាព" : "PRIORITY"}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {["low", "medium", "high"].map((p) => {
            const c = priorityColors[p];
            const selected = priority === p;
            return (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 10, cursor: "pointer",
                  border: selected ? `2px solid ${c.border}` : "2px solid #e2e8f0",
                  background: selected ? c.bg : "white",
                  color: selected ? c.color : "#94a3b8",
                  fontWeight: selected ? 700 : 500,
                  fontSize: 12, transition: "all 0.15s",
                }}
              >
                {p === "low" ? "🟢" : p === "medium" ? "🟡" : "🔴"} {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => onConfirm({ ...task, title, subject, priority })}
          style={{
            flex: 2, padding: "10px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #4F8CFF, #667eea)",
            color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(79,140,255,0.3)",
          }}
        >
          ✅ {language === "kh" ? "បន្ថែមកិច្ចការ" : "Add Task"}
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: "10px", borderRadius: 12,
            border: "1.5px solid #e2e8f0", background: "white",
            color: "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}
        >
          ❌ {language === "kh" ? "បោះបង់" : "Cancel"}
        </button>
      </div>
    </div>
  );
}

// ── Task saved toast ──────────────────────────────────────────
function TaskToast({ task, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config = task.completed
    ? { bg: "linear-gradient(135deg, #22c55e, #16a34a)", shadow: "rgba(34,197,94,0.4)", icon: "✅", title: "Task completed!", body: `"${task.title}" is done! Great job! 🎉` }
    : task.cancelled
    ? { bg: "linear-gradient(135deg, #f97316, #ea580c)", shadow: "rgba(249,115,22,0.4)", icon: "🗑️", title: "Task removed!", body: `"${task.title}" has been deleted.` }
    : { bg: "linear-gradient(135deg, #4F8CFF, #667eea)", shadow: "rgba(79,140,255,0.4)", icon: "✅", title: "Task saved!", body: `${task.title} — ${task.priority} priority` };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 100,
      background: config.bg, color: "white", borderRadius: 16, padding: "14px 18px",
      boxShadow: `0 8px 32px ${config.shadow}`,
      maxWidth: 300, animation: "slideUp 0.3s ease",
    }}>
      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{config.icon} {config.title}</p>
      <p style={{ fontSize: 12, opacity: 0.9 }}>{config.body}</p>
      <button onClick={onClose} style={{
        position: "absolute", top: 8, right: 10,
        background: "none", border: "none", color: "white",
        cursor: "pointer", fontSize: 14, opacity: 0.7,
      }}>✕</button>
    </div>
  );
}

// ── Typing dots ───────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#4F8CFF",
          animation: "bounce 1.2s ease infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────
function MessageBubble({ msg, isLatest }) {
  const isLucy = msg.role === "assistant";
  return (
    <div style={{
      display: "flex", flexDirection: isLucy ? "row" : "row-reverse",
      alignItems: "flex-end", gap: 10, marginBottom: 16,
      animation: isLatest ? "fadeSlideUp 0.35s ease forwards" : "none",
    }}>
      {isLucy && <LucyAvatar size={34} />}
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isLucy ? "flex-start" : "flex-end" }}>
        {isLucy && <span style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>Lucy</span>}
        <div style={{
          padding: "12px 16px",
          borderRadius: isLucy ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
          background: isLucy ? "white" : "linear-gradient(135deg, #4F8CFF 0%, #667eea 100%)",
          color: isLucy ? "#1e293b" : "white",
          fontSize: 14, lineHeight: 1.6,
          boxShadow: isLucy ? "0 2px 12px rgba(0,0,0,0.06)" : "0 4px 16px rgba(79,140,255,0.3)",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
        <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{msg.time || ""}</span>
      </div>
    </div>
  );
}

const QUICK_EN = [
  "What tasks do I have this week?",
  "I have an exam coming up, help me plan",
  "What should I study today?",
  "I'm feeling overwhelmed with my tasks",
];
const QUICK_KH = [
  "តើខ្ញុំមានកិច្ចការអ្វីខ្លះអាទិត្យនេះ?",
  "ខ្ញុំមានប្រឡង សូមជួយរៀបចំផែនការ",
  "ថ្ងៃនេះខ្ញុំគួរសិក្សាអ្វី?",
  "ខ្ញុំមានអារម្មណ៍ភ័យខ្លាចកិច្ចការច្រើន",
];

function detectKhmerText(text) {
  return /[\u1780-\u17FF]/.test(text);
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────────
export default function LucyPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [toast, setToast] = useState(null);
  const [userName, setUserName] = useState("there");
  // Pending task waiting for confirmation
  const [pendingTask, setPendingTask] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load on mount ─────────────────────────────────────────
  useEffect(() => {
    const savedLang = localStorage.getItem("lucyLanguage") || "en";
    setLanguage(savedLang);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {}

    fetch("/api/me").then(r => r.json()).then(d => {
      const name = d.user ? d.user.name.split(" ")[0] : "there";
      setUserName(name);
      const lang = localStorage.getItem("lucyLanguage") || "en";
      const greet = lang === "kh"
        ? `សួស្តី! ខ្ញុំឈ្មោះ Lucy 🎓\nខ្ញុំជាជំនួយការសិក្សា AI របស់អ្នក។\nតើខ្ញុំអាចជួយអ្នកបានដោយរបៀបណាថ្ងៃនេះ?`
        : `Hi ${name}! I'm Lucy 🎓\nI'm your AI study companion. Tell me about assignments, exams, or tasks and I'll help you stay on track.\nWhat's on your plate today?`;
      const initial = [{ role: "assistant", content: greet, time: now() }];
      setMessages(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    });
  }, []);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d.user) setUserName(d.user.name.split(" ")[0]);
    });
  }, []);

  // ── Persist messages ──────────────────────────────────────
  useEffect(() => {
    if (messages && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pendingTask]);

  // ── Language toggle ───────────────────────────────────────
  function toggleLanguage() {
    const next = language === "en" ? "kh" : "en";
    setLanguage(next);
    localStorage.setItem("lucyLanguage", next);
    setMessages(prev => [...(prev || []), {
      role: "assistant",
      content: next === "kh"
        ? "បានប្តូរទៅភាសាខ្មែរ! 🇰🇭 តើខ្ញុំអាចជួយអ្នកបានដោយរបៀបណា?"
        : "Switched to English! 🇺🇸 How can I help you?",
      time: now(),
    }]);
  }

  // ── Clear chat ────────────────────────────────────────────
  function clearChat() {
    localStorage.removeItem(STORAGE_KEY);
    setPendingTask(null);
    const lang = localStorage.getItem("lucyLanguage") || "en";
    const greet = lang === "kh"
      ? `សួស្តី! ខ្ញុំឈ្មោះ Lucy 🎓\nតើខ្ញុំអាចជួយអ្នកបានដោយរបៀបណាថ្ងៃនេះ?`
      : `Hi ${userName}! I'm Lucy 🎓\nWhat's on your plate today?`;
    const initial = [{ role: "assistant", content: greet, time: now() }];
    setMessages(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }

  // ── Confirm task save ─────────────────────────────────────
  async function confirmTask(taskData) {
    setPendingTask(null);
    try {
      const res = await fetch("/api/lucy/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (data.task) {
        setToast(data.task);
        setMessages(prev => [...(prev || []), {
          role: "assistant",
          content: language === "kh"
            ? `បានរក្សាទុករួចហើយ! "${data.task.title}" ត្រូវបានបន្ថែមទៅបញ្ជីកិច្ចការរបស់អ្នក។ 📋`
            : `Got it! "${data.task.title}" has been added to your tasks. Go check it out! 📋`,
          time: now(),
        }]);
      }
    } catch {
      setMessages(prev => [...(prev || []), {
        role: "assistant",
        content: language === "kh" ? "មានបញ្ហាក្នុងការរក្សាទុក សូមព្យាយាមម្តងទៀត។" : "Oops, couldn't save the task. Try again!",
        time: now(),
      }]);
    }
  }

  function cancelTask() {
    setPendingTask(null);
    setMessages(prev => [...(prev || []), {
      role: "assistant",
      content: language === "kh"
        ? "យល់ព្រម! ខ្ញុំបានលុបចោល។ ប្រាប់ខ្ញុំបើអ្នកចង់បន្ថែមក្រោយ។"
        : "No problem! Task cancelled. Just let me know if you want to add it later.",
      time: now(),
    }]);
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage(text) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role: "user", content, time: now() };
    const updatedMessages = [...(messages || []), userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const userTypedKhmer = detectKhmerText(content);
      const effectiveLang = userTypedKhmer ? "kh" : language;

      const res = await fetch("/api/lucy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          language: effectiveLang,
        }),
      });

      if (res.status === 401) { router.push("/login"); return; }

      const data = await res.json();

      setMessages(prev => [...(prev || []), {
        role: "assistant",
        content: data.reply || "Sorry, I had trouble responding. Try again!",
        time: now(),
      }]);

      // Instead of auto-saving, show confirmation card
      if (data.pendingTask) {
        setPendingTask(data.pendingTask);
      }

      // Task was marked complete by Lucy
      if (data.completedTask) {
        setToast({ ...data.completedTask, completed: true });
      }

      // Task was cancelled/deleted by Lucy
      if (data.cancelledTask) {
        setToast({ ...data.cancelledTask, cancelled: true });
      }

    } catch {
      setMessages(prev => [...(prev || []), {
        role: "assistant",
        content: "Oops, something went wrong. Give me a second and try again! 😅",
        time: now(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (messages === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{
          width: 32, height: 32, border: "3px solid #4F8CFF",
          borderTopColor: "transparent", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const quickPrompts = language === "kh" ? QUICK_KH : QUICK_EN;

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .lucy-input:focus{outline:none}
        .quick-btn:hover{background:#EBF1FF !important;color:#4F8CFF !important;border-color:#4F8CFF !important}
        .send-btn:hover{opacity:0.85}
        .send-btn:disabled{opacity:0.5;cursor:not-allowed}
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{
          background: "white", borderRadius: 20, padding: "16px 20px", marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <LucyAvatar size={44} />
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Lucy</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {language === "kh" ? "ជំនួយការសិក្សា AI" : "AI Study Companion · Online"}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={clearChat} style={{
              padding: "8px 12px", borderRadius: 12, border: "1.5px solid #e2e8f0",
              background: "white", cursor: "pointer", fontSize: 12, color: "#94a3b8",
            }}>🗑️ Clear</button>
            <button onClick={toggleLanguage} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 12, border: "1.5px solid #e2e8f0", background: "white",
              cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569",
            }}>
              <span>{language === "en" ? "🇺🇸" : "🇰🇭"}</span>
              <span>{language === "en" ? "EN" : "KH"}</span>
              <span style={{ opacity: 0.4, fontSize: 11 }}>/ {language === "en" ? "KH" : "EN"}</span>
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div style={{
          flex: 1, overflowY: "auto", background: "#F0F4FF",
          borderRadius: 20, padding: "20px 16px", marginBottom: 12,
        }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} isLatest={i === messages.length - 1 && !pendingTask} />
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 16 }}>
              <LucyAvatar size={34} pulse />
              <div style={{ background: "white", borderRadius: "4px 18px 18px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* Task confirmation card */}
          {pendingTask && (
            <TaskConfirmCard
              task={pendingTask}
              language={language}
              onConfirm={confirmTask}
              onCancel={cancelTask}
            />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && !pendingTask && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {quickPrompts.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)} className="quick-btn" style={{
                padding: "7px 14px", borderRadius: 20, border: "1.5px solid #e2e8f0",
                background: "white", fontSize: 12, color: "#475569", cursor: "pointer", fontWeight: 500,
              }}>{p}</button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{
          background: "white", borderRadius: 20, padding: "12px 16px",
          display: "flex", alignItems: "flex-end", gap: 10,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px solid #e2e8f0",
        }}>
          <textarea
            ref={inputRef}
            className="lucy-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "kh"
              ? "សរសេរសាររបស់អ្នកទៅ Lucy... (Enter ដើម្បីផ្ញើ)"
              : "Tell Lucy about your tasks, exams, or ask anything... (Enter to send)"}
            rows={1}
            style={{
              flex: 1, border: "none", resize: "none", fontSize: 14,
              color: "#1e293b", lineHeight: 1.5, background: "transparent",
              maxHeight: 120, overflowY: "auto",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="send-btn"
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #4F8CFF, #667eea)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 4px 12px rgba(79,140,255,0.3)",
            }}
          >
            {loading ? (
              <div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
          {language === "kh"
            ? "Lucy នឹងស្នើសុំការបញ្ជាក់ មុននឹងរក្សាទុកកិច្ចការ"
            : "Lucy will ask for confirmation before saving any task"}
        </p>
      </div>

      {toast && <TaskToast task={toast} onClose={() => setToast(null)} />}
    </>
  );
}