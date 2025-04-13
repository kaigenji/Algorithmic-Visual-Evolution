export function setTickInterval(callback: () => void, interval: number): NodeJS.Timer {
  return setInterval(callback, interval);
} 