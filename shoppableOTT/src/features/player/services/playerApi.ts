import { BASE_URL }
from "../../../shared/constants/config";

export const pauseDetectionApi =
  async (

    currentTime: number,

    videoId: string
  ) => {

    const response =
      await fetch(
        `${BASE_URL}/pause`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            currentTime,

            videoId,
          }),
        }
      );

    return response.json();
};