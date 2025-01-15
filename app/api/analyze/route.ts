import { NextResponse } from 'next/server'
import axios from 'axios'
import { isValidIP } from '@/app/utils/ipValidation'

const IP_API_ENDPOINT = 'http://ip-api.com/json'
const CLAUDE_API_ENDPOINT = 'https://api.anthropic.com/v1/messages'
const RATE_LIMIT = 1000 // Maximum IPs per request

async function getIPInfo(ip: string) {
  try {
    const response = await axios.get(`${IP_API_ENDPOINT}/${ip}?fields=status,message,country,regionName,city,lat,lon,isp,org,as`)
    if (response.data.status === 'success') {
      return {
        country: response.data.country || 'N/A',
        region: response.data.regionName || 'N/A',
        city: response.data.city || 'N/A',
        isp: response.data.isp || 'N/A',
        org: response.data.org || 'N/A',
        as: response.data.as || 'N/A',
        lat: response.data.lat,
        lon: response.data.lon
      }
    }
    return null
  } catch (error) {
    console.error(`Error getting IP info for ${ip}:`, error)
    return null
  }
}

async function analyzeIPWithClaude(ip: string) {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      return null
    }

    const prompt = `Analyze the IP address ${ip} for potential security threats and reputation. Consider the following aspects:

1. Known malicious activities
2. Presence in threat intelligence databases
3. Historical security incidents
4. Network behavior patterns
5. Association with spam or abuse
6. Hosting provider reputation
7. Geographic risk factors
8. Recent security reports

Provide a comprehensive analysis in the following JSON format:
{
  "status": "clean|suspicious|malicious",
  "confidence_score": 0-100,
  "risk_factors": ["list of specific risk factors"],
  "recent_activities": ["list of recent suspicious activities"],
  "threat_categories": ["types of threats associated"],
  "first_seen": "date first seen in threat reports",
  "last_reported": "date of most recent report",
  "sources": ["list of intelligence sources"],
  "details": "brief summary of findings",
  "recommendations": ["list of recommended actions"]
}

Base your analysis on known threat intelligence sources and security databases. If information is not available, use null for those fields.`

    const response = await axios.post(
      CLAUDE_API_ENDPOINT,
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: prompt
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    )

    const analysisText = response.data.content[0].text
    const analysis = JSON.parse(analysisText)

    return {
      status: analysis.status,
      confidence_score: analysis.confidence_score,
      sources: analysis.sources,
      last_reported: analysis.last_reported,
      details: analysis.details,
      risk_factors: analysis.risk_factors,
      threat_categories: analysis.threat_categories,
      recommendations: analysis.recommendations
    }
  } catch (error) {
    console.error(`Error analyzing IP ${ip} with Claude:`, error)
    return null
  }
}

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

    // Process IPs individually
    const results = []
    for (const ip of validIPs) {
      try {
        // Get IP info
        const ipInfo = await getIPInfo(ip)
        
        // Get reputation info using Claude
        const reputation = await analyzeIPWithClaude(ip)

        if (ipInfo) {
          results.push({
            ip,
            ...ipInfo,
            reputation
          })
        } else {
          results.push({
            ip,
            country: 'N/A',
            region: 'N/A',
            city: 'N/A',
            isp: 'N/A',
            org: 'N/A',
            as: 'N/A',
            lat: undefined,
            lon: undefined,
            reputation
          })
        }

        // Add delay between requests to respect rate limit
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error processing IP ${ip}:`, error)
        results.push({
          ip,
          country: 'N/A',
          region: 'N/A',
          city: 'N/A',
          isp: 'N/A',
          org: 'N/A',
          as: 'N/A',
          lat: undefined,
          lon: undefined,
          reputation: null
        })
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

