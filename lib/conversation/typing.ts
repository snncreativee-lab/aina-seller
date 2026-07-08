export function getTypingDelay(text: string) {
  const baseDelay = 700;
  const perCharDelay = text.length * 25;
  const maxDelay = 2200;

  return Math.min(baseDelay + perCharDelay, maxDelay);
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}