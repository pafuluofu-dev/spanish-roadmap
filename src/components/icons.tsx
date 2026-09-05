interface IconProps {
  size?: number
}

/* Простые линейные иконки в currentColor — в духе DashDark X, без библиотек */

function iconProps(size: number) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  } as const
}

export function SunIcon({ size = 15 }: IconProps) {
  return (
    <svg {...iconProps(size)}>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1" />
    </svg>
  )
}

export function MoonIcon({ size = 15 }: IconProps) {
  return (
    <svg {...iconProps(size)}>
      <path d="M13.6 9A5.6 5.6 0 0 1 7 2.4 5.6 5.6 0 1 0 13.6 9Z" />
    </svg>
  )
}
