import type {
  ActorInfo,
  SceneMarker,
  XRayProduct,
  ChapterPoint,
} from "../types/player.types";

export const DEFAULT_MOVIE_TITLE = "Pushpa: The Rise (Hindi)";

export const MOCK_ACTORS: ActorInfo[] = [
  {
    id: "1",
    name: "Kalpalatha",
    character: "Pushpa's Mother",
    imageUri:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    startTime: 0,
    endTime: 120,
  },
  {
    id: "2",
    name: "Allu Arjun",
    character: "Pushpa Raj",
    imageUri:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    startTime: 120,
    endTime: 600,
  },
  {
    id: "3",
    name: "Rashmika Mandanna",
    character: "Srivalli",
    imageUri:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    startTime: 600,
    endTime: 99999,
  },
];

export const MOCK_SCENE_MARKERS: SceneMarker[] = [
  { id: "m1", time: 45, type: "product", label: "Product moment" },
  { id: "m2", time: 128, type: "xray", label: "Cast intro" },
  { id: "m3", time: 312, type: "chapter", label: "Chapter 2" },
  { id: "m4", time: 520, type: "product", label: "Shoppable scene" },
  { id: "m5", time: 890, type: "xray", label: "Behind the scenes" },
];

export const MOCK_CHAPTERS: ChapterPoint[] = [
  { id: "c1", title: "Opening", startTime: 0 },
  { id: "c2", title: "The Rise Begins", startTime: 312 },
  { id: "c3", title: "Confrontation", startTime: 720 },
];

export const MOCK_XRAY_PRODUCTS: XRayProduct[] = [
  {
    id: "p1",
    name: "Traditional Saree",
    price: "₹ 2,499",
    imageUri:
      "https://images.unsplash.com/photo-1610030469983-4e4f547c9f76?w=400&h=400&fit=crop",
    timestamp: 45,
    buyLink: "https://example.com/saree",
  },
  {
    id: "p2",
    name: "Gold Chain",
    price: "₹ 8,999",
    imageUri:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop",
    timestamp: 128,
    buyLink: "https://example.com/chain",
  },
  {
    id: "p3",
    name: "Forest Plant Décor",
    price: "₹ 599",
    imageUri:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    timestamp: 520,
    buyLink: "https://example.com/plant",
  },
];

export const getActiveActor = (
  currentTime: number,
  actors: ActorInfo[] = MOCK_ACTORS,
): ActorInfo => {
  const match = actors.find(
    (a) => currentTime >= a.startTime && currentTime < a.endTime,
  );
  return match ?? actors[0];
};

export const mergeMarkers = (
  apiMarkers: number[],
  mockMarkers: SceneMarker[] = MOCK_SCENE_MARKERS,
): SceneMarker[] => {
  const fromApi: SceneMarker[] = apiMarkers.map((time, i) => ({
    id: `api-${i}`,
    time,
    type: "product" as const,
    label: "Detected product",
  }));
  const seen = new Set<number>();
  const merged: SceneMarker[] = [];
  [...mockMarkers, ...fromApi].forEach((m) => {
    const key = Math.round(m.time);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(m);
    }
  });
  return merged.sort((a, b) => a.time - b.time);
};
