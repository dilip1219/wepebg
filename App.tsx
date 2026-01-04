import React, { useState, useRef } from 'react';
import Uploader from './components/Uploader';
import ComparisonSlider from './components/ComparisonSlider';
import { processImage } from './services/geminiService';
import { ImageState, ProcessingOptions, PresetBackground, BackgroundMode } from './types';

const PRESETS: PresetBackground[] = [
  { id: 'studio', name: 'Studio', url: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=200', prompt: 'a clean high-end photography studio with soft lighting' },
  { id: 'nature', name: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=200', prompt: 'a lush, sunny misty forest with vibrant green leaves' },
  { id: 'office', name: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200', prompt: 'a modern, bright minimalist corporate office with windows' },
  { id: 'abstract', name: 'Neon', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200', prompt: 'a stylish cyberpunk street with neon pink and blue lights' },
];

const WipeBGLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    <div className="relative group">
      <svg className="w-8 h-8 text-[#5b8dfa] transition-transform group-hover:-rotate-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".2"/>
        <rect x="5" y="8" width="14" height="8" rx="3" fill="#5b8dfa" />
        <circle cx="8.5" cy="11" r="1.5" fill="white" />
        <circle cx="15.5" cy="11" r="1.5" fill="white" />
        <path d="M10 14h4c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1z" fill="white" />
        <rect x="11.5" y="6" width="1" height="2" fill="#5b8dfa" />
        <circle cx="12" cy="5.5" r="0.8" fill="#5b8dfa" />
      </svg>
    </div>
    <span className="text-2xl font-black text-black tracking-tighter">wipebg<span className="text-[#5b8dfa]">.ai</span></span>
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    original: null,
    processed: null,
    isLoading: false,
    error: null,
  });

  const [options, setOptions] = useState<ProcessingOptions>({
    mode: 'transparent',
    presetId: 'studio',
    customBackgroundPrompt: '',
    customBackgroundImage: undefined,
  });

  const [isStale, setIsStale] = useState(false);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const updateOptions = (updates: Partial<ProcessingOptions>) => {
    setOptions(prev => {
      const next = { ...prev, ...updates };
      if (state.processed) setIsStale(true);
      return next;
    });
  };

  const handleUpload = async (base64: string) => {
    setState(prev => ({ ...prev, original: base64, processed: null, isLoading: true, error: null }));
    setIsStale(false);
    try {
      const result = await processImage(base64, options);
      setState(prev => ({ ...prev, processed: result, isLoading: false }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Processing failed. Please check your connection and API key.' 
      }));
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          updateOptions({ mode: 'custom_upload', customBackgroundImage: ev.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (!state.processed) return;
    const link = document.createElement('a');
    link.href = state.processed;
    link.download = `wipebg-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <WipeBGLogo />
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#5b8dfa] transition-colors">Features</a>
            <a href="#faq" className="hover:text-[#5b8dfa] transition-colors">FAQ</a>
            <button className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Try Now</button>
          </div>
        </div>
      </nav>

      <section className="relative pt-16 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center mb-8">
             <WipeBGLogo className="mb-2 scale-150 origin-center" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight leading-tight mb-6">
            Remove image background, <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5b8dfa] to-blue-600">100% Free & Fast.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12">
            The ultimate AI tool to remove backgrounds with pixel-perfect precision. Trusted by professionals worldwide.
          </p>

          <div id="uploader-area" className="w-full">
            {state.error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-600 font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-bold uppercase tracking-wider mb-1">Processing Error</p>
                  <p className="text-xs opacity-80">{state.error}</p>
                </div>
                <button onClick={() => setState(s => ({...s, error: null}))} className="ml-auto text-xs font-black uppercase tracking-widest bg-white px-3 py-1 rounded-lg">Dismiss</button>
              </div>
            )}

            {!state.original ? (
              <Uploader onUpload={handleUpload} />
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="glass-panel p-6 rounded-[2rem] shadow-xl space-y-6 text-left border border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                      {(['transparent', 'white', 'preset', 'custom_upload'] as BackgroundMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => updateOptions({ mode: m })}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 capitalize ${
                            options.mode === m 
                              ? 'bg-white text-black shadow-sm ring-1 ring-slate-200' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {m === 'transparent' ? 'Transparent' : m === 'white' ? 'White' : m === 'preset' ? 'Presets' : 'Upload BG'}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => state.original && handleUpload(state.original)}
                        disabled={state.isLoading}
                        className={`bg-[#5b8dfa] hover:bg-blue-600 disabled:opacity-50 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100 ${
                          isStale && !state.isLoading ? 'animate-attention ring-4 ring-blue-500/10' : ''
                        }`}
                      >
                        {state.isLoading ? 'Processing...' : 'Wipe Background'}
                      </button>
                      <button onClick={() => setState({ ...state, original: null, processed: null, error: null })} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50">Reset</button>
                    </div>
                  </div>

                  {options.mode === 'preset' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-300">
                      {PRESETS.map((p) => (
                        <button key={p.id} onClick={() => updateOptions({ presetId: p.prompt })} className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${options.presetId === p.prompt ? 'border-[#5b8dfa] ring-2 ring-blue-500/20' : 'border-transparent hover:border-slate-200'}`}>
                          <img src={p.url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-end p-2"><span className="text-white text-[10px] font-bold uppercase">{p.name}</span></div>
                        </button>
                      ))}
                    </div>
                  )}

                  {options.mode === 'custom_upload' && (
                    <div className="flex flex-col items-center animate-in fade-in duration-300">
                      <input type="file" ref={customBgInputRef} className="hidden" accept="image/*" onChange={handleCustomBgUpload} />
                      <button onClick={() => customBgInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-8 hover:border-[#5b8dfa] hover:bg-blue-50/20 transition-all group">
                        {options.customBackgroundImage ? (
                           <div className="relative inline-block">
                              <img src={options.customBackgroundImage} className="h-20 w-32 object-cover rounded-xl mx-auto shadow-md" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-xl transition-opacity">
                                <span className="text-[10px] text-white font-bold uppercase">Change</span>
                              </div>
                           </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                             <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             <span className="text-xs font-bold text-slate-500">Drop or click to upload background</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  {state.isLoading ? (
                    <div className="w-full aspect-square bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-[#5b8dfa] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Wiping pixels...</p>
                    </div>
                  ) : state.processed ? (
                    <ComparisonSlider before={state.original!} after={state.processed} />
                  ) : (
                    <div className="w-full aspect-square bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-300">
                       <span className="text-[10px] font-black uppercase tracking-widest">Preview Area</span>
                    </div>
                  )}

                  {state.processed && !state.isLoading && (
                    <button onClick={handleDownload} className="absolute bottom-6 right-6 bg-[#5b8dfa] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download HD
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 py-20 px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
             <span>© 2024 wipebg.ai All Rights Reserved.</span>
             <div className="flex gap-8">
               <span>Made for Creatives</span>
               <span>Powered by Gemini</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;