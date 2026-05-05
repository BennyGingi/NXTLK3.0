import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (!data) redirect("/login");

  const { claims } = data;
  const userId = claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, initials, status, avatar_url")
    .eq("id", userId)
    .single();

  return (
    <ChatClient
      user={{
        id:        userId,
        name:      profile?.name ?? (claims.email as string | undefined)?.split("@")[0] ?? "User",
        email:     (claims.email as string | undefined) ?? "",
        initials:  profile?.initials ?? "U",
        avatarUrl: profile?.avatar_url ?? undefined,
        status:    (profile?.status as "online" | "away" | "offline") ?? "online",
      }}
    />
  );
}
