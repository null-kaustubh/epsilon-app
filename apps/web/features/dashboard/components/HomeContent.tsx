"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { Space } from "../../../lib/spaces";
import { useRecents } from "../../../hooks/useRecents";
import { logout } from "../../../lib/api";
import { ThemeContext } from "../../../context/ThemeProvider";
import { useSpaces } from "../hooks/useSpaces";
import { RecentlyVisited } from "./RecentlyVisited";
import { YourSpaces } from "./YourSpaces";
import { BottomBar } from "./BottomBar";
import { ToastStack } from "./ToastStack";

type HomeContentProps = {
  initialSpaces: Space[];
  username: string;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeContent({
  initialSpaces,
  username,
}: HomeContentProps) {
  const router = useRouter();
  const { recents, addRecent, removeRecent, hydrated } = useRecents();

  const {
    spaces,
    creating,
    setCreating,
    pendingDeletes,
    handleCreateSpace,
    handleRenameSpace,
    handleDeleteSpace,
    handleUndo,
    handleExpire,
  } = useSpaces({ initialSpaces, router, addRecent, removeRecent });

  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;
  const { theme, handleChange } = themeContext;

  async function handleLogout() {
    await logout();
    router.push("/signin");
  }

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <h1
          className="text-4xl font-semibold font-head text-foreground tracking-tight text-center"
          suppressHydrationWarning
        >
          {getGreeting()}
          <span className="text-accent">,</span> {username}
          <span className="text-accent">.</span>
        </h1>

        <RecentlyVisited
          spaces={spaces}
          recents={recents}
          hydrated={hydrated}
          addRecent={addRecent}
        />

        <YourSpaces
          spaces={spaces}
          creating={creating}
          setCreating={setCreating}
          pendingDeletes={pendingDeletes}
          addRecent={addRecent}
          onCreateSpace={handleCreateSpace}
          onRenameSpace={handleRenameSpace}
          onDeleteSpace={handleDeleteSpace}
        />
      </div>

      <BottomBar
        isDark={theme === "dark"}
        onThemeChange={handleChange}
        onLogout={handleLogout}
      />

      <ToastStack
        pendingDeletes={pendingDeletes}
        onUndo={handleUndo}
        onExpire={handleExpire}
      />
    </div>
  );
}
