import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import Link from "next/link";

const quotes = [
  "The secret of getting ahead is getting started. – Mark Twain",
  "Study hard, for the well is deep and our brains are shallow. – Richard Baxter",
  "An investment in knowledge pays the best interest. – Benjamin Franklin",
  "The more that you read, the more things you will know. – Dr. Seuss",
  "Education is the most powerful weapon you can use to change the world. – Nelson Mandela",
  "Success is the sum of small efforts repeated day in and day out. – Robert Collier",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
];

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

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const today = new Date();
  const todayTasks = tasks.filter((t) => {
    const d = new Date(t.deadline);
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  });

  const dueSoon = tasks.filter((t) => {
    const diff = new Date(t.deadline) - new Date();
    const hours = diff / (1000 * 60 * 60);
    return t.status === "pending" && hours > 0 && hours <= 24;
  });

  const quote = quotes[new Date().getDay() % quotes.length];

  return (
    <div className="max-w-5xl mx-auto relative">

      {/* Floating vector shapes background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="animate-float absolute top-20 right-20 w-32 h-32 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }} />
        <div className="animate-float-delayed absolute top-40 left-10 w-20 h-20 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #a8edea, #4F8CFF)" }} />
        <div className="animate-float absolute bottom-40 right-40 w-24 h-24 opacity-5"
          style={{ background: "linear-gradient(135deg, #667eea, #4F8CFF)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }} />
        <div className="animate-float-delayed absolute bottom-20 left-20 w-16 h-16 opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #a8edea)", transform: "rotate(45deg)" }} />
        <div className="animate-pulse-slow absolute top-1/2 right-10 w-40 h-40 rounded-full opacity-3"
          style={{ background: "radial-gradient(circle, #4F8CFF 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 card-enter">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Hello, {user.name}! 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Let's make today productive.</p>
          </div>
          <LogoutButton />
        </div>

        {/* Due soon alert */}
        {dueSoon.length > 0 && (
          <div className="card-enter-1 mb-4 p-4 rounded-2xl border border-orange-200 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-orange-700 text-sm">Due within 24 hours!</p>
              <p className="text-orange-600 text-xs mt-0.5">
                {dueSoon.map(t => t.title).join(", ")} — don't forget!
              </p>
            </div>
          </div>
        )}

        {/* Motivational quote */}
        <div className="card-enter-1 mb-6 p-4 rounded-2xl text-white text-sm italic text-center"
          style={{ background: "linear-gradient(135deg, #4F8CFF 0%, #667eea 100%)" }}>
          💡 "{quote}"
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Tasks", value: total, color: "text-slate-800", bg: "from-slate-50 to-white", delay: "card-enter-1" },
            { label: "Pending", value: pending, color: "text-[#4F8CFF]", bg: "from-blue-50 to-white", delay: "card-enter-2" },
            { label: "Completed", value: completed, color: "text-green-500", bg: "from-green-50 to-white", delay: "card-enter-3" },
            { label: "Overdue", value: overdue, color: "text-red-500", bg: "from-red-50 to-white", delay: "card-enter-4" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.delay} bg-gradient-to-br ${stat.bg} rounded-2xl shadow-sm p-5 text-center card-hover`}>
              <p className="text-slate-500 text-sm">{stat.label}</p>
              <h2 className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</h2>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Upcoming Deadlines */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6 card-enter-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Upcoming Deadlines</h2>
              <Link href="/tasks" className="text-sm text-[#4F8CFF] hover:underline">View all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-slate-400 text-sm">No upcoming tasks!</p>
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
                    <div key={task.id} className="flex items-center justify-between p-4 bg-[#F0F4FF] rounded-xl card-hover">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${
                          task.priority === "high" ? "bg-red-400" :
                          task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"
                        }`} />
                        <div>
                          <p className="font-medium text-sm text-slate-800">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.subject}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        daysLeft <= 2 ? "bg-red-100 text-red-600" : "bg-[#EBF1FF] text-[#4F8CFF]"
                      }`}>
                        {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Overall Progress */}
          <div className="bg-white rounded-2xl shadow-sm p-6 card-enter-3">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Overall Progress</h2>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#EBF1FF" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke="url(#grad1)" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - percent / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }} />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F8CFF" />
                      <stop offset="100%" stopColor="#a8edea" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">{percent}%</span>
                  <span className="text-xs text-slate-400">Done</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">{completed} of {total} tasks completed</p>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/planner" className="flex items-center gap-2 p-3 bg-[#F0F4FF] rounded-xl hover:bg-[#EBF1FF] transition-all card-hover">
                <span>🤖</span>
                <span className="text-sm font-medium text-[#4F8CFF]">Generate Study Plan</span>
              </Link>
              <Link href="/progress" className="flex items-center gap-2 p-3 bg-[#F0F4FF] rounded-xl hover:bg-[#EBF1FF] transition-all card-hover">
                <span>📊</span>
                <span className="text-sm font-medium text-[#4F8CFF]">View Full Progress</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Study Stats Row */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 card-enter-3 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎯</span>
              <p className="text-sm text-slate-500">Completion Rate</p>
            </div>
            <h3 className="text-2xl font-bold text-[#4F8CFF]">{percent}%</h3>
            <p className="text-xs text-slate-400 mt-1">of all tasks done</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 card-enter-4 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📚</span>
              <p className="text-sm text-slate-500">High Priority</p>
            </div>
            <h3 className="text-2xl font-bold text-red-500">
              {tasks.filter(t => t.priority === "high" && t.status === "pending").length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">tasks need attention</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 card-enter-5 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <p className="text-sm text-slate-500">Done This Week</p>
            </div>
            <h3 className="text-2xl font-bold text-green-500">
              {tasks.filter(t => {
                const d = new Date(t.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return t.status === "completed" && d >= weekAgo;
              }).length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">tasks completed</p>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm p-6 card-enter-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">📅 Today's Schedule</h2>
            <span className="text-sm text-slate-400">
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          {todayTasks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-slate-400 text-sm">No tasks due today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-[#F0F4FF] rounded-xl card-hover">
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
    </div>
  );
}