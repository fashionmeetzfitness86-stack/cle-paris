import type { PostgrestError } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../../lib/supabase";
import { mockOrders } from "../mockData";
import type { Order, OrderStatus } from "../types";
import { logActivity } from "./activity";

type R<T> = Promise<{ data: T | null; error: PostgrestError | null }>;

export async function listOrders(opts?: {
  from?: number;
  to?: number;
  status?: OrderStatus | "all";
  search?: string;
}): R<Order[]> {
  if (!isSupabaseConfigured()) {
    let results = [...mockOrders];
    if (opts?.status && opts.status !== "all") {
      results = results.filter((o) => o.status === opts.status);
    }
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      results = results.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q)
      );
    }
    if (opts?.from !== undefined && opts.to !== undefined) {
      results = results.slice(opts.from, opts.to + 1);
    }
    return { data: results, error: null };
  }

  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (opts?.status && opts.status !== "all") {
    query = query.eq("status", opts.status);
  }
  if (opts?.search) {
    query = query.or(
      `order_number.ilike.%${opts.search}%,customer_email.ilike.%${opts.search}%`
    );
  }
  if (opts?.from !== undefined && opts.to !== undefined) {
    query = query.range(opts.from, opts.to);
  }
  const { data, error } = await query;
  return { data: data as Order[] | null, error };
}

export async function getOrder(id: string): R<Order> {
  if (!isSupabaseConfigured()) {
    return { data: mockOrders.find((o) => o.id === id) ?? null, error: null };
  }
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  return { data: data as Order | null, error };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): R<Order> {
  if (!isSupabaseConfigured()) {
    const order = mockOrders.find((o) => o.id === id);
    return { data: order ? { ...order, status } : null, error: null };
  }
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (!error) await logActivity("update_status", "order", id, { status });
  return { data: data as Order | null, error };
}

export async function countOrders(): Promise<number> {
  if (!isSupabaseConfigured()) return mockOrders.length;
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export async function revenueThisMonth(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return mockOrders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((sum, o) => sum + o.total, 0);
  }
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", start.toISOString())
    .not("status", "in", '("cancelled","refunded")');
  if (!data) return 0;
  return (data as { total: number }[]).reduce((sum, o) => sum + o.total, 0);
}
