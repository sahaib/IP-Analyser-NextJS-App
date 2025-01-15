import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IPData {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  org: string
  as: string
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

export function StatisticalSummary({ data }: { data: IPData[] }) {
  const totalIPs = data.length

  // Reputation statistics
  const reputationStats = data.reduce((acc, item) => {
    const status = item.reputation?.status || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate threat category distribution
  const threatCategories = data.reduce((acc, item) => {
    item.reputation?.threat_categories?.forEach(category => {
      acc[category] = (acc[category] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  // Get top threat categories
  const topThreats = Object.entries(threatCategories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  // Calculate average confidence score
  const avgConfidenceScore = data
    .filter(item => item.reputation?.confidence_score !== undefined)
    .reduce((acc, item) => acc + (item.reputation?.confidence_score || 0), 0) / 
    data.filter(item => item.reputation?.confidence_score !== undefined).length

  // Get common risk factors
  const riskFactors = data.reduce((acc, item) => {
    item.reputation?.risk_factors?.forEach(factor => {
      acc[factor] = (acc[factor] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topRiskFactors = Object.entries(riskFactors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalIPs}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reputation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Clean</span>
              <span className="text-sm font-medium">{reputationStats.clean || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-600">Suspicious</span>
              <span className="text-sm font-medium">{reputationStats.suspicious || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Malicious</span>
              <span className="text-sm font-medium">{reputationStats.malicious || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Threats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topThreats.map(([category, count], index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm truncate flex-1">{category}</span>
                <span className="text-sm font-medium ml-2">{count}</span>
              </div>
            ))}
            {topThreats.length === 0 && (
              <div className="text-sm text-muted-foreground">No threats detected</div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Common Risk Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topRiskFactors.map(([factor, count], index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm truncate flex-1">{factor}</span>
                <span className="text-sm font-medium ml-2">{count}</span>
              </div>
            ))}
            {topRiskFactors.length === 0 && (
              <div className="text-sm text-muted-foreground">No risk factors found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

