
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
      {/* Robot Head SVG inspired by user image */}
      <svg className="w-8 h-8 text-[#5b8dfa] transition-transform group-hover:-rotate-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".2"/>
        <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm4 9h-8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1zm-4-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" opacity=".1"/>
        {/* Simple Robot Mask */}
        <rect x="5" y="8" width="14" height="8" rx="3" fill="#5b8dfa" />
        <circle cx="8.5" cy="11" r="1.5" fill="white" />
        <circle cx="15.5" cy="11" r="1.5" fill="white" />
        <path d="M10 13.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="white" className="hidden" />
        <path d="M10 14h4c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1z" fill="white" />
        <rect x="11.5" y="6" width="1" height="2" fill="#5b8dfa" />
        <circle cx="12" cy="5.5" r="0.8" fill="#5b8dfa" />
        <rect x="3.5" y="10.5" width="1.5" height="3" rx="0.5" fill="#5b8dfa" />
        <rect x="19" y="10.5" width="1.5" height="3" rx="0.5" fill="#5b8dfa" />
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
        error: err instanceof Error ? err.message : 'Processing failed.' 
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
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <WipeBGLogo />
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-[#5b8dfa] transition-colors">How it works</a>
            <a href="#features" className="hover:text-[#5b8dfa] transition-colors">Features</a>
            <a href="#faq" className="hover:text-[#5b8dfa] transition-colors">FAQ</a>
            <button className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Try Now</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center mb-8 animate-in slide-in-from-bottom-4 duration-700">
             <WipeBGLogo className="mb-2 scale-150 origin-center" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-black tracking-tight leading-tight mb-6">
            Remove image background, <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5b8dfa] to-blue-600">100% Free & Fast.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12">
            The ultimate AI tool to remove backgrounds with pixel-perfect precision. Trusted by professionals worldwide for ecommerce, design, and photography.
          </p>

          <div id="uploader-area" className="w-full">
            {!state.original ? (
              <Uploader onUpload={handleUpload} />
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {/* Control Center */}
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
                        {state.isLoading ? 'Processing...' : 'Remove Background'}
                      </button>
                      <button onClick={() => setState({ ...state, original: null, processed: null })} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50">Reset</button>
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

                {/* Preview */}
                <div className="relative">
                  {state.isLoading ? (
                    <div className="w-full aspect-square bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-[#5b8dfa] border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Wiping pixels...</p>
                    </div>
                  ) : state.processed ? (
                    <ComparisonSlider before={state.original!} after={state.processed} />
                  ) : null}

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

      {/* Feature Section */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-200 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-black mb-4 tracking-tight">Advanced AI Detection</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">Why settle for messy edges? wipebg.ai provides studio-quality results every single time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 text-[#5b8dfa] rounded-2xl flex items-center justify-center mb-8">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
              </div>
              <h3 className="text-xl font-black mb-4 text-black">Precision Clipping</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Our advanced algorithms handle the toughest scenarios: hair, fur, semi-transparent fabrics, and complex jewelry.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-8">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="text-xl font-black mb-4 text-black">Ready for Business</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Instantly generate white background photos for Amazon, Shopify, and Etsy. Speed up your product listing process by 10x.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-8">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-black mb-4 text-black">Privacy Secured</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">We don't store your photos. Everything is processed through secure, encrypted channels and discarded immediately after use.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
               <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border border-slate-100 translate-y-8">
                    <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                  </div>
               </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-black text-black mb-8 leading-tight">The smartest way <br/> to wipe backgrounds.</h2>
              <div className="space-y-8">
                {[
                  { title: "Upload your image", desc: "Drag and drop any portrait, product, or landscape image." },
                  { title: "AI handles the rest", desc: "Our neural network detects the subject and wipes the background in < 5s." },
                  { title: "Refine or Replace", desc: "Choose a solid color, a preset scene, or keep it transparent." },
                  { title: "High-Res Download", desc: "Get your file in crisp HD resolution with full alpha transparency." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start group">
                    <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-sm font-black group-hover:bg-[#5b8dfa] transition-colors">{idx + 1}</div>
                    <div>
                      <h4 className="font-black text-black text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-slate-50 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-16 tracking-tight">Questions?</h2>
          <div className="space-y-4">
            {[
              { q: "Is wipebg.ai really free?", a: "Yes, our web-based background remover is 100% free to use for personal and commercial projects." },
              { q: "What is the maximum image size?", a: "We support images up to 20MB. For best results, we recommend high-resolution JPG or PNG files." },
              { q: "Can I replace the background with my own photo?", a: "Absolutely! Use the 'Upload BG' mode to select any image from your device to use as the new background." },
              { q: "Does it work on smartphones?", a: "Yes, wipebg.ai is fully responsive and works perfectly on iOS and Android devices." }
            ].map((item, idx) => (
              <details key={idx} className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all open:ring-2 open:ring-blue-100">
                <summary className="list-none cursor-pointer flex justify-between items-center font-bold text-slate-800 text-lg">
                  {item.q}
                  <span className="group-open:rotate-180 transition-transform bg-slate-100 p-2 rounded-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <p className="mt-4 text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-4">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <WipeBGLogo className="mb-8" />
              <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                The world's most effective AI-powered background remover. Create clean photos for e-commerce, social media, and professional design in seconds.
              </p>
            </div>
            <div>
              <h5 className="font-black text-black uppercase tracking-widest text-xs mb-8">Solution</h5>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li><a href="#" className="hover:text-black">E-commerce</a></li>
                <li><a href="#" className="hover:text-black">Individuals</a></li>
                <li><a href="#" className="hover:text-black">Developers</a></li>
                <li><a href="#" className="hover:text-black">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-black uppercase tracking-widest text-xs mb-8">Legal</h5>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li><a href="#" className="hover:text-black">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-black">Terms of Service</a></li>
                <li><a href="#" className="hover:text-black">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
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
