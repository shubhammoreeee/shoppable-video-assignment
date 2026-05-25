import { BASE_URL } from "../../../shared/constants/config";
import type { VideoType } from "../types/home.types";

/** Normalize API payload into a video array. */
const normalizeVideos = (data: unknown): VideoType[] => {
  if (Array.isArray(data)) {
    return data
      .map((item) => ({
        id: String(item?.id ?? item?.videoId ?? ""),
        videoUrl: String(item?.videoUrl ?? item?.url ?? ""),
      }))
      .filter((v) => v.id && v.videoUrl);
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.videos)) {
      return normalizeVideos(obj.videos);
    }
    if (Array.isArray(obj.data)) {
      return normalizeVideos(obj.data);
    }
  }

  return [];
};

export const fetchVideosApi = async (): Promise<VideoType[]> => {
  const response = await fetch(`${BASE_URL}/videos`);

  if (!response.ok) {
    throw new Error(`Failed to load videos (${response.status})`);
  }

  const json = await response.json();
  return normalizeVideos(json);
};
