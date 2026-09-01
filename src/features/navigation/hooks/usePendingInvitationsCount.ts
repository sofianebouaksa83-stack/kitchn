import {
  useEffect,
  useState,
} from "react";
import { supabase } from "../../../lib/supabase";

type UsePendingInvitationsCountParams = {
  userId?: string;
};

export function usePendingInvitationsCount({
  userId,
}: UsePendingInvitationsCountParams) {
  const [invCount, setInvCount] =
    useState(0);

  useEffect(() => {
    if (!userId) {
      setInvCount(0);
      return;
    }

    let alive = true;

    async function loadCount() {
      const { data, error } =
        await supabase.rpc(
          "get_my_pending_invitations_count"
        );

      if (!alive) return;

      if (
        !error &&
        typeof data === "number"
      ) {
        setInvCount(data);
      }
    }

    void loadCount();

    const timer = window.setInterval(
      () => {
        void loadCount();
      },
      20_000
    );

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [userId]);

  return invCount;
}