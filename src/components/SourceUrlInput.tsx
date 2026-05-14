import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { urlHostname } from '@/lib/utils'

interface SourceUrlInputProps {
  urls: string[]
  onChange: (urls: string[]) => void
  className?: string
}

export function SourceUrlInput({ urls, onChange, className }: SourceUrlInputProps) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (!trimmed || urls.includes(trimmed)) {
      setInput('')
      return
    }
    onChange([...urls, trimmed])
    setInput('')
  }

  function remove(url: string) {
    onChange(urls.filter((u) => u !== url))
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1.5">
        {urls.map((url) => (
          <span
            key={url}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs"
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="max-w-[160px] truncate text-foreground">{urlHostname(url)}</span>
            <button
              type="button"
              onClick={() => remove(url)}
              className="rounded-full text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Remove ${url}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder="https://..."
          className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <button
          type="button"
          onClick={add}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}
