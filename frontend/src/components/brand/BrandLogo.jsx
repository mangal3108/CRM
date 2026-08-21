const LOGO_SRC = '/brand/internite-logo.png'
const LOGO_DARK_SRC = '/brand/internite-logo-dark.png'

const WORDMARK_HEIGHT = {
  sm: 'h-6',
  md: 'h-7',
  lg: 'h-9',
}

const ICON_SIZE = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
}

export default function BrandLogo({
  variant = 'wordmark',
  size = 'md',
  tone = 'auto',
  className = '',
  imageClassName = '',
}) {
  const heightClass = variant === 'icon' ? (ICON_SIZE[size] ?? ICON_SIZE.md) : (WORDMARK_HEIGHT[size] ?? WORDMARK_HEIGHT.md)
  const baseImageClass = `w-auto max-w-full object-contain object-left ${imageClassName}`

  // tone="dark" is for logos placed on a surface that is always dark,
  // regardless of the app-wide light/dark toggle (e.g. hero panels).
  // Everything else follows the app's dark: variant automatically, since
  // every current placement (topbar, sidebar) flips background with it.
  if (tone === 'dark') {
    return (
      <img
        src={LOGO_DARK_SRC}
        alt="Internite AI"
        className={`${heightClass} ${baseImageClass} ${className}`}
      />
    )
  }

  return (
    <div className={`inline-flex min-w-0 items-center ${className}`}>
      <img src={LOGO_SRC} alt="Internite AI" className={`${heightClass} ${baseImageClass} dark:hidden`} />
      <img src={LOGO_DARK_SRC} alt="Internite AI" className={`${heightClass} ${baseImageClass} hidden dark:block`} />
    </div>
  )
}
