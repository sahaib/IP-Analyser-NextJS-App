import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IPData {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  org: string
  as: string
}

export function StatisticalSummary({ data }: { data: IPData[] }) {
  const totalIPs = data.length
  const uniqueCountries = new Set(data.map(item => item.country)).size
  const uniqueISPs = new Set(data.map(item => item.isp)).size
  const uniqueOrganizations = new Set(data.map(item => item.org)).size

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
          <CardTitle className="text-sm font-medium">Unique Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueCountries}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique ISPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueISPs}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueOrganizations}</div>
        </CardContent>
      </Card>
    </div>
  )
}

