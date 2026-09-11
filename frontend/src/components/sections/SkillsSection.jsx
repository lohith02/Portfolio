import React, { useState } from 'react';
import { Cpu, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SkillsSection() {
  const { skills } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!skills || skills.length === 0) return null;

  const categories = ['all', ...new Set(skills.map(s => s.category).filter(Boolean))];

  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
          <div>
            <span className="text-accent text-xs font-mono tracking-widest uppercase block mb-1">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Technical & Creative Skills
            </h2>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all capitalize ${
                    selectedCategory === cat
                      ? 'bg-accent text-black font-semibold'
                      : 'bg-surface text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-2xl bg-surface border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                    {skill.category}
                  </span>
                  {skill.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                      {skill.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-white">
                  {skill.name}
                </h3>

                {skill.description && (
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {skill.description}
                  </p>
                )}
              </div>

              {/* Progress bar and tools */}
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>Proficiency</span>
                  <span className="text-accent font-bold">{skill.proficiency || 90}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-accent transition-all duration-700"
                    style={{ width: `${skill.proficiency || 90}%` }}
                  />
                </div>

                {skill.tools && skill.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skill.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/5 text-slate-300"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
