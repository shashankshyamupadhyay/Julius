export interface ProcessedDocument {
  id: string;
  name: string;
  rawText: string;
  chunks: TextChunk[];
  uploadDate: Date;
  status: 'processing' | 'ready' | 'error';
}

export interface TextChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  metadata: {
    source: string;
    page?: number;
  };
}

export interface ProcessingStats {
  charCount: number;
  chunkCount: number;
  avgChunkSize: number;
}