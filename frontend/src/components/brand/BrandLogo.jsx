const WORDMARK_TEXT_SIZE = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
}

const ICON_SIZE = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
}

function InterniteMark({ className = '' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#internite-mark-gradient)" />
      <path
        d="M8 15c2.4-2.6 5.1-2.6 7.5 0s5.1 2.6 7.5 0 5.1-2.6 7.5 0"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d="M8 22.5c2.4-2.6 5.1-2.6 7.5 0s5.1 2.6 7.5 0 5.1-2.6 7.5 0"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      <path
        d="M8 30c2.4-2.6 5.1-2.6 7.5 0s5.1 2.6 7.5 0 5.1-2.6 7.5 0"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <defs>
        <linearGradient id="internite-mark-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6a56ec" />
          <stop offset="100%" stopColor="#4a3dd6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function InterniteWordmark({ sizeClass, forceLight, className = '' }) {
  const primaryClass = forceLight ? 'text-white' : 'text-slate-900 dark:text-white'
  const aiClass = forceLight ? 'text-brand-300' : 'text-brand-500 dark:text-brand-300'
  return (
    <span className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
      <InterniteMark className="h-7 w-7 flex-shrink-0" />
      <span className={`font-extrabold tracking-tight leading-none truncate ${sizeClass}`}>
        <span className={primaryClass}>INTERN</span>
        <span className="text-brand-500">ITE</span>
        <span className={`ml-1 align-top text-[0.55em] font-bold ${aiClass}`}>AI</span>
      </span>
    </span>
  )
}

export default function BrandLogo({
  variant = 'wordmark',
  size = 'md',
  tone = 'auto',
  className = '',
  imageClassName = '',
}) {
  if (variant === 'icon') {
    return <InterniteMark className={`${ICON_SIZE[size] ?? ICON_SIZE.md} object-contain ${className}`} />
  }

  const sizeClass = WORDMARK_TEXT_SIZE[size] ?? WORDMARK_TEXT_SIZE.md
  const wrapClass = `min-w-0 ${imageClassName} ${className}`

  // tone="dark" is for logos placed on a surface that is always dark,
  // regardless of the app-wide light/dark toggle (e.g. hero panels).
  // Everything else follows the app's dark: variant automatically, since
  // every current placement (topbar, sidebar) flips background with it.
  return <InterniteWordmark sizeClass={sizeClass} forceLight={tone === 'dark'} className={wrapClass} />
}
