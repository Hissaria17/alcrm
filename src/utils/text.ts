/**
 * Truncates text to a specified number of words
 * @param text - The text to truncate
 * @param wordCount - Number of words to keep (default: 3)
 * @returns Truncated text with "..." if truncated
 */
export function truncateToWords(text: string, wordCount: number = 3): string {
  if (!text) return '';
  
  const words = text.trim().split(/\s+/);
  
  if (words.length <= wordCount) {
    return text;
  }
  
  return words.slice(0, wordCount).join(' ') + '...';
}

/**
 * Truncates text to a specified number of characters
 * @param text - The text to truncate
 * @param maxLength - Maximum number of characters
 * @returns Truncated text with "..." if truncated
 */
export function truncateToLength(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
} 
