import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, Calendar, MapPin, DollarSign, Mail, User, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';

const SESSION_TYPES = [
  { id: 'editorial', label: 'Fashion & Editorial', desc: 'Campaign lookbooks, magazine features & haute couture' },
  { id: 'commercial', label: 'Commercial & Brand', desc: 'Product, luxury timepieces & architectural showcases' },
  { id: 'portrait', label: 'Fine Art Portraiture', desc: 'Studio lighting, creative direction & personal branding' },
  { id: 'licensing', label: 'Print & Licensing', desc: 'Fine art museum-grade prints & digital licensing rights' }
];

export default function BookingModal() {
  const { isBookingOpen, setIsBookingOpen } = useApp();
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    sessionType: 'Fashion & Editorial',
    eventDate: '',
    budget: '$2,500 - $5,000',
    location: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isBookingOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.submitInquiry(formData);
      setSubmitted(true);
      
      // Fire celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e6a15c', '#38bdf8', '#ffffff']
      });

      setTimeout(() => {
        setIsBookingOpen(false);
        setSubmitted(false);
        setFormData({
          clientName: '',
          email: '',
          phone: '',
          sessionType: 'Fashion & Editorial',
          eventDate: '',
          budget: '$2,500 - $5,000',
          location: '',
          message: ''
        });
      }, 3500);
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 glass-panel-glow border border-accent/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsBookingOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Commission Inquiry Received</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-accent font-semibold">{formData.clientName}</span>. Your vision has been logged into our studio archives. We will review details and reply within 24 hours.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-accent text-xs font-mono tracking-widest uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Private Commissions & Bookings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Initiate a Creative Project
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Available worldwide for commercial shoots, editorials, and fine-art exhibitions.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Session Type Selectors */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  1. Select Discipline / Service
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SESSION_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setFormData({ ...formData, sessionType: type.label })}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        formData.sessionType === type.label
                          ? 'bg-accent/15 border-accent text-white shadow-md shadow-accent/10'
                          : 'bg-surface border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">{type.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="elena@studio.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Target Date / Timeline</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      placeholder="e.g. Autumn 2026 / October 14"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Shoot Location / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Milan, Tokyo, or Remote"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Project Details & Vision *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your creative vision, deliverables needed, mood references, or specific requirements..."
                  className="w-full p-3 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-amber-600 text-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span>Transmitting Details...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Project Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
