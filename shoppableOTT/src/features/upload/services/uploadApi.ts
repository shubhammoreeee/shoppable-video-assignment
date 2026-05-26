import { BASE_URL } from "../../../shared/constants/config";

export const uploadVideoApi = (
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/create-video`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress && event.total > 0) {
        const percent = Math.min(
          100,
          Math.max(0, Math.round((event.loaded / event.total) * 100)),
        );
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(xhr.responseText ? JSON.parse(xhr.responseText) : {});
        } catch {
          resolve({});
        }
        return;
      }
      reject(new Error(`Upload failed (${xhr.status})`));
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
