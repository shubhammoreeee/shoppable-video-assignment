type HistoryItem = {
  videoId: string;
  videoUrl: string;
  title: string;
  currentTime: number;
  duration: number;
  progress: number;
  imageUri: string;
};

class WatchHistoryManager {
  private history: Record<string, HistoryItem> = {};
  private listeners: Set<() => void> = new Set();

  getHistory() {
    return Object.values(this.history).filter(item => item.progress > 0 && item.progress < 0.98);
  }

  saveProgress(
    videoId: string,
    videoUrl: string,
    title: string,
    currentTime: number,
    duration: number,
    imageUri: string
  ) {
    if (duration <= 0) return;
    const progress = currentTime / duration;
    this.history[videoId] = {
      videoId,
      videoUrl,
      title,
      currentTime,
      duration,
      progress,
      imageUri,
    };
    this.notify();
  }

  addListener(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const WatchHistory = new WatchHistoryManager();
