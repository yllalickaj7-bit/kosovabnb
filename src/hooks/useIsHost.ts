import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** True nëse përdoruesi i kyçur ka rolin host ose admin (për mjetet vetëm për pronarë). */
export const useIsHost = (): boolean => {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["is-host", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) return false;
      return (data ?? []).some((r) => r.role === "host" || r.role === "admin");
    },
  });
  return !!user && !!data;
};
