import React from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FilterBar() {
  const {
    photos,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useApp();

  const getCount = (slug) => {
    if (slug === 'all') return photos.length;
    return photos.filter(p => p.category?.toLowerCase() === slug.toLowerCase()).length;
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
          const count = getCount(cat.slug);

          return (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-accent text-black font-semibold shadow-sm'
                  : 'bg-surface text-slate-300 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <span>{cat.name}</span>
              {photos.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-black/30 text-black font-bold' : 'bg-white/10 text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search works..."
          className="w-full pl-8 pr-4 py-1.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-accent font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
