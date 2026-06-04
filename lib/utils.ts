import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays } from "date-fns"
import { id } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy", { locale: id })
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "dd/MM/yyyy")
}

export function daysUntilExpiry(expiryDate: Date | string): number {
  return differenceInDays(new Date(expiryDate), new Date())
}

export function getStatusFromExpiry(expiryDate: Date | string): string {
  const days = daysUntilExpiry(expiryDate)
  if (days < 0) return "EXPIRED"
  return "ACTIVE"
}

export function parseJsonArray(value: string): string[] {
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

