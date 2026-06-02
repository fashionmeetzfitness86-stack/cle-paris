import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockMediaItems } from "../mockData";
import type { MediaItem } from "../types";

const BUCKET = "cle-paris-media";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

function buildMediaItem(file: {
  id?: string | null;
  name: string;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
}, prefix = ""): MediaItem {
  const path = prefix ? `${prefix}/${file.name}` : file.name;
  return {
    id: file.id ?? file.name,
    url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
    filename: path,
    mime_type: (file.metadata?.mimetype as string) ?? "image/jpeg",
    size_bytes: (file.metadata?.size as number) ?? 0,
    created_at: file.created_at ?? new Date().toISOString(),
  };
}

/** List media items — optionally scoped to a folder prefix */
export async function listMediaItems(folder = ""): R<MediaItem[]> {
  if (!isSupabaseConfigured()) return { data: mockMediaItems, error: null };

  const { data: files, error } = await supabase.storage.from(BUCKET).list(folder, {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) return { data: null, error: error as unknown as PostgrestError };

  const items: MediaItem[] = (files ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => buildMediaItem({
      id: f.id,
      name: f.name,
      metadata: f.metadata as Record<string, unknown> | undefined,
      created_at: f.created_at,
    }, folder));

  return { data: items, error: null };
}

/** Upload a file, optionally into a folder prefix */
export async function uploadMedia(
  file: File,
  folder?: string
): Promise<{ url: string | null; error: PostgrestError | null }> {
  if (!isSupabaseConfigured()) {
    return { url: URL.createObjectURL(file), error: null };
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename  = folder
    ? `${folder}/${Date.now()}-${safeName}`
    : `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
    upsert: false,
  });
  if (error) return { url: null, error: error as unknown as PostgrestError };
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return { url: urlData.publicUrl, error: null };
}

/** Delete a file by its full path (including folder prefix) */
export async function deleteMedia(filename: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.storage.from(BUCKET).remove([filename]);
  return { data: null, error: error as unknown as PostgrestError | null };
}

/** Get a public URL for any file path */
export function getPublicUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
