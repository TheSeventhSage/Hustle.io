import { cn } from '../utils/cn.js'

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  isPending = false,
  disabled = false,
  onClick,
  className,
  style,
  ...props
}) {
  const isDisabled = disabled || isPending

  const baseStyles = 'flex items-center justify-center gap-2 w-full h-[50px] rounded-full font-semibold font-body transition-all duration-150 tracking-tight'
  const disabledStyles = isDisabled ? 'cursor-not-allowed opacity-65' : 'cursor-pointer'

  const variantStyles = {
    primary: 'bg-primary text-white border border-primary hover:bg-transparent hover:text-text-1 hover:border-primary focus-visible:bg-primary-btn focus-visible:text-white focus-visible:border-primary-btn active:bg-primary-btn active:text-white active:border-primary-btn dark:hover:text-text-1',
    solid: 'bg-primary-btn text-white hover:bg-primary-sat dark:text-text-1',
    ghost: 'bg-surface text-text-1 border border-border hover:bg-mist',
    outline: 'bg-transparent text-text-1 border border-border hover:bg-mist hover:border-border-muted',
    pill: 'bg-mist text-text-2 border border-border hover:bg-secondary-pale hover:text-btn-dark hover:border-secondary',
    text: 'bg-transparent text-secondary h-auto w-auto text-sm font-medium p-0 hover:underline',
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(variantStyles[variant], baseStyles, disabledStyles, className)}
      style={style}
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
