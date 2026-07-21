import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type State = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
};

export function useAdmin(): State {
  const [state, setState] = useState<State>({
    loading: true,
    userId: null,
    email: null,
    isAdmin: false,
  });

  useEffect(() => {
    let mounted = true;

    async function check(userId: string | null, email: string | null) {
      if (!userId) {
        if (mounted) setState({ loading: false, userId: null, email: null, isAdmin: false });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted)
        setState({ loading: false, userId, email, isAdmin: !!data });
    }

    supabase.auth.getUser().then(({ data }) => {
      check(data.user?.id ?? null, data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.id ?? null, session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
