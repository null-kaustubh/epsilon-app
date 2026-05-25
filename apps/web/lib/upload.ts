import { api } from "./api";

type PresignResult = {
  uploadUrl: string;
  fileUrl: string;
};

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Normalize MIME for presign validation (some browsers report image/jpg or ""). */
function uploadContentType(file: File): string {
  if (file.type === "image/jpg") return "image/jpeg";
  if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && MIME_BY_EXT[ext]) return MIME_BY_EXT[ext];
  return "image/jpeg";
}

export async function uploadImage(
  file: File,
  folder: "spaces" | "blocks",
): Promise<string> {
  const contentType = uploadContentType(file);
  const { uploadUrl, fileUrl } = await api.get<PresignResult>(
    `/upload-url?content_type=${encodeURIComponent(contentType)}&content_length=${file.size}&folder=${folder}`,
  );

  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      detail ? `Upload to S3 failed: ${detail}` : "Upload to S3 failed",
    );
  }

  return fileUrl;
}
