import React, { useState, useRef } from 'react';
import { Upload, Wand2, RefreshCw, AlertCircle, Download, Image as ImageIcon } from 'lucide-react';
import { editEventImage } from '../services/geminiService';
import { LoadingState } from '../types';

export const EventVisualizer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
         setErrorMsg("Das Bild ist zu groß. Bitte maximal 5MB.");
         return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setErrorMsg(null);
        setStatus(LoadingState.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setStatus(LoadingState.LOADING);
    setErrorMsg(null);

    try {
      // Extract base64 data and mime type
      const match = selectedImage.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!match) throw new Error("Invalid image format");
      
      const mimeType = match[1];
      const base64Data = match[2];

      const resultBase64 = await editEventImage(base64Data, mimeType, prompt);
      setGeneratedImage(`data:${mimeType};base64,${resultBase64}`);
      setStatus(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Es gab ein Problem bei der Generierung. Bitte versuchen Sie es erneut.");
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="text-center mb-16">
        <span className="text-gold-500 uppercase tracking-widest text-sm font-bold">Innovation</span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mt-4 mb-6">
          KI-Event-Visualisierer
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Laden Sie ein Foto Ihrer Location hoch und nutzen Sie unsere KI, um Dekoration, Beleuchtung oder Atmosphäre zu simulieren.
          <br/>
          <span className="text-sm italic text-slate-500 mt-2 block">(Powered by Gemini 2.5 Flash Image)</span>
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6 md:p-10 border border-slate-700 shadow-xl backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Controls Section */}
          <div className="space-y-8">
            {/* 1. Upload */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-white flex items-center gap-2">
                <span className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Foto hochladen
              </h3>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  selectedImage ? 'border-gold-500 bg-slate-800' : 'border-slate-600 hover:border-slate-400 bg-slate-800/30'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                {selectedImage ? (
                  <div className="flex flex-col items-center">
                    <img src={selectedImage} alt="Preview" className="h-48 object-contain rounded mb-4" />
                    <span className="text-gold-500 text-sm font-medium">Bild ausgewählt (Klicken zum Ändern)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <Upload size={40} className="mb-4 text-slate-500" />
                    <p className="font-medium">Klicken oder Drag & Drop</p>
                    <p className="text-xs mt-2 text-slate-500">JPG, PNG (max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Prompt */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-white flex items-center gap-2">
                <span className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Wunsch beschreiben
              </h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Z.B.: Füge warme Lichterketten hinzu, mache das Ambiente romantisch, ändere die Farben zu Gold und Weiß..."
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-4 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 h-32 resize-none"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedImage || !prompt || status === LoadingState.LOADING}
              className={`w-full py-4 rounded-md font-bold text-lg tracking-widest transition-all uppercase flex items-center justify-center gap-2 ${
                !selectedImage || !prompt
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gold-600 hover:bg-gold-500 text-white shadow-lg hover:shadow-gold-500/20'
              }`}
            >
              {status === LoadingState.LOADING ? (
                <>
                  <RefreshCw className="animate-spin" />
                  Verarbeite...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Visualisierung Starten
                </>
              )}
            </button>

            {errorMsg && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-md border border-red-400/20">
                <AlertCircle size={20} />
                <p>{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="relative bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
             {status === LoadingState.SUCCESS && generatedImage ? (
               <div className="relative w-full h-full group">
                 <img src={generatedImage} alt="Generated Result" className="w-full h-full object-contain" />
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={generatedImage} 
                      download="mm-event-visualization.png"
                      className="bg-slate-900/80 p-2 rounded-full text-white hover:text-gold-500 flex items-center gap-2 px-4 backdrop-blur-sm border border-slate-700"
                    >
                      <Download size={18} />
                      <span className="text-sm">Download</span>
                    </a>
                 </div>
               </div>
             ) : (
               <div className="text-center p-8 text-slate-600">
                 {status === LoadingState.LOADING ? (
                   <div className="flex flex-col items-center animate-pulse">
                     <div className="w-16 h-16 rounded-full bg-slate-800 mb-4"></div>
                     <p>Die KI analysiert Ihr Bild und wendet Änderungen an...</p>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center">
                     <ImageIcon size={64} className="mb-4 opacity-20" />
                     <p>Das Ergebnis wird hier erscheinen.</p>
                   </div>
                 )}
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};