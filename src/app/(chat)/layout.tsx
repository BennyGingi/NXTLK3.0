import SessionGuard from "@/components/auth/SessionGuard";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionGuard />
      {children}
    </>
  );
}
