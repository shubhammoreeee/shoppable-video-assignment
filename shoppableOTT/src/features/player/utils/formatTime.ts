/** Format seconds as M:SS or H:MM:SS */
export const formatTime = (seconds: number, showNegative = false): string => {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const prefix = showNegative ? "- " : "";
  if (h > 0) {
    return `${prefix}${h}:${pad(m)}:${pad(s)}`;
  }
  return `${prefix}${m}:${pad(s)}`;
};

export const formatRemaining = (current: number, duration: number): string =>
  formatTime(Math.max(0, duration - current), true);
