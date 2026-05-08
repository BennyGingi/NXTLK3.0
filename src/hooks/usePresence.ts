"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function usePresence(userId: string) {
  const statusRef = useRef<"online" | "away" | "offline">("offline");

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const setStatus = async (status: "online" | "away" | "offline") => {
      if (statusRef.current === status) return;
      statusRef.current = status;
      await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)
        .select();
    };

    setStatus("online");

    const handleVisibility = () => {
      if (document.hidden) setStatus("away");
      else setStatus("online");
    };

    const handleActivity = () => {
      if (statusRef.current === "away") setStatus("online");
    };

    const awayTimer = setInterval(() => {
      // handled by visibility
    }, 60000);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    window.addEventListener("beforeunload", () => setStatus("offline"));

    return () => {
      setStatus("offline");
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(awayTimer);
    };
  }, [userId]);
}
