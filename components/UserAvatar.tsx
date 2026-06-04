"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface UserAvatarProps {
  name?: string | null
  image?: string | null
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ name, image, size = "md" }: UserAvatarProps) {
  const sizeClass = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-12 w-12 text-base" }[size]
  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={image || undefined} alt={name || "User"} />
      <AvatarFallback className="bg-[#1e3a5f] text-white font-semibold">
        {name ? getInitials(name) : "U"}
      </AvatarFallback>
    </Avatar>
  )
}
