import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Sparkles, Instagram, Globe, CheckCircle2, Shield, ArrowUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';

export default function ContactSection() {
  const { profile, setIsBookingOpen, setIsAdminOpen } = useApp();
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.submitInquiry({
        ...formData,
        sessionType: formData.subject || 'Direct Contact'
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFormData({ clientName: '', email: '', subject: '', message: '' });
      }, 4000);
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="pt-24 pb-12 relative border-t border-white/10 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16">
          
          {/* Left Column: Direct Studio Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono tracking-widest uppercase">
              <Mail className="w-3.5 h-3.5" />
              <span>Studio Communications</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Let's create something timeless together.
            </h2>

            <p className="text-sm text-slate-300 font-light leading-relaxed">
              Inquiries regarding commercial campaigns, editorial commissions, fine art gallery exhibitions, or print licensing are warmly welcomed.
            </p>

            <div className="space-y-4 pt-2 font-mono text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                  <Mail className="w-4 h-4" />
                </div>
                <span>{profile?.email || 'contact@lohithportfolio.com'}</span>
              </div>

              {profile?.phone && (
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>{profile.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{profile?.location || 'Worldwide Commissions'}</span>
              </div>

              {profile?.availability && (
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-emerald-400">{profile.availability}</span>
                </div>
              )}
            </div>

            {/* Book Session Fast CTA */}
            <div className="pt-2">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-6 py-3 rounded-xl bg-accent text-black font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-colors"
              >
                Open Commission Form
              </button>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border-white/10">
              <h3 className="text-lg font-bold text-white mb-1">Direct Message</h3>
              <p className="text-xs text-slate-400 mb-6">Leave a note and we'll reply to your inbox directly.</p>

              {sent ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="text-sm font-semibold">Message delivered successfully.</p>
                  <p className="text-xs text-slate-400">We will respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Gallery Exhibition / Commercial Lookbook"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your inquiry or thoughts here..."
                      className="w-full p-3 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-accent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 rounded-xl bg-accent text-black font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} LOHITH VISUAL ARCHIVES. All Rights Reserved.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-slate-500 hover:text-accent transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Studio CMS Portal</span>
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
