"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRIORITY = {
  high:   { label: "High",   bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
  medium: { label: "Medium", bg: "#fef9c3", color: "#ca8a04", dot: "#eab308" },
  low:    { label: "Low",    bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
};

const PLAN_STORAGE_KEY = "lucy_study_plan";

// ── Day card ──────────────────────────────────────────────────
function DayCard({ day, index }) {
  const totalHours = day.tasks.reduce((sum, t) => sum + (t.allocatedHours || 0), 0);

  return (
    <div style={{
      background: "white", borderRadius: 20, padding: 20,
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      border: "1.5px solid #f1f5f9",
      animation: `fadeSlideUp 0.4s ease ${index * 0.1}s both`,
    }}>
      {/* Day header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, paddingBottom: 12,
        borderBottom: "1.5px solid #f1f5f9",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #4F8CFF, #667eea)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "white",
          }}>
            {day.day}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Day {day.day}
            </p>
            {day.date && (
              <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{day.date}</p>
            )}
          </div>
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "#4F8CFF",
          background: "#EBF1FF", padding: "4px 12px", borderRadius: 20,
        }}>
          ⏱ {totalHours} hr{totalHours !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {day.tasks.map((task, i) => {
          const pri = PRIORITY[task.priority] || PRIORITY.medium;
          const isOverdue = task.daysLeft <= 0;

          return (
            <div key={i} style={{
              background: "#f8fafc", borderRadius: 14, padding: "14px 16px",
              borderLeft: `3px solid ${pri.dot}`,
              position: "relative",
            }}>
              {/* Task top */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                    {task.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                    📖 {task.subject}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: pri.bg, color: pri.color,
                  }}>
                    {pri.label}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    background: isOverdue ? "#fee2e2" : "#EBF1FF",
                    color: isOverdue ? "#dc2626" : "#4F8CFF",
                  }}>
                    {isOverdue ? "⚠️ Overdue" : `${task.daysLeft}d left`}
                  </span>
                </div>
              </div>

              {/* Hours bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: task.tip ? 10 : 0 }}>
                <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 10,
                    width: `${Math.min((task.allocatedHours / 4) * 100, 100)}%`,
                    background: "linear-gradient(90deg, #4F8CFF, #667eea)",
                    transition: "width 1s ease",
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4F8CFF", whiteSpace: "nowrap" }}>
                  {task.allocatedHours} hr{task.allocatedHours !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Lucy's tip */}
              {task.tip && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  background: "linear-gradient(135deg, #EBF1FF, #f0f4ff)",
                  borderRadius: 10, padding: "10px 12px",
                  border: "1px solid #dbeafe",
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>🎓</span>
                  <p style={{ fontSize: 12, color: "#3b5bdb", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                    {task.tip}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function PlannerPage() {
  const router = useRouter();
  const [plan, setPlan] = useState([]);
  const [hours, setHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [message, setMessage] = useState("");
  const [lucyIntro, setLucyIntro] = useState("");

  // Load saved plan on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLAN_STORAGE_KEY);
      if (saved) {
        const { plan: savedPlan, lucyIntro: savedIntro, hours: savedHours } = JSON.parse(saved);
        if (savedPlan?.length > 0) {
          setPlan(savedPlan);
          setLucyIntro(savedIntro || "");
          setHours(savedHours || 4);
          setGenerated(true);
        }
      }
    } catch {}
  }, []);

  async function generatePlan() {
    setLoading(true);
    setMessage("");
    setLucyIntro("");
    localStorage.removeItem(PLAN_STORAGE_KEY);

    try {
      const language = localStorage.getItem("lucyLanguage") || "en";

      const res = await fetch("/api/lucy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "plan", hours, language }),
      });

      if (res.status === 401) { router.push("/login"); return; }

      const data = await res.json();

      if (data.message) {
        setMessage(data.message);
        setPlan([]);
      } else if (data.plan) {
        const totalTasks = data.plan.reduce((sum, d) => sum + d.tasks.length, 0);
        setPlan(data.plan);
        const intro = language === "kh"
            ? `ខ្ញុំបានរៀបចំផែនការសិក្សា ${data.plan.length} ថ្ងៃ សម្រាប់កិច្ចការ ${totalTasks} ។ ចាប់ផ្តើមថ្ងៃទី 1 ហើយកុំឱ្យខ្ញុំខក!`
            : `I've mapped out ${data.plan.length} study days covering ${totalTasks} task${totalTasks !== 1 ? "s" : ""}. Follow this plan and don't you dare skip a day! 😤`;
        setLucyIntro(intro);
        // Save to localStorage so it persists across tab switches
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ plan: data.plan, lucyIntro: intro, hours }));
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setGenerated(true);
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          background: "white", borderRadius: 20, padding: "20px 24px",
          marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>
              🤖 AI Study Planner
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, margin: "4px 0 0" }}>
              Lucy builds your personalized study schedule
            </p>
          </div>
          <Link href="/lucy" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 12,
            background: "#EBF1FF", color: "#4F8CFF",
            fontSize: 12, fontWeight: 700, textDecoration: "none",
          }}>
            🎓 Add tasks via Lucy
          </Link>
        </div>

        {/* Settings card */}
        <div style={{
          background: "white", borderRadius: 20, padding: "20px 24px",
          marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
            Study Settings
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: "#64748b", display: "block", marginBottom: 8 }}>
                Available study hours per day:{" "}
                <span style={{ fontWeight: 800, color: "#4F8CFF" }}>{hours} hours</span>
              </label>
              <input
                type="range" min="1" max="12" value={hours}
                onChange={e => setHours(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: "#4F8CFF" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                <span>1 hr</span><span>12 hrs</span>
              </div>
            </div>
            <button
              onClick={generatePlan}
              disabled={loading}
              style={{
                padding: "12px 24px", borderRadius: 14, border: "none",
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #1e293b, #334155)",
                color: "white", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Generating...
                </>
              ) : "✨ Generate Plan"}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{
            background: "white", borderRadius: 20, padding: 40,
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              width: 48, height: 48, border: "4px solid #EBF1FF",
              borderTopColor: "#4F8CFF", borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
            }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>
              Lucy is analyzing your tasks...
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>
              Building your personalized schedule
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && generated && (
          <>
            {/* No tasks message */}
            {message && (
              <div style={{
                background: "white", borderRadius: 20, padding: 48,
                textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{message}</p>
                <Link href="/lucy" style={{
                  display: "inline-block", marginTop: 16, padding: "10px 20px",
                  borderRadius: 12, background: "linear-gradient(135deg,#4F8CFF,#667eea)",
                  color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none",
                }}>
                  🎓 Tell Lucy about your tasks
                </Link>
              </div>
            )}

            {/* Lucy intro message */}
            {plan.length > 0 && lucyIntro && (
              <div style={{
                background: "linear-gradient(135deg, #1e293b, #334155)",
                borderRadius: 20, padding: "16px 20px", marginBottom: 16,
                display: "flex", alignItems: "flex-start", gap: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                animation: "fadeSlideUp 0.4s ease",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #4F8CFF, #667eea)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>
                  🎓
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#4F8CFF", marginBottom: 4 }}>Lucy</p>
                  <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, margin: 0 }}>{lucyIntro}</p>
                </div>
              </div>
            )}

            {/* Plan days */}
            {plan.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {plan.map((day, i) => (
                  <DayCard key={i} day={day} index={i} />
                ))}

                {/* Summary footer */}
                <div style={{
                  background: "#f8fafc", borderRadius: 16, padding: "14px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  border: "1.5px solid #e2e8f0",
                }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    📊 {plan.length} study days · {plan.reduce((s, d) => s + d.tasks.length, 0)} tasks · {plan.reduce((s, d) => s + d.tasks.reduce((ts, t) => ts + (t.allocatedHours || 0), 0), 0)} total hours
                  </span>
                  <button onClick={generatePlan}
                    style={{
                      padding: "6px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0",
                      background: "white", color: "#4F8CFF", fontSize: 12,
                      fontWeight: 700, cursor: "pointer",
                    }}>
                    🔄 Regenerate
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Initial empty state */}
        {!generated && !loading && (
          <div style={{
            background: "white", borderRadius: 20, padding: 56,
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
              background: "linear-gradient(135deg, #4F8CFF, #667eea)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
            }}>
              🎓
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
              Ready to build your study plan?
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
              Lucy will analyze your tasks and create a smart schedule with study tips for each task.
            </p>
            <button onClick={generatePlan}
              style={{
                padding: "12px 32px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #4F8CFF, #667eea)",
                color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(79,140,255,0.3)",
              }}>
              ✨ Generate My Plan
            </button>
          </div>
        )}

      </div>
    </>
  );
}