import React, { useState } from 'react';

interface ComparisonSliderProps {
  before: string;
  after: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ before, after }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <button 
          onClick={() => setShowOriginal(!showOriginal)}
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95 ${
            showOriginal 
              ? 'bg-black text-white' 
              : 'bg-indigo-600 text-white'
          }`}
        >
          {showOriginal ? 'Show Result' : 'Show Original'}
        </button>
      </div>

      <div 
        className="relative w-full aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-xl cursor-pointer select-none border border-slate-100 checkerboard transition-transform active:scale-[0.99]"
        onClick={() => setShowOriginal(!showOriginal)}
      >
        <div className="w-full h-full relative group">
          <img 
            src={before} 
            alt="Original" 
            className={`absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-500 ${
              showOriginal ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`} 
          />
          <img 
            src={after} 
            alt="Result" 
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
              !showOriginal ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`} 
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-20 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-xl text-[10px] font-black text-black shadow-xl uppercase tracking-widest">
              Tap to Toggle
            </span>
          </div>
        </div>

        <div className="absolute top-6 left-6 z-30 flex gap-3 pointer-events-none">
          <div className={`transition-all duration-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
            showOriginal 
              ? 'bg-black text-white transform-none' 
              : 'bg-black text-white -translate-y-4 opacity-0'
          }`}>
            Original
          </div>
          <div className={`transition-all duration-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
            !showOriginal 
              ? 'bg-indigo-600 text-white transform-none' 
              : 'bg-indigo-600 text-white -translate-y-4 opacity-0'
          }`}>
            Result
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
        Hint: Click image to flip view
      </p>
    </div>
  );
};

export default ComparisonSlider;