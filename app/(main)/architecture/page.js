"use client";

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="animate-float absolute top-10 right-10 w-24 h-24 rounded-full opacity-5"
          style={{ background: "linear-gradient(135deg, #4F8CFF, #667eea)" }} />
        <div className="animate-float-delayed absolute bottom-20 left-10 w-16 h-16 opacity-5"
          style={{ background: "linear-gradient(135deg, #a8edea, #4F8CFF)", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">System Architecture</h1>
          <p className="text-slate-500 text-sm mt-1">Technical overview of the AI-Based Study Planner System</p>
        </div>

        {/* Tech Stack */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "⚛️", label: "Next.js 16", desc: "React Framework", color: "from-slate-50 to-white" },
            { icon: "🔷", label: "Prisma ORM", desc: "Database Layer", color: "from-blue-50 to-white" },
            { icon: "🗄️", label: "SQLite", desc: "Local Database", color: "from-green-50 to-white" },
            { icon: "🤖", label: "Groq API", desc: "AI Features", color: "from-purple-50 to-white" },
          ].map((tech) => (
            <div key={tech.label} className={`bg-gradient-to-br ${tech.color} rounded-2xl shadow-sm p-5 text-center card-hover`}>
              <div className="text-3xl mb-2">{tech.icon}</div>
              <p className="font-bold text-slate-800 text-sm">{tech.label}</p>
              <p className="text-xs text-slate-400 mt-1">{tech.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Architecture Diagram */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">System Flow</h2>

          <div className="flex flex-col items-center gap-3">
            {/* Client Layer */}
            <div className="w-full p-4 rounded-2xl border-2 border-[#4F8CFF] bg-[#EBF1FF]">
              <p className="text-center text-sm font-bold text-[#4F8CFF] mb-3">🖥️ CLIENT LAYER — Browser</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {["Dashboard", "Tasks", "Planner", "Calendar", "Progress", "Settings"].map((page) => (
                  <div key={page} className="bg-white rounded-xl p-2 text-center text-xs font-medium text-slate-600 shadow-sm">
                    {page}
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-slate-300" />
              <div className="text-slate-400 text-xs px-3 py-1 bg-slate-100 rounded-full">HTTP Request / Response</div>
              <div className="w-0.5 h-6 bg-slate-300" />
            </div>

            {/* Server Layer */}
            <div className="w-full p-4 rounded-2xl border-2 border-[#667eea] bg-purple-50">
              <p className="text-center text-sm font-bold text-[#667eea] mb-3">⚙️ SERVER LAYER — Next.js API Routes</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { route: "/api/auth", desc: "Login & Register" },
                  { route: "/api/tasks", desc: "Task Management" },
                  { route: "/api/planner", desc: "AI Schedule Logic" },
                  { route: "/api/suggest", desc: "AI Suggestions" },
                  { route: "/api/companion", desc: "AI Chat" },
                  { route: "/api/me", desc: "User Profile" },
                  { route: "lib/planner.js", desc: "Rule-Based AI" },
                  { route: "lib/auth.js", desc: "JWT Tokens" },
                ].map((api) => (
                  <div key={api.route} className="bg-white rounded-xl p-2 text-center shadow-sm">
                    <p className="text-xs font-bold text-[#667eea]">{api.route}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{api.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow down split */}
            <div className="w-full flex items-start justify-around">
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-300" />
                <div className="text-slate-400 text-xs px-2 py-1 bg-slate-100 rounded-full">Prisma ORM</div>
                <div className="w-0.5 h-6 bg-slate-300" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-slate-300" />
                <div className="text-slate-400 text-xs px-2 py-1 bg-slate-100 rounded-full">HTTPS API</div>
                <div className="w-0.5 h-6 bg-slate-300" />
              </div>
            </div>

            {/* Bottom layer */}
            <div className="w-full grid md:grid-cols-2 gap-4">
              {/* Database */}
              <div className="p-4 rounded-2xl border-2 border-green-400 bg-green-50">
                <p className="text-center text-sm font-bold text-green-600 mb-3">🗄️ DATABASE LAYER — SQLite</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { table: "User", fields: "id, name, email, password" },
                    { table: "Task", fields: "id, title, subject, deadline, priority, status, notes" },
                  ].map((db) => (
                    <div key={db.table} className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs font-bold text-green-600">📋 {db.table}</p>
                      <p className="text-xs text-slate-400 mt-1">{db.fields}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* External APIs */}
              <div className="p-4 rounded-2xl border-2 border-purple-400 bg-purple-50">
                <p className="text-center text-sm font-bold text-purple-600 mb-3">🤖 EXTERNAL AI APIS</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: "Groq API", model: "llama-3.1-8b-instant", use: "AI Suggestions & Chat Companion" },
                  ].map((api) => (
                    <div key={api.name} className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs font-bold text-purple-600">⚡ {api.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Model: {api.model}</p>
                      <p className="text-xs text-slate-400">{api.use}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Logic explanation */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">🤖 AI Rule-Based Logic</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "⏰", title: "Deadline Priority", desc: "Tasks closer to deadline get higher priority score automatically" },
              { icon: "📊", title: "Importance Score", desc: "High priority tasks get more study hours allocated per day" },
              { icon: "⚡", title: "Time Allocation", desc: "Available hours divided smartly across tasks by score" },
            ].map((rule) => (
              <div key={rule.title} className="p-4 bg-[#F0F4FF] rounded-xl">
                <div className="text-2xl mb-2">{rule.icon}</div>
                <p className="font-semibold text-slate-700 text-sm">{rule.title}</p>
                <p className="text-xs text-slate-500 mt-1">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">🔐 Security Layer</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "🔑", title: "JWT Authentication", desc: "Secure token-based login system with 7-day expiry" },
              { icon: "🔒", title: "Password Hashing", desc: "bcryptjs encrypts all passwords before storing" },
              { icon: "🍪", title: "HTTP-Only Cookies", desc: "Tokens stored in secure cookies, not localStorage" },
            ].map((sec) => (
              <div key={sec.title} className="p-4 bg-[#F0F4FF] rounded-xl">
                <div className="text-2xl mb-2">{sec.icon}</div>
                <p className="font-semibold text-slate-700 text-sm">{sec.title}</p>
                <p className="text-xs text-slate-500 mt-1">{sec.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}