"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PlannerPage() {
  const router = useRouter();
  const [plan, setPlan] = useState([]);
  const [hours, setHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generatePlan() {
    setLoading(true);
    const res = await fetch(`/api/planner?hours=${hours}`);
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setPlan(data);
    setLoading(false);
    setGenerated(true);
  }

  function getPriorityColor(priority) {
    if (priority === "high") return "bg-red-100 text-red-700";
    if (priority === "medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Study Planner</h1>
            <p className="text-slate-500 mt-1">Auto-generated study schedule based on your tasks</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Dashboard
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Study Settings</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-slate-600 mb-1 block">
                Available study hours per day: <span className="font-bold text-slate-900">{hours} hours</span>
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full accent-slate-800"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1 hr</span>
                <span>12 hrs</span>
              </div>
            </div>
            <button
              onClick={generatePlan}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>

        {/* Plan Output */}
        {generated && (
          <div className="mt-4 space-y-4">
            {plan.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                <p className="text-slate-400 text-lg">No pending tasks found</p>
                <p className="text-slate-400 text-sm mt-1">Add tasks first then generate your plan</p>
              </div>
            ) : (
              plan.map((day) => (
                <div key={day.day} className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    📅 Day {day.day}
                  </h3>
                  <div className="space-y-3">
                    {day.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-800">{task.title}</p>
                          <p className="text-sm text-slate-500">{task.subject}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-sm text-slate-500">
                            ⏱ {task.allocatedHours} hr{task.allocatedHours > 1 ? "s" : ""}
                          </span>
                          <span className="text-sm text-slate-400">
                            {task.daysLeft <= 0 ? "⚠️ Overdue" : `${task.daysLeft}d left`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mt-3 text-right">
                    Total: {day.tasks.reduce((sum, t) => sum + t.allocatedHours, 0)} hrs
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}