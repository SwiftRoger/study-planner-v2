// ============================================================
//  lib/lucy.js  —  Lucy's Brain v3
// ============================================================

export const LUCY_VERSION = "1.0.0";

export function getLanguage() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("lucyLanguage") || "en";
}

export function setLanguage(lang) {
  if (typeof window !== "undefined") {
    localStorage.setItem("lucyLanguage", lang);
  }
}

export function detectKhmer(text) {
  return /[\u1780-\u17FF]/.test(text);
}

// ── Core system prompt ────────────────────────────────────────
export function buildSystemPrompt(language, taskContext = "") {
  const isKhmer = language === "kh";

  const englishPrompt = `You are Lucy, a warm but strict AI study companion at NUM Cambodia.
Personality: motherly, caring, firm, professional, casual older-sister energy.
LANGUAGE: ENGLISH ONLY. Never use Khmer script in your reply.

════════════════════════════════════════
TASK DETECTION — HIGHEST PRIORITY RULE
════════════════════════════════════════
Scan EVERY user message for these keywords:
- homework, assignment, project, essay, report, quiz, test, exam, midterm, final, presentation, lab, exercise, task, deadline, due

If ANY of these words appear, OR if the student mentions something they need to do by a date:
→ You MUST include [TASK_DATA] at the end of your reply. No exceptions.

FORMAT (copy exactly):
[TASK_DATA]{"title":"TASK TITLE IN CAPS","subject":"Subject Name","deadline":"next monday / 2026-06-15 / tomorrow / etc","priority":"high","notes":"one helpful tip"}[/TASK_DATA]

Priority rules:
- "hard", "difficult", "important", "can't fail", deadline within 3 days → "high"  
- Normal task, 4-7 days → "medium"
- Easy, more than 1 week → "low"
- When unsure → "medium"

EXAMPLES:
User: "i have math homework next monday" 
→ Reply normally + [TASK_DATA]{"title":"MATH HOMEWORK","subject":"Math","deadline":"next monday","priority":"medium","notes":"Start early, review your notes first"}[/TASK_DATA]

User: "i just got a call i have homework for geography next monday"
→ Reply normally + [TASK_DATA]{"title":"GEOGRAPHY HOMEWORK","subject":"Geography","deadline":"next monday","priority":"medium","notes":"Review your geography notes and textbook"}[/TASK_DATA]

User: "can you add my biology midterm 2 weeks from now"
→ Reply normally + [TASK_DATA]{"title":"BIOLOGY MIDTERM","subject":"Biology","deadline":"in 2 weeks","priority":"high","notes":"Create a study schedule and start reviewing now"}[/TASK_DATA]

════════════════════════════════════════
DO NOT include [TASK_DATA] when:
- Student is just chatting
- Asking what tasks they have
- Asking for study tips (no new task mentioned)
════════════════════════════════════════

OTHER CAPABILITIES:
- Answer study questions clearly
- Give motivation and study strategies  
- Summarize current tasks when asked
- Be firm about deadlines: "next monday means you start TODAY"

Keep replies concise: 2-4 sentences + task data if needed.

${taskContext ? `STUDENT'S CURRENT TASKS:\n${taskContext}` : "No tasks yet."}`;

  const khmerPrompt = `អ្នកគឺជា Lucy ជំនួយការសិក្សា AI នៅ NUM កម្ពុជា។
បុគ្គលិកលក្ខណៈ: កក់ក្តៅ តឹងរ៉ឹង វិជ្ជាជីវៈ ដូចម្តាយ
ភាសា: ខ្មែរទាំងស្រុង

════════════════════════════
ការរកឃើញកិច្ចការ — ច្បាប់ 1
════════════════════════════
បើសិស្សលើកឡើងអំពី: កិច្ចការ ការប្រឡង ផ្នែក របាយការណ៍ ឬផុតកំណត់
→ ត្រូវតែបញ្ចូល [TASK_DATA] នៅចុងសារ:

[TASK_DATA]{"title":"ចំណងជើង","subject":"មុខវិជ្ជា","deadline":"ថ្ងៃ","priority":"high/medium/low","notes":"ដំបូន្មាន"}[/TASK_DATA]

${taskContext ? `កិច្ចការបច្ចុប្បន្ន:\n${taskContext}` : "មិនទាន់មានកិច្ចការ។"}`;

  return isKhmer ? khmerPrompt : englishPrompt;
}

