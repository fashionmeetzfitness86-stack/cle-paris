import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import type { ContentBlock } from "../types";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

// ── Mock fallback ────────────────────────────────────────────────
const mockBlocks: ContentBlock[] = [
  {
    id: "cb-001",
    page: "home",
    block_type: "hero",
    title_fr: "La Mode Sans Compromis",
    title_en: "Fashion Without Compromise",
    subtitle_fr: "Collection Ombre Saison 2024",
    subtitle_en: "Ombre Season Collection 2024",
    body_fr: "Des pièces pensées pour durer.",
    body_en: "Pieces designed to last.",
    image: "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=1600",
    video_url: "",
    link: "/collection",
    cta_fr: "Découvrir la collection",
    cta_en: "Discover the collection",
    data: {},
    sort_order: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
  },
];

// ── List ─────────────────────────────────────────────────────────
export async function listContentBlocks(page = "home"): R<ContentBlock[]> {
  if (!isSupabaseConfigured()) {
    return { data: mockBlocks.filter((b) => b.page === page), error: null };
  }
  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("page", page)
    .order("sort_order");
  return { data: data as ContentBlock[] | null, error };
}

export async function listAllContentBlocks(): R<ContentBlock[]> {
  if (!isSupabaseConfigured()) return { data: mockBlocks, error: null };
  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .order("page")
    .order("sort_order");
  return { data: data as ContentBlock[] | null, error };
}

// ── Upsert ───────────────────────────────────────────────────────
export async function upsertContentBlock(
  block: Omit<ContentBlock, "id" | "created_at"> & { id?: string }
): R<ContentBlock> {
  if (!isSupabaseConfigured()) {
    return {
      data: { id: `cb-${Date.now()}`, created_at: new Date().toISOString(), ...block },
      error: null,
    };
  }
  const isNew = !block.id;
  const query = isNew
    ? supabase.from("content_blocks").insert(block).select().single()
    : supabase.from("content_blocks").update(block).eq("id", block.id!).select().single();
  const { data, error } = await query;
  return { data: data as ContentBlock | null, error };
}

// ── Delete ───────────────────────────────────────────────────────
export async function deleteContentBlock(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("content_blocks").delete().eq("id", id);
  return { data: null, error };
}

// ── Reorder ──────────────────────────────────────────────────────
export async function reorderContentBlocks(
  orderedIds: string[]
): Promise<{ error: PostgrestError | null }> {
  if (!isSupabaseConfigured()) return { error: null };
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("content_blocks")
      .update({ sort_order: i + 1 })
      .eq("id", orderedIds[i]);
    if (error) return { error };
  }
  return { error: null };
}
