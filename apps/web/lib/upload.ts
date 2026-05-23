import { api } from "./api";

type PresignResult = {
  uploadUrl: string;
  fileUrl: string;
};

export async function uploadImage(
  file: File,
  folder: "spaces" | "blocks",
): Promise<string> {
  const { uploadUrl, fileUrl } = await api.get<PresignResult>(
    `/upload-url?content_type=${encodeURIComponent(file.type)}&folder=${folder}`,
  );

  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) throw new Error("Upload to S3 failed");

  return fileUrl;
}
