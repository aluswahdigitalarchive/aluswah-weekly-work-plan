import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PresentationControls } from './PresentationControls';
import { PresentationSlideSummary } from './PresentationSlideSummary';
import { PresentationSlideDivision } from './PresentationSlideDivision';
import { useAgenda } from '../../context/AgendaContext';

interface PresentationLayoutProps {
  onExit: () => void;
}

export const PresentationLayout: React.FC<PresentationLayoutProps> = ({ onExit }) => {
  const { getDivisionsForActiveWeek, activeWeek, presentationInterval } = useAgenda();
  const divisions = getDivisionsForActiveWeek();

  // Slide 0: Executive Summary
  // Slides 1..N: Division slides
  const totalSlides = 1 + divisions.length;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoplayInterval, setAutoplayInterval] = useState(presentationInterval || 10); // seconds
  const [slideProgress, setSlideProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync with remote app_settings realtime updates if changed
  useEffect(() => {
    if (presentationInterval && presentationInterval > 0) {
      setAutoplayInterval((prev) => (prev !== presentationInterval ? presentationInterval : prev));
    }
  }, [presentationInterval]);

  // Timer references
  const timerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Go to Next slide
  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setSlideProgress(0);
  }, [totalSlides]);

  // Go to Previous slide
  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setSlideProgress(0);
  }, [totalSlides]);

  // Select specific slide
  const handleSelectSlide = (index: number) => {
    setCurrentSlide(index);
    setSlideProgress(0);
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Change interval
  const handleChangeInterval = (seconds: number) => {
    setAutoplayInterval(seconds);
    setSlideProgress(0);
  };

  // Fullscreen management
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn('Exit fullscreen error:', err);
        });
      }
      setIsFullscreen(false);
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, autoplayInterval, totalSlides, handleNext, handlePrev, onExit]);

  // Autoplay and Progress Bar effect
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepTime = 100;
    const totalSteps = (autoplayInterval * 1000) / stepTime;
    let stepCount = 0;

    progressIntervalRef.current = setInterval(() => {
      stepCount += 1;
      const progress = Math.min(100, (stepCount / totalSteps) * 100);
      setSlideProgress(progress);

      if (stepCount >= totalSteps) {
        handleNext();
        stepCount = 0;
      }
    }, stepTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, autoplayInterval, currentSlide, totalSlides, handleNext]);

  const activeDivision = currentSlide > 0 ? divisions[currentSlide - 1] : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f19] text-white overflow-hidden flex flex-col justify-center items-center select-none">
      {/* Dynamic Ambient Background Glow based on Active Slide Division */}
      <div
        className="absolute top-0 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-30"
        style={{
          backgroundColor: activeDivision
            ? activeDivision.colorScheme.primary
            : '#0284c7',
        }}
      />
      <div
        className="absolute bottom-0 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25"
        style={{
          backgroundColor: activeDivision
            ? activeDivision.colorScheme.primary
            : '#0d9488',
        }}
      />

      {/* Slide Container (16:9 optimized aspect) */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 pb-24 overflow-hidden">
        <div className="w-full h-full max-w-[1920px] max-h-[1080px] flex items-center justify-center">
          {currentSlide === 0 ? (
            <PresentationSlideSummary key="slide-summary" />
          ) : (
            activeDivision && (
              <PresentationSlideDivision
                key={`slide-div-${activeDivision.id}`}
                division={activeDivision}
                currentWeek={activeWeek}
              />
            )
          )}
        </div>
      </div>

      {/* Floating Presentation Controls */}
      <PresentationControls
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        isPlaying={isPlaying}
        autoplayInterval={autoplayInterval}
        slideProgress={slideProgress}
        isFullscreen={isFullscreen}
        onPrev={handlePrev}
        onNext={handleNext}
        onTogglePlay={handleTogglePlay}
        onSelectSlide={handleSelectSlide}
        onChangeInterval={handleChangeInterval}
        onToggleFullscreen={handleToggleFullscreen}
        onExitPresentation={onExit}
      />
    </div>
  );
};
