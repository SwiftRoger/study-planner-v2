"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProgressPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter((t) => t.status === "pending" && new Date(t.deadline) < new Date()).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Group by subject
  const bySubject = tasks.reduce((acc, task) => {
    if (!acc[task.subject]) acc[task.subject] = { total: 0, completed: 0 };
    acc[task.subject].total++;
    if (task.status === "completed") acc[task.subject].completed++;
    return acc;
  }, {});
  // Weekly data - last 7 days
const weeklyData = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const dayTasks = tasks.filter((t) => {
    const td = new Date(t.createdAt);
    return td.toDateString() === d.toDateString();
  });
  const doneTasks = tasks.filter((t) => {
    const td = new Date(t.createdAt);
    return td.toDateString() === d.toDateString() && t.status === "completed";
  });
  return {
    label: d.toLocaleDateString("en-US", { weekday: "short" }),
    total: dayTasks.length,
    done: doneTasks.length,
  };
});
const maxVal = Math.max(...weeklyData.map((d) => d.total), 1);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Progress</h1>
            <p className="text-slate-500 mt-1">Track your study progress and performance</p>
          </div>
          {/* Weekly Summary */}
<div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
  <h2 className="text-lg font-semibold text-slate-800 mb-6">Weekly Summary</h2>
  <div className="flex items-end justify-between gap-2 h-40">
    {weeklyData.map((day, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <div className="w-full flex flex-col items-center justify-end gap-0.5" style={{ height: "120px" }}>
          {/* Completed bar */}
          <div
            className="w-full bg-[#4F8CFF] rounded-t-lg transition-all duration-500"
            style={{ height: `${(day.done / maxVal) * 100}px` }}
          />
          {/* Total bar */}
          <div
            className="w-full bg-[#EBF1FF] rounded-t-lg transition-all duration-500"
            style={{ height: `${((day.total - day.done) / maxVal) * 100}px` }}
          />
        </div>
        <span className="text-xs text-slate-400">{day.label}</span>
        <span className="text-xs font-medium text-slate-600">{day.total}</span>
      </div>
    ))}
  </div>
  <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <div className="w-3 h-3 rounded-sm bg-[#4F8CFF]" /> Completed
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <div className="w-3 h-3 rounded-sm bg-[#EBF1FF]" /> Pending
    </div>
  </div>
</div>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-slate-500 text-sm">Total Tasks</p>
            <h2 className="text-3xl font-bold mt-1 text-slate-900">{total}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-slate-500 text-sm">Completed</p>
            <h2 className="text-3xl font-bold mt-1 text-green-600">{completed}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-slate-500 text-sm">Pending</p>
            <h2 className="text-3xl font-bold mt-1 text-yellow-500">{pending}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
            <p className="text-slate-500 text-sm">Overdue</p>
            <h2 className="text-3xl font-bold mt-1 text-red-500">{overdue}</h2>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate-800">Overall Progress</h2>
            <span className="text-2xl font-bold text-slate-900">{percent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4">
            <div
              className="bg-slate-800 h-4 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">{completed} of {total} tasks completed</p>
        </div>

        {/* Progress by Subject */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Progress by Subject</h2>
          {Object.keys(bySubject).length === 0 ? (
            <p className="text-slate-400 text-center py-6">No tasks yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(bySubject).map(([subject, data]) => {
                const subPercent = Math.round((data.completed / data.total) * 100);
                return (
                  <div key={subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{subject}</span>
                      <span className="text-slate-500">{data.completed}/{data.total} tasks ({subPercent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className="bg-slate-700 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${subPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task List with status */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">All Tasks</h2>
          {loading ? (
            <p className="text-slate-400 text-center py-6">Loading...</p>
          ) : tasks.length === 0 ? (
            <p className="text-slate-400 text-center py-6">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className={`font-medium ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-slate-500">{task.subject}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : new Date(task.deadline) < new Date()
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {task.status === "completed" ? "Completed" : new Date(task.deadline) < new Date() ? "Overdue" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}