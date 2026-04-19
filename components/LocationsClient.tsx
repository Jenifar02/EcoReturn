'use client'

import { useState } from 'react'
import { useLang } from '@/lib/providers'
import { MapPin, Search, CheckCircle, Clock, XCircle } from 'lucide-react'

const LOCATIONS = [
  { id: 1, name: 'Dhaka University',        area: 'TSC area',             city: 'Dhaka',     district: 'Dhaka',     status: 'ACTIVE'   },
  { id: 2, name: 'Dhanmondi',               area: 'Road 27',              city: 'Dhaka',     district: 'Dhaka',     status: 'ACTIVE'   },
  { id: 3, name: 'Mirpur DOHS',             area: 'Section 11',           city: 'Dhaka',     district: 'Dhaka',     status: 'ACTIVE'   },
  { id: 4, name: 'Uttara',                  area: 'Sector 7',             city: 'Dhaka',     district: 'Dhaka',     status: 'ACTIVE'   },
  { id: 5, name: 'BUET Campus',             area: 'Near cafeteria',       city: 'Dhaka',     district: 'Dhaka',     status: 'ACTIVE'   },
  { id: 6, name: 'Narayanganj Chashara',    area: 'Bus stand',            city: 'Narayanganj', district: 'Narayanganj', status: 'ACTIVE' },
  { id: 7, name: 'Chattogram GEC',          area: 'GEC circle',           city: 'Chattogram', district: 'Chattogram', status: 'PLANNED' },
  { id: 8, name: 'Sylhet Zindabazar',       area: 'Main road',            city: 'Sylhet',    district: 'Sylhet',    status: 'PLANNED'  },
  { id: 9, name: 'Rajshahi University',     area: 'Main gate area',       city: 'Rajshahi',  district: 'Rajshahi',  status: 'PLANNED'  },
  { id: 10, name: 'Khulna New Market',      area: 'Central area',         city: 'Khulna',    district: 'Khulna',    status: 'PLANNED'  },
]

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ACTIVE:   { label: 'Active',   icon: CheckCircle, color: '#16a34a', bg: 'rgba(22,163,74,0.08)'   },
  PLANNED:  { label: 'Planned',  icon: Clock,       color: '#d97706', bg: 'rgba(217,119,6,0.08)'   },
  INACTIVE: { label: 'Inactive', icon: XCircle,     color: '#9ca3af', bg: 'rgba(156,163,175,0.08)' },
}

export default function LocationsClient() {
  const { t } = useLang()
  const [query, setQuery] = useState('')

  const filtered = LOCATIONS.filter(l => {
    const q = query.toLowerCase()
    return (
      l.name.toLowerCase().includes(q) ||
      l.area.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.district.toLowerCase().includes(q)
    )
  })

  const active  = filtered.filter(l => l.status === 'ACTIVE').length
  const planned = filtered.filter(l => l.status === 'PLANNED').length

  return (
    <>
      {/* Page hero */}
      <div className="py-10 px-4" style={{
        background: 'radial-gradient(720px 380px at 10% 0%, rgba(102,187,106,0.18), transparent 60%), linear-gradient(180deg, rgba(242,242,242,0.9), rgba(255,255,255,1))',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="eyebrow mb-3">
            <MapPin className="w-4 h-4" />
            Find a machine near you
          </div>
          <h1 className="text-4xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>{t('locationsTitle')}</h1>
          <p className="opacity-75">{t('locationsSubtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Search + stats */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="panel">
              <h2 className="text-lg font-black mb-4">{t('search')}</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input
                  className="eco-input pl-9"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="panel">
                <div className="text-3xl font-black" style={{ color: '#16a34a' }}>{active}</div>
                <div className="text-sm opacity-60 mt-0.5 font-semibold">{t('active')} machines</div>
              </div>
              <div className="panel">
                <div className="text-3xl font-black" style={{ color: '#d97706' }}>{planned}</div>
                <div className="text-sm opacity-60 mt-0.5 font-semibold">{t('planned')} soon</div>
              </div>
            </div>

            <div className="panel">
              <div className="text-sm font-bold mb-2" style={{ color: 'var(--eco-primary)' }}>🇧🇩 Expanding Bangladesh</div>
              <p className="text-sm opacity-65">More machines are being deployed across Dhaka, Chattogram, Sylhet, Rajshahi, and Khulna.</p>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3 panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">{t('availableMachines')}</h2>
              <span className="text-sm opacity-50">{filtered.length} locations</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10 opacity-40">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-semibold">No locations found</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
                {filtered.map(loc => {
                  const cfg = statusConfig[loc.status]
                  const StatusIcon = cfg.icon
                  return (
                    <div key={loc.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(46,125,50,0.08)' }}>
                          <MapPin className="w-4 h-4" style={{ color: 'var(--eco-primary)' }} />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{loc.name}</div>
                          <div className="text-xs opacity-55 mt-0.5">{loc.area} · {loc.city}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
