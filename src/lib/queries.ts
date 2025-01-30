import db from "@/db";
import { Search } from "@/types/search";

export async function fetchRecentSearches({
  id,
}: {
  id: string;
}): Promise<Search[]> {
  const { data, error } = await db
    .from("searches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)
    .eq("id", id);

  if (error) throw error;
  return data || [];
}

export async function fetchSavedSearches({
  id,
}: {
  id: string;
}): Promise<Search[]> {
  const { data, error } = await db
    .from("searches")
    .select("*")
    .eq("save", true)
    .order("created_at", { ascending: false })
    .eq("id", id);

  if (error) throw error;
  return data || [];
}
