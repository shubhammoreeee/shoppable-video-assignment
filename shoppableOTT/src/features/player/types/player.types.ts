export type ProductType = {
  id: number;
  videoId: string;
  name: string;
  price: number;
  image: string;
  buyLink: string;
  tags: string[];
};

export type DetectedObjectType = {
  name: string;
  confidence: number;
};

export type ApiResponseType = {
  frame: string;
  timestamp: number;
  detectedObjects: DetectedObjectType[];
  matchedProducts: ProductType[];
};

export type SceneMarkerType = "product" | "xray" | "chapter";

export type SceneMarker = {
  id: string;
  time: number;
  type: SceneMarkerType;
  label?: string;
};

export type ActorInfo = {
  id: string;
  name: string;
  character: string;
  imageUri: string;
  startTime: number;
  endTime: number;
};

export type XRayProduct = {
  id: string;
  name: string;
  price: string;
  imageUri: string;
  timestamp: number;
  buyLink?: string;
};

export type ChapterPoint = {
  id: string;
  title: string;
  startTime: number;
};

export type PlayerMetadata = {
  title: string;
  actors: ActorInfo[];
  markers: SceneMarker[];
  products: XRayProduct[];
  chapters: ChapterPoint[];
};

export type PlaybackState = {
  paused: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  isBuffering: boolean;
  isSeeking: boolean;
  playbackRate: number;
};

export type PlayerLayoutMode = "portrait" | "landscape";

export type VideoPlayerProps = {
  videoUrl: string;
  videoId?: string;
  title?: string;
  paused: boolean;
  currentTime: number;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  onPause: () => void;
  onPlay: () => void;
  onEnd?: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  metadata?: Partial<PlayerMetadata>;
  onClose?: () => void;
  /** Products detected when video is paused (from API) */
  sceneProducts?: ProductType[];
};

export interface VideoPlayerHandle {
  toggleFullscreen: () => void;
  seekTo: (time: number) => void;
}
