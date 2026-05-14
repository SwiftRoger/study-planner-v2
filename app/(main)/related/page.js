"use client";

import { useState } from "react";

const systems = [
  {
    name: "MyStudyLife",
    university: "Used globally by students",
    country: "🌍 Global",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
    description: "A popular student planner app used by millions worldwide. Manages class schedules, homework, exams and reminders across all devices.",
    features: ["Class Schedule", "Homework Tracking", "Exam Reminders", "Cross-device Sync"],
    similarity: "High",
    url: "https://mystudylife.com",
    color: "#4F8CFF",
  },
  {
    name: "Google Classroom",
    university: "Google for Education",
    country: "🇺🇸 USA",
    image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=400&h=200&fit=crop",
    description: "Google's education platform used by universities worldwide. Manages assignments, deadlines and class materials in one place.",
    features: ["Assignment Management", "Deadline Tracking", "Class Materials", "Google Integration"],
    similarity: "Medium",
    url: "https://classroom.google.com",
    color: "#22c55e",
  },
  {
    name: "Todoist for Students",
    university: "Doist Inc.",
    country: "🌍 Global",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=200&fit=crop",
    description: "Popular task management tool widely used by students. Features priority levels, recurring tasks, reminders and progress tracking.",
    features: ["Priority Levels", "Due Dates", "Recurring Tasks", "Progress Tracking"],
    similarity: "High",
    url: "https://todoist.com",
    color: "#f97316",
  },
  {
    name: "Notion Student",
    university: "Used by MIT, Stanford students",
    country: "🇺🇸 USA",
    image: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=400&h=200&fit=crop",
    description: "All-in-one workspace used by top university students. Combines notes, tasks, calendar and databases for comprehensive study management.",
    features: ["Notes & Tasks", "Calendar View", "Database", "Templates"],
    similarity: "Medium",
    url: "https://notion.so",
    color: "#a855f7",
  },
  {
    name: "Canvas LMS",
    university: "Harvard, Yale, MIT",
    country: "🇺🇸 USA",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop",
    description: "Learning Management System used by top universities worldwide including Harvard and MIT. Tracks assignments, grades and course progress.",
    features: ["Course Management", "Grade Tracking", "Assignment Submission", "Analytics"],
    similarity: "Medium",
    url: "https://www.instructure.com/canvas",
    color: "#ec4899",
  },
  {
    name: "Moodle",
    university: "Used by 30,000+ institutions",
    country: "🌍 Global",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=200&fit=crop",
    description: "Open-source learning platform used by over 30,000 educational institutions worldwide. Provides course management and student progress tracking.",
    features: ["Course Management", "Progress Tracking", "Quizzes", "Open Source"],
    similarity: "Low",
    url: "https://moodle.org",
    color: "#667eea",
  },
];

const similarities = {
  High: "bg-green-100 text-green-600",
  Medium: "bg-yellow-100 text-yellow-600",
  Low: "bg-slate-100 text-slate-600",
};

