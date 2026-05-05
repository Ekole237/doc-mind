import { Button } from "@workspace/ui/components/button"
import { Activity, ArrowLeft, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, Users } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth.ts"
import { cn } from "@workspace/ui/lib/utils"
import EjaraLogo from "@/assets/icons/Logo.svg?react"
import EjaraTextLogo from "@/assets/icons/ejara.svg?react"

interface AdminLayoutProps {
  children: ReactNode
  currentPage?: "dashboard" | "documents" | "feedbacks" | "logs" | "guests"
}

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "documents", label: "Documents", icon: FileText, path: "/admin/documents" },
    { id: "feedbacks", label: "Retours", icon: MessageSquare, path: "/admin/feedbacks" },
    { id: "logs", label: "Logs", icon: Activity, path: "/admin/logs" },
    { id: "guests", label: "Invités", icon: Users, path: "/admin/guests" },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-54 bg-card shadow-md transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 rounded-lg border p-2">
            <div className="flex items-baseline gap-2">
              <h1 className="font-rebond text-lg">Doc Mind</h1>
              <span
                className="text-xs font-bold text-primary"
                style={{ fontFamily: "'Lucky Beauty', cursive" }}
              >
                by Ejara
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map(({ id, label, icon: Icon, path }) => (
              <div
                onClick={() => {
                  navigate(path)
                  setSidebarOpen(false)
                }}
                className={cn(
                  "flex items-center justify-start p-2 text-accent-foreground cursor-pointer",
                  currentPage === id
                    ? "rounded-xl border border-primary bg-primary/10 text-primary"
                    : ""
                )}
                key={id}
              >
                <Icon className="mr-2 h-5 w-5" />
                <span className="subtitle-sm font-medium">{label}</span>
              </div>
            ))}
          </nav>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => navigate("/chat")}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au chat
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-black/10">
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3 md:gap-0">
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center justify-center gap-2">
            <EjaraLogo width={51} height={51} fill="currentColor" />
            <div className="pt-2">
              <EjaraTextLogo fill="currentColor" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">

          <div className="p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-350 mx-auto space-y-6">
              {children}
            </div>
          </div>
        </main>

      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
