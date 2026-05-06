"use client";

import { useState, useEffect, useRef } from "react";

export default function TimerPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("study"); // study | short | long
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const modes = {
    study: { label: "Study", minutes: 25, color: "text-[#4F8CFF]", bg: "bg-[#EBF1FF]" },
    short: { label: "Short Break", minutes: 5, color: "text-green-500", bg: "bg-green-50" },
    long: { label: "Long Break", minutes: 15, color: "text-purple-500", bg: "bg-purple-50" },
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s === 0) {
            setMinutes((m) => {
              if (m === 0) {
                clearInterval(intervalRef.current);
                setIsRunning(false);
                if (mode === "study") setSessions((prev) => prev + 1);
                return 0;
              }
              return m - 1;
            });
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  function switchMode(newMode) {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(newMode);
    setMinutes(modes[newMode].minutes);
    setSeconds(0);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMinutes(modes[mode].minutes);
    setSeconds(0);
  }

  const total = modes[mode].minutes * 60;
  const remaining = minutes * 60 + seconds;
  const progress = ((total - remaining) / total) * 100;
  const circumference = 2 * Math.PI * 90;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Study Timer</h1>
        <p className="text-slate-500 text-sm mt-1">Stay focused with Pomodoro technique</p>
      </div>

      {/* Mode selector */}
      <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-2 mb-6">
        {Object.entries(modes).map(([key, val]) => (
          <button key={key} onClick={() => switchMode(key)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === key ? `${val.bg} ${val.color}` : "text-slate-500 hover:bg-slate-50"
            }`}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center">
        <div className="relative w-56 h-56">
          <svg className="w-56 h-56 -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#F0F4FF" strokeWidth="12" />
            <circle cx="100" cy="100" r="90" fill="none"
              stroke={mode === "study" ? "#4F8CFF" : mode === "short" ? "#22c55e" : "#a855f7"}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progress) / 100}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${modes[mode].color}`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-slate-400 text-sm mt-1">{modes[mode].label}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-8">
          <button onClick={reset}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
            Reset
          </button>
          <button onClick={() => setIsRunning(!isRunning)}
            className={`px-10 py-3 rounded-xl text-white font-medium transition-colors ${
              isRunning ? "bg-red-400 hover:bg-red-500" : "bg-[#4F8CFF] hover:bg-[#3a7ae0]"
            }`}>
            {isRunning ? "Pause" : "Start"}
          </button>
        </div>

        {/* Sessions count */}
        <div className="mt-8 flex gap-2 items-center">
          <span className="text-slate-400 text-sm">Sessions completed:</span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${
                i < sessions % 4 ? "bg-[#4F8CFF]" : "bg-slate-100"
              }`} />
            ))}
          </div>
          <span className="text-slate-500 text-sm font-medium">{sessions} total</span>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
        <h3 className="font-semibold text-slate-700 mb-3">💡 Pomodoro Tips</h3>
        <div className="space-y-2 text-sm text-slate-500">
          <p>🍅 Work for <span className="font-medium text-slate-700">25 minutes</span>, then take a 5 min break</p>
          <p>🔁 After <span className="font-medium text-slate-700">4 sessions</span>, take a longer 15 min break</p>
          <p>📵 Remove all distractions during study sessions</p>
        </div>
      </div>
    </div>
  );
}