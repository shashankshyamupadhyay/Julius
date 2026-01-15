import React, { useState } from 'react';
import { extractTextFromPDF, recursiveCharacterTextSplitter } from './services/documentProcessor';
import { ProcessedDocument, ProcessingStats } from './types';
import PipelineVisualizer from './components/PipelineVisualizer';
import { getGeminiResponse } from './services/gemini';
import { UploadCloud, Landmark, Loader2, Scroll, AlertCircle, MessageSquare, Info, Feather } from 'lucide-react';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [document, setDocument] = useState<ProcessedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  
  // Simple chat state for demo
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setDocument(null);
      setStats(null);
      setPipelineStep(1); // Start Extracting

      // Step 1: Extract Text
      // Simulating a slight delay for visual effect of the pipeline
      await new Promise(r => setTimeout(r, 800)); 
      const rawText = await extractTextFromPDF(file);
      
      setPipelineStep(2); // Start Chunking
      
      // Step 2: Chunk Text
      await new Promise(r => setTimeout(r, 600));
      const chunks = recursiveCharacterTextSplitter(rawText, 1000, 200);

      const newDoc: ProcessedDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        rawText,
        chunks,
        uploadDate: new Date(),
        status: 'ready'
      };

      setDocument(newDoc);
      setStats({
        charCount: rawText.length,
        chunkCount: chunks.length,
        avgChunkSize: Math.round(rawText.length / chunks.length)
      });
      
      setPipelineStep(3); // Complete
    } catch (err: any) {
      setError(err.message || 'An error occurred during processing.');
      setPipelineStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskJulius = async () => {
    if (!chatInput.trim() || !document) return;
    
    setIsChatting(true);
    setChatResponse("");
    try {
      // For this MVP Step 1, we just pick the most relevant looking chunks (mock retrieval)
      // or just send the first few chunks if text is short enough, to prove connectivity.
      // A real RAG would use vector similarity here.
      const context = document.chunks.slice(0, 5).map(c => c.content).join("\n---\n");
      
      const response = await getGeminiResponse(chatInput, context);
      if (response) {
        setChatResponse(response);
      }
    } catch (e) {
      setChatResponse("Error connecting to Julius Brain.");
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen text-stone-800 font-sans pb-20">
      {/* Decorative Top Border */}
      <div className="h-2 bg-gradient-to-r from-roman-red via-roman-gold to-roman-red shadow-md"></div>

      {/* Header */}
      <header className="bg-roman-cream border-b border-roman-gold/20 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="drop-shadow-md">
              <Logo className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-widest text-roman-red uppercase">Julius</h1>
              <p className="text-[10px] tracking-[0.2em] text-stone-500 uppercase font-bold">Academic Prefect</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-roman-gold uppercase">
               <span className="w-2 h-2 bg-roman-gold rounded-full animate-pulse"></span>
               System Online
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        
        {/* Intro Section */}
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-stone-800 mb-8 leading-tight">
            Query the Library of <span className="text-roman-red border-b-2 border-roman-gold px-2">Knowledge</span>
          </h2>
          
          <div className="mb-8 space-y-3">
            <p className="text-2xl md:text-3xl font-display font-bold text-roman-red tracking-widest uppercase drop-shadow-sm">
              Usus Est Magister Optimus
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-roman-gold/50"></div>
              <p className="text-lg text-stone-600 font-serif italic">
                "Experience is the best teacher."
              </p>
              <div className="h-px w-12 bg-roman-gold/50"></div>
            </div>
          </div>

          <p className="text-stone-600 leading-relaxed font-serif mt-8">
            Upload your scrolls (PDFs) to begin the ingestion process.
          </p>
        </section>

        {/* Upload Area */}
        <section className="max-w-2xl mx-auto">
          <div className="relative group p-1">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-roman-gold"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-roman-gold"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-roman-gold"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-roman-gold"></div>

            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div className={`
              border border-stone-300 bg-roman-cream p-12 flex flex-col items-center justify-center text-center transition-all duration-500 shadow-inner
              ${isProcessing ? 'bg-stone-100' : 'group-hover:bg-white group-hover:shadow-lg'}
            `}>
              {isProcessing ? (
                <>
                  <div className="relative">
                     <div className="absolute inset-0 rounded-full border-4 border-stone-200"></div>
                     <div className="absolute inset-0 rounded-full border-4 border-roman-gold border-t-transparent animate-spin"></div>
                     <Loader2 className="w-12 h-12 text-roman-red p-2" />
                  </div>
                  <p className="font-display font-bold text-roman-red mt-6 tracking-widest uppercase">Scribing...</p>
                  <p className="text-sm text-stone-500 mt-2 font-serif italic">Translating manuscript to digital format</p>
                </>
              ) : (
                <>
                  <div className="bg-stone-100 text-stone-600 p-4 rounded-full mb-6 border border-stone-200 group-hover:border-roman-gold group-hover:text-roman-red transition-all duration-300">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-stone-800 mb-2">Deposit Scroll</h3>
                  <p className="text-sm text-stone-500 max-w-xs mx-auto font-serif">
                    Select a PDF from your archives.
                  </p>
                </>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-roman-red flex items-center gap-3 text-roman-red text-sm shadow-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-serif">{error}</span>
            </div>
          )}
        </section>

        {/* Pipeline Visualization (Ingestion Sequence) */}
        <PipelineVisualizer document={document} stats={stats} step={pipelineStep} />

        {/* About & Description Section */}
        <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Project Description */}
          <div className="bg-white p-6 rounded-sm border-l-4 border-roman-gold shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Scroll className="w-24 h-24 text-roman-red" />
            </div>
            <h3 className="font-display font-bold text-roman-red text-xl mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" /> About Julius
            </h3>
            <p className="text-stone-600 font-serif leading-relaxed text-sm">
              Julius is an advanced academic research assistant designed to ingest, analyze, and synthesize knowledge from PDF manuscripts. By leveraging the power of Retrieval Augmented Generation (RAG), Julius allows scholars to converse directly with their documents, extracting insights with the precision of a Roman scribe.
            </p>
          </div>

          {/* About Me */}
          <div className="bg-white p-6 rounded-sm border-l-4 border-stone-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Feather className="w-24 h-24 text-stone-800" />
            </div>
            <h3 className="font-display font-bold text-stone-800 text-xl mb-3 flex items-center gap-2">
              <span className="text-roman-gold">✦</span> The Architect
            </h3>
            <p className="text-stone-600 font-serif leading-relaxed text-sm">
              Engineered by <strong>Shashank Upadhyay</strong>, a developer passionate about bridging the gap between ancient wisdom and modern artificial intelligence. Julius represents the intersection of classical study and cutting-edge NLP technology.
            </p>
          </div>
        </section>

        {/* Quick Test Interaction (Orator Interface) */}
        {pipelineStep === 3 && document && (
          <section className="bg-roman-cream rounded-sm shadow-md border border-stone-200 p-8 animate-fade-in relative overflow-hidden">
             {/* Decorative watermark */}
             <Landmark className="absolute -right-10 -bottom-10 w-64 h-64 text-stone-100 -z-0 opacity-50" />
             
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6 border-b border-stone-200 pb-4">
                 <Scroll className="w-6 h-6 text-roman-gold" />
                 <h3 className="font-display font-bold text-stone-800 text-lg">Orator Interface</h3>
               </div>
               
               <p className="text-sm text-stone-600 mb-6 font-serif italic">
                 The manuscript has been fragmented into readable verses. You may now inquire of Julius.
               </p>
               
               <div className="flex gap-0 shadow-sm">
                 <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="What wisdom do you seek?"
                  className="flex-1 bg-white border border-stone-300 px-6 py-4 font-serif focus:ring-1 focus:ring-roman-gold focus:border-roman-gold outline-none placeholder:italic placeholder:text-stone-400"
                  onKeyDown={(e) => e.key === 'Enter' && handleAskJulius()}
                 />
                 <button 
                  onClick={handleAskJulius}
                  disabled={isChatting || !chatInput}
                  className="bg-roman-red hover:bg-red-900 text-roman-gold px-8 py-4 font-display font-bold tracking-widest transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 border-t border-b border-r border-roman-red"
                 >
                   {isChatting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                   INQUIRE
                 </button>
               </div>

               {chatResponse && (
                 <div className="mt-8 relative">
                   <div className="absolute top-0 left-0 w-1 h-full bg-roman-gold"></div>
                   <div className="pl-6 py-2">
                     <span className="font-display font-bold text-roman-red block mb-2 text-xs tracking-widest">JULIUS RESPONDS:</span>
                     <p className="text-stone-800 leading-loose font-serif text-lg">
                       {chatResponse}
                     </p>
                   </div>
                 </div>
               )}
             </div>
          </section>
        )}

      </main>
      
      <footer className="text-center py-8 text-stone-400 text-xs font-display tracking-widest">
        MMVI • SHASHANK UPADHYAY • MMXXVI
      </footer>
    </div>
  );
};

export default App;