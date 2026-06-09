import * as React from 'react'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

// ─── Primitives ───────────────────────────────────────────────────────────────

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-cover size-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  )
}

// ─── Compound component ───────────────────────────────────────────────────────

interface AvatarComponentProps {
  src?: string
  alt?: string
  fallback: string
  className?: string
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({
  src,
  alt,
  fallback,
  className,
}) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt={alt} />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
)

export default AvatarComponent
export { Avatar, AvatarImage, AvatarFallback }
