import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockBlogPosts } from "../mockData";
import type { BlogPost } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listBlogPosts(opts?: {
  from?: number;
  to?: number;
}): R<BlogPost[]> {
  if (!isSupabaseConfigured()) {
    const results = [...mockBlogPosts];
    if (opts?.from !== undefined && opts.to !== undefined) {
      return { data: results.slice(opts.from, opts.to + 1), error: null };
    }
    return { data: results, error: null };
  }
  let query = supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (opts?.from !== undefined && opts.to !== undefined) {
    query = query.range(opts.from, opts.to);
  }
  const { data, error } = await query;
  return { data: data as BlogPost[] | null, error };
}

export async function getBlogPost(id: string): R<BlogPost> {
  if (!isSupabaseConfigured()) {
    return { data: mockBlogPosts.find((p) => p.id === id) ?? null, error: null };
  }
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  return { data: data as BlogPost | null, error };
}

export async function upsertBlogPost(
  post: Omit<BlogPost, "id" | "created_at"> & { id?: string }
): R<BlogPost> {
  if (!isSupabaseConfigured()) {
    return {
      data: { id: `blog-${Date.now()}`, created_at: new Date().toISOString(), ...post },
      error: null,
    };
  }
  const isNew = !post.id;
  const query = isNew
    ? supabase.from("blog_posts").insert(post).select().single()
    : supabase.from("blog_posts").update(post).eq("id", post.id!).select().single();
  const { data, error } = await query;
  if (!error)
    await logActivity(isNew ? "create" : "update", "blog_post", (data as BlogPost)?.id, {
      title: post.title_fr,
    });
  return { data: data as BlogPost | null, error };
}

export async function deleteBlogPost(id: string): R<null> {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (!error) await logActivity("delete", "blog_post", id);
  return { data: null, error };
}