export default function RelatedPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = systems.filter(s =>
    filter === "all" ? true : s.similarity === filter
  );

  return (
    <div className="max-w-5xl mx-auto relative">

      {/* Floating shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="animate-float absolute top-10 right-10 w-24 h-24 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }} />
        <div className="animate-float-delayed absolute bottom-20 left-10 w-16 h-16 opacity-5"
          style={{ background: "linear-gradient(135deg, #a8edea, #4F8CFF)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }} />
      </div>

      <div className="relative z-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Related Systems</h1>
          <p className="text-slate-500 text-sm mt-1">
            Existing study planner systems used by universities worldwide
          </p>
        </div>

        {/* Our system highlight */}
        <div className="mb-6 p-5 rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }}>
          <div className="flex items-center gap-3 mb-2">
            <img src="/num-logo.png" alt="NUM" className="w-10 h-10 object-contain" />
            <div>
              <p className="font-bold">Our System — AI-Based Study Planner</p>
              <p className="text-white/70 text-sm">National University of Management, Cambodia 🇰🇭</p>
            </div>
          </div>
          <p className="text-white/80 text-sm">
            Unlike existing tools, our system uses rule-based AI to automatically generate
            personalized study schedules based on deadlines, priorities and available time —
            specifically designed for university students.
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-3 mb-6 flex gap-2">
          {["all", "High", "Medium", "Low"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? "bg-[#4F8CFF] text-white"
                  : "text-slate-500 hover:bg-[#EBF1FF] hover:text-[#4F8CFF]"
              }`}>
              {f === "all" ? "All Systems" : `${f} Similarity`}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((system, i) => (
            <div key={system.name}
              className="bg-white rounded-2xl shadow-sm overflow-hidden card-hover cursor-pointer"
              style={{ animation: `fadeSlideUp 0.4s ease ${i * 0.1}s forwards`, opacity: 0 }}
              onClick={() => setSelected(system)}>

              {/* Image */}
              <div className="w-full h-36 overflow-hidden relative">
                <img src={system.image} alt={system.name}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, ${system.color}99, transparent)` }} />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-bold text-sm">{system.name}</p>
                  <p className="text-white/80 text-xs">{system.country}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400">{system.university}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${similarities[system.similarity]}`}>
                    {system.similarity} Similarity
                  </span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{system.description}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {system.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-xs bg-[#EBF1FF] text-[#4F8CFF] px-2 py-0.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">📊 Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F0F4FF]">
                  <th className="text-left px-4 py-3 rounded-l-xl font-medium text-slate-600">Feature</th>
                  <th className="text-center px-4 py-3 font-medium text-[#4F8CFF]">Our System</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500">MyStudyLife</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500">Todoist</th>
                  <th className="text-center px-4 py-3 rounded-r-xl font-medium text-slate-500">Notion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { feature: "AI Study Schedule", ours: true, msl: false, todoist: false, notion: false },
                  { feature: "Rule-based Priority", ours: true, msl: false, todoist: true, notion: false },
                  { feature: "Pomodoro Timer", ours: true, msl: false, todoist: false, notion: false },
                  { feature: "AI Suggestions", ours: true, msl: false, todoist: false, notion: false },
                  { feature: "Progress Tracking", ours: true, msl: true, todoist: true, notion: true },
                  { feature: "Calendar View", ours: true, msl: true, todoist: false, notion: true },
                  { feature: "Student Focused", ours: true, msl: true, todoist: false, notion: false },
                  { feature: "Free to Use", ours: true, msl: true, todoist: false, notion: false },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-[#F8FAFF]">
                    <td className="px-4 py-3 font-medium text-slate-700">{row.feature}</td>
                    {[row.ours, row.msl, row.todoist, row.notion].map((val, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {val
                          ? <span className="text-green-500 text-lg">✓</span>
                          : <span className="text-slate-200 text-lg">✕</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            style={{ animation: "fadeSlideUp 0.3s ease forwards" }}
            onClick={e => e.stopPropagation()}>

            <div className="w-full h-48 overflow-hidden relative">
              <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0"
                style={{ background: `linear-gradient(to top, ${selected.color}, transparent)` }} />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-bold text-xl">{selected.name}</p>
                <p className="text-white/80 text-sm">{selected.country} · {selected.university}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40">
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{selected.description}</p>

              <h3 className="font-semibold text-slate-800 mb-2">Key Features:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.features.map((f) => (
                  <span key={f} className="text-xs bg-[#EBF1FF] text-[#4F8CFF] px-3 py-1 rounded-full font-medium">
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${similarities[selected.similarity]}`}>
                  {selected.similarity} Similarity to Our System
                </span>
                <a href={selected.url} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium"
                  style={{ background: `linear-gradient(135deg, ${selected.color}, #667eea)` }}>
                  Visit Website →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}