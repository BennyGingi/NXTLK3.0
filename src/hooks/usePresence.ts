"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function usePresence(userId: string) {
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const setStatus = (status: "online" | "away" | "offline") =>
      supabase.from("profiles").update({ status }).eq("id", userId);

    setStatus("online");

    const handleVisibilityChange = () =>
      setStatus(document.visibilityState === "hidden" ? "away" : "online");

    const handleBeforeUnload = () => setStatus("offline");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      setStatus("offline");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId]);
}
