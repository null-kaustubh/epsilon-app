import { api } from "./api";

export type Space = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
};

export type BlockType = "note" | "markdown" | "image" | "code" | "todo";

export type SpaceBlock = {
  id: string;
  space_id: string;
  type: BlockType;
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
  created_at: string;
  updated_at: string;
};

export type SpaceResponse = {
  space: Space;
  blocks: SpaceBlock[];
};

export type UpsertBlockPayload = {
  id: string;
  space_id: string;
  type: BlockType;
  content: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const spacesApi = {
  getSpace: (slug: string) => api.get<SpaceResponse>(`/spaces/${slug}`),
  listSpaces: () => api.get<Space[]>("/spaces"),
  createSpace: (name: string, description?: string) =>
    api.post<Space>("/spaces", { name, description }),
  updateName: (
    slug: string,
    name: string,
    description?: string,
    iconUrl?: string,
  ) =>
    api.put<void>(`/spaces/${slug}`, { name, description, icon_url: iconUrl }),
  deleteSpace: (slug: string) => api.delete<void>(`/spaces/${slug}`),
  saveBlocks: (slug: string, blocks: UpsertBlockPayload[]) =>
    api.patch<void>(`/spaces/${slug}/blocks`, blocks),
  deleteBlock: (slug: string, blockId: string) =>
    api.delete<void>(`/spaces/${slug}/blocks/${blockId}`),
};
