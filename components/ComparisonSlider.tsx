
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
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
            showOriginal 
              ? 'bg-black text-white' 
              : 'bg-[#5b8dfa] text-white'
          }`}
        >
          {showOriginal ? 'Show Result' : 'Show Original'}
        </button>
      </div>

      <div 
        className="relative w-full aspect-square rounded-[3.5rem] overflow-hidden shadow-2xl cursor-pointer select-none border border-slate-100 checkerboard transition-transform active:scale-[0.99]"
        onClick={() => setShowOriginal(!showOriginal)}
      >
        <div className="w-full h-full relative group">
          {/* Original Image */}
          <img 
            src={before} 
            alt="Original" 
            className={`absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-300 ${
              showOriginal ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`} 
          />
          
          {/* Processed Image */}
          <img 
            src={after} 
            alt="Result" 
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              !showOriginal ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`} 
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-20 pointer-events-none">
            <span className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl text-[10px] font-black text-black shadow-2xl uppercase tracking-[0.2em]">
              Tap to Toggle
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-8 left-8 z-30 flex gap-2 pointer-events-none">
          <div className={`transition-all duration-300 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl ${
            showOriginal 
              ? 'bg-black text-white transform-none' 
              : 'bg-[#5b8dfa] text-white -translate-y-2 opacity-0'
          }`}>
            Original Photo
          </div>
          <div className={`transition-all duration-300 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl ${
            !showOriginal 
              ? 'bg-[#5b8dfa] text-white transform-none' 
              : 'bg-[#5b8dfa] text-white -translate-y-2 opacity-0'
          }`}>
            wipebg result
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">
        Hint: Click image to flip view
      </p>
    </div>
  );
};

export default ComparisonSlider;
