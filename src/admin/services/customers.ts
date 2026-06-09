import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockCustomers } from "../mockData";
import type { Customer } from "../types";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listCustomers(opts?: {
  from?: number;
  to?: number;
  search?: string;
}): R<Customer[]> {
  if (!isSupabaseConfigured()) {
    let results = [...mockCustomers];
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.first_name.toLowerCase().includes(q) ||
          c.last_name.toLowerCase().includes(q)
      );
    }
    if (opts?.from !== undefined && opts.to !== undefined) {
      results = results.slice(opts.from, opts.to + 1);
    }
    return { data: results, error: null };
  }

  let query = supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts?.search) {
    query = query.or(
      `email.ilike.%${opts.search}%,first_name.ilike.%${opts.search}%,last_name.ilike.%${opts.search}%`
    );
  }
  if (opts?.from !== undefined && opts.to !== undefined) {
    query = query.range(opts.from, opts.to);
  }
  const { data, error } = await query;
  return { data: data as Customer[] | null, error };
}

export async function countCustomers(): Promise<number> {
  if (!isSupabaseConfigured()) return mockCustomers.length;
  const { count } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}
