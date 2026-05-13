"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "health", label: "Health", icon: "🏥" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "general", label: "General", icon: "🌍" },
];

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("technology");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNews();
  }, [category]);

  async function fetchNews() {
    setLoading(true);
    const res = await fetch(`/api/news?category=${category}`);
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setNews(data.articles || []);
    setLoading(false);
  }

  const filtered = news.filter((article) =>
    article.title?.toLowerCase().includes(search.toLowerCase())
  );

  function timeAgo(date) {
    const diff = new Date() - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">News & Updates</h1>
            <p className="text-slate-500 text-sm mt-1">Stay updated with latest news</p>
          </div>
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] w-64"
          />
        </div>

        {/* Category tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-3 mb-6 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.id
                  ? "bg-[#4F8CFF] text-white shadow-sm"
                  : "text-slate-500 hover:bg-[#EBF1FF] hover:text-[#4F8CFF]"
              }`}>
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="w-full h-40 bg-slate-100 rounded-xl mb-3" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">📰</p>
            <p className="text-slate-500">No news found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((article, i) => (
              <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl shadow-sm overflow-hidden card-hover group"
                style={{ animation: `fadeSlideUp 0.4s ease ${i * 0.05}s forwards`, opacity: 0 }}>

                {/* Image */}
                {article.urlToImage ? (
                  <div className="w-full h-40 overflow-hidden">
                    <img src={article.urlToImage} alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-[#EBF1FF] to-[#F0F4FF] flex items-center justify-center">
                    <span className="text-4xl">{categories.find(c => c.id === category)?.icon || "📰"}</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#4F8CFF] font-medium bg-[#EBF1FF] px-2 py-1 rounded-full">
                      {article.source?.name || "News"}
                    </span>
                    <span className="text-xs text-slate-400">{timeAgo(article.publishedAt)}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-[#4F8CFF] transition-colors">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{article.description}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}