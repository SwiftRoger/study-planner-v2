import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { deadline: "asc" },
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter(
    (t) => t.status === "pending" && new Date(t.deadline) < new Date()
  ).length;

  const upcoming = tasks
  .filter((t) => t.status === "pending" && new Date(t.deadline) >= new Date())
  .slice(0, 3);

const today = new Date();
const todayTasks = tasks.filter((t) => {
  const d = new Date(t.deadline);
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
});

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hello, {user.name}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Let's make today productive.</p>
        </div>
        <LogoutButton />
        {/* Today's Schedule */}
<div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-slate-800">📅 Today's Schedule</h2>
    <span className="text-sm text-slate-400">
      {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
    </span>
  </div>
  {todayTasks.length === 0 ? (
    <p className="text-slate-400 text-center py-6 text-sm">No tasks due today 🎉</p>
  ) : (
    <div className="space-y-3">
      {todayTasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between p-4 bg-[#F0F4FF] rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-8 rounded-full ${
              task.priority === "high" ? "bg-red-400" :
              task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
            }`} />
            <div>
              <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                {task.title}
              </p>
              <p className="text-xs text-slate-500">{task.subject}</p>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            task.status === "completed" ? "bg-green-100 text-green-600" :
            task.priority === "high" ? "bg-red-100 text-red-600" :
            task.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
            "bg-green-100 text-green-600"
          }`}>
            {task.status === "completed" ? "Done" : task.priority}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Total Tasks</p>
          <h2 className="text-3xl font-bold mt-1 text-slate-800">{total}</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Pending</p>
          <h2 className="text-3xl font-bold mt-1 text-[#4F8CFF]">{pending}</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Completed</p>
          <h2 className="text-3xl font-bold mt-1 text-green-500">{completed}</h2>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-sm">Overdue</p>
          <h2 className="text-3xl font-bold mt-1 text-red-500">{overdue}</h2>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Upcoming Deadlines */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Deadlines</h2>
            <Link href="/tasks" className="text-sm text-[#4F8CFF] hover:underline">View all →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No upcoming tasks 🎉</p>
              <Link href="/tasks" className="text-sm text-[#4F8CFF] mt-2 inline-block hover:underline">
                Add your first task
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((task) => {
                const daysLeft = Math.ceil(
                  (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-[#F0F4FF] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${
                        task.priority === "high" ? "bg-red-400" :
                        task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                      }`} />
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        daysLeft <= 2 ? "bg-red-100 text-red-600" : "bg-[#EBF1FF] text-[#4F8CFF]"
                      }`}>
                        {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Overall Progress</h2>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#EBF1FF" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="#4F8CFF"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - percent / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{percent}%</span>
                <span className="text-xs text-slate-400">Done</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-4">{completed} of {total} tasks completed</p>
          </div>

          {/* Quick links */}
          <div className="mt-4 space-y-2">
            <Link href="/planner" className="flex items-center gap-2 p-3 bg-[#F0F4FF] rounded-xl hover:bg-[#EBF1FF] transition-colors">
              <span>🤖</span>
              <span className="text-sm font-medium text-[#4F8CFF]">Generate Study Plan</span>
            </Link>
            <Link href="/progress" className="flex items-center gap-2 p-3 bg-[#F0F4FF] rounded-xl hover:bg-[#EBF1FF] transition-colors">
              <span>📊</span>
              <span className="text-sm font-medium text-[#4F8CFF]">View Full Progress</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}