// ── Briefing prompt ───────────────────────────────────────────
export function buildBriefingPrompt(language, tasks, userName) {
  const pending = tasks.filter(t => t.status === "pending");
  const overdue = tasks.filter(t => t.status === "pending" && new Date(t.deadline) < new Date());
  const dueToday = tasks.filter(t => {
    const d = new Date(t.deadline);
    const today = new Date();
    return t.status === "pending" &&
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  });
  const dueSoon = tasks.filter(t => {
    const diff = new Date(t.deadline) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    return t.status === "pending" && days > 0 && days <= 3;
  });
  const highPriority = pending.filter(t => t.priority === "high");
  const taskSummary = pending.slice(0, 5).map(t => {
    const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return `- ${t.title} (${t.subject}) | ${t.priority} | ${daysLeft <= 0 ? "OVERDUE" : daysLeft + "d left"}`;
  }).join("\n");

  if (language === "kh") {
    return `អ្នកគឺជា Lucy។ សរសេរការណែនាំប្រចាំថ្ងៃជាភាសាខ្មែរ សម្រាប់ ${userName}។
ទិន្នន័យ: ជំពោះ ${pending.length} | ហួសសម័យ ${overdue.length} | ថ្ងៃនេះ ${dueToday.length} | ក្នុង 3ថ្ងៃ ${dueSoon.length} | ខ្ពស់ ${highPriority.length}
កិច្ចការ:\n${taskSummary || "មិនមាន"}
សរសេរ 3-4 ប្រយោគ ម្តាយ+តឹងរ៉ឹង។ ព្រមានបើហួសសម័យ។ ចប់ដោយដំបូន្មានតែមួយ។`;
  }

  return `You are Lucy. Write a morning briefing in English for ${userName}.
Stats: Pending ${pending.length} | Overdue ${overdue.length} | Today ${dueToday.length} | Due soon ${dueSoon.length} | High priority ${highPriority.length}
Tasks:\n${taskSummary || "No tasks"}
Write 3-4 sentences, motherly but firm tone. Warn about overdue. End with one specific actionable tip. Use actual task names.`;
}

// ── Task context ──────────────────────────────────────────────
export function buildTaskContext(tasks) {
  if (!tasks || tasks.length === 0) return "";
  const pending = tasks.filter(t => t.status === "pending");
  if (pending.length === 0) return "All tasks completed!";
  return pending.slice(0, 8).map(t => {
    const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return `• ${t.title} | ${t.subject} | ${t.priority} | ${daysLeft <= 0 ? "OVERDUE" : daysLeft + "d left"}`;
  }).join("\n");
}

// ── Parse task from response ──────────────────────────────────
export function parseTaskFromResponse(text) {
  const match = text.match(/\[TASK_DATA\]([\s\S]*?)\[\/TASK_DATA\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[1].trim());
  } catch (e) {
    console.error("Task parse error:", e.message, "| Raw:", match[1]);
    return null;
  }
}

export function cleanResponseText(text) {
  return text.replace(/\[TASK_DATA\][\s\S]*?\[\/TASK_DATA\]/g, "").trim();
}

// ── Deadline normalizer ───────────────────────────────────────
export function normalizeDeadline(deadlineStr) {
  if (!deadlineStr) return null;

  const parsed = new Date(deadlineStr);
  if (!isNaN(parsed.getTime()) && deadlineStr.includes("-")) {
    return parsed.toISOString();
  }

  const now = new Date();
  const lower = deadlineStr.toLowerCase();

  if (lower.includes("tomorrow")) {
    const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }
  if (lower.includes("today")) {
    const d = new Date(now); d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  const weekdays = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  for (let i = 0; i < weekdays.length; i++) {
    if (lower.includes(weekdays[i])) {
      const d = new Date(now);
      let diff = i - d.getDay();
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      d.setHours(23, 59, 0, 0);
      return d.toISOString();
    }
  }

  const inDays = lower.match(/in (\d+) day/);
  if (inDays) {
    const d = new Date(now); d.setDate(d.getDate() + parseInt(inDays[1])); d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  const inWeeks = lower.match(/in (\d+) week/);
  if (inWeeks) {
    const d = new Date(now); d.setDate(d.getDate() + parseInt(inWeeks[1]) * 7); d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  // Handle "next next week" / "2 weeks" = 14 days
  if (lower.includes("next next week") || lower.includes("week after next")) {
    const d = new Date(now); d.setDate(d.getDate() + 14); d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  if (lower.includes("next week")) {
    const d = new Date(now); d.setDate(d.getDate() + 7); d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  if (lower.match(/\d+ week/)) {
    const weeks = parseInt(lower.match(/(\d+) week/)[1]);
    const d = new Date(now); d.setDate(d.getDate() + weeks * 7); d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  // Handle "june 25", "jun 25", "25 june", "june 25th", "25th june" etc.
  const months = {
    jan:0, january:0, feb:1, february:1, mar:2, march:2,
    apr:3, april:3, may:4, jun:5, june:5, jul:6, july:6,
    aug:7, august:7, sep:8, september:8, oct:9, october:9,
    nov:10, november:10, dec:11, december:11,
  };

  // Try "month day" → "june 25" or "june 25th"
  const monthDayMatch = lower.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/);
  if (monthDayMatch && months[monthDayMatch[1]] !== undefined) {
    const month = months[monthDayMatch[1]];
    const day = parseInt(monthDayMatch[2]);
    const d = new Date(now);
    d.setMonth(month);
    d.setDate(day);
    // If date already passed this year, use next year
    if (d < now) d.setFullYear(d.getFullYear() + 1);
    d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  // Try "day month" → "25 june" or "25th june"
  const dayMonthMatch = lower.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)/);
  if (dayMonthMatch && months[dayMonthMatch[2]] !== undefined) {
    const month = months[dayMonthMatch[2]];
    const day = parseInt(dayMonthMatch[1]);
    const d = new Date(now);
    d.setMonth(month);
    d.setDate(day);
    if (d < now) d.setFullYear(d.getFullYear() + 1);
    d.setHours(23, 59, 0, 0);
    return d.toISOString();
  }

  // Fallback: 7 days
  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 7);
  fallback.setHours(23, 59, 0, 0);
  return fallback.toISOString();
}