import SessionGuard from "@/components/auth/SessionGuard";
import { ThemeProvider } from "@/context/ThemeContext";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SessionGuard />
      {children}
    </ThemeProvider>
  );
}
