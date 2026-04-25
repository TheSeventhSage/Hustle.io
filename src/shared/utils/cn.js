import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names. Combines clsx (conditional classes)
 * with tailwind-merge (deduplicates conflicting Tailwind classes).
 *
 * @param {...import('clsx').ClassValue} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
