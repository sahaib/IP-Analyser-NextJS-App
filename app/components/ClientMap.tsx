"use client"

import { useState } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import type { ProjectionSpecification } from 'mapbox-gl'
import { MapPin } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'

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

interface ClientMapProps {
  data: IPData[]
}

export default function ClientMap({ data }: ClientMapProps) {
  const [popupInfo, setPopupInfo] = useState<IPData | null>(null)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const projection: ProjectionSpecification = {
    name: 'mercator'
  }

  // Debug log to check all IPs
  console.log('All IPs:', data.map(ip => ({ ip: ip.ip, lat: ip.lat, lon: ip.lon })))

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        Mapbox token not found. Please check your environment variables.
      </div>
    )
  }

  return (
    <Map
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: 0,
        latitude: 20,
        zoom: 1.5
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v10"
      projection={projection}
      renderWorldCopies={false}
    >
      {data.map((ip, index) => {
        // Debug log for each IP
        console.log(`Processing IP ${ip.ip}:`, { lat: ip.lat, lon: ip.lon })
        
        if (ip.lat && ip.lon) {
          return (
            <Marker
              key={index}
              longitude={ip.lon}
              latitude={ip.lat}
              onClick={e => {
                e.originalEvent.stopPropagation()
                setPopupInfo(ip)
              }}
            >
              <MapPin className="h-6 w-6 text-destructive cursor-pointer hover:text-destructive/80 transition-colors" />
            </Marker>
          )
        }
        return null
      })}

      {popupInfo && (
        <Popup
          longitude={popupInfo.lon!}
          latitude={popupInfo.lat!}
          offset={25}
          closeOnClick={false}
          onClose={() => setPopupInfo(null)}
          className="bg-background text-foreground border-border"
        >
          <div className="p-2">
            <strong>IP:</strong> {popupInfo.ip}<br />
            <strong>Location:</strong> {popupInfo.city}, {popupInfo.country}<br />
            <strong>ISP:</strong> {popupInfo.isp}
          </div>
        </Popup>
      )}
    </Map>
  )
} 