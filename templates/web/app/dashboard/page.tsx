"use client";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome to your app.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Users", value: "—", color: "from-purple-500/20", border: "border-purple-500/20" },
            { label: "Sessions", value: "—", color: "from-blue-500/20",   border: "border-blue-500/20"   },
            { label: "API Calls", value: "—", color: "from-emerald-500/20", border: "border-emerald-500/20" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} to-transparent border ${s.border} rounded-2xl p-6`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-4xl font-bold text-white mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">
            This page is protected by Supabase middleware.{" "}
            <span className="text-purple-400">Only authenticated users can see this.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
