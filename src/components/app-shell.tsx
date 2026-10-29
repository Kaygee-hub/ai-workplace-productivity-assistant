import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Mail, NotebookPen, ListChecks, Search, MessagesSquare, Info,
  PanelLeftClose, PanelLeftOpen, Menu, X, Compass, ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/planner", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chatbot", icon: MessagesSquare },
  { to: "/about", label: "About", icon: Info },
] as const;

export const DISCLAIMER =
  "AI-generated content may be inaccurate. Review and verify all outputs before using them in professional decisions. Do not submit confidential, personal or sensitive workplace information.";

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((n) => {
        const active = path === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            title={collapsed ? n.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <n.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{n.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 px-5 py-5", collapsed && "justify-center px-0")}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-gold-foreground">
        <Compass className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-bold text-sidebar-accent-foreground">WorkPilot AI</div>
          <div className="text-[11px] text-sidebar-foreground/70">Productivity Assistant</div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const title = NAV.find((n) => n.to === path)?.label ?? "WorkPilot AI";

  useEffect(() => {
    setCollapsed(localStorage.getItem("wp-sidebar") === "1");
  }, []);
  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("wp-sidebar", c ? "0" : "1");
      return !c;
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar transition-[width] md:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} />
        <div className="mt-auto p-3">
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-sidebar">
            <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute right-3 top-5 text-sidebar-foreground">
              <X className="h-5 w-5" />
            </button>
            <Brand collapsed={false} />
            <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-8">
          <button aria-label="Open menu" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold">{title}</h1>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        <footer className="border-t bg-card px-4 py-3 md:px-8">
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            {DISCLAIMER}
          </p>
        </footer>
      </div>
    </div>
  );
}
