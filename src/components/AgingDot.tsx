import { useLastInteractionDate } from '@/lib/store'
import { cn } from '@/lib/utils'

interface AgingDotProps {
  foId: string
  className?: string
}

/**
 * A small colored dot indicating how recently this FO was interacted with.
 * Green  = within 30 days
 * Amber  = 30–90 days
 * Red    = >90 days or no interactions logged
 */
export function AgingDot({ foId, className }: AgingDotProps) {
  const lastDate = useLastInteractionDate(foId)

  let color: string
  let title: string

  if (!lastDate) {
    color = 'bg-red-500 dark:bg-red-400'
    title = 'No interactions logged'
  } else {
    const daysSince =
      (new Date().getTime() - new Date(lastDate + 'T00:00:00').getTime()) /
      (1000 * 60 * 60 * 24)
    if (daysSince <= 30) {
      color = 'bg-green-500 dark:bg-green-400'
      title = `Last contacted ${Math.round(daysSince)} day${Math.round(daysSince) === 1 ? '' : 's'} ago`
    } else if (daysSince <= 90) {
      color = 'bg-amber-500 dark:bg-amber-400'
      title = `Last contacted ${Math.round(daysSince)} days ago`
    } else {
      color = 'bg-red-500 dark:bg-red-400'
      title = `No contact in ${Math.round(daysSince)} days`
    }
  }

  return (
    <span
      title={title}
      aria-label={title}
      className={cn('inline-block h-2 w-2 rounded-full shrink-0', color, className)}
    />
  )
}
