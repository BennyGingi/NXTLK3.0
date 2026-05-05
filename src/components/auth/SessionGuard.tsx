"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL    = 5 * 60 * 1000;

export default function SessionGuard() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const raw = localStorage.getItem("nxtlk_login_time");
      if (!raw) return;
      if (Date.now() - parseInt(raw, 10) > TWENTY_FOUR_HOURS) {
        const supabase = createClient();
        await supabase.auth.signOut();
        localStorage.removeItem("nxtlk_login_time");
        localStorage.removeItem("nxtlk_remember");
        router.push("/login");
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
