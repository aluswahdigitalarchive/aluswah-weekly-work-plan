import React, { useState } from 'react';
import { LogIn, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAgenda } from '../context/AgendaContext';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { divisions } = useAgenda();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Silakan masukkan email dan kata sandi.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const userProfile = await login(email, password);

      if (userProfile?.role === 'SUPERADMIN') {
        onNavigate('/');
      } else if (userProfile?.role === 'DIVISION' && userProfile.divisionId) {
        // Find corresponding division slug
        const targetDiv = divisions.find((d) => d.id === userProfile.divisionId);
        if (targetDiv) {
          onNavigate(`/division/${targetDiv.slug}`);
        } else {
          onNavigate('/');
        }
      } else {
        onNavigate('/');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk. Periksa kembali data login Anda.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Aluswah2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center px-4 py-12 select-none">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Papan Agenda Publik</span>
        </button>

        {/* Card Container */}
        <div className="bg-[#131b2e] border border-slate-800/90 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 mb-3 shadow-soft">
              <ShieldCheck size={26} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              WEEKLY WORK PLAN
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Masuk untuk mengelola rencana dan agenda kerja
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@aluswah.id"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0e1626] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0e1626] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="mt-8 pt-5 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Pilihan Akun Resmi
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleQuickFill('superadmin@aluswah.id')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-semibold border border-amber-500/30 transition-colors"
              >
                Superadmin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('it@aluswah.id')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-sky-300 font-semibold border border-sky-500/30 transition-colors"
              >
                Tim IT
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('media@aluswah.id')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-orange-300 font-semibold border border-orange-500/30 transition-colors"
              >
                Tim Media
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sdm.mutu@aluswah.id')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors"
              >
                SDM & Mutu
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('quran@aluswah.id')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-semibold border border-cyan-500/30 transition-colors"
              >
                Qur'an
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('kesehatan@aluswah.id')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-teal-300 font-semibold border border-teal-500/30 transition-colors"
              >
                Kesehatan
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2.5">
              Password default semua akun: <code className="text-slate-400">Aluswah2026!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
