"use client"

import dynamic from "next/dynamic"

// next-themes' useTheme returns different values server vs client (OS detection),
// causing React hydration error #418 on every page. Render client-only to avoid it.
const ToasterDynamic = dynamic(
  () => import("./sonner").then((m) => ({ default: m.Toaster })),
  { ssr: false }
)

export function ToasterClient() {
  return <ToasterDynamic />
}
