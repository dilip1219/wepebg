import React, { useState } from 'react';

interface ComparisonSliderProps {
  before: string;
  after: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ before, after }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <button 
          onClick={() => setShowOriginal(!showOriginal)}
          className={`flex items-center gap-4 px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${
            showOriginal 
              ? 'bg-black text-white' 
              : 'bg-indigo-600 text-white'
          }`}
        >
          {showOriginal ? 'Show Result' : 'Show Original'}
        </button>
      </div>

      <div 
        className="relative w-full aspect-square rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl cursor-pointer select-none border border-slate-100 checkerboard transition-transform active:scale-[0.99]"
        onClick={() => setShowOriginal(!showOriginal)}
      >
        <div className="w-full h-full relative group">
          {/* Original Image */}
          <img 
            src={before} 
            alt="Original" 
            className={`absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-500 ${
              showOriginal ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`} 
          />
          
          {/* Processed Image */}
          <img 
            src={after} 
            alt="Result" 
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
              !showOriginal ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`} 
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 z-20 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-xl px-8 py-4 rounded-2xl text-xs font-black text-black shadow-2xl uppercase tracking-[0.25em]">
              Tap to Toggle
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-10 left-10 z-30 flex gap-4 pointer-events-none">
          <div className={`transition-all duration-500 px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl ${
            showOriginal 
              ? 'bg-black text-white transform-none' 
              : 'bg-black text-white -translate-y-4 opacity-0'
          }`}>
            Original View
          </div>
          <div className={`transition-all duration-500 px-6 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl ${
            !showOriginal 
              ? 'bg-indigo-600 text-white transform-none' 
              : 'bg-indigo-600 text-white -translate-y-4 opacity-0'
          }`}>
            AI Result
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] animate-pulse">
        Hint: Click image to flip view
      </p>
    </div>
  );
};

export default ComparisonSlider;