import React from 'react';

interface SlideIndicatorProps {
  totalSlides: number;
  currentSlide: number;
  onSelectSlide: (index: number) => void;
}

export const SlideIndicator: React.FC<SlideIndicatorProps> = ({
  totalSlides,
  currentSlide,
  onSelectSlide,
}) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSlides }).map((_, index) => {
        const isActive = index === currentSlide;
        return (
          <button
            key={index}
            onClick={() => onSelectSlide(index)}
            title={`Slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none ${
              isActive
                ? 'w-8 h-2.5 bg-brand-500 shadow-glow-sm'
                : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        );
      })}
    </div>
  );
};
