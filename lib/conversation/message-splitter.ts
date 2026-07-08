export function splitAinaReply(text: string): string[] {
  if (!text) return [];

  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}