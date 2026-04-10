"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  House,
  Plus,
  FolderSimple,
  Clock,
  Gear,
  SignOut,
  Sun,
  Moon,
  Question,
} from "phosphor-react";
import { useTheme } from "../../../hooks/useTheme";
import { useRecents, RecentSpace } from "../../../hooks/useRecents";
import { Space } from "../../../lib/spaces";
import { api } from "../../../lib/api";
import { cn } from "../../../lib/utils";

type SidebarProps = {
  spaces: Space[];
  onSpaceCreated?: (space: Space) => void;
  onRequestCreate?: () => void;
};

export default function Sidebar({ spaces, onRequestCreate }: SidebarProps) {
  const router = useRouter();
  const { theme, handleChange: toggleTheme } = useTheme();
  const { recents, addRecent } = useRecents();
  const isDark = theme === "dark";

  const validRecents = recents.filter((r) => spaces.some((s) => s.slug === r.slug));

  async function handleSignOut() {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // ignore
    }
    router.push("/signin");
  }

  function handleSpaceClick(slug: string, name: string) {
    addRecent(slug, name);
  }

  return (
    <aside
      className="h-full w-56 shrink-0 bg-background rounded-2xl border border-border
                  flex flex-col select-none overflow-hidden"
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-3">
        <Link href="/home" className="flex items-center gap-2.5 group">
          <span className="text-accent text-xl font-bold">Ɛ</span>
          <span className="text-foreground text-[15px] font-semibold tracking-tight group-hover:text-accent transition-colors">
            Epsilon
          </span>
        </Link>
      </div>

      {/* MENU section */}
      <nav className="px-3 mt-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
          Menu
        </p>
        <NavItem href="/home" icon={<House size={18} weight="duotone" />} label="Dashboard" active />
        <NavItem
          href="#"
          icon={<FolderSimple size={18} weight="duotone" />}
          label="Spaces"
          count={spaces.length}
        />
      </nav>

      {/* Recents */}
      {validRecents.length > 0 && (
        <div className="px-3 mt-3">
          <div className="flex items-center gap-1.5 px-2 mb-1.5">
            <Clock size={12} className="text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Recents
            </p>
          </div>
          <ul className="flex flex-col gap-0.5">
            {validRecents.map((r: RecentSpace) => (
              <li key={r.slug}>
                <Link
                  href={`/spaces/${r.slug}`}
                  onClick={() => handleSpaceClick(r.slug, r.name)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                             text-[13px] text-muted-foreground hover:text-foreground
                             hover:bg-secondary transition-colors truncate"
                >
                  <SpaceIcon name={r.name} />
                  <span className="truncate">{r.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Spaces */}
      <div className="px-3 mt-3 flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <FolderSimple size={12} className="text-muted-foreground" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              All Spaces
            </p>
          </div>
          <button
            onClick={onRequestCreate}
            className="p-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
            aria-label="New space"
          >
            <Plus size={13} className="text-muted-foreground hover:text-accent transition-colors" />
          </button>
        </div>
        <ul className="flex flex-col gap-0.5 overflow-y-auto max-h-[calc(100vh-420px)] pr-1">
          {spaces.map((space) => (
            <li key={space.id}>
              <Link
                href={`/spaces/${space.slug}`}
                onClick={() => handleSpaceClick(space.slug, space.name)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                           text-[13px] text-muted-foreground hover:text-foreground
                           hover:bg-secondary transition-colors truncate"
              >
                <SpaceIcon name={space.name} />
                <span className="truncate">{space.name}</span>
              </Link>
            </li>
          ))}
          {spaces.length === 0 && (
            <li className="px-2 py-4 text-xs text-muted-foreground text-center">
              No spaces yet
            </li>
          )}
        </ul>
      </div>

      {/* GENERAL section */}
      <div className="px-3 mt-auto pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">
          General
        </p>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                     text-[13px] text-muted-foreground hover:text-foreground
                     hover:bg-secondary transition-colors w-full cursor-pointer"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>
        <button
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                     text-[13px] text-muted-foreground hover:text-foreground
                     hover:bg-secondary transition-colors w-full cursor-pointer"
        >
          <Gear size={18} />
          <span>Settings</span>
        </button>
        <button
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                     text-[13px] text-muted-foreground hover:text-foreground
                     hover:bg-secondary transition-colors w-full cursor-pointer"
        >
          <Question size={18} />
          <span>Help</span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                     text-[13px] text-muted-foreground hover:text-foreground
                     hover:bg-secondary transition-colors w-full cursor-pointer"
        >
          <SignOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

/* ─── Helpers ─── */

function NavItem({
  href,
  icon,
  label,
  active,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] transition-colors relative",
        active
          ? "bg-secondary text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 bg-accent rounded-r-full" />
      )}
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}

const COLORS = [
  "bg-accent/20 text-accent",
  "bg-success/20 text-success",
  "bg-link/20 text-link",
  "bg-destructive/20 text-destructive",
  "bg-ring/20 text-ring",
];

function SpaceIcon({ name }: { name: string }) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    COLORS.length;
  return (
    <span
      className={cn(
        "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0",
        COLORS[idx],
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
