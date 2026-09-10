import React, { useState } from 'react';
import { Bell, Menu, Presentation, Plus, LogIn, LogOut } from 'lucide-react';
import { WeekSelector } from '../common/WeekSelector';
import { useAgenda } from '../../context/AgendaContext';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onEnterPresentation: () => void;
  onNavigate?: (path: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onEnterPresentation,
  onNavigate,
}) => {
  const { activeWeek, setActiveWeek, isSuperAdmin, openAddModal, realtimeStatus } = useAgenda();
  const { user, profile, isDivision, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Progress Divisi Al-Qur\'an mencapai 90%',
      time: '10 menit yang lalu',
      unread: true,
    },
    {
      id: 2,
      title: 'Agenda Baru: Audit Mutu Internal ISO dijadwalkan Kamis',
      time: '1 jam yang lalu',
      unread: true,
    },
    {
      id: 3,
      title: 'Pembaruan SOP Tim Sarpras & IT siap ditinjau',
      time: '3 jam yang lalu',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0e1626]/95 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-8 py-3.5 transition-all text-slate-100">
      <div className="flex items-center justify-between gap-3">
        {/* Left Section: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  realtimeStatus === 'CONNECTED'
                    ? 'bg-gradient-to-tr from-brand-400 to-tealbrand-400 animate-pulse'
                    : realtimeStatus === 'CONNECTING'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500'
                } shadow-sm`}
                title={`Realtime Live Sync: ${realtimeStatus}`}
              />
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                WEEKLY WORK PLAN
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block mt-0.5">
              Digital Planning Board Yayasan Al Uswah
            </p>
          </div>
        </div>

        {/* Center: Week Selector (Desktop) */}
        <div className="hidden md:flex items-center">
          <WeekSelector currentWeek={activeWeek} onSelectWeek={setActiveWeek} />
        </div>

        {/* Right Section: Superadmin, Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Agenda Button (Superadmin or Division) */}
          {(isSuperAdmin || isDivision) && (
            <button
              onClick={() => openAddModal()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs sm:text-sm font-bold border border-brand-500/40 shadow-soft transition-all cursor-pointer"
              title="Tambah Agenda Baru untuk Pekan Ini / Pekan Mendatang"
            >
              <Plus size={16} className="text-brand-400" />
              <span className="hidden sm:inline">Tambah Agenda</span>
              <span className="sm:hidden text-xs">Tambah</span>
            </button>
          )}

          {/* Presentation Mode Button */}
          <button
            onClick={onEnterPresentation}
            className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-tealbrand-600 to-brand-600 hover:from-tealbrand-500 hover:to-brand-500 text-white text-xs sm:text-sm font-bold shadow-soft hover:shadow-medium transition-all cursor-pointer group"
          >
            <Presentation size={16} className="group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline">Presentation Mode</span>
            <span className="xl:hidden text-xs">Slide</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0e1626]" />
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#131b2e] rounded-2xl shadow-elevated border border-slate-700 p-3.5 z-50 animate-fade-in text-slate-100">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">Notifikasi Pekan Ini</span>
                    <span className="text-[11px] text-brand-400 font-medium cursor-pointer hover:underline">
                      Tandai sudah dibaca
                    </span>
                  </div>
                  <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl text-xs transition-colors ${
                          n.unread ? 'bg-brand-950/50 border border-brand-800/60' : 'hover:bg-slate-800/60'
                        }`}
                      >
                        <p className="font-semibold text-slate-200 leading-snug">{n.title}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Authentication & Profile Section */}
          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-tealbrand-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-soft border border-brand-400/40 shrink-0">
                {profile?.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight max-w-[130px] truncate">
                  {profile?.fullName || user.email}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isSuperAdmin ? 'text-amber-400' : 'text-sky-400'
                  }`}
                >
                  {isSuperAdmin ? 'Super Administrator' : 'Akun Divisi'}
                </span>
              </div>
              <button
                onClick={() => {
                  void logout();
                  if (onNavigate) onNavigate('/');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Keluar / Logout"
                aria-label="Logout"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('/login');
                } else {
                  window.location.hash = '#/login';
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 border border-brand-500/30 text-xs sm:text-sm font-bold shadow-soft transition-all cursor-pointer"
              title="Masuk ke Akun Superadmin atau Divisi"
            >
              <LogIn size={15} />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Week Selector row */}
      <div className="md:hidden mt-3 pt-2.5 border-t border-slate-800 flex justify-center">
        <WeekSelector currentWeek={activeWeek} onSelectWeek={setActiveWeek} />
      </div>
    </header>
  );
};
