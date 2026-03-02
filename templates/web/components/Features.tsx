const features = [
  { icon: "🔐", title: "Auth Ready", desc: "Google OAuth + magic link. Protected routes via middleware.", grad: "from-purple-500/20", border: "border-purple-500/30" },
  { icon: "⚡", title: "Supabase Configured", desc: "Project auto-provisioned. URL + anon key directly in your .env.local.", grad: "from-blue-500/20", border: "border-blue-500/30" },
  { icon: "🤖", title: "Gemini AI", desc: "POST /api/ai with a prompt — get an instant response. Done.", grad: "from-emerald-500/20", border: "border-emerald-500/30" },
  { icon: "📧", title: "Email via Resend", desc: "POST /api/email — transactional emails seamlessly wired up.", grad: "from-amber-500/20", border: "border-amber-500/30" },
  { icon: "🛡️", title: "Protected Routes", desc: "/dashboard is locked until the user is authenticated securely.", grad: "from-red-500/20", border: "border-red-500/30" },
  { icon: "🚀", title: "Deploy Ready", desc: "Pushed to GitHub + live on Vercel automatically with CI/CD.", grad: "from-pink-500/20", border: "border-pink-500/30" },
];

export default function Features() {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6 drop-shadow-sm">Everything you need to ship</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">No more boilerplate. Every integration is pre-configured, scalable, and beautifully designed for production.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group relative rounded-3xl bg-[#0f0f0f] border border-white/10 p-8 hover:bg-[#151515] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.grad} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl border ${f.border} bg-gradient-to-br ${f.grad} flex items-center justify-center text-2xl mb-6 shadow-inner`}>
                  {f.icon}
                </div>
                <h3 className="text-xl text-white font-bold mb-3 tracking-tight">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
