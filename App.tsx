import React, { useState, useRef } from 'react';
import Uploader from './components/Uploader';
import ComparisonSlider from './components/ComparisonSlider';
import { processImage } from './services/geminiService';
import { ImageState, ProcessingOptions, PresetBackground, BackgroundMode } from './types';

const PRESETS: PresetBackground[] = [
  { id: 'studio', name: 'Studio', url: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=200', prompt: 'a clean high-end photography studio with soft lighting' },
  { id: 'nature', name: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=200', prompt: 'a lush, sunny misty forest with vibrant green leaves' },
  { id: 'office', name: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200', prompt: 'a modern, bright minimalist corporate office' },
  { id: 'neon', name: 'Neon', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200', prompt: 'a stylish cyberpunk street with neon pink and blue lights' },
];

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-base">{desc}</p>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
  <div className="group border-b border-slate-100 py-8 last:border-0 text-left md:text-center">
    <h4 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{question}</h4>
    <p className="text-slate-600 text-base leading-relaxed max-w-2xl mx-auto">{answer}</p>
  </div>
);

// Robust base64 to Blob conversion for mobile downloads
const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

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
  const toolSectionRef = useRef<HTMLDivElement>(null);

  const updateOptions = (updates: Partial<ProcessingOptions>) => {
    setOptions(prev => {
      const next = { ...prev, ...updates };
      if (state.processed) setIsStale(true);
      return next;
    });
  };

  const scrollToTool = () => {
    toolSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpload = async (base64: string) => {
    setState(prev => ({ ...prev, original: base64, processed: null, isLoading: true, error: null }));
    setIsStale(false);
    try {
      const result = await processImage(base64, options);
      setState(prev => ({ ...prev, processed: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || 'Processing failed. Please check your API key.' 
      }));
    }
  };

  const handleDownload = () => {
    if (!state.processed) return;
    
    try {
      const base64Data = state.processed.split(',')[1];
      const blob = b64toBlob(base64Data, 'image/png');
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `wipebg-${Date.now()}.png`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Download failed', err);
      window.open(state.processed, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter">wipebg<span className="text-indigo-600">.ai</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 text-base font-bold text-slate-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          <button 
            onClick={scrollToTool}
            className="bg-slate-900 text-white px-7 py-3 rounded-2xl text-base font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            Get Started
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 md:pt-32 pb-24 md:pb-40 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold uppercase tracking-widest mb-8">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                AI-Powered Magic
              </div>
              <h1 className="text-5xl md:text-8xl font-black leading-[1.05] tracking-tight mb-8">
                Remove Image Backgrounds <span className="gradient-text">Instantly.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl mx-auto lg:mx-0">
                100% automatic and free. Get pixel-perfect transparency in seconds. No software or registration required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <button 
                  onClick={scrollToTool}
                  className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-lg uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                >
                  Remove Background
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-3xl">
              <div className="relative group">
                <div className="absolute -inset-6 bg-indigo-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative glass-panel rounded-[3rem] md:rounded-[4rem] p-4 md:p-6 shadow-2xl border border-white">
                  <div className="aspect-square bg-slate-50 rounded-[2.5rem] md:rounded-[3.2rem] overflow-hidden checkerboard">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000" 
                      alt="Sample" 
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-2xl px-8 py-5 rounded-[2rem] shadow-2xl border border-slate-100 flex items-center gap-5 scale-110 md:scale-125">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black uppercase text-slate-400 mb-0.5 tracking-wider">Status</div>
                      <div className="text-lg font-bold text-slate-900 leading-tight">Wiped!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Section */}
        <section id="tool" ref={toolSectionRef} className="py-24 md:py-32 px-6 bg-slate-50/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-black mb-6">Give it a try</h2>
              <p className="text-xl text-slate-500 font-medium">Upload any photo to see the AI magic in action.</p>
            </div>

            {state.error && (
              <div className="mb-10 p-8 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600 flex items-start gap-6 animate-in fade-in slide-in-from-top-4">
                <svg className="w-8 h-8 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-grow">
                  <p className="text-lg font-bold uppercase tracking-wider mb-2 text-left">Processing Failed</p>
                  <p className="text-base opacity-90 text-left">{state.error}</p>
                </div>
                <button onClick={() => setState(s => ({...s, error: null}))} className="text-sm font-bold uppercase tracking-widest bg-white px-5 py-2 rounded-xl shrink-0 shadow-sm">Retry</button>
              </div>
            )}

            {!state.original ? (
              <Uploader onUpload={handleUpload} />
            ) : (
              <div className="space-y-10 md:space-y-12 animate-in fade-in zoom-in-95 duration-500">
                <div className="glass-panel p-6 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-2xl space-y-10 border border-white">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
                    <div className="flex flex-wrap bg-slate-100/70 p-2 rounded-[2rem] border border-slate-200/50">
                      {(['transparent', 'white', 'preset', 'custom_upload'] as BackgroundMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => updateOptions({ mode: m })}
                          className={`flex-1 min-w-[100px] px-6 py-4 rounded-[1.5rem] text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                            options.mode === m 
                              ? 'bg-white text-indigo-600 shadow-xl ring-1 ring-slate-200' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {m === 'transparent' ? 'Clear' : m === 'white' ? 'White' : m === 'preset' ? 'Presets' : 'Upload'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => state.original && handleUpload(state.original)}
                        disabled={state.isLoading}
                        className={`flex-grow bg-indigo-600 text-white px-10 md:px-12 py-5 md:py-6 rounded-[2rem] text-sm md:text-base font-black uppercase tracking-[0.15em] transition-all shadow-2xl shadow-indigo-200 active:scale-95 ${
                          isStale && !state.isLoading ? 'animate-attention ring-8 ring-indigo-500/10' : ''
                        } disabled:opacity-50`}
                      >
                        {state.isLoading ? 'Processing...' : state.processed ? 'Generate' : 'Wipe Background'}
                      </button>
                      <button 
                        onClick={() => setState({ ...state, original: null, processed: null, error: null })} 
                        className="p-5 md:p-6 bg-white border border-slate-200 text-slate-400 rounded-[2rem] hover:bg-slate-50 transition-colors shrink-0 shadow-sm"
                        title="Reset"
                      >
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {options.mode === 'preset' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 animate-in fade-in slide-in-from-bottom-2">
                      {PRESETS.map((p) => (
                        <button 
                          key={p.id} 
                          onClick={() => updateOptions({ presetId: p.prompt })} 
                          className={`group relative aspect-video rounded-3xl overflow-hidden border-[6px] transition-all ${options.presetId === p.prompt ? 'border-indigo-600 scale-95 shadow-xl' : 'border-transparent hover:border-slate-200'}`}
                        >
                          <img src={p.url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">{p.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {options.mode === 'custom_upload' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                      <input type="file" ref={customBgInputRef} className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => updateOptions({ customBackgroundImage: ev.target?.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} />
                      <button 
                        onClick={() => customBgInputRef.current?.click()} 
                        className="w-full h-48 md:h-64 border-[3px] border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                      >
                        {options.customBackgroundImage ? (
                          <div className="relative h-full w-full p-6">
                            <img src={options.customBackgroundImage} className="h-full w-full object-contain rounded-2xl" alt="BG" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-[3rem] transition-opacity">
                              <span className="text-sm font-black text-white uppercase tracking-widest">Change Background</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center group-hover:text-indigo-400 transition-all">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Upload Custom Background</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    {state.isLoading ? (
                      <div className="w-full aspect-square bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center justify-center p-12">
                        <div className="relative w-24 h-24">
                          <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                          <div className="absolute inset-0 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="mt-10 text-indigo-600 font-black uppercase tracking-[0.3em] text-sm md:text-base">AI is Processing</h3>
                        <p className="mt-4 text-slate-400 text-sm font-bold">Cutting out pixels with surgical precision...</p>
                      </div>
                    ) : state.processed ? (
                      <div>
                        <ComparisonSlider before={state.original!} after={state.processed} />
                        <div className="mt-12 md:mt-16 flex justify-center">
                          <button 
                            onClick={handleDownload} 
                            className="w-full md:w-auto bg-slate-900 text-white px-12 md:px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-sm md:text-lg shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download High-Res Result
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-slate-50/50 rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center justify-center border border-slate-100/50">
                        <img src={state.original} className="max-h-[60%] opacity-20 grayscale mb-10" alt="Preview" />
                        <span className="text-sm font-black text-slate-300 uppercase tracking-[0.4em]">Preview Ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 md:py-48 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
              <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">Professional results for <br/> <span className="gradient-text">every workflow.</span></h2>
              <p className="text-xl md:text-2xl text-slate-500 font-medium">Why spend hours in Photoshop when our AI can do it in seconds?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <FeatureCard 
                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                title="Lightning Fast"
                desc="Processed on high-performance infrastructure. Get your background removed and replaced in under 5 seconds."
              />
              <FeatureCard 
                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                title="Pixel Perfect"
                desc="Advanced AI handles the toughest edges like hair, fur, and semi-transparent objects with incredible accuracy."
              />
              <FeatureCard 
                icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Completely Free"
                desc="No limits, no credits, no watermarks. Professional background removal for everyone at no cost."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 md:py-48 px-6 bg-white border-y border-slate-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-16 text-center">Questions? Answers.</h2>
            <div className="space-y-4">
              <FAQItem 
                question="Is it really free?" 
                answer="Yes! wipebg.ai is a fully free service. We don't charge for high-resolution exports or use complex credit systems. It's built for the community." 
              />
              <FAQItem 
                question="How accurate is the removal?" 
                answer="Our AI models are state-of-the-art. They outperform standard tools by understanding depth and context, ensuring even fine details like stray hairs are preserved." 
              />
              <FAQItem 
                question="Is my data secure?" 
                answer="We take privacy seriously. All processed images are handled in transient memory and automatically purged. We never store your personal photos." 
              />
              <FAQItem 
                question="Can I use it for my business?" 
                answer="Absolutely. wipebg.ai is perfect for e-commerce, real estate, and digital marketing. Use the results freely in any commercial project." 
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 md:py-48 px-6 text-center">
          <div className="max-w-6xl mx-auto bg-slate-900 rounded-[4rem] md:rounded-[6rem] p-16 md:p-32 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black text-white mb-10 leading-tight">Join the future of <br className="hidden md:block" /> image editing.</h2>
              <button 
                onClick={scrollToTool}
                className="bg-white text-slate-900 px-14 py-7 rounded-[2.5rem] font-black text-lg uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                Try It Free Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tighter">wipebg<span className="text-indigo-600">.ai</span></span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Pixel Perfect Image Isolation</p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-sm font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-widest">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            System Operational
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-16 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 wipebg.ai • BUILD WITH BIZGENS AI</p>
        </div>
      </footer>
    </div>
  );
};

export default App;