import React, { useState, useRef, useEffect } from 'react';
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
  <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
  <div className="group border-b border-slate-100 py-6 last:border-0">
    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{question}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{answer}</p>
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
    const link = document.createElement('a');
    link.href = state.processed;
    link.download = `wipebg-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-100/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tighter">wipebg<span className="text-indigo-600">.ai</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          <button 
            onClick={scrollToTool}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            Upload Image
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                AI-Powered Magic
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
                Remove Image Backgrounds <span className="gradient-text">Instantly.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
                100% automatic and free. Get pixel-perfect transparency in seconds. No software or registration required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={scrollToTool}
                  className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                >
                  Start for Free
                </button>
                <div className="flex -space-x-3 overflow-hidden p-2">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  ))}
                  <div className="flex items-center ml-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Used by 10k+ Creators
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-2xl">
              <div className="relative group">
                <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative glass-panel rounded-[3.5rem] p-4 shadow-2xl border border-white">
                  <div className="aspect-square bg-slate-50 rounded-[2.8rem] overflow-hidden checkerboard">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" 
                      alt="Sample" 
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase text-slate-400">Status</div>
                      <div className="text-sm font-bold text-slate-800">Background Wiped!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Section */}
        <section id="tool" ref={toolSectionRef} className="py-24 px-6 bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Give it a try</h2>
              <p className="text-slate-500 font-medium">Upload any photo to see the AI in action.</p>
            </div>

            {state.error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <svg className="w-6 h-6 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-grow">
                  <p className="text-sm font-bold uppercase tracking-wider mb-1">Upload Failed</p>
                  <p className="text-xs opacity-80">{state.error}</p>
                </div>
                <button onClick={() => setState(s => ({...s, error: null}))} className="text-xs font-bold uppercase tracking-widest bg-white px-3 py-1 rounded-lg">Retry</button>
              </div>
            )}

            {!state.original ? (
              <Uploader onUpload={handleUpload} />
            ) : (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="glass-panel p-8 rounded-[3rem] shadow-xl space-y-8 border border-white">
                  <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-100 pb-8">
                    <div className="flex bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200/20">
                      {(['transparent', 'white', 'preset', 'custom_upload'] as BackgroundMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => updateOptions({ mode: m })}
                          className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                            options.mode === m 
                              ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {m === 'transparent' ? 'Clear' : m === 'white' ? 'White' : m === 'preset' ? 'Presets' : 'Upload'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => state.original && handleUpload(state.original)}
                        disabled={state.isLoading}
                        className={`bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100 active:scale-95 ${
                          isStale && !state.isLoading ? 'animate-attention ring-4 ring-indigo-500/10' : ''
                        } disabled:opacity-50`}
                      >
                        {state.isLoading ? 'Working...' : 'Wipe Background'}
                      </button>
                      <button 
                        onClick={() => setState({ ...state, original: null, processed: null, error: null })} 
                        className="p-4 bg-white border border-slate-200 text-slate-400 rounded-[1.5rem] hover:bg-slate-50 transition-colors"
                        title="Reset"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {options.mode === 'preset' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2">
                      {PRESETS.map((p) => (
                        <button 
                          key={p.id} 
                          onClick={() => updateOptions({ presetId: p.prompt })} 
                          className={`group relative aspect-video rounded-2xl overflow-hidden border-4 transition-all ${options.presetId === p.prompt ? 'border-indigo-600 scale-95' : 'border-transparent hover:border-slate-200'}`}
                        >
                          <img src={p.url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform" alt={p.name} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2">
                            <span className="text-white text-[9px] font-black uppercase tracking-[0.2em]">{p.name}</span>
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
                        className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all group"
                      >
                        {options.customBackgroundImage ? (
                          <div className="relative h-full w-full p-4">
                            <img src={options.customBackgroundImage} className="h-full w-full object-contain rounded-xl" alt="BG" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity">
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Background</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center group-hover:text-indigo-400 transition-colors">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Custom Background</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="relative group">
                    {state.isLoading ? (
                      <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center p-12">
                        <div className="relative w-20 h-20">
                          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <h3 className="mt-8 text-indigo-600 font-black uppercase tracking-[0.3em] text-xs">AI is Processing</h3>
                        <p className="mt-2 text-slate-400 text-[10px] font-bold">Cutting out pixels with surgical precision...</p>
                      </div>
                    ) : state.processed ? (
                      <div>
                        <ComparisonSlider before={state.original!} after={state.processed} />
                        <div className="mt-10 flex justify-center">
                          <button 
                            onClick={handleDownload} 
                            className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Full HD Result
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center border border-slate-100/50">
                        <img src={state.original} className="max-h-[70%] opacity-20 grayscale mb-6" alt="Preview" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Preview Ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">Professional results for <br/> <span className="gradient-text">every workflow.</span></h2>
              <p className="text-lg text-slate-500 font-medium">Why spend hours in Photoshop when our AI can do it in seconds?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                title="Lightning Fast"
                desc="Processed in the cloud with high-performance GPUs. Get your results in under 5 seconds."
              />
              <FeatureCard 
                icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                title="Pixel Perfect"
                desc="Our AI handles complex edges like hair, fur, and transparency with surgical precision."
              />
              <FeatureCard 
                icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="Always Free"
                desc="No subscriptions, no hidden fees. High-resolution downloads for everyone, forever."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 px-6 bg-white border-y border-slate-100">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FAQItem 
                question="Is it really free?" 
                answer="Yes! wipebg.ai is completely free to use. We don't charge for high-resolution downloads or require any credits. Use it as much as you need." 
              />
              <FAQItem 
                question="How does it work?" 
                answer="We use advanced deep learning models (Gemini Flash) to analyze your image, identify the main subject, and separate it from the background with high precision." 
              />
              <FAQItem 
                question="What happens to my data?" 
                answer="Privacy is our priority. Your images are processed securely and automatically deleted after processing. We don't store your photos or use them for training." 
              />
              <FAQItem 
                question="Can I use it for commercial projects?" 
                answer="Absolutely! Any image you process with wipebg.ai can be used for both personal and commercial projects without attribution." 
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-[4rem] p-16 md:p-24 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">Ready to remove your <br/> first background?</h2>
              <button 
                onClick={scrollToTool}
                className="bg-white text-slate-900 px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
              >
                Upload Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tighter">wipebg<span className="text-indigo-600">.ai</span></span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pixel Perfect Separation</p>
          </div>

          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            All systems normal
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-12 border-t border-slate-50 text-center">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">© 2024 wipebg.ai • Built with Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};

export default App;