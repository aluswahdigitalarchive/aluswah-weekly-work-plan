import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SlideIndicator } from './SlideIndicator';

interface PresentationControlsProps {
  currentSlide: number;
  totalSlides: number;
  isPlaying: boolean;
  autoplayInterval: number; // in seconds
  slideProgress: number; // 0 to 100
  isFullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSelectSlide: (index: number) => void;
  onChangeInterval: (seconds: number) => void;
  onToggleFullscreen: () => void;
  onExitPresentation: () => void;
}

export const PresentationControls: React.FC<PresentationControlsProps> = ({
  currentSlide,
  totalSlides,
  isPlaying,
  autoplayInterval,
  slideProgress,
  isFullscreen,
  onPrev,
  onNext,
  onTogglePlay,
  onSelectSlide,
  onChangeInterval,
  onToggleFullscreen,
  onExitPresentation,
}) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [showIntervalMenu, setShowIntervalMenu] = useState(false);
  const intervalOptions = [5, 10, 15, 30];

  // Shortcut key 'm' to toggle minimize/maximize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        setIsMinimized((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Minimized View
  if (isMinimized) {
    return (
      <div className="fixed bottom-3 inset-x-0 z-50 flex flex-col items-center justify-center pointer-events-none px-4 transition-all duration-300">
        {/* Subtle auto-slide progress bar */}
        {isPlaying && (
          <div className="w-48 sm:w-60 h-1 bg-slate-800/80 rounded-full overflow-hidden mb-1.5 shadow-sm border border-slate-700/40 opacity-75">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-100 ease-linear rounded-full shadow-glow-sm"
              style={{ width: `${slideProgress}%` }}
            />
          </div>
        )}

        {/* Minimized Pill */}
        <div className="pointer-events-auto bg-[#131b2e]/80 hover:bg-[#131b2e] backdrop-blur-xl border border-slate-700/70 hover:border-slate-500 shadow-2xl rounded-full px-3 py-1 flex items-center gap-2 transition-all group">
          {/* Mini Play/Pause */}
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Jeda Slideshow (Space)' : 'Mulai Slideshow (Space)'}
            className={`p-1 rounded-full transition-all cursor-pointer ${
              isPlaying
                ? 'bg-brand-500/20 text-brand-300 hover:bg-brand-500/30'
                : 'bg-brand-600 text-white hover:bg-brand-500'
            }`}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="translate-x-0.5" />}
          </button>

          {/* Prev */}
          <button
            onClick={onPrev}
            title="Slide Sebelumnya (Arrow Left)"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Slide Counter */}
          <span className="text-xs font-bold text-slate-300 px-1 select-none">
            {currentSlide + 1} <span className="text-slate-600 font-normal">/</span> {totalSlides}
          </span>

          {/* Next */}
          <button
            onClick={onNext}
            title="Slide Berikutnya (Arrow Right)"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>

          <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

          {/* Expand Full Controls Button */}
          <button
            onClick={() => setIsMinimized(false)}
            title="Buka Menu Kontrol Lengkap"
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-slate-400 group-hover:text-brand-300 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <span>Kontrol</span>
            <ChevronUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded View
  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex flex-col items-center justify-center pointer-events-none px-4 transition-all duration-300">
      {/* Auto-slide progress bar */}
      {isPlaying && (
        <div className="w-72 sm:w-96 h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-2.5 shadow-sm border border-slate-700/40">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-100 ease-linear rounded-full shadow-glow-sm"
            style={{ width: `${slideProgress}%` }}
          />
        </div>
      )}

      {/* Floating Pill Controls Container */}
      <div className="pointer-events-auto bg-[#131b2e]/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-2.5 sm:gap-3.5 transition-all hover:bg-[#131b2e]">
        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          title="Minimize / Perkecil Bar"
          className="p-2 rounded-xl text-slate-400 hover:text-brand-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
        >
          <ChevronDown size={18} />
        </button>

        <div className="h-5 w-px bg-slate-800" />

        {/* Previous Button */}
        <button
          onClick={onPrev}
          title="Slide Sebelumnya (Arrow Left)"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          title={isPlaying ? 'Jeda Slideshow (Space)' : 'Mulai Slideshow (Space)'}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isPlaying
              ? 'bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 border border-brand-500/40'
              : 'bg-brand-600 text-white hover:bg-brand-500 shadow-glow-sm'
          }`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          title="Slide Berikutnya (Arrow Right)"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        <div className="h-5 w-px bg-slate-800" />

        {/* Slide Indicator Dots */}
        <div className="hidden md:block">
          <SlideIndicator
            totalSlides={totalSlides}
            currentSlide={currentSlide}
            onSelectSlide={onSelectSlide}
          />
        </div>

        {/* Counter `X / 9` */}
        <span className="text-xs sm:text-sm font-extrabold text-slate-200 tracking-wider">
          {currentSlide + 1} <span className="text-slate-500 font-normal">/</span> {totalSlides}
        </span>

        <div className="h-5 w-px bg-slate-800" />

        {/* Autoplay Interval Selector */}
        <div className="relative">
          <button
            onClick={() => setShowIntervalMenu(!showIntervalMenu)}
            title="Durasi Tiap Slide"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Clock size={14} className="text-slate-400" />
            <span>{autoplayInterval}s</span>
          </button>

          {showIntervalMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowIntervalMenu(false)}
              />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#131b2e] rounded-xl shadow-2xl border border-slate-700 p-1.5 z-50 min-w-[100px] animate-fade-in text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
                  Durasi Slide
                </div>
                {intervalOptions.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      onChangeInterval(sec);
                      setShowIntervalMenu(false);
                    }}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                      autoplayInterval === sec
                        ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    {sec} detik
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Keluar Fullscreen (F)' : 'Layar Penuh (F)'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* Exit Presentation */}
        <button
          onClick={onExitPresentation}
          title="Keluar ke Dashboard"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
