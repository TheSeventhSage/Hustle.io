import { cn } from '../utils/cn.js'

/**
 * Button
 * Variants:
 *   primary  — gold fill, dark text (main CTA)
 *   solid    — dark green fill, white text
 *   ghost    — white border, white text (on dark bg)
 *   outline  — light border, dark text
 *   text     — no bg/border, colored text
 */
export function Button({
  children,
  variant = 'primary',
  type = 'button',
  isPending = false,
  disabled = false,
  onClick,
  className,
  ...props
}) {
  const isDisabled = disabled || isPending

  const baseStyles = 'flex items-center justify-center gap-2 w-full h-[50px] rounded-full font-semibold font-body transition-all duration-150 tracking-tight'
  const disabledStyles = isDisabled ? 'cursor-not-allowed opacity-65' : 'cursor-pointer'

  const variantStyles = {
    primary: 'bg-primary-btn text-md text-mist hover:text-mist hover:bg-primary-sat dark:bg-secondary dark:hover:bg-transparent dark:hover:border-2 dark:hover:border-secondary dark:text-text-1 dark:font-weight dark:hover:text-secondary',
    solid: 'bg-primary-sat text-white hover:bg-primary-btn dark:text-text-1 dark:bg-secondary dark:hover:bg-transparent dark:hover:border-2 dark:hover:border-secondary dark:hover:text-secondary',
    ghost: 'bg-white/8 text-white border border-white/20 hover:bg-white/12 dark:text-text-1 dark:hover:bg-transparent dark:hover:border-secondary dark:hover:text-secondary',
    outline: 'bg-transparent text-text-1 border border-border hover:bg-secondary hover:text-primary-sat hover:border-none dark:text-text-1 dark:border-border dark:hover:bg-transparent dark:hover:border-2 dark:hover:border-secondary dark:hover:text-secondary',
    text: 'bg-transparent text-secondary h-auto w-auto text-sm font-medium p-0 hover:underline',
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(variantStyles[variant], baseStyles, disabledStyles, className)}
      {...props}
    >
      {isPending ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : children}
    </button>
  )
}
