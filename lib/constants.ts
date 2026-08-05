export const APP_NAME = 'Wabmarket'

export const APP_DESCRIPTION = 'AI-Powered Domain Acquisition & Sales Platform'

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const

export const DOMAIN_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
  PENDING: 'pending',
} as const

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  NEGOTIATING: 'negotiating',
  CLOSED: 'closed',
} as const

export const FLIPSCORE = {
  MIN: 0,
  MAX: 100,
}

export const PAGINATION = {
  PAGE_SIZE: 20,
}

export const STORAGE_BUCKETS = {
  LOGOS: 'logos',
  FAVICONS: 'favicons',
  ATTACHMENTS: 'attachments',
}
