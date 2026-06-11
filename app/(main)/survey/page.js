"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SCALE = [
  { value: 1, label: "Strongly Disagree", emoji: "😞" },
  { value: 2, label: "Disagree",          emoji: "😕" },
  { value: 3, label: "Neutral",           emoji: "😐" },
  { value: 4, label: "Agree",             emoji: "🙂" },
  { value: 5, label: "Strongly Agree",    emoji: "😄" },
];

export default function SurveyPage() {
  const router = useRouter();
  const [surveys, setSurveys]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => {
    fetch("/api/survey").then(r => {
      if (r.status === 401) { router.push("/login"); return null; }
      return r.json();
    }).then(d => { if (d) { setSurveys(d); setLoading(false); } });
  }, [router]);

  function handleSelect(survey) {
    setSelected(survey);
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAnswer(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }

  const allAnswered = selected && selected.questions.every(q => answers[q.id] !== undefined);
  const progress = selected
    ? Math.round((Object.keys(answers).length / selected.questions.length) * 100)
    : 0;

  async function handleSubmit() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surveyId: selected.id, answers }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      setToast("✅ Survey submitted! Thank you for your feedback.");
      setTimeout(() => setToast(null), 4000);
      // Refresh surveys to update alreadySubmitted
      fetch("/api/survey").then(r => r.json()).then(d => setSurveys(d));
    } else {
      setToast(`❌ ${data.message}`);
      setTimeout(() => setToast(null), 3000);
    }
  }

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
        .scale-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(79,140,255,0.2) !important}
      `}</style>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>📝 Surveys</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Share your feedback to help improve the system</p>
        </div>

        {/* No surveys */}
        {surveys.length === 0 ? (
          <div style={{ background: "white", borderRadius: 20, padding: 60, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>No surveys available</p>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Check back later for new surveys</p>
          </div>
        ) : !selected ? (
          /* Survey list */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {surveys.map((s, i) => (
              <div key={s.id} style={{
                background: "white", borderRadius: 16, padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                border: `1.5px solid ${s.alreadySubmitted ? "#bbf7d0" : "#e0e7ff"}`,
                animation: `fadeSlideUp 0.4s ease ${i*0.07}s both`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>{s.title}</h3>
                      {s.alreadySubmitted && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#16a34a" }}>
                          ✅ Submitted
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px" }}>{s.description}</p>
                    )}
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                      📋 {s.questions.length} questions · 5-point Likert scale
                    </p>
                  </div>
                  {!s.alreadySubmitted ? (
                    <button onClick={() => handleSelect(s)} style={{
                      padding: "10px 20px", borderRadius: 12, border: "none",
                      background: "linear-gradient(135deg,#4F8CFF,#667eea)",
                      color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      flexShrink: 0, boxShadow: "0 4px 12px rgba(79,140,255,0.3)",
                    }}>
                      Start →
                    </button>
                  ) : (
                    <div style={{ padding: "10px 16px", borderRadius: 12, background: "#f0fdf4", color: "#16a34a", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                      Done ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        ) : submitted ? (
          /* Thank you screen */
          <div style={{ background: "white", borderRadius: 20, padding: 60, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", animation: "fadeSlideUp 0.4s ease" }}>
            <p style={{ fontSize: 56, margin: "0 0 16px" }}>🎉</p>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>Thank you!</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>
              Your feedback has been submitted successfully. It helps us improve the system!
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setSelected(null)} style={{
                padding: "10px 20px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                background: "white", color: "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}>
                ← Back to surveys
              </button>
              <Link href="/dashboard" style={{
                padding: "10px 20px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#4F8CFF,#667eea)",
                color: "white", fontWeight: 700, fontSize: 13, textDecoration: "none",
              }}>
                Go to Dashboard
              </Link>
            </div>
          </div>

        ) : (
          /* Survey form */
          <div>
            {/* Back + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20 }}>←</button>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: 0 }}>{selected.title}</h2>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Please rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree)</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: "white", borderRadius: 14, padding: "12px 16px", marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Progress</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4F8CFF" }}>
                  {Object.keys(answers).length}/{selected.questions.length} answered
                </span>
              </div>
              <div style={{ width: "100%", background: "#f1f5f9", borderRadius: 99, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#4F8CFF,#667eea)", borderRadius: 99, transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* Questions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {selected.questions.map((q, i) => {
                const answered = answers[q.id];
                return (
                  <div key={q.id} style={{
                    background: "white", borderRadius: 16, padding: "18px 20px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    border: `1.5px solid ${answered ? "#bfdbfe" : "#f1f5f9"}`,
                    animation: `fadeSlideUp 0.4s ease ${i*0.04}s both`,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#4F8CFF", minWidth: 24, marginTop: 1 }}>{i+1}.</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: "0 0 4px" }}>{q.question}</p>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#e0e7ff", color: "#4F8CFF", fontWeight: 600 }}>{q.category}</span>
                      </div>
                    </div>

                    {/* Likert scale */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {SCALE.map(s => {
                        const isSelected = answered === s.value;
                        return (
                          <button
                            key={s.value}
                            onClick={() => handleAnswer(q.id, s.value)}
                            className="scale-btn"
                            style={{
                              flex: 1, minWidth: 60, padding: "10px 6px", borderRadius: 12, cursor: "pointer",
                              border: isSelected ? "2px solid #4F8CFF" : "2px solid #e2e8f0",
                              background: isSelected ? "#EBF1FF" : "white",
                              color: isSelected ? "#4F8CFF" : "#64748b",
                              fontWeight: isSelected ? 800 : 500,
                              fontSize: 11, textAlign: "center", transition: "all 0.15s",
                              boxShadow: isSelected ? "0 4px 12px rgba(79,140,255,0.2)" : "none",
                            }}
                          >
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.emoji}</div>
                            <div style={{ fontSize: 16, fontWeight: 800 }}>{s.value}</div>
                            <div style={{ fontSize: 9, lineHeight: 1.2, marginTop: 2 }}>{s.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none",
                background: allAnswered ? "linear-gradient(135deg,#4F8CFF,#667eea)" : "#e2e8f0",
                color: allAnswered ? "white" : "#94a3b8",
                fontWeight: 800, fontSize: 15, cursor: allAnswered ? "pointer" : "not-allowed",
                boxShadow: allAnswered ? "0 4px 20px rgba(79,140,255,0.3)" : "none",
                transition: "all 0.2s",
              }}
            >
              {submitting ? "Submitting..." : allAnswered ? "✅ Submit Survey" : `Answer all questions to submit (${Object.keys(answers).length}/${selected.questions.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 100,
          background: toast.startsWith("✅") ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)",
          color: "white", borderRadius: 14, padding: "12px 18px",
          fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          animation: "fadeSlideUp 0.3s ease",
        }}>
          {toast}
        </div>
      )}
    </>
  );
}