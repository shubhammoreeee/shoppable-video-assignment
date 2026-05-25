import { BASE_URL }
from "../../../shared/constants/config";

export const uploadVideoApi =
  async (
    formData: FormData
  ) => {

    const response =
      await fetch(

        `${BASE_URL}/create-video`,

        {
          method: "POST",

          body: formData,
        }
      );

    return response.json();
};