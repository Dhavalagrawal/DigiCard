"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, User, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { signOut } from "next-auth/react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return (
    <div className="w-64 border-r bg-muted/20 hidden md:block">
      <div className="h-full flex flex-col justify-between py-4">
        <div className="space-y-4">
          <div className="px-4 py-2">
            <h2 className="text-lg font-semibold tracking-tight">Navigation</h2>
          </div>
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                  pathname === item.href ? "bg-muted" : "transparent",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-2 mt-auto">
          <Button variant="outline" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

