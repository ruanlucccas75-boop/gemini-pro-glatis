export interface ReadingStats {
  minutes: number;
  wordCount: number;
  characterCount: number;
  label: string;
  isLong: boolean;
}

/**
 * Calculates the estimated reading time for a text response.
 * Standard silent reading speed is ~200 words per minute.
 * A response is considered "long" when it meets the threshold (default: 100 words).
 */
export function calculateReadingStats(
  content: string,
  minWordThreshold = 100,
  wordsPerMinute = 200
): ReadingStats | null {
  if (!content || typeof content !== 'string') return null;

  // Clean markdown tokens for an accurate count of readable text
  const clean = content
    .replace(/```[\s\S]*?```/g, (code) => code.replace(/```/g, ' ')) // keep code words without backticks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // preserve link anchor text
    .replace(/[#*_~>[\]()!|]/g, ' ') // strip markdown punctuation
    .trim();

  const words = clean.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  if (wordCount < minWordThreshold) {
    return null;
  }

  const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
  const label = minutes === 1 ? '~1 min de leitura' : `~${minutes} min de leitura`;

  return {
    minutes,
    wordCount,
    characterCount: content.length,
    label,
    isLong: true,
  };
}
