import React, { useRef, useState } from 'react';

interface UploaderProps {
  onUpload: (base64: string) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpload(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={`relative group w-full h-[380px] border-4 border-dashed rounded-[2.5rem] transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 shadow-2xl' 
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50 hover:shadow-xl'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        accept="image/*"
      />
      
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-all duration-500 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">Drop your image here</p>
          <p className="text-lg text-slate-500 font-medium">or click to browse files</p>
        </div>
        <div className="flex gap-4 px-5 py-2.5 bg-slate-100/50 rounded-xl">
           <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">JPG • PNG • WEBP</p>
        </div>
      </div>
    </div>
  );
};

export default Uploader;