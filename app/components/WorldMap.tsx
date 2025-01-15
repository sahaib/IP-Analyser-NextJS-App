"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

const ClientMap = dynamic(() => import('./ClientMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      Loading map...
    </div>
  )
})

interface IPData {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  org: string
  as: string
  lat?: number
  lon?: number
}

export function WorldMap({ data }: { data: IPData[] }) {
  const hasValidCoordinates = data.some(ip => ip.lat && ip.lon)

  if (!hasValidCoordinates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IP Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No valid location data available for the provided IP addresses.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>IP Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '500px', width: '100%' }}>
          <ClientMap data={data} />
        </div>
      </CardContent>
    </Card>
  )
}

