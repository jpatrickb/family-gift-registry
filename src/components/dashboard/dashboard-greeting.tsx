"use client"

type DashboardGreetingProps = {
  firstName: string
}

function greetingByHour(hour: number): string {
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function DashboardGreeting({ firstName }: DashboardGreetingProps) {
  const hour = new Date().getHours()

  return (
    // suppressHydrationWarning: server uses UTC, client uses local timezone — intentional mismatch
    <h1 className="t-display" style={{ margin: 0 }} suppressHydrationWarning>
      {greetingByHour(hour)},{" "}
      <em style={{ fontStyle: "italic", color: "oklch(0.40 0.16 285)" }}>{firstName}</em>.
    </h1>
  )
}
