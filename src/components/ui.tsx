import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ----------------------------- Button ----------------------------- */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'subtle'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:brightness-[1.07] active:brightness-95 shadow-sm',
  success: 'bg-success-solid text-white hover:brightness-[1.07] active:brightness-95 shadow-sm',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-2 active:bg-surface-2',
  subtle: 'bg-surface-2 text-muted hover:text-ink hover:bg-line/60',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
}
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant; size?: ButtonSize; block?: boolean
}>(({ className, variant = 'primary', size = 'md', block, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'focus-ring inline-flex select-none items-center justify-center font-semibold transition-all duration-150',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:saturate-50',
      'active:scale-[0.98]',
      buttonVariants[variant], buttonSizes[size], block && 'w-full', className,
    )}
    {...props}
  />
))
Button.displayName = 'Button'

export function IconButton({ className, label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      className={cn(
        'focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted',
        'transition-colors hover:bg-surface-2 hover:text-ink active:scale-95', className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/* ----------------------------- Card ----------------------------- */
export const Card = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { interactive?: boolean }>(
  ({ className, interactive, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        'rounded-2xl border border-line bg-surface shadow-card',
        interactive && 'transition-shadow duration-200 hover:shadow-lift',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

/* ----------------------------- Badges ----------------------------- */
export function Badge({ className, children, dot }: { className?: string; children: ReactNode; dot?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />}
      {children}
    </span>
  )
}

import type { RequestStatus, RequestType } from '@/types'
import { STATUS_LABEL, TYPE_LABEL } from '@/lib/utils'

const statusStyle: Record<RequestStatus, string> = {
  todo: 'bg-warning-soft text-warning-fg',
  processing: 'bg-info-soft text-info-fg',
  done: 'bg-success-soft text-success-fg',
}
const statusDot: Record<RequestStatus, string> = {
  todo: 'rgb(var(--warning))', processing: 'rgb(var(--info))', done: 'rgb(var(--success))',
}
export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge className={statusStyle[status]} dot={statusDot[status]}>{STATUS_LABEL[status]}</Badge>
}

const typeStyle: Record<RequestType, string> = {
  transfer: 'bg-transfer-soft text-transfer-fg',
  external: 'bg-external-soft text-external-fg',
}
export function TypeBadge({ type, icon }: { type: RequestType; icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold', typeStyle[type])}>
      {icon}{TYPE_LABEL[type]}
    </span>
  )
}

/* ----------------------------- Form controls ----------------------------- */
export function Field({ label, required, error, hint, htmlFor, children }: {
  label: string; required?: boolean; error?: string; hint?: string; htmlFor?: string; children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-accent" aria-hidden>*</span>}
      </label>
      {children}
      {error
        ? <p className="flex items-center gap-1 text-xs font-medium text-accent">{error}</p>
        : hint ? <p className="text-xs text-subtle">{hint}</p> : null}
    </div>
  )
}

const fieldBase =
  'focus-ring w-full rounded-xl border bg-surface px-3.5 text-[15px] text-ink placeholder:text-subtle transition-colors'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, 'h-11', invalid ? 'border-accent ring-1 ring-accent/30' : 'border-line hover:border-subtle/60', className)}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, 'min-h-[88px] resize-y py-2.5', invalid ? 'border-accent ring-1 ring-accent/30' : 'border-line hover:border-subtle/60', className)}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  ({ className, invalid, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          fieldBase, 'h-11 appearance-none pr-10',
          invalid ? 'border-accent ring-1 ring-accent/30' : 'border-line hover:border-subtle/60',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
    </div>
  ),
)
Select.displayName = 'Select'

/* ----------------------------- Misc ----------------------------- */
export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-accent',
        className,
      )}
    >
      {name.trim().charAt(0)}
    </span>
  )
}

export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode; title: string; description?: string; action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-subtle">{icon}</div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
