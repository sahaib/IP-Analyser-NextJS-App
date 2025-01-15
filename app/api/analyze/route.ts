import { NextResponse } from 'next/server'
import axios from 'axios'
import { isValidIP } from '@/app/utils/ipValidation'

const API_ENDPOINT = 'http://ip-api.com/json/'
const BATCH_SIZE = 100 // IP-API allows up to 100 IPs per batch request
const RATE_LIMIT = 1000 // Maximum IPs per request

export async function POST(req: Request) {
  try {
    const { ips } = await req.json()

    if (!Array.isArray(ips) || ips.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    if (ips.length > RATE_LIMIT) {
      return NextResponse.json(
        { error: `Too many IPs. Maximum allowed is ${RATE_LIMIT}.` },
        { status: 400 }
      )
    }

    const validIPs = ips.filter(isValidIP)

    if (validIPs.length === 0) {
      return NextResponse.json(
        { error: 'No valid IP addresses provided' },
        { status: 400 }
      )
    }

    // Process IPs in batches
    const results = []
    for (let i = 0; i < validIPs.length; i += BATCH_SIZE) {
      const batch = validIPs.slice(i, i + BATCH_SIZE)
      try {
        const response = await axios.post('http://ip-api.com/batch', batch.map(ip => ({
          query: ip,
          fields: 'status,message,country,regionName,city,lat,lon,isp,org,as'
        })))

        const batchResults = response.data.map((result: any, index: number) => {
          if (result.status === 'success') {
          return {
              ip: batch[index],
              country: result.country || 'N/A',
              region: result.regionName || 'N/A',
              city: result.city || 'N/A',
              isp: result.isp || 'N/A',
              org: result.org || 'N/A',
              as: result.as || 'N/A',
              lat: result.lat,
              lon: result.lon
            }
          } else {
          return {
              ip: batch[index],
            country: 'N/A',
            region: 'N/A',
            city: 'N/A',
            isp: 'N/A',
            org: 'N/A',
            as: 'N/A',
            lat: undefined,
            lon: undefined
          }
        }
      })
        
        results.push(...batchResults)
        
        // Add delay between batches to respect rate limit
        if (i + BATCH_SIZE < validIPs.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Error processing batch:`, error)
        const failedResults = batch.map(ip => ({
          ip,
          country: 'N/A',
          region: 'N/A',
          city: 'N/A',
          isp: 'N/A',
          org: 'N/A',
          as: 'N/A',
          lat: undefined,
          lon: undefined
        }))
        results.push(...failedResults)
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error processing IP addresses:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

