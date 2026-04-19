'use client'
import { Shield, CheckCircle, ExternalLink } from 'lucide-react'
import { useLang } from '@/lib/providers'

interface Props {
  hash?: string | null
  size?: 'sm' | 'md'
}

export default function BlockchainBadge({ hash, size = 'sm' }: Props) {
  const { t } = useLang()

  if (!hash) return null

  const short = hash.slice(0, 10) + '...' + hash.slice(-6)
  const explorerUrl = `https://mumbai.polygonscan.com/search?q=${hash}`

  return (
    <div className="blockchain-badge" title={hash}>
      <CheckCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{t('blockchainVerified')}</span>
      <span className="opacity-60 font-mono">{short}</span>
      {hash.startsWith('0x') && hash.length > 40 && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="opacity-60 hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}
