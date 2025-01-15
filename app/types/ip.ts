export interface IPData {
  ip: string
  ipInfo: {
    country: string
    region: string
    city: string
    isp: string
    org: string
    as: string
    lat: number
    lon: number
  }
  reputation?: {
    status: 'clean' | 'suspicious' | 'malicious'
    confidence_score?: number
    sources?: string[]
    last_reported?: string
    details?: string
    risk_factors?: string[]
    threat_categories?: string[]
    recommendations?: string[]
  }
} 