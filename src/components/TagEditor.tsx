import { useState, useRef, useId } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagEditorProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?: string
}

export function TagEditor({
  tags,
  onChange,
  suggestions = [],
  placeholder = 'Add tag...',
  className,
}: TagEditorProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const filtered = suggestions
    .filter(
      (s) =>
        s.toLowerCase().includes(input.toLowerCase()) &&
        !tags.includes(s)
    )
    .slice(0, 8)

  function addTag(value: string) {
    const trimmed = value.trim()
    if (!trimmed || tags.includes(trimmed)) {
      setInput('')
      return
    }
    onChange([...tags, trimmed])
    setInput('')
    setShowSuggestions(false)
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="flex flex-wrap gap-1.5 min-h-[2.5rem] w-full rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="rounded-full hover:text-foreground transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[80px]">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-autocomplete="list"
            aria-controls={listId}
          />
          {showSuggestions && filtered.length > 0 && (
            <ul
              id={listId}
              className="absolute left-0 top-full z-20 mt-1 w-48 min-w-full rounded-md border border-border bg-popover py-1 shadow-md"
            >
              {filtered.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      addTag(s)
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter to add. Backspace removes the last tag.
      </p>
    </div>
  )
}
