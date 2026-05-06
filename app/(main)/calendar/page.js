"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setTasks(data);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function getTasksForDay(day) {
    return tasks.filter((t) => {
      const d = new Date(t.deadline);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  const today = new Date();
  const isToday = (day) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
        <p className="text-slate-500 text-sm mt-1">View your tasks by date</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F4FF] text-slate-600">
              ‹
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F4FF] text-slate-600">
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayTasks = getTasksForDay(day);
              const hasOverdue = dayTasks.some(t => t.status === "pending" && new Date(t.deadline) < new Date());
              const hasHigh = dayTasks.some(t => t.priority === "high");
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm transition-all ${
                    isSelected
                      ? "bg-[#4F8CFF] text-white"
                      : isToday(day)
                      ? "bg-[#EBF1FF] text-[#4F8CFF] font-bold"
                      : "hover:bg-[#F0F4FF] text-slate-700"
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayTasks.slice(0, 3).map((t, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? "bg-white" :
                          t.status === "completed" ? "bg-green-400" :
                          hasOverdue ? "bg-red-400" :
                          hasHigh ? "bg-red-400" :
                          t.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                        }`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-red-400" /> High/Overdue
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-yellow-400" /> Medium
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-2 h-2 rounded-full bg-green-400" /> Low/Done
            </div>
          </div>
        </div>

        {/* Selected day tasks */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {selectedDay
              ? `${monthNames[month]} ${selectedDay}`
              : "Select a day"}
          </h3>

          {!selectedDay ? (
            <p className="text-slate-400 text-sm text-center py-8">
              Click on a day to see tasks
            </p>
          ) : selectedTasks.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No tasks on this day 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map((task) => (
                <div key={task.id} className="p-3 bg-[#F0F4FF] rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{task.subject}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                      task.status === "completed" ? "bg-green-100 text-green-600" :
                      task.priority === "high" ? "bg-red-100 text-red-600" :
                      task.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
                      "bg-green-100 text-green-600"
                    }`}>
                      {task.status === "completed" ? "Done" : task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    ⏰ {new Date(task.deadline).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* This month summary */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-3">THIS MONTH</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total tasks</span>
                <span className="font-medium text-slate-800">
                  {tasks.filter(t => {
                    const d = new Date(t.deadline);
                    return d.getFullYear() === year && d.getMonth() === month;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Completed</span>
                <span className="font-medium text-green-600">
                  {tasks.filter(t => {
                    const d = new Date(t.deadline);
                    return d.getFullYear() === year && d.getMonth() === month && t.status === "completed";
                  }).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pending</span>
                <span className="font-medium text-[#4F8CFF]">
                  {tasks.filter(t => {
                    const d = new Date(t.deadline);
                    return d.getFullYear() === year && d.getMonth() === month && t.status === "pending";
                  }).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}