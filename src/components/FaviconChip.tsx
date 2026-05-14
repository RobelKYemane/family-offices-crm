import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { urlHostname } from '@/lib/utils'

interface FaviconChipProps {
  url: string
  className?: string
}

export function FaviconChip({ url, className }: FaviconChipProps) {
  const [imgOk, setImgOk] = useState(true)

  let hostname = ''
  try {
    hostname = new URL(url).hostname
  } catch {
    hostname = url
  }

  const faviconSrc = `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className={
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground hover:bg-muted hover:border-foreground/20 transition-colors ' +
        (className ?? '')
      }
    >
      {imgOk ? (
        <img
          src={faviconSrc}
          alt=""
          width={12}
          height={12}
          loading="lazy"
          className="h-3 w-3 shrink-0"
          onError={() => setImgOk(false)}
        />
      ) : (
        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
      )}
      {urlHostname(url)}
    </a>
  )
}
