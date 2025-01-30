import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./use-session";
import db from "@/db";

interface SearchRecord {
  id: string;
  keyword: string;
  saved: boolean;
  created_at: string;
}

export const useCreditData = () => {
  const { session } = useSession();
  const { data: creditData, error: creditError } = useQuery({
    queryKey: ["credits", session?.user?.id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data, error } = await db
        .from("credits")
        .select("*")
        .eq("id", session?.user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 1000,
    enabled: !!session?.user?.id,
  });

  const creditRemaining = creditData?.total_credit - creditData?.used_credit;

  return { creditData, creditError, creditRemaining };
};

export const useUpdateCredits = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const updateCreditsAndSearch = async (keyword: string) => {
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      const { data: creditData, error: creditErrors } = await db
        .from("credits")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (creditErrors) throw creditErrors;

      const usedCredits = Number(creditData.used_credit);

      const { data: updatedCredits, error: creditError } = await db
        .from("credits")
        .update({ used_credit: usedCredits + 1 })
        .eq("id", session.user.id)
        .select()
        .single();

      if (creditError) throw creditError;

      // Insert search record
      const { data: insertedSearch, error: searchError } = await db
        .from("searches")
        .insert(
          {
            id: session.user.id,
            keyword: keyword,
            save: false,
          },
          { returning: "representation" }
        )
        .select("*");

      if (searchError) throw searchError;

      // Save current search ID to session storage
      const currentSearchId = insertedSearch[0]?.search_id;
      if (currentSearchId) {
        sessionStorage.setItem("currentSearchId", currentSearchId);
      }

      // Invalidate credits query to trigger a refetch
      await queryClient.invalidateQueries({
        queryKey: ["credits", session.user.id],
      });

      return updatedCredits;
    } catch (error) {
      console.error("Error updating credits:", error);
      throw error;
    }
  };

  return { updateCreditsAndSearch };
};
