// admin-user/src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings, Key, Shield } from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Roles & Permissions", href: "/roles", icon: Shield },
  { name: "API Keys", href: "/api-keys", icon: Key },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64 border-r min-h-screen bg-background">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            SoloFlow Admin
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.name}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn("w-full justify-start", pathname === item.href && "bg-secondary")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}