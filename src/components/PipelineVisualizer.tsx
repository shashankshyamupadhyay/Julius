import React from 'react';
import { ProcessedDocument, ProcessingStats } from '../types';
import { Scroll, Scissors, Database, ArrowRight, CheckCircle, Grip } from 'lucide-react';

interface PipelineVisualizerProps {
  document: ProcessedDocument | null;
  stats: ProcessingStats | null;
  step: number; // 0: Idle, 1: Extracting, 2: Chunking, 3: Complete
}

const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ document, stats, step }) => {
  if (!document && step === 0) return null;

  return (
    <div className="w-full bg-roman-cream rounded-sm shadow-md border border-stone-200 overflow-hidden">
      <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
        <h3 className="font-display font-bold text-stone-800 flex items-center gap-2 text-sm tracking-wide uppercase">
          <Grip className="w-4 h-4 text-roman-gold" />
          Ingestion Sequence
        </h3>
        {stats && (
           <span className="text-[10px] font-display font-bold tracking-widest text-roman-red bg-red-50 px-3 py-1 border border-roman-red/20 rounded-full">
             {stats.chunkCount} FRAGMENTS
           </span>
        )}
      </div>

      <div className="p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-10 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -z-10 -translate-y-1/2" />
          
          {/* Step 1: Upload/Extract */}
          <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${step >= 1 ? 'opacity-100 scale-105' : 'opacity-60 scale-100'}`}>
            <div className={`w-12 h-12 rounded-none rotate-45 flex items-center justify-center border-2 transition-colors duration-500 ${step >= 1 ? 'bg-roman-red border-roman-gold shadow-lg' : 'bg-stone-100 border-stone-300'}`}>
              <div className="-rotate-45">
                <Scroll className={`w-5 h-5 ${step >= 1 ? 'text-roman-gold' : 'text-stone-400'}`} />
              </div>
            </div>
            <span className={`text-[10px] font-display font-bold tracking-widest uppercase mt-2 ${step >= 1 ? 'text-roman-red' : 'text-stone-400'}`}>Extraction</span>
          </div>

          <ArrowRight className={`w-5 h-5 ${step >= 2 ? 'text-roman-gold' : 'text-stone-200'}`} />

          {/* Step 2: Chunking */}
          <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${step >= 2 ? 'opacity-100 scale-105' : 'opacity-60 scale-100'}`}>
             <div className={`w-12 h-12 rounded-none rotate-45 flex items-center justify-center border-2 transition-colors duration-500 ${step >= 2 ? 'bg-roman-red border-roman-gold shadow-lg' : 'bg-stone-100 border-stone-300'}`}>
              <div className="-rotate-45">
                <Scissors className={`w-5 h-5 ${step >= 2 ? 'text-roman-gold' : 'text-stone-400'}`} />
              </div>
            </div>
            <span className={`text-[10px] font-display font-bold tracking-widest uppercase mt-2 ${step >= 2 ? 'text-roman-red' : 'text-stone-400'}`}>Fragmentation</span>
          </div>

          <ArrowRight className={`w-5 h-5 ${step >= 3 ? 'text-roman-gold' : 'text-stone-200'}`} />

          {/* Step 3: Ready */}
           <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${step >= 3 ? 'opacity-100 scale-105' : 'opacity-60 scale-100'}`}>
             <div className={`w-12 h-12 rounded-none rotate-45 flex items-center justify-center border-2 transition-colors duration-500 ${step >= 3 ? 'bg-emerald-800 border-emerald-500 shadow-lg' : 'bg-stone-100 border-stone-300'}`}>
              <div className="-rotate-45">
                <Database className={`w-5 h-5 ${step >= 3 ? 'text-emerald-100' : 'text-stone-400'}`} />
              </div>
            </div>
            <span className={`text-[10px] font-display font-bold tracking-widest uppercase mt-2 ${step >= 3 ? 'text-emerald-800' : 'text-stone-400'}`}>Archived</span>
          </div>
        </div>

        {/* Details View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Raw Text Preview */}
          <div className="bg-white p-1 border border-stone-200 shadow-sm">
            <div className="bg-stone-50 border-b border-stone-100 p-2 mb-2">
                <h4 className="text-xs font-display font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <Scroll className="w-3 h-3 text-roman-red" /> Raw Manuscript
                </h4>
            </div>
            <div className="h-48 overflow-y-auto text-xs text-stone-600 font-serif leading-relaxed p-3 bg-white">
              {document ? document.rawText.substring(0, 1000) + '...' : 'Waiting for document...'}
            </div>
            <div className="p-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono text-right">
              {document ? `${document.rawText.length.toLocaleString()} chars` : ''}
            </div>
          </div>

          {/* Chunks Preview */}
          <div className="bg-white p-1 border border-stone-200 shadow-sm">
             <div className="bg-stone-50 border-b border-stone-100 p-2 mb-2">
                <h4 className="text-xs font-display font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-3 h-3 text-roman-red" /> Semantic Fragments
                </h4>
            </div>
            <div className="h-48 overflow-y-auto space-y-3 p-3 bg-stone-50/50">
              {document && document.chunks.length > 0 ? (
                document.chunks.slice(0, 10).map((chunk, idx) => (
                  <div key={chunk.id} className="bg-white p-3 border border-stone-200 shadow-sm hover:border-roman-gold/50 transition-colors">
                    <div className="flex justify-between items-center mb-2 border-b border-stone-100 pb-1">
                      <span className="font-display font-bold text-[10px] text-roman-red uppercase">Fragment {idx + 1}</span>
                      <span className="text-stone-400 text-[9px] font-mono">{chunk.content.length}c</span>
                    </div>
                    <p className="text-stone-700 text-xs font-serif italic line-clamp-3">"{chunk.content}"</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-stone-400 mt-10 font-serif italic text-sm">Waiting for fragmentation...</div>
              )}
            </div>
             <div className="p-2 border-t border-stone-100 text-[10px] text-stone-400 font-mono text-right">
              {document ? `Displaying 10 / ${document.chunks.length}` : ''}
            </div>
          </div>
        </div>

        {step === 3 && (
          <div className="mt-8 flex items-center gap-4 text-emerald-900 bg-emerald-50/50 p-4 border border-emerald-100 animate-fade-in">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <p className="text-sm font-serif">
              <strong className="font-display text-emerald-800 tracking-wide uppercase block text-xs mb-1">Process Complete</strong>
              The document has been successfully parsed and fragmented. It is ready for embedding into the vector archives.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineVisualizer;