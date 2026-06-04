"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Session } from "next-auth"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/UserAvatar"
import { LogOut, User, LayoutDashboard, Upload, FileText, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  session: Session
}

const navLinks = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/documents", label: "Dokumen", icon: FileText },
]

export function Navbar({ session }: NavbarProps) {
  const pathname = usePathname()
  const user = session.user
  const firstName = user?.name?.split(" ")[0] || "User"

  return (
    <nav className="sticky top-0 z-50 bg-[#1e3a5f] border-b border-[#2d4f7c] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-xs">UNU</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">SIMKERA</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                  pathname === link.href
                    ? "bg-white/20 text-white"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2.5 h-auto py-1.5 px-2 hover:bg-white/10 text-white cursor-pointer rounded-md transition-colors">
                <UserAvatar name={user?.name} image={user?.image} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-tight">{firstName}</p>
                  <p className="text-xs text-blue-300 leading-tight">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{(user as any)?.role || "USER"}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profil Saya
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
