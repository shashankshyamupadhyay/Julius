import { TextChunk } from '../types';

// We access the global pdfjsLib injected via index.html script tag
// to avoid complex bundler configuration issues with the worker.
declare const pdfjsLib: any;

/**
 * Step 1: Text Extraction
 * Extracts raw text from a PDF file using PDF.js.
 * 
 * WHY: We need to convert the binary PDF format into plain text that our
 * LLM and embedding models can understand.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Combine text items, adding spaces for natural reading
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
        
      fullText += pageText + '\n\n'; // Double newline to mark page boundaries/paragraphs
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF. Please ensure it is a valid text-based PDF.");
  }
};

/**
 * Step 2: Intelligent Chunking
 * Splits text into smaller, meaningful chunks for RAG.
 * 
 * WHY:
 * 1. Context Window: LLMs have token limits. We can't feed a 500-page book at once.
 * 2. Retrieval Accuracy: Smaller, focused chunks are easier to match with specific user queries via vector similarity.
 * 3. Overlap: We use overlap to ensure context isn't lost if a sentence is split effectively in half.
 * 
 * NOTE: Converted to iterative approach to prevent "Maximum call stack size exceeded" on large documents.
 */
export const recursiveCharacterTextSplitter = (
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): TextChunk[] => {
  const chunks: TextChunk[] = [];
  const separators = ['\n\n', '\n', '. ', ' ', '']; // Priority order for splitting
  
  let startIndex = 0;
  const textLength = text.length;

  while (startIndex < textLength) {
    // Determine the end of the current potential chunk window
    // We try to grab 'chunkSize' amount of text
    let endIndex = Math.min(startIndex + chunkSize, textLength);
    
    // If we are at the end of the text, just take what's left
    if (endIndex >= textLength) {
      const content = text.slice(startIndex).trim();
      if (content) {
        chunks.push({
          id: `chunk-${Date.now()}-${chunks.length}`,
          content,
          startIndex,
          endIndex: textLength,
          metadata: { source: 'user-upload' }
        });
      }
      break;
    }

    // Get the slice to analyze for separators
    const currentSlice = text.slice(startIndex, endIndex);
    
    let splitPoint = -1; // Relative to currentSlice
    
    // Find the best separator, prioritizing order in 'separators'
    // We look for the last occurrence of the separator to maximize chunk size
    for (const sep of separators) {
      const lastSepIndex = currentSlice.lastIndexOf(sep);
      if (lastSepIndex !== -1) {
        // We found a separator. 
        // We split AFTER the separator (or include it). 
        splitPoint = lastSepIndex + sep.length;
        break;
      }
    }

    // If no separator found in the entire slice (e.g. one very long word), hard split
    if (splitPoint === -1) {
      splitPoint = chunkSize;
    }

    // Extract the actual chunk content
    const chunkContent = currentSlice.slice(0, splitPoint).trim();
    const chunkEndAbsIndex = startIndex + splitPoint;

    if (chunkContent) {
      chunks.push({
        id: `chunk-${Date.now()}-${chunks.length}`,
        content: chunkContent,
        startIndex,
        endIndex: chunkEndAbsIndex,
        metadata: { source: 'user-upload' }
      });
    }

    // Calculate next start index
    // We back up by 'chunkOverlap' to create context overlap
    // New Start = Current End - Overlap
    let nextStart = chunkEndAbsIndex - chunkOverlap;

    // Safety check: ensure we always move forward at least 1 character 
    // to prevent infinite loops (e.g. if chunk is smaller than overlap)
    if (nextStart <= startIndex) {
      nextStart = startIndex + 1;
    }

    startIndex = nextStart;
  }

  return chunks;
};