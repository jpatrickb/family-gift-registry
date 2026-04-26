export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="oklch(0.55 0.16 285)" />
      <path d="M9 14h14v9a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-9Z" stroke="white" strokeWidth="1.6" />
      <path d="M7 11h18v3H7z" stroke="white" strokeWidth="1.6" />
      <path d="M16 11v13" stroke="white" strokeWidth="1.6" />
      <path d="M16 11s-2-3-3.5-3a1.8 1.8 0 1 1 0-3.5C14 4.5 16 7.5 16 11Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 11s2-3 3.5-3a1.8 1.8 0 1 0 0-3.5C18 4.5 16 7.5 16 11Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function GiftTagMotif({ size = 220 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 280 220"
      fill="none"
      aria-hidden
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="oklch(0.86 0.04 285)" />
        </pattern>
      </defs>
      <ellipse cx="140" cy="180" rx="110" ry="14" fill="oklch(0.92 0.03 285)" opacity="0.45" />
      <g transform="translate(36 36) rotate(-8 80 80)">
        <path
          d="M0 30 L40 0 H140 a8 8 0 0 1 8 8 V152 a8 8 0 0 1 -8 8 H8 a8 8 0 0 1 -8 -8 Z"
          fill="oklch(0.96 0.04 80)"
          stroke="oklch(0.78 0.10 70)"
          strokeWidth="1.5"
        />
        <circle cx="38" cy="28" r="6" fill="oklch(0.99 0 0)" stroke="oklch(0.78 0.10 70)" strokeWidth="1.5" />
        <line x1="20" y1="60" x2="120" y2="60" stroke="oklch(0.86 0.06 70)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="78" x2="100" y2="78" stroke="oklch(0.86 0.06 70)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      </g>
      <g transform="translate(96 56) rotate(6 80 80)">
        <path
          d="M0 30 L40 0 H140 a8 8 0 0 1 8 8 V152 a8 8 0 0 1 -8 8 H8 a8 8 0 0 1 -8 -8 Z"
          fill="oklch(0.99 0 0)"
          stroke="oklch(0.55 0.16 285)"
          strokeWidth="1.5"
        />
        <circle cx="38" cy="28" r="6" fill="oklch(0.96 0.025 285)" stroke="oklch(0.55 0.16 285)" strokeWidth="1.5" />
        <path
          d="M74 92 c-12 -8 -22 -2 -22 8 c0 14 22 26 22 26 s22 -12 22 -26 c0 -10 -10 -16 -22 -8 Z"
          fill="oklch(0.96 0.025 285)"
          stroke="oklch(0.55 0.16 285)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
      <g stroke="oklch(0.65 0.14 60)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M250 60 v8 M246 64 h8" />
        <path d="M40 150 v6 M37 153 h6" />
        <path d="M260 150 v6 M257 153 h6" />
      </g>
    </svg>
  )
}

type IconName =
  | "home" | "gift" | "users" | "user" | "plus" | "search" | "bell"
  | "link" | "copy" | "check" | "checkCircle" | "sparkle" | "more"
  | "pencil" | "trash" | "arrowLeft" | "arrowRight" | "arrowUpRight"
  | "external" | "filter" | "grid" | "list" | "chevronDown" | "chevronRight"
  | "cake" | "calendar" | "tag" | "shoppingBag" | "heart" | "mail"
  | "settings" | "globe" | "star"

const ICON_PATHS: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 6 12 8" /><path d="M16.5 8a2.5 2.5 0 0 0 0-5C14 3 12 6 12 8" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  bell: <><path d="M6 8a6 6 0 1 1 12 0c0 6 3 7 3 7H3s3-1 3-7" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1.5-1.5" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  check: <><path d="M5 12.5l4.5 4.5L19 7" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></>,
  sparkle: <><path d="M12 3v3" /><path d="M12 18v3" /><path d="M3 12h3" /><path d="M18 12h3" /><path d="m5.6 5.6 2.1 2.1" /><path d="m16.3 16.3 2.1 2.1" /><path d="m5.6 18.4 2.1-2.1" /><path d="m16.3 7.7 2.1-2.1" /></>,
  more: <><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></>,
  pencil: <><path d="M17 3l4 4L8 20H4v-4Z" /><path d="M14 6l4 4" /></>,
  trash: <><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></>,
  arrowLeft: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  arrowUpRight: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
  external: <><path d="M15 3h6v6" /><path d="M21 3l-9 9" /><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></>,
  filter: <><path d="M3 5h18" /><path d="M7 12h10" /><path d="M10 19h4" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  list: <><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><circle cx="4" cy="6" r="0.8" /><circle cx="4" cy="12" r="0.8" /><circle cx="4" cy="18" r="0.8" /></>,
  chevronDown: <><path d="m6 9 6 6 6-6" /></>,
  chevronRight: <><path d="m9 6 6 6-6 6" /></>,
  cake: <><path d="M19 20H5v-7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7Z" /><path d="M5 16h14" /><path d="M9 10V7" /><path d="M12 10V6" /><path d="M15 10V7" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 11h18" /></>,
  tag: <><path d="M20.5 12 12 3.5H4v8L12.5 20l8-8Z" /><circle cx="8" cy="8" r="1.5" /></>,
  shoppingBag: <><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" /><path d="M9 11V7a3 3 0 0 1 6 0v4" /></>,
  heart: <><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></>,
  star: <><path d="m12 3 2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9L12 3Z" /></>,
}

export function LumenIcon({
  name,
  size = 16,
  strokeWidth = 1.5,
  className,
  style,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
}) {
  const paths = ICON_PATHS[name]
  if (!paths) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {paths}
    </svg>
  )
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_TONES = ["ds-avatar-t-1", "ds-avatar-t-2", "ds-avatar-t-3", "ds-avatar-t-4", "ds-avatar-t-5", "ds-avatar-t-6"] as const

export function avatarTone(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length]
}
